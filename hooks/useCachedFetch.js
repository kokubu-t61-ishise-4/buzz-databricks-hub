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
      const data = await res.json();

      if (data.error === 'RATE_LIMIT') {
        throw new Error(data.message || 'APIの利用制限に達しました。しばらく待ってから再取得してください。');
      }
      if (data.error) {
        throw new Error(data.error);
      }

      setItems(data);
      setCachedData(data);
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
