import { useState } from 'react';
import type { WaiverSubmission } from '../types';

interface SuccessPageProps {
  submission: WaiverSubmission;
}

export default function SuccessPage({ submission }: SuccessPageProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownloadPDF = async () => {
    setIsGenerating(true);
    try {
      const { downloadWaiverPDF } = await import('../services/pdf-generator.service');
      await downloadWaiverPDF(submission);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-12" role="main">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 sm:p-12 text-center space-y-6">
        <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center" role="img" aria-label="Success checkmark">
          <svg className="w-12 h-12 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Success!</h1>
          <p className="text-lg text-gray-600">
            Your waiver has been successfully submitted.
          </p>
        </div>
        
        <div className="pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            A confirmation email with a copy of your waiver has been sent to your email address.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
          <button
            onClick={handleDownloadPDF}
            disabled={isGenerating}
            className="px-6 py-3 bg-primary hover:bg-primary-hover text-white font-medium rounded-xl transition-colors duration-200 focus:outline-none focus:ring-4 focus:ring-primary/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            aria-label={isGenerating ? "Generating PDF" : "Download your waiver as PDF"}
          >
            {isGenerating ? (
              <>
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Generating PDF...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Download Waiver PDF</span>
              </>
            )}
          </button>

          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors duration-200 focus:outline-none focus:ring-4 focus:ring-gray-300/20"
            aria-label="Submit another waiver form"
          >
            Submit Another Waiver
          </button>
        </div>
      </div>
    </div>
  );
}
