/** Mini Firestore en memoria para las pruebas: documentos, consultas, lotes y transacciones. */
type Data = Record<string, unknown>;
interface Ref { type: 'doc'; db: FakeDb; coll: string; id: string }
interface Coll { type: 'coll'; db: FakeDb; name: string }
interface Filter { field: string; op: string; value: unknown }
interface Query { type: 'query'; coll: Coll; filters: Filter[]; max?: number }

export interface FakeDb { docs: Map<string, Data>; chain: Promise<unknown> }
export const makeFakeDb = (): FakeDb => ({ docs: new Map(), chain: Promise.resolve() });

const NAME = Symbol('documentId');
let counter = 0;
const key = (r: Ref) => `${r.coll}/${r.id}`;
const snap = (r: Ref, d: Data | undefined) => ({ id: r.id, exists: () => d !== undefined, data: () => (d ? { ...d } : undefined) });
const yieldTick = () => new Promise<void>((r) => setImmediate(r));

export const collection = (db: FakeDb, name: string): Coll => ({ type: 'coll', db, name });
export const doc = (a: FakeDb | Coll, coll?: string, id?: string): Ref =>
  'type' in a ? { type: 'doc', db: a.db, coll: a.name, id: `auto-${++counter}` } : { type: 'doc', db: a, coll: coll as string, id: id as string };
export const documentId = () => NAME;
export const where = (field: unknown, op: string, value: unknown): Filter => ({ field: field === NAME ? '__name__' : (field as string), op, value });
export const limit = (n: number) => ({ limit: n });
export const query = (coll: Coll, ...parts: Array<Filter | { limit: number }>): Query => ({
  type: 'query', coll, filters: parts.filter((p): p is Filter => 'field' in p),
  max: (parts.find((p) => 'limit' in p) as { limit: number } | undefined)?.limit,
});

const matches = (id: string, d: Data, f: Filter) => {
  const v = f.field === '__name__' ? id : d[f.field];
  if (f.op === '==') return v === f.value;
  if (f.op === 'array-contains') return Array.isArray(v) && v.includes(f.value);
  if (f.op === '>=') return (v as string) >= (f.value as string);
  if (f.op === '<') return (v as string) < (f.value as string);
  throw new Error(`op no soportado: ${f.op}`);
};

export async function getDoc(r: Ref) {
  await yieldTick();
  return snap(r, r.db.docs.get(key(r)));
}

export async function getDocs(q: Coll | Query) {
  await yieldTick();
  const query_ = q.type === 'coll' ? { coll: q, filters: [] as Filter[], max: undefined } : q;
  const prefix = `${query_.coll.name}/`;
  let rows = [...query_.coll.db.docs.entries()]
    .filter(([k]) => k.startsWith(prefix))
    .map(([k, d]) => ({ id: k.slice(prefix.length), d }))
    .filter(({ id, d }) => query_.filters.every((f) => matches(id, d, f)))
    .sort((a, b) => a.id.localeCompare(b.id));
  if (query_.max) rows = rows.slice(0, query_.max);
  const docs = rows.map(({ id, d }) => snap({ type: 'doc', db: query_.coll.db, coll: query_.coll.name, id }, d));
  return { docs, empty: docs.length === 0, size: docs.length };
}

export async function setDoc(r: Ref, data: Data) {
  await yieldTick();
  r.db.docs.set(key(r), { ...data });
}

export const writeBatch = (db: FakeDb) => {
  const ops: Array<() => void> = [];
  return {
    set: (r: Ref, data: Data) => void ops.push(() => db.docs.set(key(r), { ...data })),
    commit: async () => { await yieldTick(); ops.forEach((o) => o()); },
  };
};

/** Las transacciones se serializan (como el resultado observable de Firestore con reintentos). */
export function runTransaction<T>(db: FakeDb, fn: (tx: unknown) => Promise<T>): Promise<T> {
  const run = db.chain.then(async () => {
    const writes: Array<() => void> = [];
    const tx = {
      get: async (r: Ref) => getDoc(r),
      set: (r: Ref, data: Data) => void writes.push(() => db.docs.set(key(r), { ...data })),
      update: (r: Ref, data: Data) => void writes.push(() => db.docs.set(key(r), { ...(db.docs.get(key(r)) ?? {}), ...data })),
      delete: (r: Ref) => void writes.push(() => db.docs.delete(key(r))),
    };
    const result = await fn(tx);
    writes.forEach((w) => w());
    return result;
  });
  db.chain = run.catch(() => undefined);
  return run;
}
