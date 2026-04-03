// v202604030704 - index.html 캐시 완전 제외
const CACHE_NAME = "career-mgmt-v202604030704";

// index.html은 캐시 목록에서 완전 제외 (항상 최신 버전 로드)
const CACHE_ASSETS = [
  "./manifest.json",
  "./icon-192.svg",
  "./icon-512.svg"
];

self.addEventListener("install", e => {
  // 아이콘·매니페스트만 캐시 (index.html 제외)
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return Promise.allSettled(CACHE_ASSETS.map(url => cache.add(url)));
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", e => {
  // 이전 버전 캐시 전부 삭제
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);

  // index.html 또는 루트 경로: 항상 네트워크에서 가져옴 (캐시 절대 사용 안함)
  if (
    url.pathname.endsWith("/") ||
    url.pathname.endsWith("/index.html") ||
    url.pathname.endsWith("index.html")
  ) {
    e.respondWith(
      fetch(e.request, { cache: "no-store" }).catch(() => {
        return new Response("오프라인 상태입니다. 인터넷에 연결 후 새로고침하세요.", {
          headers: { "Content-Type": "text/html; charset=utf-8" }
        });
      })
    );
    return;
  }

  // 아이콘·매니페스트: 캐시 우선
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
