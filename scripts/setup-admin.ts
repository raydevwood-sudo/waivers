/**
 * Admin Setup Script
 * 
 * This script helps you set up admin users for the waiver system.
 * Admins can access the admin console and modify settings/templates.
 * 
 * Usage:
 *   npx ts-node scripts/setup-admin.ts <email1> [email2] [email3] ...
 * 
 * Example:
 *   npx ts-node scripts/setup-admin.ts admin@cyclingwithoutagesociety.org
 * 
 * Prerequisites:
 *   - Install dependencies: npm install firebase-admin
 *   - Set GOOGLE_APPLICATION_CREDENTIALS environment variable
 *   - Users must already exist in Firebase Authentication
 */

import * as admin from 'firebase-admin';

// Initialize Firebase Admin (if not already initialized)
if (!admin.apps.length) {
  admin.initializeApp();
}

const auth = admin.auth();

async function setAdminClaim(email: string): Promise<boolean> {
  try {
    // Get user by email
    const user = await auth.getUserByEmail(email);
    
    // Set custom claim
    await auth.setCustomUserClaims(user.uid, { admin: true });
    
    console.log(`✅ Successfully set admin claim for: ${email} (uid: ${user.uid})`);
    return true;
  } catch (error: any) {
    if (error.code === 'auth/user-not-found') {
      console.error(`❌ User not found: ${email}`);
      console.log(`   💡 User must sign in to the app at least once before being granted admin access`);
    } else {
      console.error(`❌ Error setting admin claim for ${email}:`, error.message);
    }
    return false;
  }
}

async function verifyAdminClaim(email: string): Promise<void> {
  try {
    const user = await auth.getUserByEmail(email);
    const claims = (await auth.getUser(user.uid)).customClaims;
    
    if (claims?.admin === true) {
      console.log(`✓ Verified: ${email} has admin privileges`);
    } else {
      console.log(`⚠️  Warning: ${email} does NOT have admin privileges`);
    }
  } catch (error: any) {
    console.error(`❌ Error verifying ${email}:`, error.message);
  }
}

async function listAllAdmins(): Promise<void> {
  console.log('\n📋 Current Admin Users:');
  console.log('='.repeat(60));
  
  let adminCount = 0;
  let pageToken: string | undefined;

  do {
    const listResult = await auth.listUsers(1000, pageToken);
    
    for (const user of listResult.users) {
      if (user.customClaims?.admin === true) {
        console.log(`  ✓ ${user.email} (uid: ${user.uid})`);
        adminCount++;
      }
    }
    
    pageToken = listResult.pageToken;
  } while (pageToken);

  console.log('='.repeat(60));
  console.log(`Total admins: ${adminCount}\n`);
}

async function main() {
  const emails = process.argv.slice(2);

  console.log('🔐 Waiver System Admin Setup Tool\n');

  if (emails.length === 0) {
    console.log('Usage: npx ts-node scripts/setup-admin.ts <email1> [email2] ...\n');
    console.log('Examples:');
    console.log('  npx ts-node scripts/setup-admin.ts admin@cyclingwithoutagesociety.org');
    console.log('  npx ts-node scripts/setup-admin.ts admin1@org.com admin2@org.com\n');
    await listAllAdmins();
    return;
  }

  console.log(`Setting admin privileges for ${emails.length} user(s)...\n`);

  let successCount = 0;
  for (const email of emails) {
    const success = await setAdminClaim(email.trim());
    if (success) successCount++;
  }

  console.log('\n' + '='.repeat(60));
  console.log(`✅ Successfully granted admin access to ${successCount}/${emails.length} users`);
  console.log('='.repeat(60) + '\n');

  if (successCount > 0) {
    console.log('📝 Next Steps:');
    console.log('  1. Update firestore.rules with the admin email addresses');
    console.log('  2. Deploy the security rules: firebase deploy --only firestore:rules');
    console.log('  3. Users must sign out and sign back in for changes to take effect\n');
  }

  console.log('Verifying admin claims...\n');
  for (const email of emails) {
    await verifyAdminClaim(email.trim());
  }

  await listAllAdmins();
}

main()
  .then(() => {
    console.log('✅ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  });
