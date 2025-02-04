import { useEffect } from 'react';

const useRemoveQueryParam = (param: string) => {
  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.delete(param);
    window.history.replaceState({}, '', url.toString());
  }, [param]);
};

export default useRemoveQueryParam;