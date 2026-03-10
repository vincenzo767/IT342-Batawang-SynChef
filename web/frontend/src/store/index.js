import { configureStore } from "@reduxjs/toolkit";
import recipeReducer from "./recipeSlice";
import timerReducer from "./timerSlice";
import uiReducer from "./uiSlice";
import authReducer from "./authSlice";
const store = configureStore({
  reducer: {
    recipes: recipeReducer,
    timers: timerReducer,
    ui: uiReducer,
    auth: authReducer
  }
});
var store_default = store;
export {
  store_default as default,
  store
};
