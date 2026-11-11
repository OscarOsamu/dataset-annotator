import React from "react";

import TwoColumnPageTemplate from "./Templates/TwoColumnPageTemplate";
import { Button, Typography } from "antd";
import { useNavigate } from "react-router-dom";
import { DatasetUploadAction } from "../Datasets/DatasetUploadAction";
import { AppSpacing } from "../Utils/Styles/AppStyles";

const WelcomePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <TwoColumnPageTemplate
      title="Welcome"
      leftChild={
        <div style={{ display: "grid", gap: AppSpacing.Medium }}>
          <Typography.Title level={2} style={{ margin: 0 }}>
            Start with a dataset
          </Typography.Title>
          <Typography.Paragraph>
            Upload images, add a description, and prepare questions for annotation.
          </Typography.Paragraph>
          <DatasetUploadAction />
        </div>
      }
      rightChild={
        <div style={{ display: "grid", gap: AppSpacing.Medium }}>
          <Typography.Title level={2} style={{ margin: 0 }}>
            Your datasets
          </Typography.Title>
          <Typography.Paragraph>
            Browse existing datasets and continue annotation.
          </Typography.Paragraph>
          <Button onClick={() => navigate("/datasets")}>
            View datasets
          </Button>
        </div>
      }
    />
  );
};

export default WelcomePage;
