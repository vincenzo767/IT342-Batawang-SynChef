import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { FaHome, FaUser, FaSignOutAlt, FaUtensils, FaCog, FaTachometerAlt } from "react-icons/fa";
import { logout } from "../store/authSlice";
import "./Navigation.css";

const Navigation = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const navLink = (to) => `nav-link${location.pathname === to ? " active" : ""}`;

  return (
    <nav className="navigation">
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

            {isAuthenticated && (
              <>
                <Link to="/dashboard" className={navLink("/dashboard")}>
                  <FaTachometerAlt /><span>Dashboard</span>
                </Link>
                <Link to="/profile" className={navLink("/profile")}>
                  <FaUser /><span>Profile</span>
                </Link>
                <Link to="/settings" className={navLink("/settings")}>
                  <FaCog /><span>Settings</span>
                </Link>
              </>
            )}
          </div>

          <div className="nav-auth">
            {isAuthenticated && user ? (
              <div className="user-section">
                <div className="user-badge">
                  {(user.fullName || user.email).charAt(0).toUpperCase()}
                </div>
                <span className="user-name">{user.fullName}</span>
                <button
                  className="logout-icon-btn"
                  onClick={handleLogout}
                  title="Logout"
                  aria-label="Logout"
                >
                  <FaSignOutAlt />
                </button>
              </div>
            ) : (
              <Link to="/login" className={`login-btn${location.pathname === "/login" ? " active" : ""}`}>
                <FaUser /><span>Login</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
