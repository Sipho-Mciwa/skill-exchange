import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();
const db = admin.firestore();

interface TransferCreditsPayload {
  fromUserId: string;
  toUserId: string;
  listingId: string;
  credits: number;
  note?: string;
}

export const transferCredits = functions.https.onCall(
  async (data: TransferCreditsPayload, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'Must be signed in');
    }

    const { fromUserId, toUserId, listingId, credits, note } = data;

    if (typeof credits !== 'number' || credits <= 0 || !Number.isInteger(credits)) {
      throw new functions.https.HttpsError('invalid-argument', 'credits must be a positive integer');
    }
    if (!fromUserId || !toUserId || !listingId) {
      throw new functions.https.HttpsError('invalid-argument', 'Missing required fields');
    }
    if (fromUserId === toUserId) {
      throw new functions.https.HttpsError('invalid-argument', 'Cannot transfer credits to yourself');
    }
    if (context.auth.uid !== fromUserId) {
      throw new functions.https.HttpsError('permission-denied', 'Caller must be the learner');
    }

    const fromRef = db.collection('users').doc(fromUserId);
    const toRef = db.collection('users').doc(toUserId);
    const txColRef = db.collection('transactions');

    await db.runTransaction(async (tx) => {
      const fromSnap = await tx.get(fromRef);
      const toSnap = await tx.get(toRef);

      if (!fromSnap.exists || !toSnap.exists) {
        throw new functions.https.HttpsError('not-found', 'User not found');
      }

      const fromBalance = (fromSnap.data() as { creditBalance: number }).creditBalance;
      if (fromBalance < credits) {
        throw new functions.https.HttpsError(
          'failed-precondition',
          `Insufficient credits. Balance: ${fromBalance}, required: ${credits}`
        );
      }

      const toBalance = (toSnap.data() as { creditBalance: number }).creditBalance;

      tx.update(fromRef, { creditBalance: fromBalance - credits });
      tx.update(toRef, { creditBalance: toBalance + credits });

      const txDoc = txColRef.doc();
      tx.set(txDoc, {
        fromUserId,
        toUserId,
        listingId,
        credits,
        note: note ?? null,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    });

    return { success: true };
  }
);

interface SessionData {
  status: string;
  teacherId: string;
  learnerId: string;
  totalCredits: number;
  listingId: string;
}

export const onSessionConfirmed = functions.firestore
  .document('sessions/{sessionId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data() as SessionData;
    const after = change.after.data() as SessionData;

    if (before.status === after.status) return null;
    if (after.status !== 'confirmed') return null;

    const { teacherId, learnerId, totalCredits, listingId } = after;
    const sessionId = context.params.sessionId as string;

    await db.runTransaction(async (tx) => {
      const teacherRef = db.collection('users').doc(teacherId);
      const learnerRef = db.collection('users').doc(learnerId);
      const [teacherDoc, learnerDoc] = await Promise.all([tx.get(teacherRef), tx.get(learnerRef)]);

      const teacherBalance: number = (teacherDoc.data() as { creditBalance: number } | undefined)?.creditBalance ?? 0;
      const learnerBalance: number = (learnerDoc.data() as { creditBalance: number } | undefined)?.creditBalance ?? 0;

      if (learnerBalance < totalCredits) {
        tx.update(change.after.ref, { status: 'disputed', disputeReason: 'insufficient_credits' });
        return;
      }

      tx.update(learnerRef, { creditBalance: learnerBalance - totalCredits });
      tx.update(teacherRef, { creditBalance: teacherBalance + totalCredits });
      tx.set(db.collection('transactions').doc(), {
        fromUserId: learnerId,
        toUserId: teacherId,
        listingId,
        sessionId,
        credits: totalCredits,
        note: 'Session confirmed',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    });

    return null;
  });

export const expireSessions = functions.pubsub
  .schedule('every 60 minutes')
  .onRun(async () => {
    const now = admin.firestore.Timestamp.now();
    const snap = await db.collection('sessions')
      .where('status', '==', 'pending_learner')
      .where('expiresAt', '<=', now)
      .get();

    const batch = db.batch();
    snap.docs.forEach((docSnap) => batch.update(docSnap.ref, { status: 'expired' }));
    await batch.commit();
    return null;
  });
