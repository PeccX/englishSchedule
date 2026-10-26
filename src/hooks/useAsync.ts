import { useCallback, useEffect, useRef, useState } from 'react';
import { messageOf } from '@/core/messages';

// Caché local de lecturas: ante un fallo se siguen mostrando los últimos datos válidos.
const readCache = new Map<string, unknown>();
export const clearReadCache = () => readCache.clear();

export interface AsyncState<T> {
  data: T | undefined;
  error: string | null;
  loading: boolean;
  reload: () => void;
}

export function useAsync<T>(fn: () => Promise<T>, deps: unknown[], cacheKey?: string): AsyncState<T> {
  const [data, setData] = useState<T | undefined>(cacheKey ? (readCache.get(cacheKey) as T) : undefined);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);
  const fnRef = useRef(fn);
  fnRef.current = fn;

  useEffect(() => {
    let active = true;
    setLoading(true);
    fnRef
      .current()
      .then((value) => {
        if (!active) return;
        if (cacheKey) readCache.set(cacheKey, value);
        setData(value);
        setError(null);
      })
      .catch((e) => active && setError(messageOf(e)))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [...deps, tick]);

  const reload = useCallback(() => setTick((t) => t + 1), []);
  return { data, error, loading, reload };
}
