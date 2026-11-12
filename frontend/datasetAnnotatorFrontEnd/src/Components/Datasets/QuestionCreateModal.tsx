import { useEffect, useState } from "react";
import {
  Checkbox,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Space,
} from "antd";
import { ApiApi, TypeEnum, type Image, type Question, type QuestionRequest } from "../../api";
import { apiConfig } from "../../configuration";
import { useNotify } from "../Contexts/NotificationProvider";
import {
  getApiErrorMessage,
  isFormValidationError,
} from "../Utils/ApiErrors.ts";
import { AnswerOptionsEditor } from "./AnswerOptionsEditor";

interface QuestionCreateModalProps {
  datasetId: number;
  referenceImages: Image[];
  question?: Question;
  open: boolean;
  onCancel: () => void;
  onCreated: () => void;
}

interface QuestionFormValues {
  text: string;
  type: TypeEnum;
  answerOptions?: string[];
  allowSeveralAnswers?: boolean;
  skipNextQuestionsIfNull?: boolean;
  minimum?: number | null;
  maximum?: number | null;
  referenceImage?: number;
}

export const QuestionCreateModal = ({
  datasetId,
  referenceImages,
  question,
  open,
  onCancel,
  onCreated,
}: QuestionCreateModalProps) => {
  const [form] = Form.useForm<QuestionFormValues>();
  const [isSaving, setIsSaving] = useState(false);
  const questionType = Form.useWatch("type", form) ?? TypeEnum.Qcm;
  const notify = useNotify();

  useEffect(() => {
    if (!open) return;
    if (!question) {
      form.resetFields();
      return;
    }

    form.setFieldsValue({
      text: question.text,
      type: question.type,
      answerOptions: (question.answer_options ?? []).map(String),
      allowSeveralAnswers: question.allow_several_answers,
      skipNextQuestionsIfNull: question.skip_next_questions_if_null,
      minimum: question.minimum,
      maximum: question.maximum,
      referenceImage: question.reference_image ?? undefined,
    });
  }, [form, open, question]);

  const closeModal = () => {
    form.resetFields();
    onCancel();
  };

  const createQuestion = async () => {
    try {
      const values = await form.validateFields();
      const request: QuestionRequest = {
        dataset: datasetId,
        text: values.text.trim(),
        type: values.type,
        reference_image: values.referenceImage ?? null,
        answer_options:
          values.type === TypeEnum.Qcm
            ? (values.answerOptions ?? [])
                .map((option) => option.trim())
                .filter(Boolean)
            : [],
        allow_several_answers:
          values.type === TypeEnum.Qcm && Boolean(values.allowSeveralAnswers),
        skip_next_questions_if_null: Boolean(values.skipNextQuestionsIfNull),
        minimum: values.type === TypeEnum.Int ? values.minimum ?? null : null,
        maximum: values.type === TypeEnum.Int ? values.maximum ?? null : null,
      };

      setIsSaving(true);
      const api = new ApiApi(apiConfig);
      if (question) {
        await api.apiQuestionsPartialUpdate(question.id, request);
      } else {
        await api.apiQuestionsCreate(request);
      }
      closeModal();
      onCreated();
      notify.notify(
        question ? "Question updated" : "Question added",
        question
          ? "Your changes have been saved."
          : "The question is ready for annotation.",
        "success",
      );
    } catch (error) {
      if (isFormValidationError(error)) return;
      notify.notify(
        "Question could not be added",
        getApiErrorMessage(error, "Please review the question and try again."),
        "error",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      title={question ? "Edit question" : "Add a question"}
      open={open}
      onCancel={closeModal}
      onOk={createQuestion}
      okText={question ? "Save changes" : "Add question"}
      confirmLoading={isSaving}
      destroyOnHidden
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{ type: TypeEnum.Qcm, answerOptions: [""] }}
        requiredMark="optional"
      >
        <Form.Item
          label="Question"
          name="text"
          rules={[{ required: true, whitespace: true, message: "Enter a question." }]}
        >
          <Input maxLength={500} placeholder="What can you see in this image?" />
        </Form.Item>
        <Form.Item label="Reference image" name="referenceImage">
          <Select
            allowClear
            placeholder="No reference image"
            options={referenceImages.map((image) => ({
              label: image.path.split("/").pop() ?? image.path,
              value: image.id,
            }))}
            showSearch
            optionFilterProp="label"
          />
        </Form.Item>
        <Form.Item label="Answer type" name="type" rules={[{ required: true }]}>
          <Select
            options={[
              { label: "Multiple choice", value: TypeEnum.Qcm },
              { label: "Integer", value: TypeEnum.Int },
              { label: "True or false", value: TypeEnum.Tf },
            ]}
          />
        </Form.Item>
        {questionType === TypeEnum.Qcm ? (
          <>
            <Form.Item
              label="Answer options"
              name="answerOptions"
              rules={[
                {
                  validator: (_, value: string[] | undefined) =>
                    value?.some((option) => option.trim())
                      ? Promise.resolve()
                      : Promise.reject(new Error("Enter at least one option.")),
                },
              ]}
            >
              <AnswerOptionsEditor />
            </Form.Item>
            <Form.Item name="allowSeveralAnswers" valuePropName="checked">
              <Checkbox>Allow multiple answers</Checkbox>
            </Form.Item>
          </>
        ) : questionType === TypeEnum.Int ? (
          <Space size="middle" style={{ display: "flex" }}>
            <Form.Item label="Minimum" name="minimum">
              <InputNumber min={0} precision={0} style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item
              label="Maximum"
              name="maximum"
              dependencies={["minimum"]}
              rules={[
                {
                  validator: (_, maximum: number | null | undefined) => {
                    const minimum = form.getFieldValue("minimum");
                    return maximum == null || minimum == null || minimum <= maximum
                      ? Promise.resolve()
                      : Promise.reject(new Error("Maximum must be at least the minimum."));
                  },
                },
              ]}
            >
              <InputNumber min={0} precision={0} style={{ width: "100%" }} />
            </Form.Item>
          </Space>
        ) : null}
        <Form.Item name="skipNextQuestionsIfNull" valuePropName="checked">
          <Checkbox>Skip later questions if this answer is unclear</Checkbox>
        </Form.Item>
      </Form>
    </Modal>
  );
};