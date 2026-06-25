import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  startAt,
  endAt,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import {
  geohashForLocation,
  geohashQueryBounds,
  distanceBetween,
  type Geopoint,
} from 'geofire-common';
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
  const geohash = geohashForLocation([location.lat, location.lng]);
  const ref = await addDoc(collection(db, 'listings'), {
    userId: uid,
    type: values.type,
    title: values.title,
    description: values.description,
    category: values.category,
    tags: parseTags(values.tags),
    location,
    geohash,
    radiusKm: values.radiusKm,
    creditsPerHour: values.creditsPerHour,
    isActive: true,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateListing(
  id: string,
  values: Partial<ListingFormValues>,
  location?: GeoPoint
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
  if (location !== undefined) {
    updates.location = location;
    updates.geohash = geohashForLocation([location.lat, location.lng]);
  }
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

export async function getListingsByLocation(
  lat: number,
  lng: number,
  radiusKm: number
): Promise<Array<Listing & { distanceKm: number }>> {
  const center: Geopoint = [lat, lng];
  const radiusMetres = radiusKm * 1000;
  const bounds = geohashQueryBounds(center, radiusMetres);

  const snapshots = await Promise.all(
    bounds.map((b) =>
      getDocs(
        query(
          collection(db, 'listings'),
          where('isActive', '==', true),
          orderBy('geohash'),
          startAt(b[0]),
          endAt(b[1])
        )
      )
    )
  );

  const seen = new Set<string>();
  const results: Array<Listing & { distanceKm: number }> = [];

  for (const snap of snapshots) {
    for (const d of snap.docs) {
      if (seen.has(d.id)) continue;
      seen.add(d.id);

      const raw = d.data() as Record<string, unknown>;
      const loc = raw.location as GeoPoint | undefined;
      if (!loc) continue;

      const distanceKm = distanceBetween([loc.lat, loc.lng], center);
      if (distanceKm > radiusKm) continue;

      const listing: Listing = {
        id: d.id,
        userId: raw.userId as string,
        type: raw.type as 'offer' | 'request',
        title: raw.title as string,
        description: raw.description as string,
        category: raw.category as Listing['category'],
        tags: (raw.tags as string[]) ?? [],
        location: loc,
        geohash: raw.geohash as string | undefined,
        radiusKm: raw.radiusKm as number,
        creditsPerHour: raw.creditsPerHour as number,
        isActive: raw.isActive as boolean,
        createdAt: normaliseTimestamp(raw.createdAt),
      };

      results.push({ ...listing, distanceKm });
    }
  }

  return results.sort((a, b) => a.distanceKm - b.distanceKm);
}

export async function getUserListings(uid: string): Promise<Listing[]> {
  const q = query(listingsCol(), where('userId', '==', uid));
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data();
    return { ...data, createdAt: normaliseTimestamp(data.createdAt) };
  });
}
