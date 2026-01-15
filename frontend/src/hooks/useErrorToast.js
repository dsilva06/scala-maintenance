import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { getErrorMessage } from '@/lib/errors';

export function useErrorToast(error, fallback) {
  const lastMessageRef = useRef(null);

  useEffect(() => {
    if (!error) {
      return;
    }

    const message = getErrorMessage(error, fallback);

    if (message === lastMessageRef.current) {
      return;
    }

    lastMessageRef.current = message;
    toast.error(message);
  }, [error, fallback]);
}
