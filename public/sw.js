// Replaces the old Workbox SW so returning users stop receiving cached SPA assets.
// Cache Storage is origin-scoped; only delete Workbox caches for this scope.

// The pre-migration worker was hand-written and cached under this name.
const LEGACY_APP_CACHES = ["woonaanbod-nl-v1"];

function isWorkboxCacheForThisRegistration(name) {
  if (LEGACY_APP_CACHES.includes(name)) return true;
  const hasWorkboxBucket = /(^|-)precache-v\d+-|(^|-)runtime-|(^|-)googleAnalytics-/.test(name);
  return hasWorkboxBucket && name.endsWith(self.registration.scope);
}

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      // activate fires once: any reject above unregister() would strand the SW
      // registered forever, so unregister() lives in finally.
      try {
        const cacheNames = await caches.keys();
        const workboxCacheNames = cacheNames.filter(isWorkboxCacheForThisRegistration);
        await Promise.allSettled(workboxCacheNames.map((name) => caches.delete(name)));
        await self.clients.claim();
        const windowClients = await self.clients.matchAll({ type: "window" });
        await Promise.allSettled(
          windowClients.map((client) => client.navigate(client.url)),
        );
      } finally {
        await self.registration.unregister();
      }
    })(),
  );
});
