
import stat
import tarfile
import zipfile

from dataclasses import dataclass
from io import BytesIO
from pathlib import Path, PurePosixPath
from typing import BinaryIO, Iterable, Protocol

from django.core.files.base import ContentFile
from django.core.files.storage import default_storage
from django.core.files.uploadedfile import UploadedFile
from django.db import transaction
from django.utils.text import slugify
from PIL import Image as PillowImage, UnidentifiedImageError

from .models import Dataset, Image


SUPPORTED_IMAGE_EXTENSIONS = {
    ".avif",
    ".bmp",
    ".gif",
    ".jpeg",
    ".jpg",
    ".png",
    ".tif",
    ".tiff",
    ".webp",
}


class ReadableBinaryStream(Protocol):
    def read(self, size: int = -1, /) -> bytes: ...


class DatasetUploadError(ValueError):
    pass


@dataclass(frozen=True)
class UploadResult:
    dataset: Dataset
    image_count: int
    archival_path: str | None
    total_files: int
    skipped_files: list[dict[str, str]]


def normalize_dataset_name(name: str) -> str:
    normalized = slugify(name, allow_unicode=False)[:100]
    if not normalized:
        raise DatasetUploadError(
            "Dataset name must contain at least one letter or number."
        )
    return normalized


def delete_stored_file(path: str, storage=default_storage) -> None:
    storage.delete(path)

    try:
        storage_root = Path(storage.path("")).resolve()
        file_path = Path(storage.path(path)).resolve()
    except (AttributeError, NotImplementedError, OSError):
        return

    if file_path == storage_root or not file_path.is_relative_to(storage_root):
        return

    parent = file_path.parent
    while parent != storage_root:
        try:
            parent.rmdir()
        except OSError:
            break
        parent = parent.parent


def delete_dataset_files(dataset: Dataset, storage=default_storage) -> None:
    paths = set(dataset.images.values_list("path", flat=True))
    if dataset.archival_path:
        paths.add(dataset.archival_path)

    for path in paths:
        delete_stored_file(path, storage)


def is_image_file(uploaded_file: UploadedFile) -> bool:
    return Path(uploaded_file.name).suffix.lower() in SUPPORTED_IMAGE_EXTENSIONS


def is_archive_file(uploaded_file: UploadedFile) -> bool:
    name = Path(uploaded_file.name).name.lower()
    return name.endswith((".zip", ".tar", ".tar.gz"))


def is_zip(uploaded_file: UploadedFile) -> bool:
    return Path(uploaded_file.name).name.lower().endswith(".zip")


def safe_relative_path(name: str) -> PurePosixPath:
    if not name or "\x00" in name:
        raise DatasetUploadError("Upload contains an invalid file path.")

    path = PurePosixPath(name.replace("\\", "/"))

    if path.is_absolute() or ".." in path.parts or not path.parts:
        raise DatasetUploadError("Upload contains an unsafe file path.")

    # Avoid Windows drive paths such as C:/image.jpg.
    if path.parts and ":" in path.parts[0]:
        raise DatasetUploadError("Upload contains an unsafe file path.")

    return path


def _is_image_path(path: PurePosixPath) -> bool:
    return path.suffix.lower() in SUPPORTED_IMAGE_EXTENSIONS


def validate_image(stream: ReadableBinaryStream) -> bytes:
    """Return independent image bytes or raise a validation error."""
    try:
        data = stream.read()
        with BytesIO(data) as image_stream:
            with PillowImage.open(image_stream) as image:
                image.verify()
        return data
    except (
        OSError,
        EOFError,
        SyntaxError,
        ValueError,
        UnidentifiedImageError,
        PillowImage.DecompressionBombError,
    ) as exc:
        raise DatasetUploadError("Invalid or corrupted image.") from exc


def _validate_zip_members(archive: zipfile.ZipFile) -> None:
    seen_paths: set[str] = set()
    image_count = 0

    for member in archive.infolist():
        relative_path = safe_relative_path(member.filename)

        if member.is_dir():
            continue

        mode = member.external_attr >> 16
        if stat.S_ISLNK(mode):
            raise DatasetUploadError(
                "ZIP archives cannot contain symbolic links."
            )

        normalized_path = relative_path.as_posix()
        if normalized_path in seen_paths:
            raise DatasetUploadError(
                "ZIP archives cannot contain duplicate paths."
            )
        seen_paths.add(normalized_path)

        if _is_image_path(relative_path):
            image_count += 1

    if image_count == 0:
        raise DatasetUploadError(
            "The archive does not contain any supported images."
        )


def _validate_tar_members(archive: tarfile.TarFile) -> None:
    seen_paths: set[str] = set()
    image_count = 0

    for member in archive.getmembers():
        relative_path = safe_relative_path(member.name)

        if member.isdir():
            continue

        if not member.isfile():
            raise DatasetUploadError(
                "TAR archives cannot contain links or special files."
            )

        normalized_path = relative_path.as_posix()
        if normalized_path in seen_paths:
            raise DatasetUploadError(
                "TAR archives cannot contain duplicate paths."
            )
        seen_paths.add(normalized_path)

        if _is_image_path(relative_path):
            image_count += 1

    if image_count == 0:
        raise DatasetUploadError(
            "The archive does not contain any supported images."
        )


def _validate_archive_data(archive_data: bytes, filename: str) -> None:
    """Validate archive structure without closing the original upload."""
    try:
        with BytesIO(archive_data) as stream:
            if filename.lower().endswith(".zip"):
                with zipfile.ZipFile(stream) as archive:
                    _validate_zip_members(archive)
            else:
                with tarfile.open(fileobj=stream, mode="r:*") as archive:
                    _validate_tar_members(archive)
    except DatasetUploadError:
        raise
    except (
        OSError,
        EOFError,
        RuntimeError,
        zipfile.BadZipFile,
        tarfile.TarError,
    ) as exc:
        raise DatasetUploadError(
            "The uploaded archive is invalid or unreadable."
        ) from exc


class DatasetUploadService:
    def __init__(self, storage=default_storage):
        self.storage = storage

    def upload_image(
        self,
        dataset: Dataset,
        uploaded_file: UploadedFile,
        is_reference_image: bool = False,
    ) -> Image:
        if not is_image_file(uploaded_file):
            raise DatasetUploadError("Upload must be a supported image file.")

        relative_path = safe_relative_path(uploaded_file.name)
        try:
            with uploaded_file.open("rb") as stream:
                image_data = validate_image(stream)
        except DatasetUploadError:
            raise
        except (OSError, ValueError) as exc:
            raise DatasetUploadError("Could not read the uploaded image.") from exc

        dataset_name = normalize_dataset_name(dataset.name)
        saved_paths = []
        try:
            stored_path = self._save_file(
                f"{dataset_name}/data/{relative_path.as_posix()}",
                image_data,
            )
            saved_paths.append(stored_path)
            with transaction.atomic():
                image = Image.objects.create(
                    dataset=dataset,
                    path=stored_path,
                    is_reference_image=is_reference_image,
                )
        except Exception:
            self._cleanup_saved_files(saved_paths)
            raise

        return image

    def upload(
        self,
        name: str,
        description: str,
        files: Iterable[UploadedFile],
    ) -> UploadResult:
        uploaded_files = list(files)
        normalized_name = normalize_dataset_name(name)

        if not uploaded_files:
            raise DatasetUploadError("Select at least one file to upload.")

        if Dataset.objects.filter(name=normalized_name).exists():
            raise DatasetUploadError(
                "A dataset with this name already exists."
            )

        archive_files = [
            uploaded_file
            for uploaded_file in uploaded_files
            if is_archive_file(uploaded_file)
        ]

        if archive_files:
            if len(uploaded_files) != 1 or len(archive_files) != 1:
                raise DatasetUploadError(
                    "An archive upload must contain exactly one archive file."
                )

            return self._upload_archive(
                normalized_name,
                description,
                archive_files[0],
            )

        if any(not is_image_file(file) for file in uploaded_files):
            raise DatasetUploadError(
                "A folder upload must contain image files only."
            )

        seen_paths: set[str] = set()
        for uploaded_file in uploaded_files:
            relative_path = safe_relative_path(uploaded_file.name)
            normalized_path = relative_path.as_posix()

            if normalized_path in seen_paths:
                raise DatasetUploadError(
                    "Folder uploads cannot contain duplicate paths."
                )
            seen_paths.add(normalized_path)

        saved_paths: list[str] = []
        skipped_files: list[dict[str, str]] = []
        image_records = []
        dataset = None

        try:
            with transaction.atomic():
                dataset = Dataset.objects.create(
                    name=normalized_name,
                    description=description,
                    archival_path=None,
                )

                for uploaded_file in uploaded_files:
                    relative_path = safe_relative_path(uploaded_file.name)

                    try:
                        with uploaded_file.open("rb") as stream:
                            image_data = validate_image(stream)
                    except DatasetUploadError as exc:
                        skipped_files.append({
                            "name": relative_path.as_posix(),
                            "reason": str(exc),
                        })
                        continue

                    stored_path = self._save_file(
                        f"{normalized_name}/data/{relative_path.as_posix()}",
                        image_data,
                    )
                    saved_paths.append(stored_path)
                    image_records.append(
                        Image(dataset=dataset, path=stored_path)
                    )

                if not image_records:
                    raise DatasetUploadError(
                        "No valid images were found. "
                        f"{len(skipped_files)} file(s) were skipped."
                    )

                Image.objects.bulk_create(image_records)
                dataset.refresh_annotation_metadata()

        except Exception:
            self._cleanup_saved_files(saved_paths)
            raise

        return UploadResult(
            dataset=dataset,
            image_count=len(image_records),
            archival_path=None,
            total_files=len(uploaded_files),
            skipped_files=skipped_files,
        )


    def _upload_archive(
        self,
        normalized_name: str,
        description: str,
        uploaded_file: UploadedFile,
    ) -> UploadResult:
        try:
            # Read the original upload exactly once.
            archive_data = uploaded_file.read()
        except (OSError, ValueError) as exc:
            raise DatasetUploadError(
                "Could not read the uploaded archive. Please upload it again."
            ) from exc

        if not archive_data:
            raise DatasetUploadError("The uploaded archive is empty.")

        archive_name = Path(uploaded_file.name).name

        # Validate independent bytes, not the UploadedFile stream.
        _validate_archive_data(archive_data, archive_name)

        archive_path = self._save_file(
            f"{normalized_name}/archival/{archive_name}",
            archive_data,
        )

        saved_paths = [archive_path]
        skipped_files: list[dict[str, str]] = []
        image_records = []
        dataset = None

        try:
            with transaction.atomic():
                dataset = Dataset.objects.create(
                    name=normalized_name,
                    description=description,
                    archival_path=archive_path,
                )

                with BytesIO(archive_data) as archive_stream:
                    if archive_name.lower().endswith(".zip"):
                        self._import_zip_images(
                            archive_stream,
                            normalized_name,
                            saved_paths,
                            image_records,
                            skipped_files,
                            dataset,
                        )
                    else:
                        self._import_tar_images(
                            archive_stream,
                            normalized_name,
                            saved_paths,
                            image_records,
                            skipped_files,
                            dataset,
                        )

                if not image_records:
                    raise DatasetUploadError(
                        "No valid images were found in the archive. "
                        f"{len(skipped_files)} file(s) were skipped."
                    )

                Image.objects.bulk_create(image_records)
                dataset.refresh_annotation_metadata()

        except Exception:
            self._cleanup_saved_files(saved_paths)
            raise

        return UploadResult(
            dataset=dataset,
            image_count=len(image_records),
            archival_path=archive_path,
            total_files=len(image_records) + len(skipped_files),
            skipped_files=skipped_files,
        )

    
    def _import_zip_images(
        self,
        archive_stream: BinaryIO,
        normalized_name: str,
        saved_paths: list[str],
        image_records: list[Image],
        skipped_files: list[dict[str, str]],
        dataset: Dataset,
    ) -> None:
        with zipfile.ZipFile(archive_stream) as archive:
            for member in archive.infolist():
                relative_path = safe_relative_path(member.filename)

                if member.is_dir() or not _is_image_path(relative_path):
                    continue

                try:
                    with archive.open(member) as stream:
                        image_data = validate_image(stream)
                except (
                    DatasetUploadError,
                    OSError,
                    EOFError,
                    RuntimeError,
                    zipfile.BadZipFile,
                ) as exc:
                    skipped_files.append({
                        "name": relative_path.as_posix(),
                        "reason": (
                            str(exc)
                            if isinstance(exc, DatasetUploadError)
                            else "Could not read or decode image data."
                        ),
                    })
                    continue

                stored_path = self._save_file(
                    f"{normalized_name}/data/{relative_path.as_posix()}",
                    image_data,
                )
                saved_paths.append(stored_path)
                image_records.append(
                    Image(dataset=dataset, path=stored_path)
                )

    def _import_tar_images(
        self,
        archive_stream: BinaryIO,
        normalized_name: str,
        saved_paths: list[str],
        image_records: list[Image],
        skipped_files: list[dict[str, str]],
        dataset: Dataset,
    ) -> None:
        with tarfile.open(fileobj=archive_stream, mode="r:*") as archive:
            for member in archive.getmembers():
                relative_path = safe_relative_path(member.name)

                if member.isdir() or not _is_image_path(relative_path):
                    continue

                extracted = archive.extractfile(member)
                if extracted is None:
                    skipped_files.append({
                        "name": relative_path.as_posix(),
                        "reason": "Could not read image data from archive.",
                    })
                    continue

                try:
                    with extracted:
                        image_data = validate_image(extracted)
                except (
                    DatasetUploadError,
                    OSError,
                    EOFError,
                    RuntimeError,
                    tarfile.TarError,
                ) as exc:
                    skipped_files.append({
                        "name": relative_path.as_posix(),
                        "reason": (
                            str(exc)
                            if isinstance(exc, DatasetUploadError)
                            else "Could not read or decode image data."
                        ),
                    })
                    continue

                stored_path = self._save_file(
                    f"{normalized_name}/data/{relative_path.as_posix()}",
                    image_data,
                )
                saved_paths.append(stored_path)
                image_records.append(
                    Image(dataset=dataset, path=stored_path)
                )

    def _save_file(self, destination: str, data: bytes) -> str:
        return self.storage.save(destination, ContentFile(data))

    def _cleanup_saved_files(self, saved_paths: list[str]) -> None:
        for path in reversed(saved_paths):
            try:
                self.storage.delete(path)
            except OSError:
                pass