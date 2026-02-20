// Form Data Types
export type WaiverType = 'passenger' | 'representative';

export type MediaReleaseOption = 
  | 'I consent and authorize Cycling Without Age to use my photograph, image, voice, and/or likeness without payment or any other consideration to reproduce, publish, or circulate in print or other media.'
  | 'I consent and authorize Cycling Without Age to use my photograph, image, voice, and/or likeness without payment or any other consideration to reproduce, publish, or circulate in print or other media. However, I request that my full name not be shown, and I prefer to be identified by initials instead.'
  | 'I do not consent to the use of my photograph, image, voice, and/or likeness.';

export interface FormData {
  // Waiver Type
  waiverType: WaiverType;
  
  // Personal Information
  firstName: string;
  lastName: string;
  town: string;
  representativeFirstName?: string;
  representativeLastName?: string;
  
  // Contact Information
  email: string;
  phone: string;
  
  // Informed Consent Agreements (Pages 1-5)
  informedConsent1: boolean;
  informedConsent2: boolean;
  informedConsent3: boolean;
  informedConsent4: boolean;
  informedConsent5: boolean;
  
  // Waiver Agreements (Pages 1-5)
  waiver1: boolean;
  waiver2: boolean;
  waiver3: boolean;
  waiver4: boolean;
  waiver5: boolean;
  
  // Media Release
  mediaRelease: MediaReleaseOption;
  
  // Signatures
  passengerSignature: string;
  passengerTimestamp: string | number;
  witnessName: string;
  witnessSignature: string;
  witnessTimestamp?: string | number;
}

// Component Props Types
export interface FormPageProps {
  formData: FormData;
  onChange: (field: keyof FormData, value: string | boolean) => void;
  errors?: Partial<Record<keyof FormData, string>>;
}

export interface SignatureData {
  signature: string;
  timestamp: string;
}

export interface SignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (signatureData: SignatureData) => void;
  signeeType: 'passenger' | 'witness';
}

// Template Types
export interface WaiverTemplateBlock {
  id: string;
  label: string;
  templateText: string;
  parameters: string[];
}

export interface WaiverTemplate {
  title: string;
  waiverType: WaiverType;
  version: string;
  effectiveDate: string;
  blocks: WaiverTemplateBlock[];
}

// API Types
export interface WaiverSubmission {
  waiverUId?: string;
  createdAt?: string;
  expiryDate?: string;
  pdfUrl?: string;
  pdfStoragePath?: string;
  pdfFilePath?: string;
  waiverType: WaiverType;
  template?: WaiverTemplate; // Dynamic template data for PDF generation
  passenger: {
    firstName: string;
    lastName: string;
    town: string;
  };
  representative?: {
    firstName: string;
    lastName: string;
  };
  contact: {
    email: string;
    phone: string;
  };
  agreements: {
    informedConsent1: boolean;
    informedConsent2: boolean;
    informedConsent3: boolean;
    informedConsent4: boolean;
    informedConsent5: boolean;
    waiver1: boolean;
    waiver2: boolean;
    waiver3: boolean;
    waiver4: boolean;
    waiver5: boolean;
  };
  mediaRelease: MediaReleaseOption;
  signatures: {
    passenger: {
      imageUrl: string;
      timestamp: string | number;
    };
    witness: {
      name: string;
      imageUrl: string;
      timestamp?: string | number;
    };
  };
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
