from copy import copy

from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import serializers

from .models import Answer, Dataset, Image, Question
from .upload_service import (
    DatasetUploadError,
    is_archive_file,
    is_image_file,
    normalize_dataset_name,
    safe_relative_path,
    DatasetUploadService,
)


class SkippedFileSerializer(serializers.Serializer):
    name = serializers.CharField()
    reason = serializers.CharField()



class DatasetUploadSerializer(serializers.Serializer):
    name = serializers.CharField(
        min_length=1,
        max_length=100,
        trim_whitespace=True,
    )
    description = serializers.CharField(
        required=False,
        allow_blank=True,
        trim_whitespace=True,
        max_length=1000,
    )
    files = serializers.ListField(
        child=serializers.FileField(
            allow_empty_file=False,
        ),
        min_length=1,
        allow_empty=False,
    )

    def validate_name(self, value):
        try:
            normalize_dataset_name(value)
        except DatasetUploadError as exc:
            raise serializers.ValidationError(str(exc)) from exc
        return value.strip()

    def validate_files(self, files):
        archives = [file for file in files if is_archive_file(file)]
        if archives:
            if len(files) != 1:
                raise serializers.ValidationError(
                    "An archive upload must contain exactly one archive file."
                )
            return files

        if not all(is_image_file(file) for file in files):
            raise serializers.ValidationError(
                "Folder uploads must contain image files only."
            )
        return files


class DatasetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Dataset
        fields = [
            "id",
            "name",
            "description",
            "archival_path",
            "question_ids",
            "image_count",
            "answer_count",
            "annotation_progress",
        ]
        read_only_fields = [
            "id",
            "archival_path",
            "question_ids",
            "image_count",
            "answer_count",
            "annotation_progress",
        ]


class ImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Image
        fields = ["id", "dataset", "path", "is_reference_image"]
        read_only_fields = ["id", "path"]


class ImageUploadSerializer(serializers.Serializer):
    dataset = serializers.PrimaryKeyRelatedField(queryset=Dataset.objects.all())
    file = serializers.FileField(allow_empty_file=False)
    is_reference_image = serializers.BooleanField(required=False, default=False)

    def validate_file(self, uploaded_file):
        if not is_image_file(uploaded_file):
            raise serializers.ValidationError(
                "Upload must be a supported image file."
            )

        try:
            safe_relative_path(uploaded_file.name)
        except DatasetUploadError as exc:
            raise serializers.ValidationError(str(exc)) from exc
        return uploaded_file

    def create(self, validated_data):
        try:
            return DatasetUploadService().upload_image(
                dataset=validated_data["dataset"],
                uploaded_file=validated_data["file"],
                is_reference_image=validated_data["is_reference_image"],
            )
        except DatasetUploadError as exc:
            raise serializers.ValidationError({"file": str(exc)}) from exc


class ModelValidationSerializer(serializers.ModelSerializer):
    def validate(self, attrs):
        instance = copy(self.instance) if self.instance is not None else self.Meta.model()
        for field, value in attrs.items():
            setattr(instance, field, value)

        try:
            instance.full_clean()
        except DjangoValidationError as exc:
            detail = exc.message_dict if hasattr(exc, "message_dict") else exc.messages
            raise serializers.ValidationError(detail) from exc

        return attrs


class QuestionSerializer(ModelValidationSerializer):
    class Meta:
        model = Question
        fields = [
            "id",
            "dataset",
            "text",
            "type",
            "reference_image",
            "answer_options",
            "allow_several_answers",
            "skip_next_questions_if_null",
            "minimum",
            "maximum",
        ]
        read_only_fields = ["id"]


class AnswerSerializer(ModelValidationSerializer):
    class Meta:
        model = Answer
        fields = [
            "id",
            "dataset",
            "image",
            "question",
            "answer_integer",
            "answer_choices",
            "answer_boolean",
            "is_unclear",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]

    