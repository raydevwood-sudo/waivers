import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

export type WaiverType = 'passenger' | 'representative';

export type WaiverVersionCatalogItem = {
  id: string;
  version: string;
  effectiveDate: string;
};

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
  waiverVersionCatalog: {
    passenger: WaiverVersionCatalogItem[];
    representative: WaiverVersionCatalogItem[];
  };
  accessControl: {
    validWaivers: {
      mode: 'open' | 'restricted';
      allowedEmailDomains: string[];
      allowedEmails: string[];
    };
  };
  createdAt?: unknown;
  updatedAt?: unknown;
  updatedBy?: string;
};

function getDefaultSettingsDocument(): WaiverSettingsDocument {
  const today = new Date().toISOString().split('T')[0];
  const defaultPassengerVersion: WaiverVersionCatalogItem = {
    id: 'passenger-v1',
    version: 'v1',
    effectiveDate: today,
  };
  const defaultRepresentativeVersion: WaiverVersionCatalogItem = {
    id: 'representative-v1',
    version: 'v1',
    effectiveDate: today,
  };

  return {
    docType: 'settings',
    schemaVersion: 4,
    solutionSettings: {
      organizationName: 'Cycling Without Age Society',
      supportEmail: import.meta.env.VITE_DEFAULT_SUPPORT_EMAIL || 'support@sidneycwas.ca',
      enablePaperWaiverUpload: true,
      enablePassengerWaiverApp: true,
    },
    waiverVersions: {
      passenger: {
        version: defaultPassengerVersion.version,
        effectiveDate: defaultPassengerVersion.effectiveDate,
      },
      representative: {
        version: defaultRepresentativeVersion.version,
        effectiveDate: defaultRepresentativeVersion.effectiveDate,
      },
    },
    waiverVersionCatalog: {
      passenger: [defaultPassengerVersion],
      representative: [defaultRepresentativeVersion],
    },
    accessControl: {
      validWaivers: {
        mode: 'open',
        allowedEmailDomains: [],
        allowedEmails: [],
      },
    },
  };
}

export type ValidWaiversAccessControl = WaiverSettingsDocument['accessControl']['validWaivers'];

export function isValidWaiversEmailAuthorized(
  email: string,
  accessControl: ValidWaiversAccessControl
): boolean {
  if (accessControl.mode === 'open') {
    return true;
  }

  const normalizedEmail = email.trim().toLowerCase();
  const normalizedAllowedEmails = accessControl.allowedEmails.map((value) =>
    value.trim().toLowerCase()
  );

  if (normalizedAllowedEmails.includes(normalizedEmail)) {
    return true;
  }

  const emailDomain = normalizedEmail.split('@')[1] ?? '';
  if (!emailDomain) {
    return false;
  }

  const normalizedDomains = accessControl.allowedEmailDomains.map((value) =>
    value.trim().toLowerCase()
  );

  return normalizedDomains.includes(emailDomain);
}

function normalizeCatalogItem(
  type: WaiverType,
  item: Partial<WaiverVersionCatalogItem>,
  index: number
): WaiverVersionCatalogItem | null {
  const version = item.version?.trim();
  const effectiveDate = item.effectiveDate?.trim();

  if (!version || !effectiveDate) {
    return null;
  }

  return {
    id: item.id?.trim() || `${type}-${version}-${index + 1}`,
    version,
    effectiveDate,
  };
}

function normalizeCatalog(
  type: WaiverType,
  items: Partial<WaiverVersionCatalogItem>[] | undefined,
  fallback: WaiverSettingsDocument['waiverVersions'][WaiverType]
): WaiverVersionCatalogItem[] {
  const normalized = (items ?? [])
    .map((item, index) => normalizeCatalogItem(type, item, index))
    .filter((value): value is WaiverVersionCatalogItem => value !== null);

  if (normalized.length > 0) {
    return normalized;
  }

  return [
    {
      id: `${type}-${fallback.version}`,
      version: fallback.version,
      effectiveDate: fallback.effectiveDate,
    },
  ];
}

function normalizeSettingsDocument(
  data: Partial<WaiverSettingsDocument>,
  defaults: WaiverSettingsDocument
): WaiverSettingsDocument {
  const passengerCurrent = {
    version: data.waiverVersions?.passenger?.version ?? defaults.waiverVersions.passenger.version,
    effectiveDate:
      data.waiverVersions?.passenger?.effectiveDate ?? defaults.waiverVersions.passenger.effectiveDate,
  };
  const representativeCurrent = {
    version:
      data.waiverVersions?.representative?.version ?? defaults.waiverVersions.representative.version,
    effectiveDate:
      data.waiverVersions?.representative?.effectiveDate ??
        defaults.waiverVersions.representative.effectiveDate,
  };

  const catalog = {
    passenger: normalizeCatalog(
      'passenger',
      data.waiverVersionCatalog?.passenger,
      passengerCurrent
    ),
    representative: normalizeCatalog(
      'representative',
      data.waiverVersionCatalog?.representative,
      representativeCurrent
    ),
  };

  return {
    ...defaults,
    ...data,
    schemaVersion: Math.max(data.schemaVersion ?? defaults.schemaVersion, defaults.schemaVersion),
    solutionSettings: {
      ...defaults.solutionSettings,
      ...data.solutionSettings,
    },
    waiverVersions: {
      passenger: passengerCurrent,
      representative: representativeCurrent,
    },
    waiverVersionCatalog: catalog,
    accessControl: {
      validWaivers: {
        mode:
          data.accessControl?.validWaivers?.mode === 'restricted'
            ? 'restricted'
            : defaults.accessControl.validWaivers.mode,
        allowedEmailDomains:
          data.accessControl?.validWaivers?.allowedEmailDomains ??
          defaults.accessControl.validWaivers.allowedEmailDomains,
        allowedEmails:
          data.accessControl?.validWaivers?.allowedEmails ?? defaults.accessControl.validWaivers.allowedEmails,
      },
    },
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    updatedBy: data.updatedBy,
  };
}

export async function getValidWaiversAccessControl(): Promise<ValidWaiversAccessControl> {
  const settingsRef = doc(db, 'waivers', 'settings');
  const snapshot = await getDoc(settingsRef);
  const defaults = getDefaultSettingsDocument();

  if (!snapshot.exists()) {
    return defaults.accessControl.validWaivers;
  }

  const data = snapshot.data() as Partial<WaiverSettingsDocument>;
  return {
    mode: data.accessControl?.validWaivers?.mode ?? defaults.accessControl.validWaivers.mode,
    allowedEmailDomains:
      data.accessControl?.validWaivers?.allowedEmailDomains ??
      defaults.accessControl.validWaivers.allowedEmailDomains,
    allowedEmails:
      data.accessControl?.validWaivers?.allowedEmails ??
      defaults.accessControl.validWaivers.allowedEmails,
  };
}

export async function getWaiverSettingsDocument(): Promise<WaiverSettingsDocument> {
  const settingsRef = doc(db, 'waivers', 'settings');
  const snapshot = await getDoc(settingsRef);
  const defaults = getDefaultSettingsDocument();

  if (!snapshot.exists()) {
    return defaults;
  }

  const data = snapshot.data() as Partial<WaiverSettingsDocument>;
  return normalizeSettingsDocument(data, defaults);
}

export async function saveWaiverSettingsDocument(
  settings: WaiverSettingsDocument,
  updatedBy?: string
): Promise<void> {
  const settingsRef = doc(db, 'waivers', 'settings');
  const defaults = getDefaultSettingsDocument();
  const normalized = normalizeSettingsDocument(settings, defaults);

  await setDoc(
    settingsRef,
    {
      ...normalized,
      updatedAt: serverTimestamp(),
      ...(updatedBy ? { updatedBy } : {}),
    },
    { merge: true }
  );
}

export async function ensureWaiverSettingsDocument(): Promise<void> {
  const settingsRef = doc(db, 'waivers', 'settings');
  const snapshot = await getDoc(settingsRef);
  const defaults = getDefaultSettingsDocument();

  if (snapshot.exists()) {
    const currentData = snapshot.data() as Partial<WaiverSettingsDocument>;
    const normalized = normalizeSettingsDocument(currentData, defaults);
    const patch: Partial<WaiverSettingsDocument> = {};

    const currentAccessControl = normalized.accessControl.validWaivers;
    if (!currentAccessControl) {
      patch.accessControl = defaults.accessControl;
    } else {
      const nextMode: ValidWaiversAccessControl['mode'] =
        currentAccessControl.mode === 'restricted' ? 'restricted' : 'open';

      const nextAccessControl: ValidWaiversAccessControl = {
        mode: nextMode,
        allowedEmailDomains: currentAccessControl.allowedEmailDomains ?? [],
        allowedEmails: currentAccessControl.allowedEmails ?? [],
      };

      if (
        nextAccessControl.mode !== currentAccessControl.mode ||
        !Array.isArray(currentAccessControl.allowedEmails)
      ) {
        patch.accessControl = {
          validWaivers: nextAccessControl,
        };
      }
    }

    if (!currentData.solutionSettings) {
      patch.solutionSettings = normalized.solutionSettings;
    }

    if (!currentData.waiverVersions) {
      patch.waiverVersions = normalized.waiverVersions;
    }

    if (!currentData.waiverVersionCatalog) {
      patch.waiverVersionCatalog = normalized.waiverVersionCatalog;
    }

    if ((currentData.schemaVersion ?? 0) < defaults.schemaVersion) {
      patch.schemaVersion = defaults.schemaVersion;
    }

    if (Object.keys(patch).length > 0) {
      await setDoc(
        settingsRef,
        {
          ...patch,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    }

    return;
  }

  await setDoc(settingsRef, {
    ...defaults,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}
