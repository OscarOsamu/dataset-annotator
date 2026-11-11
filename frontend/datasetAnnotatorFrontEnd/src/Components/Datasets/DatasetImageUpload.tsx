import { useState } from "react";
import { Button, Space, Typography, Upload } from "antd";
import type { UploadFile } from "antd";
import { ApiApi } from "../../api";
import { apiConfig } from "../../configuration";
import { useNotify } from "../Contexts/NotificationProvider";
import { getApiErrorMessage } from "../Utils/ApiErrors.ts";

interface DatasetImageUploadProps {
  datasetId: number;
  onUploaded: () => void;
  isReferenceImage?: boolean;
}

export const DatasetImageUpload = ({
  datasetId,
  onUploaded,
  isReferenceImage = false,
}: DatasetImageUploadProps) => {
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const notify = useNotify();
  const selectedFile = fileList[0]?.originFileObj;
  const imageLabel = isReferenceImage ? "reference image" : "image";

  const uploadImage = async () => {
    if (!selectedFile) return;
    setUploading(true);
    try {
      await new ApiApi(apiConfig).apiImagesCreate(
        datasetId,
        selectedFile as File,
        isReferenceImage,
      );
      setFileList([]);
      onUploaded();
      notify.notify(
        `${isReferenceImage ? "Reference image" : "Image"} added`,
        isReferenceImage
          ? "It is now available in the dataset carousel."
          : "It is now included in the dataset images.",
        "success",
      );
    } catch (error) {
      notify.notify(
        `${isReferenceImage ? "Reference image" : "Image"} could not be added`,
        getApiErrorMessage(error, "Choose a valid image and try again."),
        "error",
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <Space direction="vertical" size="middle">
      {isReferenceImage && (
        <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
          Reference images appear in the dataset carousel and are not included in annotation progress.
        </Typography.Paragraph>
      )}
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
          onClick={uploadImage}
          disabled={!selectedFile}
          loading={uploading}
        >
          Add {imageLabel}
        </Button>
      </Space>
    </Space>
  );
};