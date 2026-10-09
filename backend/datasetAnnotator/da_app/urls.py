from django.urls import path

from .views import dataset_upload

urlpatterns = [
    path("datasets/upload/", dataset_upload, name="dataset-upload"),
]
