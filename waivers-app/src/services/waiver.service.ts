import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import type { FormData } from '../types';

export interface WaiverSubmission extends Omit<FormData, 'passengerTimestamp' | 'witnessTimestamp'> {
  passengerTimestamp: Timestamp;
  witnessTimestamp: Timestamp;
  submittedAt: Timestamp;
}

/**
 * Submit a waiver form to Firestore
 * @param formData - The form data to submit
 * @returns The document ID of the created waiver
 */
export async function submitWaiver(formData: FormData): Promise<string> {
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

    const waiverData: WaiverSubmission = {
      ...formData,
      passengerTimestamp,
      witnessTimestamp,
      submittedAt: Timestamp.now(),
    };

    // Add document to 'waivers' collection
    const docRef = await addDoc(collection(db, 'waivers'), waiverData);
    
    console.log('Waiver submitted successfully with ID:', docRef.id);
    return docRef.id;
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
