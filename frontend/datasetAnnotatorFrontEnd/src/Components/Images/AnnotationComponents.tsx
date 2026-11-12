import { useState } from "react";
import { QuestionCircleOutlined } from "@ant-design/icons";
import { Button, Checkbox, Image, InputNumber, Modal, Progress, Radio, Tooltip, Typography } from "antd";
import styled from "styled-components";
import type { Answer, Image as DatasetImage, Question } from "../../api";
import type { AnswerDraft } from "../Hooks/useAnnotationSession";
import { formatAnswer, getImageUrl, type QuestionAnswerRow } from "../Annotation/Annotation";

// Styled Components

const Header = styled.header`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 20px;

  @media (max-width: 640px) {
    align-items: flex-start;
    flex-direction: column;
  }
`;

const Workbench = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1.25fr) minmax(320px, 0.75fr);
  min-height: 520px;
  border: 1px solid #d9e1df;
  border-radius: 6px;
  overflow: hidden;
  background: #fff;

  @media (max-width: 800px) {
    grid-template-columns: 1fr;
  }
`;

const ImagePanel = styled.div`
  display: grid;
  place-items: center;
  min-height: 360px;
  padding: 20px;
  background: #182522;
`;

const DatasetImage = styled(Image)`
  width: 100%;

  img {
    display: block;
    width: 100%;
    height: min(68vh, 720px);
    object-fit: contain;
  }
`;

const QuestionPanel = styled.section`
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-width: 0;
  padding: 28px;
`;

const AnswerOptions = styled.div`
  .ant-radio-wrapper,
  .ant-checkbox-wrapper {
    margin-inline-start: 0;
    padding: 12px 14px;
    border: 1px solid #d9e1df;
    border-radius: 5px;
    background: #fbfcfa;
  }
`;

const Recap = styled.div`
  display: grid;
`;

const RecapRow = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 14px;
  padding: 14px 0;
  border-bottom: 1px solid #e6ebe9;
`;

const AnswerValue = styled.span`
  color: #35544c;
  overflow-wrap: anywhere;
`;

const Footer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-top: auto;
  padding-top: 16px;
`;

// Components

interface AnnotationHeaderProps {
  imageIndex: number;
  imageCount: number;
  fileName: string;
  progress: number;
}

export const AnnotationHeader = ({
  imageIndex,
  imageCount,
  fileName,
  progress,
}: AnnotationHeaderProps) => (
  <Header>
    <div>
      <Typography.Text type="secondary">
        Image {imageIndex + 1} of {imageCount}
      </Typography.Text>
      <Typography.Title level={2} style={{ margin: "4px 0 0" }}>
        {fileName}
      </Typography.Title>
    </div>
    <div style={{ width: 220, maxWidth: "100%" }}>
      <Progress percent={progress} showInfo={true} />
    </div>
  </Header>
);

interface AnnotationWorkbenchProps {
  imagePath: string;
  fileName: string;
  children: React.ReactNode;
}

export const AnnotationWorkbench = ({
  imagePath,
  fileName,
  children,
}: AnnotationWorkbenchProps) => (
  <Workbench>
    <ImagePanel>
      <DatasetImage src={getImageUrl(imagePath)} alt={fileName} />
    </ImagePanel>
    {children}
  </Workbench>
);

interface AnnotationQuestionFormProps {
  question: Question;
  referenceImage?: DatasetImage;
  answer?: Answer;
  saving: boolean;
  onSave: (draft: AnswerDraft) => void;
}

export const AnnotationQuestionForm = ({
  question,
  referenceImage,
  answer,
  saving,
  onSave,
}: AnnotationQuestionFormProps) => {
  const [integerValue, setIntegerValue] = useState<number | null>(
    answer?.answer_integer ?? null,
  );
  const [selectedChoices, setSelectedChoices] = useState<unknown[]>(
    Array.isArray(answer?.answer_choices) ? answer.answer_choices : [],
  );
  const [booleanValue, setBooleanValue] = useState<boolean | null>(
    answer?.answer_boolean ?? null,
  );
  const [isUnclear, setIsUnclear] = useState(answer?.is_unclear ?? false);
  const [referenceImageOpen, setReferenceImageOpen] = useState(false);

  const canSave = isUnclear || (
    question.type === "INT"
      ? integerValue !== null
      : question.type === "TF"
        ? booleanValue !== null
        : question.allow_several_answers
          ? selectedChoices.length > 0
          : selectedChoices.length === 1
  );

  return (
    <QuestionPanel>
      <div>
        <Typography.Text type="secondary">Question</Typography.Text>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Typography.Title level={3} style={{ marginTop: 6, marginBottom: 0 }}>
            {question.text}
          </Typography.Title>
          {referenceImage && (
            <Tooltip title="View reference image">
              <Button
                type="text"
                aria-label="View reference image"
                icon={<QuestionCircleOutlined />}
                onClick={() => setReferenceImageOpen(true)}
              />
            </Tooltip>
          )}
        </div>
      </div>

      <Modal
        title="Reference image"
        open={referenceImageOpen}
        onCancel={() => setReferenceImageOpen(false)}
        footer={null}
        centered
      >
        {referenceImage && (
          <Image
            src={getImageUrl(referenceImage.path)}
            alt={referenceImage.path.split("/").pop() ?? "Question reference"}
            preview={false}
            style={{ display: "block", maxWidth: "100%", maxHeight: "70vh", objectFit: "contain", margin: "0 auto" }}
          />
        )}
      </Modal>

      {question.type === "INT" ? (
        <InputNumber
          aria-label="Integer answer"
          min={question.minimum ?? undefined}
          max={question.maximum ?? undefined}
          precision={0}
          value={integerValue}
          onChange={(value) =>
            setIntegerValue(typeof value === "number" ? value : null)
          }
          style={{ width: "100%", maxWidth: 260 }}
        />
      ) : question.type === "TF" ? (
        <AnswerOptions>
          <Radio.Group
            value={booleanValue}
            onChange={(event) => setBooleanValue(event.target.value)}
            options={[
              { label: "True", value: true },
              { label: "False", value: false },
            ]}
            style={{ display: "grid", gap: 10 }}
          />
        </AnswerOptions>
      ) : question.allow_several_answers ? (
        <AnswerOptions>
          <Checkbox.Group
            value={selectedChoices}
            onChange={setSelectedChoices}
            options={(question.answer_options ?? []).map((option: unknown) => ({
              label: String(option),
              value: option,
            }))}
            style={{ display: "grid", gap: 10 }}
          />
        </AnswerOptions>
      ) : (
        <AnswerOptions>
          <Radio.Group
            value={selectedChoices[0]}
            onChange={(event) => setSelectedChoices([event.target.value])}
            style={{ display: "grid", gap: 10 }}
          >
            {(question.answer_options ?? []).map((option: unknown) => (
              <Radio key={String(option)} value={option}>
                {String(option)}
              </Radio>
            ))}
          </Radio.Group>
        </AnswerOptions>
      )}

      <Checkbox
        checked={isUnclear}
        onChange={(event) => setIsUnclear(event.target.checked)}
      >
        I cannot determine the answer
      </Checkbox>

      <Footer>
        <Typography.Text type="secondary">
          {answer ? "Editing saved answer" : "Answer saved when you continue"}
        </Typography.Text>
        <Button
          type="primary"
          loading={saving}
          disabled={!canSave || saving}
          onClick={() =>
            onSave({ integerValue, selectedChoices, booleanValue, isUnclear })
          }
        >
          Save answer
        </Button>
      </Footer>
    </QuestionPanel>
  );
};

interface AnnotationRecapProps {
  rows: QuestionAnswerRow[];
  hasNextImage: boolean;
  onEdit: (questionId: number) => void;
  onContinue: () => void;
}

export const AnnotationRecap = ({
  rows,
  hasNextImage,
  onEdit,
  onContinue,
}: AnnotationRecapProps) => (
  <QuestionPanel>
    <div>
      <Typography.Text type="secondary">Image recap</Typography.Text>
      <Typography.Title level={3} style={{ marginTop: 6 }}>
        Review your answers
      </Typography.Title>
    </div>
    <Recap>
      {rows.map(({ question, answer, isSkipped }) => (
        <RecapRow key={question.id}>
          <div>
            <Typography.Text strong>{question.text}</Typography.Text>
            <br />
            <AnswerValue>
              {isSkipped ? "Skipped by previous answer" : formatAnswer(answer)}
            </AnswerValue>
          </div>
          {!isSkipped && answer && (
            <Button size="small" onClick={() => onEdit(question.id)}>
              Edit
            </Button>
          )}
        </RecapRow>
      ))}
    </Recap>
    <Footer>
      <Typography.Text type="secondary">Saved to this image</Typography.Text>
      <Button type="primary" onClick={onContinue}>
        {hasNextImage ? "Continue to next image" : "Finish annotation"}
      </Button>
    </Footer>
  </QuestionPanel>
);
