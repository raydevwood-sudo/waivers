import Checkbox from '../../ui/Checkbox';
import { useTemplateByType } from '../../../context/TemplateContext';
import { interpolateTemplate, getInterpolationParams } from '../../../services/template.service';
import type { FormPageProps } from './types';

type InformedConsentPageProps = Pick<FormPageProps, 'formData' | 'onInputChange'>;

export default function InformedConsentPage1({ formData, onInputChange }: InformedConsentPageProps) {
  const { template } = useTemplateByType('representative');

  if (!template || template.blocks.length < 2) {
    return <div className="text-red-600">Template not configured properly</div>;
  }

  // First block should be introduction
  const introBlock = template.blocks[0];
  const introText = interpolateTemplate(introBlock.templateText, {
    representativeFirstName: formData.representativeFirstName || '[Representative First Name]',
    representativeLastName: formData.representativeLastName || '[Representative Last Name]',
    firstName: formData.firstName || '[Passenger First Name]',
    lastName: formData.lastName || '[Passenger Last Name]',
    town: formData.town || '[Town]',
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Agreement</h2>
        <p className="text-sm text-gray-500">Please read and agree to continue</p>
      </div>

      <div className="bg-blue-50 border-l-4 border-primary p-4 rounded">
        <p className="text-sm text-blue-900">
          This informed consent is for Legal Guardians or Power of Attorney representing a dependant participating in the Cycling Without Age Program.
        </p>
      </div>

      <p className="text-base leading-relaxed text-gray-700">
        {introText}
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
