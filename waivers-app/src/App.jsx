import { useState } from 'react'
import Layout from './components/layout/Layout'
import WaiverForm from './components/form/WaiverForm'
import SuccessPage from './components/SuccessPage'
import Loader from './components/ui/Loader'

function App() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (formData) => {
    setIsSubmitting(true)
    try {
      // TODO: Submit to Firebase Function
      console.log('Form data:', formData)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setIsSubmitted(true)
    } catch (error) {
      console.error('Submission failed:', error)
      alert('Submission failed. Please try again later.')
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
