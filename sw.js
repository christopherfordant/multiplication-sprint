const CACHE_NAME = "multiplication-sprint-v25-character-hero-glb";
const APP_SHELL = [
  "./",
  "./index.html",
  "./style.css?v=20260423g",
  "./animations-enhanced.css?v=20260421c",
  "./script.js?v=20260423g",
  "./map-scene.js?v=20260423g",
  "./node_modules/three/build/three.module.js",
  "./node_modules/three/examples/jsm/loaders/GLTFLoader.js",
  "./api-sync.js",
  "./checkpoint-animations.js",
  "./assets/world/world-map-premium-v1.png",
  "./assets/characters/hero-mascot-premium-v2.png",
  "./assets/fourtout/textures/variation-a.png",
  "./assets/fourtout/GLB%20format/character-oobi.glb",
  "./assets/fourtout/GLB%20format/tree.glb",
  "./assets/fourtout/GLB%20format/tree-pine.glb",
  "./assets/fourtout/GLB%20format/rocks.glb",
  "./assets/fourtout/GLB%20format/flowers.glb",
  "./assets/fourtout/GLB%20format/mushrooms.glb",
  "./assets/fourtout/GLB%20format/sign.glb",
  "./assets/fourtout/GLB%20format/crate.glb",
  "./assets/fourtout/GLB%20format/platform-fortified.glb",
  "./assets/fourtout/GLB%20format/fence-rope.glb",
  "./assets/fourtout/GLB%20format/flag.glb",
  "./assets/fourtout/GLB%20format/chest.glb",
  "./assets/fourtout/GLB%20format/door-large-open.glb",
  "./assets/fourtout/GLB%20format/star.glb",
  "./assets/fourtout/GLB%20format/Textures/colormap.png",
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
