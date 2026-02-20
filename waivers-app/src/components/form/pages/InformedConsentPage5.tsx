import Checkbox from '../../ui/Checkbox';
import { useTemplateByType } from '../../../context/TemplateContext';
import { interpolateTemplate, getInterpolationParams } from '../../../services/template.service';
import type { FormPageProps } from './types';

type InformedConsentPageProps = Pick<FormPageProps, 'formData' | 'onInputChange'>;

export default function InformedConsentPage5({ formData, onInputChange }: InformedConsentPageProps) {
  const { template } = useTemplateByType('representative');

  if (!template || template.blocks.length < 6) {
    return <div className="text-red-600">Template not configured properly</div>;
  }

  const clauseBlock = template.blocks[5];
  const clauseText = interpolateTemplate(clauseBlock.templateText, getInterpolationParams(formData));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">{clauseBlock.label}</h2>
        <p className="text-sm text-gray-500">Please read and agree to continue</p>
      </div>

      <p className="text-base leading-relaxed text-gray-700">
        {clauseText}
      </p>
      
      <Checkbox
        id="informedConsent5"
        name="informedConsent5"
        label="I agree"
        checked={formData.informedConsent5}
        onChange={(e) => onInputChange('informedConsent5', e.target.checked)}
        required
      />
    </div>
  );
}
