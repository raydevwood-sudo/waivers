# Passenger Application & Waiver App

A modern, accessible waiver form application built with React, TypeScript, and Firebase.

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
   cd waivers-app
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
│   └── firebase.ts     # Firebase initialization
├── services/           # Business logic
│   └── waiver.service.ts  # Waiver submission
├── types/              # TypeScript type definitions
└── App.tsx             # Main application component
```

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

The app stores all waiver submissions in Firebase Firestore. Each submission includes:

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

