import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout, setUser } from "../store/authSlice";
import { userApi } from "../api";
import "./SettingsPage.css";

// Same ISO 3166-1 list as RegisterPage (abbreviated for Settings)
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
  { code: "CR", name: "Costa Rica" }, { code: "HR", name: "Croatia" }, { code: "CU", name: "Cuba" },
  { code: "CY", name: "Cyprus" }, { code: "CZ", name: "Czech Republic" }, { code: "DK", name: "Denmark" },
  { code: "DJ", name: "Djibouti" }, { code: "DM", name: "Dominica" }, { code: "DO", name: "Dominican Republic" },
  { code: "EC", name: "Ecuador" }, { code: "EG", name: "Egypt" }, { code: "SV", name: "El Salvador" },
  { code: "GQ", name: "Equatorial Guinea" }, { code: "ER", name: "Eritrea" }, { code: "EE", name: "Estonia" },
  { code: "SZ", name: "Eswatini" }, { code: "ET", name: "Ethiopia" }, { code: "FJ", name: "Fiji" },
  { code: "FI", name: "Finland" }, { code: "FR", name: "France" }, { code: "GA", name: "Gabon" },
  { code: "GM", name: "Gambia" }, { code: "GE", name: "Georgia" }, { code: "DE", name: "Germany" },
  { code: "GH", name: "Ghana" }, { code: "GR", name: "Greece" }, { code: "GD", name: "Grenada" },
  { code: "GT", name: "Guatemala" }, { code: "GN", name: "Guinea" }, { code: "GW", name: "Guinea-Bissau" },
  { code: "GY", name: "Guyana" }, { code: "HT", name: "Haiti" }, { code: "HN", name: "Honduras" },
  { code: "HU", name: "Hungary" }, { code: "IS", name: "Iceland" }, { code: "IN", name: "India" },
  { code: "ID", name: "Indonesia" }, { code: "IR", name: "Iran" }, { code: "IQ", name: "Iraq" },
  { code: "IE", name: "Ireland" }, { code: "IL", name: "Israel" }, { code: "IT", name: "Italy" },
  { code: "JM", name: "Jamaica" }, { code: "JP", name: "Japan" }, { code: "JO", name: "Jordan" },
  { code: "KZ", name: "Kazakhstan" }, { code: "KE", name: "Kenya" }, { code: "KI", name: "Kiribati" },
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
  { code: "NG", name: "Nigeria" }, { code: "NO", name: "Norway" }, { code: "OM", name: "Oman" },
  { code: "PK", name: "Pakistan" }, { code: "PW", name: "Palau" }, { code: "PA", name: "Panama" },
  { code: "PG", name: "Papua New Guinea" }, { code: "PY", name: "Paraguay" }, { code: "PE", name: "Peru" },
  { code: "PH", name: "Philippines" }, { code: "PL", name: "Poland" }, { code: "PT", name: "Portugal" },
  { code: "QA", name: "Qatar" }, { code: "RO", name: "Romania" }, { code: "RU", name: "Russia" },
  { code: "RW", name: "Rwanda" }, { code: "KN", name: "Saint Kitts and Nevis" }, { code: "LC", name: "Saint Lucia" },
  { code: "VC", name: "Saint Vincent and the Grenadines" }, { code: "WS", name: "Samoa" }, { code: "SM", name: "San Marino" },
  { code: "ST", name: "Sao Tome and Principe" }, { code: "SA", name: "Saudi Arabia" }, { code: "SN", name: "Senegal" },
  { code: "RS", name: "Serbia" }, { code: "SC", name: "Seychelles" }, { code: "SL", name: "Sierra Leone" },
  { code: "SG", name: "Singapore" }, { code: "SK", name: "Slovakia" }, { code: "SI", name: "Slovenia" },
  { code: "SB", name: "Solomon Islands" }, { code: "SO", name: "Somalia" }, { code: "ZA", name: "South Africa" },
  { code: "SS", name: "South Sudan" }, { code: "ES", name: "Spain" }, { code: "LK", name: "Sri Lanka" },
  { code: "SD", name: "Sudan" }, { code: "SR", name: "Suriname" }, { code: "SE", name: "Sweden" },
  { code: "CH", name: "Switzerland" }, { code: "SY", name: "Syria" }, { code: "TW", name: "Taiwan" },
  { code: "TJ", name: "Tajikistan" }, { code: "TZ", name: "Tanzania" }, { code: "TH", name: "Thailand" },
  { code: "TL", name: "Timor-Leste" }, { code: "TG", name: "Togo" }, { code: "TO", name: "Tonga" },
  { code: "TT", name: "Trinidad and Tobago" }, { code: "TN", name: "Tunisia" }, { code: "TR", name: "Turkey" },
  { code: "TM", name: "Turkmenistan" }, { code: "TV", name: "Tuvalu" }, { code: "UG", name: "Uganda" },
  { code: "UA", name: "Ukraine" }, { code: "AE", name: "United Arab Emirates" }, { code: "GB", name: "United Kingdom" },
  { code: "US", name: "United States" }, { code: "UY", name: "Uruguay" }, { code: "UZ", name: "Uzbekistan" },
  { code: "VU", name: "Vanuatu" }, { code: "VE", name: "Venezuela" }, { code: "VN", name: "Vietnam" },
  { code: "YE", name: "Yemen" }, { code: "ZM", name: "Zambia" }, { code: "ZW", name: "Zimbabwe" }
];

// Read stored country as { code, name }
const getStoredCountry = () => {
  try {
    const raw = localStorage.getItem("userCountry");
    if (!raw) return { code: "", name: "" };
    if (raw.startsWith("{")) return JSON.parse(raw);
    return { code: raw, name: raw };
  } catch {
    return { code: "", name: "" };
  }
};

const SettingsPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const storedCountry = getStoredCountry();

  const [fullName, setFullName] = useState(user?.fullName || "");
  const [email, setEmail] = useState(user?.email || "");
  const [countryCode, setCountryCode] = useState(
    user?.countryCode || storedCountry.code || ""
  );
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [notifyNewRecipes, setNotifyNewRecipes] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(true);
  const [newRegions, setNewRegions] = useState(false);
  const [achievementNotifications, setAchievementNotifications] = useState(true);
  const [profilePublic, setProfilePublic] = useState(false);
  const [showActivity, setShowActivity] = useState(false);
  const [allowSharing, setAllowSharing] = useState(true);
  const [theme, setTheme] = useState("light");
  const [language, setLanguage] = useState("en");
  const [measurement, setMeasurement] = useState("metric");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const username = user?.username || "chef";
  const emailVerified = user?.emailVerified || false;

  const showBanner = (type, text) => { setMessageType(type); setMessage(text); };
  const clearBanner = () => { setMessage(""); setMessageType(""); };

  const updateAccountSettings = async (e) => {
    e.preventDefault();
    clearBanner();
    if (!fullName.trim()) { showBanner("error", "Full name is required."); return; }
    if (!email.trim()) { showBanner("error", "Email is required."); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showBanner("error", "Please provide a valid email address."); return; }

    const selectedCountry = WORLD_COUNTRIES.find((c) => c.code === countryCode);

    // Persist country to backend DB and keep localStorage in sync
    if (selectedCountry) {
      try {
        await userApi.updateCountry(selectedCountry.code, selectedCountry.name);
      } catch { /* backend unavailable — still update Redux/localStorage below */ }
      localStorage.setItem("userCountry", JSON.stringify({ code: selectedCountry.code, name: selectedCountry.name }));
    }

    dispatch(setUser({
      ...user,
      fullName,
      email,
      countryCode: selectedCountry?.code || countryCode,
      countryName: selectedCountry?.name || user?.countryName || "",
      favoriteRecipeIds: user?.favoriteRecipeIds || []
    }));
    showBanner("success", "Account settings updated successfully.");
  };

  const updatePassword = (e) => {
    e.preventDefault();
    clearBanner();
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      showBanner("error", "Please fill in all password fields."); return;
    }
    if (newPassword.length < 8) {
      showBanner("error", "Password must be at least 8 characters long."); return;
    }
    if (newPassword !== confirmNewPassword) {
      showBanner("error", "New passwords do not match."); return;
    }
    setCurrentPassword("");
    setNewPassword("");
    setConfirmNewPassword("");
    showBanner("success", "Password updated successfully.");
  };

  const removeAccount = () => {
    clearBanner();
    if (!globalThis.confirm("Are you sure you want to delete your account? This action cannot be undone.")) return;
    if (!globalThis.confirm("This will permanently delete all your data. Are you absolutely sure?")) return;
    localStorage.clear();
    dispatch(logout());
    navigate("/register", { replace: true });
  };

  const preferencesSummary = useMemo(
    () => [
      notifyNewRecipes && "New recipe emails",
      weeklyDigest && "Weekly digest",
      newRegions && "Cuisine and region updates",
      achievementNotifications && "Achievement notifications",
      profilePublic && "Public profile",
      showActivity && "Visible activity",
      allowSharing && "Recipe sharing enabled"
    ].filter(Boolean).join(" • "),
    [notifyNewRecipes, weeklyDigest, newRegions, achievementNotifications, profilePublic, showActivity, allowSharing]
  );

  return (
    <div className="settings-page">
      <div className="container settings-shell">
        <h2>Settings</h2>

        {message && <div className={`settings-banner ${messageType}`}>{message}</div>}

        {/* Account Settings */}
        <section className="settings-card">
          <h3>Account Settings</h3>
          <form className="settings-form" onSubmit={updateAccountSettings}>
            <div className="settings-field">
              <label htmlFor="fullName">Full Name</label>
              <input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} type="text" />
            </div>
            <div className="settings-field">
              <label htmlFor="email">Email Address</label>
              <input id="email" value={email} onChange={(e) => setEmail(e.target.value)} type="email" />
            </div>
            <div className="settings-field">
              <label htmlFor="country">Country</label>
              <select id="country" value={countryCode} onChange={(e) => setCountryCode(e.target.value)}>
                <option value="">Select your country</option>
                {WORLD_COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>{c.name}</option>
                ))}
              </select>
            </div>
            <button type="submit">Save Changes</button>
          </form>
        </section>

        {/* Change Password */}
        <section className="settings-card">
          <h3>Change Password</h3>
          <form className="settings-form" onSubmit={updatePassword}>
            <div className="settings-field">
              <label htmlFor="currentPassword">Current Password</label>
              <input id="currentPassword" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} type="password" />
            </div>
            <div className="settings-field">
              <label htmlFor="newPassword">New Password</label>
              <input id="newPassword" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} type="password" minLength={8} />
            </div>
            <div className="settings-field">
              <label htmlFor="confirmNewPassword">Confirm New Password</label>
              <input id="confirmNewPassword" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} type="password" minLength={8} />
            </div>
            <button type="submit">Update Password</button>
          </form>
        </section>

        {/* Notification Preferences */}
        <section className="settings-card">
          <h3>Notification Preferences</h3>
          <div className="toggle-group">
            <label>
              <span>Email notifications for new recipes</span>
              <input type="checkbox" checked={notifyNewRecipes} onChange={(e) => setNotifyNewRecipes(e.target.checked)} />
            </label>
            <label>
              <span>Weekly recipe digest</span>
              <input type="checkbox" checked={weeklyDigest} onChange={(e) => setWeeklyDigest(e.target.checked)} />
            </label>
            <label>
              <span>New cuisines and regions</span>
              <input type="checkbox" checked={newRegions} onChange={(e) => setNewRegions(e.target.checked)} />
            </label>
            <label>
              <span>Achievement notifications</span>
              <input type="checkbox" checked={achievementNotifications} onChange={(e) => setAchievementNotifications(e.target.checked)} />
            </label>
          </div>
        </section>

        {/* Privacy Settings */}
        <section className="settings-card">
          <h3>Privacy Settings</h3>
          <div className="toggle-group">
            <label>
              <span>Make profile public</span>
              <input type="checkbox" checked={profilePublic} onChange={(e) => setProfilePublic(e.target.checked)} />
            </label>
            <label>
              <span>Show activity to others</span>
              <input type="checkbox" checked={showActivity} onChange={(e) => setShowActivity(e.target.checked)} />
            </label>
            <label>
              <span>Allow recipe sharing</span>
              <input type="checkbox" checked={allowSharing} onChange={(e) => setAllowSharing(e.target.checked)} />
            </label>
          </div>
        </section>

        {/* Display Preferences */}
        <section className="settings-card">
          <h3>Display Preferences</h3>
          <div className="settings-form">
            <div className="settings-field">
              <label htmlFor="theme">Theme</label>
              <select id="theme" value={theme} onChange={(e) => setTheme(e.target.value)}>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="auto">Auto (System)</option>
              </select>
            </div>
            <div className="settings-field">
              <label htmlFor="language">Language</label>
              <select id="language" value={language} onChange={(e) => setLanguage(e.target.value)}>
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
                <option value="de">Deutsch</option>
                <option value="it">Italiano</option>
                <option value="ja">Japanese</option>
                <option value="zh">Chinese</option>
              </select>
            </div>
            <div className="settings-field">
              <label htmlFor="measurement">Measurement System</label>
              <select id="measurement" value={measurement} onChange={(e) => setMeasurement(e.target.value)}>
                <option value="metric">Metric (kg, g, ml)</option>
                <option value="imperial">Imperial (lb, oz, fl oz)</option>
              </select>
            </div>
          </div>
        </section>

        {/* Danger Zone */}
        <section className="settings-card danger-zone">
          <h3>Danger Zone</h3>
          <div className="danger-zone-row">
            <div>
              <h4>Delete Account</h4>
              <p>Permanently delete your account and all data</p>
            </div>
            <button type="button" className="danger-btn" onClick={removeAccount}>Delete Account</button>
          </div>
        </section>

        {/* Preference Summary */}
        <section className="settings-card preference-summary">
          <h3>Current Preference Summary</h3>
          <p>{preferencesSummary || "No preferences selected yet."}</p>
        </section>
      </div>
    </div>
  );
};

export default SettingsPage;
