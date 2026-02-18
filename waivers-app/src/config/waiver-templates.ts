/**
 * Waiver Content Templates - Version Controlled
 * 
 * This file serves as the single source of truth for all waiver content.
 * Both the PDF generator and React form components should reference this content.
 * 
 * Version History:
 * - v1.0 (2024-05-28): Initial version - Passenger waiver content
 */

export const WAIVER_VERSION = 'v1.0';
export const WAIVER_VERSION_DATE = '2024-05-28';
export const ORGANIZATION_NAME = 'Cycling Without Age Society';
export const ORGANIZATION_NAME_SHORT = 'CWAS';
export const ORGANIZATION_LOGO_URL = '/android-chrome-512x512.png'; // Path to organization logo for PDF generation

/**
 * Passenger Waiver Content
 */
export const PASSENGER_WAIVER = {
  title: 'Passenger Application Confidentiality and Application Agreement',
  
  introduction: {
    template: (firstName: string, lastName: string, town: string) => 
      `I, ${firstName} ${lastName} of the town of ${town}, have received, read and understand the Cycling Without Age Passenger Handbook and Confidentiality guidelines, and agree to abide by the procedures listed therein and I attest that all of the information I have provided herein is accurate and complete. I understand and agree that acceptance into the program is entirely at the discretion of the Cycling Without Age Society program coordinator.`
  },
  
  waiverSection: {
    title: 'Waiver of Liability',
    clauses: [
      'I, the undersigned, am the person named herein taking part in the Cycling Without Age Program as a passenger.',
      
      'I understand and agree that there are inherent risks associated with participation in this activity, that my participation is voluntary and that I am physically fit enough to participate in the activity.',
      
      'I accept all responsibility for my participation including the possibility of personal injury, death, property damage or any kind notwithstanding that the injury, loss may have been contributed to or occasioned by the negligence of the Cycling Without Age Society and its officers, directors, employed, members, agents, assigns, legal representative and successors.',
      
      'I do hereby indemnify and hold harmless the Cycling Without Age Society, its officers, directors, employees, members, agents, assigns, legal representatives and successors and any and all business associates and partners involved in the above noted activity and each of them, their owner, officers, and employees hereby waiving all claims for damage now or in the future arising from any loss, accident, injury or death which may be caused by or arise from participation of the individual named herein during this event; and agree to assume all risks for the activity noted above that the individual named herein has agreed to participate in.'
    ]
  },
  
  mediaReleaseSection: {
    title: 'Media Release',
    description: `Cycling Without Age Society occasionally takes photos/videos of their rides and passengers for the purpose of promoting their program on digital and print media including social networks, CWAS website, other news and advertising.`,
    
    options: {
      fullConsent: 'I consent to Cycling Without Age Society using recordings of me participating in their program for the purposes listed above.',
      
      consentWithInitials: 'I consent to Cycling Without Age Society using recordings of me participating in their program for the purposes listed above. However, I request that my full name not be shown, and I prefer to be identified by initials instead.',
      
      noConsent: 'I do not consent. Do not use my likeness in any manner.'
    }
  },
  
  acknowledgment: 'My signature acknowledges that I am over the age of 18 and had sufficient time to read and understand this waiver. I have had the opportunity to seek my own legal advice and that I understand and agree to the conditions stated in this document and that they are binding on my heirs, next of kin, executors, administrators and successors.'
};

/**
 * Representative (Legal Guardian/POA) Waiver Content
 */
export const REPRESENTATIVE_WAIVER = {
  title: 'Informed Consent for Legal Guardian/Power of Attorney',
  
  introduction: {
    template: (representativeFirstName: string, representativeLastName: string, passengerFirstName: string, passengerLastName: string, town: string) =>
      `I, ${representativeFirstName} ${representativeLastName}, the undersigned, attest that I am the Legal Guardian/Power of Attorney of ${passengerFirstName} ${passengerLastName} of the town of ${town}, who is taking part in the Cycling Without Age Program as a Passenger. I have received, read and understand the Cycling Without Age Passenger Handbook and Confidentiality guidelines, and agree to abide by the procedures listed therein. I attest that all of the information I have provided herein is accurate and complete. I understand and agree that acceptance into the program is entirely at the discretion of the Cycling Without Age Society program coordinator.`
  },
  
  informedConsentSection: {
    title: 'Informed Consent',
    clauses: [
      'I the undersigned attest that I am the Legal Guardian/Power of Attorney of the person named herein taking part in the Cycling Without Age Program as a Passenger.',
      
      'I understand and agree that there are inherent risks associated with participation in this activity, that participation is voluntary and that the participant is physically fit enough to participate in the activity.',
      
      'I accept all responsibility for their participation including the possibility of personal injury, death, property damage of any kind notwithstanding that the injury, loss may have been contributed to or occasioned by the negligence of the Cycling Without Age Society - Sidney and its officers, directors, employed, members, agents, assigns, legal representative, and successors.',
      
      'I do hereby indemnify and hold harmless the Cycling Without Age Society - Sidney, its officers, directors, employees, members, agents, assigns, legal representatives and successors and any and all business associates and partners involved in the above noted activity and each of them, their owner, officers, and employees hereby waiving all claims for damage now or in the future arising from any loss, accident, injury or death which may be caused by or arise from participation of the individual named herein during this event; and agree to assume all risks for the activity noted above that the individual named herein has agreed to participate in.',
      
      'My signature acknowledges that I have had sufficient time to read and understand this informed consent. By signing it I agree to the above conditions and allow the individual named herein to participate in the activity named. I understand that the conditions are binding on my heirs, next of kin, executors, administrators, and successors.'
    ]
  },
  
  mediaReleaseSection: {
    title: 'Media Release',
    description: `Cycling Without Age Society occasionally takes photos/videos of their rides and passengers for the purpose of promoting their program on digital and print media including social networks, CWAS website, other news and advertising.`,
    
    options: {
      fullConsent: (passengerFirstName: string) => 
        `I consent to Cycling Without Age Society using recordings of ${passengerFirstName} participating in their program for the purposes listed above.`,
      
      consentWithInitials: (passengerFirstName: string) => 
        `I consent to Cycling Without Age Society using recordings of ${passengerFirstName} participating in their program for the purposes listed above. However, I request that their full name not be shown, and they should be identified by initials instead.`,
      
      noConsent: (passengerFirstName: string) => 
        `I do not consent. Do not use ${passengerFirstName}'s likeness in any manner.`
    }
  }
};

/**
 * PDF Document Metadata
 */
export const PDF_METADATA = {
  creator: ORGANIZATION_NAME,
  subject: 'Passenger Waiver and Agreement',
  keywords: 'waiver, passenger, consent, cycling without age'
};

/**
 * Helper function to get waiver content based on type
 */
export function getWaiverContent(waiverType: 'passenger' | 'representative') {
  return waiverType === 'passenger' ? PASSENGER_WAIVER : REPRESENTATIVE_WAIVER;
}

/**
 * Generate document version string
 */
export function getDocumentVersion(): string {
  return `${ORGANIZATION_NAME_SHORT}-PAS(${WAIVER_VERSION})`;
}
