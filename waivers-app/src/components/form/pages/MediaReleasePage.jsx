import React from 'react';
import Radio from '../../ui/Radio';

export default function MediaReleasePage({ formData, onInputChange }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Media Release</h2>
        <p className="text-gray-600">
          Cycling Without Age Society occasionally takes photos/videos of their rides and passengers for the purpose of promoting their program on digital and print media including social networks, CWAS website, other news and advertising.
        </p>
      </div>

      <div className="space-y-3">
        <Radio
          id="consent"
          name="mediaRelease"
          value="I consent to Cycling Without Age Society using recordings of me participating in their program for the purposes listed above."
          checked={formData.mediaRelease === "I consent to Cycling Without Age Society using recordings of me participating in their program for the purposes listed above."}
          onChange={(e) => onInputChange('mediaRelease', e.target.value)}
          label="I consent to the use of my likeness"
          description="You agree to photos/videos being used for promotional purposes"
        />
        <Radio
          id="noConsent"
          name="mediaRelease"
          value="I do not consent. Do not use my likeness in any manner."
          checked={formData.mediaRelease === "I do not consent. Do not use my likeness in any manner."}
          onChange={(e) => onInputChange('mediaRelease', e.target.value)}
          label="I do not consent"
          description="Your likeness will not be used in any manner"
        />
      </div>
    </div>
  );
}
