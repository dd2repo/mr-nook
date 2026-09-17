// Service worker: caches the app shell, and serves downloaded audiobooks from disk.
//
// A downloaded book is stored as one full response in AUDIO_CACHE. The audio element always
// asks for byte ranges, so a cached book gets sliced here and handed back as a 206. Books
// that were not downloaded go straight to the network.
const VERSION = 'mr-nook-v23';
const AUDIO_CACHE = 'mr-nook-audio';
const SHELL = [
  '/',
  '/index.html',
  '/app.js',
  '/styles.css',
  '/manifest.webmanifest',
  '/icons/favicon.png',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon-512-maskable.png',
  '/icons/apple-touch-icon.png',
  '/img/nook-pixel.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(VERSION).then((cache) => cache.addAll(SHELL)).then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      // Downloaded books survive app updates; only stale shell caches go.
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION && k !== AUDIO_CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('message', (event) => {
  if (event.data === 'clear-cache') {
    // Downloads are the user's data, not cache, so they stay.
    event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== AUDIO_CACHE).map((k) => caches.delete(k)))));
  }
});

// Serves a byte range out of a full cached response.
async function rangeFromCache(cached, rangeHeader) {
  // blob.slice() is a view, so a seek does not pull a whole audiobook into memory.
  const blob = await cached.blob();
  const size = blob.size;
  const type = blob.type || cached.headers.get('content-type') || 'audio/mpeg';
  const base = { 'content-type': type, 'accept-ranges': 'bytes', 'x-mr-nook-source': 'download' };
  const match = /^bytes=(\d*)-(\d*)$/.exec((rangeHeader || '').trim());

  if (!match || (match[1] === '' && match[2] === '')) {
    return new Response(blob, { status: 200, headers: { ...base, 'content-length': String(size) } });
  }

  let start;
  let end;
  if (match[1] === '') {
    const suffix = Math.min(Number(match[2]), size);
    start = size - suffix;
    end = size - 1;
  } else {
    start = Number(match[1]);
    end = match[2] === '' ? size - 1 : Math.min(Number(match[2]), size - 1);
  }
  if (!(start >= 0) || start >= size || end < start) {
    return new Response(null, { status: 416, headers: { ...base, 'content-range': `bytes */${size}` } });
  }
  return new Response(blob.slice(start, end + 1, type), {
    status: 206,
    headers: { ...base, 'content-length': String(end - start + 1), 'content-range': `bytes ${start}-${end}/${size}` },
  });
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/api/')) return;

  if (url.pathname.startsWith('/media/')) {
    if (!url.pathname.endsWith('/audio')) {
      event.respondWith(fetch(request));
      return;
    }
    event.respondWith((async () => {
      const cache = await caches.open(AUDIO_CACHE);
      const cached = await cache.match(url.pathname);
      if (cached) return rangeFromCache(cached, request.headers.get('range'));
      return fetch(request);
    })());
    return;
  }

  // App shell: network first, cache fallback.
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(VERSION).then((cache) => cache.put(request, copy)).catch(() => {});
        }
        return response;
      })
      .catch(() =>
        caches.match(request, { ignoreSearch: true }).then((hit) => hit || (request.mode === 'navigate' ? caches.match('/index.html') : Response.error())),
      ),
  );
});
