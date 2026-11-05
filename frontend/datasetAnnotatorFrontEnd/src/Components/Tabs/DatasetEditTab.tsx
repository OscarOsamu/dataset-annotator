import { Divider, Typography } from "antd";
import type { Dataset, Image, Question } from "../../api/index.ts";
import { DatasetDetailsForm } from "../Datasets/DatasetDetailsForm.tsx";
import { DatasetQuestionsPanel } from "../Datasets/DatasetQuestionsPanel.tsx";
import { ReferenceImageUpload } from "../Datasets/ReferenceImageUpload.tsx";
import { DatasetImageCarousel } from "../Images/DatasetImageViews.tsx";
import { AppSpacing } from "../Utils/AppStyles.tsx";

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
        <Typography.Title level={3}>Reference images</Typography.Title>
        {referenceImages.length > 0 ? (
          <DatasetImageCarousel images={referenceImages} />
        ) : (
          <Typography.Text type="secondary">No reference images added</Typography.Text>
        )}
        <div style={{ marginTop: AppSpacing.Medium }}>
          <ReferenceImageUpload
            datasetId={dataset.id}
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