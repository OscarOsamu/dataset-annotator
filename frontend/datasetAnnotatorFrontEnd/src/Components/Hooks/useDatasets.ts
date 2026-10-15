import { useEffect, useState } from 'react';
import { apiConfig } from '../../configuration';
import { type Dataset, ApiApi } from '../../api';

export const useDatasets = () => {
  const [loading, setLoading] = useState(true);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [error, setError] = useState<any>(null);
  const [datasets, setDatasets] = useState<Dataset[]>([]);

  useEffect(() => {
    const api = new ApiApi(apiConfig);

    api.apiDatasetsList()
      .then((res) => setDatasets(res.data))
      .catch((err) => setError(err))
      .finally(() => setLoading(false));
  }, []);

  return { datasets, loading, error };
};