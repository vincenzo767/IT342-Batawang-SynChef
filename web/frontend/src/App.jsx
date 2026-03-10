import { jsx, jsxs } from "react/jsx-runtime";
import { AnimatePresence } from "framer-motion";
import { Routes, Route, useLocation } from "react-router-dom";
import HomePage from "./pages/HomePage";
import FlavorMapPage from "./pages/FlavorMapPage";
import RecipeDetailPage from "./pages/RecipeDetailPage";
import CookingModePage from "./pages/CookingModePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";
import Navigation from "./components/Navigation";
import PrivateRoute from "./components/PrivateRoute";
import "./App.css";
function App() {
  const location = useLocation();

  return /* @__PURE__ */ jsxs("div", { className: "app", children: [
    /* @__PURE__ */ jsx(Navigation, {}),
    /* @__PURE__ */ jsx(AnimatePresence, { mode: "wait", children: /* @__PURE__ */ jsxs(Routes, { location, key: location.pathname, children: [
      /* @__PURE__ */ jsx(Route, { path: "/", element: /* @__PURE__ */ jsx(HomePage, {}) }),
      /* @__PURE__ */ jsx(Route, { path: "/flavor-map", element: /* @__PURE__ */ jsx(FlavorMapPage, {}) }),
      /* @__PURE__ */ jsx(Route, { path: "/recipe/:id", element: /* @__PURE__ */ jsx(RecipeDetailPage, {}) }),
      /* @__PURE__ */ jsx(Route, { path: "/cooking/:id", element: /* @__PURE__ */ jsx(CookingModePage, {}) }),
      /* @__PURE__ */ jsx(Route, { path: "/login", element: /* @__PURE__ */ jsx(LoginPage, {}) }),
      /* @__PURE__ */ jsx(Route, { path: "/register", element: /* @__PURE__ */ jsx(RegisterPage, {}) }),
      /* @__PURE__ */ jsx(
        Route,
        {
          path: "/dashboard",
          element: /* @__PURE__ */ jsx(PrivateRoute, { children: /* @__PURE__ */ jsx(DashboardPage, {}) })
        }
      ),
      /* @__PURE__ */ jsx(
        Route,
        {
          path: "/profile",
          element: /* @__PURE__ */ jsx(PrivateRoute, { children: /* @__PURE__ */ jsx(ProfilePage, {}) })
        }
      ),
      /* @__PURE__ */ jsx(
        Route,
        {
          path: "/settings",
          element: /* @__PURE__ */ jsx(PrivateRoute, { children: /* @__PURE__ */ jsx(SettingsPage, {}) })
        }
      )
    ] }) })
  ] });
}
var App_default = App;
export {
  App_default as default
};
