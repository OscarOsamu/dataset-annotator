from django.contrib import admin

from .models import Dataset, Image, Question, Answer

# Register your models here.
models = [Dataset, Image, Question, Answer]

for model in models :
    admin.site.register(model)