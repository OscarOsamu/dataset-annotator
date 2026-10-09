from django.core.exceptions import ValidationError
from django.test import TestCase

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
