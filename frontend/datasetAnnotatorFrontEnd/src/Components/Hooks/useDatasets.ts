import { useEffect, useState } from 'react';
import type { Dataset } from '../../api';
import { getCachedDatasets, loadDatasets } from './DatasetCache';

export const useDatasets = () => {
  const [datasets, setDatasets] = useState<Dataset[]>(() => getCachedDatasets() ?? []);
  const [loading, setLoading] = useState(() => getCachedDatasets() === undefined);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    let isCurrent = true;

    loadDatasets()
      .then((result) => {
        if (isCurrent) setDatasets(result);
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
  }, []);

  return { datasets, loading, error };
};