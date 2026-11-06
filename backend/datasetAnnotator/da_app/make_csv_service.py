import os
import csv
import json

from .models import Answer, Dataset, Image, Question
from datasetAnnotator.settings import MEDIA_ROOT


class CSVGenerationError(Exception):
    """Raised when an error occurs during CSV generation for an annotated dataset."""
    pass

class CSVGenerationService:
    """Service for generating CSV files for annotated datasets."""

    def __init__(self, dataset_id):
        self.dataset = Dataset.objects.get(pk=dataset_id)
        self.questions = Question.objects.filter(dataset=self.dataset).order_by("pk")
        self.answers = Answer.objects.filter(dataset=self.dataset)
        self.images = Image.objects.filter(
            dataset=self.dataset,
            is_reference_image=False,
        ).order_by("pk")
        self.column_names = ["id", "image_path"] + [question.text for question in self.questions]
        self.csv_file_path = f"{MEDIA_ROOT}/csv/{self.dataset.name}.csv"

    def generate_csv(self):
        """
        Generate a CSV file for the annotated dataset.

        Returns:
            str: The path to the generated CSV file.

        Raises:
            CSVGenerationError: If an error occurs during CSV generation.
        """
        try:
            # Implement the logic to generate the CSV file here
            csv_path = self._create_csv_file()
            return csv_path
        except Exception as e:
            raise CSVGenerationError(f"Failed to generate CSV: {str(e)}") from e

    def _create_csv_file(self):
        """
        Create the CSV file for the dataset.

        The CSV will contain the following columns:
        - id: The unique identifier for each image.
        - image_path: The path to the image file.
        - For every question in the dataset, a column for each question's answer will be included.

        Returns:
            str: The path to the created CSV file.
        """

        os.makedirs(os.path.dirname(self.csv_file_path), exist_ok=True)

        with open(self.csv_file_path, mode='w', newline='', encoding='utf-8') as csv_file:
            writer = csv.DictWriter(csv_file, fieldnames=self.column_names)
            writer.writeheader()

            id = 0

            for image in self.images:
                row = {
                    "id": id,
                    "image_path": image.path,
                }

                for question in self.questions:
                    answer = self.answers.filter(image=image, question=question).first()
                    if answer is None or answer.is_unclear:
                        row[question.text] = None
                    elif question.type == "INT":
                        row[question.text] = answer.answer_integer
                    elif question.type == "TF":
                        row[question.text] = answer.answer_boolean
                    elif answer.answer_choices is None:
                            row[question.text] = None
                    else:   
                            row[question.text] = json.dumps(
                            answer.answer_choices,
                            ensure_ascii=False,
                        )

                writer.writerow(row)
                id += 1

        return self.csv_file_path