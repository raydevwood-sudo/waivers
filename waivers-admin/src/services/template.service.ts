import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  query,
  getDoc,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { PASSENGER_WAIVER, REPRESENTATIVE_WAIVER } from '../config/waiver-templates';
import type { WaiverVersionCatalogItem, WaiverSettingsDocument } from './settings.service';

export type WaiverTemplateType = 'passenger' | 'representative';
export type WaiverTemplateStatus = 'draft' | 'published' | 'archived';

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
  status: WaiverTemplateStatus;
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

function extractParametersFromTemplate(template: string): string[] {
  const matches = template.match(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g) ?? [];
  const values = matches.map((entry) => entry.replace(/[{}\s]/g, ''));

  return values.filter((value, index, allValues) => allValues.indexOf(value) === index);
}

function createBlock(label: string, templateText: string): WaiverTemplateBlock {
  return {
    id: `${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    label,
    templateText,
    parameters: extractParametersFromTemplate(templateText),
  };
}

function toPassengerBlocks(): WaiverTemplateBlock[] {
  const introText = PASSENGER_WAIVER.introduction.template('{{firstName}}', '{{lastName}}', '{{town}}');

  return [
    createBlock('Introduction', introText),
    createBlock('Section Title', PASSENGER_WAIVER.waiverSection.title),
    ...PASSENGER_WAIVER.waiverSection.clauses.map((clause, index) =>
      createBlock(`Clause ${index + 1}`, clause)
    ),
    createBlock('Acknowledgment', PASSENGER_WAIVER.acknowledgment),
  ];
}

function toRepresentativeBlocks(): WaiverTemplateBlock[] {
  const introText = REPRESENTATIVE_WAIVER.introduction.template(
    '{{representativeFirstName}}',
    '{{representativeLastName}}',
    '{{firstName}}',
    '{{lastName}}',
    '{{town}}'
  );

  return [
    createBlock('Introduction', introText),
    createBlock('Section Title', REPRESENTATIVE_WAIVER.informedConsentSection.title),
    ...REPRESENTATIVE_WAIVER.informedConsentSection.clauses.map((clause, index) =>
      createBlock(`Clause ${index + 1}`, clause)
    ),
  ];
}

export function buildDefaultTemplate(
  type: WaiverTemplateType,
  version: string,
  effectiveDate: string,
  userEmail?: string
): WaiverTemplateDocument {
  const blocks = type === 'passenger' ? toPassengerBlocks() : toRepresentativeBlocks();

  return {
    docType: 'waiverTemplate',
    waiverType: type,
    version,
    effectiveDate,
    status: 'draft',
    title: type === 'passenger' ? PASSENGER_WAIVER.title : REPRESENTATIVE_WAIVER.title,
    blocks,
    ...(userEmail ? { createdBy: userEmail, updatedBy: userEmail } : {}),
  };
}

export async function listWaiverTemplates(): Promise<WaiverTemplateRecord[]> {
  const templatesRef = collection(db, 'waivers');
  const templatesQuery = query(templatesRef, where('docType', '==', 'waiverTemplate'));
  const snapshot = await getDocs(templatesQuery);

  const templates: WaiverTemplateRecord[] = [];
  snapshot.forEach((docSnapshot) => {
    const data = docSnapshot.data() as WaiverTemplateDocument;
    templates.push({
      ...data,
      id: docSnapshot.id,
    });
  });

  return templates.sort((a, b) => {
    if (a.waiverType !== b.waiverType) {
      return a.waiverType.localeCompare(b.waiverType);
    }

    if (a.effectiveDate !== b.effectiveDate) {
      return b.effectiveDate.localeCompare(a.effectiveDate);
    }

    return b.version.localeCompare(a.version);
  });
}

function toTemplateId(type: WaiverTemplateType, version: string, effectiveDate: string): string {
  const safeVersion = version.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const safeDate = effectiveDate.trim().replace(/[^0-9]/g, '');

  return `template-${type}-${safeVersion}-${safeDate}`;
}

/**
 * Syncs a published template to the settings version catalog.
 * Only adds to catalog if status is 'published', does NOT set as active.
 */
async function syncTemplateToCatalog(
  waiverType: WaiverTemplateType,
  version: string,
  effectiveDate: string,
  status: WaiverTemplateStatus
): Promise<void> {
  // Only sync published templates
  if (status !== 'published') {
    return;
  }

  const settingsRef = doc(db, 'waivers', 'settings');
  const snapshot = await getDoc(settingsRef);

  if (!snapshot.exists()) {
    return; // Settings will be created by ensureWaiverSettingsDocument
  }

  const settings = snapshot.data() as WaiverSettingsDocument;
  const catalog = settings.waiverVersionCatalog?.[waiverType] ?? [];

  // Check if this version already exists in catalog
  const exists = catalog.some(
    (item) => item.version === version && item.effectiveDate === effectiveDate
  );

  if (exists) {
    return; // Already in catalog
  }

  // Add to catalog (but don't set as active)
  const newItem: WaiverVersionCatalogItem = {
    id: `${waiverType}-${version.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`,
    version,
    effectiveDate,
  };

  const updatedCatalog = {
    ...settings.waiverVersionCatalog,
    [waiverType]: [newItem, ...catalog],
  };

  await setDoc(
    settingsRef,
    {
      waiverVersionCatalog: updatedCatalog,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export async function createWaiverTemplate(
  template: WaiverTemplateDocument,
  userEmail?: string
): Promise<string> {
  const templateId = toTemplateId(template.waiverType, template.version, template.effectiveDate);
  const templateRef = doc(db, 'waivers', templateId);

  await setDoc(templateRef, {
    ...template,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    ...(userEmail ? { createdBy: userEmail, updatedBy: userEmail } : {}),
  });

  // Sync to settings catalog if published
  await syncTemplateToCatalog(
    template.waiverType,
    template.version,
    template.effectiveDate,
    template.status
  );

  return templateId;
}

export async function updateWaiverTemplate(
  templateId: string,
  template: WaiverTemplateDocument,
  userEmail?: string
): Promise<void> {
  const templateRef = doc(db, 'waivers', templateId);

  await updateDoc(templateRef, {
    ...template,
    updatedAt: serverTimestamp(),
    ...(userEmail ? { updatedBy: userEmail } : {}),
  });

  // Sync to settings catalog if published
  await syncTemplateToCatalog(
    template.waiverType,
    template.version,
    template.effectiveDate,
    template.status
  );
}

export async function deleteWaiverTemplate(templateId: string): Promise<void> {
  const templateRef = doc(db, 'waivers', templateId);
  await deleteDoc(templateRef);
}

/**
 * Sets a template as the active/current template for its waiver type.
 * This updates the waiverVersions field in the settings document.
 * The template must be published to be set as active.
 */
export async function setActiveTemplate(
  templateId: string,
  userEmail?: string
): Promise<void> {
  // Get the template
  const templateRef = doc(db, 'waivers', templateId);
  const templateSnapshot = await getDoc(templateRef);

  if (!templateSnapshot.exists()) {
    throw new Error('Template not found');
  }

  const template = templateSnapshot.data() as WaiverTemplateDocument;

  if (template.status !== 'published') {
    throw new Error('Only published templates can be set as active');
  }

  // Ensure it's in the catalog first
  await syncTemplateToCatalog(
    template.waiverType,
    template.version,
    template.effectiveDate,
    template.status
  );

  // Update the active version in settings
  const settingsRef = doc(db, 'waivers', 'settings');
  await setDoc(
    settingsRef,
    {
      waiverVersions: {
        [template.waiverType]: {
          version: template.version,
          effectiveDate: template.effectiveDate,
        },
      },
      updatedAt: serverTimestamp(),
      ...(userEmail ? { updatedBy: userEmail } : {}),
    },
    { merge: true }
  );
}

/**
 * Gets the currently active template info from settings.
 * Returns a map of waiver type to active version info.
 */
export async function getActiveTemplates(): Promise<{
  passenger: { version: string; effectiveDate: string } | null;
  representative: { version: string; effectiveDate: string } | null;
}> {
  const settingsRef = doc(db, 'waivers', 'settings');
  const snapshot = await getDoc(settingsRef);

  if (!snapshot.exists()) {
    return { passenger: null, representative: null };
  }

  const settings = snapshot.data() as WaiverSettingsDocument;

  return {
    passenger: settings.waiverVersions?.passenger ?? null,
    representative: settings.waiverVersions?.representative ?? null,
  };
}
