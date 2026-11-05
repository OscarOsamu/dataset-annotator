from django.core.exceptions import ValidationError
from django.db import models
from django.db.models import Q, F
from django.db.models.signals import post_delete, post_save, pre_save
from django.dispatch import receiver


ANSWER_TYPE_CHOICES = [
    ("QCM", "Multiple-choice input"),
    ("INT", "Integer input"),
]


class Dataset(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    archival_path = models.CharField(max_length=500, null=True, blank=True)
    question_ids = models.JSONField(default=list, blank=True)
    image_count = models.PositiveIntegerField(default=0)
    annotation_progress = models.FloatField(default=0.0)
    answer_count = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["name"]

    def recalculate_annotation_progress(self):
        total_questions = self.questions.count()
        total_images = self.images.filter(is_reference_image=False).count()
        self.answer_count = self.responses.count()

        if not total_questions or not total_images:
            self.annotation_progress = 0.0
            return self

        total_answer_slots = total_questions * total_images
        if total_answer_slots == 0:
            self.annotation_progress = 0.0
            return self

        self.annotation_progress = round(
            (self.answer_count * 100.0) / total_answer_slots,
            2,
        )
        return self

    def refresh_annotation_metadata(self):
        self.question_ids = list(
            self.questions.order_by("pk").values_list("pk", flat=True)
        )
        self.image_count = self.images.filter(is_reference_image=False).count()
        self.save(update_fields=["question_ids", "image_count"])
        return self

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
        saved = super().save(*args, **kwargs)
        self.dataset.recalculate_annotation_progress()
        self.dataset.save(update_fields=["annotation_progress", "answer_count"])
        return saved

    def delete(self, *args, **kwargs):
        dataset = self.dataset
        deleted = super().delete(*args, **kwargs)
        dataset.recalculate_annotation_progress()
        dataset.save(update_fields=["annotation_progress", "answer_count"])
        return deleted

    def __str__(self):
        return f"Response for {self.question} on {self.image}"


def _refresh_dataset_annotation_metadata(dataset_id):
    dataset = Dataset.objects.filter(pk=dataset_id).first()
    if dataset is not None:
        dataset.refresh_annotation_metadata()


def _remember_previous_dataset(sender, instance):
    if instance.pk is None:
        instance._previous_dataset_id = None
        return

    instance._previous_dataset_id = sender.objects.filter(pk=instance.pk).values_list(
        "dataset_id", flat=True
    ).first()


def _refresh_related_dataset_metadata(instance):
    _refresh_dataset_annotation_metadata(instance.dataset_id)
    previous_dataset_id = getattr(instance, "_previous_dataset_id", None)
    if previous_dataset_id is not None and previous_dataset_id != instance.dataset_id:
        _refresh_dataset_annotation_metadata(previous_dataset_id)


@receiver(pre_save, sender=Image)
@receiver(pre_save, sender=Question)
def remember_annotation_metadata_dataset(sender, instance, **kwargs):
    _remember_previous_dataset(sender, instance)


@receiver(post_save, sender=Image)
@receiver(post_save, sender=Question)
def refresh_annotation_metadata_after_save(sender, instance, **kwargs):
    _refresh_related_dataset_metadata(instance)


@receiver(post_delete, sender=Image)
@receiver(post_delete, sender=Question)
def refresh_annotation_metadata_after_delete(sender, instance, **kwargs):
    _refresh_dataset_annotation_metadata(instance.dataset_id)
