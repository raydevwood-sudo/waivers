import React from 'react';
import Checkbox from '../../ui/Checkbox';

export default function WaiverPage1({ formData, onInputChange }) {
  const fullName = `${formData.firstName} ${formData.lastName}`;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Agreement</h2>
        <p className="text-sm text-gray-500">Please read and agree to continue</p>
      </div>

      <p className="text-base leading-relaxed text-gray-700">
        I, <span className="font-semibold text-gray-900">{fullName || '________________'}</span>, of the town of <span className="font-semibold text-gray-900">{formData.town || '________________'}</span>, have received, read and understand the{' '}
        <a href="#" target="_blank" rel="noopener noreferrer" className="text-primary font-medium hover:underline">
          Cycling Without Age Passenger Handbook
        </a>{' '}
        and Confidentiality guidelines, and agree to abide by the procedures listed therein and I attest that all of the information I have provided herein is accurate and complete. I understand and agree that acceptance into the program is entirely at the discretion of the Cycling Without Age Society program coordinator.
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
