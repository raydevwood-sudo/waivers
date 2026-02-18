import { useState } from 'react'
import Layout from './components/layout/Layout'
import WaiverForm from './components/form/WaiverForm'
import SuccessPage from './components/SuccessPage'
import Loader from './components/ui/Loader'
import { submitWaiver, isFirebaseConfigured } from './services/waiver.service'
import type { FormData, WaiverSubmission } from './types'

function App() {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false)
  const [submissionData, setSubmissionData] = useState<WaiverSubmission | null>(null)

  const handleSubmit = async (formData: FormData): Promise<void> => {
    setIsSubmitting(true)
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
      alert(errorMessage);
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
        <WaiverForm onSubmit={handleSubmit} />
      )}
    </Layout>
  )
}

export default App
