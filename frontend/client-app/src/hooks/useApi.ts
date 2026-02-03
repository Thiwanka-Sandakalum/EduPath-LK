import { useCallback, useState } from 'react';

type ApiState<T> = {
  data: T | null;
  error: string | null;
  loading: boolean;
};

export default function useApi<T, Args extends any[]>(fn: (...args: Args) => Promise<T>) {
  const [state, setState] = useState<ApiState<T>>({ data: null, error: null, loading: false });

  const run = useCallback(
    async (...args: Args) => {
      setState({ data: null, error: null, loading: true });
      try {
        const data = await fn(...args);
        setState({ data, error: null, loading: false });
        return data;
      } catch (e: any) {
        setState({ data: null, error: e?.message || 'Request failed', loading: false });
        throw e;
      }
    },
    [fn]
  );

  return { ...state, run } as const;
}
