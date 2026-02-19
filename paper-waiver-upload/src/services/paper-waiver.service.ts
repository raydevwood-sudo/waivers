import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../config/firebase';
import type { User } from 'firebase/auth';

interface PaperWaiverData {
  waiverType: 'passenger' | 'representative';
  firstName: string;
  lastName: string;
  town: string;
  representativeFirstName: string;
  representativeLastName: string;
  email: string;
  phone: string;
  mediaRelease: 'yes' | 'no';
  witnessName: string;
  submittedDate: string;
  pdfFile: File | null;
}

export async function uploadPaperWaiver(
  formData: PaperWaiverData,
  uploadedBy: User
): Promise<string> {
  if (!formData.pdfFile) {
    throw new Error('PDF file is required');
  }

  const docId = crypto.randomUUID();
  const pdfFilePath = `waivers/pdfs/${docId}.pdf`;

  try {
    // Upload PDF to Storage
    const storageRef = ref(storage, pdfFilePath);
    await uploadBytes(storageRef, formData.pdfFile);
    const pdfUrl = await getDownloadURL(storageRef);

    // Parse submission date
    const submittedDate = new Date(formData.submittedDate);
    const expiryDate = new Date(submittedDate);
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);

    // Create Firestore document
    const waiverData = {
      // Passenger info
      waiverType: formData.waiverType,
      firstName: formData.firstName,
      lastName: formData.lastName,
      town: formData.town,
      email: formData.email,
      phone: formData.phone,
      
      // Representative info (if applicable)
      ...(formData.waiverType === 'representative' && {
        representativeFirstName: formData.representativeFirstName,
        representativeLastName: formData.representativeLastName,
      }),
      
      // Witness and dates
      witnessName: formData.witnessName,
      mediaRelease: formData.mediaRelease,
      submittedAt: Timestamp.fromDate(submittedDate),
      
      // Agreement flags (set all to true for paper waivers)
      informedConsent1: true,
      informedConsent2: true,
      informedConsent3: true,
      informedConsent4: true,
      informedConsent5: true,
      waiver1: true,
      waiver2: true,
      waiver3: true,
      waiver4: true,
      waiver5: true,
      
      // PDF info
      pdfFilePath,
      pdfStoragePath: `gs://${storage.app.options.storageBucket}/${pdfFilePath}`,
      pdfGeneratedAt: Timestamp.now(),
      
      // Upload metadata
      uploadedBy: uploadedBy.email,
      uploadedById: uploadedBy.uid,
      uploadedAt: Timestamp.now(),
      source: 'paper-upload',
      
      // Placeholder signatures (paper waiver has physical signatures)
      passengerSignature: 'paper-signature',
      passengerTimestamp: Timestamp.fromDate(submittedDate),
      witnessSignature: 'paper-signature',
      witnessTimestamp: Timestamp.fromDate(submittedDate),
    };

    await addDoc(collection(db, 'waivers'), waiverData);

    return docId;
  } catch (error) {
    console.error('Error uploading paper waiver:', error);
    throw new Error('Failed to upload waiver. Please try again.');
  }
}
