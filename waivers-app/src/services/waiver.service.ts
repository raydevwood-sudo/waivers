import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import type { FormData, WaiverSubmission } from '../types';

export interface FirestoreWaiverSubmission extends Omit<FormData, 'passengerTimestamp' | 'witnessTimestamp'> {
  passengerTimestamp: Timestamp;
  witnessTimestamp: Timestamp;
  submittedAt: Timestamp;
}

/**
 * Convert FormData to WaiverSubmission format for PDF generation
 */
function convertFormDataToSubmission(formData: FormData, docId: string): WaiverSubmission {
  const now = new Date().toISOString();
  const expiryDate = new Date();
  expiryDate.setFullYear(expiryDate.getFullYear() + 1); // 1 year expiry
  
  return {
    waiverUId: docId,
    createdAt: now,
    expiryDate: expiryDate.toISOString(),
    waiverType: formData.waiverType,
    passenger: {
      firstName: formData.passengerFirstName,
      lastName: formData.passengerLastName,
      town: formData.passengerTown,
    },
    representative: formData.representativeFirstName && formData.representativeLastName ? {
      firstName: formData.representativeFirstName,
      lastName: formData.representativeLastName,
    } : undefined,
    contact: {
      email: formData.email,
      phone: formData.phone,
    },
    agreements: {
      informedConsent1: formData.informedConsent1,
      informedConsent2: formData.informedConsent2,
      informedConsent3: formData.informedConsent3,
      informedConsent4: formData.informedConsent4,
      informedConsent5: formData.informedConsent5,
      waiver1: formData.waiver1,
      waiver2: formData.waiver2,
      waiver3: formData.waiver3,
      waiver4: formData.waiver4,
      waiver5: formData.waiver5,
    },
    mediaRelease: formData.mediaRelease,
    signatures: {
      passenger: {
        imageUrl: formData.passengerSignature,
        timestamp: formData.passengerTimestamp,
      },
      witness: {
        name: formData.witnessName,
        imageUrl: formData.witnessSignature,
        timestamp: formData.witnessTimestamp,
      },
    },
  };
}

/**
 * Submit a waiver form to Firestore
 * @param formData - The form data to submit
 * @returns Object containing the document ID and structured submission data for PDF generation
 */
export async function submitWaiver(formData: FormData): Promise<{ docId: string; submission: WaiverSubmission }> {
  try {
    // Convert Unix timestamps to Firestore Timestamps
    const passengerTimestamp = Timestamp.fromMillis(
      typeof formData.passengerTimestamp === 'string' 
        ? parseFloat(formData.passengerTimestamp) * 1000 
        : formData.passengerTimestamp
    );
    
    const witnessTimestamp = Timestamp.fromMillis(
      typeof formData.witnessTimestamp === 'string' 
        ? parseFloat(formData.witnessTimestamp) * 1000 
        : formData.witnessTimestamp
    );

    const waiverData: FirestoreWaiverSubmission = {
      ...formData,
      passengerTimestamp,
      witnessTimestamp,
      submittedAt: Timestamp.now(),
    };

    // Add document to 'waivers' collection
    const docRef = await addDoc(collection(db, 'waivers'), waiverData);
    
    console.log('Waiver submitted successfully with ID:', docRef.id);
    
    // Convert to WaiverSubmission format for PDF generation
    const submission = convertFormDataToSubmission(formData, docRef.id);
    
    return { docId: docRef.id, submission };
  } catch (error) {
    console.error('Error submitting waiver:', error);
    throw new Error('Failed to submit waiver. Please try again.');
  }
}

/**
 * Validate Firebase configuration
 * @returns true if Firebase is properly configured
 */
export function isFirebaseConfigured(): boolean {
  const requiredEnvVars = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_STORAGE_BUCKET',
    'VITE_FIREBASE_MESSAGING_SENDER_ID',
    'VITE_FIREBASE_APP_ID',
  ];

  return requiredEnvVars.every(varName => {
    const value = import.meta.env[varName];
    return value && value !== 'your_api_key' && value !== 'your_project_id';
  });
}
