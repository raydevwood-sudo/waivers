# 🚀 Quick Deployment Checklist

## Pre-Deployment Status

✅ **Configuration Complete:**
- [x] Admin emails configured in `firestore.rules`
  - raydevwood@gmail.com
  - raymond.wood@cyclingwithoutagesociety.org
- [x] Support email configured: support@sidneycwas.ca
- [x] Environment variables updated in all apps
- [x] Cloud Functions build successfully
- [x] .gitignore updated to exclude .env.local files

✅ **Security Fixes Implemented:**
- [x] Added `expiresAt` field to new waivers
- [x] Fixed Firestore security rules (restrict updates/deletes)
- [x] Implemented rate limiting (100 requests/minute)
- [x] Enhanced App Check verification (configurable)
- [x] Added PDF size limits (10MB max)
- [x] Removed hardcoded personal email

---

## Deployment Steps

### Option 1: Automated Deployment (Recommended)

Run the deployment script:

```bash
cd /workspaces/waivers
./deploy-security-fixes.sh
```

This will:
1. ✓ Verify environment
2. ✓ Build Cloud Functions
3. ✓ Deploy Firestore and Storage rules
4. ✓ Deploy Cloud Functions
5. ✓ Optionally deploy frontend apps

### Option 2: Manual Deployment

If you prefer manual control:

```bash
# 1. Build functions
cd functions
npm run build
cd ..

# 2. Deploy security rules FIRST (most important!)
firebase deploy --only firestore:rules,storage

# 3. Deploy Cloud Functions
firebase deploy --only functions

# 4. Deploy frontend apps (optional)
firebase deploy --only hosting
```

---

## Post-Deployment Tasks

### 1. Set Up Admin Users

Admin users need custom claims to access admin features:

```bash
# Install script dependencies
cd scripts
npm install

# Grant admin access (replace with actual emails)
npm run setup:admin raydevwood@gmail.com raymond.wood@cyclingwithoutagesociety.org

# Or run directly
npx ts-node setup-admin.ts raydevwood@gmail.com raymond.wood@cyclingwithoutagesociety.org
```

**Important:** 
- Users must sign in to the app at least once before being granted admin access
- After granting admin access, users must sign out and back in for changes to take effect

### 2. Migrate Existing Data (If Needed)

If you have existing waivers without the `expiresAt` field:

```bash
cd scripts
npm run migrate:expires-at
```

This adds `expiresAt = submittedAt + 1 year` to all existing waivers.

### 3. Configure App Check (Optional)

For bot protection:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project → Build → App Check
3. Register each domain with reCAPTCHA v3
4. Add site keys to `.env.local` files
5. Enable enforcement:
   ```bash
   firebase functions:config:set app.require_app_check="true"
   firebase deploy --only functions
   ```

---

## Testing Checklist

### Critical Tests

Run these tests immediately after deployment:

#### 1. Test Security Rules
```javascript
// Try from browser console - should FAIL
firebase.firestore().collection('waivers').doc('test-id').update({ 
  firstName: 'Hacker' 
});
// Expected: Error: Missing or insufficient permissions ✓

firebase.firestore().collection('waivers').doc('test-id').delete();
// Expected: Error: Missing or insufficient permissions ✓
```

#### 2. Test Public Waiver Submission
- Go to https://passenger-waivers.web.app
- Fill out and submit a waiver
- Check Firestore - document should have `expiresAt` field ✓
- Verify PDF was created in Storage ✓

#### 3. Test Rate Limiting
```bash
# Submit 101 requests rapidly (use a tool like ab or hey)
# The 101st should return HTTP 429
```

#### 4. Test Admin Access
- Sign in to https://waivers-admin.web.app with admin email
- Verify you can access settings ✓
- Try to modify and save settings ✓
- Sign in with non-admin email
- Verify you cannot access admin features ✓

#### 5. Test Paper Waiver Upload
- Go to https://paper-waiver-upload.web.app
- Try uploading PDF > 10MB (should fail) ✓
- Upload valid PDF < 10MB (should succeed) ✓
- Check Firestore - document should have `expiresAt` ✓

#### 6. Test PDF Size Limits
- Try uploading 15MB PDF to paper waiver (should fail) ✓
- Try uploading 5MB PDF (should succeed) ✓

### Additional Tests

- [ ] Valid Waivers search and filter works
- [ ] All signatures appear correctly in PDFs
- [ ] Email notifications work (if enabled)
- [ ] Download PDF function works
- [ ] Expiry dates calculate correctly

---

## Monitoring

### Check Cloud Functions Logs

```bash
# View recent logs
firebase functions:log

# Follow logs in real-time
firebase functions:log --only submitWaiverSecure
```

Look for:
- `App Check verification successful` - App Check working
- `Rate limit exceeded` - Rate limiting working
- `PDF exceeds size limit` - Size limits working
- Any authentication errors

### Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Check **Functions** → Metrics
   - Error rate should be low
   - Response times should be under 3s
3. Check **Firestore** → Usage
   - No unusual spikes in writes/reads
4. Check **Storage** → Usage
   - Monitor storage growth

---

## Rollback Procedure

If something goes wrong:

```bash
# Rollback security rules
git checkout HEAD~1 firestore.rules storage.rules
firebase deploy --only firestore:rules,storage

# Rollback functions
cd functions
git checkout HEAD~1 src/index.ts
npm run build
firebase deploy --only functions
cd ..

# Rollback frontend (if needed)
firebase hosting:rollback waivers-app
firebase hosting:rollback valid-waivers
firebase hosting:rollback paper-waiver-upload
firebase hosting:rollback waivers-admin
```

---

## Troubleshooting

### "App Check token required" error

**Cause:** App Check enforcement enabled but app not configured

**Fix:**
```bash
firebase functions:config:set app.require_app_check="false"
firebase deploy --only functions
```

### "Missing or insufficient permissions" when uploading paper waiver

**Cause:** User not authenticated or security rules too strict

**Fix:**
- Verify user is signed in
- Check Firestore rules allow paper waiver uploads
- Ensure `uploadedById` matches authenticated user

### Admin can't access settings

**Cause:** Admin custom claims not set

**Fix:**
```bash
cd scripts
npm run setup:admin admin@example.com
```

User must sign out and back in after this.

### Rate limit false positives

**Cause:** Limit too aggressive

**Fix:** Edit `functions/src/index.ts`:
```typescript
const RATE_LIMIT = 200; // Increase from 100
```

Then redeploy:
```bash
cd functions && npm run build && cd ..
firebase deploy --only functions
```

---

## Success Metrics

After 24 hours, verify:

- [ ] No "permission denied" errors in logs (except expected ones)
- [ ] Rate limiting triggered (check for HTTP 429 in logs)
- [ ] New waivers have `expiresAt` field
- [ ] Admin features only accessible to admins
- [ ] No oversized PDFs uploaded
- [ ] Function response times < 3 seconds
- [ ] No spikes in error rates

---

## Next Steps

After successful deployment:

### Short Term (This Week)
1. Monitor logs daily for issues
2. Verify all features work as expected
3. Train staff on new admin setup process
4. Update documentation with any changes

### Medium Term (Next 2 Weeks)
1. Implement remaining medium-priority security fixes:
   - Input validation with Zod
   - Remove console.log statements
   - Add Error Boundaries
2. Set up monitoring and alerting (Sentry/Firebase)
3. Add E2E tests

### Long Term (Next Month)
1. Code refactoring (shared packages)
2. TypeScript strict mode
3. Regular security audits
4. Dependency updates

---

## Support Resources

- **Full Deployment Guide:** [SECURITY_DEPLOYMENT.md](SECURITY_DEPLOYMENT.md)
- **Security Audit Report:** [SECURITY_AUDIT.md](SECURITY_AUDIT.md)
- **Implementation Summary:** [SECURITY_FIXES_SUMMARY.md](SECURITY_FIXES_SUMMARY.md)
- **Scripts Documentation:** [scripts/README.md](scripts/README.md)

---

**Deployment Date:** _______________  
**Deployed By:** _______________  
**Status:** ⬜ Ready ⬜ In Progress ⬜ Complete ⬜ Rolled Back  
**Notes:** _______________________________________________
