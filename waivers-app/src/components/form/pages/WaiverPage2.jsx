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
        I understand that the pilot and co-pilot of the Cycling Without Age Society trishaw are volunteers and not professional drivers, and I further understand the risks of riding in any trishaw which include, but are not limited to, the risk of collision with other vehicles (traffic) and pedestrians, the risk of falling from the trishaw. I further understand that if I am dropped off by my caregiver, it is my responsibility to arrange for my safe transportation to and from my home (or from any of the drop-off points.)
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
