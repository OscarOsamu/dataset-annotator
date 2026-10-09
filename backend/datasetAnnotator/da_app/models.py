from django.core.exceptions import ValidationError
from django.db import models
from django.db.models import Q, F


ANSWER_TYPE_CHOICES = [
    ("QCM", "Multiple-choice input"),
    ("INT", "Integer input"),
]


class Dataset(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    archival_path = models.CharField(max_length=500, null=True, blank=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class Image(models.Model):
    dataset = models.ForeignKey(
        Dataset,
        on_delete=models.CASCADE,
        related_name="images",
    )
    path = models.CharField(max_length=500)
    is_reference_image = models.BooleanField(default=False) #ignore them when retrieving image to annotate and such

    class Meta:
        ordering = ["path"]

    def __str__(self):
        return self.path


class Question(models.Model):
    dataset = models.ForeignKey(
        Dataset,
        on_delete=models.CASCADE,
        related_name="questions",
    )
    text = models.TextField()
    type = models.CharField(
        max_length=10,
        choices=ANSWER_TYPE_CHOICES,
    )
    reference_image = models.ForeignKey(
        Image,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="reference_questions",
    )
    answer_options = models.JSONField(default=list, blank=True)
    allow_several_answers = models.BooleanField(default=False)
    skip_next_questions_if_null = models.BooleanField(default=False)
    minimum = models.PositiveIntegerField(null=True, blank=True)
    maximum = models.PositiveIntegerField(null=True, blank=True)

    class Meta:
        constraints = [
            models.CheckConstraint(
                condition=(
                    ~Q(type="INT")
                    | Q(minimum__isnull=True)
                    | Q(maximum__isnull=True)
                    | Q(minimum__lte=F("maximum"))
                ),
                name="question_integer_range_is_valid",
            ),
        ]

    def clean(self):
        super().clean()

        # QCM questions must have at least one answer option.
        if self.type == "QCM":
            if not isinstance(self.answer_options, list) or not self.answer_options:
                raise ValidationError(
                    {
                        "answer_options": (
                            "Multiple-choice questions require at least one option."
                        )
                    }
                )

        # Integer questions can have optional minimum/maximum bounds,
        # but minimum must not exceed maximum.
        if (
            self.type == "INT"
            and self.minimum is not None
            and self.maximum is not None
            and self.minimum > self.maximum
        ):
            raise ValidationError(
                {
                    "minimum": "Minimum must not exceed maximum."
                }
            )

        # A reference image must belong to the same dataset.
        if (
            self.reference_image_id is not None
            and self.dataset_id is not None
            and self.reference_image.dataset_id != self.dataset_id
            and self.reference_image.is_reference_image != True
        ):
            raise ValidationError(
                {
                    "reference_image": (
                        "The reference image must belong to the same dataset and must been set as reference image."
                    )
                }
            )

        # Multiple answers only make sense for QCM questions.
        if self.type == "INT" and self.allow_several_answers:
            raise ValidationError(
                {
                    "allow_several_answers": (
                        "Integer questions cannot allow several answers."
                    )
                }
            )

    def save(self, *args, **kwargs):
        self.full_clean()
        return super().save(*args, **kwargs)

    def __str__(self):
        return self.text


class Answer(models.Model):
    dataset = models.ForeignKey(
        Dataset,
        on_delete=models.CASCADE,
        related_name="responses",
    )
    image = models.ForeignKey(
        Image,
        on_delete=models.CASCADE,
        related_name="responses",
    )
    question = models.ForeignKey(
        Question,
        on_delete=models.CASCADE,
        related_name="responses",
    )
    answer_integer = models.PositiveIntegerField(
        null=True,
        blank=True,
    )
    answer_choices = models.JSONField(
        null=True,
        blank=True,
    )
    is_unclear = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.CheckConstraint(
                condition=(
                    Q(is_unclear=True)
                    | (
                        Q(answer_integer__isnull=False)
                        & Q(answer_choices__isnull=True)
                    )
                    | (
                        Q(answer_integer__isnull=True)
                        & Q(answer_choices__isnull=False)
                    )
                ),
                name="response_has_exactly_one_answer_form",
            ),
        ]

    def clean(self):
        super().clean()

        # ---------------------------------------------------------
        # Basic relationship validation
        # ---------------------------------------------------------

        if self.dataset_id is not None and self.image_id is not None:
            if self.image.dataset_id != self.dataset_id:
                raise ValidationError(
                    {
                        "image": (
                            "The image must belong to the selected dataset."
                        )
                    }
                )

        if self.dataset_id is not None and self.question_id is not None:
            if self.question.dataset_id != self.dataset_id:
                raise ValidationError(
                    {
                        "question": (
                            "The question must belong to the selected dataset."
                        )
                    }
                )

        if self.image_id is not None and self.question_id is not None:
            if self.image.dataset_id != self.question.dataset_id:
                raise ValidationError(
                    {
                        "image": (
                            "The image and question must belong to the same dataset."
                        )
                    }
                )

        # ---------------------------------------------------------
        # Unclear responses
        # ---------------------------------------------------------

        if self.is_unclear:
            if (
                self.answer_integer is not None
                or self.answer_choices is not None
            ):
                raise ValidationError(
                    {
                        "is_unclear": (
                            "Unclear responses cannot have an answer."
                        )
                    }
                )

            return

        # A normal response must have a question.
        if self.question_id is None:
            raise ValidationError(
                {
                    "question": "A response must have a question."
                }
            )

        question = self.question

        # ---------------------------------------------------------
        # Integer question
        # ---------------------------------------------------------

        if question.type == "INT":
            if self.answer_integer is None:
                raise ValidationError(
                    {
                        "answer_integer": (
                            "Integer questions require an integer answer."
                        )
                    }
                )

            if self.answer_choices is not None:
                raise ValidationError(
                    {
                        "answer_choices": (
                            "Integer questions cannot have choice answers."
                        )
                    }
                )

            if (
                question.minimum is not None
                and self.answer_integer < question.minimum
            ):
                raise ValidationError(
                    {
                        "answer_integer": (
                            "The answer is below the minimum."
                        )
                    }
                )

            if (
                question.maximum is not None
                and self.answer_integer > question.maximum
            ):
                raise ValidationError(
                    {
                        "answer_integer": (
                            "The answer is above the maximum."
                        )
                    }
                )

        # ---------------------------------------------------------
        # Multiple-choice question
        # ---------------------------------------------------------

        elif question.type == "QCM":
            if self.answer_integer is not None:
                raise ValidationError(
                    {
                        "answer_integer": (
                            "Multiple-choice questions cannot have "
                            "an integer answer."
                        )
                    }
                )

            if not isinstance(self.answer_choices, list):
                raise ValidationError(
                    {
                        "answer_choices": (
                            "Multiple-choice questions require "
                            "a list of answers."
                        )
                    }
                )

            if not self.answer_choices:
                raise ValidationError(
                    {
                        "answer_choices": (
                            "At least one answer must be selected."
                        )
                    }
                )

            # A QCM that doesn't allow several answers must have
            # exactly one selected option.
            if not question.allow_several_answers:
                if len(self.answer_choices) != 1:
                    raise ValidationError(
                        {
                            "answer_choices": (
                                "This question accepts exactly "
                                "one answer."
                            )
                        }
                    )

            # Every selected answer must exist in the question's
            # available options.
            invalid_choices = [
                choice
                for choice in self.answer_choices
                if choice not in question.answer_options
            ]

            if invalid_choices:
                raise ValidationError(
                    {
                        "answer_choices": (
                            "One or more answers are not valid options."
                        )
                    }
                )

        else:
            raise ValidationError(
                {
                    "question": (
                        f"Unsupported question type: {question.type}"
                    )
                }
            )

    def save(self, *args, **kwargs):
        self.full_clean()
        return super().save(*args, **kwargs)

    def __str__(self):
        return f"Response for {self.question} on {self.image}"
