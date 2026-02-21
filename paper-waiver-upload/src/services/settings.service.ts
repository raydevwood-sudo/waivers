import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

export type WaiverSettingsDocument = {
  docType: 'settings';
  schemaVersion: number;
  solutionSettings: {
    organizationName: string;
    supportEmail: string;
    enablePaperWaiverUpload: boolean;
    enablePassengerWaiverApp: boolean;
  };
};

/**
 * Fetches the settings document from Firestore
 */
export async function getSettings(): Promise<WaiverSettingsDocument | null> {
  try {
    const settingsRef = doc(db, 'waivers', 'settings');
    const snapshot = await getDoc(settingsRef);

    if (!snapshot.exists()) {
      return null;
    }

    return snapshot.data() as WaiverSettingsDocument;
  } catch (error) {
    console.error('Error fetching settings:', error);
    return null;
  }
}

/**
 * Checks if the paper waiver upload app is enabled
 */
export async function isPaperWaiverUploadEnabled(): Promise<boolean> {
  const settings = await getSettings();
  return settings?.solutionSettings?.enablePaperWaiverUpload ?? true;
}
