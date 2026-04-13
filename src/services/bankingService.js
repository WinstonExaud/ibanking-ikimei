import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import {
  doc, getDoc, setDoc, collection,
  getDocs, query, where, orderBy, limit, onSnapshot,
  serverTimestamp, increment, runTransaction
} from 'firebase/firestore';
import { auth, db } from './firebase';

// ─── AUTH ─────────────────────────────────────────────────────────────────────
export const loginUser  = (email, password) => signInWithEmailAndPassword(auth, email, password);
export const logoutUser = () => signOut(auth);
export const onAuthChange = (cb) => onAuthStateChanged(auth, cb);

// ─── HELPERS ──────────────────────────────────────────────────────────────────
// Safely parse a Firestore balance field — handles string "NaN", null, undefined
const safeBalance = (val) => {
  const n = parseFloat(val);
  return isNaN(n) ? 0 : n;
};

// ─── USER ─────────────────────────────────────────────────────────────────────
export const getUserDoc = async (uid) => {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};

export const createUserDoc = async (uid, data) => {
  await setDoc(doc(db, 'users', uid), {
    ...data,
    balance: 0,
    createdAt: serverTimestamp(),
  });
};

export const getAllClients = async () => {
  const q = query(collection(db, 'users'), where('role', '==', 'client'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const onUsersSnapshot = (cb) => {
  return onSnapshot(collection(db, 'users'), snap =>
    cb(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  );
};

export const findClientByName = async (name) => {
  const snap = await getDocs(query(collection(db, 'users'), where('role', '==', 'client')));
  return snap.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .find(u => u.name?.toLowerCase().trim() === name.toLowerCase().trim()) || null;
};

export const createWalkInClient = async (name) => {
  const ref = doc(collection(db, 'users'));
  await setDoc(ref, {
    name: name.trim(),
    email: '',
    role: 'client',
    balance: 0,
    accountId: 'IKM' + Math.random().toString(36).substr(2, 6).toUpperCase(),
    walkIn: true,
    createdAt: serverTimestamp(),
  });
  return ref.id;
};

// ─── ACCOUNTS ─────────────────────────────────────────────────────────────────
export const createAccount = async (data) => {
  const ref = doc(collection(db, 'accounts'));
  await setDoc(ref, { ...data, balance: 0, createdAt: serverTimestamp() });
  return ref.id;
};

export const onAccountsSnapshot = (cb) => {
  return onSnapshot(collection(db, 'accounts'), snap =>
    cb(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  );
};

// ─── TRANSACTIONS ─────────────────────────────────────────────────────────────
export const getUserTransactions = async (userId) => {
  const q = query(
    collection(db, 'transactions'),
    where('toUserId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const onTransactionsSnapshot = (cb) => {
  const q = query(collection(db, 'transactions'), orderBy('createdAt', 'desc'), limit(50));
  return onSnapshot(q, snap => cb(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
};

// ─── DEPOSIT ──────────────────────────────────────────────────────────────────
export const depositToAccount = async (accountId, amount, note = '') => {
  const numAmount = parseFloat(amount);
  if (isNaN(numAmount) || numAmount <= 0) throw new Error('Invalid amount');

  await runTransaction(db, async (tx) => {
    const accRef = doc(db, 'accounts', accountId);
    const sysRef = doc(db, 'system', 'totals');

    const accSnap = await tx.get(accRef);
    if (!accSnap.exists()) throw new Error('Account not found');

    // Use safeBalance to handle corrupted "NaN" string in Firestore
    const currentBalance = safeBalance(accSnap.data().balance);
    const newBalance = currentBalance + numAmount;

    // Read current system total
    const sysSnap = await tx.get(sysRef);
    const currentTotal = sysSnap.exists() ? safeBalance(sysSnap.data().totalBalance) : 0;

    // Write explicit values — never use increment() on potentially corrupted fields
    tx.update(accRef, { balance: newBalance });
    tx.set(sysRef, { totalBalance: currentTotal + numAmount }, { merge: true });

    // Record transaction
    tx.set(doc(collection(db, 'transactions')), {
      fromAccountId: accountId,
      fromAccountName: accSnap.data().name || '',
      toUserId: null,
      toClientName: null,
      amount: numAmount,           // always a number
      type: 'deposit',
      status: 'completed',
      note: note || '',
      createdAt: serverTimestamp(),
    });
  });
};

// ─── TRANSFER ─────────────────────────────────────────────────────────────────
// fromAccountId — business account to deduct from
// toUserId      — client user UID to credit
// toClientName  — display name for the transaction record
// amount        — number
// note          — optional string
// Returns the new transaction ID
export const transferToClient = async (fromAccountId, toUserId, toClientName, amount, note = '') => {
  const numAmount = parseFloat(amount);
  if (isNaN(numAmount) || numAmount <= 0) throw new Error('Invalid amount');

  let newTxId = null;

  await runTransaction(db, async (tx) => {
    const accRef  = doc(db, 'accounts', fromAccountId);
    const userRef = doc(db, 'users',    toUserId);

    const accSnap  = await tx.get(accRef);
    const userSnap = await tx.get(userRef);

    if (!accSnap.exists())  throw new Error('Source account not found');
    if (!userSnap.exists()) throw new Error('Client not found');

    const accBalance  = safeBalance(accSnap.data().balance);
    const userBalance = safeBalance(userSnap.data().balance);

    // Allow overdraft/credit behavior: accounts may go negative when transferring.
    tx.update(accRef,  { balance: accBalance  - numAmount });
    tx.update(userRef, { balance: userBalance + numAmount });

    // Record transaction — note the strict field order: amount is a number, note is a string
    const txRef = doc(collection(db, 'transactions'));
    newTxId = txRef.id;
    tx.set(txRef, {
      fromAccountId,
      fromAccountName: accSnap.data().name  || '',
      toUserId,
      toClientName:    toClientName || userSnap.data().name || '',
      amount:          numAmount,   // ← number, always
      type:            'transfer',
      status:          'completed',
      note:            note || '',  // ← string, always
      createdAt:       serverTimestamp(),
    });
  });

  return newTxId;
};

// ─── QUICK TRANSFER ───────────────────────────────────────────────────────────
// Looks up client by name; auto-creates walk-in if not found
export const quickTransfer = async (fromAccountId, clientName, amount, note = '') => {
  let client = await findClientByName(clientName);
  let isNew  = false;

  if (!client) {
    const newId = await createWalkInClient(clientName);
    client = { id: newId, name: clientName.trim() };
    isNew  = true;
  }

  const txId = await transferToClient(
    fromAccountId,
    client.id,
    client.name,
    parseFloat(amount),
    note
  );

  return { clientId: client.id, clientName: client.name, isNew, txId };
};

// ─── SYSTEM ───────────────────────────────────────────────────────────────────
export const onSystemSnapshot = (cb) => {
  return onSnapshot(doc(db, 'system', 'totals'), snap => {
    cb(snap.exists() ? snap.data() : { totalBalance: 0 });
  });
};