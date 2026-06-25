import { GoogleAuthProvider, signInWithPopup, getAdditionalUserInfo } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

export const signInWithGoogle = async (): Promise<void> => {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  const additionalInfo = getAdditionalUserInfo(result);
  const isNewUser = additionalInfo?.isNewUser ?? false;

  if (isNewUser) {
    const { uid, displayName, email, photoURL } = result.user;
    await setDoc(doc(db, 'users', uid), {
      id: uid,
      name: displayName ?? 'New User',
      email: email ?? '',
      bio: '',
      avatarUrl: photoURL ?? '',
      location: { lat: 0, lng: 0 },
      neighbourhoodName: '',
      creditBalance: 10,
      createdAt: serverTimestamp(),
    });
  }
};
