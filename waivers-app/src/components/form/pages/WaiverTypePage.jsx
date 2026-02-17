import React from 'react';
import Radio from '../../ui/Radio';

export default function WaiverTypePage({ waiverType, onWaiverTypeChange }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Welcome</h2>
        <p className="text-gray-600">Please indicate your relationship to the passenger.</p>
      </div>

      <div className="space-y-3">
        <Radio
          id="passenger-radio"
          name="waiverType"
          value="passenger"
          checked={waiverType === 'passenger'}
          onChange={(e) => onWaiverTypeChange(e.target.value)}
          label="I am the passenger"
          description="Complete this form on your own behalf"
        />
        <Radio
          id="representative-radio"
          name="waiverType"
          value="representative"
          checked={waiverType === 'representative'}
          onChange={(e) => onWaiverTypeChange(e.target.value)}
          label="I am a legal representative"
          description="Legal Guardian or Power of Attorney authorized to release liability"
        />
      </div>
    </div>
  );
}
