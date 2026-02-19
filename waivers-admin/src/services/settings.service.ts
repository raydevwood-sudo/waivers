import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
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
  createdAt?: unknown;
  updatedAt?: unknown;
};

function getDefaultSettingsDocument(): WaiverSettingsDocument {
  const today = new Date().toISOString().split('T')[0];

  return {
    docType: 'settings',
    schemaVersion: 3,
    solutionSettings: {
      organizationName: 'Cycling Without Age Society',
      supportEmail: 'raydevwood@gmail.com',
      enablePaperWaiverUpload: true,
      enablePassengerWaiverApp: true,
    },
    waiverVersions: {
      passenger: {
        version: 'v1',
        effectiveDate: today,
      },
      representative: {
        version: 'v1',
        effectiveDate: today,
      },
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

export async function ensureWaiverSettingsDocument(): Promise<void> {
  const settingsRef = doc(db, 'waivers', 'settings');
  const snapshot = await getDoc(settingsRef);
  const defaults = getDefaultSettingsDocument();

  if (snapshot.exists()) {
    const currentData = snapshot.data() as Partial<WaiverSettingsDocument>;
    const patch: Partial<WaiverSettingsDocument> = {};

    const currentAccessControl = currentData.accessControl?.validWaivers;
    if (!currentAccessControl) {
      patch.accessControl = defaults.accessControl;
    } else {
      const nextMode: ValidWaiversAccessControl['mode'] =
        currentAccessControl.mode === 'domain_restricted' || currentAccessControl.mode === 'restricted'
          ? 'restricted'
          : 'open';

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
