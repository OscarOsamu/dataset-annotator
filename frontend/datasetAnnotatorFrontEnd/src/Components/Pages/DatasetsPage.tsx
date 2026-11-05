import { Progress, Table, type TableColumnsType } from "antd";
import { useEffect } from "react";
import { useDatasets } from "../Hooks/useDatasets";
import { useNotify } from "../Contexts/NotificationProvider";
import { DatasetUploadAction } from "../Datasets/DatasetUploadAction";
import { Space } from "antd";
import { useNavigate } from "react-router-dom";
import AppBreadcrumb from "../AppBreadcrumbs";

export const DatasetsPage = () => {
  const { datasets, loading, error } = useDatasets();
  const notify = useNotify();
  const navigate = useNavigate();

  useEffect(() => {
    if (error) {
      notify.notify("Error loading Datasets", "Error", "error");
      console.error("Error fetching Datasets:", error);
    }
  }, [error, notify]);

  const columns: TableColumnsType = [
    {
      title: "Dataset Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Number of pictures",
      dataIndex: "image_count",
      key: "image_count",
    },
    {
      title: "Number of questions",
      key: "question_count",
      render: (_, dataset) => dataset.question_ids.length,
    },
    {
      title: "Annotation progress",
      dataIndex: "annotation_progress",
      key: "annotation_progress",
      render: (progress: string) => <Progress percent={Number(progress)} />,
    },
  ];
  /* TODO :
    - add columns :
      - resume annotation
  */

  return (
    <div>
      <AppBreadcrumb />
      <Space style={{ width: "100%", justifyContent: "space-between" }} wrap>
        <h1>Datasets</h1>
        <DatasetUploadAction />
      </Space>
      <h2>Number of datasets: {datasets.length}</h2>
      <Table
        loading={loading}
        dataSource={datasets}
        rowKey="id"
        columns={columns}
        onRow={(record) => ({
          onClick: () => {
            navigate(`/dataset/${record.id}`);
          },
        })}
      />
    </div>
  );
};
