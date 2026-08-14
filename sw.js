/* ㈜대성건축사사무소 명함 PWA - 최소 서비스워커
   목적: 설치 가능(installable) 요건 충족 + 오프라인 기본 표시
   scope: /name-card/  (이 파일은 반드시 /name-card/sw.js 위치에 두어야 함)
   v2 (2026-08-14) : 정적 재구성판 자산 반영 — 폰트·이미지 프리캐시 추가 */
const CACHE = 'namecard-v2';
const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './og-image.jpg',
  './apple-touch-icon.png',
  './favicon.ico',
  './icon-192.png',
  './icon-512.png',
  './icon-maskable-512.png',
  './assets/fonts/manmin-fonts.css',
  './assets/fonts/NotoSansKR-var.woff2',
  './assets/img/mark-architect.jpg'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

/* network-first, 실패 시 캐시 → 마지막으로 index.html */
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copy)).catch(() => {});
        return res;
      })
      .catch(() => caches.match(e.request).then((m) => m || caches.match('./index.html')))
  );
});
