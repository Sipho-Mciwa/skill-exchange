import {
  collection,
  doc,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  updateDoc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db, firestoreConverter } from '../lib/firebase';
import { Conversation, Message } from '../types';

const conversationConverter = firestoreConverter<Conversation>();
const messageConverter = firestoreConverter<Message>();

function normaliseTimestamp(value: unknown): string {
  if (value instanceof Timestamp) return value.toDate().toISOString();
  if (typeof value === 'string') return value;
  return new Date().toISOString();
}

export async function getOrCreateConversation(
  uid: string,
  otherId: string,
  listingId: string,
  listingTitle: string
): Promise<string> {
  const colRef = collection(db, 'conversations').withConverter(conversationConverter);

  // Check if conversation already exists between these two participants for this listing
  const q = query(colRef, where('listingId', '==', listingId), where('participantIds', 'array-contains', uid));
  const snap = await getDocs(q);
  const existing = snap.docs.find((d) => d.data().participantIds.includes(otherId));
  if (existing) return existing.id;

  const ref = await addDoc(collection(db, 'conversations'), {
    participantIds: [uid, otherId],
    listingId,
    listingTitle,
    lastMessage: '',
    lastMessageAt: serverTimestamp(),
    unreadCounts: { [uid]: 0, [otherId]: 0 },
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function sendMessage(
  conversationId: string,
  senderId: string,
  body: string
): Promise<void> {
  const messagesRef = collection(db, 'conversations', conversationId, 'messages');
  await addDoc(messagesRef, {
    conversationId,
    senderId,
    body,
    createdAt: serverTimestamp(),
  });

  // Update conversation preview
  await updateDoc(doc(db, 'conversations', conversationId), {
    lastMessage: body,
    lastMessageAt: serverTimestamp(),
  });
}

export async function getUserConversations(uid: string): Promise<Conversation[]> {
  const q = query(
    collection(db, 'conversations').withConverter(conversationConverter),
    where('participantIds', 'array-contains', uid),
    orderBy('lastMessageAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({
    ...d.data(),
    createdAt: normaliseTimestamp(d.data().createdAt),
    lastMessageAt: normaliseTimestamp(d.data().lastMessageAt),
  }));
}

export function subscribeToMessages(
  conversationId: string,
  onMessages: (msgs: Message[]) => void
): () => void {
  const q = query(
    collection(db, 'conversations', conversationId, 'messages').withConverter(messageConverter),
    orderBy('createdAt', 'asc')
  );

  return onSnapshot(q, (snap) => {
    const msgs = snap.docs.map((d) => ({
      ...d.data(),
      createdAt: normaliseTimestamp(d.data().createdAt),
    }));
    onMessages(msgs);
  });
}
