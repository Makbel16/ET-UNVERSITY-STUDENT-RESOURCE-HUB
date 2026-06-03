import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { School, AlertCircle, Sparkles } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('student@ethiostudyhub.com');
  const [password, setPassword] = useState('studentpassword123');
  const [errorMsg, setErrorMsg] = useState('');
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleDemoFill = (role) => {
    if (role === 'admin') {
      setEmail('admin@ethiostudyhub.com');
      setPassword('adminpassword123');
    } else {
      setEmail('student@ethiostudyhub.com');
      setPassword('studentpassword123');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setErrorMsg(err.message || 'Invalid credentials');
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 shadow-md">
            <School className="h-7 w-7 text-white" />
          </div>
        </div>
        <h2 className="mt-6 text-center font-display text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600 dark:text-slate-400">
          Or{' '}
          <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400">
            register a new student profile
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="glass-panel py-8 px-4 shadow-xl rounded-2xl sm:px-10">
          
          {errorMsg && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/20 dark:text-red-400">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 shadow-xs focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 shadow-xs focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="flex w-full justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-blue-500 focus:outline-none disabled:opacity-50"
              >
                {loading ? 'Authenticating...' : 'Sign In'}
              </button>
            </div>
          </form>

          {/* Quick login helpers */}
          <div className="mt-8 border-t border-slate-200 pt-6 dark:border-slate-800">
            <h4 className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              Quick Demo Logins
            </h4>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => handleDemoFill('student')}
                className="flex-1 rounded-lg border border-slate-200 py-1.5 text-xs font-medium hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800 dark:text-white"
              >
                Student Demo
              </button>
              <button
                type="button"
                onClick={() => handleDemoFill('admin')}
                className="flex-1 rounded-lg border border-slate-200 py-1.5 text-xs font-medium hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800 dark:text-white"
              >
                Admin Demo
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Login;
