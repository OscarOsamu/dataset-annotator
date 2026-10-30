import { useState } from "react";
import { Button, Form, Input } from "antd";
import { ApiApi, type Dataset, type DatasetRequest } from "../../api";
import { apiConfig } from "../../configuration";
import { useNotify } from "../Contexts/NotificationProvider";
import { cacheDataset } from "../Hooks/DatasetCache";
import { isFormValidationError, getApiErrorMessage } from "../Utils/ApiErrors";

interface DatasetDetailsFormProps {
  dataset: Dataset;
  submitLabel: string;
  requireDescription?: boolean;
  onSaved: (values: DatasetRequest) => void;
}

export const DatasetDetailsForm = ({
  dataset,
  submitLabel,
  requireDescription = false,
  onSaved,
}: DatasetDetailsFormProps) => {
  const [form] = Form.useForm<DatasetRequest>();
  const [saving, setSaving] = useState(false);
  const notify = useNotify();

  const saveDetails = async (values: DatasetRequest) => {
    setSaving(true);
    try {
      const updatedValues = {
        name: values.name.trim(),
        description: values.description?.trim() ?? "",
      };
      await new ApiApi(apiConfig).apiDatasetsPartialUpdate(
        dataset.id,
        updatedValues,
      );
      cacheDataset({ ...dataset, ...updatedValues });
      onSaved(updatedValues);
      notify.notify("Dataset updated", "Your dataset details were saved.", "success");
    } catch (error) {
      if (isFormValidationError(error)) return;
      notify.notify(
        "Dataset could not be updated",
        getApiErrorMessage(error, "Please review the details and try again."),
        "error",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Form
      key={dataset.id}
      form={form}
      layout="vertical"
      initialValues={{
        name: dataset.name,
        description: dataset.description ?? "",
      }}
      onFinish={saveDetails}
      requiredMark="optional"
    >
      <Form.Item
        label="Dataset name"
        name="name"
        rules={[{ required: true, whitespace: true, message: "Enter a dataset name." }]}
      >
        <Input maxLength={100} />
      </Form.Item>
      <Form.Item
        label="Description"
        name="description"
        rules={
          requireDescription
            ? [{ required: true, whitespace: true, message: "Add a description to continue." }]
            : undefined
        }
      >
        <Input.TextArea
          autoSize={{ minRows: 3, maxRows: 7 }}
          maxLength={2000}
          placeholder="Describe the images and what you want to annotate"
        />
      </Form.Item>
      <Button type="primary" htmlType="submit" loading={saving}>
        {submitLabel}
      </Button>
    </Form>
  );
};