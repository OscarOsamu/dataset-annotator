import { useEffect, useState } from 'react';
import { apiConfig } from '../../configuration';
import { type Dataset,  ApiApi } from '../../api';

export const useDatasetInfos = (id?: number) => {
  const [loading, setLoading] = useState(true);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [error, setError] = useState<any>(null);
  const [datasetInfos, setDatasetInfos] = useState<Dataset>();

  useEffect(() => {
    if (!id){
        return;
    }
    const api = new ApiApi(apiConfig);

    api.apiDatasetsRetrieve(id)
      .then((res) => setDatasetInfos(res.data))
      .catch((err) => setError(err))
      .finally(() => setLoading(false));
  }, [id]);

  return { datasetInfos, loading, error };
};