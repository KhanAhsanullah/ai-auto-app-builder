import { useCallback, useEffect, useState } from 'react';
import { Linking } from 'react-native';

import { parseDeepLinkRoute, type DeepLinkRoute } from './deep-link.js';

/**
 * Subscribe to initial + subsequent deep links and map them to store routes.
 */
export function useDeepLinkRoute(initialRoute?: string): {
  route: string | undefined;
  setRoute: (route: string) => void;
} {
  const [route, setRoute] = useState<string | undefined>(initialRoute);

  const applyUrl = useCallback((url: string | null) => {
    const parsed = parseDeepLinkRoute(url);
    if (parsed) {
      setRoute(parsed);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    void Linking.getInitialURL().then((url) => {
      if (!cancelled) {
        applyUrl(url);
      }
    });
    const sub = Linking.addEventListener('url', (event) => {
      applyUrl(event.url);
    });
    return () => {
      cancelled = true;
      sub.remove();
    };
  }, [applyUrl]);

  return {
    route,
    setRoute: (next: string) => setRoute(next as DeepLinkRoute | string),
  };
}
