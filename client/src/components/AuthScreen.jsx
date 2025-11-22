import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useAuth } from '../auth/AuthProvider.jsx';

const AuthInput = ({ label, type, value, onChange, required }) => (
  <label className="block text-left mb-4">
    <span className="text-sm font-medium text-slate-700">{label}</span>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-ocean-500 focus:border-transparent"
    />
  </label>
);

AuthInput.propTypes = {
  label: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  required: PropTypes.bool,
};

AuthInput.defaultProps = {
  required: false,
};

const AuthScreen = () => {
  const { login, register } = useAuth();
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      if (mode === 'login') {
        await login({ email, password });
      } else {
        await register({ name, email, password });
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Authentication failed';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white shadow-2xl rounded-xl p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">⚓</div>
          <h1 className="text-2xl font-bold text-navy-950">Harbor</h1>
          <p className="text-slate-600">
            {mode === 'login' ? 'Sign in to continue' : 'Create your account'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-2">
          {mode === 'register' && (
            <AuthInput label="Full Name" type="text" value={name} onChange={setName} required />
          )}
          <AuthInput label="Email" type="email" value={email} onChange={setEmail} required />
          <AuthInput label="Password" type="password" value={password} onChange={setPassword} required />

          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-2">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 rounded-md font-semibold text-white transition duration-150"
            style={{
              backgroundColor: '#1e6091',
              opacity: submitting ? 0.6 : 1,
            }}
          >
            {submitting ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="text-center mt-4 text-sm text-slate-600">
          {mode === 'login' ? (
            <span>
              Need an account?{' '}
              <button
                type="button"
                className="text-ocean-600 hover:underline"
                onClick={() => {
                  setMode('register');
                  setError('');
                }}
              >
                Register
              </button>
            </span>
          ) : (
            <span>
              Already have an account?{' '}
              <button
                type="button"
                className="text-ocean-600 hover:underline"
                onClick={() => {
                  setMode('login');
                  setError('');
                }}
              >
                Sign in
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;
