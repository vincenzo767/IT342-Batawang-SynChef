import { useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { Routes, Route, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { refreshUser, logout } from "./store/authSlice";
import { userApi } from "./api";
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

const App = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  // On every app load, if the user has a valid token, fetch their latest
  // profile from the backend so favorites, country, etc. are always current.
  useEffect(() => {
    if (isAuthenticated) {
      userApi.getMe()
        .then((res) => dispatch(refreshUser(res.data)))
        .catch(() => dispatch(logout()));
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="app">
      <Navigation />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<HomePage />} />
          <Route path="/flavor-map" element={<FlavorMapPage />} />
          <Route path="/recipe/:id" element={<RecipeDetailPage />} />
          <Route path="/cooking/:id" element={<CookingModePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
          <Route path="/settings" element={<PrivateRoute><SettingsPage /></PrivateRoute>} />
        </Routes>
      </AnimatePresence>
    </div>
  );
};

export default App;
