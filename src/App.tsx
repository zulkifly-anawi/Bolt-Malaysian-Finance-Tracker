import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginPage, SignupPage, ResetPasswordPage } from './components/Auth';
import { EnhancedDashboard } from './components/EnhancedDashboard';
import { LandingPage } from './components/LandingPage';
import { PrivacyPolicy } from './components/PrivacyPolicy';
import { AdminDashboard } from './components/admin/AdminDashboard';

type AuthView = 'landing' | 'login' | 'signup' | 'reset' | 'privacy';
type AppView = 'main' | 'admin';

function AppContent() {
  const { user, loading } = useAuth();
  const [authView, setAuthView] = useState<AuthView>('landing');
  const [appView, setAppView] = useState<AppView>('main');

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
    return (
      <div className="min-h-screen gradient-mesh">
        {authView === 'privacy' ? (
          <>
            <nav className="glass-strong shadow-2xl sticky top-0 z-50 backdrop-blur-xl">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                  <button
                    onClick={() => setAuthView('landing')}
                    className="text-xl font-bold text-white hover:text-opacity-80 transition-colors"
                  >
                    Malaysian Financial Tracker
                  </button>
                  <button
                    onClick={() => setAuthView('login')}
                    className="px-6 py-2 glass-button text-white rounded-xl font-semibold"
                  >
                    Sign In
                  </button>
                </div>
              </div>
            </nav>
            <PrivacyPolicy />
          </>
        ) : authView === 'signup' ? (
          <SignupPage onSwitchToLogin={() => setAuthView('login')} />
        ) : authView === 'reset' ? (
          <ResetPasswordPage onBack={() => setAuthView('login')} />
        ) : authView === 'login' ? (
          <LoginPage
            onSwitchToSignup={() => setAuthView('signup')}
            onSwitchToReset={() => setAuthView('reset')}
          />
        ) : (
          <>
            <nav className="glass-strong shadow-2xl sticky top-0 z-50 backdrop-blur-xl">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                  <div className="text-xl font-bold text-white">Malaysian Financial Tracker</div>
                  <button
                    onClick={() => setAuthView('login')}
                    className="px-6 py-2 glass-button text-white rounded-xl font-semibold"
                  >
                    Sign In
                  </button>
                </div>
              </div>
            </nav>
            <LandingPage onGetStarted={() => setAuthView('signup')} />
            <footer className="glass-strong mt-12 py-6">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-white text-opacity-70 text-sm">
                  <p>© 2025 Malaysian Financial Tracker</p>
                  <div className="flex gap-6">
                    <button
                      onClick={() => setAuthView('privacy')}
                      className="hover:text-white transition-colors"
                    >
                      Privacy Policy
                    </button>
                  </div>
                </div>
              </div>
            </footer>
          </>
        )}
      </div>
    );
  }

  if (appView === 'admin') {
    return <AdminDashboard onExitAdmin={() => setAppView('main')} />;
  }

  return <EnhancedDashboard onEnterAdmin={() => setAppView('admin')} />;
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
