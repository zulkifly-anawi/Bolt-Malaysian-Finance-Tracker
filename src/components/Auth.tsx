import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export const LoginPage = ({ onSwitchToSignup, onSwitchToReset }: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error } = await signIn(email, password);
    if (error) setError(error.message);
    setLoading(false);
  };

  return (
    <div className="min-h-screen gradient-mesh flex items-center justify-center p-4 relative overflow-hidden">
      <div className="glass-strong rounded-3xl w-full max-w-md p-8 liquid-shine glow floating">
        <div className="text-center mb-8 relative z-10">
          <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">Welcome Back</h1>
          <p className="text-white text-opacity-90">Log in to your finance tracker</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
          {error && <div className="glass-card border-red-300 text-white px-4 py-3 rounded-xl text-sm backdrop-blur-xl">{error}</div>}
          <div>
            <label className="block text-sm font-medium text-white text-opacity-95 mb-2">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 glass-card text-white placeholder-white placeholder-opacity-40 rounded-xl focus:ring-2 focus:ring-white focus:ring-opacity-40 outline-none transition-all"
              placeholder="your@email.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white text-opacity-95 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 glass-card text-white placeholder-white placeholder-opacity-40 rounded-xl focus:ring-2 focus:ring-white focus:ring-opacity-40 outline-none transition-all"
              placeholder="••••••••"
            />
          </div>
          <button type="button" onClick={onSwitchToReset} className="text-sm text-white text-opacity-90 hover:text-opacity-100 font-medium transition-all">
            Forgot password?
          </button>
          <button type="submit" disabled={loading} className="w-full glass-button text-white py-3 rounded-xl font-semibold disabled:opacity-50 shadow-lg">
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>
        <div className="mt-6 text-center relative z-10">
          <p className="text-white text-opacity-85">
            Don't have an account?{' '}
            <button onClick={onSwitchToSignup} className="text-white hover:text-opacity-100 font-semibold transition-all underline decoration-white decoration-opacity-50">
              Sign up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export const SignupPage = ({ onSwitchToLogin }: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    const { error } = await signUp(email, password, fullName);
    if (error) setError(error.message);
    else setSuccess(true);
    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen gradient-mesh flex items-center justify-center p-4 relative overflow-hidden">
        <div className="glass-strong rounded-3xl w-full max-w-md p-8 liquid-shine glow floating text-center">
          <div className="w-20 h-20 mx-auto mb-6 glass-card rounded-full flex items-center justify-center">
            <span className="text-4xl">✉️</span>
          </div>
          <h2 className="text-3xl font-bold text-white mb-3 drop-shadow-lg">Check Your Email</h2>
          <p className="text-white text-opacity-90 mb-6">We've sent you a confirmation email to verify your account.</p>
          <button onClick={onSwitchToLogin} className="glass-button text-white px-6 py-3 rounded-xl font-semibold shadow-lg">
            Return to login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-mesh flex items-center justify-center p-4 relative overflow-hidden">
      <div className="glass-strong rounded-3xl w-full max-w-md p-8 liquid-shine glow floating">
        <div className="text-center mb-8 relative z-10">
          <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">Create Account</h1>
          <p className="text-white text-opacity-90">Start tracking your financial goals</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          {error && <div className="glass-card border-red-300 text-white px-4 py-3 rounded-xl text-sm backdrop-blur-xl">{error}</div>}
          <div>
            <label className="block text-sm font-medium text-white text-opacity-95 mb-2">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-3 glass-card text-white placeholder-white placeholder-opacity-40 rounded-xl focus:ring-2 focus:ring-white focus:ring-opacity-40 outline-none transition-all"
              placeholder="Your name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white text-opacity-95 mb-2">Email Address *</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 glass-card text-white placeholder-white placeholder-opacity-40 rounded-xl focus:ring-2 focus:ring-white focus:ring-opacity-40 outline-none transition-all"
              placeholder="your@email.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white text-opacity-95 mb-2">Password *</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 glass-card text-white placeholder-white placeholder-opacity-40 rounded-xl focus:ring-2 focus:ring-white focus:ring-opacity-40 outline-none transition-all"
              placeholder="••••••••"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white text-opacity-95 mb-2">Confirm Password *</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-4 py-3 glass-card text-white placeholder-white placeholder-opacity-40 rounded-xl focus:ring-2 focus:ring-white focus:ring-opacity-40 outline-none transition-all"
              placeholder="••••••••"
            />
          </div>
          <button type="submit" disabled={loading} className="w-full glass-button text-white py-3 rounded-xl font-semibold disabled:opacity-50 shadow-lg mt-6">
            {loading ? 'Creating...' : 'Sign Up'}
          </button>
        </form>
        <div className="mt-6 text-center relative z-10">
          <p className="text-white text-opacity-85">
            Already have an account?{' '}
            <button onClick={onSwitchToLogin} className="text-white hover:text-opacity-100 font-semibold transition-all underline decoration-white decoration-opacity-50">
              Log in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export const ResetPasswordPage = ({ onBack }: any) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error } = await resetPassword(email);
    if (error) setError(error.message);
    else setSuccess(true);
    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen gradient-mesh flex items-center justify-center p-4 relative overflow-hidden">
        <div className="glass-strong rounded-3xl w-full max-w-md p-8 liquid-shine glow floating text-center">
          <div className="w-20 h-20 mx-auto mb-6 glass-card rounded-full flex items-center justify-center">
            <span className="text-4xl">✉️</span>
          </div>
          <h2 className="text-3xl font-bold text-white mb-3 drop-shadow-lg">Check Your Email</h2>
          <p className="text-white text-opacity-90 mb-6">We've sent you a password reset link.</p>
          <button onClick={onBack} className="glass-button text-white px-6 py-3 rounded-xl font-semibold shadow-lg">
            Return to login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-mesh flex items-center justify-center p-4 relative overflow-hidden">
      <div className="glass-strong rounded-3xl w-full max-w-md p-8 liquid-shine glow floating">
        <div className="text-center mb-8 relative z-10">
          <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">Reset Password</h1>
          <p className="text-white text-opacity-90">Enter your email to receive a reset link</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
          {error && <div className="glass-card border-red-300 text-white px-4 py-3 rounded-xl text-sm backdrop-blur-xl">{error}</div>}
          <div>
            <label className="block text-sm font-medium text-white text-opacity-95 mb-2">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 glass-card text-white placeholder-white placeholder-opacity-40 rounded-xl focus:ring-2 focus:ring-white focus:ring-opacity-40 outline-none transition-all"
              placeholder="your@email.com"
            />
          </div>
          <button type="submit" disabled={loading} className="w-full glass-button text-white py-3 rounded-xl font-semibold disabled:opacity-50 shadow-lg">
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>
        <div className="mt-6 text-center relative z-10">
          <button onClick={onBack} className="text-white text-opacity-90 hover:text-opacity-100 font-medium transition-all">
            Back to login
          </button>
        </div>
      </div>
    </div>
  );
};
