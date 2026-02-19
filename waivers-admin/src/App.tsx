import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './components/LoginPage';
import WaiverListPage from './components/WaiverListPage';
import Loader from './components/ui/Loader';

function AppContent() {
  const { user, loading } = useAuth();

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

