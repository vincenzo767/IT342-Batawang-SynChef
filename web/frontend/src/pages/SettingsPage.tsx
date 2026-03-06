import { FormEvent, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { logout, setUser } from '../store/authSlice';
import './SettingsPage.css';

const SettingsPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [country, setCountry] = useState(localStorage.getItem('userCountry') || '');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const [notifyNewRecipes, setNotifyNewRecipes] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(true);
  const [newRegions, setNewRegions] = useState(false);
  const [achievementNotifications, setAchievementNotifications] = useState(true);

  const [profilePublic, setProfilePublic] = useState(false);
  const [showActivity, setShowActivity] = useState(false);
  const [allowSharing, setAllowSharing] = useState(true);

  const [theme, setTheme] = useState('light');
  const [language, setLanguage] = useState('en');
  const [measurement, setMeasurement] = useState('metric');

  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');

  const username = user?.username || 'chef';
  const emailVerified = user?.emailVerified || false;

  const showBanner = (type: 'success' | 'error', text: string) => {
    setMessageType(type);
    setMessage(text);
  };

  const clearBanner = () => {
    setMessage('');
    setMessageType('');
  };

  const updateAccountSettings = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    clearBanner();

    if (!fullName.trim()) {
      showBanner('error', 'Full name is required.');
      return;
    }

    if (!email.trim()) {
      showBanner('error', 'Email is required.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showBanner('error', 'Please provide a valid email address.');
      return;
    }

    const updatedUser = {
      id: user?.id || 0,
      username,
      fullName,
      email,
      profileImageUrl: user?.profileImageUrl,
      emailVerified
    };

    dispatch(setUser(updatedUser));
    localStorage.setItem('userCountry', country);
    showBanner('success', 'Account settings updated successfully.');
  };

  const updatePassword = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    clearBanner();

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      showBanner('error', 'Please fill in all password fields.');
      return;
    }

    if (newPassword.length < 8) {
      showBanner('error', 'Password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      showBanner('error', 'New passwords do not match.');
      return;
    }

    setCurrentPassword('');
    setNewPassword('');
    setConfirmNewPassword('');
    showBanner('success', 'Password updated successfully.');
  };

  const removeAccount = () => {
    clearBanner();

    const firstConfirmation = globalThis.confirm('Are you sure you want to delete your account? This action cannot be undone.');
    if (!firstConfirmation) {
      return;
    }

    const secondConfirmation = globalThis.confirm('This will permanently delete all your data. Are you absolutely sure?');
    if (!secondConfirmation) {
      return;
    }

    localStorage.clear();
    dispatch(logout());
    navigate('/register', { replace: true });
  };

  const preferencesSummary = useMemo(
    () =>
      [
        notifyNewRecipes && 'New recipe emails',
        weeklyDigest && 'Weekly digest',
        newRegions && 'Cuisine and region updates',
        achievementNotifications && 'Achievement notifications',
        profilePublic && 'Public profile',
        showActivity && 'Visible activity',
        allowSharing && 'Recipe sharing enabled'
      ]
        .filter(Boolean)
        .join(' • '),
    [
      notifyNewRecipes,
      weeklyDigest,
      newRegions,
      achievementNotifications,
      profilePublic,
      showActivity,
      allowSharing
    ]
  );

  return (
    <div className="settings-page">
      <div className="container settings-shell">
        <h2>Settings</h2>

        {message && (
          <div className={`settings-banner ${messageType}`}>
            {message}
          </div>
        )}

        <section className="settings-card">
          <h3>Account Settings</h3>
          <form className="settings-form" onSubmit={updateAccountSettings}>
            <div className="settings-field">
              <label htmlFor="fullName">Full Name</label>
              <input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                type="text"
              />
            </div>

            <div className="settings-field">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
              />
            </div>

            <div className="settings-field">
              <label htmlFor="country">Country</label>
              <select id="country" value={country} onChange={(e) => setCountry(e.target.value)}>
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
            </div>

            <button type="submit">Save Changes</button>
          </form>
        </section>

        <section className="settings-card">
          <h3>Change Password</h3>
          <form className="settings-form" onSubmit={updatePassword}>
            <div className="settings-field">
              <label htmlFor="currentPassword">Current Password</label>
              <input
                id="currentPassword"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                type="password"
              />
            </div>

            <div className="settings-field">
              <label htmlFor="newPassword">New Password</label>
              <input
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                type="password"
                minLength={8}
              />
            </div>

            <div className="settings-field">
              <label htmlFor="confirmNewPassword">Confirm New Password</label>
              <input
                id="confirmNewPassword"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                type="password"
                minLength={8}
              />
            </div>

            <button type="submit">Update Password</button>
          </form>
        </section>

        <section className="settings-card">
          <h3>Notification Preferences</h3>
          <div className="toggle-group">
            <label><span>Email notifications for new recipes</span><input type="checkbox" checked={notifyNewRecipes} onChange={(e) => setNotifyNewRecipes(e.target.checked)} /></label>
            <label><span>Weekly recipe digest</span><input type="checkbox" checked={weeklyDigest} onChange={(e) => setWeeklyDigest(e.target.checked)} /></label>
            <label><span>New cuisines and regions</span><input type="checkbox" checked={newRegions} onChange={(e) => setNewRegions(e.target.checked)} /></label>
            <label><span>Achievement notifications</span><input type="checkbox" checked={achievementNotifications} onChange={(e) => setAchievementNotifications(e.target.checked)} /></label>
          </div>
        </section>

        <section className="settings-card">
          <h3>Privacy Settings</h3>
          <div className="toggle-group">
            <label><span>Make profile public</span><input type="checkbox" checked={profilePublic} onChange={(e) => setProfilePublic(e.target.checked)} /></label>
            <label><span>Show activity to others</span><input type="checkbox" checked={showActivity} onChange={(e) => setShowActivity(e.target.checked)} /></label>
            <label><span>Allow recipe sharing</span><input type="checkbox" checked={allowSharing} onChange={(e) => setAllowSharing(e.target.checked)} /></label>
          </div>
        </section>

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
                <option value="es">Espanol</option>
                <option value="fr">Francais</option>
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

        <section className="settings-card danger-zone">
          <h3>Danger Zone</h3>
          <div className="danger-zone-row">
            <div>
              <h4>Delete Account</h4>
              <p>Permanently delete your account and all data</p>
            </div>
            <button type="button" className="danger-btn" onClick={removeAccount}>
              Delete Account
            </button>
          </div>
        </section>

        <section className="settings-card preference-summary">
          <h3>Current Preference Summary</h3>
          <p>{preferencesSummary || 'No preferences selected yet.'}</p>
        </section>
      </div>
    </div>
  );
};

export default SettingsPage;
