# Security & Code Quality Audit Report
**Date:** February 20, 2026  
**Project:** Cycling Without Age Society - Waiver System  
**Auditor:** AI Code Review  
**Status:** 20 Issues Identified (6 Critical, 4 Medium, 10 Low/Refactoring)

---

## Executive Summary

This document outlines security vulnerabilities, code quality issues, and refactoring opportunities identified in the waiver management system. The system consists of 4 React applications deployed to Firebase with Cloud Functions backend.

**Critical Findings:**
- Missing `expiresAt` field in Firestore causing inconsistent expiry calculations
- Overly permissive Firestore write rules allowing any authenticated user to modify/delete waivers
- No rate limiting on Cloud Functions (DoS vulnerability)
- App Check tokens not enforced (bot vulnerability)
- Admin authorization only client-side (bypassable)
- 60-70% code duplication across 4 apps

---

## CRITICAL SECURITY ISSUES 🚨

### 1. Missing expiresAt Field in Firestore Documents
**Severity:** HIGH  
**Risk:** Data inconsistency, inefficient queries, calculation errors

**Problem:**
The Cloud Function and paper waiver services calculate expiry dates (submission date + 1 year) but don't store the result in Firestore. Each app recalculates expiry on-the-fly, leading to:
- Inconsistent calculations across apps
- No ability to query by expiry date
- Potential timezone issues
- Performance overhead

**Current Code:**
```javascript
// functions/src/index.ts - Lines ~150-175
// Only stores submittedAt, no expiresAt field
waiverData.submittedAt = admin.firestore.Timestamp.now();
```

**Fix Required:**
```typescript
// In functions/src/index.ts, after line ~160:
const submittedDate = waiverData.submittedAt as admin.firestore.Timestamp;
const expiryDate = new Date(submittedDate.toDate());
expiryDate.setFullYear(expiryDate.getFullYear() + 1);
waiverData.expiresAt = admin.firestore.Timestamp.fromDate(expiryDate);

// In paper-waiver-upload/src/services/paper-waiver.service.ts - Line ~100:
expiresAt: Timestamp.fromDate(expiryDate),

// Then update all apps to use expiresAt instead of calculating
// Update Firestore indexes to enable queries by expiresAt
```

**Testing:**
- Submit new waiver, verify `expiresAt` field exists
- Run migration script to add `expiresAt` to existing documents
- Update Valid Waivers app to query by `expiresAt`

---

### 2. Overly Permissive Firestore Write Rules
**Severity:** HIGH  
**Risk:** Data tampering, unauthorized modifications, data loss

**Problem:**
Current rules at `firestore.rules` line 17:
```javascript
allow write: if request.auth != null;
```

This allows ANY authenticated user to:
- Update existing waivers (change names, dates, signatures)
- Delete waivers
- Overwrite waiver IDs

**Fix Required:**
```javascript
// Replace in firestore.rules:
match /waivers/{documentId} {
  // Public READ access for templates and settings
  allow read: if resource.data.docType == 'waiverTemplate' 
              || resource.data.docType == 'settings'
              || documentId == 'settings';
  
  // Authenticated users can read all waivers
  allow read: if request.auth != null;
  
  // Only allow CREATE, not update/delete
  // Verify uploadedBy matches auth.uid for paper uploads
  allow create: if request.auth != null && 
                (
                  // Paper uploads must set uploadedBy
                  (request.resource.data.source == 'paper-upload' && 
                   request.resource.data.uploadedBy == request.auth.uid) ||
                  // Cloud Function uploads (public form) don't have uploadedBy
                  !request.resource.data.keys().hasAny(['uploadedBy'])
                );
  
  // Only Cloud Functions can update/delete (no direct client writes)
  allow update, delete: if false;
}

// Settings document - restrict to admins only
match /waivers/settings {
  allow read: if true;
  allow write: if request.auth != null && 
               request.auth.token.email in [
                 'admin1@cyclingwithoutagesociety.org',
                 'admin2@cyclingwithoutagesociety.org'
               ];
}

// Template documents - restrict to admins only
match /waivers/{templateId} {
  allow read: if resource.data.docType == 'waiverTemplate';
  allow write: if request.auth != null && 
               request.auth.token.email in [
                 'admin1@cyclingwithoutagesociety.org',
                 'admin2@cyclingwithoutagesociety.org'
               ] && 
               request.resource.data.docType == 'waiverTemplate';
}
```

**Testing:**
- Deploy new rules
- Try to update existing waiver from Valid Waivers app (should fail)
- Try to delete waiver from console (should fail unless admin)
- Verify paper waiver upload still works
- Verify public waiver submission via Cloud Function still works

---

### 3. No Rate Limiting on Cloud Function
**Severity:** HIGH  
**Risk:** DoS attacks, abuse, storage exhaustion, cost overruns

**Problem:**
The `submitWaiverSecure` function has no rate limiting. An attacker could:
- Submit thousands of waivers per second
- Fill up Storage bucket (costs money)
- Exhaust Firestore writes quota
- Generate massive PDF processing costs

**Fix Required:**
```typescript
// In functions/src/index.ts:
import { RateLimiter } from 'firebase-functions/helpers/rateLimiter';

// Create rate limiter (10 requests per minute per IP)
const rateLimiter = new RateLimiter({
  maxRequests: 10,
  perMinutes: 1,
  perIp: true  // Rate limit by IP address
});

export const submitWaiverSecure = onRequest(
  {
    rateLimits: {
      maxRequests: 100,
      perMinutes: 1
    },
    cors: true
  },
  async (req, res) => {
    // Check rate limit
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    if (!rateLimiter.check(clientIp)) {
      res.status(429).json({
        error: 'Too many requests. Please try again later.'
      });
      return;
    }
    
    // ... rest of existing code
  }
);
```

Alternative approach using Firebase Extensions:
```bash
# Install Firebase Rate Limiting Extension
firebase ext:install firebase/firestore-counter
```

**Testing:**
- Submit 11 waivers rapidly from same browser
- 11th should be rejected with 429 status
- Wait 1 minute, try again (should work)
- Test from different IP (should have separate quota)

---

### 4. App Check Not Enforced (Optional)
**Severity:** MEDIUM-HIGH  
**Risk:** Bot submissions, spam, abuse

**Problem:**
In `functions/src/index.ts` lines 107-114, App Check verification fails silently:
```typescript
if (appCheckToken) {
  try {
    await admin.appCheck().verifyToken(appCheckToken);
  } catch (appCheckError) {
    logger.warn('App Check verification failed', appCheckError);
    // Continue anyway - not strictly required
  }
} else {
  logger.warn('No App Check token provided');
}
```

This allows bots and scrapers to submit waivers.

**Fix Required:**
```typescript
// Make App Check mandatory:
const appCheckToken = req.header('X-Firebase-AppCheck');

if (!appCheckToken) {
  res.status(401).json({
    error: 'App Check token required',
    code: 'APP_CHECK_REQUIRED'
  });
  return;
}

try {
  await admin.appCheck().verifyToken(appCheckToken);
} catch (appCheckError) {
  logger.error('App Check verification failed', appCheckError);
  res.status(401).json({
    error: 'Invalid App Check token',
    code: 'APP_CHECK_INVALID'
  });
  return;
}
```

**Prerequisites:**
1. Enable App Check in Firebase Console
2. Register reCAPTCHA v3 site key for each domain:
   - passenger-waivers.web.app
   - localhost (for development)
3. Update environment variables in each app
4. Test thoroughly before deploying

**Testing:**
- Submit waiver without App Check token (should fail)
- Submit with invalid token (should fail)
- Submit with valid token (should succeed)
- Test in development with debug tokens

---

### 5. Admin Authorization Only Client-Side
**Severity:** MEDIUM-HIGH  
**Risk:** Unauthorized admin access, privilege escalation

**Problem:**
Admin check in `waivers-admin/src/components/AdminConsolePage.tsx` lines 10-22:
```typescript
const configuredEmails = (import.meta.env.VITE_WAIVERS_ADMIN_EMAILS as string | undefined)
  ?.split(',')
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean) ?? [];

return configuredEmails.includes(userEmail);
```

This is client-side only. An attacker who gains Google Sign-In access could:
- Modify environment variables locally
- Bypass the UI check
- Access Firestore directly to modify settings/templates

**Fix Required:**

**Option A: Custom Claims (Recommended)**
```typescript
// In Firebase Console or admin script:
admin.auth().setCustomUserClaims(uid, { admin: true });

// In firestore.rules:
match /waivers/settings {
  allow read: if true;
  allow write: if request.auth != null && 
               request.auth.token.admin == true;
}

// In client (waivers-admin):
const idTokenResult = await user.getIdTokenResult();
const isAdmin = idTokenResult.claims.admin === true;
```

**Option B: Firestore-based roles**
```javascript
// Create admins collection
// admins/[uid] { email: string, role: 'admin', created: timestamp }

// In firestore.rules:
match /waivers/settings {
  allow read: if true;
  allow write: if request.auth != null && 
               exists(/databases/$(database)/documents/admins/$(request.auth.uid));
}

// In client:
const adminDoc = await getDoc(doc(db, 'admins', user.uid));
const isAdmin = adminDoc.exists();
```

**Testing:**
- Remove admin claim/document, verify access denied
- Add admin claim/document, verify access granted
- Try to update settings without admin rights (should fail in Firestore rules)

---

### 6. Hardcoded Personal Email in Defaults
**Severity:** LOW  
**Risk:** Privacy leak, unprofessional

**Problem:**
In `valid-waivers/src/services/settings.service.ts` line 62:
```typescript
supportEmail: 'raydevwood@gmail.com',
```

**Fix Required:**
```typescript
// Option 1: Use environment variable
supportEmail: import.meta.env.VITE_DEFAULT_SUPPORT_EMAIL || 'info@cyclingwithoutagesociety.org',

// Option 2: Prompt on first setup
// Show modal asking admin to configure organization settings
```

**Also check:**
- Search codebase for other instances of personal emails
- Remove any test/debug email addresses
- Update README/docs with correct organization emails

---

## MEDIUM SECURITY ISSUES ⚠️

### 7. Missing Input Validation in Cloud Function
**Severity:** MEDIUM  
**Risk:** Invalid data in database, PDF generation errors, injection

**Problem:**
No validation in `functions/src/index.ts` for:
- Email format (could be invalid)
- Phone format (could be anything)
- Name lengths (could break PDF layout)
- Enum values (mediaRelease, waiverType)
- Boolean values (could be strings)

**Fix Required:**
```typescript
// Add at top of functions/src/index.ts:
import { z } from 'zod';

const WaiverFormSchema = z.object({
  waiverType: z.enum(['passenger', 'representative']),
  firstName: z.string().min(1, 'First name required').max(100),
  lastName: z.string().min(1, 'Last name required').max(100),
  town: z.string().min(1).max(100),
  email: z.string().email('Invalid email format'),
  phone: z.string().regex(/^[\d\s\-\(\)\+]+$/, 'Invalid phone format').max(20),
  representativeFirstName: z.string().max(100).optional(),
  representativeLastName: z.string().max(100).optional(),
  informedConsent1: z.boolean(),
  informedConsent2: z.boolean(),
  informedConsent3: z.boolean(),
  informedConsent4: z.boolean(),
  informedConsent5: z.boolean(),
  waiver1: z.boolean(),
  waiver2: z.boolean(),
  waiver3: z.boolean(),
  waiver4: z.boolean(),
  waiver5: z.boolean(),
  mediaRelease: z.enum(['yes', 'no']),
  passengerSignature: z.string().min(1, 'Signature required'),
  passengerTimestamp: z.union([z.string(), z.number()]),
  witnessName: z.string().min(1, 'Witness name required').max(100),
  witnessSignature: z.string().min(1, 'Witness signature required'),
  witnessTimestamp: z.union([z.string(), z.number()]).optional(),
});

// In submitWaiverSecure function, after line 120:
try {
  const validatedFormData = WaiverFormSchema.parse(formData);
  // Use validatedFormData instead of formData for rest of function
} catch (error) {
  if (error instanceof z.ZodError) {
    res.status(400).json({
      error: 'Invalid form data',
      details: error.errors
    });
    return;
  }
  throw error;
}
```

**Dependencies:**
```bash
cd functions
npm install zod
```

**Testing:**
- Submit waiver with invalid email (should be rejected)
- Submit with too-long names (should be rejected)
- Submit with invalid mediaRelease value (should be rejected)
- Submit with missing required fields (should be rejected)

---

### 8. PDF Size Limits Not Enforced
**Severity:** MEDIUM  
**Risk:** Memory exhaustion, storage costs, slow uploads

**Problem:**
- No size limit on generated PDFs in Cloud Function
- No size limit on uploaded PDFs in paper waiver app
- Large PDFs could exhaust Cloud Function memory (512MB-2GB depending on config)

**Fix Required:**

**Cloud Function:**
```typescript
// In functions/src/index.ts, after pdfBuffer creation (line ~157):
const MAX_PDF_SIZE = 10 * 1024 * 1024; // 10MB
if (pdfBuffer.length > MAX_PDF_SIZE) {
  logger.error('PDF exceeds size limit', { size: pdfBuffer.length });
  res.status(413).json({
    error: 'Generated PDF is too large. Please contact support.',
    code: 'PDF_TOO_LARGE'
  });
  return;
}
```

**Paper Waiver Upload:**
```typescript
// In paper-waiver-upload/src/components/PaperWaiverUploadForm.tsx:
const MAX_UPLOAD_SIZE = 10 * 1024 * 1024; // 10MB

<Input
  type="file"
  accept=".pdf"
  onChange={(e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > MAX_UPLOAD_SIZE) {
        alert('PDF must be under 10MB. Please compress your PDF and try again.');
        e.target.value = '';
        return;
      }
      if (file.type !== 'application/pdf') {
        alert('Only PDF files are allowed.');
        e.target.value = '';
        return;
      }
      setPdfFile(file);
    }
  }}
/>

// Show file size to user:
{pdfFile && (
  <p className="text-sm text-gray-600">
    Selected: {pdfFile.name} ({(pdfFile.size / 1024 / 1024).toFixed(2)} MB)
  </p>
)}
```

**Storage Rules:**
```javascript
// In storage.rules:
match /waivers/pdfs/{pdfId} {
  allow read: if request.auth != null;
  allow write: if request.auth != null && 
               request.resource.size < 10 * 1024 * 1024 && // 10MB max
               request.resource.contentType == 'application/pdf';
}
```

**Testing:**
- Try to upload 15MB PDF (should be rejected)
- Try to upload .txt file renamed to .pdf (should be rejected)
- Upload valid 5MB PDF (should succeed)

---

### 9. Excessive Console Logging in Production
**Severity:** LOW-MEDIUM  
**Risk:** Information disclosure, performance impact

**Problem:**
30+ console.log statements found across apps that log:
- Template data
- PDF sizes
- Form submission data
- Endpoint URLs
- User information

**Examples:**
- `waivers-app/src/services/waiver.service.ts` lines 40, 161, 164, 176, 183
- `waivers-app/src/services/pdf-generator.service.ts` lines 181, 182, 198, 321, 324, 327
- `waivers-admin/src/components/SettingsManager.tsx` line 55

**Fix Required:**

**Create logger utility:**
```typescript
// Create: packages/shared-utils/src/logger.ts
type LogLevel = 'log' | 'warn' | 'error' | 'info';

class Logger {
  private isDev = import.meta.env.DEV || import.meta.env.MODE === 'development';

  log(...args: unknown[]): void {
    if (this.isDev) {
      console.log('[LOG]', ...args);
    }
  }

  info(...args: unknown[]): void {
    if (this.isDev) {
      console.info('[INFO]', ...args);
    }
  }

  warn(...args: unknown[]): void {
    console.warn('[WARN]', ...args); // Always show warnings
  }

  error(...args: unknown[]): void {
    console.error('[ERROR]', ...args); // Always show errors
  }

  // Production-safe logging with sanitization
  prodLog(message: string, sanitizedData?: Record<string, unknown>): void {
    if (!this.isDev) {
      console.log(message, sanitizedData);
    }
  }
}

export const logger = new Logger();
```

**Then replace all console.log:**
```typescript
// Before:
console.log('Generating PDF with template:', submission.template?.title);

// After:
logger.log('Generating PDF with template:', submission.template?.title);

// For errors (keep in production):
logger.error('PDF generation failed:', error);
```

**Bulk replacement:**
```bash
# Run this script to replace all console.log:
find . -name "*.ts" -o -name "*.tsx" | xargs sed -i 's/console\.log/logger.log/g'
find . -name "*.ts" -o -name "*.tsx" | xargs sed -i 's/console\.warn/logger.warn/g'
# console.error should stay as-is or use logger.error
```

---

### 10. .env.local Not in .gitignore
**Severity:** LOW  
**Risk:** Accidental credential leak

**Problem:**
`.gitignore` only lists `.env`, but Vite uses `.env.local` for local overrides. One `.env.local` file was already committed (contains sensitive Firebase credentials).

**Fix Required:**
```bash
# In .gitignore, replace line 64:
# dotenv environment variables file
.env
.env.local
.env*.local
*.env.local
.env.production.local
.env.development.local
```

**Immediate action required:**
```bash
# Remove .env.local from git history:
git rm --cached .env.local
git commit -m "Remove .env.local from tracking"

# Rotate any exposed credentials:
# 1. Regenerate Firebase API keys in Firebase Console
# 2. Update ReCaptcha site keys
# 3. Rotate any other secrets that were in .env.local
```

---

## CODE QUALITY & REFACTORING OPPORTUNITIES 🔧

### 11. Massive Code Duplication (60-70%)
**Severity:** HIGH  
**Impact:** Maintenance nightmare, inconsistent behavior, bug multiplication

**Duplicated Files:**
- `services/pdf-generator.service.ts` - 4 copies, 400+ lines each
- `services/waiver.service.ts` - 4 copies, 200+ lines each
- `services/template.service.ts` - 3 copies, 120+ lines each
- `services/settings.service.ts` - 3 copies, 350+ lines each
- `services/waiver-viewer.service.ts` - 3 copies
- `config/firebase.ts` - 4 copies
- `types/index.ts` - 4 copies
- `types/waiver.ts` - 4 copies
- All UI components: Button, Input, Checkbox, Radio, Loader, Modal

**Fix Required:**

**Step 1: Set up monorepo structure**
```bash
# Install workspace tools
npm install -g pnpm  # Or use npm/yarn workspaces

# Create package structure:
mkdir -p packages/shared-ui/src
mkdir -p packages/shared-services/src
mkdir -p packages/shared-types/src
mkdir -p packages/shared-utils/src
```

**Step 2: Create shared packages**

```json
// packages/shared-ui/package.json
{
  "name": "@waivers/shared-ui",
  "version": "1.0.0",
  "main": "./src/index.ts",
  "peerDependencies": {
    "react": "^19.2.0",
    "react-dom": "^19.2.0"
  }
}

// packages/shared-services/package.json
{
  "name": "@waivers/shared-services",
  "version": "1.0.0",
  "main": "./src/index.ts",
  "dependencies": {
    "firebase": "^11.1.0",
    "jspdf": "^4.1.0"
  }
}

// packages/shared-types/package.json
{
  "name": "@waivers/shared-types",
  "version": "1.0.0",
  "main": "./src/index.ts"
}
```

**Step 3: Move shared code**

```typescript
// packages/shared-ui/src/index.ts
export { default as Button } from './Button';
export { default as Input } from './Input';
export { default as Checkbox } from './Checkbox';
export { default as Radio } from './Radio';
export { default as Loader } from './Loader';

// packages/shared-services/src/index.ts
export * from './pdf-generator';
export * from './firebase-config';
export * from './waiver';
export * from './template';

// packages/shared-types/src/index.ts
export * from './waiver';
export * from './settings';
export * from './template';
```

**Step 4: Update app dependencies**

```json
// waivers-app/package.json
{
  "dependencies": {
    "@waivers/shared-ui": "workspace:*",
    "@waivers/shared-services": "workspace:*",
    "@waivers/shared-types": "workspace:*"
  }
}
```

**Step 5: Update imports**

```typescript
// Before:
import Button from '../components/ui/Button';
import { generateWaiverPDF } from '../services/pdf-generator.service';
import type { WaiverData } from '../types/waiver';

// After:
import { Button } from '@waivers/shared-ui';
import { generateWaiverPDF } from '@waivers/shared-services';
import type { WaiverData } from '@waivers/shared-types';
```

**Step 6: Root package.json**

```json
{
  "name": "waivers-monorepo",
  "private": true,
  "workspaces": [
    "packages/*",
    "waivers-app",
    "valid-waivers",
    "paper-waiver-upload",
    "waivers-admin",
    "functions"
  ],
  "scripts": {
    "build:packages": "pnpm --filter './packages/*' build",
    "build:apps": "pnpm --filter './waivers-*' build && pnpm --filter './valid-waivers' build && pnpm --filter './paper-waiver-upload' build"
  }
}
```

**Benefits:**
- Single source of truth for shared code
- Bug fixes apply to all apps instantly
- Easier to maintain consistency
- Smaller bundle sizes (no duplication)
- Simpler testing (test once, use everywhere)

**Estimated effort:** 2-3 days

---

### 12. Outdated jsPDF Version
**Severity:** MEDIUM  
**Risk:** Security vulnerabilities, missing features

**Problem:**
All apps use `jspdf@^4.1.0` (released ~2017). Current version is 2.5.x.

**Check for vulnerabilities:**
```bash
cd waivers-app
npm audit | grep jspdf
```

**Fix Required:**
```bash
# In each app directory:
npm uninstall jspdf
npm install jspdf@latest

# Or if using shared package (after refactoring):
cd packages/shared-services
npm install jspdf@latest
```

**Breaking changes to address:**
- API changes in jspdf 2.x
- Font handling changes
- Image embedding changes
- Test PDF generation thoroughly after upgrade

**Testing checklist:**
- [ ] Passenger waiver PDF generates correctly
- [ ] Representative waiver PDF generates correctly
- [ ] Signatures appear correctly
- [ ] Multi-page PDFs work
- [ ] Special characters display correctly
- [ ] PDF file size is reasonable
- [ ] All metadata is preserved

---

### 13. Missing Error Boundaries
**Severity:** MEDIUM  
**Impact:** Poor user experience when errors occur

**Problem:**
No React Error Boundaries in any app. If any component crashes:
- Entire app shows blank white screen
- No error message to user
- No way to recover
- No error reporting

**Fix Required:**

```typescript
// Create: packages/shared-ui/src/ErrorBoundary.tsx
import React, { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('Error boundary caught:', error, errorInfo);
    
    // TODO: Send to error reporting service (Sentry, etc.)
    // logErrorToService(error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Something went wrong
              </h2>
              <p className="text-gray-600 mb-6">
                We're sorry, but something unexpected happened. Please try refreshing the page.
              </p>
              {import.meta.env.DEV && this.state.error && (
                <pre className="text-left text-xs bg-gray-100 p-4 rounded overflow-auto mb-4">
                  {this.state.error.toString()}
                </pre>
              )}
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg font-medium transition-colors duration-200"
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

**Usage in each app:**

```typescript
// In App.tsx:
import { ErrorBoundary } from '@waivers/shared-ui';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ErrorBoundary>
  );
}
```

**Testing:**
```typescript
// Create a test component that throws:
function ErrorTest() {
  throw new Error('Test error boundary');
}

// Temporarily add to your app to test error boundary
```

---

### 14. TypeScript Not in Strict Mode
**Severity:** LOW-MEDIUM  
**Impact:** Type safety issues, potential runtime errors

**Problem:**
All `tsconfig.json` files are not using TypeScript's strict mode, allowing:
- Implicit `any` types
- Null/undefined issues
- Unreachable code
- Fallthrough cases in switches

**Fix Required:**

```json
// In each app's tsconfig.json:
{
  "compilerOptions": {
    "strict": true,                           // Enable all strict checks
    "noUncheckedIndexedAccess": true,        // array[i] returns T | undefined
    "noImplicitReturns": true,               // All code paths must return
    "noFallthroughCasesInSwitch": true,      // No fallthrough in switches
    "noImplicitOverride": true,              // Must use override keyword
    "allowUnusedLabels": false,              // No unused labels
    "allowUnreachableCode": false,           // No unreachable code
    "exactOptionalPropertyTypes": true,      // Optional props can't be undefined
    "noPropertyAccessFromIndexSignature": true // Use bracket notation for index
  }
}
```

**This will cause compilation errors. Fix them:**

```typescript
// Before:
function getName(user) {  // Implicit any
  return user.name;
}

// After:
function getName(user: User): string {
  return user.name;
}

// Before:
const items = ['a', 'b'];
const first = items[10];  // string
first.toUpperCase();      // Runtime error!

// After:
const items = ['a', 'b'];
const first = items[10];  // string | undefined
if (first) {
  first.toUpperCase();    // Safe!
}
```

**Enable gradually:**
1. Start with one app (e.g., waivers-app)
2. Fix all errors (may take few hours)
3. Apply to other apps
4. Add to shared packages

---

### 15. Inconsistent Date Handling
**Severity:** MEDIUM  
**Impact:** Bugs, timezone issues, calculation errors

**Problem:**
Mix of date formats across codebase:
- `new Date()` (JavaScript Date objects)
- `admin.firestore.Timestamp`
- ISO strings (`2026-02-20T12:00:00Z`)
- Epoch milliseconds (1708437600000)
- `date-fns` functions in some places

**Fix Required:**

**Create date utility:**
```typescript
// packages/shared-utils/src/date-utils.ts
import { addYears, format, parseISO, isValid } from 'date-fns';
import type { Timestamp } from 'firebase/firestore';

/**
 * Convert any date format to Date object
 */
export function toDate(value: Date | Timestamp | string | number): Date {
  if (value instanceof Date) return value;
  
  // Firestore Timestamp
  if (value && typeof value === 'object' && 'toDate' in value) {
    return value.toDate();
  }
  
  // ISO string
  if (typeof value === 'string') {
    const parsed = parseISO(value);
    if (isValid(parsed)) return parsed;
    throw new Error(`Invalid date string: ${value}`);
  }
  
  // Epoch milliseconds
  if (typeof value === 'number') {
    const date = new Date(value);
    if (isValid(date)) return date;
    throw new Error(`Invalid timestamp: ${value}`);
  }
  
  throw new Error(`Unknown date format: ${value}`);
}

/**
 * Calculate waiver expiry date (submitted + 1 year)
 */
export function calculateWaiverExpiry(submittedAt: Date | Timestamp | string): Date {
  const date = toDate(submittedAt);
  return addYears(date, 1);
}

/**
 * Check if waiver is still valid
 */
export function isWaiverValid(submittedAt: Date | Timestamp | string): boolean {
  const expiry = calculateWaiverExpiry(submittedAt);
  return expiry >= new Date();
}

/**
 * Format date for display
 */
export function formatDisplayDate(date: Date | Timestamp | string): string {
  return format(toDate(date), 'MMMM d, yyyy');
}

/**
 * Format date for PDF
 */
export function formatPdfDate(date: Date | Timestamp | string): string {
  return format(toDate(date), 'yyyy-MM-dd');
}
```

**Replace all date calculations:**
```typescript
// Before (inconsistent):
const expiry = new Date(waiver.submittedAt);
expiry.setFullYear(expiry.getFullYear() + 1);

// After (consistent):
import { calculateWaiverExpiry, isWaiverValid } from '@waivers/shared-utils/date-utils';

const expiry = calculateWaiverExpiry(waiver.submittedAt);
const isValid = isWaiverValid(waiver.submittedAt);
```

---

### 16. Missing Shared Validation (Zod Schemas)
**Severity:** MEDIUM  
**Impact:** Inconsistent validation, duplicated code

**Problem:**
Each app has its own validation logic, or no validation at all. Should be shared between frontend and backend.

**Fix Required:**

```typescript
// packages/shared-types/src/schemas.ts
import { z } from 'zod';

export const WaiverFormSchema = z.object({
  waiverType: z.enum(['passenger', 'representative'], {
    errorMap: () => ({ message: 'Waiver type must be passenger or representative' })
  }),
  
  // Personal info
  firstName: z.string()
    .min(1, 'First name is required')
    .max(100, 'First name must be less than 100 characters')
    .regex(/^[a-zA-Z\s\-']+$/, 'First name can only contain letters, spaces, hyphens, and apostrophes'),
    
  lastName: z.string()
    .min(1, 'Last name is required')
    .max(100, 'Last name must be less than 100 characters')
    .regex(/^[a-zA-Z\s\-']+$/, 'Last name can only contain letters, spaces, hyphens, and apostrophes'),
    
  town: z.string()
    .min(1, 'Town is required')
    .max(100, 'Town must be less than 100 characters'),
    
  email: z.string()
    .email('Invalid email format')
    .max(255, 'Email must be less than 255 characters'),
    
  phone: z.string()
    .regex(/^[\d\s\-\(\)\+]+$/, 'Phone can only contain numbers, spaces, hyphens, parentheses, and plus signs')
    .min(10, 'Phone number must be at least 10 digits')
    .max(20, 'Phone number must be less than 20 characters'),
    
  // Representative info (conditional)
  representativeFirstName: z.string().max(100).optional(),
  representativeLastName: z.string().max(100).optional(),
  
  // Agreements (all required to be true)
  informedConsent1: z.literal(true, { errorMap: () => ({ message: 'You must agree to this consent' }) }),
  informedConsent2: z.literal(true, { errorMap: () => ({ message: 'You must agree to this consent' }) }),
  informedConsent3: z.literal(true, { errorMap: () => ({ message: 'You must agree to this consent' }) }),
  informedConsent4: z.literal(true, { errorMap: () => ({ message: 'You must agree to this consent' }) }),
  informedConsent5: z.literal(true, { errorMap: () => ({ message: 'You must agree to this consent' }) }),
  waiver1: z.literal(true, { errorMap: () => ({ message: 'You must agree to this waiver clause' }) }),
  waiver2: z.literal(true, { errorMap: () => ({ message: 'You must agree to this waiver clause' }) }),
  waiver3: z.literal(true, { errorMap: () => ({ message: 'You must agree to this waiver clause' }) }),
  waiver4: z.literal(true, { errorMap: () => ({ message: 'You must agree to this waiver clause' }) }),
  waiver5: z.literal(true, { errorMap: () => ({ message: 'You must agree to this waiver clause' }) }),
  
  // Media release
  mediaRelease: z.enum(['yes', 'no']),
  
  // Signatures
  passengerSignature: z.string().min(1, 'Passenger signature is required'),
  passengerTimestamp: z.union([z.string(), z.number()]),
  witnessName: z.string().min(1, 'Witness name is required').max(100),
  witnessSignature: z.string().min(1, 'Witness signature is required'),
  witnessTimestamp: z.union([z.string(), z.number()]).optional(),
});

// Refine for conditional validation
export const ValidatedWaiverFormSchema = WaiverFormSchema.refine(
  (data) => {
    if (data.waiverType === 'representative') {
      return !!data.representativeFirstName && !!data.representativeLastName;
    }
    return true;
  },
  {
    message: 'Representative name is required when waiver type is representative',
    path: ['representativeFirstName'],
  }
);

export type WaiverFormData = z.infer<typeof WaiverFormSchema>;
```

**Use in frontend:**
```typescript
// In waivers-app/src/components/form/WaiverForm.tsx
import { ValidatedWaiverFormSchema } from '@waivers/shared-types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(ValidatedWaiverFormSchema)
});
```

**Use in backend:**
```typescript
// In functions/src/index.ts
import { ValidatedWaiverFormSchema } from '../shared-types';

try {
  const validatedData = ValidatedWaiverFormSchema.parse(formData);
  // Use validatedData (type-safe!)
} catch (error) {
  if (error instanceof z.ZodError) {
    res.status(400).json({
      error: 'Invalid form data',
      details: error.errors
    });
    return;
  }
}
```

---

## BEST PRACTICES & IMPROVEMENTS 💡

### 17. Add Content Security Policy (CSP)
**Severity:** LOW  
**Benefit:** Prevent XSS attacks

**Implementation:**
```html
<!-- In each app's index.html <head>: -->
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com https://www.gstatic.com;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src 'self' https://fonts.gstatic.com;
  img-src 'self' data: https: blob:;
  connect-src 'self' https://*.googleapis.com https://*.firebaseio.com https://*.cloudfunctions.net https://firestore.googleapis.com;
  frame-src https://*.google.com;
">
```

**Test thoroughly:**
- Check browser console for CSP violations
- Adjust policy as needed
- Test all features (auth, file upload, PDF generation)

---

### 18. Add Monitoring and Error Tracking
**Severity:** LOW  
**Benefit:** Catch production errors, monitor performance

**Option 1: Sentry (Recommended)**

```bash
npm install @sentry/react @sentry/vite-plugin
```

```typescript
// In each app's main.tsx:
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  integrations: [
    new Sentry.BrowserTracing(),
    new Sentry.Replay()
  ],
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});
```

```typescript
// In functions:
import * as Sentry from '@sentry/node';

Sentry.init({ dsn: process.env.SENTRY_DSN });

export const submitWaiverSecure = Sentry.wrapHttpsOnRequest(
  onRequest(async (req, res) => {
    // Your code
  })
);
```

**Option 2: Firebase Crashlytics**

```typescript
import { getPerformance } from 'firebase/performance';
import { getAnalytics } from 'firebase/analytics';

const perf = getPerformance(app);
const analytics = getAnalytics(app);
```

---

### 19. Add E2E Testing
**Severity:** LOW  
**Benefit:** Catch bugs before users do

```bash
npm install -D @playwright/test
```

```typescript
// Create: e2e/waiver-submission.spec.ts
import { test, expect } from '@playwright/test';

test('complete passenger waiver submission', async ({ page }) => {
  await page.goto('https://passenger-waivers.web.app');
  
  // Fill form
  await page.fill('[name="firstName"]', 'John');
  await page.fill('[name="lastName"]', 'Doe');
  await page.fill('[name="town"]', 'Vancouver');
  await page.fill('[name="email"]', 'john@example.com');
  await page.fill('[name="phone"]', '604-555-1234');
  
  // Navigate through steps
  await page.click('button:has-text("Next")');
  
  // ... complete form
  
  // Check signature
  await page.click('text=Click to Sign');
  const canvas = await page.locator('canvas');
  await canvas.click(); // Simple signature
  await page.click('button:has-text("Save")');
  
  // Submit
  await page.click('button:has-text("Submit")');
  
  // Verify success
  await expect(page).toHaveURL(/success/, { timeout: 10000 });
  await expect(page.locator('text=Success')).toBeVisible();
});
```

---

### 20. Add Dependency Security Scanning
**Severity:** LOW  
**Benefit:** Automatically detect vulnerable dependencies

**.github/workflows/security.yml:**
```yaml
name: Security Audit
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
  schedule:
    - cron: '0 0 * * 1'  # Weekly on Mondays

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '24'
      
      - name: Audit waivers-app
        working-directory: ./waivers-app
        run: |
          npm audit --production
          npm audit --audit-level=high
      
      - name: Audit valid-waivers
        working-directory: ./valid-waivers
        run: |
          npm audit --production
          npm audit --audit-level=high
      
      - name: Audit paper-waiver-upload
        working-directory: ./paper-waiver-upload
        run: |
          npm audit --production
          npm audit --audit-level=high
      
      - name: Audit waivers-admin
        working-directory: ./waivers-admin
        run: |
          npm audit --production
          npm audit --audit-level=high
      
      - name: Audit functions
        working-directory: ./functions
        run: |
          npm audit --production
          npm audit --audit-level=high
```

---

## IMPLEMENTATION PRIORITY

### IMMEDIATE (Before Production Launch) 🚨
**Timeline: 1-2 days**

1. ✅ Add `expiresAt` field to Firestore documents
   - Update Cloud Function
   - Update paper waiver service
   - Deploy and test

2. ✅ Fix Firestore security rules
   - Update rules file
   - Deploy rules
   - Test with non-admin users

3. ✅ Implement rate limiting on Cloud Function
   - Add rate limiter code
   - Deploy function
   - Test with rapid submissions

4. ✅ Enforce App Check tokens (optional but recommended)
   - Update function code
   - Enable App Check in console
   - Test thoroughly

5. ✅ Add server-side admin authorization
   - Set up custom claims or admin collection
   - Update security rules
   - Test access control

6. ✅ Remove hardcoded email
   - Update default settings
   - Use environment variables

### HIGH PRIORITY (Within 1 Week) ⚠️
**Timeline: 3-5 days**

7. ✅ Add input validation with Zod
   - Create shared schemas
   - Add to Cloud Function
   - Add to frontend forms

8. ✅ Add PDF size limits
   - Update Cloud Function
   - Update paper waiver upload
   - Update storage rules

9. ✅ Replace console.log with logger
   - Create logger utility
   - Do bulk replacement
   - Test in dev and prod

10. ✅ Fix .gitignore
    - Update gitignore
    - Remove .env.local from git
    - Rotate exposed credentials

### MEDIUM PRIORITY (Within 2 Weeks) 🔧
**Timeline: 1-2 weeks**

11. ✅ Create shared packages (refactoring)
    - Set up monorepo
    - Move shared code
    - Update all imports
    - Test thoroughly

12. ✅ Upgrade jsPDF
    - Update dependencies
    - Fix breaking changes
    - Test PDF generation

13. ✅ Add Error Boundaries
    - Create component
    - Add to all apps
    - Test error cases

14. ✅ Enable TypeScript strict mode
    - Update tsconfig
    - Fix type errors
    - Test compilation

15. ✅ Standardize date handling
    - Create date utilities
    - Replace date code
    - Test date calculations

### LOW PRIORITY (Future) 💡
**Timeline: As time permits**

16. Add Content Security Policy
17. Set up error monitoring (Sentry)
18. Add E2E testing
19. Set up security scanning
20. Add performance monitoring

---

## TESTING CHECKLIST

After implementing fixes, verify:

### Security Testing
- [ ] Cannot modify waivers after creation
- [ ] Cannot delete waivers except via admin
- [ ] Rate limiting works (429 after 10 requests)
- [ ] App Check rejects missing/invalid tokens
- [ ] Non-admin cannot access admin features
- [ ] expiresAt field is set correctly
- [ ] No credentials in git history

### Functional Testing
- [ ] Public waiver submission works
- [ ] Paper waiver upload works
- [ ] Valid Waivers app displays all waivers
- [ ] Admin console settings save correctly
- [ ] PDF generation works
- [ ] Signatures appear in PDFs
- [ ] Expiry dates calculated correctly
- [ ] Search and filter work

### Performance Testing
- [ ] PDF generation < 3 seconds
- [ ] Page load < 2 seconds
- [ ] Large PDF upload completes
- [ ] Rapid submissions handled gracefully

---

## MIGRATION PLAN FOR EXISTING DATA

If you already have waivers in production without `expiresAt`:

```typescript
// Create: scripts/add-expires-at.ts
import * as admin from 'firebase-admin';
admin.initializeApp();

const db = admin.firestore();

async function addExpiresAtField() {
  const waivers = await db.collection('waivers').get();
  const batch = db.batch();
  let count = 0;

  for (const doc of waivers.docs) {
    const data = doc.data();
    
    // Skip if already has expiresAt
    if (data.expiresAt) continue;
    
    // Skip settings and template docs
    if (data.docType === 'settings' || data.docType === 'waiverTemplate') {
      continue;
    }
    
    // Calculate expiresAt from submittedAt
    if (data.submittedAt) {
      const submittedDate = data.submittedAt.toDate();
      const expiryDate = new Date(submittedDate);
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);
      
      batch.update(doc.ref, {
        expiresAt: admin.firestore.Timestamp.fromDate(expiryDate)
      });
      count++;
      
      // Commit in batches of 500
      if (count % 500 === 0) {
        await batch.commit();
        console.log(`Updated ${count} documents...`);
      }
    }
  }
  
  // Commit remaining
  if (count % 500 !== 0) {
    await batch.commit();
  }
  
  console.log(`✅ Updated ${count} total documents with expiresAt field`);
}

addExpiresAtField()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });
```

Run migration:
```bash
cd functions
npx ts-node ../scripts/add-expires-at.ts
```

---

## MONITORING & ALERTS

Set up alerts for:

1. **High error rate** (>5% of requests)
2. **Slow Cloud Functions** (>5 seconds)
3. **Storage quota** (>80% of limit)
4. **Unusual traffic patterns** (10x normal)
5. **Failed authentication attempts** (>10 per minute)

Configure in Firebase Console > Monitoring.

---

## ADDITIONAL RESOURCES

- [Firebase Security Rules Docs](https://firebase.google.com/docs/rules)
- [Cloud Functions Best Practices](https://firebase.google.com/docs/functions/best-practices)
- [React Error Boundary Docs](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)
- [Zod Documentation](https://zod.dev)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)

---

## CONTACT FOR QUESTIONS

When resuming this work:
1. Review this document thoroughly
2. Start with IMMEDIATE priority items
3. Test each fix before moving to next
4. Update this document as you complete items
5. Document any new issues found

**Last Updated:** February 20, 2026  
**Next Review:** After completing immediate priority items
