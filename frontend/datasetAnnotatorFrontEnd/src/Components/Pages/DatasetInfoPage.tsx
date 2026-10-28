import { useEffect, useState } from "react";
import { useDatasetInfos } from "../Hooks/useDatasetInfos";
import { Progress, Tabs } from "antd";
import { ApiApi, type Question } from "../../api";
import { apiConfig } from "../../configuration";
import { QuestionsStatsGraphs } from "../Graphs/QuestionsStatsGraphs";
import { useNotify } from "../Contexts/NotificationProvider";
import TwoColumnPageTemplate from "./Templates/TwoColumnPageTemplate";
import {
  LeftColumn,
  RightColumn,
  TwoColumnLayout,
} from "../Utils/StyledComponents";

export const DatasetInfoPage = () => {
  const id = window.location.pathname.split("/").pop();
  const { datasetInfos, loading } = useDatasetInfos(Number(id));
  const [questions, setQuestions] = useState<Question[]>([]);
  const notify = useNotify();

  useEffect(() => {
    if (!datasetInfos) return;

    let isCurrent = true;
    new ApiApi(apiConfig)
      .apiQuestionsList()
      .then(({ data }) => {
        if (isCurrent) {
          setQuestions(
            data.filter((question) => question.dataset === datasetInfos.id),
          );
        }
      })
      .catch(() => {
        if (isCurrent) {
          notify.notify(
            "Error loading dataset questions",
            "Dataset questions could not be loaded.",
            "error",
          );
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [datasetInfos, notify]);

  if (loading || !datasetInfos) return <div>Loading...</div>;

  return datasetInfos === null ? (
    <div>Loading...</div>
  ) : (
    <>
    <h1>Dataset name : {datasetInfos.name}</h1>
    <Tabs
      items={[
        {
          key: "1",
          label: "Informations",
          children: (
            <TwoColumnPageTemplate
              leftChild=<>
                <TwoColumnLayout>
                  <LeftColumn>
                    <p>Description : {datasetInfos.description}</p>
                    <p>Number of images : {datasetInfos.image_count}</p>
                    <p>
                      Number of questions : {datasetInfos.question_ids.length}
                    </p>
                  </LeftColumn>
                  <RightColumn >
                    <div style={{justifyContent:"center"}}>
                    <p>Annotation progess :</p>
                    <Progress
                      type="circle"
                      percent={Number(datasetInfos.annotation_progress)}
                    /></div>
                  </RightColumn>
                </TwoColumnLayout>
              </>
              rightChild=<QuestionsStatsGraphs questions={questions} />
            />
          ),
        },
        {
          key: "2",
          label: "Stats",
          children: <QuestionsStatsGraphs questions={questions} />,
        },
      ]}
    /></>
  );
};
