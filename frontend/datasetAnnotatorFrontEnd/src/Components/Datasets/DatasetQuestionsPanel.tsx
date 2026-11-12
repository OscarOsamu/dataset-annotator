import { useState } from "react";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { Button, Empty, List, Popconfirm, Space, Typography } from "antd";
import { ApiApi } from "../../api";
import { apiConfig } from "../../configuration";
import type { Image, Question } from "../../api";
import { AppSpacing } from "../Utils/Styles/AppStyles.tsx";
import { useNotify } from "../Contexts/NotificationProvider";
import { getApiErrorMessage } from "../Utils/ApiErrors.ts";
import { QuestionCreateModal } from "./QuestionCreateModal";

interface DatasetQuestionsPanelProps {
  datasetId: number;
  referenceImages: Image[];
  questions: Question[];
  onCreated: () => void;
}

export const DatasetQuestionsPanel = ({
  datasetId,
  referenceImages,
  questions,
  onCreated,
}: DatasetQuestionsPanelProps) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question>();
  const [removingQuestionId, setRemovingQuestionId] = useState<number>();
  const notify = useNotify();

  const openCreateModal = () => {
    setEditingQuestion(undefined);
    setModalOpen(true);
  };

  const openEditModal = (question: Question) => {
    setEditingQuestion(question);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingQuestion(undefined);
  };

  const deleteQuestion = async (question: Question) => {
    setRemovingQuestionId(question.id);
    try {
      await new ApiApi(apiConfig).apiQuestionsDestroy(question.id);
      onCreated();
      notify.notify(
        "Question deleted",
        "The question and all its associated answers were deleted.",
        "success",
      );
    } catch (error) {
      notify.notify(
        "Question could not be deleted",
        getApiErrorMessage(error, "Please try again."),
        "error",
      );
    } finally {
      setRemovingQuestionId(undefined);
    }
  };

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
        <Button type="primary" onClick={openCreateModal}>
          Add question
        </Button>
      </Space>
      {questions.length === 0 ? (
        <Empty description="No questions added yet" />
      ) : (
        <List
          dataSource={questions}
          renderItem={(question, index) => (
            <List.Item
              actions={[
                <Button
                  key="edit"
                  aria-label={`Edit question ${index + 1}`}
                  title="Edit question"
                  icon={<EditOutlined />}
                  onClick={() => openEditModal(question)}
                />,
                <Popconfirm
                  key="delete"
                  title="Delete question?"
                  description="Deleting this question will also permanently delete all answers associated with it."
                  okText="Delete question"
                  okButtonProps={{ danger: true, loading: removingQuestionId === question.id }}
                  cancelText="Keep question"
                  onConfirm={() => deleteQuestion(question)}
                >
                  <Button
                    danger
                    aria-label={`Delete question ${index + 1}`}
                    title="Delete question"
                    icon={<DeleteOutlined />}
                    loading={removingQuestionId === question.id}
                  />
                </Popconfirm>,
              ]}
            >
              <List.Item.Meta
                title={`${index + 1}. ${question.text}`}
                description={[
                  question.type === "INT"
                    ? "Integer answer"
                    : question.type === "TF"
                      ? "True or false answer"
                      : `Multiple choice: ${(question.answer_options ?? []).join(", ")}`,
                  question.reference_image
                    ? `Reference image: ${referenceImages.find((image) => image.id === question.reference_image)?.path.split("/").pop() ?? "Attached"}`
                    : undefined,
                ].filter(Boolean).join(" · ")}
              />
            </List.Item>
          )}
        />
      )}
      <QuestionCreateModal
        datasetId={datasetId}
        referenceImages={referenceImages}
        question={editingQuestion}
        open={modalOpen}
        onCancel={closeModal}
        onCreated={() => {
          closeModal();
          onCreated();
        }}
      />
    </>
  );
};