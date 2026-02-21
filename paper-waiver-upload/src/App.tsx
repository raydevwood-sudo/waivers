import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './components/LoginPage';
import PaperWaiverUploadForm from './components/PaperWaiverUploadForm';
import Loader from './components/ui/Loader';

function AppContent() {
  const { user, loading, isAppEnabled } = useAuth();

  if (loading) {
    return <Loader />;
  }

  if (!user) {
    return <LoginPage />;
  }

  if (!isAppEnabled) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 max-w-md text-center">
          <h1 className="text-lg font-semibold text-yellow-900 mb-2">
            Paper Waiver Upload Currently Disabled
          </h1>
          <p className="text-sm text-yellow-800">
            This feature has been temporarily disabled. Please contact your administrator for more information.
          </p>
        </div>
      </div>
    );
  }

  return <PaperWaiverUploadForm />;
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;

