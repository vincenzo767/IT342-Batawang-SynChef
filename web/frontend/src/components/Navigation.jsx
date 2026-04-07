import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
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
import { notificationApi } from "../api";
import "./Navigation.css";

const Navigation = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [activeNotificationTab, setActiveNotificationTab] = useState("all");
  const [notifications, setNotifications] = useState([]);
  const [isNotificationLoading, setIsNotificationLoading] = useState(false);

  const panelRef = useRef(null);
  const bellRef = useRef(null);

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.isRead).length,
    [notifications]
  );

  const visibleNotifications = useMemo(() => {
    if (activeNotificationTab === "unread") {
      return notifications.filter((notification) => !notification.isRead);
    }
    return notifications;
  }, [activeNotificationTab, notifications]);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const navLink = (to) => `nav-link${location.pathname === to ? " active" : ""}`;

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const loadNotifications = async () => {
    if (!isAuthenticated) return;
    try {
      setIsNotificationLoading(true);
      const response = await notificationApi.getMine(false);
      setNotifications(Array.isArray(response.data) ? response.data : []);
    } catch {
      // noop: keep last cached notifications in UI
    } finally {
      setIsNotificationLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await notificationApi.markAsRead(id);
      setNotifications((previous) =>
        previous.map((item) => (item.id === id ? { ...item, isRead: true } : item))
      );
    } catch {
      // noop
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications((previous) => previous.map((item) => ({ ...item, isRead: true })));
    } catch {
      // noop
    }
  };

  const onClickNotification = async (notification) => {
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }
    if (notification.referenceRecipeId) {
      navigate("/dashboard");
      setIsNotificationOpen(false);
    }
  };

  const formatRelative = (value) => {
    if (!value) return "now";
    const created = new Date(value).getTime();
    if (Number.isNaN(created)) return "now";
    const diffMs = Math.max(0, Date.now() - created);
    const minutes = Math.floor(diffMs / 60000);
    if (minutes < 1) return "now";
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  useEffect(() => {
    document.documentElement.dataset.authNav = isAuthenticated ? "true" : "false";
    document.documentElement.dataset.sidebarOpen = isSidebarOpen ? "true" : "false";

    return () => {
      delete document.documentElement.dataset.authNav;
      delete document.documentElement.dataset.sidebarOpen;
    };
  }, [isAuthenticated, isSidebarOpen]);

  useEffect(() => {
    if (!isAuthenticated) {
      setNotifications([]);
      setIsNotificationOpen(false);
      return;
    }

    loadNotifications();
    const intervalId = globalThis.setInterval(loadNotifications, 3000);
    return () => globalThis.clearInterval(intervalId);
  }, [isAuthenticated]);

  useEffect(() => {
    const onPointerDown = (event) => {
      if (!isNotificationOpen) return;
      const target = event.target;
      if (panelRef.current?.contains(target) || bellRef.current?.contains(target)) {
        return;
      }
      setIsNotificationOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [isNotificationOpen]);

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
            ref={bellRef}
            type="button"
            className={`notification-btn${isNotificationOpen ? " active" : ""}`}
            aria-label="Notifications"
            title="Notifications"
            onClick={() => setIsNotificationOpen((prev) => !prev)}
          >
            <FaBell />
            {unreadCount > 0 && <span className="notification-badge">{unreadCount > 99 ? "99+" : unreadCount}</span>}
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

      {isNotificationOpen && (
        <section ref={panelRef} className={`notification-panel${isSidebarOpen ? " sidebar-open" : " sidebar-closed"}`}>
          <div className="notification-panel-header">
            <h4>Notification</h4>
            <button type="button" onClick={markAllAsRead}>Mark all as Read</button>
          </div>

          <div className="notification-tabs">
            <button
              type="button"
              className={activeNotificationTab === "all" ? "active" : ""}
              onClick={() => setActiveNotificationTab("all")}
            >
              All
              {unreadCount > 0 && <span>{unreadCount}</span>}
            </button>
            <button
              type="button"
              className={activeNotificationTab === "unread" ? "active" : ""}
              onClick={() => setActiveNotificationTab("unread")}
            >
              Unread
            </button>
          </div>

          <div className="notification-list">
            {isNotificationLoading && notifications.length === 0 && (
              <p className="notification-empty">Loading notifications...</p>
            )}

            {!isNotificationLoading && visibleNotifications.length === 0 && (
              <p className="notification-empty">No notifications yet.</p>
            )}

            {visibleNotifications.map((notification) => (
              <article
                key={notification.id}
                className={`notification-card${notification.isRead ? "" : " unread"}`}
              >
                <div className="notification-avatar" aria-hidden="true" />
                <div className="notification-card-content">
                  <h5>{notification.title || "Chef!"}</h5>
                  <p>{notification.message}</p>
                  <div className="notification-card-footer">
                    <button
                      type="button"
                      onClick={() => onClickNotification(notification)}
                    >
                      Open
                    </button>
                    {!notification.isRead && (
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          markAsRead(notification.id);
                        }}
                      >
                        Mark as Read
                      </button>
                    )}
                    <small>{formatRelative(notification.createdAt)}</small>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

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
