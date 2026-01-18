import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { getErrorDetails, getErrorMessage } from '@/lib/errors';

export function useErrorToast(error, fallback) {
  const lastMessageRef = useRef(null);

  useEffect(() => {
    if (!error) {
      return;
    }

    const message = getErrorMessage(error, fallback);
    const details = getErrorDetails(error);
    const title = fallback ?? message;

    if (message === lastMessageRef.current) {
      return;
    }

    lastMessageRef.current = message;
    toast.error(title, {
      description: details && details !== title ? details : undefined,
    });
  }, [error, fallback]);
}
