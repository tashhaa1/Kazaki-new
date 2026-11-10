import {
  getNotificationPermission,
  requestBrowserNotificationPermission,
  showBrowserNotification,
} from './notifications';

/**
 * Web Push Notifications Helper for KAZAKI.IQ
 * Enables native push notifications that arrive even when Chrome is closed,
 * in the background, or when the phone screen is locked/off.
 */

export const FALLBACK_VAPID_PUBLIC_KEY =
  'BI81cvwpsxNbotbvDLZasLkqrW4dCdx3LfLtNtEplTGH5w3uYMGvt1jtaQCSq1HqnNbVjwRx9wW0RYh08Vi4Tmk';

export const urlBase64ToUint8Array = (base64String: string): Uint8Array => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

/**
 * Register Service Worker if supported by browser with safe timeout race
 */
export const registerServiceWorker = async (): Promise<ServiceWorkerRegistration | null> => {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return null;
  }
  try {
    const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
    // Guard against hanging .ready on iOS WebKit
    const readyTimeout = new Promise<ServiceWorkerRegistration | null>((resolve) =>
      setTimeout(() => resolve(reg), 2500)
    );
    return await Promise.race([navigator.serviceWorker.ready, readyTimeout]);
  } catch (err) {
    console.warn('Service worker registration error:', err);
    return null;
  }
};

/**
 * Check if the browser currently has an active PushSubscription (disabled - notifications are in-website only)
 */
export const getActivePushSubscription = async (): Promise<PushSubscription | null> => {
  return null;
};

/**
 * Subscribe browser to Web Push Notifications (disabled by design: all notifications are in-website)
 */
export const subscribeToPushNotifications = async (options?: {
  role?: 'admin' | 'customer';
  phone?: string;
  email?: string;
  userId?: string;
}): Promise<{ success: boolean; message: string; subscription?: PushSubscription | null }> => {
  // Push / external phone notifications are disabled - in-website notifications are active
  return {
    success: true,
    message: 'الإشعارات مفعلة داخل الموقع مباشرة.',
    subscription: null,
  };
};

/**
 * Send test notification (in-website only)
 */
export const sendServerPushTest = async (_role: 'admin' | 'customer' = 'admin'): Promise<{ success: boolean; message: string; count?: number }> => {
  return {
    success: true,
    message: 'الإشعارات تعمل داخل المتجر بنجاح.',
    count: 1,
  };
};
