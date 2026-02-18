# Waiver and Release of Liability System

**Cycling Without Age Society** - Digital Waiver Application

## Overview

This repository contains the migration of the Waiver and Release of Liability system from Google Apps Script to a modern web stack using React, Vite, Tailwind CSS, Firebase Hosting, Firestore, and Firebase Functions.

### Current Status

📋 **Planning Phase** - Migration roadmap created

### Project Goals

Migrate from:
- Google Apps Script → React + Vite + Tailwind
- Google Sheets → Cloud Firestore
- Google Drive → Firebase Storage
- Google Docs Templates → Programmatic PDF Generation
- Gmail → SendGrid Email Service
- Apps Script Hosting → Firebase Hosting

## Documentation

- **[📖 Migration Roadmap](./MIGRATION_ROADMAP.md)** - Comprehensive migration plan with timeline, architecture, and implementation details

## Features

- ✅ Multi-step form (9 pages) with progress indicator
- ✅ Two waiver types: Individual vs Legal Representative
- ✅ Digital signature capture (passenger + witness)
- ✅ Form validation with pattern matching
- ✅ Media release consent options
- ✅ PDF waiver generation
- ✅ Email delivery to participant
- ✅ Secure data storage
- ✅ Mobile-responsive design

## Technology Stack

### Frontend
- **React 18** - UI library
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first styling
- **Signature Pad** - Digital signature capture
- **React Hook Form** - Form state management
- **Zod** - Validation

### Backend
- **Firebase Functions** - Serverless backend (Node.js)
- **Cloud Firestore** - NoSQL database
- **Firebase Storage** - File storage for PDFs
- **PDFKit** - PDF generation
- **SendGrid** - Email delivery
- **Firebase Hosting** - Static hosting

## Quick Start

### Prerequisites
- Node.js 18+
- Firebase CLI
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/raydevwood-sudo/waivers.git
cd waivers

# Install dependencies
npm install

# Install Firebase tools
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase project
firebase init
```

### Development

```bash
# Start development server
npm run dev

# In another terminal, run functions locally
cd functions
npm run serve
```

### Deployment

```bash
# Build frontend
npm run build

# Deploy to Firebase
firebase deploy
```

## Project Structure

```
waivers/
├── src/                    # React frontend source
│   ├── components/         # React components
│   ├── hooks/             # Custom hooks
│   ├── services/          # API services
│   └── styles/            # CSS styles
├── functions/             # Firebase Functions (backend)
│   ├── src/
│   │   ├── handlers/      # Function handlers
│   │   ├── services/      # Business logic
│   │   └── utils/         # Utilities
│   └── package.json
├── public/                # Static assets
├── MIGRATION_ROADMAP.md   # Detailed migration plan
└── README.md             # This file
```

## Timeline

**Estimated Duration:** 6-8 weeks (single developer) or 3-4 weeks (2 developers)

See [Migration Roadmap](./MIGRATION_ROADMAP.md) for detailed phase breakdown.

## Contributing

This is a private migration project for Cycling Without Age Society. For questions or contributions, please contact the development team.

## License

© 2026 Cycling Without Age Society. All rights reserved.

## Contact

**Organization:** Cycling Without Age Society  
**Website:** https://cyclingwithoutagesociety.com  
**Repository:** https://github.com/raydevwood-sudo/waivers

---

For detailed implementation plans, see [MIGRATION_ROADMAP.md](./MIGRATION_ROADMAP.md)