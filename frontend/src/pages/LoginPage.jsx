import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Logo from '../components/ui/Logo.jsx';
import LoadingSpinner from '../components/ui/LoadingSpinner.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, setError } = useAuth();
  const from = location.state?.from || '/dashboard';

  const [form, setForm] = useState({ identifier: '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLocalError('');
    setError(null);
    setSubmitting(true);

    try {
      await login(form);
      navigate(from, { replace: true });
    } catch (err) {
      setLocalError(err.message || 'Login failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-50 via-primary-50 to-surface-100 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Logo size="lg" linkTo="/" />
          </div>
          <h1 className="text-2xl font-bold text-surface-900">Welcome back</h1>
          <p className="text-sm text-surface-500 mt-1">
            Use your seeded PRN, roll number, employee ID, or admin email
          </p>
        </div>

        <div className="card p-8 shadow-card-hover">
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {localError && (
              <div
                className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700"
                role="alert"
              >
                {localError}
              </div>
            )}

            <div>
              <label htmlFor="identifier" className="label">
                Login ID
              </label>
              <input
                id="identifier"
                name="identifier"
                type="text"
                autoComplete="username"
                required
                className="input"
                value={form.identifier}
                onChange={handleChange}
                placeholder="PRN2026CE0001 or CE-FAC-001"
              />
            </div>

            <div>
              <label htmlFor="password" className="label">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="input"
                value={form.password}
                onChange={handleChange}
                placeholder="Enter your password"
              />
            </div>

            <button type="submit" className="btn-primary w-full py-2.5" disabled={submitting}>
              {submitting ? (
                <span className="inline-flex items-center gap-2">
                  <LoadingSpinner size="sm" />
                  Signing in...
                </span>
              ) : (
                'Sign in'
              )}
            </button>
          </form>
          <p className="text-center text-xs text-surface-500 mt-6">
            Accounts are managed from seeded Firestore data by campus staff.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
