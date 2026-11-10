import { useState, useCallback, useRef } from 'react';
import { checkClickAllowed, lockAction, unlockAction, checkRateLimit } from '../utils/antiSpam';

interface GuardOptions {
  minIntervalMs?: number;
  rateLimitType?: string;
  maxAttempts?: number;
  windowMs?: number;
  lockDurationMs?: number;
  onSpamDetected?: (msg: string) => void;
}

export const useAntiSpam = () => {
  const [spamAlert, setSpamAlert] = useState<string | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const triggerAlert = useCallback((message: string) => {
    setSpamAlert(message);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => {
      setSpamAlert(null);
    }, 3000);
  }, []);

  const guard = useCallback(
    async <T,>(
      actionId: string,
      asyncCallback: () => Promise<T> | T,
      options: GuardOptions = {}
    ): Promise<T | null> => {
      const {
        minIntervalMs = 900,
        rateLimitType,
        maxAttempts = 4,
        windowMs = 60000,
        lockDurationMs = 30000,
        onSpamDetected,
      } = options;

      // 1. Rate limiter check if specified
      if (rateLimitType) {
        const rateCheck = checkRateLimit(rateLimitType, maxAttempts, windowMs, lockDurationMs);
        if (!rateCheck.allowed) {
          const msg = rateCheck.message || 'تم تجاوز الحد الأقصى للمحاولات السريعة. يرجى الانتظار.';
          triggerAlert(msg);
          if (onSpamDetected) onSpamDetected(msg);
          return null;
        }
      }

      // 2. Debounce & In-flight check
      if (!checkClickAllowed(actionId, minIntervalMs, false)) {
        const msg = 'حماية من التكرار: تم تسجيل ضغطتك الأولى وهي قيد التنفيذ!';
        triggerAlert(msg);
        if (onSpamDetected) onSpamDetected(msg);
        return null;
      }

      // 3. Acquire synchronous lock
      if (!lockAction(actionId)) {
        const msg = 'العملية قيد المعالجة حالياً، يرجى الانتظار وعدم التكرار.';
        triggerAlert(msg);
        if (onSpamDetected) onSpamDetected(msg);
        return null;
      }

      try {
        const result = await asyncCallback();
        return result;
      } finally {
        // Unlock after execution + short cooldown
        setTimeout(() => {
          unlockAction(actionId);
        }, 300);
      }
    },
    [triggerAlert]
  );

  return {
    guard,
    spamAlert,
    dismissAlert: () => setSpamAlert(null),
    triggerAlert,
  };
};
