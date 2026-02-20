import { useState } from 'react'
import Layout from './components/layout/Layout'
import WaiverForm from './components/form/WaiverForm'
import SuccessPage from './components/SuccessPage'
import Loader from './components/ui/Loader'
import { TemplateProvider, useTemplates } from './context/TemplateContext'
import { submitWaiver, isFirebaseConfigured } from './services/waiver.service'
import type { FormData, WaiverSubmission } from './types'

interface SubmissionErrorState {
  message: string
  supportEmailHref: string
  supportGmailHref: string
}

function buildSupportLinks(formData: FormData, errorMessage: string): {
  supportEmailHref: string
  supportGmailHref: string
} {
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

  const encodedSubject = encodeURIComponent(subject)
  const encodedBody = encodeURIComponent(body)

  return {
    supportEmailHref: `mailto:${supportEmail}?subject=${encodedSubject}&body=${encodedBody}`,
    supportGmailHref: `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(supportEmail)}&su=${encodedSubject}&body=${encodedBody}`,
  }
}

function App() {
  return (
    <TemplateProvider>
      <AppContent />
    </TemplateProvider>
  )
}

function AppContent() {
  const { passengerTemplate, representativeTemplate } = useTemplates();
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

      // Get the appropriate template based on waiver type
      const templateRecord = formData.waiverType === 'passenger' ? passengerTemplate : representativeTemplate;
      if (!templateRecord) {
        throw new Error('Template not loaded. Please try again.');
      }

      // Extract only the fields needed for PDF generation (avoid Firestore timestamps)
      const template = {
        title: templateRecord.title,
        waiverType: templateRecord.waiverType,
        version: templateRecord.version,
        effectiveDate: templateRecord.effectiveDate,
        blocks: templateRecord.blocks,
      };

      // Submit to Firestore with template data
      const { docId, submission } = await submitWaiver(formData, template);
      console.log('Waiver submitted successfully with ID:', docId);
      
      setSubmissionData(submission);
      setIsSubmitted(true)
    } catch (error) {
      console.error('Submission failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Submission failed. Please try again later.';
      const supportLinks = buildSupportLinks(formData, errorMessage)
      setSubmissionError({
        message: errorMessage,
        supportEmailHref: supportLinks.supportEmailHref,
        supportGmailHref: supportLinks.supportGmailHref,
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
                href={submissionError.supportGmailHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center mt-3 px-4 py-2 bg-white border border-red-300 text-red-700 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
              >
                Send Support Email
              </a>
              <p className="text-xs text-red-600 mt-2">
                If this does not open your email, use this link: <a className="underline" href={submissionError.supportEmailHref}>mailto</a>
              </p>
            </div>
          )}
          <WaiverForm onSubmit={handleSubmit} />
        </div>
      )}
    </Layout>
  )
}

export default App
