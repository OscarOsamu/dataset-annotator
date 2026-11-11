import { Progress } from "antd";
import { QuestionsStatsGraphs } from "../Graphs/QuestionsStatsGraphs";
import { DatasetImageCarousel } from "../Images/DatasetImageViews";
import {
  LeftColumn,
  RightColumn,
  TwoColumnLayout,
} from "../Utils/Styles/StyledComponents";
import TwoColumnPageTemplate from "../Pages/Templates/TwoColumnPageTemplate";
import type { Dataset, Image, Question } from "../../api";

interface datasetInformationTabProps {
  datasetInfos: Dataset | null;
  contentLoading: boolean;
  referenceImages: Image[];
  questions: Question[];
  cachedQuestionCount: number;
  contentError: unknown;
  contentFallback: React.ReactNode;
}

export const DatasetInformationTab = ({
  datasetInfos,
  contentLoading,
  questions,
  referenceImages,
  cachedQuestionCount,
  contentError,
  contentFallback,
}: datasetInformationTabProps) => {
  if (!datasetInfos) return null;

  return (
    <TwoColumnPageTemplate
      leftChild={
        <>
          <TwoColumnLayout>
            <LeftColumn>
              <p>Description: {datasetInfos.description}</p>
              <p>Number of images: {datasetInfos.image_count}</p>
              <p>
                Number of questions:{" "}
                {contentLoading ? cachedQuestionCount : questions.length}
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
          {contentLoading || contentError
            ? contentFallback
            : referenceImages.length > 0 && (
                <DatasetImageCarousel images={referenceImages} />
              )}
        </>
      }
      rightChild={<QuestionsStatsGraphs questions={questions} />}
    />
  );
};
