from django.core.exceptions import ValidationError
from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient

from .models import Dataset, Image, Question, Answer


class DatasetAnnotationModelsTest(TestCase):
    def setUp(self):
        self.dataset = Dataset.objects.create(
            name="Squirrels",
            description="A dataset of squirrel images.",
            archival_path="/archives/squirrels",
        )
        self.image = Image.objects.create(
            dataset=self.dataset,
            path="/images/squirrel-1.jpg",
        )

    def test_question_can_reference_an_image_from_same_dataset(self):
        question = Question.objects.create(
            dataset=self.dataset,
            text="What color is this squirrel?",
            type="QCM",
            reference_image=self.image,
            answer_options=["Brown", "Gray"],
        )

        self.assertEqual(question.reference_image, self.image)

    def test_question_rejects_reference_image_from_another_dataset(self):
        other_dataset = Dataset.objects.create(
            name="Birds",
            archival_path="/archives/birds",
        )
        other_image = Image.objects.create(
            dataset=other_dataset,
            path="/images/bird-1.jpg",
        )
        question = Question(
            dataset=self.dataset,
            text="What color is this bird?",
            type="QCM",
            reference_image=other_image,
            answer_options=["Black", "White"],
        )

        with self.assertRaises(ValidationError):
            question.full_clean()

    def test_integer_response_validates_answer_range(self):
        question = Question.objects.create(
            dataset=self.dataset,
            text="How many squirrels are visible?",
            type="INT",
            minimum=1,
            maximum=3,
        )
        response = Answer(
            dataset=self.dataset,
            image=self.image,
            question=question,
            answer_integer=4,
        )

        with self.assertRaises(ValidationError):
            response.full_clean()

    def test_unclear_response_does_not_store_an_answer(self):
        question = Question.objects.create(
            dataset=self.dataset,
            text="What color is this squirrel?",
            type="QCM",
            answer_options=["Brown", "Gray"],
        )
        response = Answer(
            dataset=self.dataset,
            image=self.image,
            question=question,
            is_unclear=True,
        )

        response.full_clean()
        response.save()

        self.assertTrue(response.is_unclear)
        self.assertIsNone(response.answer_integer)
        self.assertIsNone(response.answer_choices)

    def test_dataset_annotation_progress_updates_on_answer_save(self):
        question = Question.objects.create(
            dataset=self.dataset,
            text="What color is this squirrel?",
            type="QCM",
            answer_options=["Brown", "Gray"],
        )
        second_image = Image.objects.create(
            dataset=self.dataset,
            path="/images/squirrel-2.jpg",
        )

        self.dataset.refresh_from_db()
        self.assertEqual(self.dataset.annotation_progress, 0.0)

        Answer.objects.create(
            dataset=self.dataset,
            image=self.image,
            question=question,
            answer_choices=["Brown"],
        )

        self.dataset.refresh_from_db()
        self.assertEqual(self.dataset.annotation_progress, 50.0)

        Answer.objects.create(
            dataset=self.dataset,
            image=second_image,
            question=question,
            answer_choices=["Gray"],
        )

        self.dataset.refresh_from_db()
        self.assertEqual(self.dataset.annotation_progress, 100.0)

    def test_dataset_tracks_related_answer_count_for_lightweight_progress(self):
        question = Question.objects.create(
            dataset=self.dataset,
            text="What color is this squirrel?",
            type="QCM",
            answer_options=["Brown", "Gray"],
        )
        second_image = Image.objects.create(
            dataset=self.dataset,
            path="/images/squirrel-2.jpg",
        )

        self.assertEqual(self.dataset.answer_count, 0)

        Answer.objects.create(
            dataset=self.dataset,
            image=self.image,
            question=question,
            answer_choices=["Brown"],
        )

        self.dataset.refresh_from_db()
        self.assertEqual(self.dataset.answer_count, 1)
        self.assertEqual(self.dataset.annotation_progress, 50.0)

        Answer.objects.create(
            dataset=self.dataset,
            image=second_image,
            question=question,
            answer_choices=["Gray"],
        )

        self.dataset.refresh_from_db()
        self.assertEqual(self.dataset.answer_count, 2)
        self.assertEqual(self.dataset.annotation_progress, 100.0)


class ModelApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.dataset = Dataset.objects.create(
            name="Squirrels",
            description="A dataset of squirrel images.",
            archival_path="archives/squirrels.zip",
        )

    def test_dataset_post_is_only_available_on_upload_endpoint(self):
        response = self.client.post(
            reverse("dataset-list"),
            {"name": "New dataset", "description": ""},
            format="json",
        )

        self.assertEqual(response.status_code, 405)

    def test_dataset_list_includes_question_ids(self):
        first_question = Question.objects.create(
            dataset=self.dataset,
            text="What animal is this?",
            type="QCM",
            answer_options=["Squirrel", "Bird"],
        )
        second_question = Question.objects.create(
            dataset=self.dataset,
            text="How many animals are visible?",
            type="INT",
        )

        response = self.client.get(reverse("dataset-list"))

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.data[0]["question_ids"],
            [first_question.pk, second_question.pk],
        )

    def test_dataset_update_only_changes_name_and_description(self):
        response = self.client.patch(
            reverse("dataset-detail", args=[self.dataset.pk]),
            {
                "name": "Renamed dataset",
                "archival_path": "changed.zip",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        self.dataset.refresh_from_db()
        self.assertEqual(self.dataset.name, "Renamed dataset")
        self.assertEqual(self.dataset.archival_path, "archives/squirrels.zip")

    def test_question_api_rejects_invalid_multiple_choice_options(self):
        response = self.client.post(
            reverse("question-list"),
            {
                "dataset": self.dataset.pk,
                "text": "What animal is this?",
                "type": "QCM",
                "answer_options": [],
            },
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("answer_options", response.data)
