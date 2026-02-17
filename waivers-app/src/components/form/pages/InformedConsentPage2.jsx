import React from 'react';
import Checkbox from '../../ui/Checkbox';

export default function InformedConsentPage2({ formData, onInputChange }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Understanding of Risks</h2>
        <p className="text-sm text-gray-500">Please read and agree to continue</p>
      </div>

      <p className="text-base leading-relaxed text-gray-700">
        I understand and agree that there are inherent risks associated with participation in this activity, that participation is voluntary and that the participant is physically fit enough to participate in the activity.
      </p>
      
      <Checkbox
        id="informedConsent2"
        name="informedConsent2"
        label="I understand the inherent risks and confirm the participant is physically fit to participate"
        checked={formData.informedConsent2}
        onChange={(e) => onInputChange('informedConsent2', e.target.checked)}
        required
      />
    </div>
  );
}
