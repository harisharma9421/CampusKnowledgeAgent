import { pathToFileURL } from 'url';

import bcrypt from 'bcryptjs';

import { DEFAULT_PASSWORD, SEED_SOURCE } from './academicConstants.mjs';
import { buildGeneratedErpDataset, getCollectionPlan } from './generators.mjs';
import { validateGeneratedErpDataset } from './validators.mjs';

const WRITE_BATCH_LIMIT = 450;

export const configureSeedEnvironment = ({ useEmulator = false } = {}) => {
  if (!useEmulator) {
    return;
  }

  process.env.FIREBASE_USE_EMULATOR = 'true';
  process.env.FIRESTORE_EMULATOR_HOST ||= '127.0.0.1:8080';
  process.env.FIREBASE_PROJECT_ID ||= 'campus-knowledge-agent-dev';
};

const printSummary = (validation) => {
  console.log('ERP seed dataset summary');
  Object.entries(validation.summary).forEach(([collection, count]) => {
    console.log(`- ${collection}: ${count}`);
  });
  console.log(`Filter smoke tests: ${validation.filterSmokeTests.passed ? 'passed' : 'failed'}`);
};

const stripUndefined = (value) => {
  if (Array.isArray(value)) {
    return value.map(stripUndefined);
  }
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([, entryValue]) => entryValue !== undefined)
        .map(([entryKey, entryValue]) => [entryKey, stripUndefined(entryValue)])
    );
  }
  return value;
};

const chunkArray = (items, size) => {
  const chunks = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
};

const deleteSeededCollection = async (db, collectionName) => {
  let deleted = 0;

  while (true) {
    const snapshot = await db
      .collection(collectionName)
      .where('source', '==', SEED_SOURCE)
      .limit(WRITE_BATCH_LIMIT)
      .get();

    if (snapshot.empty) {
      break;
    }

    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
      deleted += 1;
    });
    await batch.commit();
  }

  return deleted;
};

const writeDataset = async (db, dataset) => {
  const writes = getCollectionPlan().flatMap(({ key, collection }) =>
    dataset[key].map((record) => ({
      collection,
      id: record.id,
      data: stripUndefined(record),
    }))
  );

  const chunks = chunkArray(writes, WRITE_BATCH_LIMIT);
  let written = 0;

  for (const chunk of chunks) {
    const batch = db.batch();
    chunk.forEach((write) => {
      batch.set(db.collection(write.collection).doc(write.id), write.data, { merge: false });
    });
    await batch.commit();
    written += chunk.length;
    console.log(`Committed ${written}/${writes.length} Firestore documents`);
  }

  return written;
};

export const buildValidatedSeedDataset = async ({ dryRun = false } = {}) => {
  const passwordHash = dryRun ? `plain:${DEFAULT_PASSWORD}` : await bcrypt.hash(DEFAULT_PASSWORD, 12);
  const dataset = buildGeneratedErpDataset({ passwordHash });
  const validation = validateGeneratedErpDataset(dataset);

  printSummary(validation);

  if (validation.warnings.length) {
    console.warn('\nWarnings:');
    validation.warnings.forEach((warning) => console.warn(`- ${warning}`));
  }

  if (!validation.valid) {
    console.error('\nValidation failed:');
    validation.errors.slice(0, 40).forEach((error) => console.error(`- ${error}`));
    if (validation.errors.length > 40) {
      console.error(`...and ${validation.errors.length - 40} more errors`);
    }
    throw new Error('Generated ERP seed dataset failed validation.');
  }

  return dataset;
};

export const seedFirestore = async ({ dryRun = false, reset = false } = {}) => {
  const dataset = await buildValidatedSeedDataset({ dryRun });

  if (dryRun) {
    console.log('\nDry run complete. No Firestore writes were performed.');
    return { dataset, written: 0 };
  }

  const { getFirestore, initializeFirebase } = await import('../../backend/src/configs/firebase.js');
  await initializeFirebase();
  const db = await getFirestore();

  if (!db) {
    throw new Error('Firestore is not available. Configure Firebase credentials or run with --emulator.');
  }

  if (reset) {
    console.log('\nRemoving existing seed-managed documents...');
    for (const { collection } of getCollectionPlan().reverse()) {
      const deleted = await deleteSeededCollection(db, collection);
      console.log(`- ${collection}: deleted ${deleted}`);
    }
  }

  console.log('\nWriting ERP seed dataset to Firestore...');
  const written = await writeDataset(db, dataset);

  console.log('\nERP Firestore seeding complete.');
  console.log(`Documents written: ${written}`);
  console.log(`Seed source: ${SEED_SOURCE}`);
  console.log(`Sample login password for seeded users: ${DEFAULT_PASSWORD}`);

  return { dataset, written };
};

const isMainModule = () => process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMainModule()) {
  const args = new Set(process.argv.slice(2));
  configureSeedEnvironment({ useEmulator: args.has('--emulator') });

  seedFirestore({
    dryRun: args.has('--dry-run'),
    reset: args.has('--reset'),
  }).catch((error) => {
    console.error('ERP Firestore seeding failed:', error);
    process.exit(1);
  });
}
