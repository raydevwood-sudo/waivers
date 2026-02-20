import { useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './components/LoginPage';
import WaiverListPage from './components/WaiverListPage';
import Loader from './components/ui/Loader';
import { ensureWaiverSettingsDocument } from './services/settings.service';

function AppContent() {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!user) {
      return;
    }

    ensureWaiverSettingsDocument().catch((error) => {
      console.error('Failed to initialize waiver settings document:', error);
    });
  }, [user]);

  if (loading) {
    return <Loader />;
  }

  return user ? <WaiverListPage /> : <LoginPage />;
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;

