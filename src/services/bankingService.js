import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import {
  doc, getDoc, setDoc, collection,
  getDocs, query, where, orderBy, onSnapshot,
  serverTimestamp, runTransaction
} from 'firebase/firestore';
import { auth, db } from './firebase';

// ─── AUTH ─────────────────────────────────────────────────────────────────────
export const loginUser  = (email, password) => signInWithEmailAndPassword(auth, email, password);
export const logoutUser = () => signOut(auth);
export const onAuthChange = (cb) => onAuthStateChanged(auth, cb);

// ─── HELPERS ──────────────────────────────────────────────────────────────────
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

// NO limit — fetch ALL transactions from Firestore, paginate on the client
export const onTransactionsSnapshot = (cb) => {
  const q = query(collection(db, 'transactions'), orderBy('createdAt', 'desc'));
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

    const currentBalance = safeBalance(accSnap.data().balance);
    const sysSnap = await tx.get(sysRef);
    const currentTotal = sysSnap.exists() ? safeBalance(sysSnap.data().totalBalance) : 0;

    tx.update(accRef, { balance: currentBalance + numAmount });
    tx.set(sysRef, { totalBalance: currentTotal + numAmount }, { merge: true });

    tx.set(doc(collection(db, 'transactions')), {
      fromAccountId: accountId,
      fromAccountName: accSnap.data().name || '',
      toUserId: null,
      toClientName: null,
      amount: numAmount,
      type: 'deposit',
      status: 'completed',
      note: note || '',
      createdAt: serverTimestamp(),
    });
  });
};

// ─── TRANSFER ─────────────────────────────────────────────────────────────────
export const transferToClient = async (fromAccountId, toUserId, toClientName, amount, note = '') => {
  const numAmount = parseFloat(amount);
  if (isNaN(numAmount) || numAmount <= 0) throw new Error('Invalid amount');

  let newTxId = null;

  await runTransaction(db, async (tx) => {
    const accRef  = doc(db, 'accounts', fromAccountId);
    const userRef = doc(db, 'users', toUserId);

    const accSnap  = await tx.get(accRef);
    const userSnap = await tx.get(userRef);

    if (!accSnap.exists())  throw new Error('Source account not found');
    if (!userSnap.exists()) throw new Error('Client not found');

    const accBalance  = safeBalance(accSnap.data().balance);
    const userBalance = safeBalance(userSnap.data().balance);

    if (accBalance < numAmount) {
      throw new Error(`Insufficient balance. Available: TZS ${accBalance.toLocaleString()}`);
    }

    tx.update(accRef,  { balance: accBalance  - numAmount });
    tx.update(userRef, { balance: userBalance + numAmount });

    const txRef = doc(collection(db, 'transactions'));
    newTxId = txRef.id;
    tx.set(txRef, {
      fromAccountId,
      fromAccountName: accSnap.data().name || '',
      toUserId,
      toClientName: toClientName || userSnap.data().name || '',
      amount: numAmount,
      type: 'transfer',
      status: 'completed',
      note: note || '',
      createdAt: serverTimestamp(),
    });
  });

  return newTxId;
};

// ─── QUICK TRANSFER ───────────────────────────────────────────────────────────
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

// ─── EDIT TRANSACTION ─────────────────────────────────────────────────────────
export const editTransaction = async (txId, updates) => {
  const { newAmount, newAccountId, newNote } = updates;
  const numAmount = newAmount ? parseFloat(newAmount) : null;

  if (numAmount !== null && (isNaN(numAmount) || numAmount <= 0)) {
    throw new Error('Invalid amount');
  }

  await runTransaction(db, async (tx) => {
    const txRef  = doc(db, 'transactions', txId);
    const txSnap = await tx.get(txRef);
    if (!txSnap.exists()) throw new Error('Transaction not found');

    const oldTx       = txSnap.data();
    const oldAmount   = safeBalance(oldTx.amount);
    const finalAmount = numAmount !== null ? numAmount : oldAmount;
    const finalAccId  = newAccountId || oldTx.fromAccountId;
    const amountDiff  = finalAmount - oldAmount;
    const accChanged  = newAccountId && newAccountId !== oldTx.fromAccountId;

    const finalAccRef  = doc(db, 'accounts', finalAccId);
    const finalAccSnap = await tx.get(finalAccRef);
    if (!finalAccSnap.exists()) throw new Error('Account not found');

    let oldAccSnap = null;
    if (accChanged) {
      oldAccSnap = await tx.get(doc(db, 'accounts', oldTx.fromAccountId));
      if (!oldAccSnap.exists()) throw new Error('Original account not found');
    }

    let userSnap = null;
    if (oldTx.type === 'transfer') {
      userSnap = await tx.get(doc(db, 'users', oldTx.toUserId));
      if (!userSnap.exists()) throw new Error('Client not found');
    }

    if (oldTx.type === 'deposit') {
      const bal = safeBalance(finalAccSnap.data().balance);
      if (accChanged) {
        tx.update(oldAccSnap.ref, { balance: safeBalance(oldAccSnap.data().balance) - oldAmount });
        tx.update(finalAccSnap.ref, { balance: bal + finalAmount });
      } else {
        tx.update(finalAccSnap.ref, { balance: bal + amountDiff });
      }
    } else if (oldTx.type === 'transfer') {
      const accBal  = safeBalance(finalAccSnap.data().balance);
      const userBal = safeBalance(userSnap.data().balance);
      if (accChanged) {
        tx.update(oldAccSnap.ref, { balance: safeBalance(oldAccSnap.data().balance) + oldAmount });
        tx.update(finalAccSnap.ref, { balance: accBal - finalAmount });
      } else {
        tx.update(finalAccSnap.ref, { balance: accBal - amountDiff });
      }
      tx.update(userSnap.ref, { balance: userBal + amountDiff });
    }

    tx.update(txRef, {
      amount: finalAmount,
      ...(newNote !== undefined && { note: newNote || '' }),
      ...(newAccountId && {
        fromAccountId: newAccountId,
        fromAccountName: finalAccSnap.data().name || newAccountId,
      }),
      updatedAt: serverTimestamp(),
    });
  });
};

// ─── SYSTEM ───────────────────────────────────────────────────────────────────
export const onSystemSnapshot = (cb) => {
  return onSnapshot(doc(db, 'system', 'totals'), snap => {
    cb(snap.exists() ? snap.data() : { totalBalance: 0 });
  });
};