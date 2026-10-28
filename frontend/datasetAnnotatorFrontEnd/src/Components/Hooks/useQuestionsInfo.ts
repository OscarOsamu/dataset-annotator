import { useEffect, useState } from 'react';
import { apiConfig } from '../../configuration';
import { type Question, ApiApi } from '../../api';

export const useQuestionInfo = (id?: number) => {
  const [loading, setLoading] = useState(true);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [error, setError] = useState<any>(null);
  const [questionInfo, setQuestionInfo] = useState<Question>();

  useEffect(() => {
    if (!id){
        return;
    }
    const api = new ApiApi(apiConfig);

    api.apiQuestionsRetrieve(id)
      .then((res) => setQuestionInfo(res.data))
      .catch((err) => setError(err))
      .finally(() => setLoading(false));
  }, [id]);

  return { questionInfo, loading, error };
};