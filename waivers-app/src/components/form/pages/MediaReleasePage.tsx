import React from 'react';
import Radio from '../../ui/Radio';
import { PASSENGER_WAIVER, REPRESENTATIVE_WAIVER } from '../../../config/waiver-templates';

export default function MediaReleasePage({ formData, waiverType, onInputChange }) {
  const isRepresentative = waiverType === 'representative';
  const passengerFirstName = formData.firstName || 'the passenger';
  
  // Get media release section from appropriate template
  const mediaRelease = isRepresentative 
    ? REPRESENTATIVE_WAIVER.mediaReleaseSection 
    : PASSENGER_WAIVER.mediaReleaseSection;
  
  // Get option values - handle both string and function types
  const fullConsentValue = isRepresentative && typeof mediaRelease.options.fullConsent === 'function'
    ? mediaRelease.options.fullConsent(passengerFirstName)
    : mediaRelease.options.fullConsent;
    
  const consentWithInitialsValue = isRepresentative && typeof mediaRelease.options.consentWithInitials === 'function'
    ? mediaRelease.options.consentWithInitials(passengerFirstName)
    : mediaRelease.options.consentWithInitials;
    
  const noConsentValue = isRepresentative && typeof mediaRelease.options.noConsent === 'function'
    ? mediaRelease.options.noConsent(passengerFirstName)
    : mediaRelease.options.noConsent;
  
  // Labels for display
  const consentLabel = isRepresentative
    ? `I consent to the use of ${passengerFirstName}'s likeness`
    : "I consent to the use of my likeness";
  
  const consentWithInitialsLabel = isRepresentative
    ? `I consent, but use initials for ${passengerFirstName}`
    : "I consent, but use my initials only";
  
  const consentDescription = isRepresentative
    ? "You agree to the passenger's photos/videos being used for promotional purposes"
    : "You agree to photos/videos being used for promotional purposes";
    
  const consentWithInitialsDescription = isRepresentative
    ? "Photos/videos may be used, but the passenger will be identified by initials only"
    : "Photos/videos may be used, but you will be identified by initials only";
  
  const noConsentDescription = isRepresentative
    ? "The passenger's likeness will not be used in any manner"
    : "Your likeness will not be used in any manner";

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">{mediaRelease.title}</h2>
        <p className="text-gray-600">
          {mediaRelease.description}
        </p>
      </div>

      <div className="space-y-3">
        <Radio
          id="consent"
          name="mediaRelease"
          value={fullConsentValue}
          checked={formData.mediaRelease === fullConsentValue}
          onChange={(e) => onInputChange('mediaRelease', e.target.value)}
          label={consentLabel}
          description={consentDescription}
        />
        <Radio
          id="consentWithInitials"
          name="mediaRelease"
          value={consentWithInitialsValue}
          checked={formData.mediaRelease === consentWithInitialsValue}
          onChange={(e) => onInputChange('mediaRelease', e.target.value)}
          label={consentWithInitialsLabel}
          description={consentWithInitialsDescription}
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
