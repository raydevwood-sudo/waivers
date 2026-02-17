import React from 'react';
import Checkbox from '../../ui/Checkbox';

export default function InformedConsentPage5({ formData, onInputChange }) {
  const dependantName = `${formData.firstName} ${formData.lastName}`;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Final Agreement</h2>
        <p className="text-sm text-gray-500">Please read and agree to continue</p>
      </div>

      <p className="text-base leading-relaxed text-gray-700">
        My signature acknowledges that I have had sufficient time to read and understand this informed consent. By signing it I agree to the above conditions and allow{' '}
        <span className="font-semibold text-gray-900">{dependantName || 'the individual named herein'}</span>{' '}
        to participate in the activity named. I understand that the conditions are binding on my heirs, next of kin, executors, administrators, and successors.
      </p>
      
      <Checkbox
        id="informedConsent5"
        name="informedConsent5"
        label="I acknowledge that I have had sufficient time to read and understand this informed consent, and agree that these conditions are binding"
        checked={formData.informedConsent5}
        onChange={(e) => onInputChange('informedConsent5', e.target.checked)}
        required
      />
    </div>
  );
}
