import { useEffect } from "react";
import { Button, Empty, Popconfirm, Space, Spin, Tabs } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import { ApiApi } from "../../api";
import { apiConfig } from "../../configuration";
import { useDatasetInfos } from "../Hooks/useDatasetInfos";
import { useNotify } from "../Contexts/NotificationProvider";
import { DatasetImageMasonry } from "../Images/DatasetImageViews";
import { ResumeAnnotationButton } from "../Buttons/ResumeAnnotationButton";
import { DatasetEditTab } from "../Tabs/DatasetEditTab";
import { useDatasetContent } from "../Hooks/useDatasetContent";
import AppBreadcrumb from "../AppBreadcrumbs";
import { DatasetDownloadTab } from "../Tabs/DatasetDownloadTab";
import { getApiErrorMessage } from "../Utils/ApiErrors.ts";
import { DatasetInformationTab } from "../Tabs/DatasetInformationTab.tsx";

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
    goToPreviousPage,
    goToNextPage,
    loading: contentLoading,
    error: contentError,
    reload: reloadContent,
  } = useDatasetContent(datasetInfos?.id);

  const notify = useNotify();
  const navigate = useNavigate();

  useEffect(() => {
    if (datasetError) {
      notify.notify(
        "Dataset could not be loaded",
        "Please try again.",
        "error",
      );
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
  if (!datasetInfos)
    return <Empty description="This dataset could not be found" />;

  const deleteDataset = async () => {
    try {
      await new ApiApi(apiConfig).apiDatasetsDestroy(datasetInfos.id);
      notify.notify(
        "Dataset deleted",
        "The dataset and its stored files were removed.",
        "success",
      );
      navigate("/datasets");
    } catch (error) {
      notify.notify(
        "Dataset could not be deleted",
        getApiErrorMessage(error, "Please try again."),
        "error",
      );
    }
  };

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

  const contentFallback = contentLoading ? (
    <Spin />
  ) : (
    <Empty description="Dataset preview is unavailable" />
  );

  const cachedQuestionCount = Array.isArray(datasetInfos.question_ids)
    ? datasetInfos.question_ids.length
    : questions.length;

  return (
    <>
      <AppBreadcrumb />
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <h1>{datasetInfos.name}</h1>
        <Space wrap>
          <ResumeAnnotationButton datasetId={datasetInfos.id} />
          <Popconfirm
            title={`Delete ${datasetInfos.name}?`}
            description="This permanently removes the dataset, annotations, images, and original archive."
            okText="Delete dataset"
            okButtonProps={{ danger: true }}
            onConfirm={deleteDataset}
          >
            <Button danger icon={<DeleteOutlined />}>
              Delete dataset
            </Button>
          </Popconfirm>
        </Space>
      </div>
      <Tabs
        items={[
          {
            key: "information",
            label: "Information",
            children: (
              <DatasetInformationTab
                datasetInfos={datasetInfos}
                contentLoading={contentLoading}
                questions={questions}
                referenceImages={referenceImages}
                cachedQuestionCount={cachedQuestionCount}
                contentError={contentError}
                contentFallback={contentFallback}
              />
            ),
          },
          {
            key: "images",
            label: "Images",
            children:
              contentLoading || contentError ? (
                contentFallback
              ) : (
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
          {
            key: "download",
            label: "Download",
            children: (
              <DatasetDownloadTab
                id={datasetInfos.id}
                datasetName={datasetInfos.name}
              />
            ),
          },
        ]}
      />
    </>
  );
};
