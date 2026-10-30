import { useState } from "react";
import { Button, Form, Input, Modal, Upload, Typography } from "antd";
import type { UploadFile } from "antd";
import { useNavigate } from "react-router-dom";
import { ApiApi } from "../../api";
import { apiConfig } from "../../configuration";
import { useNotify } from "../Contexts/NotificationProvider";
import { getApiErrorMessage, isFormValidationError } from "../Utils/ApiErrors";
import { invalidateDatasets } from "../Hooks/DatasetCache";

interface DatasetUploadActionProps {
  buttonLabel?: string;
}

interface DatasetNameForm {
  name: string;
}

export const DatasetUploadAction = ({
  buttonLabel = "Add dataset",
}: DatasetUploadActionProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [form] = Form.useForm<DatasetNameForm>();
  const navigate = useNavigate();
  const notify = useNotify();

  const closeModal = () => {
    setIsOpen(false);
    setFiles([]);
    form.resetFields();
  };

  const uploadDataset = async () => {
    try {
      const { name } = await form.validateFields();
      const uploadedFiles = files
        .map((file) => file.originFileObj)
        .filter((file): file is NonNullable<typeof file> => Boolean(file));

      if (uploadedFiles.length === 0) {
        notify.notify("Choose dataset files", "Select images or one archive to continue.", "error");
        return;
      }

      setIsUploading(true);
      const api = new ApiApi(apiConfig);
      const response = await api.apiDatasetsUploadCreate(
        name.trim(),
        uploadedFiles as File[],
      );
      invalidateDatasets();
      closeModal();
      notify.notify("Dataset uploaded", response.data.message, "success");
      navigate(`/dataset/${response.data.id}/setup`);
    } catch (error) {
      if (isFormValidationError(error)) return;
      notify.notify(
        "Dataset upload failed",
        getApiErrorMessage(error, "Please check the dataset files and try again."),
        "error",
      );
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      <Button type="primary" onClick={() => setIsOpen(true)}>
        {buttonLabel}
      </Button>
      <Modal
        title="Add a dataset"
        open={isOpen}
        onCancel={closeModal}
        onOk={uploadDataset}
        okText="Upload"
        confirmLoading={isUploading}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" requiredMark="optional">
          <Form.Item
            label="Dataset name"
            name="name"
            rules={[{ required: true, whitespace: true, message: "Enter a dataset name." }]}
          >
            <Input maxLength={100} placeholder="For example, garden birds" />
          </Form.Item>
          <Form.Item label="Images or archive" required>
            <Upload.Dragger
              accept=".avif,.bmp,.gif,.jpeg,.jpg,.png,.tif,.tiff,.webp,.zip,.tar,.gz"
              multiple
              beforeUpload={() => false}
              fileList={files}
              onChange={({ fileList }) => setFiles(fileList)}
              disabled={isUploading}
            >
              <Typography.Text strong>Choose images or drop files here</Typography.Text>
              <br />
              <Typography.Text type="secondary">
                Upload image files together or select one ZIP/TAR archive.
              </Typography.Text>
            </Upload.Dragger>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};