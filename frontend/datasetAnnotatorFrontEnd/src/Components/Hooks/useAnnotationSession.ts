import { useCallback, useEffect, useState } from "react";
import {
  ApiApi,
  type Answer,
  type AnswerRequest,
} from "../../api";
import { apiConfig } from "../../configuration";
import { useNotify } from "../Contexts/NotificationProvider";
import {
  findNextQuestionInIndex,
  indexAnswersByImage,
  updateAnswerIndex,
  type AnswersByImage,
} from "../Utils/Annotation";
import {
  cacheSavedAnswer,
  loadAnnotationPage,
  type AnnotationDatasetData,
  type AnnotationTask,
} from "../Utils/AnnotationData";
import { getApiErrorMessage } from "../Utils/ApiErrors.ts";

export type AnnotationPhase = "question" | "recap" | "complete";

export interface AnswerDraft {
  integerValue: number | null;
  selectedChoices: unknown[];
  isUnclear: boolean;
}

interface TaskPageResult {
  data: AnnotationDatasetData;
  cursor: number | null;
  startIndex: number;
  firstTask?: AnnotationTask;
}

/** Skip completed pages and return the next page containing work. */
const loadNextTaskPage = async (
  datasetId: number,
  initialCursor: number | null,
  initialStartIndex: number,
): Promise<TaskPageResult> => {
  let cursor = initialCursor;
  let startIndex = initialStartIndex;

  while (true) {
    const data = await loadAnnotationPage(datasetId, cursor);
    const firstTask = data.tasks[0];

    if (firstTask || data.next_cursor === null || data.questions.length === 0) {
      return { data, cursor, startIndex, firstTask };
    }

    startIndex += data.images.length;
    cursor = data.next_cursor;
  }
};

export const useAnnotationSession = (datasetId: number) => {
  const notify = useNotify();
  const [pageData, setPageData] = useState<AnnotationDatasetData>();
  const [pageCursor, setPageCursor] = useState<number | null>(null);
  const [pageStartIndex, setPageStartIndex] = useState(0);
  const [totalImageCount, setTotalImageCount] = useState(0);
  const [answersByImage, setAnswersByImage] = useState<AnswersByImage>(new Map());
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

  const activateTaskPage = useCallback((result: TaskPageResult) => {
    const orderedQuestions = [...result.data.questions].sort(
      (left, right) => left.id - right.id,
    );
    const nextAnswerIndex = indexAnswersByImage(result.data.answers);

    setPageData({ ...result.data, questions: orderedQuestions });
    if (result.data.total_images !== null) {
      setTotalImageCount(result.data.total_images);
    }
    setPageCursor(result.cursor);
    setPageStartIndex(result.startIndex);
    setAnswersByImage(nextAnswerIndex);
    setLoadedDatasetId(datasetId);
    setLoadStatus({ datasetId, loading: false });

    if (!result.firstTask) {
      setPhase("complete");
      setImageIndex(Math.max(
        result.startIndex + result.data.images.length - 1,
        0,
      ));
      setActiveQuestionId(undefined);
      return;
    }

    const localImageIndex = result.data.images.findIndex(
      (image) => image.id === result.firstTask?.image_id,
    );
    setImageIndex(result.startIndex + localImageIndex);
    setActiveQuestionId(result.firstTask.question_id);
    setPhase("question");
  }, [datasetId]);

  useEffect(() => {
    if (!Number.isInteger(datasetId) || datasetId <= 0) return;

    let isCurrent = true;
    loadNextTaskPage(datasetId, null, 0)
      .then((result) => {
        if (isCurrent) activateTaskPage(result);
      })
      .catch(() => {
        if (isCurrent) {
          setLoadStatus({
            datasetId,
            loading: false,
            error: "Dataset annotation tasks could not be loaded.",
          });
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [datasetId, activateTaskPage]);

  const hasLoadedDataset = loadedDatasetId === datasetId;
  const currentImages = hasLoadedDataset ? pageData?.images ?? [] : [];
  const currentQuestions = hasLoadedDataset ? pageData?.questions ?? [] : [];
  const currentAnswerIndex = hasLoadedDataset
    ? answersByImage
    : new Map<number, Map<number, Answer>>();
  const localImageIndex = imageIndex - pageStartIndex;
  const currentImage = currentImages[localImageIndex];
  const activeQuestion = currentQuestions.find(
    (question) => question.id === activeQuestionId,
  );
  const existingAnswer = currentImage && activeQuestionId
    ? currentAnswerIndex.get(currentImage.id)?.get(activeQuestionId)
    : undefined;
  const hasNextImage = currentImages.some(
    (image, index) =>
      index > localImageIndex &&
      findNextQuestionInIndex(image, currentQuestions, currentAnswerIndex),
  ) || pageData?.next_cursor != null;

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
      cacheSavedAnswer(datasetId, pageCursor, savedAnswer, activeQuestion);
      const updatedAnswerIndex = updateAnswerIndex(currentAnswerIndex, savedAnswer);
      setAnswersByImage(updatedAnswerIndex);

      const nextQuestion = findNextQuestionInIndex(
        currentImage,
        currentQuestions,
        updatedAnswerIndex,
      );
      if (nextQuestion) {
        setActiveQuestionId(nextQuestion.id);
      } else {
        setActiveQuestionId(undefined);
        setPhase("recap");
      }
    } catch (error) {
      notify.notify(
        "Answer not saved",
        getApiErrorMessage(error, "Please try again."),
        "error",
      );
    } finally {
      setSaving(false);
    }
  };

  const editQuestion = (questionId: number) => {
    setActiveQuestionId(questionId);
    setPhase("question");
  };

  const continueToNextImage = async () => {
    const nextIndex = currentImages.findIndex(
      (image, index) =>
        index > localImageIndex &&
        findNextQuestionInIndex(image, currentQuestions, currentAnswerIndex),
    );
    if (nextIndex >= 0) {
      setImageIndex(pageStartIndex + nextIndex);
      setActiveQuestionId(
        findNextQuestionInIndex(
          currentImages[nextIndex],
          currentQuestions,
          currentAnswerIndex,
        )?.id,
      );
      setPhase("question");
      return;
    }

    if (pageData?.next_cursor == null) {
      setPhase("complete");
      return;
    }

    setLoadStatus({ datasetId, loading: true });
    try {
      const result = await loadNextTaskPage(
        datasetId,
        pageData.next_cursor,
        pageStartIndex + currentImages.length,
      );
      activateTaskPage(result);
    } catch (error) {
      setLoadStatus({
        datasetId,
        loading: false,
        error: getApiErrorMessage(error, "The next annotation page could not be loaded."),
      });
      notify.notify(
        "Could not load the next images",
        getApiErrorMessage(error, "Please try again."),
        "error",
      );
    }
  };

  return {
    images: currentImages,
    questions: currentQuestions,
    answersByImage: currentAnswerIndex,
    currentImage,
    activeQuestion,
    existingAnswer,
    imageIndex,
    imageCount: hasLoadedDataset ? totalImageCount : 0,
    questionCount: pageData?.questions.length ?? 0,
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
