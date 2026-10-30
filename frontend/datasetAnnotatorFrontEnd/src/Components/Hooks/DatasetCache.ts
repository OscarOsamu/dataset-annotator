import { ApiApi, type Dataset } from "../../api";
import { apiConfig } from "../../configuration";

let cachedDatasets: Dataset[] | undefined;
let pendingDatasetRequest: Promise<Dataset[]> | undefined;
let datasetCacheVersion = 0;
const datasetsById = new Map<number, Dataset>();
const pendingDatasetDetails = new Map<number, Promise<Dataset>>();

export const getCachedDatasets = () => cachedDatasets;

export const getCachedDataset = (id: number) => datasetsById.get(id);

export const cacheDatasets = (datasets: Dataset[]) => {
  cachedDatasets = datasets;
  datasetsById.clear();
  for (const dataset of datasets) datasetsById.set(dataset.id, dataset);
};

export const cacheDataset = (dataset: Dataset) => {
  datasetsById.set(dataset.id, dataset);
  if (cachedDatasets) {
    cachedDatasets = cachedDatasets.map((current) =>
      current.id === dataset.id ? dataset : current,
    );
  }
};

export const invalidateDatasets = () => {
  datasetCacheVersion += 1;
  cachedDatasets = undefined;
  datasetsById.clear();
  pendingDatasetRequest = undefined;
  pendingDatasetDetails.clear();
};

export const loadDatasets = () => {
  if (cachedDatasets) return Promise.resolve(cachedDatasets);
  if (pendingDatasetRequest) return pendingDatasetRequest;

  const requestVersion = datasetCacheVersion;
  const request = new ApiApi(apiConfig)
    .apiDatasetsList()
    .then(({ data }) => {
      if (requestVersion === datasetCacheVersion) cacheDatasets(data);
      return data;
    });
  pendingDatasetRequest = request;
  const clearPendingRequest = () => {
    if (pendingDatasetRequest === request) pendingDatasetRequest = undefined;
  };
  void request.then(clearPendingRequest, clearPendingRequest);

  return request;
};

export const loadDataset = (id: number) => {
  const cachedDataset = getCachedDataset(id);
  if (cachedDataset) return Promise.resolve(cachedDataset);

  const pendingRequest = pendingDatasetDetails.get(id);
  if (pendingRequest) return pendingRequest;

  const requestVersion = datasetCacheVersion;
  const request = new ApiApi(apiConfig)
    .apiDatasetsRetrieve(id)
    .then(({ data }) => {
      if (requestVersion === datasetCacheVersion) cacheDataset(data);
      return data;
    });
  pendingDatasetDetails.set(id, request);
  const clearPendingRequest = () => {
    if (pendingDatasetDetails.get(id) === request) {
      pendingDatasetDetails.delete(id);
    }
  };
  void request.then(clearPendingRequest, clearPendingRequest);

  return request;
};
