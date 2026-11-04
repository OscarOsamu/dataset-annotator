from django.db import migrations, models


def backfill_answer_count_and_progress(apps, schema_editor):
    Dataset = apps.get_model("da_app", "Dataset")
    Answer = apps.get_model("da_app", "Answer")

    for dataset in Dataset.objects.all():
        total_questions = dataset.questions.count()
        total_images = dataset.images.filter(is_reference_image=False).count()
        dataset.answer_count = Answer.objects.filter(dataset_id=dataset.pk).count()

        if not total_questions or not total_images:
            dataset.annotation_progress = 0.0
            dataset.save(update_fields=["answer_count", "annotation_progress"])
            continue

        total_slots = total_questions * total_images
        dataset.annotation_progress = round(
            (dataset.answer_count * 100.0) / total_slots,
            2,
        )
        dataset.save(update_fields=["answer_count", "annotation_progress"])


class Migration(migrations.Migration):

    dependencies = [
        ("da_app", "0004_dataset_annotation_progress"),
    ]

    operations = [
        migrations.AddField(
            model_name="dataset",
            name="answer_count",
            field=models.PositiveIntegerField(default=0),
        ),
        migrations.RunPython(
            backfill_answer_count_and_progress,
            migrations.RunPython.noop,
        ),
    ]
