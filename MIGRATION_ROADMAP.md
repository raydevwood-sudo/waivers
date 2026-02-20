# Waiver System Migration Roadmap
## From Google Apps Script to React + Vite + Tailwind + Firebase

**Project:** Cycling Without Age Society - Waiver and Release of Liability System  
**Created:** February 16, 2026  
**Repository:** raydevwood-sudo/waivers

---

## Executive Summary

This document outlines the complete migration plan for the Waiver and Release of Liability application from Google Apps Script to a modern web stack including React, Vite, Tailwind CSS, Firebase Hosting, Firestore, and Firebase Functions.

### Current System (Google Apps Script)
- **Frontend:** HTML + vanilla JavaScript with Material Design-inspired CSS
- **Backend:** Google Apps Script (Code.gs)
- **Database:** Google Sheets
- **File Storage:** Google Drive
- **PDF Generation:** Google Docs template-based
- **Email:** Gmail API
- **Hosting:** Google Apps Script Web App

### Target System (Modern Stack)
- **Frontend:** React 18 + Vite + Tailwind CSS
- **Backend:** Firebase Functions (Node.js)
- **Database:** Cloud Firestore
- **File Storage:** Firebase Storage
- **PDF Generation:** PDFKit or Puppeteer in Firebase Functions
- **Email:** SendGrid/Mailgun via Firebase Functions
- **Hosting:** Firebase Hosting
- **Authentication:** Firebase Authentication (optional, for admin panel)

---

## 🎉 Current Status - MIGRATION COMPLETE + ALL APPS DEPLOYED

**Status:** ✅ **ALL 4 APPS IN PRODUCTION (Test Environment)**  
**Last Updated:** February 20, 2026  
**Deployment Date:** February 16-20, 2026

**Current Phase:** Testing & Validation  
**Next Phase:** Production Firebase Migration

### What's Complete
- ✅ All 4 applications built and deployed to test Firebase (cwas-testing)
- ✅ Full feature set implemented and operational
- ✅ Authentication and authorization working
- ✅ Cloud Functions deployed and tested
- ✅ Security rules configured

### What's Next
- 🔄 Developer testing and bug fixes
- 🔄 User acceptance testing (UAT) with volunteers/staff/admins
- ⏭️ Migration to organization's production Firebase project
- ⏭️ Data migration from Google Sheets to Firestore
- ⏭️ Production launch and user training

### Production Applications

#### 1. **Passenger Waiver Submission** (Public)
- **URL:** https://passenger-waivers.web.app
- **Purpose:** Public-facing waiver submission form
- **Status:** ✅ Fully operational
- **Features:**
  - Multi-step form with 14 pages (waiver type, personal info, 5 informed consent pages, 5 waiver pages, media release, signature)
  - Digital signature capture for passenger and witness
  - Form validation and progress tracking
  - PDF generation with embedded signatures
  - Automatic PDF storage in Firebase Storage
  - Data persistence in Firestore with 1-year expiry tracking
  - Success confirmation page
- **Tech Stack:** React 19.2, Vite 7.3, TypeScript 5.9, Tailwind CSS 3.4
- **Backend:** Cloud Function `submitWaiverSecure` (Node.js 24, us-central1)

#### 2. **Valid Waivers App** (Authenticated)
- **URL:** https://valid-waivers.web.app
- **Purpose:** Volunteer-facing app for viewing and searching valid waivers
- **Status:** ✅ Fully operational
- **Features:**
  - Google Sign-In authentication (any Google account)
  - Sortable waiver table (Last Name, First Name, Expiry Date)
  - Search by first or last name
  - Filter by validity status (valid/expired/all)
  - Media release indicator (camera icon)
  - Click-to-view PDF modal viewer
  - Alternating row colors for readability
  - Real-time data from Firestore
- **Tech Stack:** React 19.2, Vite 7.3, TypeScript 5.9, Tailwind CSS 3.4, Firebase Auth
- **Security:** Authenticated read access to Firestore and Storage

#### 3. **Paper Waiver Upload** (Authenticated)
- **URL:** https://paper-waiver-upload.web.app
- **Purpose:** Staff tool for digitizing paper waivers
- **Status:** ✅ Deployed (requires auth domain config)
- **Features:**
  - Google Sign-In authentication
  - Manual data entry form (mirrors digital waiver fields)
  - PDF file upload for scanned paper waivers
  - Waiver type selection (passenger/representative)
  - Automatic expiry calculation (+1 year from submission date)
  - Upload tracking (uploadedBy, uploadedAt, source: "paper-upload")
  - Form validation and error handling
  - Success confirmation with auto-reset
- **Tech Stack:** React 19.2, Vite 7.3, TypeScript 5.9, Tailwind CSS 3.4, Firebase Auth/Storage
- **Final Step:** Add authorized domain `paper-waiver-upload.web.app` to Firebase Auth

#### 4. **Waivers Admin / Console** (Authenticated)
- **URL:** https://waiver-console.web.app
- **Purpose:** Restricted app for managing platform settings and waiver versions
- **Status:** ✅ Fully operational
- **Features:**
  - Google Sign-In authentication
  - Admin-only access control via `VITE_WAIVERS_ADMIN_EMAILS`
  - **Settings Manager:** Configure organization name, support email, feature flags, Valid Waivers access control
  - **Template Manager:** Create/edit waiver templates, version control, draft/publish workflow
  - Real-time settings updates to Firestore
  - Audit trail (updatedAt, updatedBy tracking)
  - Access denied page for unauthorized users
- **Tech Stack:** React 19.2, Vite 7.3, TypeScript 5.9, Tailwind CSS 3.4, Firebase Auth/Firestore
- **Security:** Email-based admin authorization required

### Firebase Infrastructure

#### Project Details
- **Project ID:** `cwas-testing`
- **Region:** northamerica-northeast2
- **Multi-site Hosting:** 4 sites (passenger-waivers, valid-waivers, waiver-upload, waiver-console)

#### Cloud Functions (2nd Gen)
- **submitWaiverSecure** (us-central1, Node.js 24)
  - Receives waiver data and PDF from frontend
  - Validates request (App Check made optional)
  - Uploads PDF to Storage at `waivers/pdfs/{docId}.pdf`
  - Writes waiver metadata to Firestore
  - Returns success confirmation
  - Warning logs for missing App Check tokens

#### Firestore Database
- **Collection:** `waivers`
- **Schema:**
  - Passenger info (firstName, lastName, town, email, phone)
  - Representative info (conditional)
  - Agreement flags (informedConsent1-5, waiver1-5)
  - Signatures (passengerSignature, witnessSignature, passengerTimestamp, witnessTimestamp)
  - Metadata (submittedAt, pdfFilePath, pdfStoragePath, pdfGeneratedAt)
  - Media release (mediaRelease: 'yes' | 'no')
  - Upload tracking (uploadedBy, uploadedById, uploadedAt, source) [paper waivers only]
- **Security Rules:** 
  - Public write via Cloud Function only
  - Authenticated read access for valid waiver verification apps

#### Firebase Storage
- **Path:** `waivers/pdfs/`
- **Security Rules:** Authenticated read access
- **Files:** PDF waivers with UUID filenames

#### Firebase Authentication
- **Provider:** Google Sign-In
- **Authorized Domains:**
  - passenger-waivers.web.app
  - valid-waivers.web.app
  - waiver-upload.web.app
  - waiver-console.web.app

### Completed Migration Phases

#### ✅ Phase 1: Project Setup & Infrastructure
- Firebase project created and configured
- Multi-site hosting configured
- Repository initialized (raydevwood-sudo/waivers)
- Development environment set up
- Dependencies installed (React 19, Vite 7, Tailwind CSS 3.4)

#### ✅ Phase 2: UI Components & Styling
- Complete component library built
- Tailwind CSS configured with custom theme
- Reusable form components (Input, Button, Radio, Checkbox, Loader)
- Signature canvas component with clear/undo functionality
- Modal components for PDF viewing
- Responsive layout with mobile support

#### ✅ Phase 3: Form Logic & State Management
- Multi-step form with 14 pages
- Form validation and error handling
- Progress indicator with step tracking
- Conditional fields based on waiver type
- Navigation between steps (Next/Previous)
- Form data persistence across steps

#### ✅ Phase 4: Firebase Backend Setup
- Cloud Functions deployed (Node.js 24, 2nd Gen)
- Firestore database configured
- Firebase Storage configured
- Security rules implemented (authenticated read, function write)
- App Check made optional (no ReCaptcha dependency)

#### ✅ Phase 5: PDF Generation
- Client-side PDF generation using jsPDF
- Dynamic template with all waiver text
- Signature embedding (Base64 PNG)
- Multi-page PDF support
- PDF metadata (creation date, title)
- Storage in Firebase Storage

#### ✅ Phase 6: Email Integration
- Status: **Deferred** (not required for MVP)
- PDFs accessible via Valid Waivers app instead

#### ✅ Phase 7: Integration & Data Flow
- Complete submission pipeline working
- Form → PDF → Cloud Function → Storage/Firestore
- Success confirmation page
- Error handling and user feedback

#### ✅ Phase 8: Testing & Deployment
- Local testing completed
- Production deployment successful
- End-to-end waiver submission verified
- Valid Waivers app viewing verified
- Security rules validated

### Additional Features Beyond Original Scope

#### Valid Waivers App
- **Scope:** Not in original roadmap
- **Delivered:** Full volunteer-facing viewer with search, filter, sorting, and PDF viewing
- **Value:** Enables staff to quickly find and verify valid waivers without direct database access

#### Paper Waiver Upload Tool
- **Scope:** Not in original roadmap  
- **Delivered:** Authenticated form for manual entry and PDF upload of paper waivers
- **Value:** Bridges gap between legacy paper waivers and digital system, enables complete waiver database

#### Waivers Admin Console
- **Scope:** Initially planned as MVP only
- **Delivered:** Full-featured admin console with Settings Manager and Template Manager
- **Value:** Complete control over system configuration, access control, and waiver template versioning

#### Branding & UX Polish
- Custom logo integration (Cycling Without Age Society)
- Alternating row colors for table readability
- Media release visual indicator
- Loading states and error messages
- Responsive design for mobile/tablet

### Technical Achievements

- **Modern Stack:** React 19 + Vite 7 + TypeScript 5.9 + Tailwind CSS 3.4
- **Serverless Architecture:** Firebase Cloud Functions (2nd Gen, Node.js 24)
- **Multi-site Hosting:** 4 independent applications on single Firebase project
- **Authentication:** Google Sign-In with authorized domain management
- **Security:** Granular Firestore/Storage rules, App Check optional, admin email authorization
- **Performance:** Client-side PDF generation, optimized bundle sizes
- **Code Quality:** ESLint with Google config, TypeScript strict mode, consistent formatting
- **Template Management:** Version-controlled waiver templates with draft/publish workflow

### Outstanding Tasks

1. ✅ **Passenger Waiver App** - Complete and operational
2. ✅ **Valid Waivers App** - Complete and operational
3. ✅ **Paper Waiver Upload** - Complete and operational
4. ✅ **Waivers Admin Console** - Complete and operational
5. ❌ **Email Integration** - Deferred (not required for MVP)
6. ❌ **Domain Custom URL** - Using Firebase subdomains (cyclingwithoutagesociety.org integration deferred)

### Next Steps

1. **Complete testing and validation** (developer + user testing)
2. **Migrate to organization Firebase project** (from cwas-testing)
3. **Perform data migration from Google Sheets to Firestore** (once confident)
4. **Train users on all 4 applications**
5. **Monitor production usage and costs**

---

## Testing & Production Readiness Plan

### Phase 1: Developer Testing (Current)

**Objective:** Verify all features work correctly in the test Firebase project (cwas-testing)

#### Testing Checklist

**Passenger Waiver App (passenger-waivers.web.app)**
- ✅ Load form and navigate through all 14 steps
- ✅ Test waiver type switching (passenger vs representative)
- ✅ Validate all form fields (required fields, patterns)
- ✅ Capture both passenger and witness signatures
- ✅ Submit complete waiver
- ✅ Verify PDF generation includes all data and signatures
- ✅ Confirm data saved to Firestore correctly
- ✅ Verify PDF stored in Firebase Storage
- ✅ Check expiry date is 1 year from submission
- ✅ Test on mobile devices (responsive design)
- ✅ Test error handling (network failures, validation errors)

**Valid Waivers App (valid-waivers.web.app)**
- ✅ Google Sign-In works
- ✅ Waiver list displays correctly with all columns
- ✅ Sorting works (Last Name, First Name, Expiry Date)
- ✅ Search by name works (first and last)
- ✅ Filter by validity status (valid/expired/all)
- ✅ Media release indicator displays correctly
- ✅ Click to view PDF modal opens
- ✅ PDF renders correctly in modal
- ✅ Access control enforcement (if restricted mode enabled)
- ✅ Test with multiple users and access levels

**Paper Waiver Upload (waiver-upload.web.app)**
- ✅ Google Sign-In works
- ✅ All form fields accept input correctly
- ✅ PDF file upload works (accept .pdf only)
- ✅ Waiver type selection works
- ✅ Form validation prevents invalid submissions
- ✅ Successful upload creates Firestore document
- ✅ Uploaded PDF stored in Firebase Storage
- ✅ uploadedBy and uploadedAt metadata saved correctly
- ✅ Source field set to "paper-upload"
- ✅ Form resets after successful submission
- ✅ Error handling for upload failures

**Waiver Console (waiver-console.web.app)**
- ✅ Google Sign-In works
- ✅ Admin authorization enforced (VITE_WAIVERS_ADMIN_EMAILS)
- ✅ Unauthorized users see "Access Denied" message
- ✅ Settings tab loads current settings
- ✅ Settings can be updated and saved
- ✅ Access control settings work (open vs restricted mode)
- ✅ Email/domain allowlists update correctly
- ✅ Template Manager tab loads templates
- ✅ Templates can be created and edited
- ✅ Version tracking works correctly
- ✅ Draft/publish workflow functions
- ✅ Settings changes reflect in Valid Waivers app immediately

**Cloud Functions**
- ✅ submitWaiverSecure function executes successfully
- ✅ Function logs show no errors
- ✅ Check function execution time and costs
- ✅ Verify proper error handling

### Phase 2: User Acceptance Testing (UAT)

**Objective:** Get real users to test all applications and provide feedback

#### UAT Participants
- **Volunteers:** Test Valid Waivers app for searching/viewing
- **Staff:** Test Paper Waiver Upload for data entry
- **Administrators:** Test Waiver Console for settings management
- **Public Users:** Test Passenger Waiver submission form

#### UAT Test Scenarios

**Scenario 1: New Passenger Submits Waiver**
1. Navigate to passenger-waivers.web.app
2. Complete entire waiver form
3. Provide digital signatures (passenger + witness)
4. Submit and verify success message
5. Staff verifies waiver appears in Valid Waivers app

**Scenario 2: Volunteer Searches for Valid Waiver**
1. Sign in to valid-waivers.web.app
2. Search for passenger by name
3. Verify expiry date shows waiver is valid
4. Open PDF to review waiver details
5. Confirm all information is accurate

**Scenario 3: Staff Uploads Paper Waiver**
1. Sign in to waiver-upload.web.app
2. Enter passenger information from paper form
3. Upload scanned PDF
4. Submit and verify success
5. Check that waiver appears in Valid Waivers app

**Scenario 4: Admin Updates Settings**
1. Sign in to waiver-console.web.app
2. Navigate to Settings tab
3. Update organization name or support email
4. Save changes
5. Verify changes persist on reload

**Scenario 5: Admin Manages Access Control**
1. Admin sets Valid Waivers to "restricted" mode
2. Adds authorized email addresses
3. Unauthorized user attempts to access Valid Waivers
4. Verify access is denied
5. Authorized user can access successfully

#### UAT Feedback Collection
- Create Google Form for feedback
- Track issues in GitHub Issues
- Document feature requests separately
- Prioritize critical bugs vs enhancements

### Phase 3: Firebase Project Migration

**Objective:** Move from test project (cwas-testing) to organization's production Firebase project

#### Prerequisites
- [ ] UAT completed with no critical bugs
- [ ] Organization Firebase project created
- [ ] Billing enabled on organization Firebase project (Blaze plan required)
- [ ] Access permissions granted to developers

#### Migration Steps

**Step 1: Create New Firebase Project**
```bash
# In Firebase Console:
# 1. Create new project (e.g., "cycling-without-age-prod")
# 2. Enable Firestore, Storage, Functions, Hosting, Authentication
# 3. Set up billing (Blaze plan)
# 4. Configure security rules
```

**Step 2: Export Firebase Configuration**
```bash
# From new project, get config values:
# - apiKey
# - authDomain
# - projectId
# - storageBucket
# - messagingSenderId
# - appId
```

**Step 3: Update Environment Variables**
```bash
# Update each app's .env.local file:

# waivers-app/.env.local
VITE_FIREBASE_API_KEY=<new-api-key>
VITE_FIREBASE_AUTH_DOMAIN=<new-auth-domain>
VITE_FIREBASE_PROJECT_ID=<new-project-id>
VITE_FIREBASE_STORAGE_BUCKET=<new-storage-bucket>
VITE_FIREBASE_MESSAGING_SENDER_ID=<new-sender-id>
VITE_FIREBASE_APP_ID=<new-app-id>

# Repeat for valid-waivers/.env.local
# Repeat for paper-waiver-upload/.env.local
# Repeat for waivers-admin/.env.local

# Update waivers-admin/.env.local admin emails:
VITE_WAIVERS_ADMIN_EMAILS=admin1@org.com,admin2@org.com

# Update functions/.env (if using environment variables):
SENDGRID_API_KEY=<if-using-email>
```

**Step 4: Create Firebase Hosting Sites**
```bash
# In Firebase Console > Hosting:
# 1. Add sites: passenger-waivers, valid-waivers, waiver-upload, waiver-console
# 2. OR use custom domains for your organization
```

**Step 5: Update Firebase Configuration**
```bash
# Update .firebaserc
firebase use --add
# Select new project
# Create alias: production

# Verify firebase.json has correct hosting sites
```

**Step 6: Deploy Cloud Functions**
```bash
cd functions
npm install
npm run build
firebase deploy --only functions --project production
```

**Step 7: Configure Firestore Security Rules**
```bash
# Deploy security rules
firebase deploy --only firestore:rules --project production
firebase deploy --only storage:rules --project production
```

**Step 8: Configure Firebase Authentication**
```bash
# In Firebase Console > Authentication:
# 1. Enable Google Sign-In provider
# 2. Add authorized domains:
#    - Your hosting URLs (*.web.app or custom domains)
#    - localhost (for development)
```

**Step 9: Build and Deploy All Apps**
```bash
# Build each app
cd waivers-app && npm run build && cd ..
cd valid-waivers && npm run build && cd ..
cd paper-waiver-upload && npm run build && cd ..
cd waivers-admin && npm run build && cd ..

# Deploy all hosting sites
firebase deploy --only hosting --project production
```

**Step 10: Verify Deployment**
- [ ] Test all 4 apps in production environment
- [ ] Verify authentication works
- [ ] Submit test waiver and verify end-to-end flow
- [ ] Check Cloud Functions logs for errors
- [ ] Monitor costs and usage

**Step 11: Update DNS (Optional)**
```bash
# If using custom domains:
# 1. Add custom domains in Firebase Console
# 2. Update DNS records (A, AAAA, TXT)
# 3. Wait for SSL certificate provisioning
# 4. Test custom URLs
```

#### Migration Rollback Plan
- Keep cwas-testing project active during transition
- Document any issues encountered
- Be prepared to revert DNS if using custom domains
- Have contact list for urgent issues

### Phase 4: Data Migration (Google Sheets → Firestore)

**Objective:** Migrate existing waiver data from Google Sheets to Firestore

#### Prerequisites
- [ ] Firebase project migration completed
- [ ] Apps tested and working in production
- [ ] Confidence in system stability
- [ ] Backup of Google Sheets data created

#### Data Migration Strategy

**Step 1: Analyze Google Sheets Structure**
```javascript
// Document current sheets columns and data:
// - Sheet ID: 1YtbfqG5ruxZikzMzogS6RFe0bxGJsWTUHh_c7rjGCz4
// - Identify all columns and data types
// - Map to Firestore schema
```

**Step 2: Create Migration Script**
```javascript
// functions/scripts/migrate-sheets-to-firestore.js

const admin = require('firebase-admin');
const { google } = require('googleapis');

// Initialize Firebase Admin
admin.initializeApp();
const db = admin.firestore();

// Google Sheets configuration
const SPREADSHEET_ID = '1YtbfqG5ruxZikzMzogS6RFe0bxGJsWTUHh_c7rjGCz4';
const SHEET_NAME = 'Waivers'; // Adjust to actual sheet name

async function migrateWaivers() {
  // 1. Authenticate with Google Sheets API
  const auth = await google.auth.getClient({
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  
  // 2. Read all rows from Google Sheets
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${SHEET_NAME}!A:Z`, // Adjust range as needed
  });
  
  const rows = response.data.values;
  const headers = rows[0]; // First row is headers
  const dataRows = rows.slice(1); // Rest are data
  
  console.log(`Found ${dataRows.length} rows to migrate`);
  
  // 3. Transform and upload to Firestore
  const batch = db.batch();
  let batchCount = 0;
  let totalCount = 0;
  
  for (const row of dataRows) {
    // Map row to Firestore document structure
    const waiverData = {
      // Personal Info
      waiverType: getColumnValue(row, headers, 'WaiverType'),
      firstName: getColumnValue(row, headers, 'FirstName'),
      lastName: getColumnValue(row, headers, 'LastName'),
      town: getColumnValue(row, headers, 'Town'),
      email: getColumnValue(row, headers, 'Email'),
      phone: getColumnValue(row, headers, 'Phone'),
      
      // Representative info (if applicable)
      representativeFirstName: getColumnValue(row, headers, 'RepFirstName'),
      representativeLastName: getColumnValue(row, headers, 'RepLastName'),
      representativeTown: getColumnValue(row, headers, 'RepTown'),
      representativeEmail: getColumnValue(row, headers, 'RepEmail'),
      representativePhone: getColumnValue(row, headers, 'RepPhone'),
      relationshipToPassenger: getColumnValue(row, headers, 'Relationship'),
      
      // Agreements
      informedConsent1: true,
      informedConsent2: true,
      informedConsent3: true,
      informedConsent4: true,
      informedConsent5: true,
      waiver1: true,
      waiver2: true,
      waiver3: true,
      waiver4: true,
      waiver5: true,
      
      // Media release
      mediaRelease: getColumnValue(row, headers, 'MediaRelease') || 'no',
      
      // Signatures
      passengerSignature: getColumnValue(row, headers, 'PassengerSignature'),
      passengerTimestamp: parseTimestamp(getColumnValue(row, headers, 'PassengerTimestamp')),
      witnessSignature: getColumnValue(row, headers, 'WitnessSignature'),
      witnessTimestamp: parseTimestamp(getColumnValue(row, headers, 'WitnessTimestamp')),
      
      // Metadata
      submittedAt: parseTimestamp(getColumnValue(row, headers, 'SubmittedAt')),
      expiresAt: calculateExpiry(parseTimestamp(getColumnValue(row, headers, 'SubmittedAt'))),
      pdfFilePath: getColumnValue(row, headers, 'PDFPath'),
      
      // Migration metadata
      migratedFrom: 'google-sheets',
      migratedAt: admin.firestore.FieldValue.serverTimestamp(),
      source: 'migration',
    };
    
    // Create document reference (use existing ID or generate new)
    const waiverId = getColumnValue(row, headers, 'WaiverID') || db.collection('waivers').doc().id;
    const docRef = db.collection('waivers').doc(waiverId);
    
    batch.set(docRef, waiverData);
    batchCount++;
    totalCount++;
    
    // Firestore batch limit is 500 operations
    if (batchCount >= 500) {
      await batch.commit();
      console.log(`Committed batch of ${batchCount} documents (total: ${totalCount})`);
      batchCount = 0;
    }
  }
  
  // Commit remaining documents
  if (batchCount > 0) {
    await batch.commit();
    console.log(`Committed final batch of ${batchCount} documents`);
  }
  
  console.log(`✅ Migration complete! Total documents: ${totalCount}`);
}

// Helper functions
function getColumnValue(row, headers, columnName) {
  const index = headers.indexOf(columnName);
  return index >= 0 ? row[index] : null;
}

function parseTimestamp(dateString) {
  if (!dateString) return null;
  const date = new Date(dateString);
  return admin.firestore.Timestamp.fromDate(date);
}

function calculateExpiry(submittedAt) {
  if (!submittedAt) return null;
  const date = submittedAt.toDate();
  date.setFullYear(date.getFullYear() + 1);
  return admin.firestore.Timestamp.fromDate(date);
}

// Run migration
migrateWaivers()
  .then(() => {
    console.log('Migration completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });
```

**Step 3: Migrate PDF Files from Google Drive**
```javascript
// functions/scripts/migrate-pdfs-from-drive.js

const admin = require('firebase-admin');
const { google } = require('googleapis');
const fetch = require('node-fetch');

async function migratePDFs() {
  // 1. Authenticate with Google Drive API
  const auth = await google.auth.getClient({
    scopes: ['https://www.googleapis.com/auth/drive.readonly'],
  });
  
  const drive = google.drive({ version: 'v3', auth });
  const bucket = admin.storage().bucket();
  
  // 2. List all files in Drive folder
  const FOLDER_ID = '1UhPmYPOJXdfaUy9JSQZ3J_QvYJkoh4BM';
  
  const response = await drive.files.list({
    q: `'${FOLDER_ID}' in parents and mimeType='application/pdf'`,
    fields: 'files(id, name)',
  });
  
  const files = response.data.files;
  console.log(`Found ${files.length} PDF files to migrate`);
  
  // 3. Download and upload each PDF
  for (const file of files) {
    try {
      // Download from Drive
      const driveResponse = await drive.files.get(
        { fileId: file.id, alt: 'media' },
        { responseType: 'arraybuffer' }
      );
      
      // Upload to Firebase Storage
      const storageFile = bucket.file(`waivers/pdfs/${file.name}`);
      await storageFile.save(Buffer.from(driveResponse.data), {
        metadata: {
          contentType: 'application/pdf',
          metadata: {
            migratedFrom: 'google-drive',
            originalFileId: file.id,
          },
        },
      });
      
      console.log(`✅ Migrated: ${file.name}`);
    } catch (error) {
      console.error(`❌ Failed to migrate ${file.name}:`, error.message);
    }
  }
  
  console.log('PDF migration complete!');
}

// Run migration
migratePDFs()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('PDF migration failed:', error);
    process.exit(1);
  });
```

**Step 4: Execute Migration**
```bash
# Install required packages
cd functions
npm install googleapis node-fetch

# Set up Google Sheets/Drive API credentials
# Download service account JSON from Google Cloud Console
export GOOGLE_APPLICATION_CREDENTIALS="path/to/service-account-key.json"

# Run data migration
node scripts/migrate-sheets-to-firestore.js

# Run PDF migration
node scripts/migrate-pdfs-from-drive.js
```

**Step 5: Validate Migration**
```javascript
// functions/scripts/validate-migration.js

const admin = require('firebase-admin');
const { google } = require('googleapis');

async function validateMigration() {
  admin.initializeApp();
  const db = admin.firestore();
  
  // Get counts from both sources
  const sheetsCount = await getGoogleSheetsRowCount();
  const firestoreSnapshot = await db.collection('waivers').get();
  const firestoreCount = firestoreSnapshot.size;
  
  console.log(`Google Sheets rows: ${sheetsCount}`);
  console.log(`Firestore documents: ${firestoreCount}`);
  
  if (sheetsCount === firestoreCount) {
    console.log('✅ Record counts match!');
  } else {
    console.log('⚠️  Record counts do not match!');
  }
  
  // Spot check random documents
  const randomDocs = firestoreSnapshot.docs
    .sort(() => 0.5 - Math.random())
    .slice(0, 10);
  
  console.log('\nSpot checking 10 random documents...');
  for (const doc of randomDocs) {
    const data = doc.data();
    console.log(`- ${data.firstName} ${data.lastName}: ${data.email}`);
  }
}

async function getGoogleSheetsRowCount() {
  // Implementation to count rows in Google Sheets
  // ... (similar to migration script)
}

validateMigration()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Validation failed:', error);
    process.exit(1);
  });
```

**Step 6: Post-Migration Verification**
- [ ] Verify total record count matches
- [ ] Spot check 20+ records for data accuracy
- [ ] Verify all PDFs are accessible
- [ ] Test Valid Waivers app with migrated data
- [ ] Verify search and filter functionality works
- [ ] Check expiry dates are calculated correctly
- [ ] Confirm no data loss or corruption

**Step 7: Cutover Plan**
1. **Communicate cutover window** (e.g., "Saturday 2-4 PM")
2. **Pause Google Sheets writes** (make sheet read-only)
3. **Run final incremental migration** (catch any last-minute entries)
4. **Point users to new system** (update links, send announcements)
5. **Keep Google Sheets as read-only backup** (don't delete for 90 days)
6. **Monitor new system closely** (first 48 hours critical)

#### Data Migration Rollback Plan
- Keep Google Sheets and Drive as backup for 90 days
- Document process to export from Firestore back to Sheets if needed
- Have plan to restore previous Firebase configuration
- Communicate rollback procedure to stakeholders

### Phase 5: Testing Documentation

#### Test Case Templates

**Test Case Template:**
```markdown
## Test Case: [Feature Name]

**ID:** TC-[Number]
**Priority:** High/Medium/Low
**Component:** [App Name]

**Preconditions:**
- List any setup required

**Test Steps:**
1. Step 1
2. Step 2
3. Step 3

**Expected Results:**
- Expected outcome 1
- Expected outcome 2

**Actual Results:**
- [To be filled during testing]

**Status:** Pass/Fail/Blocked

**Notes:**
- Any additional observations
```

#### UAT Feedback Form

Create a Google Form with these questions:

1. Which app did you test? (dropdown)
2. What task were you trying to complete? (text)
3. Were you able to complete the task? (yes/no)
4. If no, what prevented you? (text)
5. Rate the ease of use (1-5 scale)
6. Rate the interface design (1-5 scale)
7. Did you encounter any errors? (yes/no)
8. If yes, please describe the error (text)
9. What did you like most? (text)
10. What needs improvement? (text)
11. Any additional feedback? (text)

#### Bug Report Template

```markdown
## Bug Report

**Summary:** [Brief description]

**Severity:** Critical/High/Medium/Low

**Environment:**
- App: [Which of the 4 apps]
- Browser: [Chrome/Firefox/Safari/etc.]
- OS: [Windows/Mac/iOS/Android]
- URL: [Specific URL where bug occurred]

**Steps to Reproduce:**
1. Step 1
2. Step 2
3. Step 3

**Expected Behavior:**
[What should happen]

**Actual Behavior:**
[What actually happens]

**Screenshots:**
[Attach screenshots if available]

**Console Errors:**
[Any errors from browser console]

**Additional Context:**
[Any other relevant information]
```

### Success Criteria

**Testing Phase Complete When:**
- [ ] All test cases pass
- [ ] Zero critical bugs
- [ ] All high-priority bugs resolved
- [ ] UAT participants approve
- [ ] Performance meets requirements (< 3 second page loads)
- [ ] Mobile testing complete

**Firebase Migration Complete When:**
- [ ] All 4 apps deployed to organization Firebase
- [ ] All functionality working in production
- [ ] Authentication configured and tested
- [ ] Security rules validated
- [ ] Monitoring and alerts set up

**Data Migration Complete When:**
- [ ] All historical data migrated to Firestore
- [ ] All PDFs migrated to Firebase Storage
- [ ] Data validation confirms accuracy
- [ ] Valid Waivers app shows all records
- [ ] No critical issues for 48 hours post-migration
- [ ] Google Sheets decommissioned (after 90-day backup period)

---

### Repository Information

- **Repository:** https://github.com/raydevwood-sudo/waivers
- **Branch:** main
- **Latest Commit:** 351264c - "Add paper waiver upload app for manual entry of scanned waivers"
- **Previous Commit:** a47101b - "Rebrand to Valid Waivers with logo and remove sign-out button"

---

## Table of Contents

1. [Current System Analysis](#1-current-system-analysis)
2. [Architecture Overview](#2-architecture-overview)
3. [Technology Stack](#3-technology-stack)
4. [Migration Phases](#4-migration-phases)
5. [Testing & Production Readiness Plan](#testing--production-readiness-plan)
6. [Database Schema](#5-database-schema)
7. [Component Structure](#6-component-structure)
8. [Firebase Functions](#7-firebase-functions)
9. [PDF Generation Strategy](#8-pdf-generation-strategy)
10. [Email Service Integration](#9-email-service-integration)
11. [Deployment Strategy](#10-deployment-strategy)
11. [Environment Configuration](#11-environment-configuration)
12. [Testing Strategy](#12-testing-strategy)
13. [Timeline Estimate](#13-timeline-estimate)
14. [Cost Considerations](#14-cost-considerations)
15. [Risk Assessment](#15-risk-assessment)

---

## 1. Current System Analysis

### 1.1 Features Inventory

#### Core Features
- ✅ Multi-step form (9 pages) with progress indicator
- ✅ Two waiver types: Individual vs Legal Representative
- ✅ Digital signature capture (passenger + witness)
- ✅ Form validation with pattern matching
- ✅ Media release consent options
- ✅ PDF waiver generation from template
- ✅ Email delivery to participant
- ✅ Data storage in spreadsheet
- ✅ Success page with confirmation

#### Current Data Flow
```
1. User fills out form → 
2. Captures signatures → 
3. Submits to Apps Script → 
4. Creates Google Doc from template → 
5. Replaces placeholders with form data → 
6. Converts Doc to PDF → 
7. Saves PDF to Drive → 
8. Writes row to Google Sheets → 
9. Emails PDF to participant →
10. Shows success page
```

### 1.2 Current Files Analysis

#### **code.gs** (Backend - 179 lines)
**Functions:**
- `doGet(e)` - Serves the web app
- `submitAgreement(formData)` - Main submission handler
- `createPassengerWaiver(data, templateId, folderId)` - PDF generation
- `emailPassengerWaiver(data)` - Email sender
- `replaceTextWithImage(image, searchText, textBody)` - Template image replacement
- `getIdFromUrl(url)` - Utility function
- `include(fileName)` - Template include system

**Key Data Points:**
- Sheet ID: `1YtbfqG5ruxZikzMzogS6RFe0bxGJsWTUHh_c7rjGCz4`
- Template Doc ID: `14kW_hfmYPzPQely7bW-YTrRjiGoEaTcBl_EI0iXIlTo`
- Folder ID: `1UhPmYPOJXdfaUy9JSQZ3J_QvYJkoh4BM`
- Timezone: `America/Vancouver`
- Waiver ID Format: `PAS-<UUID>`
- Expiry: 1 year from creation

#### **index.html** (Structure - 148 lines)
**Components:**
- Signature modal dialog
- Preloader/loading overlay
- Multi-step form with 9 pages
- Success page
- Header with logo
- Footer with attribution

#### **JavaScript.html** (Logic - 548 lines)
**Key Functions:**
- Signature pad management (show/save/clear)
- Multi-step form navigation
- Form validation
- Waiver type switching
- Canvas drawing and resizing
- Form submission with `google.script.run`

**Global State:**
- `currentTab` - Current form page
- `passengerSignature` - Base64 signature image
- `passengerTimestamp` - Signature timestamp
- `witnessSignature` - Base64 signature image
- `witnessTimestamp` - Signature timestamp
- `signee` - Current signee (passenger/witness)

#### **Styles.html** (Styling - 454 lines)
**Design System:**
- Material Design-inspired inputs with floating labels
- Custom color scheme (primary: `#00d1a2`)
- Responsive flexbox layout
- Modal styles
- Button variants (filled, outlined, content)
- Form step indicators
- Signature block styling

---

## 2. Architecture Overview

### 2.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Firebase Hosting                         │
│                  (React SPA + Static Assets)                 │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      │ HTTPS
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                   Firebase Services                          │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  Firestore   │  │   Storage    │  │  Functions   │     │
│  │  (Database)  │  │  (PDF Files) │  │  (Backend)   │     │
│  └──────────────┘  └──────────────┘  └──────┬───────┘     │
│                                              │              │
└──────────────────────────────────────────────┼──────────────┘
                                               │
                    ┌──────────────────────────┴────────────┐
                    │                                       │
              ┌─────▼──────┐                       ┌───────▼────────┐
              │  Email API  │                       │  PDF Library   │
              │ (SendGrid)  │                       │   (PDFKit)     │
              └────────────┘                       └────────────────┘
```

### 2.2 Frontend Architecture

```
src/
├── main.jsx                    # App entry point
├── App.jsx                     # Root component with routing
├── components/
│   ├── layout/
│   │   ├── Header.jsx          # App header with logo
│   │   ├── Footer.jsx          # App footer
│   │   └── Layout.jsx          # Main layout wrapper
│   ├── form/
│   │   ├── WaiverForm.jsx      # Main form container
│   │   ├── FormProgress.jsx    # Step indicator dots
│   │   ├── FormNavigation.jsx  # Prev/Next buttons
│   │   └── pages/
│   │       ├── WaiverTypePage.jsx       # Page 1
│   │       ├── PersonalInfoPage.jsx     # Page 2
│   │       ├── WaiverPage1.jsx          # Page 3
│   │       ├── WaiverPage2.jsx          # Page 4
│   │       ├── WaiverPage3.jsx          # Page 5
│   │       ├── WaiverPage4.jsx          # Page 6
│   │       ├── WaiverPage5.jsx          # Page 7
│   │       ├── MediaReleasePage.jsx     # Page 8
│   │       └── SignaturePage.jsx        # Page 9
│   ├── signature/
│   │   ├── SignatureModal.jsx  # Signature capture modal
│   │   └── SignatureCanvas.jsx # Canvas wrapper component
│   ├── ui/
│   │   ├── Button.jsx          # Reusable button component
│   │   ├── Input.jsx           # Material Design input
│   │   ├── Checkbox.jsx        # Styled checkbox
│   │   ├── Radio.jsx           # Styled radio button
│   │   ├── Loader.jsx          # Loading spinner
│   │   └── Modal.jsx           # Generic modal
│   └── SuccessPage.jsx         # Submission success screen
├── hooks/
│   ├── useFormState.js         # Form state management
│   ├── useSignature.js         # Signature state logic
│   └── useFormValidation.js    # Validation logic
├── services/
│   ├── firebase.js             # Firebase initialization
│   ├── firestore.js            # Firestore operations
│   ├── storage.js              # Storage operations
│   └── api.js                  # API calls to Functions
├── utils/
│   ├── validation.js           # Validation helpers
│   └── formatters.js           # Date/data formatters
└── styles/
    └── index.css               # Tailwind + custom styles
```

### 2.3 Backend Architecture (Firebase Functions)

```
functions/
├── src/
│   ├── index.js                     # Functions export
│   ├── handlers/
│   │   ├── submitWaiver.js          # Main submission handler
│   │   ├── generatePDF.js           # PDF generation
│   │   └── sendEmail.js             # Email sending
│   ├── services/
│   │   ├── firestore.js             # Firestore operations
│   │   ├── storage.js               # Storage operations
│   │   ├── pdf/
│   │   │   ├── generator.js         # PDF creation logic
│   │   │   └── template.js          # PDF template definition
│   │   └── email/
│   │       ├── sender.js            # Email sending logic
│   │       └── templates.js         # Email templates
│   ├── utils/
│   │   ├── validation.js            # Server-side validation
│   │   ├── uuid.js                  # UUID generation
│   │   └── formatters.js            # Date/data formatters
│   └── config/
│       └── constants.js             # Configuration constants
├── package.json
└── .env                             # Environment variables
```

---

## 3. Technology Stack

### 3.1 Frontend Dependencies

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "firebase": "^10.7.1",
    "signature_pad": "^4.1.7",
    "react-hook-form": "^7.49.2",
    "zod": "^3.22.4",
    "@hookform/resolvers": "^3.3.3",
    "date-fns": "^2.30.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.1",
    "vite": "^5.0.8",
    "tailwindcss": "^3.4.0",
    "postcss": "^8.4.32",
    "autoprefixer": "^10.4.16",
    "eslint": "^8.56.0",
    "prettier": "^3.1.1"
  }
}
```

### 3.2 Backend Dependencies (Firebase Functions)

```json
{
  "dependencies": {
    "firebase-functions": "^4.5.0",
    "firebase-admin": "^12.0.0",
    "pdfkit": "^0.14.0",
    "@sendgrid/mail": "^8.1.0",
    "uuid": "^9.0.1",
    "date-fns": "^2.30.0",
    "date-fns-tz": "^2.0.0",
    "zod": "^3.22.4"
  },
  "devDependencies": {
    "firebase-functions-test": "^3.1.0",
    "eslint": "^8.56.0"
  }
}
```

### 3.3 Build Tools

- **Vite:** Fast development server and optimized production builds
- **PostCSS:** CSS transformation and Tailwind processing
- **ESLint:** Code linting
- **Prettier:** Code formatting

---

## 4. Migration Phases

### Phase 1: Project Setup & Infrastructure (2-3 days)

#### Tasks:
1. **Initialize Firebase Project**
   - Create new Firebase project in console
   - Enable Firestore, Storage, Functions, Hosting
   - Configure security rules
   - Set up billing (Blaze plan for Functions)

2. **Initialize React + Vite Project**
   ```bash
   npm create vite@latest waivers-app -- --template react
   cd waivers-app
   npm install
   ```

3. **Install & Configure Tailwind CSS**
   ```bash
   npm install -D tailwindcss postcss autoprefixer
   npx tailwindcss init -p
   ```

4. **Install Firebase & Dependencies**
   ```bash
   npm install firebase signature_pad react-hook-form zod @hookform/resolvers date-fns
   ```

5. **Set Up Firebase CLI**
   ```bash
   npm install -g firebase-tools
   firebase login
   firebase init
   ```

6. **Configure Project Structure**
   - Create folder structure as outlined in Architecture
   - Set up Git repository
   - Configure `.gitignore`
   - Create `.env` files for environment variables

#### Deliverables:
- ✅ Firebase project created and configured
- ✅ React + Vite project initialized
- ✅ Tailwind CSS configured
- ✅ Project structure established
- ✅ Git repository initialized

---

### Phase 2: UI Components & Styling (4-5 days)

#### Tasks:
1. **Create Base Layout Components**
   - Header with logo
   - Footer with attribution
   - Main layout wrapper
   - Banner component

2. **Build UI Component Library**
   - Material Design-inspired Input component
   - Button component (3 variants: filled, outlined, content)
   - Checkbox component
   - Radio button component
   - Modal component
   - Loader/Spinner component

3. **Implement Tailwind Custom Theme**
   ```javascript
   // tailwind.config.js
   module.exports = {
     theme: {
       extend: {
         colors: {
           primary: '#00d1a2',
           'primary-hover': '#00b890',
         }
       }
     }
   }
   ```

4. **Create Signature Components**
   - SignatureModal component
   - SignatureCanvas wrapper for signature_pad library
   - Signature preview/display component

5. **Responsive Design**
   - Mobile-first approach
   - Breakpoints for tablet and desktop
   - Touch-friendly interface

#### Deliverables:
- ✅ Complete UI component library
- ✅ Signature capture functionality
- ✅ Responsive layout system
- ✅ Tailwind theme matching current design

---

### Phase 3: Form Logic & State Management (5-6 days)

#### Tasks:
1. **Set Up Form State Management**
   - Create custom hook `useFormState` for multi-step form
   - Implement form data persistence in state
   - Add page navigation logic

2. **Implement Form Pages (9 pages)**
   - Page 1: Waiver type selection
   - Page 2: Personal information (with conditional representative fields)
   - Pages 3-7: Waiver agreement checkboxes
   - Page 8: Media release consent
   - Page 9: Signature capture

3. **Form Validation**
   - Install and configure react-hook-form
   - Create Zod validation schemas
   - Implement per-field validation
   - Add error messages and styling
   - Implement page-level validation

4. **Waiver Type Switching**
   - Conditional rendering based on passenger vs representative
   - Dynamic required fields
   - Form data structure adjustments

5. **Form Progress Indicator**
   - Step dots component
   - Active/completed state styling
   - Sync with current page

6. **Form Submission Flow**
   - Collect all form data
   - Format for API submission
   - Handle loading states
   - Handle success/error states

#### Deliverables:
- ✅ Complete multi-step form with navigation
- ✅ Form validation with error handling
- ✅ Waiver type conditional logic
- ✅ Progress indicator
- ✅ Ready for API integration

---

### Phase 4: Firebase Backend Setup (4-5 days)

#### Tasks:
1. **Initialize Firebase Functions**
   ```bash
   firebase init functions
   cd functions
   npm install
   ```

2. **Set Up Firestore Database**
   - Design collections schema
   - Create security rules
   - Set up indexes
   - Deploy initial rules

3. **Set Up Firebase Storage**
   - Configure storage buckets
   - Create security rules for PDF storage
   - Set up CORS configuration

4. **Create Cloud Functions**
   - `submitWaiver` - Main HTTP endpoint
   - `generatePDF` - PDF generation function
   - `sendEmail` - Email sending function

5. **Environment Configuration**
   - Set up Function environment variables
   - Configure SendGrid/Mailgun API keys
   - Set timezone configuration
   - Configure PDF template settings

6. **Error Handling & Logging**
   - Implement error handling middleware
   - Set up Cloud Logging
   - Add request validation
   - Add response formatting

#### Deliverables:
- ✅ Firestore database with collections
- ✅ Storage buckets configured
- ✅ Cloud Functions deployed
- ✅ Environment variables configured
- ✅ Error handling implemented

---

### Phase 5: PDF Generation (4-5 days)

#### Tasks:
1. **Choose PDF Library**
   - **Option A:** PDFKit (programmatic, more control)
   - **Option B:** Puppeteer (HTML to PDF, easier templates)
   - **Recommendation:** PDFKit for better performance in Functions

2. **Design PDF Template**
   - Recreate Google Doc template design
   - Layout sections (header, body, signatures, footer)
   - Typography and styling
   - Logo and branding elements

3. **Implement PDF Generation**
   - Create PDF builder function
   - Implement text replacement
   - Embed signature images (base64 → PNG)
   - Add waiver ID, dates, expiry
   - Format paragraphs and agreements

4. **PDF Storage**
   - Generate unique filename
   - Upload to Firebase Storage
   - Create signed/public URL
  - Set metadata (creation date, participant name, etc.)

5. **Testing**
   - Test all field combinations
   - Test signature image embedding
   - Test different form data scenarios
   - Verify PDF accessibility and quality

#### Deliverables:
- ✅ PDF generation function
- ✅ PDF template matching original design
- ✅ Signature image embedding
- ✅ Storage integration
- ✅ Comprehensive testing

---

### Phase 6: Email Integration (2-3 days)

#### Tasks:
1. **Choose Email Service**
   - **Option A:** SendGrid (recommended, generous free tier)
   - **Option B:** Mailgun
   - **Option C:** Firebase Extension for email
   - **Recommendation:** SendGrid

2. **Set Up Email Service**
   - Create SendGrid account
   - Verify sender domain/email
   - Create API key
   - Add to Function environment variables

3. **Create Email Templates**
   - HTML email template
   - Plain text fallback
  - Include participant name
   - Add waiver details
   - Professional styling

4. **Implement Email Function**
   - Create email sending function
   - Attach PDF from Storage
   - Handle errors and retries
   - Log email sends

5. **Testing**
   - Test email delivery
   - Test PDF attachment
   - Test different email providers
   - Verify spam score

#### Deliverables:
- ✅ Email service configured
- ✅ Email templates created
- ✅ Email function implemented
- ✅ Successful test deliveries

---

### Phase 7: Integration & Data Flow (3-4 days)

#### Tasks:
1. **Connect Frontend to Backend**
   - Configure Firebase SDK in React app
   - Create API service layer
   - Implement HTTP calls to Functions
   - Add request/response handling

2. **Implement Complete Submission Flow**
   ```
   1. User submits form →
   2. Frontend validates data →
   3. Frontend calls submitWaiver Function →
   4. Function validates data →
   5. Function saves to Firestore →
   6. Function generates PDF →
   7. Function uploads PDF to Storage →
   8. Function sends email →
   9. Function returns success →
   10. Frontend shows success page
   ```

3. **Loading States**
   - Show loader during submission
   - Add progress messages
   - Handle timeout scenarios

4. **Error Handling**
   - Network errors
   - Validation errors
   - Server errors
   - User-friendly error messages
  - If submission fails, show a **Send Support Email** button with prefilled context (waiver type, timestamp, and error summary)

5. **Success Page**
   - Display confirmation message
   - Show submitted details
   - Option to submit another waiver
   - Option to download PDF (optional)

#### Deliverables:
- ✅ Complete data flow working
- ✅ Frontend-backend integration
- ✅ Error handling
- ✅ Success confirmation

---

### Phase 8: Testing & QA (3-4 days)

#### Tasks:
1. **Unit Testing**
   - Test utility functions
   - Test validation logic
   - Test PDF generation functions
   - Test email functions

2. **Integration Testing**
   - Test complete submission flow
   - Test with various form data
   - Test error scenarios
   - Test edge cases

3. **UI/UX Testing**
   - Cross-browser testing (Chrome, Firefox, Safari, Edge)
   - Mobile device testing (iOS, Android)
   - Tablet testing
   - Accessibility testing (WCAG compliance)
   - Keyboard navigation
   - Screen reader compatibility

4. **Performance Testing**
   - Measure form load time
   - Measure submission time
   - Test with slow networks
   - Optimize bundle size
   - Optimize Function cold starts

5. **Security Testing**
   - Review security rules
   - Test input sanitization
   - Test SQL injection (N/A for Firestore but check)
   - Test XSS vulnerabilities
   - Review CORS configuration

#### Deliverables:
- ✅ Test suite implemented
- ✅ All tests passing
- ✅ Cross-browser compatibility verified
- ✅ Performance optimized
- ✅ Security validated

---

### Phase 9: Deployment & Documentation (2-3 days)

#### Tasks:
1. **Production Configuration**
   - Set up production environment variables
   - Configure production Firebase project
   - Set up custom domain (if applicable)
   - Configure SSL certificate

2. **Deploy to Firebase**
   ```bash
   # Build frontend
   npm run build
   
   # Deploy Functions
   firebase deploy --only functions
   
   # Deploy Firestore rules
   firebase deploy --only firestore:rules
   
   # Deploy Storage rules
   firebase deploy --only storage
   
   # Deploy Hosting
   firebase deploy --only hosting
   ```

3. **DNS Configuration**
   - Point custom domain to Firebase Hosting
   - Configure DNS records
   - Verify SSL certificate

4. **Monitoring Setup**
   - Enable Firebase Analytics
   - Set up Cloud Monitoring
   - Configure alerts for errors
   - Set up uptime monitoring

5. **Documentation**
   - User guide (for staff)
   - Admin guide (for data management)
   - Developer documentation
   - API documentation
   - Deployment procedures
   - Troubleshooting guide

6. **Training**
   - Train staff on new system
   - Demonstrate admin features
   - Provide support materials

#### Deliverables:
- ✅ Production deployment complete
- ✅ Custom domain configured
- ✅ Monitoring enabled
- ✅ Documentation complete
- ✅ Staff trained

---

### Phase 10: Data Migration & Cutover (2-3 days)

#### Tasks:
1. **Export Existing Data**
   - Export Google Sheets data to CSV
   - Export PDFs from Google Drive
   - Document data structure

2. **Data Transformation**
   - Write migration script
   - Transform data to Firestore format
   - Validate data integrity

3. **Import to Firestore**
   - Batch import data
   - Verify all records imported
   - Check for errors

4. **Migrate PDF Files**
   - Upload PDFs to Firebase Storage
   - Update Firestore references
   - Verify file accessibility

5. **Parallel Testing**
   - Run old and new systems in parallel
   - Compare results
   - Verify data consistency

6. **Cutover**
   - Schedule maintenance window
   - Final data sync
   - Switch over to new system
   - Update documentation and links
   - Decommission old Apps Script app

#### Deliverables:
- ✅ Historical data migrated
- ✅ PDF files migrated
- ✅ Systems validated
- ✅ Cutover complete
- ✅ Old system decommissioned

---

## 5. Database Schema

### 5.1 Firestore Collections

#### **Collection: `waivers`**
Document ID: Auto-generated (Firestore)

```javascript
{
  // Metadata
  waiverUId: "PAS-{uuid}",             // String, unique waiver ID
  createdAt: Timestamp,                 // Firestore Timestamp
  expiryDate: Timestamp,                // Firestore Timestamp (createdAt + 1 year)
  
  // Waiver Type
  waiverType: "passenger",              // String: "passenger" | "representative"
  
  // Passenger Information
  passenger: {
    firstName: "John",                  // String
    lastName: "Doe",                    // String
    town: "Vancouver",                  // String
  },
  
  // Representative Information (optional, only if waiverType === "representative")
  representative: {
    firstName: "Jane",                  // String
    lastName: "Doe",                    // String
  },
  
  // Contact Information
  contact: {
    email: "john@example.com",          // String
    phone: "6041234567",                // String (10 digits)
  },
  
  // Waiver Agreements
  agreements: {
    waiver1: true,                      // Boolean
    waiver2: true,                      // Boolean
    waiver3: true,                      // Boolean
    waiver4: true,                      // Boolean
    waiver5: true,                      // Boolean
  },
  
  // Media Release
  mediaRelease: "I consent...",         // String: full consent text
  
  // Signatures
  signatures: {
    passenger: {
      imageUrl: "gs://bucket/...",      // String: Storage URL
      timestamp: Timestamp,             // Firestore Timestamp
    },
    witness: {
      name: "Witness Name",             // String
      imageUrl: "gs://bucket/...",      // String: Storage URL
      timestamp: Timestamp,             // Firestore Timestamp
    }
  },
  
  // Generated PDF
  pdf: {
    fileName: "Passenger_Waiver_John_Doe_2026-02-16.pdf",  // String
    storageUrl: "gs://bucket/...",      // String: Storage URL
    publicUrl: "https://...",           // String: Public download URL
    generatedAt: Timestamp,             // Firestore Timestamp
  },
  
  // Email Status
  email: {
    sent: true,                         // Boolean
    sentAt: Timestamp,                  // Firestore Timestamp
    recipient: "john@example.com",      // String
    error: null,                        // String | null
  },
  
  // Status
  status: "completed",                  // String: "pending" | "completed" | "failed"
}
```

#### **Collection: `settings`** (optional, for configuration)
Document ID: `app_config`

```javascript
{
  timezone: "America/Vancouver",
  waiverExpiryDays: 365,
  emailFrom: "waivers@cyclingwithoutagesociety.org",
  emailFromName: "Cycling Without Age Society",
  pdfTemplateVersion: "2.0",
  lastUpdated: Timestamp,
}
```

### 5.2 Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Waivers collection - public write (with validation), admin read
    match /waivers/{waiverId} {
      // Allow anyone to create a new waiver
      allow create: if request.resource.data.keys().hasAll([
        'waiverUId', 'createdAt', 'passenger', 'contact'
      ]) && request.resource.data.waiverType in ['passenger', 'representative'];
      
      // Only authenticated admins can read/update/delete
      allow read, update, delete: if request.auth != null && 
        request.auth.token.admin == true;
    }
    
    // Settings collection - admin only
    match /settings/{settingId} {
      allow read, write: if request.auth != null && 
        request.auth.token.admin == true;
    }
  }
}
```

### 5.3 Firebase Storage Structure

```
waivers/
├── pdfs/
│   ├── 2026/
│   │   ├── 02/
│   │   │   ├── PAS-uuid1.pdf
│   │   │   ├── PAS-uuid2.pdf
│   │   │   └── ...
│   │   └── 03/
│   │       └── ...
│   └── ...
└── signatures/
    ├── passenger/
    │   ├── PAS-uuid1.png
    │   ├── PAS-uuid2.png
    │   └── ...
    └── witness/
        ├── PAS-uuid1.png
        ├── PAS-uuid2.png
        └── ...
```

### 5.4 Storage Security Rules

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    
    // PDFs - public read, function write only
    match /waivers/pdfs/{year}/{month}/{fileName} {
      allow read: if request.auth != null || 
        request.auth == null; // Public access with signed URL
      allow write: if false; // Only server can write
    }
    
    // Signatures - function write only
    match /waivers/signatures/{type}/{fileName} {
      allow read: if request.auth != null && 
        request.auth.token.admin == true;
      allow write: if false; // Only server can write
    }
  }
}
```

---

## 6. Component Structure

### 6.1 Key Components Detail

#### **WaiverForm.jsx**
Main form container managing multi-step state.

```jsx
import { useState } from 'react';
import { useFormState } from '../hooks/useFormState';
import FormProgress from './FormProgress';
import FormNavigation from './FormNavigation';
import WaiverTypePage from './pages/WaiverTypePage';
// ... import other pages

const WaiverForm = () => {
  const {
    currentPage,
    formData,
    updateFormData,
    nextPage,
    prevPage,
    submitForm,
    isSubmitting,
  } = useFormState();

  const pages = [
    <WaiverTypePage key="page-0" data={formData} update={updateFormData} />,
    <PersonalInfoPage key="page-1" data={formData} update={updateFormData} />,
    // ... other pages
  ];

  return (
    <div className="form-container">
      <FormProgress currentPage={currentPage} totalPages={pages.length} />
      {pages[currentPage]}
      <FormNavigation 
        currentPage={currentPage}
        totalPages={pages.length}
        onPrev={prevPage}
        onNext={nextPage}
        onSubmit={submitForm}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default WaiverForm;
```

#### **SignatureModal.jsx**
Modal for capturing signatures.

```jsx
import { useRef, useEffect } from 'react';
import SignaturePad from 'signature_pad';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

const SignatureModal = ({ isOpen, onClose, onSave, signeeType }) => {
  const canvasRef = useRef(null);
  const signaturePadRef = useRef(null);

  useEffect(() => {
    if (isOpen && canvasRef.current) {
      signaturePadRef.current = new SignaturePad(canvasRef.current);
      resizeCanvas();
    }
  }, [isOpen]);

  const resizeCanvas = () => {
    const canvas = canvasRef.current;
    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    canvas.width = canvas.offsetWidth * ratio;
    canvas.height = canvas.offsetHeight * ratio;
    canvas.getContext('2d').scale(ratio, ratio);
  };

  const handleSave = () => {
    if (signaturePadRef.current.isEmpty()) {
      alert('Please sign before saving.');
      return;
    }
    const dataURL = signaturePadRef.current.toDataURL();
    onSave(dataURL);
    onClose();
  };

  const handleClear = () => {
    signaturePadRef.current.clear();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2 className="text-xl font-semibold mb-4">
        {signeeType === 'passenger' ? 'Passenger' : 'Witness'} Signature
      </h2>
      <canvas 
        ref={canvasRef}
        className="w-full aspect-[2/1] bg-blue-50 rounded-lg"
      />
      <div className="flex gap-4 mt-4">
        <Button variant="filled" onClick={handleSave}>
          Save {signeeType} signature
        </Button>
        <Button variant="content" onClick={handleClear}>
          Clear
        </Button>
      </div>
    </Modal>
  );
};

export default SignatureModal;
```

#### **Input.jsx**
Material Design-inspired input component.

```jsx
import { forwardRef } from 'react';
import classNames from 'classnames';

const Input = forwardRef(({ 
  label, 
  error, 
  className,
  ...props 
}, ref) => {
  const inputClasses = classNames(
    'w-full h-12 px-4 text-lg border rounded-lg',
    'focus:outline-none focus:border-primary focus:bg-primary-50',
    'hover:border-primary hover:bg-primary-50',
    {
      'border-red-500 bg-red-50': error,
      'border-gray-300': !error,
    },
    className
  );

  const labelClasses = classNames(
    'absolute -top-2 left-3 px-1 text-xs bg-white rounded',
    'transition-all pointer-events-none',
    {
      'text-red-500': error,
      'text-gray-500': !error,
    }
  );

  return (
    <div className="relative">
      <input
        ref={ref}
        className={inputClasses}
        placeholder={label}
        {...props}
      />
      <label className={labelClasses}>
        {label}
      </label>
      {error && (
        <p className="text-red-500 text-sm mt-1">{error.message}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
```

---

## 7. Firebase Functions

### 7.1 Main Function: `submitWaiver`

**File:** `functions/src/handlers/submitWaiver.js`

```javascript
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { z } = require('zod');
const { v4: uuidv4 } = require('uuid');
const { generatePDF } = require('./generatePDF');
const { sendEmail } = require('./sendEmail');

// Validation schema
const WaiverSchema = z.object({
  waiverType: z.enum(['passenger', 'representative']),
  passenger: z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    town: z.string().min(3),
  }),
  representative: z.object({
    firstName: z.string(),
    lastName: z.string(),
  }).optional(),
  contact: z.object({
    email: z.string().email(),
    phone: z.string().length(10),
  }),
  agreements: z.object({
    waiver1: z.boolean(),
    waiver2: z.boolean(),
    waiver3: z.boolean(),
    waiver4: z.boolean(),
    waiver5: z.boolean(),
  }),
  mediaRelease: z.string(),
  signatures: z.object({
    passenger: z.object({
      image: z.string(), // base64
      timestamp: z.number(),
    }),
    witness: z.object({
      name: z.string(),
      image: z.string(), // base64
      timestamp: z.number(),
    }),
  }),
});

exports.submitWaiver = functions.https.onCall(async (data, context) => {
  try {
    // Validate input
    const validData = WaiverSchema.parse(data);
    
    // Generate waiver ID
    const waiverUId = `PAS-${uuidv4()}`;
    
    // Create timestamps
    const createdAt = admin.firestore.Timestamp.now();
    const expiryDate = admin.firestore.Timestamp.fromDate(
      new Date(createdAt.toDate().setFullYear(createdAt.toDate().getFullYear() + 1))
    );
    
    // Prepare Firestore document
    const waiverDoc = {
      waiverUId,
      createdAt,
      expiryDate,
      waiverType: validData.waiverType,
      passenger: validData.passenger,
      representative: validData.representative || null,
      contact: validData.contact,
      agreements: validData.agreements,
      mediaRelease: validData.mediaRelease,
      signatures: {
        passenger: {
          timestamp: admin.firestore.Timestamp.fromMillis(validData.signatures.passenger.timestamp),
        },
        witness: {
          name: validData.signatures.witness.name,
          timestamp: admin.firestore.Timestamp.fromMillis(validData.signatures.witness.timestamp),
        },
      },
      status: 'pending',
    };
    
    // Save to Firestore
    const docRef = await admin.firestore()
      .collection('waivers')
      .add(waiverDoc);
    
    // Generate PDF
    const pdfData = await generatePDF(waiverDoc, validData.signatures);
    
    // Update document with PDF info
    await docRef.update({
      pdf: pdfData.pdf,
      signatures: {
        passenger: {
          ...waiverDoc.signatures.passenger,
          imageUrl: pdfData.signatureUrls.passenger,
        },
        witness: {
          ...waiverDoc.signatures.witness,
          imageUrl: pdfData.signatureUrls.witness,
        },
      },
    });
    
    // Send email
    const emailResult = await sendEmail(
      validData.contact.email,
      validData.passenger,
      waiverDoc,
      pdfData.pdf.publicUrl
    );
    
    // Update with email status
    await docRef.update({
      email: emailResult,
      status: 'completed',
    });
    
    return {
      success: true,
      waiverUId,
      message: 'Waiver created successfully! Thank you.',
    };
    
  } catch (error) {
    console.error('Error submitting waiver:', error);
    
    // Log to Firestore for debugging
    await admin.firestore()
      .collection('errors')
      .add({
        function: 'submitWaiver',
        error: error.message,
        stack: error.stack,
        timestamp: admin.firestore.Timestamp.now(),
      });
    
    throw new functions.https.HttpsError(
      'internal',
      'Failed to submit waiver. Please try again.'
    );
  }
});
```

### 7.2 PDF Generation Function

**File:** `functions/src/handlers/generatePDF.js`

```javascript
const PDFDocument = require('pdfkit');
const admin = require('firebase-admin');
const { format } = require('date-fns');
const { formatInTimeZone } = require('date-fns-tz');

async function generatePDF(waiverDoc, signatures) {
  const doc = new PDFDocument({ size: 'LETTER', margin: 50 });
  const chunks = [];
  
  // Collect PDF data
  doc.on('data', chunk => chunks.push(chunk));
  
  const pdfPromise = new Promise((resolve, reject) => {
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);
  });
  
  // Build PDF content
  // Header
  doc.fontSize(20)
      .text('Waiver and Release of Liability - Individual', { align: 'center' });
  
  doc.moveDown();
  doc.fontSize(12);
  
  // Waiver ID and dates
  doc.text(`Waiver ID: ${waiverDoc.waiverUId}`);
  doc.text(`Created: ${formatInTimeZone(
    waiverDoc.createdAt.toDate(),
    'America/Vancouver',
    'MMMM dd, yyyy'
  )}`);
  doc.text(`Expires: ${formatInTimeZone(
    waiverDoc.expiryDate.toDate(),
    'America/Vancouver',
    'MMMM dd, yyyy'
  )}`);
  
  doc.moveDown();
  
  // Passenger information
  doc.fontSize(14).text('Passenger Information', { underline: true });
  doc.fontSize(12);
  doc.text(`Name: ${waiverDoc.passenger.firstName} ${waiverDoc.passenger.lastName}`);
  doc.text(`Town/City: ${waiverDoc.passenger.town}`);
  doc.text(`Email: ${waiverDoc.contact.email}`);
  doc.text(`Phone: ${waiverDoc.contact.phone}`);
  
  // Representative (if applicable)
  if (waiverDoc.representative) {
    doc.moveDown();
    doc.fontSize(14).text('Legal Representative', { underline: true });
    doc.fontSize(12);
    doc.text(`Name: ${waiverDoc.representative.firstName} ${waiverDoc.representative.lastName}`);
  }
  
  // Waiver agreements
  doc.moveDown();
  doc.fontSize(14).text('Agreements', { underline: true });
  doc.fontSize(10);
  
  const agreementTexts = {
    waiver1: 'I have received, read and understand the Cycling Without Age Passenger Handbook...',
    waiver2: 'I am the person named herein taking part in the Cycling Without Age Program...',
    waiver3: 'I understand and agree that there are inherent risks...',
    waiver4: 'I accept all responsibility for my participation...',
    waiver5: 'I do hereby indemnify and hold harmless...',
  };
  
  Object.entries(waiverDoc.agreements).forEach(([key, agreed]) => {
    doc.text(`${agreed ? '✓' : '✗'} ${agreementTexts[key]}`);
    doc.moveDown(0.5);
  });
  
  // Media release
  doc.moveDown();
  doc.fontSize(14).text('Media Release', { underline: true });
  doc.fontSize(10);
  doc.text(waiverDoc.mediaRelease);
  
  // Signatures
  doc.addPage();
  doc.fontSize(14).text('Signatures', { underline: true });
  
  // Passenger signature
  const passengerSigBuffer = Buffer.from(
    signatures.passenger.image.split(',')[1],
    'base64'
  );
  doc.image(passengerSigBuffer, {
    fit: [200, 100],
    align: 'left',
  });
  doc.fontSize(10);
  doc.text(`Passenger: ${waiverDoc.passenger.firstName} ${waiverDoc.passenger.lastName}`);
  doc.text(`Signed: ${formatInTimeZone(
    waiverDoc.signatures.passenger.timestamp.toDate(),
    'America/Vancouver',
    'yyyy-MM-dd HH:mm:ss'
  )}`);
  
  doc.moveDown();
  
  // Witness signature
  const witnessSigBuffer = Buffer.from(
    signatures.witness.image.split(',')[1],
    'base64'
  );
  doc.image(witnessSigBuffer, {
    fit: [200, 100],
    align: 'left',
  });
  doc.text(`Witness: ${waiverDoc.signatures.witness.name}`);
  doc.text(`Signed: ${formatInTimeZone(
    waiverDoc.signatures.witness.timestamp.toDate(),
    'America/Vancouver',
    'yyyy-MM-dd HH:mm:ss'
  )}`);
  
  // Footer
  doc.fontSize(8)
     .text('Cycling Without Age Society', 50, doc.page.height - 30, {
       align: 'center',
     });
  
  doc.end();
  
  // Wait for PDF generation
  const pdfBuffer = await pdfPromise;
  
  // Upload to Storage
  const bucket = admin.storage().bucket();
  const date = waiverDoc.createdAt.toDate();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  
  const fileName = `${waiverDoc.waiverUId}.pdf`;
  const filePath = `waivers/pdfs/${year}/${month}/${fileName}`;
  
  const file = bucket.file(filePath);
  await file.save(pdfBuffer, {
    contentType: 'application/pdf',
    metadata: {
      metadata: {
        waiverUId: waiverDoc.waiverUId,
        passengerName: `${waiverDoc.passenger.firstName} ${waiverDoc.passenger.lastName}`,
        createdAt: waiverDoc.createdAt.toDate().toISOString(),
      },
    },
  });
  
  // Get signed URL
  const [url] = await file.getSignedUrl({
    action: 'read',
    expires: Date.now() + 1000 * 60 * 60 * 24 * 365, // 1 year
  });
  
  // Upload signatures to storage
  const passengerSigPath = `waivers/signatures/passenger/${waiverDoc.waiverUId}.png`;
  const witnessSigPath = `waivers/signatures/witness/${waiverDoc.waiverUId}.png`;
  
  await bucket.file(passengerSigPath).save(passengerSigBuffer, { contentType: 'image/png' });
  await bucket.file(witnessSigPath).save(witnessSigBuffer, { contentType: 'image/png' });
  
  return {
    pdf: {
      fileName,
      storageUrl: `gs://${bucket.name}/${filePath}`,
      publicUrl: url,
      generatedAt: admin.firestore.Timestamp.now(),
    },
    signatureUrls: {
      passenger: `gs://${bucket.name}/${passengerSigPath}`,
      witness: `gs://${bucket.name}/${witnessSigPath}`,
    },
  };
}

module.exports = { generatePDF };
```

### 7.3 Email Function

**File:** `functions/src/handlers/sendEmail.js`

```javascript
const sgMail = require('@sendgrid/mail');
const admin = require('firebase-admin');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

async function sendEmail(recipientEmail, passenger, waiverDoc, pdfUrl) {
  try {
    const msg = {
      to: recipientEmail,
      from: {
        email: 'waivers@cyclingwithoutagesociety.org',
        name: 'Cycling Without Age Society',
      },
      replyTo: 'info@cyclingwithoutagesociety.org',
      subject: `Waiver and Release of Liability - ${new Date().toLocaleDateString()}`,
      text: `Hello ${passenger.firstName} ${passenger.lastName}.\n\nYour waiver has been successfully submitted. Please find your waiver document attached or download it using the link below.\n\nWaiver ID: ${waiverDoc.waiverUId}\n\nDownload: ${pdfUrl}\n\nThank you,\nCycling Without Age Society`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #00d1a2; color: white; padding: 20px; text-align: center;">
            <h1>Waiver and Release of Liability Confirmation</h1>
          </div>
          <div style="padding: 20px; background-color: #f5f5f5;">
            <p>Hello ${passenger.firstName} ${passenger.lastName},</p>
            <p>Your waiver has been successfully submitted. Please find your waiver document attached.</p>
            <p><strong>Waiver ID:</strong> ${waiverDoc.waiverUId}</p>
            <p>
              <a href="${pdfUrl}" 
                 style="display: inline-block; background-color: #00d1a2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 0;">
                Download Waiver PDF
              </a>
            </p>
            <p>Thank you for your participation!</p>
          </div>
          <div style="background-color: #333; color: white; padding: 15px; text-align: center; font-size: 12px;">
            <p>© 2026 Cycling Without Age Society</p>
            <p>This is an automated message. Please do not reply.</p>
          </div>
        </div>
      `,
    };
    
    await sgMail.send(msg);
    
    return {
      sent: true,
      sentAt: admin.firestore.Timestamp.now(),
      recipient: recipientEmail,
      error: null,
    };
    
  } catch (error) {
    console.error('Error sending email:', error);
    
    return {
      sent: false,
      sentAt: admin.firestore.Timestamp.now(),
      recipient: recipientEmail,
      error: error.message,
    };
  }
}

module.exports = { sendEmail };
```

---

## 8. PDF Generation Strategy

### 8.1 Library Comparison

| Feature | PDFKit | Puppeteer |
|---------|--------|-----------|
| **Approach** | Programmatic | HTML to PDF |
| **Performance** | Fast | Slower (headless Chrome) |
| **Memory Usage** | Low | High |
| **Cloud Function Cost** | Lower | Higher |
| **Template Complexity** | Code-based | HTML/CSS-based |
| **Signature Embedding** | Native | Via HTML img |
| **Learning Curve** | Moderate | Easy (if know HTML) |
| **Bundle Size** | Small (~500KB) | Large (~300MB) |

**Recommendation:** **PDFKit** for production due to better performance and lower costs in Firebase Functions.

### 8.2 Template Design

The PDF will replicate the original Google Doc template with:
- Header with organization name
- Waiver ID and dates (created, expiry)
- Individual participant information section
- Representative information (if applicable)
- Full waiver text with agreements
- Media release section
- Signature blocks with embedded images
- Timestamps for signatures
- Footer with organization info

---

## 9. Email Service Integration

### 9.1 SendGrid Setup

1. **Create SendGrid Account**
   - Sign up at sendgrid.com
   - Free tier: 100 emails/day

2. **Verify Sender Identity**
   - Single Sender Verification (quick)
   - OR Domain Authentication (recommended for production)

3. **Create API Key**
   - Settings → API Keys
   - Create key with "Mail Send" permissions
   - Save key securely

4. **Configure in Firebase**
   ```bash
   firebase functions:config:set sendgrid.key="SG.xxx"
   ```

### 9.2 Email Template

Subject: `Waiver and Release of Liability - [Date]`

Body includes:
- Personalized greeting
- Confirmation message
- Waiver ID
- Download link (signed URL, 1 year expiry)
- Organization branding
- Footer with disclaimer

---

## 10. Deployment Strategy

### 10.1 Continuous Deployment

**Option A: Manual Deployment**
```bash
# Build and deploy all
npm run build
firebase deploy
```

**Option B: GitHub Actions (Recommended)**

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Firebase

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies (Frontend)
        run: npm ci
      
      - name: Build Frontend
        run: npm run build
      
      - name: Install dependencies (Functions)
        run: cd functions && npm ci
      
      - name: Deploy to Firebase
        uses: w9jds/firebase-action@master
        with:
          args: deploy
        env:
          FIREBASE_TOKEN: ${{ secrets.FIREBASE_TOKEN }}
```

### 10.2 Environment Strategy

- **Development:** Firebase project `waivers-dev`
- **Staging:** Firebase project `waivers-staging`
- **Production:** Firebase project `waivers-prod`

Each with separate:
- Firestore database
- Storage bucket
- Functions configuration
- SendGrid subuser (optional)

---

## 11. Environment Configuration

### 11.1 Frontend Environment Variables

When migrating this codebase to a new repository and/or Firebase project:
- Update `VITE_RECAPTCHA_SITE_KEY` to a real reCAPTCHA v3 site key configured for that environment's domains (`localhost`, staging, production).
- Do not invent or reuse unrelated keys across projects; create or register the correct key in Google reCAPTCHA.
- Keep support contact details in the Firestore `waivers/settings` document (`solutionSettings.supportEmail`) rather than hard-coding per environment.

**`.env.development`**
```
VITE_FIREBASE_API_KEY=xxx
VITE_FIREBASE_AUTH_DOMAIN=waivers-dev.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=waivers-dev
VITE_FIREBASE_STORAGE_BUCKET=waivers-dev.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=xxx
VITE_FIREBASE_APP_ID=xxx
VITE_RECAPTCHA_SITE_KEY=your_dev_recaptcha_v3_site_key
```

**`.env.production`**
```
VITE_FIREBASE_API_KEY=xxx
VITE_FIREBASE_AUTH_DOMAIN=waivers.cyclingwithoutagesociety.org
VITE_FIREBASE_PROJECT_ID=waivers-prod
VITE_FIREBASE_STORAGE_BUCKET=waivers-prod.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=xxx
VITE_FIREBASE_APP_ID=xxx
VITE_RECAPTCHA_SITE_KEY=your_prod_recaptcha_v3_site_key
```

### 11.2 Firebase Functions Configuration

```bash
# Development
firebase use waivers-dev
firebase functions:config:set \
  sendgrid.key="SG.xxx" \
  app.timezone="America/Vancouver" \
  app.email_from="waivers@cyclingwithoutagesociety.org"

# Production
firebase use waivers-prod
firebase functions:config:set \
  sendgrid.key="SG.xxx" \
  app.timezone="America/Vancouver" \
  app.email_from="waivers@cyclingwithoutagesociety.org"
```

---

## 12. Testing Strategy

### 12.1 Unit Tests

**Frontend (Vitest):**
- Component rendering
- Form validation logic
- Utility functions
- Hook behavior

**Backend (Jest):**
- PDF generation
- Email sending
- Data validation
- Error handling

### 12.2 Integration Tests

- Complete form submission flow
- PDF generation and storage
- Email delivery
- Error scenarios

### 12.3 E2E Tests (Playwright/Cypress)

- Full user journey
- Multi-step form navigation
- Signature capture
- Form submission
- Success page display

### 12.4 Manual Testing Checklist

- [ ] Form loads correctly
- [ ] All input fields validate properly
- [ ] Waiver type switching works
- [ ] Signature capture works (passenger & witness)
- [ ] Multi-step navigation works
- [ ] Form submits successfully
- [ ] On submission failure, a **Send Support Email** button is shown and opens a prefilled support email draft
- [ ] PDF is generated correctly
- [ ] Email is received with attachment
- [ ] Mobile responsiveness
- [ ] Cross-browser compatibility
- [ ] Accessibility (screen readers, keyboard nav)

---

## 13. Timeline Estimate

| Phase | Duration | Dependencies |
|-------|----------|--------------|
| 1. Project Setup | 2-3 days | None |
| 2. UI Components | 4-5 days | Phase 1 |
| 3. Form Logic | 5-6 days | Phase 2 |
| 4. Firebase Backend | 4-5 days | Phase 1 |
| 5. PDF Generation | 4-5 days | Phase 4 |
| 6. Email Integration | 2-3 days | Phase 4 |
| 7. Integration | 3-4 days | Phases 3, 5, 6 |
| 8. Testing & QA | 3-4 days | Phase 7 |
| 9. Deployment | 2-3 days | Phase 8 |
| 10. Data Migration | 2-3 days | Phase 9 |

**Total Estimated Time: 31-41 days (6-8 weeks)**

With a team of 2 developers: **3-4 weeks**

---

## 14. Cost Considerations

### 14.1 Firebase Costs (Blaze Plan)

**Firestore:**
- Writes: ~100/month × $0.18/100K = ~$0.02/month
- Reads: ~1,000/month × $0.06/100K = ~$0.60/month
- Storage: 1GB × $0.18/GB = $0.18/month

**Cloud Functions:**
- Invocations: ~100/month × $0.40/million = ~$0.00/month
- Compute: ~5 seconds/request × 100 requests × $0.0000025/GB-second = ~$0.01/month
- *Cold starts can increase costs slightly*

**Storage:**
- PDFs: ~100 PDFs × 200KB = 20MB × $0.026/GB = ~$0.00/month
- Egress: 100 downloads × 200KB × $0.12/GB = ~$0.00/month

**Hosting:**
- Free tier sufficient for moderate traffic

**Estimated Firebase Costs: $5-10/month** (for low-moderate volume)

### 14.2 SendGrid Costs

**Free Tier:**
- 100 emails/day = 3,000 emails/month
- **Cost: $0**

**Essentials Plan (if needed):**
- 50,000 emails/month
- **Cost: $19.95/month**

### 14.3 Development Costs

**One-time:**
- Development: 40 days × hourly rate
- Setup & configuration
- Initial testing
- Documentation

**Ongoing:**
- Maintenance
- Monitoring
- Feature updates
- Bug fixes

---

## 15. Risk Assessment

### 15.1 Technical Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **PDF generation issues** | Medium | High | Extensive testing, fallback to Puppeteer if needed |
| **Email delivery failures** | Low | Medium | Implement retry logic, save PDFs for manual download |
| **Firebase quota limits** | Low | Medium | Monitor usage, implement caching, upgrade plan if needed |
| **Performance issues** | Low | Medium | Optimize bundle size, use code splitting, CDN for assets |
| **Data loss during migration** | Low | High | Backup all data, test migration with subset, parallel testing |
| **Browser compatibility** | Low | Low | Test on major browsers, use polyfills if needed |

### 15.2 Business Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **User resistance to new UI** | Medium | Medium | Match original design closely, provide training |
| **Downtime during cutover** | Low | High | Schedule during low-traffic period, have rollback plan |
| **Missing features** | Low | Medium | Thorough requirements review, feature parity checklist |
| **Ongoing costs higher than expected** | Low | Medium | Monitor usage, optimize functions, use caching |

---

## 16. Success Criteria

### 16.1 Functional Requirements

- ✅ All original features replicated
- ✅ Form validation working correctly
- ✅ Signature capture functional
- ✅ PDF generation matches original format
- ✅ Email delivery successful
- ✅ Data stored securely in Firestore
- ✅ Mobile-responsive design

### 16.2 Performance Requirements

- ✅ Page load time < 2 seconds
- ✅ Form submission time < 10 seconds
- ✅ PDF generation time < 5 seconds
- ✅ Email delivery time < 30 seconds
- ✅ 99.9% uptime

### 16.3 Security Requirements

- ✅ All data encrypted in transit (HTTPS)
- ✅ All data encrypted at rest (Firestore default)
- ✅ Security rules properly configured
- ✅ Input validation on client and server
- ✅ No sensitive data in logs
- ✅ GDPR/privacy compliance

---

## 17. Post-Launch Activities

### 17.1 Monitoring

- Firebase Performance Monitoring
- Firebase Analytics
- Error tracking (Sentry or Firebase Crashlytics)
- Uptime monitoring (UptimeRobot or similar)
- Cost monitoring (Firebase budget alerts)

### 17.2 Maintenance

- Weekly review of error logs
- Monthly cost review
- Quarterly security audit
- Regular dependency updates
- Performance optimization

### 17.3 Future Enhancements

Potential features to consider:
- Admin dashboard for viewing/searching waivers
- Waiver expiry notifications
- Bulk export functionality
- Digital signature verification
- Multi-language support
- SMS notifications
- QR code for easy form access
- Offline form completion (PWA)

#### **Priority Enhancement: Waivers Admin (Settings + Governance)**

A dedicated restricted application for operational administration of the waiver platform.

**Purpose:**
- Central place to manage runtime settings without code changes
- Control who can access Valid Waivers
- Manage waiver version metadata used by submission/upload flows
- Provide traceable updates with `updatedAt` and `updatedBy`

**MVP Scope (Phase 1):**
1. **Settings Management**
   - Edit `waivers/settings.solutionSettings`
   - Organization name, support email, feature toggles
2. **Access Control Management**
   - Edit `waivers/settings.accessControl.validWaivers`
   - `mode`: `open` / `restricted`
   - `allowedEmails` (for Gmail and individual users)
   - `allowedEmailDomains` (for organization-wide access)
3. **Waiver Version Management**
   - Edit `waivers/settings.waiverVersions.passenger`
   - Edit `waivers/settings.waiverVersions.representative`
   - Version string + effective date
4. **Audit Metadata**
   - Persist `updatedAt` (server timestamp)
   - Persist `updatedBy` (authenticated admin email)

**Technical Architecture:**
- **Separate React App** in repository (proposed folder: `waivers-admin/`)
- **Separate Firebase Hosting site** for runtime isolation (`waivers-admin.web.app`), not embedded into `valid-waivers.web.app`
- **Firebase Auth (Google)** with restricted allowlist/domain policy
- **Firestore** as source of truth (`waivers/settings`)
- **Form-based UI** with explicit Save/Cancel actions

**Deployment Guardrail (Required):**
- `valid-waivers.web.app` remains the volunteer-facing viewer app only
- `waivers-admin.web.app` is restricted to admin users and hosts all settings/template management

**Proposed Firestore Model (MVP):**

```typescript
// Document: waivers/settings
{
  docType: "settings",
  schemaVersion: 3,
  solutionSettings: {
    organizationName: string,
    supportEmail: string,
    enablePassengerWaiverApp: boolean,
    enablePaperWaiverUpload: boolean
  },
  waiverVersions: {
    passenger: { version: string, effectiveDate: string },
    representative: { version: string, effectiveDate: string }
  },
  accessControl: {
    validWaivers: {
      mode: "open" | "restricted",
      allowedEmails: string[],
      allowedEmailDomains: string[]
    }
  },
  updatedAt: timestamp,
  updatedBy: string
}
```

**Implementation Plan:**

**Phase A (1 week): Foundation**
- Create app scaffold and routing
- Google sign-in + admin gating
- Load and display current settings

**Phase B (1 week): Settings Editor MVP**
- Build sections: Solution Settings, Access Control, Waiver Versions
- Validation and save workflow
- Optimistic UI + error handling

**Phase C (0.5 week): Audit + Hardening**
- Write `updatedAt`/`updatedBy`
- Permission checks and guardrails
- End-to-end verification with valid-waivers behavior

**Phase D (Optional): Advanced Admin Features**
- Full waiver text/template editor
- Version history and rollback
- Draft/publish workflow

**Estimated Effort (MVP):** 2.5 weeks  
**Priority:** High  
**Dependencies:** Existing settings document and valid-waivers access enforcement already in place

---

## 18. Next Steps

1. **Review this roadmap** with stakeholders
2. **Get approval** for timeline and budget
3. **Create Firebase project** (dev, staging, prod)
4. **Set up development environment**
5. **Begin Phase 1: Project Setup**

---

## Appendix

### A. Useful Commands

```bash
# Firebase
firebase login
firebase init
firebase deploy
firebase deploy --only functions
firebase deploy --only hosting
firebase use [project-id]

# Frontend
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build

# Functions
cd functions
npm run serve        # Run functions locally
npm run shell        # Functions shell
npm run deploy       # Deploy functions
```

### B. Resources

- **Firebase Documentation:** https://firebase.google.com/docs
- **React Documentation:** https://react.dev
- **Vite Documentation:** https://vitejs.dev
- **Tailwind CSS:** https://tailwindcss.com
- **PDFKit:** https://pdfkit.org
- **SendGrid:** https://docs.sendgrid.com
- **Signature Pad:** https://github.com/szimek/signature_pad

### C. Contact Information

**Developer:** [Your Name]  
**Email:** [Your Email]  
**Repository:** https://github.com/raydevwood-sudo/waivers

---

**Document Version:** 4.0  
**Last Updated:** February 20, 2026  
**Status:** ✅ Development Complete - Testing & Migration Phase

**Migration Summary:**
- ✅ All 4 apps deployed to test environment (cwas-testing)
- ✅ Passenger waiver submission app (passenger-waivers.web.app)
- ✅ Valid Waivers app (valid-waivers.web.app)
- ✅ Paper waiver upload tool (waiver-upload.web.app)
- ✅ Waiver Console admin app (waiver-console.web.app)
- 🔄 Testing phase: Developer testing + User acceptance testing
- ⏭️ Production migration: Firebase project migration + data migration from Google Sheets
- 📊 Complete end-to-end waiver management system ready for production
