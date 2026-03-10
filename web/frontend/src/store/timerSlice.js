import { createSlice } from "@reduxjs/toolkit";
const initialState = {
  activeTimers: [],
  sessionId: Math.random().toString(36).substring(2, 11),
  isConnected: false
};
const timerSlice = createSlice({
  name: "timers",
  initialState,
  reducers: {
    startTimer: (state, action) => {
      const existing = state.activeTimers.find((t) => t.stepId === action.payload.stepId);
      if (!existing) {
        state.activeTimers.push(action.payload);
      }
    },
    pauseTimer: (state, action) => {
      const timer = state.activeTimers.find((t) => t.stepId === action.payload);
      if (timer) {
        timer.state = "PAUSED";
      }
    },
    resumeTimer: (state, action) => {
      const timer = state.activeTimers.find((t) => t.stepId === action.payload);
      if (timer?.state === "PAUSED") {
        timer.state = "RUNNING";
        timer.startTime = Date.now();
      }
    },
    updateTimerRemaining: (state, action) => {
      const timer = state.activeTimers.find((t) => t.stepId === action.payload.stepId);
      if (timer) {
        timer.remainingSeconds = action.payload.remaining;
        if (timer.remainingSeconds <= 0) {
          timer.state = "COMPLETED";
        }
      }
    },
    completeTimer: (state, action) => {
      const timer = state.activeTimers.find((t) => t.stepId === action.payload);
      if (timer) {
        timer.state = "COMPLETED";
        timer.remainingSeconds = 0;
      }
    },
    removeTimer: (state, action) => {
      state.activeTimers = state.activeTimers.filter((t) => t.stepId !== action.payload);
    },
    clearAllTimers: (state) => {
      state.activeTimers = [];
    },
    setConnectionStatus: (state, action) => {
      state.isConnected = action.payload;
    }
  }
});
const {
  startTimer,
  pauseTimer,
  resumeTimer,
  updateTimerRemaining,
  completeTimer,
  removeTimer,
  clearAllTimers,
  setConnectionStatus
} = timerSlice.actions;
var timerSlice_default = timerSlice.reducer;
export {
  clearAllTimers,
  completeTimer,
  timerSlice_default as default,
  pauseTimer,
  removeTimer,
  resumeTimer,
  setConnectionStatus,
  startTimer,
  updateTimerRemaining
};
