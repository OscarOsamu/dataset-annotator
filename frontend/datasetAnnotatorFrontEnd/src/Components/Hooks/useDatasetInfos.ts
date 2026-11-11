import { useEffect, useState } from 'react';
import { type Dataset } from '../../api';
import { getCachedDataset, invalidateDatasets, loadDataset } from './DatasetCache';

export const useDatasetInfos = (id?: number) => {
  const [datasetState, setDatasetState] = useState<{
    id?: number;
    dataset?: Dataset;
  }>(() => ({ id, dataset: id ? getCachedDataset(id) : undefined }));
  const [requestState, setRequestState] = useState<{
    id?: number;
    loading: boolean;
    error?: unknown;
  }>(() => ({ id, loading: true }));
  const [refreshKey, setRefreshKey] = useState(0);
  const datasetInfos = datasetState.id === id
    ? datasetState.dataset
    : id ? getCachedDataset(id) : undefined;

  useEffect(() => {
    if (!id) return;
    if (getCachedDataset(id)) return;
    let isCurrent = true;

    loadDataset(id)
      .then((dataset) => {
        if (isCurrent) {
          setDatasetState({ id, dataset });
          setRequestState({ id, loading: false });
        }
      })
      .catch((err: unknown) => {
        if (isCurrent) setRequestState({ id, loading: false, error: err });
      })

    return () => {
      isCurrent = false;
    };
  }, [id, refreshKey]);

  const reload = () => {
    if (!id) return;
    invalidateDatasets();
    setDatasetState({ id });
    setRequestState({ id, loading: true });
    setRefreshKey((current) => current + 1);
  };

  return {
    datasetInfos,
    loading: !datasetInfos && (requestState.id !== id || requestState.loading),
    error: requestState.id === id ? requestState.error : undefined,
    reload,
  };
};