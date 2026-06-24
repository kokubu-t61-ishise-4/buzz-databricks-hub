'use client';

import { useState, useEffect, useCallback } from 'react';

const CACHE_DURATION = 30 * 60 * 1000; // 30分

export function useCachedFetch(apiEndpoint, cacheKey) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getCachedData = useCallback(() => {
    if (typeof window === 'undefined') return null;
    try {
      const cached = sessionStorage.getItem(cacheKey);
      if (!cached) return null;
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp > CACHE_DURATION) {
        sessionStorage.removeItem(cacheKey);
        return null;
      }
      return data;
    } catch {
      return null;
    }
  }, [cacheKey]);

  const setCachedData = useCallback((data) => {
    if (typeof window === 'undefined') return;
    try {
      sessionStorage.setItem(cacheKey, JSON.stringify({
        data,
        timestamp: Date.now()
      }));
    } catch {
      // sessionStorage full or unavailable
    }
  }, [cacheKey]);

  const fetchData = useCallback(async (forceRefresh = false) => {
    setLoading(true);
    setError(null);

    if (!forceRefresh) {
      const cached = getCachedData();
      if (cached) {
        setItems(cached);
        setLoading(false);
        return;
      }
    }

    try {
      const res = await fetch(apiEndpoint);
      let data;

      try {
        data = await res.json();
      } catch {
        throw new Error('サーバーからの応答を解析できませんでした。');
      }

      if (data.error) {
        throw new Error(data.message || data.error);
      }

      if (!Array.isArray(data)) {
        throw new Error('不正なデータ形式です。');
      }

      setItems(data);
      setCachedData(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      const cached = getCachedData();
      if (cached) {
        setItems(cached);
      }
    } finally {
      setLoading(false);
    }
  }, [apiEndpoint, getCachedData, setCachedData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refresh = useCallback(() => {
    fetchData(true);
  }, [fetchData]);

  return { items, loading, error, refresh };
}
