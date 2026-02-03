import { useEffect, useState } from 'react';

export default function useDebounce<T>(value: T, delayMs: number = 300) {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedValue(value), delayMs);
    return () => window.clearTimeout(t);
  }, [value, delayMs]);

  return debouncedValue;
}
