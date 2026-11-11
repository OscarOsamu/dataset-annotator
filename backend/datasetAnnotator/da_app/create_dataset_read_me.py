from .models import Dataset


class DatasetReadMeGenerator:
    """Service to generate a README file for a dataset.
    
    This service should generate a read me file for a dataset with the following information:
     - dataset name
     - dataset description
     - number of images in the dataset
     - number of questions in the dataset
     - number of answers in the dataset
     - path to the original archive of the dataset
     - path to the csv file of the dataset
     - path to the reference images of the dataset
     - path to the images of the dataset
    
    """
    
    def __init__(self, dataset: Dataset):
        self.dataset = dataset



    def generate_read_me(self, csv_file_path=None, reference_images_path=None, images_path=None):
        """Generate the content of the README file for the dataset.
        """
        read_me = f"# Dataset: {self.dataset.name}\n\n"
        read_me += f"## Description\n{self.dataset.description}\n\n"
        read_me += f"## Number of Images\n{self.dataset.image_count}\n\n"
        read_me += f"## Number of Questions\n{len(self.dataset.question_ids)}\n\n"
        read_me += f"## Number of Answers\n{self.dataset.answer_count}\n\n"
        read_me += f"## Original Archive Path\n{self.dataset.archival_path}\n\n"
        if csv_file_path:
            read_me += f"## CSV File Path\n{csv_file_path}\n\n"
        if reference_images_path:
            read_me += f"## Reference Images Path\n{reference_images_path}\n\n"
        if images_path:
            read_me += f"## Images Path\n{images_path}\n\n"
        read_me += "## Note\nThis dataset was generated using the Dataset Annotator application.\n"
        return read_me

    def save_read_me(self, file_path, csv_file_path=None, reference_images_path=None, images_path=None):
        read_me_content = self.generate_read_me(csv_file_path, reference_images_path, images_path)
        with open(file_path, "w") as f:
            f.write(read_me_content)
        