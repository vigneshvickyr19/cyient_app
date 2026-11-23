import { QUERY_PARAMS } from '@cyient/shared-utils';
import { useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router';

export interface UseTabStateOptions<T extends string> {
  /** The URL query parameter key, defaults to 'tab'. */
  paramName?: string;
  /** The default tab to use when no tab or an invalid tab is in the route. */
  defaultTab: T;
  /** All valid tab identifiers. */
  validTabs: readonly T[];
  /** Optional custom validator for dynamic or conditional tabs. */
  isValidTab?: (tab: string) => boolean;
  /** Whether to clear the param from the URL when activeTab is defaultTab (defaults to true). */
  clearDefaultParam?: boolean;
}

export interface UseTabStateReturn<T extends string> {
  activeTab: T;
  setTab: (tab: T | string) => void;
}

/**
 * Manages active tab state synchronized with URL search parameters.
 * Supports browser back/forward navigation and gracefully falls back / redirects on invalid tabs.
 */
export function useTabState<T extends string>({
  paramName = QUERY_PARAMS.TAB,
  defaultTab,
  validTabs,
  isValidTab,
  clearDefaultParam = true,
}: UseTabStateOptions<T>): UseTabStateReturn<T> {
  const [params, setParams] = useSearchParams();

  const rawParam = params.get(paramName);
  const checkValid = useCallback(
    (val: string): boolean => {
      if (isValidTab) {
        return isValidTab(val);
      }
      return validTabs.includes(val as T);
    },
    [isValidTab, validTabs],
  );

  const isValid = rawParam !== null && checkValid(rawParam);
  const activeTab: T = isValid ? (rawParam as T) : defaultTab;

  // Clean up invalid tab routes gracefully
  useEffect(() => {
    if (rawParam !== null && !checkValid(rawParam)) {
      setParams(
        (current) => {
          const next = new URLSearchParams(current);
          next.delete(paramName);
          return next;
        },
        { replace: true },
      );
    }
  }, [rawParam, checkValid, paramName, setParams]);

  const setTab = useCallback(
    (newTab: T | string) => {
      const targetTab = checkValid(newTab) ? (newTab as T) : defaultTab;
      setParams(
        (current) => {
          const next = new URLSearchParams(current);
          if (clearDefaultParam && targetTab === defaultTab) {
            next.delete(paramName);
          } else {
            next.set(paramName, targetTab);
          }
          return next;
        },
        { replace: false }, // Push history entry so browser back / forward navigation works
      );
    },
    [checkValid, clearDefaultParam, defaultTab, paramName, setParams],
  );

  return { activeTab, setTab };
}
