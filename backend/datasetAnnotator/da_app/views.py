
from .make_csv_service import CSVGenerationError, CSVGenerationService
from django.http import FileResponse
from rest_framework import mixins, serializers, status, viewsets
from rest_framework.decorators import action, api_view, parser_classes
from rest_framework.parsers import MultiPartParser
from rest_framework.response import Response

from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import OpenApiParameter, extend_schema, inline_serializer

from pathlib import PurePosixPath

from django.core.files.storage import default_storage

from .create_archival_with_data import CreateArchivalWithData
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

AnnotationTaskSerializer = inline_serializer(
    name="AnnotationTask",
    fields={
        "image_id": serializers.IntegerField(),
        "question_id": serializers.IntegerField(),
    },
)

DatasetAnnotationDataSerializer = inline_serializer(
    name="DatasetAnnotationData",
    fields={
        "tasks": serializers.ListField(child=AnnotationTaskSerializer),
        "images": ImageSerializer(many=True),
        "reference_images": ImageSerializer(many=True),
        "questions": QuestionSerializer(many=True),
        "answers": AnswerSerializer(many=True),
        "total_images": serializers.IntegerField(allow_null=True),
        "next_cursor": serializers.IntegerField(allow_null=True),
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
            description=serializer.validated_data.get("description", ""),
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


#------------------------------------------------------------------------------------------
#  GET CSV file for a dataset
#------------------------------------------------------------------------------------------

class DatasetCSVResponseViewSet(viewsets.ViewSet):
    @extend_schema(
        responses={
            200: OpenApiTypes.BINARY,
            404: inline_serializer(
                name="DatasetCSVNotFound",
                fields={"detail": serializers.CharField()},
            ),
            500: inline_serializer(
                name="DatasetCSVGenerationError",
                fields={"detail": serializers.CharField()},
            ),
        },
    )
    def retrieve(self, request, dataset_id=None):
        try:
            csv_service = CSVGenerationService(dataset_id)
        except Dataset.DoesNotExist:
            return Response(
                {"detail": "Dataset not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        try:
            csv_file_path = csv_service.generate_csv()
        except CSVGenerationError as exc:
            return Response(
                {"detail": str(exc)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        return FileResponse(
            open(csv_file_path, "rb"),
            as_attachment=True,
            filename=f"{csv_service.dataset.name}.csv",
            content_type="text/csv",
        )


@api_view(["GET"])
def dataset_original_archive(request, dataset_id):
    try:
        dataset = Dataset.objects.get(pk=dataset_id)
    except Dataset.DoesNotExist:
        return Response(
            {"detail": "Dataset not found."},
            status=status.HTTP_404_NOT_FOUND,
        )

    if not dataset.archival_path:
        return Response(
            {"detail": "Original archive not found."},
            status=status.HTTP_404_NOT_FOUND,
        )

    try:
        archive_file = default_storage.open(dataset.archival_path, "rb")
    except (FileNotFoundError, OSError):
        return Response(
            {"detail": "Original archive not found."},
            status=status.HTTP_404_NOT_FOUND,
        )

    return FileResponse(
        archive_file,
        as_attachment=True,
        filename=PurePosixPath(dataset.archival_path).name,
        content_type="application/octet-stream",
    )


@api_view(["GET"])
def dataset_archive_with_results(request, dataset_id):
    try:
        dataset = Dataset.objects.get(pk=dataset_id)
    except Dataset.DoesNotExist:
        return Response(
            {"detail": "Dataset not found."},
            status=status.HTTP_404_NOT_FOUND,
        )

    try:
        archive_path = CreateArchivalWithData(dataset).create_archive()
        archive_file = open(archive_path, "rb")
    except Exception as exc:
        return Response(
            {"detail": f"Failed to create dataset archive: {exc}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    return FileResponse(
        archive_file,
        as_attachment=True,
        filename=f"{dataset.name}_archive.zip",
        content_type="application/zip",
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
        return Dataset.objects.all()

    @extend_schema(
        operation_id="api_datasets_annotation_data_retrieve",
        parameters=[
            OpenApiParameter(
                name="cursor",
                type=int,
                location=OpenApiParameter.QUERY,
                required=False,
                description="Return images after this image ID.",
            ),
            OpenApiParameter(
                name="limit",
                type=int,
                location=OpenApiParameter.QUERY,
                required=False,
                description="Images per page, capped at 200.",
            ),
            OpenApiParameter(
                name="include_reference_images",
                type=bool,
                location=OpenApiParameter.QUERY,
                required=False,
                description="Include up to one page of reference images.",
            ),
        ],
        responses=DatasetAnnotationDataSerializer,
    )
    @action(detail=True, methods=["get"], url_path="annotation-data")
    def annotation_data(self, request, pk=None):
        """Return one bounded page of pending image/question pairs."""
        dataset = self.get_object()
        try:
            cursor = int(request.query_params.get("cursor", 0))
            limit = min(max(int(request.query_params.get("limit", 100)), 1), 200)
        except (TypeError, ValueError):
            return Response(
                {"detail": "Cursor and limit must be integers."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if cursor < 0:
            return Response(
                {"detail": "Cursor must be zero or greater."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        images_queryset = Image.objects.filter(
            dataset=dataset,
            is_reference_image=False,
        )
        total_images = images_queryset.count() if cursor == 0 else None
        page_images = list(
            images_queryset.filter(pk__gt=cursor).order_by("pk")[:limit + 1]
        )
        has_more = len(page_images) > limit
        images = page_images[:limit]
        next_cursor = images[-1].pk if has_more and images else None
        include_reference_images = request.query_params.get(
            "include_reference_images", "false"
        ).lower() in {"true", "1"}
        reference_images = []
        if include_reference_images and cursor == 0:
            reference_images = list(
                Image.objects.filter(
                    dataset=dataset,
                    is_reference_image=True,
                ).order_by("pk")[:limit]
            )
        questions = list(Question.objects.filter(dataset=dataset).order_by("pk"))
        image_ids = [image.pk for image in images]
        answers = list(
            Answer.objects.filter(dataset=dataset, image_id__in=image_ids).order_by("pk")
        )

        answers_by_image = {}
        for answer in answers:
            answers_by_image.setdefault(answer.image_id, {})[
                answer.question_id
            ] = answer

        tasks = []
        for image in images:
            image_answers = answers_by_image.get(image.pk, {})
            skip_remaining = False
            for question in questions:
                if skip_remaining:
                    continue

                answer = image_answers.get(question.pk)
                if answer is None:
                    tasks.append(
                        {"image_id": image.pk, "question_id": question.pk}
                    )
                elif answer.is_unclear and question.skip_next_questions_if_null:
                    skip_remaining = True

        return Response(
            {
                "tasks": tasks,
                "images": ImageSerializer(images, many=True).data,
                "reference_images": ImageSerializer(reference_images, many=True).data,
                "questions": QuestionSerializer(questions, many=True).data,
                "answers": AnswerSerializer(answers, many=True).data,
                "total_images": total_images,
                "next_cursor": next_cursor,
            }
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
        elif question.type == "TF":
            answer_counts = [
                {"value": True, "count": 0},
                {"value": False, "count": 0},
            ]
            values = responses.filter(is_unclear=False).values_list(
                "answer_boolean",
                flat=True,
            )
            for value in values:
                count = next(item for item in answer_counts if item["value"] is value)
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

