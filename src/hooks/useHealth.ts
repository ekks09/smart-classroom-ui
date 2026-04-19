import { useState, useEffect, useCallback } from 'react';
import { HealthStatus } from '@/types';
import { api } from '@/lib/api';
import { isSocketConnected } from '@/lib/socket';
import { config } from '@/lib/config';

/**
 * Hook to monitor backend health status
 */
export const useHealth = (enabled: boolean = true) => {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  const checkHealth = useCallback(async () => {
    if (!enabled) return;

    setLoading(true);
    setError(null);

    try {
      const data = await api.getHealth();
      setHealth(data);
      setLastCheck(new Date());
    } catch (err: any) {
      setError(err.message || 'Health check failed');
      setHealth({
        llm_ready: false,
        vector_db: { connected: false },
        stt_ready: false,
      });
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  // Auto-check health on mount and periodically
  useEffect(() => {
    if (!enabled) return;

    checkHealth();
    const interval = setInterval(checkHealth, config.cache.healthTTL);

    return () => clearInterval(interval);
  }, [enabled, checkHealth]);

  return {
    health,
    loading,
    error,
    lastCheck,
    isBackendOnline: !error && health !== null,
    isSocketConnected: isSocketConnected(),
    refetch: checkHealth,
  };
};

/**
 * Hook to monitor system status
 */
export const useSystemStatus = () => {
  const { health, isBackendOnline, isSocketConnected } = useHealth(true);

  const status = {
    backend: isBackendOnline,
    vectorDb: health?.vector_db?.connected || false,
    llm: health?.llm_ready || false,
    stt: health?.stt_ready || false,
    socket: isSocketConnected,
    allReady: isBackendOnline && health?.llm_ready && health?.vector_db?.connected,
  };

  return status;
};
