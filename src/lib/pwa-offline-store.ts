/**
 * Mecanismo de persistência IndexedDB para operação Offline-First de Portaria
 * Armazena o manifesto de convidados e a fila de sincronização em segundo plano.
 */

const DB_NAME = "pulse8_pwa_db";
const DB_VERSION = 1;
const STORE_GUESTS = "guests_store";
const STORE_SYNC_QUEUE = "sync_queue";

export interface CachedGuest {
  id: string;
  qrCode: string;
  fullName: string;
  listName: string;
  listType?: string | null;
  status: string;
  checkedInAt?: string | null;
  notes?: string | null;
  eventId: string;
}

export interface PendingSyncItem {
  id: string;
  qrCode: string;
  scannedAt: string;
  guestId: string;
  eventId?: string;
  status: "pending" | "syncing" | "synced" | "failed";
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      return reject(new Error("IndexedDB não suportado neste navegador."));
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Store para Convidados (busca por id e por qrCode)
      if (!db.objectStoreNames.contains(STORE_GUESTS)) {
        const guestStore = db.createObjectStore(STORE_GUESTS, { keyPath: "id" });
        guestStore.createIndex("qrCode", "qrCode", { unique: false });
        guestStore.createIndex("eventId", "eventId", { unique: false });
      }

      // Store para Fila de Sincronização offline
      if (!db.objectStoreNames.contains(STORE_SYNC_QUEUE)) {
        const syncStore = db.createObjectStore(STORE_SYNC_QUEUE, { keyPath: "id" });
        syncStore.createIndex("status", "status", { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Salva ou atualiza um lote de convidados no IndexedDB (Manifesto Offline)
 */
export async function saveManifestToOfflineDb(eventId: string, guests: CachedGuest[]): Promise<number> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_GUESTS], "readwrite");
    const store = tx.objectStore(STORE_GUESTS);

    let count = 0;
    for (const g of guests) {
      store.put({ ...g, eventId });
      count++;
    }

    tx.oncomplete = () => resolve(count);
    tx.onerror = () => reject(tx.error);
  });
}

/**
 * Busca convidado localmente no IndexedDB pelo QR Code ou Guest ID
 */
export async function findGuestInOfflineDb(qrCodeOrId: string): Promise<CachedGuest | null> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_GUESTS], "readonly");
    const store = tx.objectStore(STORE_GUESTS);

    // Tentar busca direta por ID
    const getByIdReq = store.get(qrCodeOrId);
    getByIdReq.onsuccess = () => {
      if (getByIdReq.result) {
        return resolve(getByIdReq.result);
      }

      // Se não encontrou por ID, buscar pelo index de qrCode
      const qrIndex = store.index("qrCode");
      const getByQrReq = qrIndex.get(qrCodeOrId);
      getByQrReq.onsuccess = () => resolve(getByQrReq.result || null);
      getByQrReq.onerror = () => reject(getByQrReq.error);
    };
    getByIdReq.onerror = () => reject(getByIdReq.error);
  });
}

/**
 * Atualiza status do convidado localmente no IndexedDB
 */
export async function markLocalCheckInInOfflineDb(guestId: string): Promise<CachedGuest> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_GUESTS], "readwrite");
    const store = tx.objectStore(STORE_GUESTS);

    const getReq = store.get(guestId);
    getReq.onsuccess = () => {
      const guest = getReq.result;
      if (!guest) {
        return reject(new Error("Convidado não encontrado no cache"));
      }

      guest.status = "checked_in";
      guest.checkedInAt = new Date().toISOString();

      const putReq = store.put(guest);
      putReq.onsuccess = () => resolve(guest);
      putReq.onerror = () => reject(putReq.error);
    };
    getReq.onerror = () => reject(getReq.error);
  });
}

/**
 * Enfileira um check-in para sincronização posterior com a API
 */
export async function enqueueOfflineCheckIn(item: PendingSyncItem): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_SYNC_QUEUE], "readwrite");
    const store = tx.objectStore(STORE_SYNC_QUEUE);
    const req = store.put(item);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

/**
 * Retorna todos os check-ins pendentes de sincronização
 */
export async function getPendingOfflineCheckIns(): Promise<PendingSyncItem[]> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_SYNC_QUEUE], "readonly");
    const store = tx.objectStore(STORE_SYNC_QUEUE);
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

/**
 * Remove item sincronizado da fila
 */
export async function removeSyncedCheckIn(id: string): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_SYNC_QUEUE], "readwrite");
    const store = tx.objectStore(STORE_SYNC_QUEUE);
    const req = store.delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

/**
 * Retorna total de convidados armazenados em cache
 */
export async function getCachedGuestsCount(): Promise<number> {
  try {
    const db = await openDatabase();
    return new Promise((resolve) => {
      const tx = db.transaction([STORE_GUESTS], "readonly");
      const store = tx.objectStore(STORE_GUESTS);
      const req = store.count();
      req.onsuccess = () => resolve(req.result || 0);
      req.onerror = () => resolve(0);
    });
  } catch {
    return 0;
  }
}
