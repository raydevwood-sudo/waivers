import Checkbox from '../../ui/Checkbox';
import { useTemplateByType } from '../../../context/TemplateContext';
import { interpolateTemplate } from '../../../services/template.service';
import type { FormPageProps } from './types';

type WaiverAgreementPageProps = Pick<FormPageProps, 'formData' | 'onInputChange'>;

export default function WaiverPage1({ formData, onInputChange }: WaiverAgreementPageProps) {
  const { template } = useTemplateByType('passenger');

  if (!template || template.blocks.length < 2) {
    return (
      <div className="space-y-6">
        <p className="text-red-600">Template not configured properly</p>
      </div>
    );
  }

  // First block should be introduction
  const introBlock = template.blocks[0];
  const introText = interpolateTemplate(introBlock.templateText, {
    firstName: formData.firstName || '[First Name]',
    lastName: formData.lastName || '[Last Name]',
    town: formData.town || '[Town]',
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Agreement</h2>
        <p className="text-sm text-gray-500">Please read and agree to continue</p>
      </div>

      <p className="text-base leading-relaxed text-gray-700">
        {introText}
      </p>
      
      <Checkbox
        id="waiver1"
        name="waiver1"
        label="I agree"
        checked={formData.waiver1}
        onChange={(e) => onInputChange('waiver1', e.target.checked)}
        required
      />
    </div>
  );
}
