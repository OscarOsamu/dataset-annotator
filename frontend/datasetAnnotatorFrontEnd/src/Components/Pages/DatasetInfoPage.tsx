import { useEffect } from "react";
import { Empty, Progress, Spin, Tabs } from "antd";
import { useParams } from "react-router-dom";
import { useDatasetInfos } from "../Hooks/useDatasetInfos";
import { useNotify } from "../Contexts/NotificationProvider";
import { QuestionsStatsGraphs } from "../Graphs/QuestionsStatsGraphs";
import {
  DatasetImageCarousel,
  DatasetImageMasonry,
} from "../Images/DatasetImageViews";
import { ResumeAnnotationButton } from "../Buttons/ResumeAnnotationButton";
import {
  LeftColumn,
  RightColumn,
  TwoColumnLayout,
} from "../Utils/StyledComponents";
import TwoColumnPageTemplate from "./Templates/TwoColumnPageTemplate";
import { DatasetEditTab } from "./DatasetEditTab";
import { useDatasetContent } from "../Hooks/useDatasetContent";

export const DatasetInfoPage = () => {
  const { id } = useParams();
  const {
    datasetInfos,
    loading,
    error: datasetError,
    reload: reloadDataset,
  } = useDatasetInfos(Number(id));
  const {
    images,
    referenceImages,
    questions,
    answers,
    totalImages,
    pageNumber,
    pageSize,
    canGoToPreviousPage,
    canGoToNextPage,
    goToPreviousPage,
    goToNextPage,
    loading: contentLoading,
    error: contentError,
    reload: reloadContent,
  } = useDatasetContent(datasetInfos?.id);
  const notify = useNotify();

  useEffect(() => {
    if (datasetError) {
      notify.notify("Dataset could not be loaded", "Please try again.", "error");
    }
  }, [datasetError, notify]);

  useEffect(() => {
    if (contentError) {
      notify.notify(
        "Dataset content could not be loaded",
        "Images, questions, or answers are unavailable.",
        "error",
      );
    }
  }, [contentError, notify]);

  if (loading) return <Spin />;
  if (!datasetInfos) return <Empty description="This dataset could not be found" />;

  const handlePageChange = (nextPage: number) => {
    if (nextPage === pageNumber) return;

    if (nextPage > pageNumber) {
      for (let page = pageNumber; page < nextPage; page += 1) {
        goToNextPage();
      }
      return;
    }

    for (let page = pageNumber; page > nextPage; page -= 1) {
      goToPreviousPage();
    }
  };

  const contentFallback = contentLoading
    ? <Spin />
    : <Empty description="Dataset preview is unavailable" />;
  const cachedQuestionCount = Array.isArray(datasetInfos.question_ids)
    ? datasetInfos.question_ids.length
    : questions.length;

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <h1>{datasetInfos.name}</h1>
        <ResumeAnnotationButton datasetId={datasetInfos.id} />
      </div>
      <Tabs
        items={[
          {
            key: "information",
            label: "Information",
            children: (
              <TwoColumnPageTemplate
                leftChild={
                  <>
                    <TwoColumnLayout>
                      <LeftColumn>
                        <p>Description: {datasetInfos.description}</p>
                        <p>Number of images: {datasetInfos.image_count}</p>
                        <p>Number of questions: {contentLoading ? cachedQuestionCount : questions.length}</p>
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
            children: contentLoading || contentError
              ? contentFallback
              : (
                <DatasetImageMasonry
                  images={images}
                  questions={questions}
                  answers={answers}
                  currentPage={pageNumber}
                  pageSize={pageSize}
                  totalImages={totalImages}
                  onPageChange={handlePageChange}
                />
              ),
          },
          {
            key: "edit",
            label: "Edit",
            children: (
              <DatasetEditTab
                dataset={datasetInfos}
                referenceImages={referenceImages}
                questions={questions}
                onDatasetUpdated={reloadDataset}
                onContentUpdated={reloadContent}
              />
            ),
          },
        ]}
      />
    </>
  );
};
