// Offline for the web hub: the hub shell is cached on install; every game file is cached the first time it loads
// (stale-while-revalidate), so a game played once works without internet. Bump VERSION to drop old caches.
const VERSION = 'sains-v1';
const SHELL = ['./', './index.html', './games.json', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const r = e.request; if (r.method !== 'GET' || new URL(r.url).origin !== location.origin) return;
  e.respondWith(caches.open(VERSION).then(async c => {
    const hit = await c.match(r, { ignoreSearch: true });
    const net = fetch(r).then(res => { if (res.ok && res.status === 200) c.put(r, res.clone()); return res; }).catch(() => hit);
    return hit || net;
  }));
});
