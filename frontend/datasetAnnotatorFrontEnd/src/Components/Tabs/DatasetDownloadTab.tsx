import { useState } from "react";
import { Button } from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import styled from "styled-components";
import { ApiApi } from "../../api";
import { apiConfig } from "../../configuration";
import { useNotify } from "../Contexts/NotificationProvider";
import { getApiErrorMessage } from "../Utils/ApiErrors";

interface DatasetDownloadTabProps {
  id: number;
  datasetName?: string;
}

const ThreeColDiv = styled.div`
    display: flex;
    gap: 20px;
    margin-top: 20px;
    align-items: stretch;

    @media (max-width: 900px) {
        flex-direction: column;
    }
`;

const ColumnDiv = styled.div`
    flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
`;

type AllowedFormat = "original" | "csv" | "zip";


export const DatasetDownloadTab = ({ id, datasetName }: DatasetDownloadTabProps) => {
  const [downloading, setDownloading] = useState(false);
  const notify = useNotify();


  const getFilename = (format:  AllowedFormat, id : number,  datasetName? : string ) : string => {
    switch (format) {
      case "csv":
        return `dataset-${id}-${datasetName}.csv`;
      case "original":
        return `dataset-${id}-${datasetName}-original.zip`
      case "zip":
        return `dataset-${id}-${datasetName}-archive.zip`
      default :
      return "";
    }
  }

  const downloadDatasetFile = async (format: AllowedFormat ) => {
    setDownloading(true);
    try {
      const api = new ApiApi(apiConfig);
      
      const response = format === "original"
        ? await api.apiDatasetsGetOriginalArchiveRetrieve(id, { responseType: "blob" })
        : format === "csv"
          ? await api.apiDatasetsGenerateCsvRetrieve(id, { responseType: "blob" })
          : await api.apiDatasetsGetArchiveWithResultsRetrieve(id, { responseType: "blob" });

      
      const fallbackFilename = getFilename(format, id, datasetName);

      const contentDisposition = response.headers["content-disposition"] as string | undefined;
      const filename = contentDisposition?.match(/filename="?([^";]+)"?/i)?.[1]
        ?? fallbackFilename;

      const objectUrl = URL.createObjectURL(response.data as Blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(objectUrl);
    } catch (error) {
      notify.notify(
        "Dataset download failed",
        getApiErrorMessage(error, "Please try downloading the file again."),
        "error",
      );
    } finally {
      setDownloading(false);
    }
  };

  return (
    <>
    <span style={{ fontSize: "16px", fontWeight: "bold" }}>
      Download Dataset in three differents formats : 
    </span>
    <ThreeColDiv>

      <ColumnDiv>
        <Button
          type="primary"
          icon={<DownloadOutlined />}
          loading={downloading}
          onClick={() => downloadDatasetFile("original")}
        >
          Download Original Dataset
        </Button>
      </ColumnDiv>
      <ColumnDiv>
        <Button
          type="primary"
          icon={<DownloadOutlined />}
          loading={downloading}
          onClick={() => downloadDatasetFile("csv")}
        >
          Download CSV File
        </Button>
      </ColumnDiv>
      <ColumnDiv>
        <Button
          type="primary"
          icon={<DownloadOutlined />}
          loading={downloading}
          onClick={() => downloadDatasetFile("zip")}
        >
          Download ZIP Archive
        </Button>
      </ColumnDiv></ThreeColDiv>
    </>
  );
};
