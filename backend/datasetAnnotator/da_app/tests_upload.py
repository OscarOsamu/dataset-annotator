import io
import tarfile
import zipfile
from pathlib import Path

from django.conf import settings
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase, override_settings
from django.urls import reverse
from PIL import Image
from rest_framework.test import APIClient

from .models import Dataset, Image as DatasetImage
from .upload_service import DatasetUploadService


@override_settings(MEDIA_ROOT="/tmp/dataset-annotator-upload-tests")
class DatasetUploadServiceTests(TestCase):
    def setUp(self):
        self.storage_root = Path(settings.MEDIA_ROOT)
        self.storage_root.mkdir(parents=True, exist_ok=True)

    def tearDown(self):
        for path in self.storage_root.rglob("*"):
            if path.is_file():
                path.unlink()
        for path in sorted(self.storage_root.rglob("*"), reverse=True):
            if path.is_dir():
                path.rmdir()

    def make_image(self, name="image.png"):
        stream = io.BytesIO()
        Image.new("RGB", (4, 3), "red").save(stream, format="PNG")
        stream.seek(0)
        return SimpleUploadedFile(name, stream.read(), content_type="image/png")

    def test_folder_upload_stores_images_under_dataset_data(self):
        result = DatasetUploadService().upload(
            name="Squirrels & Nuts",
            description="A collection of squirrels",
            files=[self.make_image("nested/one.png"), self.make_image("two.jpg")],
        )

        self.assertEqual(result.dataset.name, "squirrels-nuts")
        self.assertEqual(result.image_count, 2)
        self.assertEqual(result.dataset.images.count(), 2)
        self.assertTrue(result.dataset.images.all()[0].path.startswith("squirrels-nuts/data/"))
        self.assertTrue((self.storage_root / result.dataset.images.all()[0].path).is_file())

    def test_zip_upload_preserves_archive_and_unpacks_images(self):
        archive = io.BytesIO()
        with zipfile.ZipFile(archive, "w") as bundle:
            bundle.writestr("images/first.png", self.make_image().read())
            bundle.writestr("notes/readme.txt", b"not an image")
        upload = SimpleUploadedFile("dataset.zip", archive.getvalue(), "application/zip")

        result = DatasetUploadService().upload(
            name="Birds",
            description="",
            files=[upload],
        )

        self.assertEqual(result.image_count, 1)
        self.assertEqual(result.dataset.images.count(), 1)
        self.assertTrue(result.archival_path.startswith("birds/archival/"))
        self.assertTrue(result.dataset.images.get().path.startswith("birds/data/"))

    def test_tar_gz_upload_is_supported(self):
        archive = io.BytesIO()
        with tarfile.open(fileobj=archive, mode="w:gz") as bundle:
            image_data = self.make_image().read()
            info = tarfile.TarInfo("photos/photo.jpg")
            info.size = len(image_data)
            bundle.addfile(info, io.BytesIO(image_data))
        upload = SimpleUploadedFile("dataset.tar.gz", archive.getvalue(), "application/gzip")

        result = DatasetUploadService().upload("Fishes", "", [upload])

        self.assertEqual(result.image_count, 1)
        self.assertEqual(result.dataset.images.get().path, "fishes/data/photos/photo.jpg")

    def test_invalid_archive_does_not_create_dataset_or_files(self):
        upload = SimpleUploadedFile("broken.zip", b"not a zip", "application/zip")

        with self.assertRaisesRegex(ValueError, "invalid"):
            DatasetUploadService().upload("Broken", "", [upload])

        self.assertFalse(Dataset.objects.exists())
        self.assertEqual(list(self.storage_root.rglob("*")), [])


@override_settings(MEDIA_ROOT="/tmp/dataset-annotator-upload-api-tests")
class DatasetUploadApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.storage_root = Path(settings.MEDIA_ROOT)
        self.storage_root.mkdir(parents=True, exist_ok=True)

    def tearDown(self):
        for path in self.storage_root.rglob("*"):
            if path.is_file():
                path.unlink()
        for path in sorted(self.storage_root.rglob("*"), reverse=True):
            if path.is_dir():
                path.rmdir()

    def test_upload_endpoint_creates_dataset(self):
        image = io.BytesIO()
        Image.new("RGB", (2, 2), "blue").save(image, format="PNG")
        data = {
            "name": "Catalog",
            "description": "A test catalog",
            "files": [SimpleUploadedFile("cat.png", image.getvalue(), "image/png")],
        }

        response = self.client.post(reverse("dataset-upload"), data)

        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data["name"], "catalog")
        self.assertEqual(response.data["image_count"], 1)
        self.assertEqual(DatasetImage.objects.count(), 1)

    def test_upload_endpoint_rejects_non_image_folder(self):
        data = {
            "name": "Invalid",
            "files": [SimpleUploadedFile("notes.txt", b"text", "text/plain")],
        }

        response = self.client.post(reverse("dataset-upload"), data)

        self.assertEqual(response.status_code, 400)
        self.assertIn("image files only", response.data["files"][0])
        self.assertFalse(Dataset.objects.exists())
