import { useEffect, useState } from "react";
import type { Answer, Image, Question } from "../../api";
import {
  ANNOTATION_PAGE_SIZE,
  invalidateAnnotationPages,
  loadAnnotationPage,
} from "../Annotation/AnnotationData";

interface PageNavigation {
  datasetId: number;
  cursor: number | null;
  pageIndex: number;
  cursors: Array<number | null>;
}

export const useDatasetContent = (datasetId?: number) => {
  const [images, setImages] = useState<Image[]>([]);
  const [referenceImages, setReferenceImages] = useState<Image[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [totalImages, setTotalImages] = useState(0);
  const [nextCursor, setNextCursor] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>();
  const [refreshKey, setRefreshKey] = useState(0);
  const [navigation, setNavigation] = useState<PageNavigation>(() => ({
    datasetId: datasetId ?? 0,
    cursor: null,
    pageIndex: 0,
    cursors: [null],
  }));
  const currentNavigation = navigation.datasetId === datasetId
    ? navigation
    : { datasetId: datasetId ?? 0, cursor: null, pageIndex: 0, cursors: [null] };
  const { cursor, pageIndex } = currentNavigation;

  useEffect(() => {
    if (!datasetId) return;
    let isCurrent = true;

    loadAnnotationPage(datasetId, cursor, true)
      .then((page) => {
        if (!isCurrent) return;
        setImages(page.images);
        setReferenceImages((current) =>
          page.reference_images.length > 0 || cursor === null
            ? page.reference_images
            : current,
        );
        setQuestions(page.questions);
        setAnswers(page.answers);
        if (page.total_images !== null) setTotalImages(page.total_images);
        setNextCursor(page.next_cursor);
        setError(undefined);
      })
      .catch((requestError: unknown) => {
        if (isCurrent) setError(requestError);
      })
      .finally(() => {
        if (isCurrent) setLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [datasetId, cursor, refreshKey]);

  const goToNextPage = () => {
    if (!datasetId || nextCursor === null) return;
    setLoading(true);
    setError(undefined);
    setNavigation((current) => {
      const active = current.datasetId === datasetId
        ? current
        : { datasetId, cursor: null, pageIndex: 0, cursors: [null] };
      const nextCursors = [
        ...active.cursors.slice(0, active.pageIndex + 1),
        nextCursor,
      ];
      return {
        datasetId,
        cursor: nextCursor,
        pageIndex: active.pageIndex + 1,
        cursors: nextCursors,
      };
    });
  };

  const goToPreviousPage = () => {
    if (!datasetId || pageIndex === 0) return;
    setLoading(true);
    setError(undefined);
    setNavigation((current) => {
      const active = current.datasetId === datasetId
        ? current
        : { datasetId, cursor: null, pageIndex: 0, cursors: [null] };
      const previousIndex = Math.max(active.pageIndex - 1, 0);
      return {
        ...active,
        pageIndex: previousIndex,
        cursor: active.cursors[previousIndex],
      };
    });
  };

  const reload = () => {
    if (!datasetId) return;
    invalidateAnnotationPages(datasetId);
    setLoading(true);
    setError(undefined);
    setNavigation({ datasetId, cursor: null, pageIndex: 0, cursors: [null] });
    setRefreshKey((current) => current + 1);
  };

  return {
    images,
    referenceImages,
    questions,
    answers,
    totalImages,
    pageNumber: pageIndex + 1,
    pageSize: ANNOTATION_PAGE_SIZE,
    canGoToPreviousPage: pageIndex > 0,
    canGoToNextPage: nextCursor !== null,
    goToNextPage,
    goToPreviousPage,
    loading,
    error,
    reload,
  };
};
