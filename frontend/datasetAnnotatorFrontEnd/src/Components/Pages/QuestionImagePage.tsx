import { useEffect } from "react";
import { Button, Empty, Progress, Spin } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import {
  AnnotationHeader,
  AnnotationQuestionForm,
  AnnotationRecap,
  AnnotationWorkbench,
} from "../Images/AnnotationComponents";
import { useAnnotationSession } from "../Hooks/useAnnotationSession";
import { getQuestionAnswerRowsFromIndex } from "../Annotation/Annotation";
import { useNotify } from "../Contexts/NotificationProvider";
import AppBreadcrumb from "../AppBreadcrumbs";
import { AnnotationPage } from "../Utils/Styles/StyledComponents";

const QuestionImagePage = () => {
  const { datasetId: datasetIdParam } = useParams();
  const navigate = useNavigate();
  const notify = useNotify();
  const datasetId = Number(datasetIdParam);
  const isValidDatasetId = Number.isInteger(datasetId) && datasetId > 0;
  const session = useAnnotationSession(datasetId);

  const hasNoApplicableQuestion =
    !session.loading &&
    Boolean(session.currentImage) &&
    session.phase === "question" &&
    !session.activeQuestion;

  const notificationMessage = !isValidDatasetId
    ? "This dataset could not be found."
    : session.error
      ? session.error
      : hasNoApplicableQuestion
        ? "No applicable question is available."
        : undefined;

  useEffect(() => {
    if (notificationMessage) {
      notify.notify("Annotation unavailable", notificationMessage, "error");
    }
  }, [notificationMessage, notify]);

  if (!isValidDatasetId) {
    return (
      <AnnotationPage>
        <Empty description="This dataset could not be found." />
      </AnnotationPage>
    );
  }

  if (session.loading) {
    return <AnnotationPage><Spin size="large" /></AnnotationPage>;
  }

  if (session.error && session.images.length === 0) {
    return (
      <AnnotationPage>
        <Empty description={session.error} />
      </AnnotationPage>
    );
  }

  if (session.phase === "complete" || !session.currentImage) {
    const description = session.imageCount === 0
      ? "This dataset has no images to annotate."
      : session.questionCount === 0
        ? "This dataset has no questions to answer."
        : "All images are annotated.";

    return (
      <AnnotationPage>
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={description} />
        <Progress
          percent={session.imageCount ? 100 : 0}
          format={() => `${session.imageCount} / ${session.imageCount} images`}
        />
        <Button
          style={{ marginTop: 20 }}
          onClick={() => navigate(`/dataset/${datasetId}`)}
        >
          Dataset overview
        </Button>
      </AnnotationPage>
    );
  }

  const { currentImage } = session;
  const fileName = currentImage.path.split("/").pop() ?? currentImage.path;
  const progress = Math.round(
    ((session.imageIndex + (session.phase === "recap" ? 1 : 0)) /
      session.imageCount) *
      100,
  );
  const recapRows = getQuestionAnswerRowsFromIndex(
    session.questions,
    session.answersByImage,
    currentImage.id,
  );

  return (
    <AnnotationPage>
      <AppBreadcrumb/>
      <AnnotationHeader
        imageIndex={session.imageIndex}
        imageCount={session.imageCount}
        fileName={fileName}
        progress={progress}
      />
      <AnnotationWorkbench imagePath={currentImage.path} fileName={fileName}>
        {session.phase === "recap" ? (
          <AnnotationRecap
            rows={recapRows}
            hasNextImage={session.hasNextImage}
            onEdit={session.editQuestion}
            onContinue={session.continueToNextImage}
          />
        ) : session.activeQuestion ? (
          <AnnotationQuestionForm
            key={`${currentImage.id}-${session.activeQuestion.id}`}
            question={session.activeQuestion}
            referenceImage={session.referenceImages.find(
              (image) => image.id === session.activeQuestion?.reference_image,
            )}
            answer={session.existingAnswer}
            saving={session.saving}
            onSave={(draft) => void session.saveAnswer(draft)}
          />
        ) : (
          <Empty description="No applicable question is available." />
        )}
      </AnnotationWorkbench>
    </AnnotationPage>
  );
};

export default QuestionImagePage;