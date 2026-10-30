import { useState } from "react";
import { Button, Empty, List, Space, Typography } from "antd";
import type { Question } from "../../api";
import { AppSpacing } from "../Utils/AppStyles.tsx";
import { QuestionCreateModal } from "./QuestionCreateModal";

interface DatasetQuestionsPanelProps {
  datasetId: number;
  questions: Question[];
  onCreated: () => void;
}

export const DatasetQuestionsPanel = ({
  datasetId,
  questions,
  onCreated,
}: DatasetQuestionsPanelProps) => {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <Space
        style={{ width: "100%", justifyContent: "space-between", marginBottom: AppSpacing.Medium }}
        wrap
      >
        <div>
          <Typography.Title level={3} style={{ marginBottom: 0 }}>
            Questions
          </Typography.Title>
          <Typography.Text type="secondary">
            {questions.length} question{questions.length === 1 ? "" : "s"}
          </Typography.Text>
        </div>
        <Button type="primary" onClick={() => setModalOpen(true)}>
          Add question
        </Button>
      </Space>
      {questions.length === 0 ? (
        <Empty description="No questions added yet" />
      ) : (
        <List
          dataSource={questions}
          renderItem={(question, index) => (
            <List.Item>
              <List.Item.Meta
                title={`${index + 1}. ${question.text}`}
                description={
                  question.type === "INT"
                    ? "Integer answer"
                    : `Multiple choice: ${(question.answer_options ?? []).join(", ")}`
                }
              />
            </List.Item>
          )}
        />
      )}
      <QuestionCreateModal
        datasetId={datasetId}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onCreated={onCreated}
      />
    </>
  );
};