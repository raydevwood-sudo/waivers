import React from 'react';
import Checkbox from '../../ui/Checkbox';

export default function WaiverPage4({ formData, onInputChange }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Assumption of Responsibility</h2>
        <p className="text-sm text-gray-500">Please read and agree to continue</p>
      </div>

      <p className="text-base leading-relaxed text-gray-700">
        I accept all responsibility for my participation including the possibility of personal injury, death, property damage or any kind notwithstanding that the injury, loss may have been contributed to or occasioned by the negligence of the Cycling Without Age Society and its officers, directors, employed, members, agents, assigns, legal representative and successors.
      </p>
      
      <Checkbox
        id="waiver4"
        name="waiver4"
        label="I agree"
        checked={formData.waiver4}
        onChange={(e) => onInputChange('waiver4', e.target.checked)}
        required
      />
    </div>
  );
}
