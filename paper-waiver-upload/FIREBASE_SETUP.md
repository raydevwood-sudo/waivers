# Firebase Setup Guide

This application uses Firebase Firestore to store waiver submissions.

## Prerequisites

1. A Firebase account (https://firebase.google.com/)
2. A Firebase project created in the Firebase Console

## Setup Steps

### 1. Create a Firebase Project

1. Go to https://console.firebase.google.com/
2. Click "Add project"
3. Follow the setup wizard to create your project
4. Enable Google Analytics (optional)

### 2. Set Up Firestore Database

1. In the Firebase Console, go to **Build** > **Firestore Database**
2. Click **Create database**
3. Choose **Start in production mode** (recommended)
4. Select a location for your Firestore database (closest to your users)
5. Click **Enable**

### 3. Configure Security Rules

In the Firestore Database, go to the **Rules** tab and update with the following rules:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Waivers collection - allow write only
    match /waivers/{document=**} {
      allow read: if false;  // No reading from client
      allow write: if true;  // Allow submissions
    }
  }
}
```

This configuration allows the app to submit waivers but prevents reading data from the client side (for privacy).

### 4. Get Your Firebase Configuration

1. In the Firebase Console, go to **Project Settings** (gear icon)
2. Scroll down to **Your apps** section
3. Click the web icon `</>` to add a web app
4. Register your app with a nickname
5. Copy the `firebaseConfig` object

### 5. Configure Environment Variables

1. Create a `.env.local` file in the `waivers-app` directory:
   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` and add your Firebase configuration values:
   ```env
   VITE_FIREBASE_API_KEY=your_actual_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
   VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456
   ```

3. **Important**: Never commit `.env.local` to version control!

### 6. Test the Integration

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Fill out and submit a test waiver

3. Check your Firestore Console to verify the data was saved in the `waivers` collection

## Data Structure

Each waiver submission is stored as a document with the following structure:

```typescript
{
  waiverType: 'passenger' | 'representative',
  
  // Personal Information
  passengerFirstName: string,
  passengerLastName: string,
  passengerTown: string,
  representativeFirstName?: string,
  representativeLastName?: string,
  
  // Contact
  email: string,
  phone: string,
  
  // Agreements
  informedConsent1-5: boolean,
  waiver1-5: boolean,
  
  // Media Release
  mediaRelease: string,
  
  // Signatures (base64 images)
  passengerSignature: string,
  passengerTimestamp: Timestamp,
  witnessName: string,
  witnessSignature: string,
  witnessTimestamp: Timestamp,
  
  // Metadata
  submittedAt: Timestamp
}
```

## Accessing the Data

To view and export waiver data:

1. Go to the Firebase Console
2. Navigate to **Firestore Database**
3. Browse the `waivers` collection
4. Click on individual documents to view details
5. Use the export feature to download data as needed

## Security Notes

- API keys for web apps are safe to expose (they're restricted by domain)
- Firestore security rules protect your data
- Consider implementing Firebase Authentication for admin access
- Set up backup/export procedures for important data

## Troubleshooting

### "Firebase is not properly configured" error
- Check that all environment variables are set correctly in `.env.local`
- Restart the development server after changing `.env.local`
- Verify that the values don't contain the placeholder text like "your_api_key"

### Permission denied errors
- Check your Firestore security rules
- Ensure the web app is registered in Firebase Console
- Verify the API key and project ID are correct

### Data not appearing in Firestore
- Check the browser console for errors
- Verify network connectivity
- Check Firestore security rules allow writes
