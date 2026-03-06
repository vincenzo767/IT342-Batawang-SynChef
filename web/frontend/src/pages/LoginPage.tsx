import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setAuthResponse, setLoading, setError } from '../store/authSlice';
import authAPI from '../services/authAPI';
import { RootState } from '../store';
import './LoginPage.css';

const LoginPage: React.FC = () => {
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [localError, setLocalError] = useState('');
  const [localInfo, setLocalInfo] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, isLoading } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberedLoginEmail');
    if (rememberedEmail) {
      setEmailOrUsername(rememberedEmail);
      setRememberMe(true);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    setLocalInfo('');
    dispatch(setLoading(true));

    try {
      if (rememberMe) {
        localStorage.setItem('rememberedLoginEmail', emailOrUsername);
      } else {
        localStorage.removeItem('rememberedLoginEmail');
      }

      const response = await authAPI.login({
        emailOrUsername,
        password,
      });

      dispatch(setAuthResponse({
        token: response.data.token,
        user: {
          id: response.data.id,
          email: response.data.email,
          username: response.data.username,
          fullName: response.data.fullName,
          profileImageUrl: response.data.profileImageUrl,
          emailVerified: response.data.emailVerified,
        }
      }));

      navigate('/dashboard');
    } catch (err: any) {
      const message = err.response?.data?.message
        || (err.request ? 'Cannot reach backend API. Start backend server on http://localhost:8080.' : 'Login failed. Please check your credentials.');
      setLocalError(message);
      dispatch(setError(message));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleForgotPassword = () => {
    setLocalError('');
    setLocalInfo('Forgot password is not available yet. Please contact support.');
  };

  const handleSocialLoginClick = (provider: 'Google' | 'Facebook') => {
    setLocalError('');
    setLocalInfo(`${provider} login is not available yet.`);
  };

  return (
    <div className="login-page-shell">
      <div className="login-card">
        <div className="login-header">
          <h1>Recipe Discovery</h1>
          <p>Explore Global Culinary Traditions</p>
        </div>

        {localError && <div className="login-alert login-alert-error">{localError}</div>}
        {localInfo && <div className="login-alert login-alert-info">{localInfo}</div>}

        <form onSubmit={handleLogin} className="login-form" noValidate>
          <div className="login-field">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={emailOrUsername}
              onChange={(e) => setEmailOrUsername(e.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <div className="login-field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          <div className="login-row">
            <label className="remember-me-control" htmlFor="rememberMe">
              <input
                id="rememberMe"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span>Remember me</span>
            </label>
            <button type="button" className="forgot-password-btn" onClick={handleForgotPassword}>Forgot password?</button>
          </div>

          <button type="submit" className="login-submit-btn" disabled={isLoading}>
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="signup-row">
          <p>
            Don&apos;t have an account?{' '}
            <Link to="/register">Sign up</Link>
          </p>
        </div>

        <div className="social-login-divider">
          <span>Or continue with</span>
        </div>

        <div className="social-login-grid">
          <button type="button" className="social-btn" onClick={() => handleSocialLoginClick('Google')}>
            <svg className="social-icon" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a6.99 6.99 0 0 1-2.21 3.31v2.77h3.57a11.95 11.95 0 0 0 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77a6.56 6.56 0 0 1-3.71 1.06c-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11.99 11.99 0 0 0 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09a7.03 7.03 0 0 1 0-4.18V7.07H2.18A11.99 11.99 0 0 0 1 12c0 1.78.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15A11.95 11.95 0 0 0 12 1 11.99 11.99 0 0 0 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            <span>Google</span>
          </button>

          <button type="button" className="social-btn" onClick={() => handleSocialLoginClick('Facebook')}>
            <svg className="social-icon" fill="#1877F2" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M24 12.073C24 5.446 18.627.073 12 .073S0 5.446 0 12.073c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            <span>Facebook</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
