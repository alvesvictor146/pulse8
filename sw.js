/**
 * Service Worker Pulse8 — PWA Check-in com suporte offline e Background Sync
 * Versão 2.0 — usa estratégia Network-First para /api/checkin
 * e Cache-First para assets estáticos.
 */

const CACHE_NAME = "pulse8-checkin-v2";
const OFFLINE_PAGES = ["/checkin"];

// ── Install ────────────────────────────────────────────────────────────────
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(OFFLINE_PAGES).catch((err) => {
        console.warn("[SW] Cache install parcial:", err);
      });
    })
  );
  self.skipWaiting();
});

// ── Activate ───────────────────────────────────────────────────────────────
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => {
            console.log("[SW] Removendo cache antigo:", key);
            return caches.delete(key);
          })
      )
    )
  );
  self.clients.claim();
});

// ── Fetch ──────────────────────────────────────────────────────────────────
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Estratégia Network-First para o endpoint de check-in com fallback offline
  if (url.pathname === "/api/checkin" && event.request.method === "POST") {
    event.respondWith(
      fetch(event.request.clone())
        .then((response) => response)
        .catch(() => {
          // Notificar o cliente sobre modo offline
          self.clients.matchAll().then((clients) => {
            clients.forEach((client) => {
              client.postMessage({ type: "CHECKIN_OFFLINE_QUEUED" });
            });
          });
          return new Response(
            JSON.stringify({
              offline: true,
              message: "Check-in registrado offline — será sincronizado automaticamente",
            }),
            {
              status: 200,
              headers: { "Content-Type": "application/json" },
            }
          );
        })
    );
    return;
  }

  // Estratégia Cache-First para assets estáticos do Next.js
  if (
    url.pathname.startsWith("/_next/static") ||
    url.pathname.startsWith("/icons") ||
    url.pathname === "/manifest.json" ||
    url.pathname.endsWith(".png") ||
    url.pathname.endsWith(".ico")
  ) {
    event.respondWith(
      caches.match(event.request).then(
        (cached) => cached || fetch(event.request)
      )
    );
    return;
  }
});

// ── Background Sync ────────────────────────────────────────────────────────
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-checkins") {
    event.waitUntil(syncOfflineCheckins());
  }
});

async function syncOfflineCheckins() {
  try {
    const db = await openOfflineDb();
    const pendingCheckins = await getAllPending(db);

    console.log(`[SW] Sincronizando ${pendingCheckins.length} check-ins offline...`);

    for (const checkin of pendingCheckins) {
      try {
        const res = await fetch("/api/checkin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(checkin.data),
        });
        if (res.ok) {
          await deletePending(db, checkin.id);
          console.log(`[SW] Check-in ${checkin.id} sincronizado com sucesso`);
        }
      } catch {
        console.warn(`[SW] Falha ao sincronizar check-in ${checkin.id} — tentará novamente`);
      }
    }

    // Notificar clientes sobre sincronização concluída
    self.clients.matchAll().then((clients) => {
      clients.forEach((client) => {
        client.postMessage({ type: "SYNC_COMPLETE", count: pendingCheckins.length });
      });
    });
  } catch (err) {
    console.error("[SW] Erro no sync:", err);
  }
}

// ── IndexedDB helpers ──────────────────────────────────────────────────────
function openOfflineDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open("pulse8-offline", 1);
    req.onupgradeneeded = (e) => {
      e.target.result.createObjectStore("pending-checkins", {
        keyPath: "id",
        autoIncrement: true,
      });
    };
    req.onsuccess = (e) => resolve(e.target.result);
    req.onerror = () => reject(req.error);
  });
}

function getAllPending(db) {
  return new Promise((resolve) => {
    const tx = db.transaction("pending-checkins", "readonly");
    const req = tx.objectStore("pending-checkins").getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => resolve([]);
  });
}

function deletePending(db, id) {
  return new Promise((resolve) => {
    const tx = db.transaction("pending-checkins", "readwrite");
    tx.objectStore("pending-checkins").delete(id);
    tx.oncomplete = resolve;
  });
}
