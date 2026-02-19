import Checkbox from '../../ui/Checkbox';
import { REPRESENTATIVE_WAIVER } from '../../../config/waiver-templates';
import type { FormPageProps } from './types';

type InformedConsentPageProps = Pick<FormPageProps, 'formData' | 'onInputChange'>;

export default function InformedConsentPage1({ formData, onInputChange }: InformedConsentPageProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Informed Consent - Legal Guardian/Power of Attorney</h2>
        <p className="text-sm text-gray-500">Please read and agree to continue</p>
      </div>

      <div className="bg-blue-50 border-l-4 border-primary p-4 rounded">
        <p className="text-sm text-blue-900">
          This informed consent is for Legal Guardians or Power of Attorney representing a dependant participating in the Cycling Without Age Program.
        </p>
      </div>

      <p className="text-base leading-relaxed text-gray-700">
        {REPRESENTATIVE_WAIVER.informedConsentSection.clauses[0]}
      </p>
      
      <Checkbox
        id="informedConsent1"
        name="informedConsent1"
        label="I agree"
        checked={formData.informedConsent1}
        onChange={(e) => onInputChange('informedConsent1', e.target.checked)}
        required
      />
    </div>
  );
}
