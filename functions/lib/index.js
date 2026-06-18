"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transferCredits = void 0;
const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();
const db = admin.firestore();
exports.transferCredits = functions.https.onCall(async (data, context) => {
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
        const fromBalance = fromSnap.data().creditBalance;
        if (fromBalance < credits) {
            throw new functions.https.HttpsError('failed-precondition', `Insufficient credits. Balance: ${fromBalance}, required: ${credits}`);
        }
        const toBalance = toSnap.data().creditBalance;
        tx.update(fromRef, { creditBalance: fromBalance - credits });
        tx.update(toRef, { creditBalance: toBalance + credits });
        const txDoc = txColRef.doc();
        tx.set(txDoc, {
            fromUserId,
            toUserId,
            listingId,
            credits,
            note: note !== null && note !== void 0 ? note : null,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
    });
    return { success: true };
});
//# sourceMappingURL=index.js.map