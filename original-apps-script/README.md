# Original Google Apps Script Files

This directory contains the original Google Apps Script files for reference during the migration process.

## Files

- **code.gs** - Backend server-side code (Google Apps Script)
- **index.html** - Main HTML structure for the form
- **JavaScript.html** - Client-side JavaScript logic (note: in below list)
- **Styles.html** - CSS styling (note: in below list)
- **signature_pad.min.js.html** - Signature Pad library v4.1.7 (note: in below list)

## Note

The JavaScript.html, Styles.html, and signature_pad.min.js.html files were provided during the analysis but are not saved here. They can be referenced from the migration roadmap document where their contents are documented.

## Original System Details

### IDs and Configuration
- **Sheet ID:** 1YtbfqG5ruxZikzMzogS6RFe0bxGJsWTUHh_c7rjGCz4
- **Template Doc ID:** 14kW_hfmYPzPQely7bW-YTrRjiGoEaTcBl_EI0iXIlTo
- **Folder ID:** 1UhPmYPOJXdfaUy9JSQZ3J_QvYJkoh4BM
- **Timezone:** America/Vancouver
- **Waiver ID Format:** PAS-{UUID}
- **Waiver Expiry:** 1 year from creation

### Data Flow
1. User fills out form
2. Captures signatures (passenger + witness)
3. Submits to Apps Script backend
4. Creates Google Doc from template
5. Replaces placeholders with form data
6. Converts Doc to PDF
7. Saves PDF to Google Drive
8. Writes row to Google Sheets
9. Emails PDF to passenger
10. Shows success page

## Migration Status

These files are preserved for reference only. The new system uses:
- React + Vite + Tailwind (frontend)
- Firebase Functions (backend)
- Cloud Firestore (database)
- Firebase Storage (file storage)
- PDFKit (PDF generation)
- SendGrid (email)

See [../MIGRATION_ROADMAP.md](../MIGRATION_ROADMAP.md) for complete migration details.
