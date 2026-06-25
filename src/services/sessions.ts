import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  updateDoc,
  doc,
  runTransaction,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { Session } from '../types';

function normaliseTs(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  if (value instanceof Timestamp) return value.toDate().toISOString();
  if (typeof value === 'string') return value;
  return null;
}

export async function initiateSession(
  conversationId: string,
  listingId: string,
  teacherId: string,
  learnerId: string,
  creditsPerHour: number,
  hoursCompleted: number
): Promise<string> {
  const now = Timestamp.now();
  const expiresAt = Timestamp.fromMillis(now.toMillis() + 48 * 60 * 60 * 1000);
  const totalCredits = creditsPerHour * hoursCompleted;

  const ref = await addDoc(collection(db, 'sessions'), {
    conversationId,
    listingId,
    teacherId,
    learnerId,
    creditsPerHour,
    hoursCompleted,
    totalCredits,
    status: 'pending_learner',
    teacherConfirmedAt: now,
    learnerConfirmedAt: null,
    expiresAt,
    createdAt: now,
  });

  return ref.id;
}

interface RawSessionData {
  status: string;
  teacherId: string;
  learnerId: string;
  totalCredits: number;
  listingId: string;
}

// Client-side atomic transfer (workaround until project is on Blaze plan for Cloud Functions)
export async function confirmSession(sessionId: string, learnerId: string): Promise<void> {
  const sessionRef = doc(db, 'sessions', sessionId);

  await runTransaction(db, async (tx) => {
    const sessionSnap = await tx.get(sessionRef);
    if (!sessionSnap.exists()) throw new Error('Session not found');

    const sessionData = sessionSnap.data() as RawSessionData;
    if (sessionData.status !== 'pending_learner') throw new Error('Session is no longer pending');
    if (sessionData.learnerId !== learnerId) throw new Error('Only the learner can confirm this session');

    const teacherRef = doc(db, 'users', sessionData.teacherId);
    const learnerRef = doc(db, 'users', sessionData.learnerId);
    const [teacherSnap, learnerSnap] = await Promise.all([tx.get(teacherRef), tx.get(learnerRef)]);

    const teacherBalance: number = (teacherSnap.data() as { creditBalance: number } | undefined)?.creditBalance ?? 0;
    const learnerBalance: number = (learnerSnap.data() as { creditBalance: number } | undefined)?.creditBalance ?? 0;

    if (learnerBalance < sessionData.totalCredits) {
      throw new Error(`Insufficient credits. You have ${learnerBalance}, need ${sessionData.totalCredits}.`);
    }

    tx.update(learnerRef, { creditBalance: learnerBalance - sessionData.totalCredits });
    tx.update(teacherRef, { creditBalance: teacherBalance + sessionData.totalCredits });

    const txRef = doc(collection(db, 'transactions'));
    tx.set(txRef, {
      fromUserId: sessionData.learnerId,
      toUserId: sessionData.teacherId,
      listingId: sessionData.listingId,
      sessionId,
      credits: sessionData.totalCredits,
      note: 'Session confirmed',
      createdAt: serverTimestamp(),
    });

    tx.update(sessionRef, {
      status: 'confirmed',
      learnerConfirmedAt: Timestamp.now(),
    });
  });
}

export async function disputeSession(sessionId: string): Promise<void> {
  await updateDoc(doc(db, 'sessions', sessionId), {
    status: 'disputed',
  });
}

export function subscribeToSession(
  conversationId: string,
  callback: (session: Session | null) => void
): () => void {
  const q = query(
    collection(db, 'sessions'),
    where('conversationId', '==', conversationId)
  );

  return onSnapshot(q, (snap) => {
    const docs = snap.docs.map((d) => {
      const raw = d.data();
      return {
        id: d.id,
        conversationId: raw.conversationId as string,
        listingId: raw.listingId as string,
        teacherId: raw.teacherId as string,
        learnerId: raw.learnerId as string,
        creditsPerHour: raw.creditsPerHour as number,
        hoursCompleted: raw.hoursCompleted as number,
        totalCredits: raw.totalCredits as number,
        status: raw.status as Session['status'],
        teacherConfirmedAt: normaliseTs(raw.teacherConfirmedAt),
        learnerConfirmedAt: normaliseTs(raw.learnerConfirmedAt),
        expiresAt: normaliseTs(raw.expiresAt) ?? '',
        createdAt: normaliseTs(raw.createdAt) ?? '',
      } satisfies Session;
    });

    // Client-side: prefer pending_learner first, then confirmed
    const pending = docs.find((s) => s.status === 'pending_learner');
    if (pending) {
      callback(pending);
      return;
    }
    const confirmed = docs.find((s) => s.status === 'confirmed');
    if (confirmed) {
      callback(confirmed);
      return;
    }
    callback(null);
  });
}
