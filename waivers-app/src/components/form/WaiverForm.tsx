import React, { useState, useEffect } from 'react';
import FormProgress from './FormProgress';
import FormNavigation from './FormNavigation';
import SignatureModal from '../signature/SignatureModal';

// Import form pages (we'll create these next)
import WaiverTypePage from './pages/WaiverTypePage';
import PersonalInfoPage from './pages/PersonalInfoPage';
import WaiverPage1 from './pages/WaiverPage1';
import WaiverPage2 from './pages/WaiverPage2';
import WaiverPage3 from './pages/WaiverPage3';
import WaiverPage4 from './pages/WaiverPage4';
import WaiverPage5 from './pages/WaiverPage5';
import InformedConsentPage1 from './pages/InformedConsentPage1';
import InformedConsentPage2 from './pages/InformedConsentPage2';
import InformedConsentPage3 from './pages/InformedConsentPage3';
import InformedConsentPage4 from './pages/InformedConsentPage4';
import InformedConsentPage5 from './pages/InformedConsentPage5';
import MediaReleasePage from './pages/MediaReleasePage';
import SignaturePage from './pages/SignaturePage';

const getTotalSteps = (waiverType) => {
  // Both passengers and representatives have 9 steps
  // Passengers: Type(0) → Info(1) → Waiver1-5(2-6) → Media(7) → Sig(8)
  // Representatives: Type(0) → Info(1) → IC1-5(2-6) → Media(7) → Sig(8)
  return 9;
};

const blankImage = "data:image/png;base64,iVBORw0KGgoAAAANSUhEU gAAASwAAACWCAYAAABkW7XSAAAAAXNSR0IArs4c6QAABGJJREFUeF7t1AEJAAAMAsHZv/RyPNwSyDncOQIECEQEFskpJgECBM5geQICBDICBitTlaAECBgsP0CAQEbAYGWqEpQAAYPlBwgQyAgYrExVghIgYLD8AAECGQGDlalKUAIEDJYfIEAgI2CwMlUJSoCAwfIDBAhkBAxWpipBCRAwWH6AAIGMgMHKVCUoAQIGyw8QIJARMFiZqgQlQMBg+QECBDICBitTlaAECBgsP0CAQEbAYGWqEpQAAYPlBwgQyAgYrExVghIgYLD8AAECGQGDlalKUAIEDJYfIEAgI2CwMlUJSoCAwfIDBAhkBAxWpipBCRAwWH6AAIGMgMHKVCUoAQIGyw8QIJARMFiZqgQlQMBg+QECBDICBitTlaAECBgsP0CAQEbAYGWqEpQAAYPlBwgQyAgYrExVghIgYLD8AAECGQGDlalKUAIEDJYfIEAgI2CwMlUJSoCAwfIDBAhkBAxWpipBCRAwWH6AAIGMgMHKVCUoAQIGyw8QIJARMFiZqgQlQMBg+QECBDICBitTlaAECBgsP0CAQEbAYGWqEpQAAYPlBwgQyAgYrExVghIgYLD8AAECGQGDlalKUAIEDJYfIEAgI2CwMlUJSoCAwfIDBAhkBAxWpipBCRAwWH6AAIGMgMHKVCUoAQIGyw8QIJARMFiZqgQlQMBg+QECBDICBitTlaAECBgsP0CAQEbAYGWqEpQAAYPlBwgQyAgYrExVghIgYLD8AAECGQGDlalKUAIEDJYfIEAgI2CwMlUJSoCAwfIDBAhkBAxWpipBCRAwWH6AAIGMgMHKVCUoAQIGyw8QIJARMFiZqgQlQMBg+QECBDICBitTlaAECBgsP0CAQEbAYGWqEpQAAYPlBwgQyAgYrExVghIgYLD8AAECGQGDlalKUAIEDJYfIEAgI2CwMlUJSoCAwfIDBAhkBAxWpipBCRAwWH6AAIGMgMHKVCUoAQIGyw8QIJARMFiZqgQlQMBg+QECBDICBitTlaAECBgsP0CAQEbAYGWqEpQAAYPlBwgQyAgYrExVghIgYLD8AAECGQGDlalKUAIEDJYfIEAgI2CwMlUJSoCAwfIDBAhkBAxWpipBCRAwWH6AAIGMgMHKVCUoAQIGyw8QIJARMFiZqgQlQMBg+QECBDICBitTlaAECBgsP0CAQEbAYGWqEpQAAYPlBwgQyAgYrExVghIgYLD8AAECGQGDlalKUAIEDJYfIEAgI2CwMlUJSoCAwfIDBAhkBAxWpipBCRAwWH6AAIGMgMHKVCUoAQIGyw8QIJARMFiZqgQlQMBg+QECBDICBitTlaAECBgsP0CAQEbAYGWqEpQAAYPlBwgQyAgYrExVghIgYLD8AAECGQGDlalKUAIEDJYfIEAgI2CwMlUJSoCAwfIDBAhkBAxWpipBCRAwWH6AAIGMgMHKVCUoAQIGyw8QIJARMFiZqgQlQMBg+QECBDICBitTlaAECBgsP0CAQEbAYGWqEpQAgQdWMQCX4yW9owAAAABJRU5ErkJggg==";

export default function WaiverForm({ onSubmit }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [waiverType, setWaiverType] = useState('passenger');
  const [formData, setFormData] = useState({
    // Personal Info
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    town: '',
    representativeFirstName: '',
    representativeLastName: '',
    
    // Waivers (for passengers)
    waiver1: false,
    waiver2: false,
    waiver3: false,
    waiver4: false,
    waiver5: false,
    
    // Informed Consent (for representatives)
    informedConsent1: false,
    informedConsent2: false,
    informedConsent3: false,
    informedConsent4: false,
    informedConsent5: false,
    
    // Media Release
    mediaRelease: '',
    
    // Signatures
   passengerSignature: blankImage,
    passengerTimestamp: null,
    witnessName: '',
    witnessSignature: blankImage,
    witnessTimestamp: null,
  });

  const [signatureModal, setSignatureModal] = useState({
    isOpen: false,
    signee: ''
  });

  const [validationErrors, setValidationErrors] = useState([]);

  // Reset media release when waiver type changes to update pronouns
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      mediaRelease: ''
    }));
  }, [waiverType]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear validation errors when user starts typing
    if (validationErrors.length > 0) {
      setValidationErrors([]);
    }
  };

  const handleSignatureSave = (signatureDataURL, timestamp, signeeArg) => {
    const signee = signeeArg || signatureModal.signee;
    if (signee === 'passenger') {
      setFormData(prev => ({
        ...prev,
        passengerSignature: signatureDataURL,
        passengerTimestamp: timestamp
      }));
    } else if (signee === 'witness') {
      setFormData(prev => ({
        ...prev,
        witnessSignature: signatureDataURL,
        witnessTimestamp: timestamp
      }));
    }
  };

  const openSignatureModal = (signee) => {
    setSignatureModal({ isOpen: true, signee });
  };

  const closeSignatureModal = () => {
    setSignatureModal({ isOpen: false, signee: '' });
  };

  const getActualPageIndex = (step, waiverType) => {
    // Both passengers and representatives follow the same 9-step flow
    return step;
  };

  const validateCurrentStep = () => {
    const errors = [];
    const actualPage = getActualPageIndex(currentStep, waiverType);
    
    switch (actualPage) {
      case 0: // Waiver Type
        if (!waiverType) {
          errors.push('Please select a waiver type');
        }
        break;
        
      case 1: // Personal Info
        if (!formData.firstName.trim()) {
          errors.push('First name is required');
        }
        if (!formData.lastName.trim()) {
          errors.push('Last name is required');
        }
        if (!formData.email.trim()) {
          errors.push('Email is required');
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          errors.push('Please enter a valid email address');
        }
        if (!formData.phone.trim()) {
          errors.push('Phone number is required');
        } else if (!/^\d{10}$/.test(formData.phone.replace(/[\s\-\(\)]/g, ''))) {
          errors.push('Please enter a valid 10-digit phone number');
        }
        if (!formData.town.trim()) {
          errors.push('Town/City is required');
        }
        
        // Representative fields only required if waiverType is 'representative'
        if (waiverType === 'representative') {
          if (!formData.representativeFirstName.trim()) {
            errors.push('Representative first name is required');
          }
          if (!formData.representativeLastName.trim()) {
            errors.push('Representative last name is required');
          }
        }
        break;
        
      case 2: // Waiver 1 / Informed Consent 1
        if (waiverType === 'passenger') {
          if (!formData.waiver1) {
            errors.push('You must check the agreement checkbox to continue');
          }
        } else {
          if (!formData.informedConsent1) {
            errors.push('You must check the agreement checkbox to continue');
          }
        }
        break;
        
      case 3: // Waiver 2 / Informed Consent 2
        if (waiverType === 'passenger') {
          if (!formData.waiver2) {
            errors.push('You must check the agreement checkbox to continue');
          }
        } else {
          if (!formData.informedConsent2) {
            errors.push('You must check the agreement checkbox to continue');
          }
        }
        break;
        
      case 4: // Waiver 3 / Informed Consent 3
        if (waiverType === 'passenger') {
          if (!formData.waiver3) {
            errors.push('You must check the agreement checkbox to continue');
          }
        } else {
          if (!formData.informedConsent3) {
            errors.push('You must check the agreement checkbox to continue');
          }
        }
        break;
        
      case 5: // Waiver 4 / Informed Consent 4
        if (waiverType === 'passenger') {
          if (!formData.waiver4) {
            errors.push('You must check the agreement checkbox to continue');
          }
        } else {
          if (!formData.informedConsent4) {
            errors.push('You must check the agreement checkbox to continue');
          }
        }
        break;
        
      case 6: // Waiver 5 / Informed Consent 5
        if (waiverType === 'passenger') {
          if (!formData.waiver5) {
            errors.push('You must check the agreement checkbox to continue');
          }
        } else {
          if (!formData.informedConsent5) {
            errors.push('You must check the agreement checkbox to continue');
          }
        }
        break;
        
      case 7: // Media Release
        if (!formData.mediaRelease) {
          errors.push('Please select a media release option');
        }
        break;
        
      case 8: // Signatures
        if (!formData.passengerSignature || formData.passengerSignature === blankImage) {
          errors.push(waiverType === 'representative' 
            ? 'Legal representative signature is required'
            : 'Passenger signature is required');
        }
        if (waiverType === 'representative') {
          if (!formData.witnessName.trim()) {
            errors.push('Witness name is required');
          }
          if (!formData.witnessSignature || formData.witnessSignature === blankImage) {
            errors.push('Witness signature is required');
          }
        }
        break;
    }
    
    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleNext = () => {
    if (!validateCurrentStep()) {
      // Scroll to top to show error messages
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Clear errors and proceed
    setValidationErrors([]);

    if (currentStep === getTotalSteps(waiverType) - 1) {
      // Submit form
      const submissionData = {
        ...formData,
        waiverType,
        passengerTimestamp: formData.passengerTimestamp?.getTime(),
        witnessTimestamp: formData.witnessTimestamp?.getTime(),
      };
      onSubmit(submissionData);
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setValidationErrors([]);
      setCurrentStep(prev => prev - 1);
    }
  };

  const renderCurrentPage = () => {
    const pageProps = {
      formData,
      waiverType,
      onInputChange: handleInputChange,
      onWaiverTypeChange: setWaiverType,
      onOpenSignature: openSignatureModal,
    };

    const actualPage = getActualPageIndex(currentStep, waiverType);

    switch (actualPage) {
      case 0:
        return <WaiverTypePage {...pageProps} />;
      case 1:
        return <PersonalInfoPage {...pageProps} />;
      case 2:
        return waiverType === 'passenger' ? 
          <WaiverPage1 {...pageProps} /> : 
          <InformedConsentPage1 {...pageProps} />;
      case 3:
        return waiverType === 'passenger' ? 
          <WaiverPage2 {...pageProps} /> : 
          <InformedConsentPage2 {...pageProps} />;
      case 4:
        return waiverType === 'passenger' ? 
          <WaiverPage3 {...pageProps} /> : 
          <InformedConsentPage3 {...pageProps} />;
      case 5:
        return waiverType === 'passenger' ? 
          <WaiverPage4 {...pageProps} /> : 
          <InformedConsentPage4 {...pageProps} />;
      case 6:
        return waiverType === 'passenger' ? 
          <WaiverPage5 {...pageProps} /> : 
          <InformedConsentPage5 {...pageProps} />;
      case 7:
        return <MediaReleasePage {...pageProps} />;
      case 8:
        return <SignaturePage {...pageProps} />;
      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-6">
      {/* Screen reader announcements for page changes */}
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        Step {currentStep + 1} of {getTotalSteps(waiverType)}
      </div>
      
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 sm:p-8" role="form" aria-label="Waiver form">
        <FormProgress currentStep={currentStep} totalSteps={getTotalSteps(waiverType)} />
        
        {renderCurrentPage()}
        
        <FormNavigation
          currentStep={currentStep}
          totalSteps={getTotalSteps(waiverType)}
          onNext={handleNext}
          onPrevious={handlePrevious}
        />
      </div>

      {validationErrors.length > 0 && (
        <div 
          className="fixed top-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 bg-red-50 border-2 border-red-200 rounded-xl p-4 shadow-2xl animate-shake z-50"
          role="alert"
          aria-live="assertive"
        >
          <div className="flex items-start gap-3">
            <span className="text-red-500 text-xl flex-shrink-0" aria-hidden="true">⚠️</span>
            <div className="flex-1 min-w-0">
              <h3 className="text-red-800 font-semibold mb-2">Please correct:</h3>
              <ul className="space-y-1 text-sm text-red-700">
                {validationErrors.map((error, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="flex-shrink-0" aria-hidden="true">•</span>
                    <span className="flex-1">{error}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      <SignatureModal
        isOpen={signatureModal.isOpen}
        onClose={closeSignatureModal}
        onSave={handleSignatureSave}
        signee={signatureModal.signee}
      />
    </div>
  );
}
