import React from 'react';
import Checkbox from '../../ui/Checkbox';

export default function WaiverPage2({ formData, onInputChange }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Understanding of Risks</h2>
        <p className="text-sm text-gray-500">Please read and agree to continue</p>
      </div>

      <p className="text-base leading-relaxed text-gray-700">
        I, the undersigned, am the person named herein taking part in the Cycling Without Age Program as a passenger.
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
