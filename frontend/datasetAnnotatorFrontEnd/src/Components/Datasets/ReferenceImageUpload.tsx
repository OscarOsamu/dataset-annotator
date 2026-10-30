import { useState } from "react";
import { Button, Space, Upload, Typography } from "antd";
import type { UploadFile } from "antd";
import { ApiApi } from "../../api";
import { apiConfig } from "../../configuration";
import { useNotify } from "../Contexts/NotificationProvider";
import { getApiErrorMessage } from "../Utils/ApiErrors.ts";

interface ReferenceImageUploadProps {
  datasetId: number;
  onUploaded: () => void;
}

export const ReferenceImageUpload = ({
  datasetId,
  onUploaded,
}: ReferenceImageUploadProps) => {
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const notify = useNotify();
  const selectedFile = fileList[0]?.originFileObj;

  const uploadReferenceImage = async () => {
    if (!selectedFile) return;
    setUploading(true);
    try {
      await new ApiApi(apiConfig).apiImagesCreate(
        datasetId,
        selectedFile as File,
        true,
      );
      setFileList([]);
      onUploaded();
      notify.notify("Reference image added", "It is now available in the dataset carousel.", "success");
    } catch (error) {
      notify.notify(
        "Reference image could not be added",
        getApiErrorMessage(error, "Choose a valid image and try again."),
        "error",
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <Space direction="vertical" size="middle">
      <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
        Reference images appear in the dataset carousel and are not included in annotation progress.
      </Typography.Paragraph>
      <Space wrap>
        <Upload
          accept=".avif,.bmp,.gif,.jpeg,.jpg,.png,.tif,.tiff,.webp"
          maxCount={1}
          beforeUpload={() => false}
          fileList={fileList}
          onChange={({ fileList: nextFileList }) => setFileList(nextFileList)}
          disabled={uploading}
        >
          <Button>Choose image</Button>
        </Upload>
        <Button
          type="primary"
          onClick={uploadReferenceImage}
          disabled={!selectedFile}
          loading={uploading}
        >
          Add reference image
        </Button>
      </Space>
    </Space>
  );
};