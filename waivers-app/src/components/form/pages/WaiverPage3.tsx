import React from 'react';
import Checkbox from '../../ui/Checkbox';

export default function WaiverPage3({ formData, onInputChange }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Passenger Obligations</h2>
        <p className="text-sm text-gray-500">Please read and agree to continue</p>
      </div>

      <p className="text-base leading-relaxed text-gray-700">
        I understand and agree that there are inherent risks associated with participation in this activity, that my participation is voluntary and that I am physically fit enough to participate in the activity.
      </p>
      
      <Checkbox
        id="waiver3"
        name="waiver3"
        label="I agree"
        checked={formData.waiver3}
        onChange={(e) => onInputChange('waiver3', e.target.checked)}
        required
      />
    </div>
  );
}
