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
      state.isAuthenticated = true;
      state.error = null;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      // Keep userCountry in sync for any legacy code still reading it
      if (user?.countryCode || user?.countryName) {
        localStorage.setItem(
          "userCountry",
          JSON.stringify({ code: user.countryCode || "", name: user.countryName || "" })
        );
      }
    },
    // Update favorites in the Redux store + localStorage after any API call
    setFavorites: (state, action) => {
      if (state.user) {
        state.user = { ...state.user, favoriteRecipeIds: action.payload };
        localStorage.setItem("user", JSON.stringify(state.user));
      }
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
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
  clearError
} = authSlice.actions;

export default authSlice.reducer;
