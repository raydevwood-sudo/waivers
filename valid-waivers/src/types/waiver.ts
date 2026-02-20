export interface WaiverRecord {
  id: string;
  waiverId?: string;
  waiverType: 'passenger' | 'representative';
  firstName: string;
  lastName: string;
  town: string;
  representativeFirstName?: string;
  representativeLastName?: string;
  email: string;
  phone: string;
  mediaRelease: string;
  passengerSignature: string;
  passengerTimestamp: Date;
  witnessName: string;
  witnessSignature: string;
  witnessTimestamp?: Date;
  submittedAt: Date;
  pdfFilePath: string;
  pdfStoragePath: string;
  pdfGeneratedAt: Date;
}

export interface WaiverFilters {
  searchTerm: string;
  validOnly: boolean;
}
