// KAZAKI.IQ Service Worker - Web Push & Offline Support
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

// 1. Push Event - Runs even when Chrome is closed, in background, or phone screen is locked
self.addEventListener('push', (event) => {
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = {
        title: 'إشعار من متجر KAZAKI.IQ',
        body: event.data.text(),
      };
    }
  }

  const title = data.title || 'إشعار جديد في متجر KAZAKI.IQ';
  const targetUrl = data.url || (data.data && data.data.url) || '/';

  const options = {
    body: data.body || 'يوجد تحديث جديد في متجر KAZAKI.IQ',
    icon: data.icon || '/logo.jpg',
    badge: data.badge || '/logo.jpg',
    tag: data.tag || `kazaki-${Date.now()}`,
    vibrate: data.vibrate || [300, 100, 300, 100, 300],
    data: {
      url: targetUrl,
      timestamp: Date.now(),
      ...data,
    },
    requireInteraction: true,
    renotify: true,
    actions: [
      {
        action: 'open',
        title: 'عرض التفاصيل',
      },
      {
        action: 'close',
        title: 'إغلاق',
      },
    ],
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// 2. Notification Click Event - Opens app or brings it to foreground
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  const targetUrl =
    (event.notification.data && event.notification.data.url) || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // If a window is already open, focus it and navigate
      for (const client of windowClients) {
        if ('focus' in client) {
          if ('navigate' in client && targetUrl !== '/') {
            client.navigate(targetUrl);
          }
          return client.focus();
        }
      }
      // If no window is open, open a new one
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
