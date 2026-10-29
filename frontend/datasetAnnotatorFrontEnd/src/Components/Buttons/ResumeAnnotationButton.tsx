import { Button } from "antd";
import { useNavigate } from "react-router-dom";

interface ResumeAnnotationButtonProps {
  datasetId: number;
}

export const ResumeAnnotationButton = ({
  datasetId,
}: ResumeAnnotationButtonProps) => {
  const navigate = useNavigate();

  return (
    <Button
      type="primary"
      onClick={() => navigate(`/dataset/${datasetId}/annotate`)}
    >
      Resume annotation
    </Button>
  );
};