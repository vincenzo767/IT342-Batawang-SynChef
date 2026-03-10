import { createSlice } from "@reduxjs/toolkit";
const initialState = {
  selectedRecipe: null,
  scaledRecipe: null,
  recipes: [],
  countries: [],
  selectedCountry: null,
  servings: 4,
  loading: false,
  error: null
};
const recipeSlice = createSlice({
  name: "recipes",
  initialState,
  reducers: {
    setSelectedRecipe: (state, action) => {
      state.selectedRecipe = action.payload;
      if (action.payload) {
        state.servings = action.payload.defaultServings;
      }
    },
    setScaledRecipe: (state, action) => {
      state.scaledRecipe = action.payload;
    },
    setRecipes: (state, action) => {
      state.recipes = action.payload;
    },
    setCountries: (state, action) => {
      state.countries = action.payload;
    },
    setSelectedCountry: (state, action) => {
      state.selectedCountry = action.payload;
    },
    setServings: (state, action) => {
      state.servings = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    }
  }
});
const {
  setSelectedRecipe,
  setScaledRecipe,
  setRecipes,
  setCountries,
  setSelectedCountry,
  setServings,
  setLoading,
  setError
} = recipeSlice.actions;
var recipeSlice_default = recipeSlice.reducer;
export {
  recipeSlice_default as default,
  setCountries,
  setError,
  setLoading,
  setRecipes,
  setScaledRecipe,
  setSelectedCountry,
  setSelectedRecipe,
  setServings
};
