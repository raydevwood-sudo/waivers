import React from 'react';
import Checkbox from '../../ui/Checkbox';
import { REPRESENTATIVE_WAIVER } from '../../../config/waiver-templates';

export default function InformedConsentPage5({ formData, onInputChange }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Final Agreement</h2>
        <p className="text-sm text-gray-500">Please read and agree to continue</p>
      </div>

      <p className="text-base leading-relaxed text-gray-700">
        {REPRESENTATIVE_WAIVER.informedConsentSection.clauses[4]}
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
