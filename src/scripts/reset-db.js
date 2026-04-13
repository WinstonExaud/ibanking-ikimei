/**
 * iKIMEI Database Reset & Repair Script
 * ──────────────────────────────────────
 * SETUP:
 *   1. npm install firebase-admin
 *   2. Download serviceAccount.json from:
 *      Firebase Console → Project Settings → Service Accounts → Generate new private key
 *   3. Place serviceAccount.json in this scripts/ folder
 *   4. Run: node scripts/reset-db.js
 *
 * WHAT IT DOES:
 *   ✓ Deletes ALL transactions (corrupted ones included)
 *   ✓ Resets ALL account balances to 0 (fixes "NaN" string values)
 *   ✓ Resets ALL user/client balances to 0
 *   ✓ Resets system/totals to 0
 *   ✗ Does NOT delete accounts, users, or Auth users
 */

import { readFileSync } from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

let admin;
try {
  admin = require('firebase-admin');
} catch {
  console.error('\n❌  firebase-admin not installed.');
  console.error('    Run: npm install firebase-admin\n');
  process.exit(1);
}

// Load service account
let serviceAccount;
try {
  serviceAccount = JSON.parse(readFileSync(new URL('./serviceAccount.json', import.meta.url)));
} catch {
  console.error('\n❌  Could not read scripts/serviceAccount.json');
  console.error('    Download from Firebase Console → Project Settings → Service Accounts\n');
  process.exit(1);
}

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

async function deleteAllInCollection(name) {
  const snap = await db.collection(name).get();
  if (snap.empty) { console.log(`   ${name}: nothing to delete`); return; }
  // Delete in batches of 400
  const chunks = [];
  for (let i = 0; i < snap.docs.length; i += 400) chunks.push(snap.docs.slice(i, i + 400));
  for (const chunk of chunks) {
    const batch = db.batch();
    chunk.forEach(d => batch.delete(d.ref));
    await batch.commit();
  }
  console.log(`   ✓ Deleted ${snap.size} docs from [${name}]`);
}

async function resetBalancesIn(name) {
  const snap = await db.collection(name).get();
  if (snap.empty) { console.log(`   ${name}: empty`); return; }
  const chunks = [];
  for (let i = 0; i < snap.docs.length; i += 400) chunks.push(snap.docs.slice(i, i + 400));
  for (const chunk of chunks) {
    const batch = db.batch();
    chunk.forEach(d => batch.update(d.ref, { balance: 0 }));
    await batch.commit();
  }
  console.log(`   ✓ Reset balance → 0 on ${snap.size} docs in [${name}]`);
}

async function main() {
  console.log('\n╔══════════════════════════════════════╗');
  console.log('║   iKIMEI Database Reset & Repair     ║');
  console.log('╚══════════════════════════════════════╝\n');

  console.log('Step 1 — Delete all transactions...');
  await deleteAllInCollection('transactions');

  console.log('\nStep 2 — Reset account balances to 0...');
  await resetBalancesIn('accounts');

  console.log('\nStep 3 — Reset user/client balances to 0...');
  await resetBalancesIn('users');

  console.log('\nStep 4 — Reset system totals...');
  await db.doc('system/totals').set({ totalBalance: 0 });
  console.log('   ✓ system/totals → { totalBalance: 0 }');

  console.log('\n══════════════════════════════════════');
  console.log('✅  Done! Database is clean.');
  console.log('\nNext:');
  console.log('  • Open the app and deposit fresh amounts');
  console.log('  • Use Send Money to transfer to clients\n');
  process.exit(0);
}

main().catch(err => {
  console.error('\n❌  Error:', err.message);
  process.exit(1);
});