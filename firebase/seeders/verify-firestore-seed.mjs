import { pathToFileURL } from 'url';

import { SEED_SOURCE } from './academicConstants.mjs';
import { getCollectionPlan } from './generators.mjs';
import { validateGeneratedErpDataset } from './validators.mjs';
import { configureSeedEnvironment } from './seed-firestore.mjs';

const readSeededCollection = async (db, collectionName) => {
  const snapshot = await db.collection(collectionName).where('source', '==', SEED_SOURCE).get();
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};

export const verifyFirestoreSeed = async () => {
  const { getFirestore, initializeFirebase } = await import('../../backend/src/configs/firebase.js');
  await initializeFirebase();
  const db = await getFirestore();

  if (!db) {
    throw new Error('Firestore is not available. Configure Firebase credentials or run with --emulator.');
  }

  const dataset = {};
  for (const { key, collection } of getCollectionPlan()) {
    dataset[key] = await readSeededCollection(db, collection);
  }

  const validation = validateGeneratedErpDataset(dataset);

  console.log('ERP Firestore seed verification');
  Object.entries(validation.summary).forEach(([collection, count]) => {
    console.log(`- ${collection}: ${count}`);
  });
  console.log(`Filter smoke tests: ${validation.filterSmokeTests.passed ? 'passed' : 'failed'}`);

  if (validation.warnings.length) {
    console.warn('\nWarnings:');
    validation.warnings.forEach((warning) => console.warn(`- ${warning}`));
  }

  if (!validation.valid) {
    console.error('\nVerification failed:');
    validation.errors.slice(0, 40).forEach((error) => console.error(`- ${error}`));
    if (validation.errors.length > 40) {
      console.error(`...and ${validation.errors.length - 40} more errors`);
    }
    throw new Error('Seeded ERP Firestore dataset failed validation.');
  }

  console.log('\nSeed verification passed.');
  return validation;
};

const isMainModule = () => process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMainModule()) {
  const args = new Set(process.argv.slice(2));
  configureSeedEnvironment({ useEmulator: args.has('--emulator') });

  verifyFirestoreSeed().catch((error) => {
    console.error('ERP Firestore seed verification failed:', error);
    process.exit(1);
  });
}
