/* ============================================================
   sw.js — Service worker del 3 en raya (PWA)
   Estrategia: RED primero con respaldo en caché.
   - Con internet: siempre versión fresca (los assets cambian
     de nombre con cada build, así no hay cacheo obsoleto).
   - Sin internet: se sirve lo que haya en caché (offline).
   ============================================================ */

const CACHE = 'tres-en-raya-v1';
const CARCASA = ['./', './index.html', './manifest.json', './icons/favicon.svg'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(CARCASA))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((claves) =>
        Promise.all(claves.filter((clave) => clave !== CACHE).map((clave) => caches.delete(clave))),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const solicitud = event.request;
  if (solicitud.method !== 'GET') return;

  event.respondWith(
    fetch(solicitud)
      .then((respuesta) => {
        // Guardar copia para uso posterior (solo respuestas válidas)
        if (respuesta.ok && solicitud.url.startsWith(self.location.origin)) {
          const copia = respuesta.clone();
          caches.open(CACHE).then((cache) => cache.put(solicitud, copia));
        }
        return respuesta;
      })
      .catch(async () => {
        // Sin red: caché y, como último recurso, la página principal
        const guardada = await caches.match(solicitud);
        return guardada ?? (await caches.match('./index.html'));
      }),
  );
});
