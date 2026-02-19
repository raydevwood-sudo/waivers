import Input from '../../ui/Input';
import { PASSENGER_WAIVER, REPRESENTATIVE_WAIVER } from '../../../config/waiver-templates';
import type { FormPageProps } from './types';

type SignaturePageProps = Pick<FormPageProps, 'formData' | 'waiverType' | 'onInputChange' | 'onOpenSignature'>;

export default function SignaturePage({ formData, waiverType, onInputChange, onOpenSignature }: SignaturePageProps) {
  const isRepresentative = waiverType === 'representative';
  const passengerFullName = `${formData.firstName} ${formData.lastName}`;
  const representativeFullName = isRepresentative 
    ? `${formData.representativeFirstName} ${formData.representativeLastName}`
    : '';

  // Get acknowledgment text from appropriate template
  const acknowledgmentText = isRepresentative
    ? REPRESENTATIVE_WAIVER.informedConsentSection.clauses[4]
    : PASSENGER_WAIVER.acknowledgment;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Signatures</h2>
        <p className="text-gray-600">Please sign to complete your agreement</p>
      </div>

      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-xl">
        <p className="text-sm text-gray-700 leading-relaxed">
          {acknowledgmentText}
        </p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* Passenger or Legal Representative Signature */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900">
            {isRepresentative ? 'Legal Representative Signature' : 'Passenger Signature'}
          </h3>
          <p className="text-sm text-gray-600">
            {isRepresentative ? representativeFullName : passengerFullName}
          </p>
          {isRepresentative && (
            <p className="text-sm text-gray-500 italic">
              Legal Representative of {passengerFullName}
            </p>
          )}
          {/* Spacer to match witness input field height */}
          <div className="h-[48px]"></div>
          
          <button
            type="button"
            onClick={() => onOpenSignature('passenger')}
            className="relative w-full bg-white border-2 border-dashed border-gray-300 rounded-xl p-4 h-40 hover:border-primary hover:bg-primary/5 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-primary/20 group"
          >
            <img
              src={formData.passengerSignature}
              alt={isRepresentative ? 'Legal Representative Signature' : 'Passenger Signature'}
              className="w-full h-full object-contain"
            />
            {!formData.passengerTimestamp && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-medium text-gray-500 group-hover:text-primary">
                  ✍️ Click to sign
                </span>
              </div>
            )}
          </button>
          
          {formData.passengerTimestamp && (
            <p className="text-xs text-gray-500">
              Signed: {new Date(formData.passengerTimestamp).toLocaleString()}
            </p>
          )}
        </div>

        {/* Witness Signature */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900">Witness Signature</h3>
          
          <Input
            id="witnessName"
            name="witnessName"
            type="text"
            label="Witness full name"
            placeholder="Enter witness name"
            value={formData.witnessName}
            onChange={(e) => onInputChange('witnessName', e.target.value)}
            required
          />
          
          <button
            type="button"
            onClick={() => onOpenSignature('witness')}
            className="relative w-full bg-white border-2 border-dashed border-gray-300 rounded-xl p-4 h-40 hover:border-primary hover:bg-primary/5 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-primary/20 group"
          >
            <img
              src={formData.witnessSignature}
              alt="Witness Signature"
              className="w-full h-full object-contain"
            />
            {!formData.witnessTimestamp && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-medium text-gray-500 group-hover:text-primary">
                  ✍️ Click to sign
                </span>
              </div>
            )}
          </button>
          
          {formData.witnessTimestamp && (
            <p className="text-xs text-gray-500">
              Signed: {new Date(formData.witnessTimestamp).toLocaleString()}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
