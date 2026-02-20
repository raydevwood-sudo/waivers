import Checkbox from '../../ui/Checkbox';
import { useTemplateByType } from '../../../context/TemplateContext';
import { interpolateTemplate, getInterpolationParams } from '../../../services/template.service';
import type { FormPageProps } from './types';

type WaiverAgreementPageProps = Pick<FormPageProps, 'formData' | 'onInputChange'>;

export default function WaiverPage2({ formData, onInputChange }: WaiverAgreementPageProps) {
  const { template } = useTemplateByType('passenger');

  if (!template || template.blocks.length < 3) {
    return <div className="text-red-600">Template not configured properly</div>;
  }

  // Get the appropriate clause block (index 2 = first clause after intro and title)
  const clauseBlock = template.blocks[2];
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
        id="waiver2"
        name="waiver2"
        label="I agree"
        checked={formData.waiver2}
        onChange={(e) => onInputChange('waiver2', e.target.checked)}
        required
      />
    </div>
  );
}
