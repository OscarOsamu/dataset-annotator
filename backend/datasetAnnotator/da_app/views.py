
from rest_framework import mixins, serializers, status, viewsets
from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import MultiPartParser
from rest_framework.response import Response

from drf_spectacular.utils import extend_schema, inline_serializer

from .models import Answer, Dataset, Image, Question
from .serializers import (
    AnswerSerializer,
    DatasetSerializer,
    DatasetUploadSerializer,
    ImageSerializer,
    ImageUploadSerializer,
    QuestionSerializer,
    SkippedFileSerializer,
)
from .upload_service import DatasetUploadError, DatasetUploadService

# ------------------------------------------------------------------------------------------
#  Dataset
# ------------------------------------------------------------------------------------------

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


# ------------------------------------------------------------------------------------------
#  Others views
# ------------------------------------------------------------------------------------------

class DatasetViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    viewsets.GenericViewSet,
):
    queryset = Dataset.objects.all()
    serializer_class = DatasetSerializer


class ImageViewSet(viewsets.ModelViewSet):
    queryset = Image.objects.all()
    serializer_class = ImageSerializer
    parser_classes = [MultiPartParser]

    @extend_schema(
        request=ImageUploadSerializer,
        responses={201: ImageSerializer},
    )
    def create(self, request, *args, **kwargs):
        upload_serializer = ImageUploadSerializer(data=request.data)
        upload_serializer.is_valid(raise_exception=True)
        image = upload_serializer.save()
        response_serializer = ImageSerializer(
            image,
            context=self.get_serializer_context(),
        )
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)


class QuestionViewSet(viewsets.ModelViewSet):
    queryset = Question.objects.all()
    serializer_class = QuestionSerializer


class AnswerViewSet(viewsets.ModelViewSet):
    queryset = Answer.objects.all()
    serializer_class = AnswerSerializer

