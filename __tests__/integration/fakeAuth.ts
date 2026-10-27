/** Firebase Auth simulado: el estado vive en el objeto `auth` que recibe cada función. */
export interface FakeAuth { users: Map<string, { uid: string; email: string; password: string }>; currentUser: { uid: string; email: string } | null }
export const makeFakeAuth = (): FakeAuth => ({ users: new Map(), currentUser: null });

const fail = (code: string) => Object.assign(new Error(code), { code });
const open = (auth: FakeAuth, u: { uid: string; email: string }) => {
  auth.currentUser = { uid: u.uid, email: u.email };
  return { user: auth.currentUser };
};

export const createUserWithEmailAndPassword = async (auth: FakeAuth, email: string, password: string) => {
  if (auth.users.has(email)) throw fail('auth/email-already-in-use');
  const u = { uid: `uid-${auth.users.size + 1}`, email, password };
  auth.users.set(email, u);
  return open(auth, u);
};
export const signInWithEmailAndPassword = async (auth: FakeAuth, email: string, password: string) => {
  const u = auth.users.get(email);
  if (!u || u.password !== password) throw fail('auth/invalid-credential');
  return open(auth, u);
};
export const signOut = async (auth: FakeAuth) => { auth.currentUser = null; };
export const sendPasswordResetEmail = async (auth: FakeAuth, email: string) => {
  if (!auth.users.has(email)) throw fail('auth/user-not-found');
};
