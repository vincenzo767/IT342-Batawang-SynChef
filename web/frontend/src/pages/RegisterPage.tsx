import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setAuthResponse, setLoading, setError } from '../store/authSlice';
import authAPI from '../services/authAPI';
import { RootState } from '../store';
import './RegisterPage.css';

const RegisterPage: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [country, setCountry] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [localError, setLocalError] = useState('');
  const [localInfo, setLocalInfo] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, isLoading } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!fullName.trim()) errors.fullName = 'Full name is required';

    if (!email) errors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Invalid email format';

    if (!password) errors.password = 'Password is required';
    else if (password.length < 8) errors.password = 'Password must be at least 8 characters long';

    if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    if (!country) {
      errors.country = 'Please select your country';
    }

    if (!agreedToTerms) {
      errors.terms = 'You must agree to the terms to continue';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const generateUsername = () => {
    const emailPrefix = email.split('@')[0] || '';
    const fullNameFallback = fullName.trim().toLowerCase().replaceAll(/\s+/g, '');
    const base = (emailPrefix || fullNameFallback || 'chef')
      .toLowerCase()
      .replaceAll(/[^a-z0-9]/g, '')
      .slice(0, 12);
    const suffix = Math.floor(1000 + Math.random() * 9000).toString();
    return `${base}${suffix}`;
  };

  const clearFieldError = (name: string) => {
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    setLocalInfo('');

    if (!validateForm()) {
      return;
    }

    dispatch(setLoading(true));

    try {
      const generatedUsername = generateUsername();

      const response = await authAPI.register({
        email,
        username: generatedUsername,
        fullName,
        password,
        confirmPassword,
      });

      localStorage.setItem('userCountry', country);

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
        || (err.request ? 'Cannot reach backend API. Start backend server on http://localhost:8080.' : 'Registration failed. Please try again.');
      setLocalError(message);
      dispatch(setError(message));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleTermsClick = (target: 'terms' | 'privacy') => {
    setLocalError('');
    setLocalInfo(`${target === 'terms' ? 'Terms of Service' : 'Privacy Policy'} page is not available yet.`);
  };

  const handleSocialSignupClick = (provider: 'Google' | 'Facebook') => {
    setLocalError('');
    setLocalInfo(`${provider} sign up is not available yet.`);
  };

  return (
    <div className="register-page-shell">
      <div className="register-card">
        <div className="register-header">
          <h1>Create Account</h1>
          <p>Join our culinary community</p>
        </div>

        {localError && <div className="register-alert register-alert-error">{localError}</div>}
        {localInfo && <div className="register-alert register-alert-info">{localInfo}</div>}

        <form onSubmit={handleRegister} className="register-form" noValidate>
          <div className="register-field">
            <label htmlFor="fullName">Full Name</label>
            <input
              id="fullName"
              type="text"
              placeholder="John Doe"
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                clearFieldError('fullName');
              }}
              autoComplete="name"
              required
            />
            {validationErrors.fullName && <span className="field-error">{validationErrors.fullName}</span>}
          </div>

          <div className="register-field">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                clearFieldError('email');
              }}
              autoComplete="email"
              required
            />
            {validationErrors.email && <span className="field-error">{validationErrors.email}</span>}
          </div>

          <div className="register-field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="At least 8 characters"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                clearFieldError('password');
              }}
              autoComplete="new-password"
              minLength={8}
              required
            />
            <p className="password-hint">Must be at least 8 characters long</p>
            {validationErrors.password && <span className="field-error">{validationErrors.password}</span>}
          </div>

          <div className="register-field">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                clearFieldError('confirmPassword');
              }}
              autoComplete="new-password"
              minLength={8}
              required
            />
            {validationErrors.confirmPassword && <span className="field-error">{validationErrors.confirmPassword}</span>}
          </div>

          <div className="register-field">
            <label htmlFor="country">Country</label>
            <select
              id="country"
              value={country}
              onChange={(e) => {
                setCountry(e.target.value);
                clearFieldError('country');
              }}
              required
            >
              <option value="">Select your country</option>
              <option value="us">United States</option>
              <option value="uk">United Kingdom</option>
              <option value="ca">Canada</option>
              <option value="au">Australia</option>
              <option value="de">Germany</option>
              <option value="fr">France</option>
              <option value="it">Italy</option>
              <option value="es">Spain</option>
              <option value="jp">Japan</option>
              <option value="cn">China</option>
              <option value="in">India</option>
              <option value="br">Brazil</option>
              <option value="mx">Mexico</option>
              <option value="other">Other</option>
            </select>
            {validationErrors.country && <span className="field-error">{validationErrors.country}</span>}
          </div>

          <div className="terms-row">
            <label className="terms-control" htmlFor="terms">
              <input
                id="terms"
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => {
                  setAgreedToTerms(e.target.checked);
                  clearFieldError('terms');
                }}
                required
              />
              <span>
                I agree to the{' '}
                <button type="button" className="inline-link-btn" onClick={() => handleTermsClick('terms')}>Terms of Service</button>{' '}
                and{' '}
                <button type="button" className="inline-link-btn" onClick={() => handleTermsClick('privacy')}>Privacy Policy</button>
              </span>
            </label>
          </div>
          {validationErrors.terms && <span className="field-error terms-error">{validationErrors.terms}</span>}

          <button type="submit" className="register-submit-btn" disabled={isLoading}>
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="signin-row">
          <p>
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>

        <div className="social-signup-divider">
          <span>Or sign up with</span>
        </div>

        <div className="social-signup-grid">
          <button type="button" className="social-btn" onClick={() => handleSocialSignupClick('Google')}>
            <svg className="social-icon" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a6.99 6.99 0 0 1-2.21 3.31v2.77h3.57a11.95 11.95 0 0 0 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77a6.56 6.56 0 0 1-3.71 1.06c-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11.99 11.99 0 0 0 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09a7.03 7.03 0 0 1 0-4.18V7.07H2.18A11.99 11.99 0 0 0 1 12c0 1.78.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15A11.95 11.95 0 0 0 12 1 11.99 11.99 0 0 0 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            <span>Google</span>
          </button>

          <button type="button" className="social-btn" onClick={() => handleSocialSignupClick('Facebook')}>
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

export default RegisterPage;
