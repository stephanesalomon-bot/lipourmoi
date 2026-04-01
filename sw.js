// LIPOURMOI — Service Worker
// ⚠️ Changer le numéro de version à chaque mise à jour force le rechargement automatique
const CACHE = 'lipourmoi-v3';
const ASSETS = ['./index.html', './manifest.json'];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS))
  );
  // Force l'activation immédiate sans attendre la fermeture des onglets
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  // Supprime tous les anciens caches automatiquement
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  // Prend le contrôle immédiatement de tous les onglets ouverts
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  // Stratégie "network first" : essaie le réseau en priorité, cache en fallback
  // Ainsi les mises à jour sont toujours récupérées dès que possible
  e.respondWith(
    fetch(e.request)
      .then(response => {
        // Mettre en cache la réponse fraîche
        const clone = response.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return response;
      })
      .catch(() => caches.match(e.request))
  );
});
