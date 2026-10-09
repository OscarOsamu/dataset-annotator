from rest_framework import serializers

from .upload_service import (
    DatasetUploadError,
    is_archive_file,
    is_image_file,
    normalize_dataset_name,
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
