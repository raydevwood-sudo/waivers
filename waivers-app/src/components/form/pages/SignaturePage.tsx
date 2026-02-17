import React from 'react';
import Input from '../../ui/Input';

export default function SignaturePage({ formData, waiverType, onInputChange, onOpenSignature }) {
  const isRepresentative = waiverType === 'representative';
  const passengerFullName = `${formData.firstName} ${formData.lastName}`;
  const representativeFullName = isRepresentative 
    ? `${formData.representativeFirstName} ${formData.representativeLastName}`
    : '';

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Signatures</h2>
        <p className="text-gray-600">Please sign to complete your agreement</p>
      </div>

      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-xl">
        <p className="text-sm text-gray-700 leading-relaxed">
          My signature acknowledges that I am over the age of 18 and had sufficient time to read and understand the waiver. I have had the opportunity to seek my own legal advice and that I understand and agree to the conditions stated in this document and that they are binding on my heirs, next of kin, executors, administrators and successors.
        </p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* Passenger or Legal Representative Signature */}
        <div className="space-y-3">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {isRepresentative ? 'Legal Representative Signature' : 'Passenger Signature'}
            </h3>
            <p className="text-sm text-gray-600">
              {isRepresentative ? representativeFullName : passengerFullName}
            </p>
            {isRepresentative && (
              <p className="text-sm text-gray-500 italic mt-1">
                Legal Representative of {passengerFullName}
              </p>
            )}
          </div>
          
          <button
            type="button"
            onClick={() => onOpenSignature('passenger')}
            className="relative w-full bg-white border-2 border-dashed border-gray-300 rounded-xl p-4 hover:border-primary hover:bg-primary/5 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-primary/20 group"
          >
            <img
              src={formData.passengerSignature}
              alt={isRepresentative ? 'Legal Representative Signature' : 'Passenger Signature'}
              className="w-full h-24 object-contain"
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
              Signed: {formData.passengerTimestamp.toLocaleString()}
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
            className="relative w-full bg-white border-2 border-dashed border-gray-300 rounded-xl p-4 hover:border-primary hover:bg-primary/5 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-primary/20 group"
          >
            <img
              src={formData.witnessSignature}
              alt="Witness Signature"
              className="w-full h-24 object-contain"
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
              Signed: {formData.witnessTimestamp.toLocaleString()}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
