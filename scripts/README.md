# Waiver System Scripts

This directory contains administrative scripts for the waiver management system.

## Available Scripts

### Migration Scripts

#### `migrate-add-expires-at.ts`
Adds the `expiresAt` field to all existing waiver documents that don't have it.

**Usage:**
```bash
cd scripts
npm install
npm run migrate:expires-at
```

Or run directly:
```bash
npx ts-node scripts/migrate-add-expires-at.ts
```

**What it does:**
- Scans all documents in the `waivers` collection
- Skips settings and template documents
- Calculates `expiresAt = submittedAt + 1 year`
- Updates documents in batches (500 at a time)
- Provides detailed progress and summary

**Prerequisites:**
- Firebase Admin SDK credentials configured
- Run from project root or set `GOOGLE_APPLICATION_CREDENTIALS`

---

### Admin Management Scripts

#### `setup-admin.ts`
Grants admin privileges to specified email addresses using Firebase custom claims.

**Usage:**
```bash
cd scripts
npm install
npm run setup:admin admin@example.com
```

Or run directly:
```bash
npx ts-node scripts/setup-admin.ts admin1@org.com admin2@org.com
```

**What it does:**
- Sets `admin: true` custom claim on user accounts
- Verifies the claim was set correctly
- Lists all current admin users
- Provides next steps for deployment

**Prerequisites:**
- Users must sign in to the app at least once before being granted admin access
- Firebase Admin SDK credentials configured
- After granting admin access:
  1. Update `firestore.rules` with admin emails
  2. Deploy rules: `firebase deploy --only firestore:rules`
  3. Users must sign out and back in for changes to take effect

**List current admins:**
```bash
npx ts-node scripts/setup-admin.ts
```

---

## Setup

Install dependencies:

```bash
cd scripts
npm install
```

## Authentication

These scripts require Firebase Admin SDK authentication. You have two options:

### Option 1: Service Account Key

1. Download service account key from Firebase Console
2. Set environment variable:
```bash
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/serviceAccountKey.json"
```

### Option 2: Run from Functions Directory

The scripts can use the existing Firebase Admin initialization if run from the functions directory:

```bash
cd functions
npx ts-node ../scripts/migrate-add-expires-at.ts
```

## Security Notes

- Keep service account keys secure and never commit them to git
- Use `.gitignore` to exclude credential files
- Only grant admin access to trusted users
- Regularly audit admin users and revoke access when no longer needed
- Test scripts on a staging environment before running in production

## Troubleshooting

### "Firebase app not initialized"
**Solution:** Set `GOOGLE_APPLICATION_CREDENTIALS` or run from functions directory

### "User not found" when setting admin
**Solution:** User must sign in to the app at least once first

### "Permission denied" errors
**Solution:** Ensure service account has Firestore and Authentication permissions

## Support

For issues or questions:
- Review [SECURITY_DEPLOYMENT.md](../SECURITY_DEPLOYMENT.md)
- Check Firebase Console logs
- Review [SECURITY_AUDIT.md](../SECURITY_AUDIT.md)
