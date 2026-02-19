# Valid Waivers App

A modern, accessible volunteer-facing waiver verification application built with React, TypeScript, and Firebase.

## Features

- ✅ Multi-step form with progress tracking
- ✅ Digital signature capture
- ✅ WCAG 2.1 Level AA compliant
- ✅ Full screen reader support
- ✅ Mobile responsive design
- ✅ Firebase Firestore integration
- ✅ TypeScript for type safety

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Firebase account and project
- npm or yarn package manager

### Installation

1. **Clone the repository and install dependencies:**
   ```bash
   cd waivers-admin
   npm install
   ```

2. **Set up Firebase:**
   
   Follow the detailed instructions in [FIREBASE_SETUP.md](./FIREBASE_SETUP.md)
   
   Quick steps:
   - Create a Firebase project
   - Enable Firestore Database
   - Copy your Firebase config values
   - Create `.env.local` from `.env.example`
   - Add your Firebase credentials

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   
   Navigate to `http://localhost:5173`

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

### Project Structure

```
src/
├── components/          # React components
│   ├── form/           # Form pages and navigation
│   ├── layout/         # Layout components
│   ├── signature/      # Signature capture
│   └── ui/             # Reusable UI components
├── config/             # Configuration files
│   ├── firebase.ts     # Firebase initialization
│   └── waiver-templates.ts  # Waiver content templates (version controlled)
├── services/           # Business logic
│   ├── pdf-generator.service.ts  # PDF generation
│   └── waiver.service.ts  # Waiver submission
├── types/              # TypeScript type definitions
└── App.tsx             # Main application component
```

### Adding Your Organization Logo

Your logo is already configured! The file `public/android-chrome-512x512.png` is automatically used in:

- ✅ Browser favicon/tab icon
- ✅ App header (top-left corner)
- ✅ PDF documents (when configured)

**To replace the logo:**
```bash
# Replace the existing file with your new logo
cp your-new-logo.png public/android-chrome-512x512.png
```

**Or rename to use a different file:**
1. Add your logo to `public/` folder
2. Update references in:
   - `index.html` (favicon links)
   - `src/components/layout/Layout.tsx` (header image)
   - `src/config/waiver-templates.ts` (ORGANIZATION_LOGO_URL)

**For PDF generation with logo:**
- The logo path is configured in `src/config/waiver-templates.ts`
- To include in PDFs, pass the logo as a data URL in the submission object
- See `pdf-generator.service.ts` for implementation details

## Accessibility

This application meets WCAG 2.1 Level AA standards:

- Proper ARIA labels and roles
- Keyboard navigation support
- Screen reader announcements
- Sufficient color contrast (4.5:1+)
- Focus indicators
- Skip navigation links
- Form validation with clear error messages

## Firebase Integration

The app reads waiver submissions from Firebase Firestore. Each submission includes:

- Participant information
- Waiver agreement acknowledgments
- Digital signatures (base64 encoded images)
- Timestamps for signatures and submission

See [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) for complete setup instructions.

## Deployment

### Build for Production

```bash
npm run build
```

The optimized production build will be in the `dist/` directory.

### Deploy to Firebase Hosting (Optional)

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase Hosting
firebase init hosting

# Deploy
firebase deploy --only hosting
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

© 2024 Cycling Without Age Society

## Support

For issues or questions, please contact the development team.

