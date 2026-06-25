import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, QueryDocumentSnapshot } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string,
  appId: import.meta.env.VITE_FIREBASE_APP_ID as string,
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

export function firestoreConverter<T extends { id: string }>() {
  return {
    toFirestore: ({ id: _id, ...data }: T) => data,
    fromFirestore: (snap: QueryDocumentSnapshot): T =>
      ({ id: snap.id, ...snap.data() } as T),
  };
}
