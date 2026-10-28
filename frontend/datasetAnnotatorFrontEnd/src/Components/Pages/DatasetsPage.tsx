import { Progress, Table, type TableColumnsType } from "antd";
import { useEffect } from "react";
import { useDatasets } from "../Hooks/useDatasets";
import { useNotify } from "../Contexts/NotificationProvider";

export const DatasetsPage = () => {
  const { datasets, loading, error } = useDatasets();
  const notify = useNotify();

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
      - number of questions 
      - annotation progression
      - number of pictures to annnotate
    - on click open dataset info page
    - breadcrumb
  */

  return (
    <div>
      <h1>Datasets</h1>
      <h2>Number of datasets: {datasets.length}</h2>
      <Table
        loading={loading}
        dataSource={datasets}
        rowKey="id"
        columns={columns}
         onRow={(record) => ({
        onClick: () => {
          window.location.href = `/dataset/${record.id}`;
        },
      })}

      />
    </div>
  );
};
