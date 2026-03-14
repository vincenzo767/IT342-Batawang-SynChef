import { createSlice } from "@reduxjs/toolkit";

const loadStoredUser = () => {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    localStorage.removeItem("user");
    return null;
  }
};

const initialState = {
  user: loadStoredUser(),
  token: localStorage.getItem("token"),
  // favoriteRecipeIds lives here, NOT inside user and NOT in localStorage.
  // It always starts empty and is populated from the backend after login/on mount.
  favoriteRecipeIds: [],
  isLoading: false,
  error: null,
  isAuthenticated: !!localStorage.getItem("token")
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      localStorage.setItem("user", JSON.stringify(action.payload));
    },
    setToken: (state, action) => {
      state.token = action.payload;
      state.isAuthenticated = true;
      localStorage.setItem("token", action.payload);
    },
    // Call this after login or register with the full backend AuthResponse
    setAuthResponse: (state, action) => {
      const { token, user } = action.payload;
      state.token = token;
      state.user = user;
      state.favoriteRecipeIds = (user?.favoriteRecipeIds || []).map(Number);
      state.isAuthenticated = true;
      state.error = null;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      if (user?.countryCode || user?.countryName) {
        localStorage.setItem(
          "userCountry",
          JSON.stringify({ code: user.countryCode || "", name: user.countryName || "" })
        );
      }
    },
    // Update favorites in Redux only — no localStorage, no null-user guard
    setFavorites: (state, action) => {
      state.favoriteRecipeIds = (action.payload || []).map(Number);
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.favoriteRecipeIds = [];
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("userCountry");
    },
    // Sync fresh user data from the server (country, profile, favorites, etc.)
    refreshUser: (state, action) => {
      // Works even if state.user was null (e.g. token exists but user not yet loaded)
      state.user = state.user ? { ...state.user, ...action.payload } : { ...action.payload };
      if (action.payload?.favoriteRecipeIds != null) {
        state.favoriteRecipeIds = action.payload.favoriteRecipeIds.map(Number);
      }
      localStorage.setItem("user", JSON.stringify(state.user));
      if (state.user?.countryCode || state.user?.countryName) {
        localStorage.setItem(
          "userCountry",
          JSON.stringify({ code: state.user.countryCode || "", name: state.user.countryName || "" })
        );
      }
    },
    clearError: (state) => {
      state.error = null;
    }
  }
});

export const {
  setLoading,
  setError,
  setUser,
  setToken,
  setAuthResponse,
  setFavorites,
  logout,
  clearError,
  refreshUser
} = authSlice.actions;

export default authSlice.reducer;
