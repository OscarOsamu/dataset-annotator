import { useEffect, useState } from "react";
import { useDatasetInfos } from "../Hooks/useDatasetInfos";
import { Progress, Tabs } from "antd";
import { ApiApi, type Answer, type Image, type Question } from "../../api";
import { apiConfig } from "../../configuration";
import { QuestionsStatsGraphs } from "../Graphs/QuestionsStatsGraphs";
import { useNotify } from "../Contexts/NotificationProvider";
import TwoColumnPageTemplate from "./Templates/TwoColumnPageTemplate";
import {
  DatasetImageCarousel,
  DatasetImageMasonry,
} from "../Images/DatasetImageViews";
import {
  LeftColumn,
  RightColumn,
  TwoColumnLayout,
} from "../Utils/StyledComponents";

export const DatasetInfoPage = () => {
  const id = window.location.pathname.split("/").pop();
  const { datasetInfos, loading } = useDatasetInfos(Number(id));
  const [questions, setQuestions] = useState<Question[]>([]);
  const [images, setImages] = useState<Image[]>([]);
  const [referenceImages, setReferenceImages] = useState<Image[]>([]);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const notify = useNotify();

  useEffect(() => {
    if (!datasetInfos) return;

    let isCurrent = true;
    const api = new ApiApi(apiConfig);
    Promise.all([
      api.apiQuestionsList(),
      api.apiImagesList(),
      api.apiAnswersList(),
    ])
      .then(([questionResponse, imageResponse, answerResponse]) => {
        if (isCurrent) {
          setQuestions(questionResponse.data.filter(
            (question) => question.dataset === datasetInfos.id,
          ));
          const datasetImages = imageResponse.data.filter(
            (image) => image.dataset === datasetInfos.id,
          );
          setImages(
            datasetImages.filter((image) => !image.is_reference_image),
          );
          setReferenceImages(
            datasetImages.filter((image) => image.is_reference_image),
          );
          setAnswers(answerResponse.data.filter(
            (answer) => answer.dataset === datasetInfos.id,
          ));
        }
      })
      .catch(() => {
        if (isCurrent) {
          notify.notify(
            "Error loading dataset content",
            "Dataset images, questions, or answers could not be loaded.",
            "error",
          );
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [datasetInfos, notify]);

  if (loading || !datasetInfos) return <div>Loading...</div>;

  return (
    <>
      <h1>Dataset name: {datasetInfos.name}</h1>
      <Tabs
        items={[
          {
            key: "information",
            label: "Information",
            children: (
              <>
                <TwoColumnPageTemplate
                  leftChild={
                    <>
                    <TwoColumnLayout>
                      <LeftColumn>
                        <p>Description: {datasetInfos.description}</p>
                        <p>Number of images: {datasetInfos.image_count}</p>
                        <p>
                          Number of questions: {questions.length}
                        </p>
                      </LeftColumn>
                      <RightColumn>
                        <div style={{ justifyContent: "center" }}>
                          <p>Annotation progress:</p>
                          <Progress
                            type="circle"
                            percent={Number(datasetInfos.annotation_progress)}
                          />
                        </div>
                      </RightColumn>
                    </TwoColumnLayout> 
                    <DatasetImageCarousel
                      images={referenceImages}
                    />
                    </>
                  }
                  rightChild={<QuestionsStatsGraphs questions={questions} />}
                />
               
              </>
            ),
          },
          {
            key: "stats",
            label: "Stats",
            children: <QuestionsStatsGraphs questions={questions} />,
          },
          {
            key: "images",
            label: "Images",
            children: (
              <DatasetImageMasonry
                images={images}
                questions={questions}
                answers={answers}
              />
            ),
          },
        ]}
      />
    </>
  );
};
