import {
  ApiApi,
  type Answer,
  type DatasetAnnotationData as GeneratedAnnotationData,
  type Image,
  type Question,
} from "../../api";
import { apiConfig } from "../../configuration";

export interface AnnotationTask {
  image_id: number;
  question_id: number;
}

export interface AnnotationDatasetData extends GeneratedAnnotationData {
  tasks: AnnotationTask[];
  total_images: number | null;
  next_cursor: number | null;
  reference_images: Image[];
}

export const ANNOTATION_PAGE_SIZE = 100;

const MAX_CACHED_PAGES = 3;
const annotationPageCache = new Map<string, AnnotationDatasetData>();
const pendingAnnotationLoads = new Map<
  string,
  Promise<AnnotationDatasetData>
>();
const datasetCacheVersions = new Map<number, number>();

const getPageKey = (
  datasetId: number,
  cursor: number | null,
  includeReferenceImages: boolean,
) => `${datasetId}:${cursor ?? 0}:${includeReferenceImages ? 1 : 0}`;

/** Load and cache one bounded annotation page. */
export const loadAnnotationPage = (
  datasetId: number,
  cursor: number | null,
  includeReferenceImages = false,
) => {
  const key = getPageKey(datasetId, cursor, includeReferenceImages);
  const cachedPage = annotationPageCache.get(key);
  if (cachedPage) {
    annotationPageCache.delete(key);
    annotationPageCache.set(key, cachedPage);
    return Promise.resolve(cachedPage);
  }

  const pendingLoad = pendingAnnotationLoads.get(key);
  if (pendingLoad) return pendingLoad;

  const cacheVersion = datasetCacheVersions.get(datasetId) ?? 0;
  const request = new ApiApi(apiConfig)
    .apiDatasetsAnnotationDataRetrieve(
      datasetId,
      cursor ?? undefined,
      includeReferenceImages ? true : undefined,
      ANNOTATION_PAGE_SIZE,
    )
    .then(({ data }) => data as AnnotationDatasetData);

  const cachedRequest = request.then((page) => {
    if (pendingAnnotationLoads.get(key) === cachedRequest) {
      pendingAnnotationLoads.delete(key);
    }
    if ((datasetCacheVersions.get(datasetId) ?? 0) === cacheVersion) {
      annotationPageCache.set(key, page);
      while (annotationPageCache.size > MAX_CACHED_PAGES) {
        const oldestKey = annotationPageCache.keys().next().value;
        if (oldestKey === undefined) break;
        annotationPageCache.delete(oldestKey);
      }
    }
    return page;
  }, (error: unknown) => {
    if (pendingAnnotationLoads.get(key) === cachedRequest) {
      pendingAnnotationLoads.delete(key);
    }
    throw error;
  });
  pendingAnnotationLoads.set(key, cachedRequest);

  return cachedRequest;
};

/** Keep a page cache current after an answer write. */
export const cacheSavedAnswer = (
  datasetId: number,
  cursor: number | null,
  answer: Answer,
  question: Question,
) => {
  const page = annotationPageCache.get(getPageKey(datasetId, cursor, true));
  if (!page) return;

  page.answers = [
    ...page.answers.filter(
      (item) => item.id !== answer.id &&
        !(item.image === answer.image && item.question === answer.question),
    ),
    answer,
  ];
  page.tasks = page.tasks.filter((task) =>
    task.image_id !== answer.image || (
      task.question_id !== answer.question &&
      !(answer.is_unclear && question.skip_next_questions_if_null &&
        task.question_id > answer.question)
    ),
  );
};

export const invalidateAnnotationPages = (datasetId: number) => {
  datasetCacheVersions.set(datasetId, (datasetCacheVersions.get(datasetId) ?? 0) + 1);
  const keyPrefix = `${datasetId}:`;
  for (const key of annotationPageCache.keys()) {
    if (key.startsWith(keyPrefix)) annotationPageCache.delete(key);
  }
  for (const key of pendingAnnotationLoads.keys()) {
    if (key.startsWith(keyPrefix)) pendingAnnotationLoads.delete(key);
  }
};