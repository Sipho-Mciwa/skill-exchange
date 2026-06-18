import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db, firestoreConverter } from '../lib/firebase';
import { Listing, ListingFormValues, GeoPoint } from '../types';

function parseTags(raw: string): string[] {
  return raw
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);
}

function normaliseTimestamp(value: unknown): string {
  return value instanceof Timestamp
    ? value.toDate().toISOString()
    : (value as string);
}

const listingConverter = firestoreConverter<Listing>();

const listingsCol = () =>
  collection(db, 'listings').withConverter(listingConverter);

export async function createListing(
  uid: string,
  values: ListingFormValues,
  location: GeoPoint
): Promise<string> {
  const ref = await addDoc(collection(db, 'listings'), {
    userId: uid,
    type: values.type,
    title: values.title,
    description: values.description,
    category: values.category,
    tags: parseTags(values.tags),
    location,
    radiusKm: values.radiusKm,
    creditsPerHour: values.creditsPerHour,
    isActive: true,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateListing(
  id: string,
  values: Partial<ListingFormValues>
): Promise<void> {
  const ref = doc(db, 'listings', id);
  const updates: Record<string, unknown> = {};
  if (values.title !== undefined) updates.title = values.title;
  if (values.description !== undefined) updates.description = values.description;
  if (values.category !== undefined) updates.category = values.category;
  if (values.type !== undefined) updates.type = values.type;
  if (values.creditsPerHour !== undefined) updates.creditsPerHour = values.creditsPerHour;
  if (values.radiusKm !== undefined) updates.radiusKm = values.radiusKm;
  if (values.tags !== undefined) updates.tags = parseTags(values.tags);
  await updateDoc(ref, updates);
}

export async function deactivateListing(id: string): Promise<void> {
  await updateDoc(doc(db, 'listings', id), { isActive: false });
}

export async function getListing(id: string): Promise<Listing | null> {
  const snap = await getDoc(
    doc(db, 'listings', id).withConverter(listingConverter)
  );
  if (!snap.exists()) return null;
  const data = snap.data();
  return { ...data, createdAt: normaliseTimestamp(data.createdAt) };
}

export async function getActiveListings(): Promise<Listing[]> {
  const q = query(listingsCol(), where('isActive', '==', true));
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data();
    return { ...data, createdAt: normaliseTimestamp(data.createdAt) };
  });
}

export async function getUserListings(uid: string): Promise<Listing[]> {
  const q = query(listingsCol(), where('userId', '==', uid));
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data();
    return { ...data, createdAt: normaliseTimestamp(data.createdAt) };
  });
}
