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

from .models import Answer, Dataset, Image as DatasetImage, Question
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

    def test_upload_endpoint_allows_description_to_be_added_later(self):
        image = io.BytesIO()
        Image.new("RGB", (2, 2), "blue").save(image, format="PNG")
        data = {
            "name": "Catalog",
            "files": [SimpleUploadedFile("cat.png", image.getvalue(), "image/png")],
        }

        response = self.client.post(reverse("dataset-upload"), data)

        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data["description"], "")
        self.assertEqual(Dataset.objects.get().description, "")

    def test_upload_endpoint_rejects_non_image_folder(self):
        data = {
            "name": "Invalid",
            "files": [SimpleUploadedFile("notes.txt", b"text", "text/plain")],
        }

        response = self.client.post(reverse("dataset-upload"), data)

        self.assertEqual(response.status_code, 400)
        self.assertIn("image files only", response.data["files"][0])
        self.assertFalse(Dataset.objects.exists())


class DatasetAnnotationTasksApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.dataset = Dataset.objects.create(name="birds")
        self.other_dataset = Dataset.objects.create(name="mammals")

    def test_annotation_tasks_return_pending_pairs_and_scoped_context(self):
        first_image = DatasetImage.objects.create(
            dataset=self.dataset,
            path="birds/data/one.png",
        )
        second_image = DatasetImage.objects.create(
            dataset=self.dataset,
            path="birds/data/two.png",
        )
        DatasetImage.objects.create(
            dataset=self.dataset,
            path="birds/data/reference.png",
            is_reference_image=True,
        )
        other_image = DatasetImage.objects.create(
            dataset=self.other_dataset,
            path="mammals/data/one.png",
        )
        first_question = Question.objects.create(
            dataset=self.dataset,
            text="How many birds are visible?",
            type="INT",
        )
        second_question = Question.objects.create(
            dataset=self.dataset,
            text="How many wings are visible?",
            type="INT",
        )
        other_question = Question.objects.create(
            dataset=self.other_dataset,
            text="How many mammals?",
            type="INT",
        )
        existing_answer = Answer.objects.create(
            dataset=self.dataset,
            image=first_image,
            question=first_question,
            answer_integer=2,
        )
        Answer.objects.create(
            dataset=self.other_dataset,
            image=other_image,
            question=other_question,
            answer_integer=1,
        )

        response = self.client.get(
            f"/api/datasets/{self.dataset.pk}/annotation-data/"
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            [item["image_id"] for item in response.data["tasks"]],
            [first_image.pk, second_image.pk, second_image.pk],
        )
        self.assertEqual(
            [item["question_id"] for item in response.data["tasks"]],
            [second_question.pk, first_question.pk, second_question.pk],
        )
        self.assertEqual(
            [item["id"] for item in response.data["images"]],
            [first_image.pk, second_image.pk],
        )
        self.assertEqual(
            [item["id"] for item in response.data["questions"]],
            [first_question.pk, second_question.pk],
        )
        self.assertEqual(
            [item["id"] for item in response.data["answers"]],
            [existing_answer.pk],
        )
        self.assertEqual(response.data["total_images"], 2)
        self.assertIsNone(response.data["next_cursor"])

    def test_annotation_tasks_are_paginated_by_image_cursor(self):
        images = [
            DatasetImage.objects.create(
                dataset=self.dataset,
                path=f"birds/data/{index}.png",
            )
            for index in range(3)
        ]
        question = Question.objects.create(
            dataset=self.dataset,
            text="How many birds?",
            type="INT",
        )

        first_response = self.client.get(
            f"/api/datasets/{self.dataset.pk}/annotation-data/?limit=2"
        )
        second_response = self.client.get(
            f"/api/datasets/{self.dataset.pk}/annotation-data/",
            {"limit": 2, "cursor": first_response.data["next_cursor"]},
        )

        self.assertEqual(first_response.status_code, 200)
        self.assertEqual(
            [item["image_id"] for item in first_response.data["tasks"]],
            [images[0].pk, images[1].pk],
        )
        self.assertEqual(first_response.data["total_images"], 3)
        self.assertEqual(first_response.data["next_cursor"], images[1].pk)
        self.assertEqual(second_response.status_code, 200)
        self.assertEqual(
            second_response.data["tasks"],
            [{"image_id": images[2].pk, "question_id": question.pk}],
        )
        self.assertIsNone(second_response.data["next_cursor"])
        self.assertIsNone(second_response.data["total_images"])

    def test_annotation_tasks_skip_questions_after_unclear_answer(self):
        image = DatasetImage.objects.create(
            dataset=self.dataset,
            path="birds/data/one.png",
        )
        first_question = Question.objects.create(
            dataset=self.dataset,
            text="Can you identify this bird?",
            type="INT",
            skip_next_questions_if_null=True,
        )
        Question.objects.create(
            dataset=self.dataset,
            text="How many birds are visible?",
            type="INT",
        )
        Answer.objects.create(
            dataset=self.dataset,
            image=image,
            question=first_question,
            is_unclear=True,
        )

        response = self.client.get(
            f"/api/datasets/{self.dataset.pk}/annotation-data/"
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["tasks"], [])


@override_settings(MEDIA_ROOT="/tmp/dataset-annotator-image-upload-api-tests")
class ImageUploadApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.storage_root = Path(settings.MEDIA_ROOT)
        self.storage_root.mkdir(parents=True, exist_ok=True)
        self.dataset = Dataset.objects.create(name="cats")

    def tearDown(self):
        for path in self.storage_root.rglob("*"):
            if path.is_file():
                path.unlink()
        for path in sorted(self.storage_root.rglob("*"), reverse=True):
            if path.is_dir():
                path.rmdir()

    def test_image_post_stores_uploaded_file_and_creates_record(self):
        image_data = io.BytesIO()
        Image.new("RGB", (2, 2), "green").save(image_data, format="PNG")
        expected_bytes = image_data.getvalue()
        upload = SimpleUploadedFile(
            "cat.png",
            expected_bytes,
            content_type="image/png",
        )

        response = self.client.post(
            reverse("image-list"),
            {"dataset": self.dataset.pk, "file": upload},
            format="multipart",
        )

        self.assertEqual(response.status_code, 201)
        image = DatasetImage.objects.get(dataset=self.dataset)
        self.assertEqual(response.data["path"], image.path)
        self.assertTrue(image.path.startswith("cats/data/"))
        self.assertEqual(
            (self.storage_root / image.path).read_bytes(),
            expected_bytes,
        )

    def test_image_post_rejects_invalid_image_content(self):
        upload = SimpleUploadedFile(
            "not-an-image.png",
            b"not image data",
            content_type="image/png",
        )

        response = self.client.post(
            reverse("image-list"),
            {"dataset": self.dataset.pk, "file": upload},
            format="multipart",
        )

        self.assertEqual(response.status_code, 400)
        self.assertFalse(DatasetImage.objects.filter(dataset=self.dataset).exists())
