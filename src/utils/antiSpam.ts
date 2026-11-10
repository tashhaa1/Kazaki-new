/**
 * KAZAKI.IQ Anti-Spam & Click-Flood Protection Utility
 * Provides debounce, rate-limiting, and synchronous click-lock mechanisms
 * to prevent duplicate orders, repeated cart floods, and form submission spam.
 */

// Memory store for rate limiting by action key
interface RateLimitRecord {
  timestamps: number[];
  lockedUntil?: number;
}

const rateLimitStore: Record<string, RateLimitRecord> = {};

// Active in-flight locks to prevent simultaneous duplicate executions
const activeLocks = new Set<string>();

// Global click timestamp tracker for quick debounce
const lastClickTimestamps: Record<string, number> = {};

// Toast callback for spam warnings
type SpamNotifier = (message: string) => void;
let globalSpamNotifier: SpamNotifier | null = null;

export const setGlobalSpamNotifier = (notifier: SpamNotifier) => {
  globalSpamNotifier = notifier;
};

export const showSpamAlert = (message: string) => {
  if (globalSpamNotifier) {
    globalSpamNotifier(message);
  } else {
    console.warn('[Anti-Spam]', message);
  }
};

/**
 * Checks if a rapid click should be blocked (Debounce / Throttle)
 * @param actionId Unique identifier for this button/action
 * @param minIntervalMs Minimum allowed time between clicks in milliseconds (default: 800ms)
 * @returns boolean: true if allowed, false if blocked as spam
 */
export const checkClickAllowed = (
  actionId: string,
  minIntervalMs: number = 800,
  alertUser: boolean = true
): boolean => {
  const now = Date.now();
  const lastTime = lastClickTimestamps[actionId] || 0;
  const timeSinceLast = now - lastTime;

  if (timeSinceLast < minIntervalMs) {
    if (alertUser) {
      showSpamAlert('تم استلام ضغطتك! يرجى الانتظار لحظة لمنع التكرار.');
    }
    return false;
  }

  // Check if locked
  if (activeLocks.has(actionId)) {
    if (alertUser) {
      showSpamAlert('العملية قيد التنفيذ حالياً، يرجى الانتظار...');
    }
    return false;
  }

  lastClickTimestamps[actionId] = now;
  return true;
};

/**
 * Locks an action key while an asynchronous task is running
 */
export const lockAction = (actionId: string): boolean => {
  if (activeLocks.has(actionId)) {
    return false;
  }
  activeLocks.add(actionId);
  return true;
};

/**
 * Unlocks an action key after task completion
 */
export const unlockAction = (actionId: string): void => {
  activeLocks.delete(actionId);
};

/**
 * Advanced Rate Limiter (e.g. max N actions per windowMs)
 * Used for high-stakes actions like Placing Orders, Promo Code Attempts, and Support Messages.
 * @param actionType e.g. 'order_submit', 'promo_attempt', 'contact_submit'
 * @param maxAttempts Max allowed attempts within the window
 * @param windowMs Time window in milliseconds (e.g. 60,000 for 1 minute)
 * @param lockDurationMs Lock duration if exceeded (default: 30,000ms)
 */
export const checkRateLimit = (
  actionType: string,
  maxAttempts: number = 3,
  windowMs: number = 60000,
  lockDurationMs: number = 30000
): { allowed: boolean; waitSeconds?: number; message?: string } => {
  const now = Date.now();
  let record = rateLimitStore[actionType];

  if (!record) {
    record = { timestamps: [] };
    rateLimitStore[actionType] = record;
  }

  // Check if currently locked
  if (record.lockedUntil && now < record.lockedUntil) {
    const remainingSeconds = Math.ceil((record.lockedUntil - now) / 1000);
    return {
      allowed: false,
      waitSeconds: remainingSeconds,
      message: `تم حظر المحاولات المتكررة مؤقتاً لحماية أمانك. يرجى الانتظار ${remainingSeconds} ثانية.`,
    };
  }

  // Filter timestamps within the current window
  record.timestamps = record.timestamps.filter((t) => now - t < windowMs);

  if (record.timestamps.length >= maxAttempts) {
    record.lockedUntil = now + lockDurationMs;
    const waitSeconds = Math.ceil(lockDurationMs / 1000);
    return {
      allowed: false,
      waitSeconds,
      message: `تنبيه حماية: تم رصد ضغطات سريعة متتالية. تم قفل المحاولات لمدة ${waitSeconds} ثانية لمنع التكرار.`,
    };
  }

  // Record this attempt
  record.timestamps.push(now);
  return { allowed: true };
};

/**
 * Higher-order function to wrap any click handler with instant spam protection
 */
export function withAntiSpam<T extends (...args: any[]) => any>(
  fn: T,
  actionId: string,
  minIntervalMs: number = 900
): (...args: Parameters<T>) => ReturnType<T> | void {
  return (...args: Parameters<T>) => {
    if (!checkClickAllowed(actionId, minIntervalMs)) {
      return;
    }
    return fn(...args);
  };
}
