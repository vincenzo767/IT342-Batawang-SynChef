import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { FaHome, FaUser, FaSignOutAlt, FaUtensils, FaCog, FaTachometerAlt } from "react-icons/fa";
import { logout } from "../store/authSlice";
import "./Navigation.css";
const brandLogoPath = "/synchef-logo.png";
const Navigation = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };
  return /* @__PURE__ */ jsx("nav", { className: "navigation", children: /* @__PURE__ */ jsxs("div", { className: "nav-container", children: [
    /* @__PURE__ */ jsxs(Link, { to: "/", className: "nav-brand", children: [
      /* @__PURE__ */ jsxs("span", { className: "brand-icon-wrap", children: [
        /* @__PURE__ */ jsx(
          "img",
          {
            src: brandLogoPath,
            alt: "SynChef logo",
            className: "brand-logo-img",
            onError: (event) => {
              event.currentTarget.style.display = "none";
              const fallbackIcon = event.currentTarget.nextSibling;
              if (fallbackIcon) {
                fallbackIcon.style.display = "inline-flex";
              }
            }
          }
        ),
        /* @__PURE__ */ jsx(FaUtensils, { className: "brand-icon brand-icon-fallback" })
      ] }),
      /* @__PURE__ */ jsx("span", { className: "brand-name", children: "SynChef" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "nav-right", children: [
      /* @__PURE__ */ jsxs("div", { className: "nav-links", children: [
        /* @__PURE__ */ jsxs(
          Link,
          {
            to: "/",
            className: `nav-link ${location.pathname === "/" ? "active" : ""}`,
            children: [
              /* @__PURE__ */ jsx(FaHome, {}),
              /* @__PURE__ */ jsx("span", { children: "Home" })
            ]
          }
        ),
        isAuthenticated && /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsxs(
            Link,
            {
              to: "/dashboard",
              className: `nav-link ${location.pathname === "/dashboard" ? "active" : ""}`,
              children: [
                /* @__PURE__ */ jsx(FaTachometerAlt, {}),
                /* @__PURE__ */ jsx("span", { children: "Dashboard" })
              ]
            }
          ),
          /* @__PURE__ */ jsxs(
            Link,
            {
              to: "/profile",
              className: `nav-link ${location.pathname === "/profile" ? "active" : ""}`,
              children: [
                /* @__PURE__ */ jsx(FaUser, {}),
                /* @__PURE__ */ jsx("span", { children: "Profile" })
              ]
            }
          ),
          /* @__PURE__ */ jsxs(
            Link,
            {
              to: "/settings",
              className: `nav-link ${location.pathname === "/settings" ? "active" : ""}`,
              children: [
                /* @__PURE__ */ jsx(FaCog, {}),
                /* @__PURE__ */ jsx("span", { children: "Settings" })
              ]
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "nav-auth", children: isAuthenticated && user ? /* @__PURE__ */ jsxs("div", { className: "user-section", children: [
        /* @__PURE__ */ jsx("div", { className: "user-badge", children: (user.fullName || user.email).charAt(0).toUpperCase() }),
        /* @__PURE__ */ jsx("span", { className: "user-name", children: user.fullName }),
        /* @__PURE__ */ jsx("button", { className: "logout-icon-btn", onClick: handleLogout, title: "Logout", "aria-label": "Logout", children: /* @__PURE__ */ jsx(FaSignOutAlt, {}) })
      ] }) : /* @__PURE__ */ jsxs(
        Link,
        {
          to: "/login",
          className: `login-btn ${location.pathname === "/login" ? "active" : ""}`,
          children: [
            /* @__PURE__ */ jsx(FaUser, {}),
            /* @__PURE__ */ jsx("span", { children: "Login" })
          ]
        }
      ) })
    ] })
  ] }) });
};
var Navigation_default = Navigation;
export {
  Navigation_default as default
};
