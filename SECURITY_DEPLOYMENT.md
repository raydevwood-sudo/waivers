# Security Fixes Deployment Guide

This guide walks you through deploying the critical security fixes identified in the security audit.

## Overview of Changes

### ✅ Implemented Security Fixes

1. **Added `expiresAt` field** - Waiver expiry dates are now stored in Firestore instead of being calculated on-the-fly
2. **Fixed Firestore security rules** - Restricted write operations to prevent unauthorized modifications
3. **Implemented rate limiting** - Cloud Functions now have 100 requests/minute limit to prevent DoS attacks
4. **Enforced App Check** - Bot protection (configurable via environment variable)
5. **Server-side admin authorization** - Admin checks now use Firebase security rules
6. **Removed hardcoded personal email** - Uses organization email or environment variable
7. **Added PDF size limits** - 10MB maximum for both generated and uploaded PDFs

---

## Pre-Deployment Checklist

### 1. Review Configuration Files

Update the following emails in your configuration:

#### Firestore Rules (`firestore.rules`)
```javascript
function isAdmin() {
  return request.auth != null && 
         request.auth.token.email in [
           'admin1@cyclingwithoutagesociety.org',  // Replace with actual admin emails
           'admin2@cyclingwithoutagesociety.org'
         ];
}
```

#### Environment Variables

Create/update `.env.local` files in each app directory:

```bash
# waivers-app/.env.local
# valid-waivers/.env.local
# paper-waiver-upload/.env.local
# waivers-admin/.env.local

VITE_DEFAULT_SUPPORT_EMAIL=info@cyclingwithoutagesociety.org
VITE_WAIVERS_ADMIN_EMAILS=admin1@org.com,admin2@org.com
```

#### Cloud Functions Environment

```bash
cd functions

# Set App Check enforcement (set to 'false' during testing, 'true' for production)
firebase functions:config:set app.require_app_check="false"

# View current config
firebase functions:config:get
```

### 2. Set Up App Check (Optional but Recommended)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Build → App Check**
4. Click **Get Started**
5. Register each app/domain:
   - **passenger-waivers.web.app** - reCAPTCHA v3
   - **valid-waivers.web.app** - reCAPTCHA v3
   - **paper-waiver-upload.web.app** - reCAPTCHA v3
   - **waivers-admin.web.app** - reCAPTCHA v3
   - **localhost** - Debug token (for development)

6. Update each app's `.env.local`:
```bash
VITE_APP_CHECK_SITE_KEY=your-recaptcha-site-key
```

7. Enable enforcement in Cloud Functions:
```bash
firebase functions:config:set app.require_app_check="true"
```

---

## Deployment Steps

### Step 1: Install Dependencies

```bash
# Install TypeScript for migration scripts
npm install -g typescript ts-node

# Install dependencies for functions
cd functions
npm install
cd ..
```

### Step 2: Set Up Admin Users

Before deploying, set up at least one admin user:

```bash
# Admin users must sign in to the app at least once first
# Then run:
npx ts-node scripts/setup-admin.ts admin@cyclingwithoutagesociety.org
```

This grants admin privileges to the specified email address(es).

### Step 3: Build Cloud Functions

```bash
cd functions
npm run build
cd ..
```

### Step 4: Deploy Security Rules (IMPORTANT - Do this first!)

Deploy Firestore and Storage rules:

```bash
firebase deploy --only firestore:rules,storage
```

**⚠️ Warning:** The new rules are more restrictive. Ensure your admin email is correctly configured in `firestore.rules` before deploying.

### Step 5: Deploy Cloud Functions

```bash
firebase deploy --only functions
```

This deploys the updated Cloud Function with:
- Rate limiting (100 requests/minute)
- App Check enforcement (if enabled)
- PDF size limits (10MB max)
- `expiresAt` field in new waivers

### Step 6: Migrate Existing Data

Add `expiresAt` field to existing waivers:

```bash
# Run from project root
npx ts-node scripts/migrate-add-expires-at.ts
```

This script:
- Finds all waivers without `expiresAt`
- Calculates expiry as `submittedAt + 1 year`
- Updates documents in batches
- Skips settings and template documents

### Step 7: Build and Deploy Frontend Apps

Deploy all four apps:

```bash
# Build and deploy waivers-app (public waiver form)
cd waivers-app
npm run build
firebase deploy --only hosting:waivers-app
cd ..

# Build and deploy valid-waivers
cd valid-waivers
npm run build
firebase deploy --only hosting:valid-waivers
cd ..

# Build and deploy paper-waiver-upload
cd paper-waiver-upload
npm run build
firebase deploy --only hosting:paper-waiver-upload
cd ..

# Build and deploy waivers-admin
cd waivers-admin
npm run build
firebase deploy --only hosting:waivers-admin
cd ..
```

Or deploy all at once:

```bash
firebase deploy
```

---

## Post-Deployment Testing

### 1. Test Public Waiver Submission

1. Go to https://passenger-waivers.web.app
2. Fill out a waiver form
3. Submit and verify success
4. Check Firestore - document should have `expiresAt` field
5. Try submitting 101 waivers rapidly - should see rate limit error

### 2. Test Paper Waiver Upload

1. Go to https://paper-waiver-upload.web.app
2. Sign in with authorized Google account
3. Try uploading a PDF > 10MB - should be rejected
4. Upload a valid PDF < 10MB - should succeed
5. Verify document appears in Firestore with `expiresAt`

### 3. Test Valid Waivers Access

1. Go to https://valid-waivers.web.app
2. Sign in with authorized account
3. Verify all waivers are visible
4. Try searching and filtering

### 4. Test Admin Console

1. Go to https://waivers-admin.web.app
2. Sign in with admin email (set in Step 2)
3. Verify you can access settings
4. Try modifying settings and saving
5. Sign out and sign in with non-admin email
6. Verify you cannot access admin features

### 5. Test Security Rules

Try these operations from browser console (they should all FAIL):

```javascript
// Try to update a waiver (should fail)
firebase.firestore().collection('waivers').doc('some-id').update({ firstName: 'Hacker' });
// Expected: Error: Missing or insufficient permissions

// Try to delete a waiver (should fail)
firebase.firestore().collection('waivers').doc('some-id').delete();
// Expected: Error: Missing or insufficient permissions

// Try to modify settings as non-admin (should fail)
firebase.firestore().collection('waivers').doc('settings').update({ supportEmail: 'hacker@evil.com' });
// Expected: Error: Missing or insufficient permissions
```

---

## Rollback Procedure

If you need to rollback:

### Rollback Security Rules

```bash
git checkout HEAD~1 firestore.rules storage.rules
firebase deploy --only firestore:rules,storage
```

### Rollback Cloud Functions

```bash
cd functions
git checkout HEAD~1 src/index.ts
npm run build
cd ..
firebase deploy --only functions
```

### Rollback Frontend

```bash
# For each app
cd waivers-app
git checkout HEAD~1 src/
npm run build
firebase deploy --only hosting:waivers-app
cd ..
# Repeat for other apps
```

---

## Monitoring

After deployment, monitor for issues:

### Cloud Functions Logs

```bash
firebase functions:log
```

Or view in [Firebase Console](https://console.firebase.google.com/) → Functions → Logs

### Look for these log messages:

- `App Check verification successful` - App Check is working
- `App Check verification failed` - Potential bot or invalid token
- `PDF exceeds size limit` - User tried to upload oversized PDF
- Rate limit errors (HTTP 429) - Possible DoS attempt

### Firestore Rules Analyzer

Firebase Console → Firestore Database → Rules → Rules Playground

Test different scenarios to ensure rules work as expected.

---

## Troubleshooting

### "App Check token required" error

**Cause:** App Check enforcement is enabled but the app doesn't have App Check configured.

**Solution:**
```bash
# Temporarily disable enforcement
firebase functions:config:set app.require_app_check="false"
firebase deploy --only functions
```

### "Missing or insufficient permissions" when uploading paper waiver

**Cause:** User's `uid` doesn't match the `uploadedById` field, or security rules are too strict.

**Solution:**
- Verify user is authenticated
- Check that `uploadedById` is set correctly in `paper-waiver.service.ts`
- Review security rules in `firestore.rules`

### Admin can't access settings

**Cause:** Email not in admin list, or custom claims not set.

**Solution:**
```bash
# Grant admin access
npx ts-node scripts/setup-admin.ts admin@example.com

# Update firestore.rules to include email
# Deploy rules
firebase deploy --only firestore:rules
```

User must sign out and sign back in for changes to take effect.

### Rate limit false positives

**Cause:** Rate limit too aggressive (100 requests/minute).

**Solution:**
Edit `functions/src/index.ts`:
```typescript
rateLimits: {
  maxRequests: 200,  // Increase limit
  perMinutes: 1,
}
```

Then redeploy:
```bash
cd functions && npm run build && cd .. && firebase deploy --only functions
```

---

## Security Best Practices Going Forward

1. **Regularly audit admin users** - Remove employees who no longer need access
2. **Monitor Cloud Functions logs** - Look for suspicious patterns
3. **Keep dependencies updated** - Run `npm audit` regularly
4. **Use environment-specific configs** - Different settings for dev/staging/prod
5. **Enable Firebase App Check** - Once fully tested
6. **Set up alerting** - Use Firebase Console to set up alerts for errors/anomalies
7. **Regular security reviews** - Re-run security audit every 6 months

---

## Support

If you encounter issues:

1. Check [Firebase Status](https://status.firebase.google.com/)
2. Review Firebase Console logs
3. Check this repository's issues
4. Contact: [your support email]

---

## Additional Resources

- [Firebase Security Rules Documentation](https://firebase.google.com/docs/rules)
- [Firebase App Check Documentation](https://firebase.google.com/docs/app-check)
- [Cloud Functions Best Practices](https://firebase.google.com/docs/functions/best-practices)
- [SECURITY_AUDIT.md](SECURITY_AUDIT.md) - Full security audit report

---

**Last Updated:** February 21, 2026
