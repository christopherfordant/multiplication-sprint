const CACHE_NAME = "multiplication-sprint-v21-immersive-journey";
const APP_SHELL = [
  "./",
  "./index.html",
  "./style.css?v=20260423c",
  "./animations-enhanced.css?v=20260421c",
  "./script.js?v=20260423c",
  "./map-scene.js?v=20260423c",
  "./node_modules/three/build/three.module.js",
  "./api-sync.js",
  "./checkpoint-animations.js",
  "./assets/world/world-map-premium-v1.png",
  "./assets/characters/hero-mascot-premium-v2.png",
  "./manifest.webmanifest",
  "./favicon.svg",
  "./icon-192.svg",
  "./icon-512.svg"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  const acceptsHtml = event.request.headers.get("accept")?.includes("text/html");

  if (acceptsHtml) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match(event.request).then((cached) => cached || caches.match("./index.html")))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) {
        return cached;
      }
      return fetch(event.request).then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return response;
      });
    })
  );
});
