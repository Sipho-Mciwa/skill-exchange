import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, firestoreConverter } from '../lib/firebase';
import { UserProfile } from '../types';

const userConverter = firestoreConverter<UserProfile>();

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, 'users', uid).withConverter(userConverter));
  return snap.exists() ? snap.data() : null;
}

export async function createUserProfile(profile: UserProfile): Promise<void> {
  await setDoc(
    doc(db, 'users', profile.id).withConverter(userConverter),
    profile
  );
}
