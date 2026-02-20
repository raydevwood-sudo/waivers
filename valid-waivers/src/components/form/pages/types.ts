import type { FormData, WaiverType } from '../../../types';

export type SignatureSignee = 'passenger' | 'witness';

export type LocalFormData = Omit<FormData, 'waiverType' | 'mediaRelease' | 'passengerTimestamp' | 'witnessTimestamp'> & {
  representativeFirstName: string;
  representativeLastName: string;
  mediaRelease: FormData['mediaRelease'] | '';
  passengerTimestamp: number | null;
  witnessTimestamp: number | null;
};

export type FormField = keyof LocalFormData;

export interface FormPageProps {
  formData: LocalFormData;
  waiverType: WaiverType;
  onInputChange: (field: FormField, value: string | boolean) => void;
  onWaiverTypeChange: (waiverType: WaiverType) => void;
  onOpenSignature: (signee: SignatureSignee) => void;
}