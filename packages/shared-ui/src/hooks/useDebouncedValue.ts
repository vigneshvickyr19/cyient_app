import { useEffect, useState } from 'react';

/** The value once it has stopped changing for `delayMs`, so a lookup isn't sent for every key pressed. */
export function useDebouncedValue<T extends string | number | null>(value: T, delayMs = 400): T {
  const [settled, setSettled] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => {
      setSettled(value);
    }, delayMs);
    return () => {
      clearTimeout(timer);
    };
  }, [value, delayMs]);
  return settled;
}
