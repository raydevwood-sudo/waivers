import {
  collection,
  query,
  orderBy,
  getDocs,
  onSnapshot,
  type Timestamp,
  type QueryDocumentSnapshot,
  type Unsubscribe,
} from 'firebase/firestore';
import { ref, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../config/firebase';
import type { WaiverRecord } from '../types/waiver';

function timestampToDate(timestamp: Timestamp | Date | undefined): Date | undefined {
  if (!timestamp) return undefined;
  if (timestamp instanceof Date) return timestamp;
  return timestamp.toDate();
}

function mapWaiverDoc(docSnapshot: QueryDocumentSnapshot): WaiverRecord | null {
  const data = docSnapshot.data();

  if (data.docType === 'settings' || !data.firstName || !data.lastName || !data.pdfFilePath) {
    return null;
  }

  return {
    id: docSnapshot.id,
    waiverId: data.waiverId || docSnapshot.id,
    waiverType: data.waiverType,
    firstName: data.firstName,
    lastName: data.lastName,
    town: data.town,
    representativeFirstName: data.representativeFirstName,
    representativeLastName: data.representativeLastName,
    email: data.email,
    phone: data.phone,
    mediaRelease: data.mediaRelease,
    passengerSignature: data.passengerSignature,
    passengerTimestamp: timestampToDate(data.passengerTimestamp) || new Date(),
    witnessName: data.witnessName,
    witnessSignature: data.witnessSignature,
    witnessTimestamp: timestampToDate(data.witnessTimestamp),
    submittedAt: timestampToDate(data.submittedAt) || new Date(),
    pdfFilePath: data.pdfFilePath,
    pdfStoragePath: data.pdfStoragePath,
    pdfGeneratedAt: timestampToDate(data.pdfGeneratedAt) || new Date(),
  };
}

export async function fetchWaivers(): Promise<WaiverRecord[]> {
  try {
    const waiversRef = collection(db, 'waivers');
    const q = query(waiversRef, orderBy('submittedAt', 'desc'));
    const querySnapshot = await getDocs(q);

    const waivers: WaiverRecord[] = [];
    querySnapshot.forEach((doc) => {
      const waiver = mapWaiverDoc(doc);
      if (waiver) {
        waivers.push(waiver);
      }
    });

    return waivers;
  } catch (error) {
    console.error('Error fetching waivers:', error);
    throw error;
  }
}

export function subscribeWaivers(
  onWaivers: (waivers: WaiverRecord[]) => void,
  onError?: (error: unknown) => void
): Unsubscribe {
  const waiversRef = collection(db, 'waivers');
  const q = query(waiversRef, orderBy('submittedAt', 'desc'));

  return onSnapshot(
    q,
    (querySnapshot) => {
      const waivers: WaiverRecord[] = [];
      querySnapshot.forEach((doc) => {
        const waiver = mapWaiverDoc(doc);
        if (waiver) {
          waivers.push(waiver);
        }
      });

      onWaivers(waivers);
    },
    (error) => {
      console.error('Error subscribing to waivers:', error);
      onError?.(error);
    }
  );
}

export async function getPdfDownloadUrl(pdfFilePath: string): Promise<string> {
  try {
    const pdfRef = ref(storage, pdfFilePath);
    return await getDownloadURL(pdfRef);
  } catch (error) {
    console.error('Error getting PDF URL:', error);
    throw error;
  }
}

export function filterWaivers(
  waivers: WaiverRecord[],
  searchTerm: string,
  validOnly: boolean
): WaiverRecord[] {
  let filtered = [...waivers];

  // Filter by valid expiry (within last year from submission)
  if (validOnly) {
    const now = new Date();
    filtered = filtered.filter((waiver) => {
      const expiryDate = new Date(waiver.submittedAt);
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);
      return expiryDate >= now;
    });
  }

  // Search by waiver ID, first name, last name, or expiry date
  if (searchTerm) {
    const term = searchTerm.toLowerCase();
    filtered = filtered.filter((waiver) => {
      const expiryDate = new Date(waiver.submittedAt);
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);
      const expiryStr = expiryDate.toISOString().split('T')[0];

      return (
        (waiver.waiverId || waiver.id).toLowerCase().includes(term) ||
        waiver.firstName.toLowerCase().includes(term) ||
        waiver.lastName.toLowerCase().includes(term) ||
        expiryStr.includes(term)
      );
    });
  }

  return filtered;
}
