
from rest_framework import serializers, status
from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import MultiPartParser
from rest_framework.response import Response

from drf_spectacular.utils import extend_schema, inline_serializer

from .serializers import DatasetUploadSerializer, SkippedFileSerializer
from .upload_service import DatasetUploadError, DatasetUploadService



DatasetUploadResponseSerializer = inline_serializer(
    name="DatasetUploadResponse",
    fields={
        "id": serializers.IntegerField(),
        "name": serializers.CharField(),
        "description": serializers.CharField(),
        "archival_path": serializers.CharField(allow_null=True),
        "image_count": serializers.IntegerField(),
        "total_files": serializers.IntegerField(),
        "skipped_count": serializers.IntegerField(),
        "skipped_files": SkippedFileSerializer(many=True),
        "message": serializers.CharField(),
    },
)
@extend_schema(
    request=DatasetUploadSerializer,
    responses={
        201: DatasetUploadResponseSerializer,
        400: inline_serializer(
            name="DatasetUploadErrorResponse",
            fields={"detail": serializers.CharField()},
        ),
    },
)
@api_view(["POST"])
@parser_classes([MultiPartParser])
def dataset_upload(request):
    serializer = DatasetUploadSerializer(data=request.data)

    if not serializer.is_valid():
        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        result = DatasetUploadService().upload(
            name=serializer.validated_data["name"],
            description=serializer.validated_data["description"],
            files=serializer.validated_data["files"],
        )
    except DatasetUploadError as exc:
        return Response(
            {"detail": str(exc)},
            status=status.HTTP_400_BAD_REQUEST,
        )

    skipped_count = len(result.skipped_files)

    if skipped_count:
        message = (
            f"Dataset created. {result.image_count} image(s) imported; "
            f"{skipped_count} file(s) skipped."
        )
    else:
        message = (
            f"Dataset created. {result.image_count} image(s) imported."
        )

    return Response(
        {
            "id": result.dataset.pk,
            "name": result.dataset.name,
            "description": result.dataset.description,
            "archival_path": result.archival_path,
            "image_count": result.image_count,
            "total_files": result.total_files,
            "skipped_count": skipped_count,
            "skipped_files": result.skipped_files,
            "message": message,
        },
        status=status.HTTP_201_CREATED,
    )