import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { uploadPaperWaiver } from '../services/paper-waiver.service';
import Button from './ui/Button';
import Input from './ui/Input';
import Radio from './ui/Radio';
import Loader from './ui/Loader';

interface FormData {
  waiverType: 'passenger' | 'representative';
  firstName: string;
  lastName: string;
  town: string;
  representativeFirstName: string;
  representativeLastName: string;
  email: string;
  phone: string;
  mediaRelease: 'yes' | 'no';
  witnessName: string;
  submittedDate: string;
  pdfFile: File | null;
}

export default function PaperWaiverUploadForm() {
  const { user } = useAuth();
  const [formData, setFormData] = useState<FormData>({
    waiverType: 'passenger',
    firstName: '',
    lastName: '',
    town: '',
    representativeFirstName: '',
    representativeLastName: '',
    email: '',
    phone: '',
    mediaRelease: 'no',
    witnessName: '',
    submittedDate: new Date().toISOString().split('T')[0],
    pdfFile: null,
  });
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setFormData((prev) => ({ ...prev, pdfFile: file }));
      setError(null);
    } else {
      setError('Please select a valid PDF file');
      e.target.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.witnessName) {
      setError('Please fill in all required fields');
      return;
    }

    if (!formData.pdfFile) {
      setError('Please upload a PDF scan of the waiver');
      return;
    }

    if (formData.waiverType === 'representative' && (!formData.representativeFirstName || !formData.representativeLastName)) {
      setError('Representative name is required for representative waivers');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      await uploadPaperWaiver(formData, user!);
      setSuccess(true);
      // Reset form
      setFormData({
        waiverType: 'passenger',
        firstName: '',
        lastName: '',
        town: '',
        representativeFirstName: '',
        representativeLastName: '',
        email: '',
        phone: '',
        mediaRelease: 'no',
        witnessName: '',
        submittedDate: new Date().toISOString().split('T')[0],
        pdfFile: null,
      });
      // Reset file input
      const fileInput = document.getElementById('pdfFile') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.message || 'Failed to upload waiver. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  if (uploading) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <img 
              src="/android-chrome-512x512.png" 
              alt="Organization Logo" 
              className="w-12 h-12 object-contain"
            />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Upload Paper Waiver</h1>
              <p className="text-sm text-gray-600 mt-1">
                Signed in as {user?.email}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Form */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
            ✓ Waiver uploaded successfully!
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
          {/* Waiver Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Waiver Type *
            </label>
            <div className="space-y-2">
              <Radio
                id="passenger"
                name="waiverType"
                value="passenger"
                checked={formData.waiverType === 'passenger'}
                onChange={(e) => handleInputChange('waiverType', e.target.value as 'passenger' | 'representative')}
                label="Passenger (signing for themselves)"
              />
              <Radio
                id="representative"
                name="waiverType"
                value="representative"
                checked={formData.waiverType === 'representative'}
                onChange={(e) => handleInputChange('waiverType', e.target.value as 'passenger' | 'representative')}
                label="Representative (signing for someone else)"
              />
            </div>
          </div>

          {/* Passenger Information */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Passenger Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                type="text"
                label="First Name *"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                required
              />
              <Input
                type="text"
                label="Last Name *"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                required
              />
              <Input
                type="text"
                label="Town/City"
                value={formData.town}
                onChange={(e) => handleInputChange('town', e.target.value)}
              />
              <Input
                type="email"
                label="Email *"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                required
              />
              <Input
                type="tel"
                label="Phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
              />
            </div>
          </div>

          {/* Representative Information */}
          {formData.waiverType === 'representative' && (
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Representative Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  type="text"
                  label="Representative First Name *"
                  value={formData.representativeFirstName}
                  onChange={(e) => handleInputChange('representativeFirstName', e.target.value)}
                  required={formData.waiverType === 'representative'}
                />
                <Input
                  type="text"
                  label="Representative Last Name *"
                  value={formData.representativeLastName}
                  onChange={(e) => handleInputChange('representativeLastName', e.target.value)}
                  required={formData.waiverType === 'representative'}
                />
              </div>
            </div>
          )}

          {/* Additional Information */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h3>
            <div className="space-y-4">
              <Input
                type="text"
                label="Witness Name *"
                value={formData.witnessName}
                onChange={(e) => handleInputChange('witnessName', e.target.value)}
                required
              />
              <Input
                type="date"
                label="Submission Date *"
                value={formData.submittedDate}
                onChange={(e) => handleInputChange('submittedDate', e.target.value)}
                required
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Media Release Permission *
                </label>
                <div className="space-y-2">
                  <Radio
                    id="mediaYes"
                    name="mediaRelease"
                    value="yes"
                    checked={formData.mediaRelease === 'yes'}
                    onChange={(e) => handleInputChange('mediaRelease', e.target.value as 'yes' | 'no')}
                    label="Yes - Permission granted"
                  />
                  <Radio
                    id="mediaNo"
                    name="mediaRelease"
                    value="no"
                    checked={formData.mediaRelease === 'no'}
                    onChange={(e) => handleInputChange('mediaRelease', e.target.value as 'yes' | 'no')}
                    label="No - Permission not granted"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* PDF Upload */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload PDF Scan *</h3>
            <div>
              <input
                type="file"
                id="pdfFile"
                accept="application/pdf"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-lg file:border-0
                  file:text-sm file:font-semibold
                  file:bg-indigo-50 file:text-indigo-700
                  hover:file:bg-indigo-100
                  cursor-pointer"
                required
              />
              {formData.pdfFile && (
                <p className="mt-2 text-sm text-gray-600">
                  Selected: {formData.pdfFile.name} ({(formData.pdfFile.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="border-t pt-6">
            <Button type="submit" className="w-full" disabled={uploading}>
              {uploading ? 'Uploading...' : 'Upload Paper Waiver'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
