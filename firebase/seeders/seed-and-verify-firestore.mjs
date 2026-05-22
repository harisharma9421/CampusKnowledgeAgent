import { configureSeedEnvironment, seedFirestore } from './seed-firestore.mjs';
import { verifyFirestoreSeed } from './verify-firestore-seed.mjs';

const args = new Set(process.argv.slice(2));

configureSeedEnvironment({ useEmulator: args.has('--emulator') });

const main = async () => {
  await seedFirestore({ reset: args.has('--reset') });
  await verifyFirestoreSeed();
};

main().catch((error) => {
  console.error('ERP seed-and-verify failed:', error);
  process.exit(1);
});
