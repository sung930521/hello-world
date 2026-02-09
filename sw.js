const CACHE_NAME = "babyguard-v1";
const ASSETS = [
  "./",
  "index.html",
  "splash.html",
  "scanner.html",
  "result.html",
  "dictionary.html",
  "app.js",
  "styles.css",
  "manifest.json",
  "images/create-octocat.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
