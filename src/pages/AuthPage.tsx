import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Navbar } from '../components';
import { authService } from '../services/auth';
import type { SignupClientPayload, LoginPayload } from '../services/auth';
import { useAuth } from '../context/AuthContext';
import './AuthPage.css';

type Tab = 'signup' | 'login';

export const AuthPage = () => {
  const [tab, setTab] = useState<Tab>('signup');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login: setAuthUser } = useAuth();

  // Signup form
  const [signupData, setSignupData] = useState<SignupClientPayload>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });
  const [acceptTerms, setAcceptTerms] = useState(false);

  // Login form
  const [loginData, setLoginData] = useState<LoginPayload>({
    email: '',
    password: '',
  });

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!acceptTerms) {
      setError('You must accept the terms and conditions');
      return;
    }

    setLoading(true);
    try {
      const response = await authService.signupClient(signupData);
      if (response.error) {
        setError(response.error.message);
        return;
      }

      setAuthUser(response.data);
      
      // Redirect to intended page or home
      const redirect = searchParams.get('redirect');
      navigate(redirect || '/');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authService.login(loginData);
      if (response.error) {
        setError(response.error.message);
        return;
      }

      setAuthUser(response.data);

      // Redirect to intended page or home
      const redirect = searchParams.get('redirect');
      
      // Check if trying to access vendor-only route
      if (redirect?.includes('add-service') && response.data.role !== 'vendor') {
        alert('Only vendors can add services. Please apply to become a vendor.');
        navigate('/');
        return;
      }

      navigate(redirect || '/');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <Navbar />
      
      <div className="auth-container">
        <div className="auth-box">
          <div className="auth-tabs">
            <button
              className={`auth-tab ${tab === 'signup' ? 'active' : ''}`}
              onClick={() => { setTab('signup'); setError(''); }}
            >
              Sign up
            </button>
            <button
              className={`auth-tab ${tab === 'login' ? 'active' : ''}`}
              onClick={() => { setTab('login'); setError(''); }}
            >
              Log in
            </button>
          </div>

          {error && (
            <div className="auth-error">
              {error}
            </div>
          )}

          {tab === 'signup' ? (
            <form onSubmit={handleSignup} className="auth-form">
              <div className="form-group">
                <label className="label">User Type</label>
                <select className="input" disabled value="client">
                  <option value="client">Client</option>
                </select>
                <p className="form-hint">
                  Vendors must <a href="/apply-as-vendor">apply separately</a>
                </p>
              </div>

              <div className="form-group">
                <label className="label">Email *</label>
                <input
                  type="email"
                  className="input"
                  value={signupData.email}
                  onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="label">First Name *</label>
                  <input
                    type="text"
                    className="input"
                    value={signupData.firstName}
                    onChange={(e) => setSignupData({ ...signupData, firstName: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="label">Last Name *</label>
                  <input
                    type="text"
                    className="input"
                    value={signupData.lastName}
                    onChange={(e) => setSignupData({ ...signupData, lastName: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="label">Password *</label>
                <input
                  type="password"
                  className="input"
                  value={signupData.password}
                  onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                  required
                  minLength={6}
                />
              </div>

              <div className="form-checkbox">
                <input
                  type="checkbox"
                  id="terms"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                />
                <label htmlFor="terms">
                  I accept the <a href="/terms">terms and conditions</a>
                </label>
              </div>

              <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
                {loading ? 'Signing up...' : 'Sign up'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleLogin} className="auth-form">
              <div className="form-group">
                <label className="label">Email *</label>
                <input
                  type="email"
                  className="input"
                  value={loginData.email}
                  onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="label">Password *</label>
                <input
                  type="password"
                  className="input"
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  required
                />
              </div>

              <div className="form-link">
                <a href="/forgot-password">Forgot password?</a>
              </div>

              <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
                {loading ? 'Logging in...' : 'Log in'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
