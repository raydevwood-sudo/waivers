import { useState } from 'react'
import Layout from './components/layout/Layout'
import WaiverForm from './components/form/WaiverForm'
import SuccessPage from './components/SuccessPage'
import Loader from './components/ui/Loader'
import { submitWaiver, isFirebaseConfigured } from './services/waiver.service'
import type { FormData } from './types'

function App() {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false)

  const handleSubmit = async (formData: FormData): Promise<void> => {
    setIsSubmitting(true)
    try {
      // Check if Firebase is configured
      if (!isFirebaseConfigured()) {
        throw new Error('Firebase is not properly configured. Please check your environment variables.');
      }

      // Submit to Firestore
      const documentId = await submitWaiver(formData);
      console.log('Waiver submitted successfully with ID:', documentId);
      
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
      {isSubmitted ? (
        <SuccessPage />
      ) : (
        <WaiverForm onSubmit={handleSubmit} />
      )}
    </Layout>
  )
}

export default App
