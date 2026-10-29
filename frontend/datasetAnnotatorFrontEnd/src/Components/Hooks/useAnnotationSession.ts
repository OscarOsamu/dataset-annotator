import { useEffect, useState } from "react";
import { ApiApi, type Answer, type AnswerRequest, type Image, type Question } from "../../api";
import { apiConfig } from "../../configuration";
import { useNotify } from "../Contexts/NotificationProvider";
import { findNextQuestion } from "../Utils/Annotation";

export type AnnotationPhase = "question" | "recap" | "complete";

export interface AnswerDraft {
  integerValue: number | null;
  selectedChoices: unknown[];
  isUnclear: boolean;
}

export const useAnnotationSession = (datasetId: number) => {
  const notify = useNotify();
  const [images, setImages] = useState<Image[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [loadedDatasetId, setLoadedDatasetId] = useState<number>();
  const [imageIndex, setImageIndex] = useState(0);
  const [activeQuestionId, setActiveQuestionId] = useState<number>();
  const [phase, setPhase] = useState<AnnotationPhase>("question");
  const [saving, setSaving] = useState(false);
  const [loadStatus, setLoadStatus] = useState<{
    datasetId: number;
    loading: boolean;
    error?: string;
  }>({ datasetId, loading: true });

  useEffect(() => {
    if (!Number.isInteger(datasetId) || datasetId <= 0) return;

    let isCurrent = true;
    const api = new ApiApi(apiConfig);

    Promise.all([
      api.apiImagesList(),
      api.apiQuestionsList(),
      api.apiAnswersList(),
    ])
      .then(([imageResponse, questionResponse, answerResponse]) => {
        if (!isCurrent) return;

        const datasetImages = imageResponse.data.filter(
          (image) => image.dataset === datasetId && !image.is_reference_image,
        );
        const datasetQuestions = questionResponse.data
          .filter((question) => question.dataset === datasetId)
          .sort((left, right) => left.id - right.id);
        const datasetAnswers = answerResponse.data.filter(
          (answer) => answer.dataset === datasetId,
        );
        const firstPendingIndex = datasetImages.findIndex((image) =>
          findNextQuestion(image, datasetQuestions, datasetAnswers),
        );

        setImages(datasetImages);
        setQuestions(datasetQuestions);
        setAnswers(datasetAnswers);
        setLoadedDatasetId(datasetId);
        setLoadStatus({ datasetId, loading: false });

        if (firstPendingIndex < 0) {
          setPhase("complete");
          setImageIndex(Math.max(datasetImages.length - 1, 0));
          return;
        }

        const firstPendingImage = datasetImages[firstPendingIndex];
        setImageIndex(firstPendingIndex);
        setActiveQuestionId(
          findNextQuestion(
            firstPendingImage,
            datasetQuestions,
            datasetAnswers,
          )?.id,
        );
      })
      .catch(() => {
        if (isCurrent) {
          setLoadStatus({
            datasetId,
            loading: false,
            error: "Dataset annotation data could not be loaded.",
          });
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [datasetId]);

  const hasLoadedDataset = loadedDatasetId === datasetId;
  const currentImages = hasLoadedDataset ? images : [];
  const currentQuestions = hasLoadedDataset ? questions : [];
  const currentAnswers = hasLoadedDataset ? answers : [];
  const currentImage = currentImages[imageIndex];
  const activeQuestion = currentQuestions.find(
    (question) => question.id === activeQuestionId,
  );
  const existingAnswer = currentAnswers.find(
    (answer) =>
      answer.image === currentImage?.id && answer.question === activeQuestionId,
  );
  const hasNextImage = currentImages.some(
    (image, index) =>
      index > imageIndex && findNextQuestion(image, currentQuestions, currentAnswers),
  );

  const saveAnswer = async (draft: AnswerDraft) => {
    if (!currentImage || !activeQuestion) return;

    const payload: AnswerRequest = {
      dataset: datasetId,
      image: currentImage.id,
      question: activeQuestion.id,
      answer_integer:
        draft.isUnclear || activeQuestion.type !== "INT"
          ? null
          : draft.integerValue,
      answer_choices:
        draft.isUnclear || activeQuestion.type !== "QCM"
          ? null
          : draft.selectedChoices,
      is_unclear: draft.isUnclear,
    };

    setSaving(true);
    try {
      const api = new ApiApi(apiConfig);
      const response = existingAnswer
        ? await api.apiAnswersPartialUpdate(existingAnswer.id, payload)
        : await api.apiAnswersCreate(payload);
      const savedAnswer = response.data;
      const updatedAnswers = existingAnswer
        ? currentAnswers.map((answer) =>
            answer.id === savedAnswer.id ? savedAnswer : answer,
          )
        : [...currentAnswers, savedAnswer];

      setAnswers(updatedAnswers);
      const nextQuestion = findNextQuestion(
        currentImage,
        currentQuestions,
        updatedAnswers,
      );
      if (nextQuestion) {
        setActiveQuestionId(nextQuestion.id);
      } else {
        setActiveQuestionId(undefined);
        setPhase("recap");
      }
    } catch {
      notify.notify("Answer not saved", "Please try again.", "error");
    } finally {
      setSaving(false);
    }
  };

  const editQuestion = (questionId: number) => {
    setActiveQuestionId(questionId);
    setPhase("question");
  };

  const continueToNextImage = () => {
    const nextIndex = currentImages.findIndex(
      (image, index) =>
        index > imageIndex && findNextQuestion(image, currentQuestions, currentAnswers),
    );
    if (nextIndex < 0) {
      setPhase("complete");
      return;
    }

    setImageIndex(nextIndex);
    setActiveQuestionId(
      findNextQuestion(currentImages[nextIndex], currentQuestions, currentAnswers)?.id,
    );
    setPhase("question");
  };

  return {
    images: currentImages,
    questions: currentQuestions,
    answers: currentAnswers,
    currentImage,
    activeQuestion,
    existingAnswer,
    imageIndex,
    phase,
    loading: loadStatus.datasetId !== datasetId || loadStatus.loading,
    saving,
    error: loadStatus.datasetId === datasetId ? loadStatus.error : undefined,
    hasNextImage,
    saveAnswer,
    editQuestion,
    continueToNextImage,
  };
};