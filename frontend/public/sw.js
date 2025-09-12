const CACHE_NAME = "Weekendlyfe-cache-v1";
const toCache = ["/", "/_next/static/"];
self.addEventListener("install", (evt) => {
  self.skipWaiting();
  evt.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((c) =>
        c
          .addAll(toCache.map((x) => new Request(x, { ignoreSearch: true })))
          .catch(() => {})
      )
  );
});
self.addEventListener("fetch", (evt) => {
  evt.respondWith(
    caches.match(evt.request).then((r) => r || fetch(evt.request))
  );
});
