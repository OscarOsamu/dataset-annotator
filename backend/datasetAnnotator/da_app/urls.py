from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    AnswerViewSet,
    DatasetViewSet,
    ImageViewSet,
    QuestionViewSet,
    dataset_upload,
)

router = DefaultRouter()
router.register("datasets", DatasetViewSet, basename="dataset")
router.register("images", ImageViewSet, basename="image")
router.register("questions", QuestionViewSet, basename="question")
router.register("answers", AnswerViewSet, basename="answer")

urlpatterns = [
    path("datasets/upload/", dataset_upload, name="dataset-upload"),
    path("", include(router.urls)),
]
