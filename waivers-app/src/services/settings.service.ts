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
  waiverVersions: {
    passenger: {
      version: string;
      effectiveDate: string;
    };
    representative: {
      version: string;
      effectiveDate: string;
    };
  };
  accessControl: {
    validWaivers: {
      mode: 'open' | 'restricted';
      allowedEmailDomains: string[];
      allowedEmails: string[];
    };
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
 * Checks if the passenger waiver app is enabled
 */
export async function isPassengerWaiverAppEnabled(): Promise<boolean> {
  const settings = await getSettings();
  return settings?.solutionSettings?.enablePassengerWaiverApp ?? true;
}

/**
 * Gets the organization name from settings
 */
export async function getOrganizationName(): Promise<string> {
  const settings = await getSettings();
  return settings?.solutionSettings?.organizationName ?? 'Cycling Without Age Society';
}

/**
 * Gets the support email from settings
 */
export async function getSupportEmail(): Promise<string> {
  const settings = await getSettings();
  return settings?.solutionSettings?.supportEmail ?? 'support@sidneycwas.ca';
}
