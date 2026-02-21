/**
 * Migration Script: Add expiresAt field to existing waivers
 * 
 * This script adds the expiresAt field to all existing waiver documents
 * that don't already have it. The expiresAt date is calculated as
 * submittedAt + 1 year.
 * 
 * Usage:
 *   npx ts-node scripts/migrate-add-expires-at.ts
 * 
 * Prerequisites:
 *   - Install dependencies: npm install firebase-admin
 *   - Set GOOGLE_APPLICATION_CREDENTIALS environment variable
 *   - Or run from functions directory where Firebase is already initialized
 */

import * as admin from 'firebase-admin';

// Initialize Firebase Admin (if not already initialized)
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

async function addExpiresAtField() {
  console.log('🔍 Starting migration to add expiresAt field...\n');

  try {
    const waivers = await db.collection('waivers').get();
    console.log(`📊 Found ${waivers.size} total documents in waivers collection\n`);

    let updatedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    const batch = db.batch();
    let batchCount = 0;

    for (const docSnapshot of waivers.docs) {
      const data = docSnapshot.data();
      const docId = docSnapshot.id;

      // Skip if already has expiresAt
      if (data.expiresAt) {
        skippedCount++;
        console.log(`⏭️  Skipped ${docId} (already has expiresAt)`);
        continue;
      }

      // Skip settings and template documents
      if (data.docType === 'settings' || data.docType === 'waiverTemplate' || docId === 'settings') {
        skippedCount++;
        console.log(`⏭️  Skipped ${docId} (settings/template document)`);
        continue;
      }

      // Calculate expiresAt from submittedAt
      if (data.submittedAt) {
        try {
          const submittedDate = data.submittedAt.toDate();
          const expiryDate = new Date(submittedDate);
          expiryDate.setFullYear(expiryDate.getFullYear() + 1);

          batch.update(docSnapshot.ref, {
            expiresAt: admin.firestore.Timestamp.fromDate(expiryDate),
          });

          updatedCount++;
          batchCount++;
          console.log(`✅ Will update ${docId} (submitted: ${submittedDate.toISOString()}, expires: ${expiryDate.toISOString()})`);

          // Commit in batches of 500 (Firestore limit)
          if (batchCount >= 500) {
            console.log(`\n💾 Committing batch of ${batchCount} updates...\n`);
            await batch.commit();
            batchCount = 0;
          }
        } catch (error) {
          errorCount++;
          console.error(`❌ Error processing ${docId}:`, error);
        }
      } else {
        errorCount++;
        console.warn(`⚠️  Skipped ${docId} (no submittedAt field)`);
      }
    }

    // Commit remaining documents
    if (batchCount > 0) {
      console.log(`\n💾 Committing final batch of ${batchCount} updates...\n`);
      await batch.commit();
    }

    console.log('\n' + '='.repeat(60));
    console.log('📈 Migration Summary:');
    console.log('='.repeat(60));
    console.log(`✅ Updated: ${updatedCount} documents`);
    console.log(`⏭️  Skipped: ${skippedCount} documents`);
    console.log(`❌ Errors: ${errorCount} documents`);
    console.log('='.repeat(60) + '\n');

    if (updatedCount > 0) {
      console.log('✅ Migration completed successfully!');
    } else {
      console.log('ℹ️  No documents needed to be updated.');
    }
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
console.log('🚀 Waiver expiresAt Field Migration Tool\n');
addExpiresAtField()
  .then(() => {
    console.log('\n✅ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  });
