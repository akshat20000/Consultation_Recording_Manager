import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, AlertCircle, Eye, EyeOff } from 'lucide-react';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-screen items-center justify-center bg-slate-950 px-4 relative overflow-hidden font-sans">
      {/* Decorative cosmos glow */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full bg-astrology-600/10 blur-[120px]"></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-indigo-650/10 blur-[120px]"></div>

      <div className="w-full max-w-md glass-panel p-8 border-slate-800/80 bg-slate-900/40 relative z-10 shadow-2xl">
        <div className="flex flex-col items-center mb-8">
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-astrology-600 to-indigo-650 shadow-lg shadow-astrology-950/50 mb-4">
            <Sparkles className="h-8 w-8 text-accent-gold" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white m-0">AstroRecord</h1>
          <p className="text-xs text-slate-500 font-medium uppercase tracking-widest mt-1">Consultation Manager</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-450 p-4 rounded-xl flex items-center gap-3 animate-in fade-in">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span className="text-sm font-medium">{error}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Email Address
            </label>
            <div className="relative">
              
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="astro-input pl-11"
                placeholder="astrologer@example.com"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Password
            </label>
            <div className="relative">
              
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="astro-input pl-11 pr-11"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-3.5 text-slate-500 hover:text-slate-350"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full astro-button-primary py-3.5"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                Aligning stars...
              </span>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-slate-450 border-t border-slate-800/80 pt-6">
          New to AstroRecord?{' '}
          <Link to="/register" className="text-astrology-400 hover:text-astrology-300 font-semibold underline underline-offset-4">
            Create an Account
          </Link>
        </div>
      </div>
    </div>
  );
};
export default Login;
