'use client';

import { useState, useEffect, useCallback } from 'react';

const CACHE_DURATION = 5 * 60 * 1000; // 5分

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
        console.log('[DEBUG] Using cached data for', apiEndpoint);
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

      let itemsData;
      if (Array.isArray(data)) {
        itemsData = data;
      } else if (data.items && Array.isArray(data.items)) {
        itemsData = data.items;
        if (data._debug) {
          console.log('[DEBUG] RSS Items:', data._debug.rssItems);
          console.log('[DEBUG] RSS Metadata:', data._debug.rssMetadata);
          console.log('[DEBUG] AI Indexes:', data._debug.aiIndexes);
        }
      } else {
        throw new Error('不正なデータ形式です。');
      }

      setItems(itemsData);
      setCachedData(itemsData);
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
