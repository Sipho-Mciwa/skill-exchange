/**
 * One-time migration: backfill the `geohash` field on all existing listings.
 *
 * Usage:
 *   1. Download your Firebase service account key from:
 *      Firebase Console → Project Settings → Service Accounts → Generate new private key
 *   2. Save it as scripts/serviceAccountKey.json  (already in .gitignore)
 *   3. Run: npx tsx scripts/migrateGeohash.ts
 *
 * Safe to run multiple times — documents that already have `geohash` are skipped.
 */

import { initializeApp, cert, type ServiceAccount } from 'firebase-admin/app';
import { getFirestore, WriteBatch } from 'firebase-admin/firestore';
import { geohashForLocation } from 'geofire-common';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const serviceAccount: ServiceAccount = require('./skill-exchange-35568-firebase-adminsdk-fbsvc-604f1058a4.json');

initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

async function migrate(): Promise<void> {
  const snapshot = await db.collection('listings').get();
  let batch: WriteBatch = db.batch();
  let batchCount = 0;
  let totalUpdated = 0;
  let totalSkipped = 0;

  for (const docSnap of snapshot.docs) {
    const data = docSnap.data();

    if (data.geohash) {
      totalSkipped++;
      continue;
    }

    const loc = data.location as { lat?: unknown; lng?: unknown } | undefined;
    if (typeof loc?.lat !== 'number' || typeof loc?.lng !== 'number') {
      console.warn(`Skipping ${docSnap.id} — missing or invalid location`);
      totalSkipped++;
      continue;
    }

    const geohash: string = geohashForLocation([loc.lat, loc.lng]);
    batch.update(docSnap.ref, { geohash });
    batchCount++;
    totalUpdated++;

    if (batchCount === 500) {
      await batch.commit();
      console.log(`Committed batch — ${totalUpdated} updated so far…`);
      batch = db.batch();
      batchCount = 0;
    }
  }

  if (batchCount > 0) {
    await batch.commit();
  }

  console.log(
    `Migration complete. Updated: ${totalUpdated}, Skipped: ${totalSkipped}, Total docs: ${snapshot.size}`
  );
}

migrate().catch((err: unknown) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
