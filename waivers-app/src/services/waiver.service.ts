import type { FormData, WaiverSubmission } from '../types';

const WAIVER_ID_ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
const WAIVER_ID_LENGTH = 10;

function generateWaiverId(): string {
  const bytes = new Uint8Array(WAIVER_ID_LENGTH);
  crypto.getRandomValues(bytes);

  const idBody = Array.from(bytes)
    .map((value) => WAIVER_ID_ALPHABET[value % WAIVER_ID_ALPHABET.length])
    .join('');

  return `PAS-${idBody}`;
}

function normalizeEpochToMillis(value: number): number {
  return value < 100000000000 ? value * 1000 : value;
}

function toEpochMillis(timestamp?: string | number): number | undefined {
  if (timestamp === undefined) return undefined;

  if (typeof timestamp === 'string') {
    const parsedNumber = Number(timestamp);
    if (Number.isFinite(parsedNumber)) {
      return normalizeEpochToMillis(parsedNumber);
    }

    const parsedDate = Date.parse(timestamp);
    return Number.isNaN(parsedDate) ? undefined : parsedDate;
  }

  if (!Number.isFinite(timestamp)) return undefined;
  return normalizeEpochToMillis(timestamp);
}

async function pdfToBase64(submission: WaiverSubmission): Promise<string> {
  const { generateWaiverPDF } = await import('./pdf-generator.service');
  const pdf = await generateWaiverPDF(submission);
  const dataUri = pdf.output('datauristring');
  const commaIndex = dataUri.indexOf(',');
  if (commaIndex === -1) {
    throw new Error('Failed to encode PDF payload.');
  }

  return dataUri.slice(commaIndex + 1);
}

function getSubmitWaiverEndpoint(): string {
  const customBaseUrl = import.meta.env.VITE_FUNCTIONS_BASE_URL as string | undefined;
  if (customBaseUrl) {
    return `${customBaseUrl.replace(/\/$/, '')}/submitWaiverSecure`;
  }

  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID as string;
  return `https://us-central1-${projectId}.cloudfunctions.net/submitWaiverSecure`;
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
      firstName: formData.firstName,
      lastName: formData.lastName,
      town: formData.town,
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
        timestamp: toEpochMillis(formData.passengerTimestamp) ?? Date.now(),
      },
      witness: {
        name: formData.witnessName,
        imageUrl: formData.witnessSignature,
        timestamp: toEpochMillis(formData.witnessTimestamp),
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
    const { getAppCheckToken } = await import('../config/firebase');
    const appCheckToken = await getAppCheckToken();

    // Validate timestamp payload before secure submit
    const passengerMillis = toEpochMillis(formData.passengerTimestamp);
    if (passengerMillis === undefined) {
      throw new Error('Passenger signature timestamp is missing or invalid.');
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (appCheckToken) {
      headers['X-Firebase-AppCheck'] = appCheckToken;
    }

    for (let attempt = 0; attempt < 5; attempt += 1) {
      const docId = generateWaiverId();
      const submission = convertFormDataToSubmission(formData, docId);
      const pdfBase64 = await pdfToBase64(submission);

      const securePayload = {
        docId,
        formData: {
          ...formData,
          passengerTimestamp: passengerMillis,
          witnessTimestamp: toEpochMillis(formData.witnessTimestamp),
        },
        pdfBase64,
      };

      const response = await fetch(getSubmitWaiverEndpoint(), {
        method: 'POST',
        headers,
        body: JSON.stringify(securePayload),
      });

      if (response.status === 409) {
        continue;
      }

      if (!response.ok) {
        throw new Error('Secure waiver submission failed.');
      }

      const responseJson = await response.json() as {
        docId: string;
        pdfStoragePath?: string;
        pdfFilePath?: string;
      };

      submission.pdfStoragePath = responseJson.pdfStoragePath;
      submission.pdfFilePath = responseJson.pdfFilePath;

      return { docId: responseJson.docId || docId, submission };
    }

    throw new Error('Could not generate a unique waiver ID. Please try again.');
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
