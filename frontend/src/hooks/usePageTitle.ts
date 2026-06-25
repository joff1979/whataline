import { useEffect } from 'react';

const SITE = 'What A Line';

export function usePageTitle(page?: string) {
  useEffect(() => {
    document.title = page ? `${page} | ${SITE}` : SITE;
    return () => { document.title = SITE; };
  }, [page]);
}
