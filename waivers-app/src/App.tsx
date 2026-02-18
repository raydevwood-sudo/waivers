import { useState } from 'react'
import Layout from './components/layout/Layout'
import WaiverForm from './components/form/WaiverForm'
import SuccessPage from './components/SuccessPage'
import Loader from './components/ui/Loader'
import { submitWaiver, isFirebaseConfigured } from './services/waiver.service'
import type { FormData, WaiverSubmission } from './types'

interface SubmissionErrorState {
  message: string
  supportEmailHref: string
}

function buildSupportEmailHref(formData: FormData, errorMessage: string): string {
  const supportEmail = import.meta.env.VITE_SUPPORT_EMAIL || 'info@cyclingwithoutagesociety.org'
  const occurredAt = new Date().toISOString()
  const subject = 'Waiver Submission Support Request'
  const body = [
    'Hello Support Team,',
    '',
    'A waiver submission failed. Please review the details below:',
    `- Timestamp: ${occurredAt}`,
    `- Waiver Type: ${formData.waiverType}`,
    `- Passenger Name: ${formData.firstName} ${formData.lastName}`,
    `- Contact Email: ${formData.email}`,
    `- Error: ${errorMessage}`,
    '',
    'Thank you.'
  ].join('\n')

  return `mailto:${supportEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}

function App() {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false)
  const [submissionData, setSubmissionData] = useState<WaiverSubmission | null>(null)
  const [submissionError, setSubmissionError] = useState<SubmissionErrorState | null>(null)

  const handleSubmit = async (formData: FormData): Promise<void> => {
    setIsSubmitting(true)
    setSubmissionError(null)
    try {
      // Check if Firebase is configured
      if (!isFirebaseConfigured()) {
        throw new Error('Firebase is not properly configured. Please check your environment variables.');
      }

      // Submit to Firestore
      const { docId, submission } = await submitWaiver(formData);
      console.log('Waiver submitted successfully with ID:', docId);
      
      setSubmissionData(submission);
      setIsSubmitted(true)
    } catch (error) {
      console.error('Submission failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Submission failed. Please try again later.';
      setSubmissionError({
        message: errorMessage,
        supportEmailHref: buildSupportEmailHref(formData, errorMessage),
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Layout>
      {isSubmitting && <Loader />}
      {isSubmitted && submissionData ? (
        <SuccessPage submission={submissionData} />
      ) : (
        <div className="w-full max-w-3xl mx-auto px-4 py-6 space-y-4">
          {submissionError && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4" role="alert" aria-live="assertive">
              <p className="text-sm font-semibold text-red-800">Submission failed</p>
              <p className="text-sm text-red-700 mt-1">{submissionError.message}</p>
              <a
                href={submissionError.supportEmailHref}
                className="inline-flex items-center mt-3 px-4 py-2 bg-white border border-red-300 text-red-700 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
              >
                Send Support Email
              </a>
            </div>
          )}
          <WaiverForm onSubmit={handleSubmit} />
        </div>
      )}
    </Layout>
  )
}

export default App
