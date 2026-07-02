// Basic Service Worker to satisfy PWA installability requirements
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Let the browser do its default thing for all requests
  event.respondWith(fetch(event.request));
});

self.addEventListener('push', (event) => {
  if (event.data) {
    try {
      const data = event.data.json();
      const options = {
        body: data.body || 'You have a new alert notification.',
        icon: data.icon || '/Stock_Island.svg',
        vibrate: [100, 50, 100],
        actions: data.actions || [],
        data: {
          url: data.url || '/',
          docUrl: data.docUrl || null
        }
      };
      event.waitUntil(self.registration.showNotification(data.title || 'Stock Alert', options));
    } catch (e) {
      console.error('Error parsing push data', e);
    }
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  let urlToOpen = '/';
  if (event.notification.data) {
    if (event.action === 'view_doc') {
      urlToOpen = event.notification.data.docUrl || '/';
    } else if (event.action === 'view_stock') {
      urlToOpen = event.notification.data.url || '/';
    } else {
      urlToOpen = event.notification.data.url || '/';
    }
  }
  
  // Make sure relative URLs are converted to absolute URLs
  if (urlToOpen.startsWith('/')) {
    urlToOpen = new URL(urlToOpen, self.location.origin).href;
  }
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Just focus or open
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url && 'focus' in client) {
          if (event.action !== 'view_doc') {
             client.focus();
          }
          break;
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
