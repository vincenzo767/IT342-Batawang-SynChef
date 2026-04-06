import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  FaBars,
  FaBell,
  FaChevronRight,
  FaHome,
  FaSignOutAlt,
  FaUser,
  FaUtensils,
  FaCog,
  FaTachometerAlt,
  FaTimes
} from "react-icons/fa";
import { logout } from "../store/authSlice";
import "./Navigation.css";

const Navigation = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const navLink = (to) => `nav-link${location.pathname === to ? " active" : ""}`;

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  useEffect(() => {
    document.documentElement.dataset.authNav = isAuthenticated ? "true" : "false";
    document.documentElement.dataset.sidebarOpen = isSidebarOpen ? "true" : "false";

    return () => {
      delete document.documentElement.dataset.authNav;
      delete document.documentElement.dataset.sidebarOpen;
    };
  }, [isAuthenticated, isSidebarOpen]);

  if (!isAuthenticated) {
    return (
      <nav className="navigation guest-navigation">
        <div className="nav-container">
          <Link to="/" className="nav-brand">
            <span className="brand-icon-wrap">
              <img
                src="/synchef-logo.png"
                alt="SynChef logo"
                className="brand-logo-img"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  const fallback = e.currentTarget.nextSibling;
                  if (fallback) fallback.style.display = "inline-flex";
                }}
              />
              <FaUtensils className="brand-icon brand-icon-fallback" />
            </span>
            <span className="brand-name">SynChef</span>
          </Link>

          <div className="nav-right">
            <div className="nav-links">
              <Link to="/" className={navLink("/")}>
                <FaHome /><span>Home</span>
              </Link>
            </div>

            <div className="nav-auth">
              <Link to="/login" className={`login-btn${location.pathname === "/login" ? " active" : ""}`}>
                <FaUser /><span>Login</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <>
      <nav className={`auth-topbar${isSidebarOpen ? " sidebar-open" : " sidebar-closed"}`}>
        <div className="auth-topbar-left">
          <button
            type="button"
            className="sidebar-toggle-btn"
            onClick={toggleSidebar}
            aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
            title={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
          >
            {isSidebarOpen ? <FaTimes /> : <FaBars />}
          </button>

          <Link to="/dashboard" className="auth-brand">
            <span className="brand-icon-wrap">
              <img
                src="/synchef-logo.png"
                alt="SynChef logo"
                className="brand-logo-img"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  const fallback = e.currentTarget.nextSibling;
                  if (fallback) fallback.style.display = "inline-flex";
                }}
              />
              <FaUtensils className="brand-icon brand-icon-fallback" />
            </span>
            <span className="brand-name">SynChef</span>
          </Link>
        </div>

        <div className="auth-topbar-right">
          <button
            type="button"
            className="notification-btn"
            aria-label="Notifications"
            title="Notifications (coming soon)"
          >
            <FaBell />
          </button>

          <div className="user-section topbar-user-section">
            <div className="user-badge">
              {(user?.fullName || user?.email || "U").charAt(0).toUpperCase()}
            </div>
            <span className="user-name">{user?.fullName || "User"}</span>
            <FaChevronRight className="account-caret" aria-hidden="true" />
          </div>
        </div>
      </nav>

      <aside className={`auth-sidebar${isSidebarOpen ? " open" : " closed"}`}>
        <div className="auth-sidebar-overlay" />
        <div className="auth-sidebar-content">
          <div className="auth-nav-links">
            <Link to="/" className={navLink("/")}>
              <FaHome /><span>Home</span>
            </Link>
            <Link to="/profile" className={navLink("/profile")}>
              <FaUser /><span>Profile</span>
            </Link>
            <Link to="/dashboard" className={navLink("/dashboard")}>
              <FaTachometerAlt /><span>Dashboard</span>
            </Link>
            <Link to="/settings" className={navLink("/settings")}>
              <FaCog /><span>Settings</span>
            </Link>
          </div>

          <button
            type="button"
            className="sidebar-logout-btn"
            onClick={handleLogout}
            title="Logout"
            aria-label="Logout"
          >
            <FaSignOutAlt />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Navigation;
