import React from 'react';
import Checkbox from '../../ui/Checkbox';

export default function WaiverPage5({ formData, onInputChange }) {
  const fullName = `${formData.firstName} ${formData.lastName}`;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Physical and Mental Capability</h2>
        <p className="text-sm text-gray-500">Please read and agree to continue</p>
      </div>

      <p className="text-base leading-relaxed text-gray-700">
        I, <span className="font-semibold text-gray-900">{fullName || '________________'}</span>, hereby warrant that I am physically and mentally able to ride in the trishaw and I do not have impairments or diseases which may endanger me, any other person, or which may affect the normal course of the outing, and I agree to notify Rowing Without Limits immediately if I have any changes in my ability to participate in this activity.
      </p>
      
      <Checkbox
        id="waiver5"
        name="waiver5"
        label="I agree"
        checked={formData.waiver5}
        onChange={(e) => onInputChange('waiver5', e.target.checked)}
        required
      />
    </div>
  );
}
