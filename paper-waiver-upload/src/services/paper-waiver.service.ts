import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../config/firebase';
import type { User } from 'firebase/auth';
import { overlayWaiverInfo } from './pdf-overlay.service';

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
  signedDate: string;
  pdfFile: File | null;
}

export async function uploadPaperWaiver(
  formData: PaperWaiverData,
  uploadedBy: User
): Promise<string> {
  if (!formData.pdfFile) {
    throw new Error('PDF file is required');
  }

  // Parse signed date
  const signedDate = new Date(formData.signedDate);
  const expiryDate = new Date(signedDate);
  expiryDate.setFullYear(expiryDate.getFullYear() + 1);

  try {
    // Overlay waiver information on the PDF
    const { modifiedPdf, waiverId } = await overlayWaiverInfo(
      formData.pdfFile,
      signedDate
    );

    // Use waiver ID as document ID
    const docId = waiverId;
    const pdfFilePath = `waivers/pdfs/${docId}.pdf`;

    // Upload modified PDF to Storage
    const storageRef = ref(storage, pdfFilePath);
    await uploadBytes(storageRef, modifiedPdf);
    const pdfUrl = await getDownloadURL(storageRef);

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
      submittedAt: Timestamp.fromDate(signedDate),
      
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
      
      // Waiver ID
      waiverId: docId,
      
      // Placeholder signatures (paper waiver has physical signatures)
      passengerSignature: 'paper-signature',
      passengerTimestamp: Timestamp.fromDate(signedDate),
      witnessSignature: 'paper-signature',
      witnessTimestamp: Timestamp.fromDate(signedDate),
    };

    await addDoc(collection(db, 'waivers'), waiverData);

    return docId;
  } catch (error) {
    console.error('Error uploading paper waiver:', error);
    throw new Error('Failed to upload waiver. Please try again.');
  }
}
