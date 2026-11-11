import os
import zipfile
from pathlib import Path, PurePosixPath

from django.core.files.storage import default_storage
from datasetAnnotator.settings import MEDIA_ROOT

from .create_dataset_read_me import DatasetReadMeGenerator
from .make_csv_service import CSVGenerationService
from .models import Dataset


class CreateArchivalWithData:
    """
    Class to create an archive with the data of a dataset, including the CSV of results and a generated README for the dataset.
    
    Attributes:
        dataset (Dataset): The dataset for which the archive is being created.

    Call services:
        - DatasetReadMeGenerator: Service to generate a README file for the dataset.
        - MakeCSVService: Service to generate a CSV file for the annotated dataset.
    """

    def __init__(self, dataset: Dataset):
        self.dataset = dataset
        self.read_me_generator = DatasetReadMeGenerator(dataset)
        self.csv_service = CSVGenerationService(dataset.pk)

    def create_archive(self):
        """
        Create an archive containing the data of the dataset, including the CSV of results and a generated README.

        Returns:
            str: The path to the created archive.

        Raises:
            Exception: If an error occurs during the archive creation process.
        """
        try:
            # Generate the CSV file for the dataset
            csv_path = self.csv_service.generate_csv()
            dataset_root = PurePosixPath(self.dataset.name)
            read_me_content = self.read_me_generator.generate_read_me(
                csv_file_path=f"{dataset_root}/{Path(csv_path).name}",
                reference_images_path=f"{dataset_root}/reference_images/",
                images_path=f"{dataset_root}/images/",
            )

            # Keep all generated data together under the dataset directory.
            archive_path = f"{MEDIA_ROOT}/archives/{self.dataset.name}_archive.zip"
            os.makedirs(os.path.dirname(archive_path), exist_ok=True)
            with zipfile.ZipFile(
                archive_path,
                "w",
                compression=zipfile.ZIP_DEFLATED,
            ) as archive:
                archive.write(csv_path, f"{dataset_root}/{Path(csv_path).name}")
                archive.writestr(f"{dataset_root}/README.md", read_me_content)
                for image in self.dataset.images.order_by("path"):
                    stored_path = PurePosixPath(image.path)
                    try:
                        relative_path = stored_path.relative_to(
                            dataset_root / "data"
                        )
                    except ValueError:
                        relative_path = PurePosixPath(stored_path.name)

                    image_directory = (
                        "reference_images"
                        if image.is_reference_image
                        else "images"
                    )
                    archive_name = (
                        dataset_root / image_directory / relative_path
                    ).as_posix()
                    with default_storage.open(image.path, "rb") as image_file:
                        archive.writestr(archive_name, image_file.read())

            return archive_path

        except Exception as e:
            raise Exception(f"Failed to create archive: {str(e)}") from e