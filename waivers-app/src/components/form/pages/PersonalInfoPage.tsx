import React from 'react';
import Input from '../../ui/Input';

export default function PersonalInfoPage({ formData, waiverType, onInputChange }) {
  const isRepresentative = waiverType === 'representative';

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Passenger Information</h2>
        <p className="text-sm text-gray-500">Please provide the passenger's contact details</p>
      </div>

      <div className="space-y-4">
        <Input
          id="passenger-first-name"
          name="firstName"
          type="text"
          label="First name"
          value={formData.firstName}
          onChange={(e) => onInputChange('firstName', e.target.value)}
          autoComplete="given-name"
          required
        />

        <Input
          id="passenger-last-name"
          name="lastName"
          type="text"
          label="Last name"
          value={formData.lastName}
          onChange={(e) => onInputChange('lastName', e.target.value)}
          autoComplete="family-name"
          required
        />

        <Input
          id="town"
          name="town"
          type="text"
          label="Town/City"
          value={formData.town}
          onChange={(e) => onInputChange('town', e.target.value)}
          autoComplete="address-level2"
          minLength="3"
          required
        />
      </div>

      {isRepresentative && (
        <>
          <div className="pt-6 border-t border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Legal Representative</h2>
            <p className="text-sm text-gray-500">Information about the person completing this form</p>
          </div>

          <div className="space-y-4">
            <Input
              id="representative-first-name"
              name="representativeFirstName"
              type="text"
              label="First name"
              value={formData.representativeFirstName}
              onChange={(e) => onInputChange('representativeFirstName', e.target.value)}
              autoComplete="given-name"
              required={isRepresentative}
            />

            <Input
              id="representative-last-name"
              name="representativeLastName"
              type="text"
              label="Last name"
              value={formData.representativeLastName}
              onChange={(e) => onInputChange('representativeLastName', e.target.value)}
              autoComplete="family-name"
              required={isRepresentative}
            />
          </div>
        </>
      )}

      <div className="pt-6 border-t border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>
        <div className="space-y-4">
          <Input
            id="email"
            name="email"
            type="email"
            label="Email"
            placeholder="example@email.com"
            value={formData.email}
            onChange={(e) => onInputChange('email', e.target.value)}
            autoComplete="email"
            required
          />

          <Input
            id="phone"
            name="phone"
            type="tel"
            label="Phone"
            placeholder="1234567890"
            value={formData.phone}
            onChange={(e) => onInputChange('phone', e.target.value)}
            autoComplete="tel"
            minLength="10"
            maxLength="10"
            required
          />
        </div>
      </div>
    </div>
  );
}
