
from django.db.models import Prefetch

from rest_framework import mixins, serializers, status, viewsets
from rest_framework.decorators import action, api_view, parser_classes
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
        "question_count": serializers.IntegerField(),
        "annotation_progress": serializers.FloatField(),
        "total_files": serializers.IntegerField(),
        "skipped_count": serializers.IntegerField(),
        "skipped_files": SkippedFileSerializer(many=True),
        "message": serializers.CharField(),
    },
)

QuestionInfoResponseSerializer = inline_serializer(
    name="QuestionInfoResponse",
    fields={
        "id": serializers.IntegerField(),
        "text": serializers.CharField(),
        "type": serializers.CharField(),
        "total_responses": serializers.IntegerField(),
        "unclear_count": serializers.IntegerField(),
        "answer_counts": serializers.ListField(
            child=inline_serializer(
                name="QuestionAnswerCount",
                fields={
                    "value": serializers.JSONField(),
                    "count": serializers.IntegerField(),
                },
            )
        ),
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

    dataset_data = DatasetSerializer(result.dataset).data

    return Response(
        {
            **dataset_data,
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
    serializer_class = DatasetSerializer

    def get_queryset(self):
        return Dataset.objects.prefetch_related(
            Prefetch(
                "images",
                queryset=Image.objects.filter(is_reference_image=False).prefetch_related(
                    "responses"
                ),
                to_attr="annotation_images",
            ),
            Prefetch(
                "questions",
                queryset=Question.objects.order_by("pk"),
                to_attr="annotation_questions",
            ),
        )


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

    @extend_schema(responses=QuestionInfoResponseSerializer)
    @action(detail=True, methods=["get"], url_path="info")
    def info(self, request, pk=None):
        question = self.get_object()
        responses = question.responses.filter(image__is_reference_image=False)
        total_responses = responses.count()
        unclear_count = responses.filter(is_unclear=True).count()

        if question.type == "QCM":
            answer_counts = [
                {"value": option, "count": 0}
                for option in question.answer_options
            ]
            values = responses.filter(is_unclear=False).values_list(
                "answer_choices",
                flat=True,
            )
            for selected_values in values:
                for selected_value in selected_values or []:
                    count = next(
                        (
                            item
                            for item in answer_counts
                            if item["value"] == selected_value
                        ),
                        None,
                    )
                    if count is not None:
                        count["count"] += 1
        else:
            value_counts = {}
            values = responses.filter(is_unclear=False).values_list(
                "answer_integer",
                flat=True,
            )
            for value in values:
                value_counts[value] = value_counts.get(value, 0) + 1
            answer_counts = [
                {"value": value, "count": value_counts[value]}
                for value in sorted(value_counts)
            ]

        return Response(
            {
                "id": question.pk,
                "text": question.text,
                "type": question.type,
                "total_responses": total_responses,
                "unclear_count": unclear_count,
                "answer_counts": answer_counts,
            }
        )



class AnswerViewSet(viewsets.ModelViewSet):
    queryset = Answer.objects.all()
    serializer_class = AnswerSerializer

