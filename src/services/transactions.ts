import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  or,
  Timestamp,
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions, firestoreConverter } from '../lib/firebase';
import { Transaction } from '../types';

const transactionConverter = firestoreConverter<Transaction>();

function normaliseTimestamp(value: unknown): string {
  if (value instanceof Timestamp) return value.toDate().toISOString();
  if (typeof value === 'string') return value;
  return new Date().toISOString();
}

export async function getUserTransactions(uid: string): Promise<Transaction[]> {
  const q = query(
    collection(db, 'transactions').withConverter(transactionConverter),
    or(where('fromUserId', '==', uid), where('toUserId', '==', uid)),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({
    ...d.data(),
    createdAt: normaliseTimestamp(d.data().createdAt),
  }));
}

export interface TransferPayload {
  fromUserId: string;
  toUserId: string;
  listingId: string;
  credits: number;
  note?: string;
}

export async function triggerTransfer(payload: TransferPayload): Promise<void> {
  const callable = httpsCallable<TransferPayload, { success: boolean }>(
    functions,
    'transferCredits'
  );
  const result = await callable(payload);
  if (!result.data.success) {
    throw new Error('Transfer failed');
  }
}
