import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../config/firebase';

export type WaiverTemplateType = 'passenger' | 'representative';

export type WaiverTemplateBlock = {
  id: string;
  label: string;
  templateText: string;
  parameters: string[];
};

export type WaiverTemplateDocument = {
  docType: 'waiverTemplate';
  waiverType: WaiverTemplateType;
  version: string;
  effectiveDate: string;
  status: 'draft' | 'published' | 'archived';
  title: string;
  blocks: WaiverTemplateBlock[];
  createdAt?: unknown;
  createdBy?: string;
  updatedAt?: unknown;
  updatedBy?: string;
};

export type WaiverTemplateRecord = WaiverTemplateDocument & {
  id: string;
};

type ActiveTemplateInfo = {
  passenger: { version: string; effectiveDate: string } | null;
  representative: { version: string; effectiveDate: string } | null;
};

/**
 * Fetches the currently active template info from settings
 */
async function getActiveTemplateInfo(): Promise<ActiveTemplateInfo> {
  const settingsRef = doc(db, 'waivers', 'settings');
  const snapshot = await getDoc(settingsRef);

  if (!snapshot.exists()) {
    return { passenger: null, representative: null };
  }

  const settings = snapshot.data();
  return {
    passenger: settings.waiverVersions?.passenger ?? null,
    representative: settings.waiverVersions?.representative ?? null,
  };
}

/**
 * Fetches a specific template by type, version, and effective date
 */
async function getTemplateByVersionAndDate(
  waiverType: WaiverTemplateType,
  version: string,
  effectiveDate: string
): Promise<WaiverTemplateRecord | null> {
  const templatesRef = collection(db, 'waivers');
  const q = query(
    templatesRef,
    where('docType', '==', 'waiverTemplate'),
    where('waiverType', '==', waiverType),
    where('version', '==', version),
    where('effectiveDate', '==', effectiveDate)
  );

  const snapshot = await getDocs(q);
  
  if (snapshot.empty) {
    return null;
  }

  const docSnapshot = snapshot.docs[0];
  return {
    id: docSnapshot.id,
    ...docSnapshot.data() as WaiverTemplateDocument,
  };
}

/**
 * Fetches the currently active template for a given waiver type
 * Returns null if no active template is found
 */
export async function getActiveTemplate(
  waiverType: WaiverTemplateType
): Promise<WaiverTemplateRecord | null> {
  const activeInfo = await getActiveTemplateInfo();
  const typeInfo = activeInfo[waiverType];

  if (!typeInfo) {
    console.warn(`No active template info found for ${waiverType}`);
    return null;
  }

  const template = await getTemplateByVersionAndDate(
    waiverType,
    typeInfo.version,
    typeInfo.effectiveDate
  );

  if (!template) {
    console.warn(
      `Active template not found for ${waiverType}: ${typeInfo.version} (${typeInfo.effectiveDate})`
    );
    return null;
  }

  return template;
}

/**
 * Replaces template parameters with actual values
 * Example: "Hello {{firstName}}" with {firstName: "John"} => "Hello John"
 */
export function interpolateTemplate(
  templateText: string,
  values: Record<string, string>
): string {
  let result = templateText;
  
  for (const [key, value] of Object.entries(values)) {
    const pattern = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g');
    result = result.replace(pattern, value || '');
  }
  
  return result;
}

/**
 * Generates interpolation parameters from form data and computed values
 */
export function getInterpolationParams(formData: {
  firstName?: string;
  lastName?: string;
  town?: string;
  representativeFirstName?: string;
  representativeLastName?: string;
  email?: string;
  phone?: string;
}): Record<string, string> {
  const now = new Date();
  const expiryDate = new Date(now);
  expiryDate.setFullYear(expiryDate.getFullYear() + 1);
  
  const formatDate = (date: Date): string => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  };
  
  return {
    firstName: formData.firstName || '',
    lastName: formData.lastName || '',
    town: formData.town || '',
    representativeFirstName: formData.representativeFirstName || '',
    representativeLastName: formData.representativeLastName || '',
    email: formData.email || '',
    phone: formData.phone || '',
    currentDate: formatDate(now),
    expiryDate: formatDate(expiryDate),
    year: now.getFullYear().toString(),
  };
}

/**
 * Cache for active templates to avoid repeated Firestore calls
 */
const templateCache = new Map<string, { template: WaiverTemplateRecord; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function getActiveTemplateCached(
  waiverType: WaiverTemplateType
): Promise<WaiverTemplateRecord | null> {
  const cacheKey = `active-${waiverType}`;
  const cached = templateCache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.template;
  }

  const template = await getActiveTemplate(waiverType);
  
  if (template) {
    templateCache.set(cacheKey, { template, timestamp: Date.now() });
  }
  
  return template;
}

/**
 * Clears the template cache (useful for testing or after template updates)
 */
export function clearTemplateCache(): void {
  templateCache.clear();
}
