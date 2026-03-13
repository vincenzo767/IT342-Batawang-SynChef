import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { setAuthResponse, setLoading, setError } from "../store/authSlice";
import authAPI from "../services/authAPI";
import "./RegisterPage.css";

// Complete world country list (ISO 3166-1)
const WORLD_COUNTRIES = [
  { code: "AF", name: "Afghanistan" }, { code: "AL", name: "Albania" }, { code: "DZ", name: "Algeria" },
  { code: "AD", name: "Andorra" }, { code: "AO", name: "Angola" }, { code: "AG", name: "Antigua and Barbuda" },
  { code: "AR", name: "Argentina" }, { code: "AM", name: "Armenia" }, { code: "AU", name: "Australia" },
  { code: "AT", name: "Austria" }, { code: "AZ", name: "Azerbaijan" }, { code: "BS", name: "Bahamas" },
  { code: "BH", name: "Bahrain" }, { code: "BD", name: "Bangladesh" }, { code: "BB", name: "Barbados" },
  { code: "BY", name: "Belarus" }, { code: "BE", name: "Belgium" }, { code: "BZ", name: "Belize" },
  { code: "BJ", name: "Benin" }, { code: "BT", name: "Bhutan" }, { code: "BO", name: "Bolivia" },
  { code: "BA", name: "Bosnia and Herzegovina" }, { code: "BW", name: "Botswana" }, { code: "BR", name: "Brazil" },
  { code: "BN", name: "Brunei" }, { code: "BG", name: "Bulgaria" }, { code: "BF", name: "Burkina Faso" },
  { code: "BI", name: "Burundi" }, { code: "CV", name: "Cabo Verde" }, { code: "KH", name: "Cambodia" },
  { code: "CM", name: "Cameroon" }, { code: "CA", name: "Canada" }, { code: "CF", name: "Central African Republic" },
  { code: "TD", name: "Chad" }, { code: "CL", name: "Chile" }, { code: "CN", name: "China" },
  { code: "CO", name: "Colombia" }, { code: "KM", name: "Comoros" }, { code: "CG", name: "Congo" },
  { code: "CD", name: "Congo (DRC)" }, { code: "CR", name: "Costa Rica" }, { code: "HR", name: "Croatia" },
  { code: "CU", name: "Cuba" }, { code: "CY", name: "Cyprus" }, { code: "CZ", name: "Czech Republic" },
  { code: "DK", name: "Denmark" }, { code: "DJ", name: "Djibouti" }, { code: "DM", name: "Dominica" },
  { code: "DO", name: "Dominican Republic" }, { code: "EC", name: "Ecuador" }, { code: "EG", name: "Egypt" },
  { code: "SV", name: "El Salvador" }, { code: "GQ", name: "Equatorial Guinea" }, { code: "ER", name: "Eritrea" },
  { code: "EE", name: "Estonia" }, { code: "SZ", name: "Eswatini" }, { code: "ET", name: "Ethiopia" },
  { code: "FJ", name: "Fiji" }, { code: "FI", name: "Finland" }, { code: "FR", name: "France" },
  { code: "GA", name: "Gabon" }, { code: "GM", name: "Gambia" }, { code: "GE", name: "Georgia" },
  { code: "DE", name: "Germany" }, { code: "GH", name: "Ghana" }, { code: "GR", name: "Greece" },
  { code: "GD", name: "Grenada" }, { code: "GT", name: "Guatemala" }, { code: "GN", name: "Guinea" },
  { code: "GW", name: "Guinea-Bissau" }, { code: "GY", name: "Guyana" }, { code: "HT", name: "Haiti" },
  { code: "HN", name: "Honduras" }, { code: "HU", name: "Hungary" }, { code: "IS", name: "Iceland" },
  { code: "IN", name: "India" }, { code: "ID", name: "Indonesia" }, { code: "IR", name: "Iran" },
  { code: "IQ", name: "Iraq" }, { code: "IE", name: "Ireland" }, { code: "IL", name: "Israel" },
  { code: "IT", name: "Italy" }, { code: "JM", name: "Jamaica" }, { code: "JP", name: "Japan" },
  { code: "JO", name: "Jordan" }, { code: "KZ", name: "Kazakhstan" }, { code: "KE", name: "Kenya" },
  { code: "KI", name: "Kiribati" }, { code: "KP", name: "North Korea" }, { code: "KR", name: "South Korea" },
  { code: "KW", name: "Kuwait" }, { code: "KG", name: "Kyrgyzstan" }, { code: "LA", name: "Laos" },
  { code: "LV", name: "Latvia" }, { code: "LB", name: "Lebanon" }, { code: "LS", name: "Lesotho" },
  { code: "LR", name: "Liberia" }, { code: "LY", name: "Libya" }, { code: "LI", name: "Liechtenstein" },
  { code: "LT", name: "Lithuania" }, { code: "LU", name: "Luxembourg" }, { code: "MG", name: "Madagascar" },
  { code: "MW", name: "Malawi" }, { code: "MY", name: "Malaysia" }, { code: "MV", name: "Maldives" },
  { code: "ML", name: "Mali" }, { code: "MT", name: "Malta" }, { code: "MH", name: "Marshall Islands" },
  { code: "MR", name: "Mauritania" }, { code: "MU", name: "Mauritius" }, { code: "MX", name: "Mexico" },
  { code: "FM", name: "Micronesia" }, { code: "MD", name: "Moldova" }, { code: "MC", name: "Monaco" },
  { code: "MN", name: "Mongolia" }, { code: "ME", name: "Montenegro" }, { code: "MA", name: "Morocco" },
  { code: "MZ", name: "Mozambique" }, { code: "MM", name: "Myanmar" }, { code: "NA", name: "Namibia" },
  { code: "NR", name: "Nauru" }, { code: "NP", name: "Nepal" }, { code: "NL", name: "Netherlands" },
  { code: "NZ", name: "New Zealand" }, { code: "NI", name: "Nicaragua" }, { code: "NE", name: "Niger" },
  { code: "NG", name: "Nigeria" }, { code: "MK", name: "North Macedonia" }, { code: "NO", name: "Norway" },
  { code: "OM", name: "Oman" }, { code: "PK", name: "Pakistan" }, { code: "PW", name: "Palau" },
  { code: "PA", name: "Panama" }, { code: "PG", name: "Papua New Guinea" }, { code: "PY", name: "Paraguay" },
  { code: "PE", name: "Peru" }, { code: "PH", name: "Philippines" }, { code: "PL", name: "Poland" },
  { code: "PT", name: "Portugal" }, { code: "QA", name: "Qatar" }, { code: "RO", name: "Romania" },
  { code: "RU", name: "Russia" }, { code: "RW", name: "Rwanda" }, { code: "KN", name: "Saint Kitts and Nevis" },
  { code: "LC", name: "Saint Lucia" }, { code: "VC", name: "Saint Vincent and the Grenadines" },
  { code: "WS", name: "Samoa" }, { code: "SM", name: "San Marino" }, { code: "ST", name: "São Tomé and Príncipe" },
  { code: "SA", name: "Saudi Arabia" }, { code: "SN", name: "Senegal" }, { code: "RS", name: "Serbia" },
  { code: "SC", name: "Seychelles" }, { code: "SL", name: "Sierra Leone" }, { code: "SG", name: "Singapore" },
  { code: "SK", name: "Slovakia" }, { code: "SI", name: "Slovenia" }, { code: "SB", name: "Solomon Islands" },
  { code: "SO", name: "Somalia" }, { code: "ZA", name: "South Africa" }, { code: "SS", name: "South Sudan" },
  { code: "ES", name: "Spain" }, { code: "LK", name: "Sri Lanka" }, { code: "SD", name: "Sudan" },
  { code: "SR", name: "Suriname" }, { code: "SE", name: "Sweden" }, { code: "CH", name: "Switzerland" },
  { code: "SY", name: "Syria" }, { code: "TW", name: "Taiwan" }, { code: "TJ", name: "Tajikistan" },
  { code: "TZ", name: "Tanzania" }, { code: "TH", name: "Thailand" }, { code: "TL", name: "Timor-Leste" },
  { code: "TG", name: "Togo" }, { code: "TO", name: "Tonga" }, { code: "TT", name: "Trinidad and Tobago" },
  { code: "TN", name: "Tunisia" }, { code: "TR", name: "Turkey" }, { code: "TM", name: "Turkmenistan" },
  { code: "TV", name: "Tuvalu" }, { code: "UG", name: "Uganda" }, { code: "UA", name: "Ukraine" },
  { code: "AE", name: "United Arab Emirates" }, { code: "GB", name: "United Kingdom" },
  { code: "US", name: "United States" }, { code: "UY", name: "Uruguay" }, { code: "UZ", name: "Uzbekistan" },
  { code: "VU", name: "Vanuatu" }, { code: "VE", name: "Venezuela" }, { code: "VN", name: "Vietnam" },
  { code: "YE", name: "Yemen" }, { code: "ZM", name: "Zambia" }, { code: "ZW", name: "Zimbabwe" }
];

const RegisterPage = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [countryCode, setCountryCode] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [localError, setLocalError] = useState("");
  const [localInfo, setLocalInfo] = useState("");
  const [validationErrors, setValidationErrors] = useState({});
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, isLoading } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) navigate("/dashboard", { replace: true });
  }, [isAuthenticated, navigate]);

  const validateForm = () => {
    const errors = {};
    if (!fullName.trim()) errors.fullName = "Full name is required";
    if (!email) errors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Invalid email format";
    if (!password) errors.password = "Password is required";
    else if (password.length < 8) errors.password = "Password must be at least 8 characters long";
    if (password !== confirmPassword) errors.confirmPassword = "Passwords do not match";
    if (!countryCode) errors.country = "Please select your country";
    if (!agreedToTerms) errors.terms = "You must agree to the terms to continue";
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const generateUsername = () => {
    const base = (email.split("@")[0] || fullName.trim().toLowerCase().replace(/\s+/g, ""))
      .toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 12) || "chef";
    return `${base}${Math.floor(1000 + Math.random() * 9000)}`;
  };

  const clearFieldError = (name) => {
    if (validationErrors[name]) setValidationErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLocalError("");
    setLocalInfo("");
    if (!validateForm()) return;
    dispatch(setLoading(true));
    try {
      const selectedCountry = WORLD_COUNTRIES.find((c) => c.code === countryCode);
      const response = await authAPI.register({
        email,
        username: generateUsername(),
        fullName,
        password,
        confirmPassword,
        countryCode,
        countryName: selectedCountry?.name || countryCode
      });
      // setAuthResponse now reads countryCode/countryName/favoriteRecipeIds from backend response
      dispatch(setAuthResponse({
        token: response.data.token,
        user: {
          id: response.data.id,
          email: response.data.email,
          username: response.data.username,
          fullName: response.data.fullName,
          profileImageUrl: response.data.profileImageUrl,
          emailVerified: response.data.emailVerified,
          countryCode: response.data.countryCode || countryCode,
          countryName: response.data.countryName || selectedCountry?.name || countryCode,
          favoriteRecipeIds: response.data.favoriteRecipeIds || []
        }
      }));
      navigate("/dashboard");
    } catch (err) {
      const message = err.response?.data?.message ||
        (err.request
          ? "Cannot reach backend API. Start the backend server on http://localhost:8080."
          : "Registration failed. Please try again.");
      setLocalError(message);
      dispatch(setError(message));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleTermsClick = (target) => {
    setLocalError("");
    setLocalInfo(`${target === "terms" ? "Terms of Service" : "Privacy Policy"} page is not available yet.`);
  };

  const handleSocialSignupClick = (provider) => {
    setLocalError("");
    setLocalInfo(`${provider} sign up is not available yet.`);
  };

  return (
    <div className="register-page-shell">
      <motion.div
        className="auth-layout"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -14 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <section className="auth-brand-panel">
          <img src="/synchef-logo.png" alt="SynChef" className="auth-brand-logo" />
          <h1 className="auth-brand-title">Discover <span>Global</span> Flavors</h1>
          <p className="auth-brand-subtitle">
            Explore authentic recipes from around the world, powered by AI-driven recommendations tailored to your taste.
          </p>
        </section>

        <section className="register-card">
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
                id="fullName" type="text" placeholder="John Doe" value={fullName}
                onChange={(e) => { setFullName(e.target.value); clearFieldError("fullName"); }}
                autoComplete="name" required
              />
              {validationErrors.fullName && <span className="field-error">{validationErrors.fullName}</span>}
            </div>

            <div className="register-field">
              <label htmlFor="email">Email Address</label>
              <input
                id="email" type="email" placeholder="you@example.com" value={email}
                onChange={(e) => { setEmail(e.target.value); clearFieldError("email"); }}
                autoComplete="email" required
              />
              {validationErrors.email && <span className="field-error">{validationErrors.email}</span>}
            </div>

            <div className="register-field">
              <label htmlFor="password">Password</label>
              <input
                id="password" type="password" placeholder="At least 8 characters" value={password}
                onChange={(e) => { setPassword(e.target.value); clearFieldError("password"); }}
                autoComplete="new-password" minLength={8} required
              />
              <p className="password-hint">Must be at least 8 characters long</p>
              {validationErrors.password && <span className="field-error">{validationErrors.password}</span>}
            </div>

            <div className="register-field">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                id="confirmPassword" type="password" placeholder="Confirm your password" value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); clearFieldError("confirmPassword"); }}
                autoComplete="new-password" minLength={8} required
              />
              {validationErrors.confirmPassword && <span className="field-error">{validationErrors.confirmPassword}</span>}
            </div>

            <div className="register-field">
              <label htmlFor="country">Country</label>
              <select
                id="country" value={countryCode}
                onChange={(e) => { setCountryCode(e.target.value); clearFieldError("country"); }}
                required
              >
                <option value="">Select your country</option>
                {WORLD_COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>{c.name}</option>
                ))}
              </select>
              {validationErrors.country && <span className="field-error">{validationErrors.country}</span>}
            </div>

            <div className="terms-row">
              <label className="terms-control" htmlFor="terms">
                <input
                  id="terms" type="checkbox" checked={agreedToTerms}
                  onChange={(e) => { setAgreedToTerms(e.target.checked); clearFieldError("terms"); }}
                  required
                />
                <span>
                  I agree to the{" "}
                  <button type="button" className="inline-link-btn" onClick={() => handleTermsClick("terms")}>
                    Terms of Service
                  </button>{" "}and{" "}
                  <button type="button" className="inline-link-btn" onClick={() => handleTermsClick("privacy")}>
                    Privacy Policy
                  </button>
                </span>
              </label>
            </div>
            {validationErrors.terms && <span className="field-error terms-error">{validationErrors.terms}</span>}

            <button type="submit" className="register-submit-btn" disabled={isLoading}>
              {isLoading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <div className="signin-row">
            <p>Already have an account? <Link to="/login">Sign in</Link></p>
          </div>

          <div className="social-signup-divider"><span>Or sign up with</span></div>
          <div className="social-signup-grid">
            <button type="button" className="social-btn" onClick={() => handleSocialSignupClick("Google")}>
              <svg className="social-icon" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a6.99 6.99 0 0 1-2.21 3.31v2.77h3.57a11.95 11.95 0 0 0 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77a6.56 6.56 0 0 1-3.71 1.06c-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11.99 11.99 0 0 0 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09a7.03 7.03 0 0 1 0-4.18V7.07H2.18A11.99 11.99 0 0 0 1 12c0 1.78.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15A11.95 11.95 0 0 0 12 1 11.99 11.99 0 0 0 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              <span>Google</span>
            </button>
            <button type="button" className="social-btn" onClick={() => handleSocialSignupClick("Facebook")}>
              <svg className="social-icon" fill="#1877F2" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M24 12.073C24 5.446 18.627.073 12 .073S0 5.446 0 12.073c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              <span>Facebook</span>
            </button>
          </div>
        </section>
      </motion.div>
    </div>
  );
};

export default RegisterPage;
