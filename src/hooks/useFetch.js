import axios from 'axios';
import { useEffect, useRef, useState, useMemo } from 'react';
import { getItem, setItem } from '@/lib/utils/localStorage';

import api from '@/api';

const STALE_TIME = 5 * 60 * 1000;

const useFetch = (url, options) => {
  const [data, setData] = useState();
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const abortController = useRef(null);

  const storageKey = useMemo(() => {
    if (!options?.params) {
      return url;
    }
    return `${url}?${JSON.stringify(options.params)}`;
  }, [options, url]);

  useEffect(() => {
    const fetchData = async () => {
      const currentTime = new Date().getTime();
      const cachedData = getItem(storageKey);

      if (cachedData && currentTime - cachedData.lastFetched < STALE_TIME) {
        setData(cachedData.data);
        setIsLoading(false);
        return;
      }

      abortController.current = new AbortController();

      setIsLoading(true);
      setError(null);

      try {
        const response = await api.get(url, {
          ...options,
          signal: abortController.current?.signal,
        });
        setData(response.data);
      } catch (error) {
        if (axios.isCancel(error)) {
          return;
        }
        setError('Something went wrong. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    return () => {
      abortController.current?.abort();
    };
  }, [url, options, storageKey]);

  useEffect(() => {
    if (!data) return;

    setItem(storageKey, {
      lastFetched: new Date().getTime(),
      data,
    });
  }, [data, storageKey]);

  return { data, error, isLoading };
};

export default useFetch;
