import React from 'react';
import Checkbox from '../../ui/Checkbox';

export default function InformedConsentPage4({ formData, onInputChange }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Indemnification</h2>
        <p className="text-sm text-gray-500">Please read and agree to continue</p>
      </div>

      <p className="text-base leading-relaxed text-gray-700">
        I do hereby indemnify and hold harmless the Cycling Without Age Society - Sidney, its officers, directors, employees, members, agents, assigns, legal representatives and successors and any and all business associates and partners involved in the above noted activity and each of them, their owner, officers, and employees hereby waiving all claims for damage now or in the future arising from any loss, accident, injury or death which may be caused by or arise from participation of the individual named herein during this event; and agree to assume all risks for the activity noted above that the individual named herein has agreed to participate in.
      </p>
      
      <Checkbox
        id="informedConsent4"
        name="informedConsent4"
        label="I agree to indemnify and hold harmless the Cycling Without Age Society and waive all claims for damage"
        checked={formData.informedConsent4}
        onChange={(e) => onInputChange('informedConsent4', e.target.checked)}
        required
      />
    </div>
  );
}
