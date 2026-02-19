import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './components/LoginPage';
import PaperWaiverUploadForm from './components/PaperWaiverUploadForm';
import Loader from './components/ui/Loader';

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loader />;
  }

  return user ? <PaperWaiverUploadForm /> : <LoginPage />;
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;

