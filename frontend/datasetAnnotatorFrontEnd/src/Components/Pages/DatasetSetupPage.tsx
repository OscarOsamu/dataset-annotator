import { useEffect, useState } from "react";
import { Button, Empty, Space, Spin, Typography } from "antd";
import { useParams } from "react-router-dom";
import { type DatasetRequest } from "../../api";
import { useDatasetInfos } from "../Hooks/useDatasetInfos";
import { useDatasetContent } from "../Hooks/useDatasetContent";
import { useNotify } from "../Contexts/NotificationProvider";
import { DatasetImageCarousel } from "../Images/DatasetImageViews";
import { DatasetDetailsForm } from "../Datasets/DatasetDetailsForm";
import { DatasetQuestionsPanel } from "../Datasets/DatasetQuestionsPanel";
import { DatasetSummary, SetupPage, SetupSection } from "../Utils/Styles/DatasetSetupStyles";
import AppBreadcrumb from "../AppBreadcrumbs";

export const DatasetSetupPage = () => {
  const { id } = useParams();
  const datasetId = Number(id);
  const {
    datasetInfos,
    loading,
    error: datasetError,
    reload: reloadDataset,
  } = useDatasetInfos(datasetId);
  const {
    images,
    questions,
    loading: contentLoading,
    error: contentError,
    reload: reloadContent,
  } = useDatasetContent(datasetInfos?.id);
  const [savedDescription, setSavedDescription] = useState<{
    datasetId: number;
    value: string;
  }>();
  const notify = useNotify();

  useEffect(() => {
    if (datasetError) {
      notify.notify("Dataset could not be loaded", "Please try again.", "error");
    }
  }, [datasetError, notify]);

  useEffect(() => {
    if (contentError) {
      notify.notify(
        "Dataset preview could not be loaded",
        "Images and questions are unavailable.",
        "error",
      );
    }
  }, [contentError, notify]);

  if (loading) return <Spin />;
  if (!datasetInfos) return <Empty description="This dataset could not be found" />;

  return (
    <SetupPage>
      <AppBreadcrumb/>
      <Typography.Title level={1}>Set up {datasetInfos.name}</Typography.Title>
      <Typography.Paragraph type="secondary">
        Add context for this dataset, review the uploaded images, and prepare annotation questions.
      </Typography.Paragraph>

      <DatasetSummary>
        <div>
          <Typography.Text type="secondary">Images uploaded</Typography.Text>
          <Typography.Title level={2} style={{ margin: 0 }}>
            {datasetInfos.image_count}
          </Typography.Title>
        </div>
        <div style={{ flex: "1 1 420px", minWidth: 0 }}>
          <DatasetDetailsForm
            key={datasetInfos.id}
            dataset={datasetInfos}
            requireDescription
            submitLabel="Save description and continue"
            onSaved={(values: DatasetRequest) => {
              setSavedDescription({
                datasetId: datasetInfos.id,
                value: values.description ?? "",
              });
              reloadDataset();
            }}
          />
        </div>
      </DatasetSummary>

      
        <>
          <SetupSection>
            <Typography.Title level={2}>Image preview</Typography.Title>
            {contentLoading ? (
              <Spin />
            ) : contentError ? (
              <Space>
                <Empty description="Image preview is unavailable" />
                <Button onClick={reloadContent}>Retry</Button>
              </Space>
            ) : (
              <DatasetImageCarousel
                images={images}
                emptyDescription="No images were uploaded"
              />
            )}
          </SetupSection>
          <SetupSection>
            <DatasetQuestionsPanel
              datasetId={datasetInfos.id}
              questions={questions}
              onCreated={reloadContent}
            />
          </SetupSection>
        </>
      
      <Button>
        <a href={`/dataset/${datasetInfos.id}`}>Finish Dataset Setup</a>
      </Button>
    </SetupPage>
  );
};