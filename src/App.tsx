import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginPage, SignupPage, ResetPasswordPage } from './components/Auth';
import { EnhancedDashboard } from './components/EnhancedDashboard';

type AuthView = 'login' | 'signup' | 'reset';

function AppContent() {
  const { user, loading } = useAuth();
  const [authView, setAuthView] = useState<AuthView>('login');

  if (loading) {
    return (
      <div className="min-h-screen gradient-mesh flex items-center justify-center">
        <div className="glass-strong rounded-3xl p-8 glow">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    switch (authView) {
      case 'signup':
        return <SignupPage onSwitchToLogin={() => setAuthView('login')} />;
      case 'reset':
        return <ResetPasswordPage onBack={() => setAuthView('login')} />;
      default:
        return (
          <LoginPage
            onSwitchToSignup={() => setAuthView('signup')}
            onSwitchToReset={() => setAuthView('reset')}
          />
        );
    }
  }

  return <EnhancedDashboard />;
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
