from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    AnswerViewSet,
    DatasetCSVResponseViewSet,
    DatasetViewSet,
    ImageViewSet,
    QuestionViewSet,
    dataset_archive_with_results,
    dataset_original_archive,
    dataset_upload,
)

router = DefaultRouter()
router.register("datasets", DatasetViewSet, basename="dataset")
router.register("images", ImageViewSet, basename="image")
router.register("questions", QuestionViewSet, basename="question")
router.register("answers", AnswerViewSet, basename="answer")

# add GET endpoint for getting the CSV file for a dataset

urlpatterns = [
    path("datasets/upload/", dataset_upload, name="dataset-upload"),
    path(
        "datasets/<int:dataset_id>/get_original_archive/",
        dataset_original_archive,
        name="dataset-original-archive",
    ),
    path(
        "datasets/<int:dataset_id>/get_archive_with_results/",
        dataset_archive_with_results,
        name="dataset-archive-with-results",
    ),
    path(
        "datasets/<int:dataset_id>/generate_csv/",
        DatasetCSVResponseViewSet.as_view({"get": "retrieve"}),
        name="dataset-generate-csv",
    ),
    path("", include(router.urls)),
]
