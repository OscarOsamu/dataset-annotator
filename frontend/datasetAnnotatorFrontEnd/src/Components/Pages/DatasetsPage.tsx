import { Table, type TableColumnsType } from "antd";
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
  ];

  return (
    <div>
      <h1>Datasets</h1>
      <h2>Number of datasets: {datasets.length}</h2>
      <Table
        loading={loading}
        dataSource={datasets}
        rowKey="id"
        columns={columns}
      />
    </div>
  );
};
