import { useState } from "react";
import { ApiApi } from "../../api/index.ts";
import { apiConfig } from "../../configuration";
import { useNotify } from "../Contexts/NotificationProvider";
import { getApiErrorMessage } from "../Utils/ApiErrors.ts";
import { Divider, Typography } from "antd";
import type { Dataset, Image, Question } from "../../api/index.ts";
import { DatasetDetailsForm } from "../Datasets/DatasetDetailsForm.tsx";
import { DatasetQuestionsPanel } from "../Datasets/DatasetQuestionsPanel.tsx";
import { DatasetImageUpload } from "../Datasets/DatasetImageUpload.tsx";
import { DatasetImageCarousel } from "../Images/DatasetImageViews.tsx";
import { AppSpacing } from "../Utils/Styles/AppStyles.tsx";

interface DatasetEditTabProps {
  dataset: Dataset;
  referenceImages: Image[];
  questions: Question[];
  onDatasetUpdated: () => void;
  onContentUpdated: () => void;
}

export const DatasetEditTab = ({
  dataset,
  referenceImages,
  questions,
  onDatasetUpdated,
  onContentUpdated,
}: DatasetEditTabProps) => {
  const [removingImageId, setRemovingImageId] = useState<number>();
  const notify = useNotify();

  const removeReferenceImage = async (image: Image) => {
    setRemovingImageId(image.id);
    try {
      await new ApiApi(apiConfig).apiImagesDestroy(image.id);
      onContentUpdated();
      notify.notify("Reference image removed", "The image was removed from the dataset.", "success");
    } catch (error) {
      notify.notify(
        "Reference image could not be removed",
        getApiErrorMessage(error, "Please try again."),
        "error",
      );
    } finally {
      setRemovingImageId(undefined);
    }
  };

  return (
    <div style={{ display: "grid", gap: AppSpacing.Large, width: "100%" }}>
      <section>
        <Typography.Title level={3}>Dataset details</Typography.Title>
        <DatasetDetailsForm
          key={dataset.id}
          dataset={dataset}
          submitLabel="Save changes"
          onSaved={onDatasetUpdated}
        />
      </section>
      <Divider />
      <section>
        <Typography.Title level={3}>Add image to dataset</Typography.Title>
        <DatasetImageUpload
          datasetId={dataset.id}
          onUploaded={() => {
            onContentUpdated();
            onDatasetUpdated();
          }}
        />
      </section>
      <Divider />
      <section>
        <Typography.Title level={3}>Reference images</Typography.Title>
        {referenceImages.length > 0 ? (
          <DatasetImageCarousel
            images={referenceImages}
            onRemove={removeReferenceImage}
            removingImageId={removingImageId}
          />
        ) : (
          <Typography.Text type="secondary">No reference images added</Typography.Text>
        )}
        <div style={{ marginTop: AppSpacing.Medium }}>
          <DatasetImageUpload
            datasetId={dataset.id}
            isReferenceImage
            onUploaded={onContentUpdated}
          />
        </div>
      </section>
      <Divider />
      <section>
        <DatasetQuestionsPanel
          datasetId={dataset.id}
          questions={questions}
          onCreated={onContentUpdated}
        />
      </section>
    </div>
  );
};