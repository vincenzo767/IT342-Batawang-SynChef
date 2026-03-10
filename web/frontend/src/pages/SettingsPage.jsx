import { jsx, jsxs } from "react/jsx-runtime";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout, setUser } from "../store/authSlice";
import "./SettingsPage.css";
const SettingsPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [fullName, setFullName] = useState(user?.fullName || "");
  const [email, setEmail] = useState(user?.email || "");
  const [country, setCountry] = useState(localStorage.getItem("userCountry") || "");
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
  const showBanner = (type, text) => {
    setMessageType(type);
    setMessage(text);
  };
  const clearBanner = () => {
    setMessage("");
    setMessageType("");
  };
  const updateAccountSettings = (event) => {
    event.preventDefault();
    clearBanner();
    if (!fullName.trim()) {
      showBanner("error", "Full name is required.");
      return;
    }
    if (!email.trim()) {
      showBanner("error", "Email is required.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showBanner("error", "Please provide a valid email address.");
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
    localStorage.setItem("userCountry", country);
    showBanner("success", "Account settings updated successfully.");
  };
  const updatePassword = (event) => {
    event.preventDefault();
    clearBanner();
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      showBanner("error", "Please fill in all password fields.");
      return;
    }
    if (newPassword.length < 8) {
      showBanner("error", "Password must be at least 8 characters long.");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      showBanner("error", "New passwords do not match.");
      return;
    }
    setCurrentPassword("");
    setNewPassword("");
    setConfirmNewPassword("");
    showBanner("success", "Password updated successfully.");
  };
  const removeAccount = () => {
    clearBanner();
    const firstConfirmation = globalThis.confirm("Are you sure you want to delete your account? This action cannot be undone.");
    if (!firstConfirmation) {
      return;
    }
    const secondConfirmation = globalThis.confirm("This will permanently delete all your data. Are you absolutely sure?");
    if (!secondConfirmation) {
      return;
    }
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
    ].filter(Boolean).join(" \u2022 "),
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
  return /* @__PURE__ */ jsx("div", { className: "settings-page", children: /* @__PURE__ */ jsxs("div", { className: "container settings-shell", children: [
    /* @__PURE__ */ jsx("h2", { children: "Settings" }),
    message && /* @__PURE__ */ jsx("div", { className: `settings-banner ${messageType}`, children: message }),
    /* @__PURE__ */ jsxs("section", { className: "settings-card", children: [
      /* @__PURE__ */ jsx("h3", { children: "Account Settings" }),
      /* @__PURE__ */ jsxs("form", { className: "settings-form", onSubmit: updateAccountSettings, children: [
        /* @__PURE__ */ jsxs("div", { className: "settings-field", children: [
          /* @__PURE__ */ jsx("label", { htmlFor: "fullName", children: "Full Name" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              id: "fullName",
              value: fullName,
              onChange: (e) => setFullName(e.target.value),
              type: "text"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "settings-field", children: [
          /* @__PURE__ */ jsx("label", { htmlFor: "email", children: "Email Address" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              id: "email",
              value: email,
              onChange: (e) => setEmail(e.target.value),
              type: "email"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "settings-field", children: [
          /* @__PURE__ */ jsx("label", { htmlFor: "country", children: "Country" }),
          /* @__PURE__ */ jsxs("select", { id: "country", value: country, onChange: (e) => setCountry(e.target.value), children: [
            /* @__PURE__ */ jsx("option", { value: "", children: "Select your country" }),
            /* @__PURE__ */ jsx("option", { value: "us", children: "United States" }),
            /* @__PURE__ */ jsx("option", { value: "uk", children: "United Kingdom" }),
            /* @__PURE__ */ jsx("option", { value: "ca", children: "Canada" }),
            /* @__PURE__ */ jsx("option", { value: "au", children: "Australia" }),
            /* @__PURE__ */ jsx("option", { value: "de", children: "Germany" }),
            /* @__PURE__ */ jsx("option", { value: "fr", children: "France" }),
            /* @__PURE__ */ jsx("option", { value: "it", children: "Italy" }),
            /* @__PURE__ */ jsx("option", { value: "es", children: "Spain" }),
            /* @__PURE__ */ jsx("option", { value: "jp", children: "Japan" }),
            /* @__PURE__ */ jsx("option", { value: "cn", children: "China" }),
            /* @__PURE__ */ jsx("option", { value: "in", children: "India" }),
            /* @__PURE__ */ jsx("option", { value: "br", children: "Brazil" }),
            /* @__PURE__ */ jsx("option", { value: "mx", children: "Mexico" }),
            /* @__PURE__ */ jsx("option", { value: "other", children: "Other" })
          ] })
        ] }),
        /* @__PURE__ */ jsx("button", { type: "submit", children: "Save Changes" })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("section", { className: "settings-card", children: [
      /* @__PURE__ */ jsx("h3", { children: "Change Password" }),
      /* @__PURE__ */ jsxs("form", { className: "settings-form", onSubmit: updatePassword, children: [
        /* @__PURE__ */ jsxs("div", { className: "settings-field", children: [
          /* @__PURE__ */ jsx("label", { htmlFor: "currentPassword", children: "Current Password" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              id: "currentPassword",
              value: currentPassword,
              onChange: (e) => setCurrentPassword(e.target.value),
              type: "password"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "settings-field", children: [
          /* @__PURE__ */ jsx("label", { htmlFor: "newPassword", children: "New Password" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              id: "newPassword",
              value: newPassword,
              onChange: (e) => setNewPassword(e.target.value),
              type: "password",
              minLength: 8
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "settings-field", children: [
          /* @__PURE__ */ jsx("label", { htmlFor: "confirmNewPassword", children: "Confirm New Password" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              id: "confirmNewPassword",
              value: confirmNewPassword,
              onChange: (e) => setConfirmNewPassword(e.target.value),
              type: "password",
              minLength: 8
            }
          )
        ] }),
        /* @__PURE__ */ jsx("button", { type: "submit", children: "Update Password" })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("section", { className: "settings-card", children: [
      /* @__PURE__ */ jsx("h3", { children: "Notification Preferences" }),
      /* @__PURE__ */ jsxs("div", { className: "toggle-group", children: [
        /* @__PURE__ */ jsxs("label", { children: [
          /* @__PURE__ */ jsx("span", { children: "Email notifications for new recipes" }),
          /* @__PURE__ */ jsx("input", { type: "checkbox", checked: notifyNewRecipes, onChange: (e) => setNotifyNewRecipes(e.target.checked) })
        ] }),
        /* @__PURE__ */ jsxs("label", { children: [
          /* @__PURE__ */ jsx("span", { children: "Weekly recipe digest" }),
          /* @__PURE__ */ jsx("input", { type: "checkbox", checked: weeklyDigest, onChange: (e) => setWeeklyDigest(e.target.checked) })
        ] }),
        /* @__PURE__ */ jsxs("label", { children: [
          /* @__PURE__ */ jsx("span", { children: "New cuisines and regions" }),
          /* @__PURE__ */ jsx("input", { type: "checkbox", checked: newRegions, onChange: (e) => setNewRegions(e.target.checked) })
        ] }),
        /* @__PURE__ */ jsxs("label", { children: [
          /* @__PURE__ */ jsx("span", { children: "Achievement notifications" }),
          /* @__PURE__ */ jsx("input", { type: "checkbox", checked: achievementNotifications, onChange: (e) => setAchievementNotifications(e.target.checked) })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("section", { className: "settings-card", children: [
      /* @__PURE__ */ jsx("h3", { children: "Privacy Settings" }),
      /* @__PURE__ */ jsxs("div", { className: "toggle-group", children: [
        /* @__PURE__ */ jsxs("label", { children: [
          /* @__PURE__ */ jsx("span", { children: "Make profile public" }),
          /* @__PURE__ */ jsx("input", { type: "checkbox", checked: profilePublic, onChange: (e) => setProfilePublic(e.target.checked) })
        ] }),
        /* @__PURE__ */ jsxs("label", { children: [
          /* @__PURE__ */ jsx("span", { children: "Show activity to others" }),
          /* @__PURE__ */ jsx("input", { type: "checkbox", checked: showActivity, onChange: (e) => setShowActivity(e.target.checked) })
        ] }),
        /* @__PURE__ */ jsxs("label", { children: [
          /* @__PURE__ */ jsx("span", { children: "Allow recipe sharing" }),
          /* @__PURE__ */ jsx("input", { type: "checkbox", checked: allowSharing, onChange: (e) => setAllowSharing(e.target.checked) })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("section", { className: "settings-card", children: [
      /* @__PURE__ */ jsx("h3", { children: "Display Preferences" }),
      /* @__PURE__ */ jsxs("div", { className: "settings-form", children: [
        /* @__PURE__ */ jsxs("div", { className: "settings-field", children: [
          /* @__PURE__ */ jsx("label", { htmlFor: "theme", children: "Theme" }),
          /* @__PURE__ */ jsxs("select", { id: "theme", value: theme, onChange: (e) => setTheme(e.target.value), children: [
            /* @__PURE__ */ jsx("option", { value: "light", children: "Light" }),
            /* @__PURE__ */ jsx("option", { value: "dark", children: "Dark" }),
            /* @__PURE__ */ jsx("option", { value: "auto", children: "Auto (System)" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "settings-field", children: [
          /* @__PURE__ */ jsx("label", { htmlFor: "language", children: "Language" }),
          /* @__PURE__ */ jsxs("select", { id: "language", value: language, onChange: (e) => setLanguage(e.target.value), children: [
            /* @__PURE__ */ jsx("option", { value: "en", children: "English" }),
            /* @__PURE__ */ jsx("option", { value: "es", children: "Espanol" }),
            /* @__PURE__ */ jsx("option", { value: "fr", children: "Francais" }),
            /* @__PURE__ */ jsx("option", { value: "de", children: "Deutsch" }),
            /* @__PURE__ */ jsx("option", { value: "it", children: "Italiano" }),
            /* @__PURE__ */ jsx("option", { value: "ja", children: "Japanese" }),
            /* @__PURE__ */ jsx("option", { value: "zh", children: "Chinese" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "settings-field", children: [
          /* @__PURE__ */ jsx("label", { htmlFor: "measurement", children: "Measurement System" }),
          /* @__PURE__ */ jsxs("select", { id: "measurement", value: measurement, onChange: (e) => setMeasurement(e.target.value), children: [
            /* @__PURE__ */ jsx("option", { value: "metric", children: "Metric (kg, g, ml)" }),
            /* @__PURE__ */ jsx("option", { value: "imperial", children: "Imperial (lb, oz, fl oz)" })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("section", { className: "settings-card danger-zone", children: [
      /* @__PURE__ */ jsx("h3", { children: "Danger Zone" }),
      /* @__PURE__ */ jsxs("div", { className: "danger-zone-row", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h4", { children: "Delete Account" }),
          /* @__PURE__ */ jsx("p", { children: "Permanently delete your account and all data" })
        ] }),
        /* @__PURE__ */ jsx("button", { type: "button", className: "danger-btn", onClick: removeAccount, children: "Delete Account" })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("section", { className: "settings-card preference-summary", children: [
      /* @__PURE__ */ jsx("h3", { children: "Current Preference Summary" }),
      /* @__PURE__ */ jsx("p", { children: preferencesSummary || "No preferences selected yet." })
    ] })
  ] }) });
};
var SettingsPage_default = SettingsPage;
export {
  SettingsPage_default as default
};
