import { useCallback, useEffect, useState } from 'react';
import axiosClient from '../Api/axiosClient';
import { buildMoments } from '../content/activities';

// GET /moments — الشريط كما اختاره الأدمن (strip)، وبقية الصور (more: المجموعات بترتيبها وصور كل مجموعة بترتيب عشوائي
// في كل زيارة)، مع المجموعات المنشورة بترتيبها.
// status: loading | ready | empty | error
export function useMoments() {
  const [moments, setMoments] = useState(null);
  const [status, setStatus] = useState('loading');
  const load = useCallback(() => {
    let cancelled = false;
    setStatus('loading');
    axiosClient.get('/moments')
      .then((response) => {
        if (cancelled) return;
        const strip = Array.isArray(response.data?.strip) ? response.data.strip : [];
        const groups = Array.isArray(response.data?.groups) ? response.data.groups : [];
        const rest = Array.isArray(response.data?.more) ? response.data.more : [];
        const built = buildMoments(strip, groups, rest);
        setMoments(built);
        setStatus(built.strip.length ? 'ready' : 'empty');
      })
      .catch(() => { if (!cancelled) setStatus('error'); });
    return () => { cancelled = true; };
  }, []);
  useEffect(() => load(), [load]);
  return { moments, status, retry: load };
}
