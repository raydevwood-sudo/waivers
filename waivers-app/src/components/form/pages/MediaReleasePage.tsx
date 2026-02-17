import React from 'react';
import Radio from '../../ui/Radio';

export default function MediaReleasePage({ formData, waiverType, onInputChange }) {
  const isRepresentative = waiverType === 'representative';
  const passengerFirstName = formData.firstName || 'the passenger';
  
  // Dynamically create consent text based on who is signing
  const consentValue = isRepresentative
    ? `I consent to Cycling Without Age Society using recordings of ${passengerFirstName} participating in their program for the purposes listed above.`
    : "I consent to Cycling Without Age Society using recordings of me participating in their program for the purposes listed above.";
  
  const noConsentValue = isRepresentative
    ? `I do not consent. Do not use ${passengerFirstName}'s likeness in any manner.`
    : "I do not consent. Do not use my likeness in any manner.";
  
  const consentLabel = isRepresentative
    ? `I consent to the use of ${passengerFirstName}'s likeness`
    : "I consent to the use of my likeness";
  
  const consentDescription = isRepresentative
    ? "You agree to the passenger's photos/videos being used for promotional purposes"
    : "You agree to photos/videos being used for promotional purposes";
  
  const noConsentDescription = isRepresentative
    ? "The passenger's likeness will not be used in any manner"
    : "Your likeness will not be used in any manner";

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
          value={consentValue}
          checked={formData.mediaRelease === consentValue}
          onChange={(e) => onInputChange('mediaRelease', e.target.value)}
          label={consentLabel}
          description={consentDescription}
        />
        <Radio
          id="noConsent"
          name="mediaRelease"
          value={noConsentValue}
          checked={formData.mediaRelease === noConsentValue}
          onChange={(e) => onInputChange('mediaRelease', e.target.value)}
          label="I do not consent"
          description={noConsentDescription}
        />
      </div>
    </div>
  );
}
