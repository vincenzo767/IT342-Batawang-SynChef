import { createSlice } from "@reduxjs/toolkit";
const initialState = {
  isFocusMode: false,
  currentStepIndex: 0,
  showFlavorMap: false,
  selectedContinent: null,
  theme: "light"
};
const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    toggleFocusMode: (state) => {
      state.isFocusMode = !state.isFocusMode;
    },
    setFocusMode: (state, action) => {
      state.isFocusMode = action.payload;
    },
    nextStep: (state) => {
      state.currentStepIndex += 1;
    },
    previousStep: (state) => {
      if (state.currentStepIndex > 0) {
        state.currentStepIndex -= 1;
      }
    },
    setCurrentStepIndex: (state, action) => {
      state.currentStepIndex = action.payload;
    },
    toggleFlavorMap: (state) => {
      state.showFlavorMap = !state.showFlavorMap;
    },
    setSelectedContinent: (state, action) => {
      state.selectedContinent = action.payload;
    },
    toggleTheme: (state) => {
      state.theme = state.theme === "light" ? "dark" : "light";
    }
  }
});
const {
  toggleFocusMode,
  setFocusMode,
  nextStep,
  previousStep,
  setCurrentStepIndex,
  toggleFlavorMap,
  setSelectedContinent,
  toggleTheme
} = uiSlice.actions;
var uiSlice_default = uiSlice.reducer;
export {
  uiSlice_default as default,
  nextStep,
  previousStep,
  setCurrentStepIndex,
  setFocusMode,
  setSelectedContinent,
  toggleFlavorMap,
  toggleFocusMode,
  toggleTheme
};
