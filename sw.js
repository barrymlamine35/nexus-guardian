/* Nexus Guardian — service worker PWA.

   Stratégie network-first : le jeu charge toujours la version en ligne
   (les mises à jour arrivent immédiatement), le cache ne sert qu'en hors-ligne.
   On ne met en cache QUE les réponses réussies (200) : une page d'erreur
   (404, 500…) ne doit jamais être conservée, sinon elle peut resservir
   à la place du jeu quand le réseau flanche. */

const CACHE = 'nexus-guardian-v3';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Ne cacher que les réponses réussies : jamais une erreur.
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(event.request, copy)).catch(() => {});
        }
        return response;
      })
      .catch(() =>
        caches.match(event.request).then((cached) => {
          // Ne resservir qu'une copie réussie ; sinon, laisser l'erreur remonter.
          if (cached && cached.ok) return cached;
          throw new Error('hors-ligne, aucune copie valide en cache');
        })
      )
  );
});
