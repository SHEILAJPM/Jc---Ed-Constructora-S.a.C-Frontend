// IndexedDB mínimo (sin librerías: la app debe pesar poco en celulares de gama baja).
// "kv" guarda la sesión y la llave del dispositivo; "cola" los marcajes pendientes de enviar.

const NOMBRE = "jced-campo";
const VERSION = 1;

let db: Promise<IDBDatabase> | null = null;

function abrir(): Promise<IDBDatabase> {
  db ??= new Promise((resolve, reject) => {
    const r = indexedDB.open(NOMBRE, VERSION);
    r.onupgradeneeded = () => {
      const d = r.result;
      if (!d.objectStoreNames.contains("kv")) d.createObjectStore("kv");
      if (!d.objectStoreNames.contains("cola")) d.createObjectStore("cola", { keyPath: "idempotencia" });
    };
    r.onsuccess = () => resolve(r.result);
    r.onerror = () => reject(r.error);
  });
  return db;
}

async function tx<T>(store: string, modo: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const d = await abrir();
  return new Promise((resolve, reject) => {
    const t = d.transaction(store, modo);
    const req = fn(t.objectStore(store));
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export const kv = {
  get: <T>(clave: string) => tx<T | undefined>("kv", "readonly", (s) => s.get(clave) as IDBRequest<T | undefined>),
  set: (clave: string, valor: unknown) => tx("kv", "readwrite", (s) => s.put(valor, clave)),
  del: (clave: string) => tx("kv", "readwrite", (s) => s.delete(clave)),
};

export interface Pendiente {
  idempotencia: string;
  payload: string;
  firma: string;
  selfie: Blob;
  tipo: "ENTRADA" | "SALIDA";
  hora: string;
  intentos: number;
  ultimoError?: string;
}

export const cola = {
  todos: () => tx<Pendiente[]>("cola", "readonly", (s) => s.getAll() as IDBRequest<Pendiente[]>),
  guardar: (p: Pendiente) => tx("cola", "readwrite", (s) => s.put(p)),
  quitar: (id: string) => tx("cola", "readwrite", (s) => s.delete(id)),
};
