import {useEffect, useState, useCallback} from 'react';

export type MessageTone = 'success' | 'error' | 'info';

/**
 * Shared hook for module-level loading, data, messaging, and refresh logic.
 * Eliminates boilerplate duplicated across Git, SSH, Env, Node modules.
 */
export function useModule<T>(loader: () => Promise<T>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [messageTone, setMessageTone] = useState<MessageTone>('success');

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setData(await loader());
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to load module data.');
      setMessageTone('error');
    } finally {
      setLoading(false);
    }
  }, [loader]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const showMessage = useCallback((text: string, tone: MessageTone = 'success') => {
    setMessage(text);
    setMessageTone(tone);
  }, []);

  const clearMessage = useCallback(() => {
    setMessage('');
    setMessageTone('success');
  }, []);

  return {data, loading, message, messageTone, showMessage, clearMessage, refresh} as const;
}
