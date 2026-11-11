# dataset-annotator

An app allowing you to annotate your image datasets for CNN training

## Description

Annotating dataset by hand is cumbersome and time consuming. You have to open every image to check label and usually use folder to separate them.
This app offers to allow you to create several "questions" on your datasets thats are either number input or MCQ.
Let's say you have a dataset of cats and dogs and you want your CNN to give you the number of cats or dogs on a given picture. 
You can create questions asking for how many animals are there on the picture and if any, which kind ?.

Entry data would be an archive or a folder of images, on top of it you can add references images, and the output would be csv, with the possibility to re-download your data (in case you add more images)(TBD)

Your data is stored locally on your computer so there is no security nor confidentiallity concern. 
However if you do decide to deploy it on serveur, you are responsible for those matter and I shall not be concerned by any security concern of breach that might arise. This is a personnal project, not mean to face external threat but to stay locally on personnal computer.

## Getting Started

### Run with Docker 

It is recommanded to run the app with docker installed on your computer. However, if you don't want to do skip this part and go to the instruction to run the app without it.

```bash
docker compose build
docker compose up
```

The app will be exposed at [localhost:5173](http://localhost:5173/) while you can find the API of the backend at http://127.0.0.1:8000/swagger/

### Backend

Setup

```bash

cd backend

source venv/bin/activate #activate virtual env

cd datasetAnnotator/

pip install -r requirements.txt #install dependencies

```

Migrations

```bash
python manage.py makemigrations #create migration

python manage.py migrate #apply migrations

python manage.py showmigrations # see migrations
```

Test 
```bash
python manage.py test
```

Start 

```bash
python manage.py runserver
```

### Frontend

```bash 

cd frontend/datasetAnnotatorFrontEnd

npm run dev #developement mode
```
