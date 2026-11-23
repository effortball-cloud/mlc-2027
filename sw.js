// 마요르카 보드 오프라인 캐시: 우리 사이트 파일과 글꼴만 저장(네트워크 먼저, 끊기면 저장본). 공유 데이터(Supabase)는 저장하지 않는다.
const CACHE = "mlc-2026-11-23 23:25 KST";
const SHELL = ["./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png", "./apple-touch-icon.png"];
self.addEventListener("install", e => {
  e.waitUntil((async () => {
    const c = await caches.open(CACHE);
    await Promise.all(SHELL.map(u => c.add(new Request(u, { cache: "reload" })).catch(() => {})));
    self.skipWaiting();
  })());
});
self.addEventListener("activate", e => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k !== CACHE && k.startsWith("mlc-")) await caches.delete(k);
    await self.clients.claim();
  })());
});
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  const u = new URL(e.request.url);
  const mine = u.origin === self.location.origin && u.pathname.startsWith(new URL(self.registration.scope).pathname);
  const font = u.hostname === "fonts.googleapis.com" || u.hostname === "fonts.gstatic.com";
  if (!mine && !font) return;
  e.respondWith((async () => {
    try {
      const r = await fetch(e.request);
      if (r && (r.ok || r.type === "opaque")) { const c = await caches.open(CACHE); c.put(e.request, r.clone()).catch(() => {}); }
      return r;
    } catch (err) {
      const m = await caches.match(e.request, { ignoreSearch: true });
      if (m) return m;
      throw err;
    }
  })());
});
