import { jsx, jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaPlay, FaPause, FaArrowLeft, FaArrowRight, FaCheck } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { recipeApi } from "../api";
import { startTimer, pauseTimer, resumeTimer, updateTimerRemaining, completeTimer } from "../store/timerSlice";
import { nextStep, previousStep, setCurrentStepIndex } from "../store/uiSlice";
import "./CookingModePage.css";
const CookingModePage = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();
  const [scaledRecipe, setScaledRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const currentStepIndex = useSelector((state) => state.ui.currentStepIndex);
  const activeTimers = useSelector((state) => state.timers.activeTimers);
  useEffect(() => {
    if (id) {
      const servings = parseInt(searchParams.get("servings") || "4");
      loadScaledRecipe(parseInt(id), servings);
    }
  }, [id, searchParams]);
  useEffect(() => {
    const interval = setInterval(() => {
      activeTimers.forEach((timer) => {
        if (timer.state === "RUNNING") {
          const elapsed = Math.floor((Date.now() - timer.startTime) / 1e3);
          const remaining = Math.max(0, timer.durationSeconds - elapsed);
          dispatch(updateTimerRemaining({ stepId: timer.stepId, remaining }));
          if (remaining === 0) {
            dispatch(completeTimer(timer.stepId));
            playNotificationSound();
          }
        }
      });
    }, 1e3);
    return () => clearInterval(interval);
  }, [activeTimers, dispatch]);
  const loadScaledRecipe = async (recipeId, servings) => {
    try {
      const response = await recipeApi.getScaled(recipeId, servings);
      setScaledRecipe(response.data);
    } catch (error) {
      console.error("Failed to load scaled recipe:", error);
    } finally {
      setLoading(false);
    }
  };
  const handleStartTimer = (stepId, durationSeconds, timerLabel) => {
    const timer = {
      stepId,
      timerLabel,
      durationSeconds,
      remainingSeconds: durationSeconds,
      state: "RUNNING",
      startTime: Date.now()
    };
    dispatch(startTimer(timer));
  };
  const handlePauseTimer = (stepId) => {
    dispatch(pauseTimer(stepId));
  };
  const handleResumeTimer = (stepId) => {
    dispatch(resumeTimer(stepId));
  };
  const playNotificationSound = () => {
    const audio = new Audio("/notification.mp3");
    audio.play().catch(() => console.log("Could not play notification"));
  };
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };
  if (loading || !scaledRecipe) {
    return /* @__PURE__ */ jsx("div", { className: "cooking-mode-page", children: /* @__PURE__ */ jsx("div", { className: "loading", children: /* @__PURE__ */ jsx("div", { className: "spinner" }) }) });
  }
  const currentStep = scaledRecipe.scaledSteps[currentStepIndex];
  const isLastStep = currentStepIndex === scaledRecipe.scaledSteps.length - 1;
  const currentTimer = activeTimers.find((t) => t.stepId === currentStep?.stepId);
  return /* @__PURE__ */ jsxs("div", { className: "cooking-mode-page", children: [
    /* @__PURE__ */ jsxs("div", { className: "cooking-header", children: [
      /* @__PURE__ */ jsx("h2", { children: scaledRecipe.recipeName }),
      /* @__PURE__ */ jsxs("div", { className: "progress-indicator", children: [
        "Step ",
        currentStepIndex + 1,
        " of ",
        scaledRecipe.scaledSteps.length
      ] })
    ] }),
    activeTimers.length > 0 && /* @__PURE__ */ jsx("div", { className: "active-timers-bar", children: activeTimers.map((timer) => /* @__PURE__ */ jsxs(
      "div",
      {
        className: `timer-chip ${timer.state.toLowerCase()}`,
        children: [
          /* @__PURE__ */ jsx("span", { children: timer.timerLabel }),
          /* @__PURE__ */ jsx("span", { className: "timer-display", children: formatTime(timer.remainingSeconds) }),
          timer.state === "COMPLETED" && /* @__PURE__ */ jsx(FaCheck, {})
        ]
      },
      timer.stepId
    )) }),
    /* @__PURE__ */ jsx(AnimatePresence, { mode: "wait", children: /* @__PURE__ */ jsxs(
      motion.div,
      {
        initial: { opacity: 0, x: 100 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -100 },
        transition: { duration: 0.3 },
        className: "step-focus-card",
        children: [
          /* @__PURE__ */ jsx("div", { className: "step-number-large", children: currentStep.orderIndex }),
          /* @__PURE__ */ jsx("div", { className: "step-instruction-large", children: /* @__PURE__ */ jsx("p", { children: currentStep.instruction }) }),
          currentStep.hasTimer && currentStep.scaledTimerSeconds && /* @__PURE__ */ jsx("div", { className: "timer-control", children: !currentTimer ? /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => handleStartTimer(
                currentStep.stepId,
                currentStep.scaledTimerSeconds,
                currentStep.timerLabel || "Timer"
              ),
              className: "btn btn-primary btn-large",
              children: [
                /* @__PURE__ */ jsx(FaPlay, {}),
                "Start Timer: ",
                formatTime(currentStep.scaledTimerSeconds)
              ]
            }
          ) : /* @__PURE__ */ jsxs("div", { className: "timer-display-large", children: [
            /* @__PURE__ */ jsxs("div", { className: "timer-circle", children: [
              /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 100 100", children: [
                /* @__PURE__ */ jsx(
                  "circle",
                  {
                    cx: "50",
                    cy: "50",
                    r: "45",
                    fill: "none",
                    stroke: "#e5e7eb",
                    strokeWidth: "8"
                  }
                ),
                /* @__PURE__ */ jsx(
                  "circle",
                  {
                    cx: "50",
                    cy: "50",
                    r: "45",
                    fill: "none",
                    stroke: "#667eea",
                    strokeWidth: "8",
                    strokeDasharray: `${currentTimer.remainingSeconds / currentTimer.durationSeconds * 283} 283`,
                    strokeLinecap: "round",
                    transform: "rotate(-90 50 50)"
                  }
                )
              ] }),
              /* @__PURE__ */ jsx("div", { className: "timer-text", children: formatTime(currentTimer.remainingSeconds) })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "timer-controls", children: currentTimer.state === "RUNNING" ? /* @__PURE__ */ jsxs(
              "button",
              {
                onClick: () => handlePauseTimer(currentStep.stepId),
                className: "btn btn-secondary",
                children: [
                  /* @__PURE__ */ jsx(FaPause, {}),
                  "Pause"
                ]
              }
            ) : /* @__PURE__ */ jsxs(
              "button",
              {
                onClick: () => handleResumeTimer(currentStep.stepId),
                className: "btn btn-primary",
                children: [
                  /* @__PURE__ */ jsx(FaPlay, {}),
                  "Resume"
                ]
              }
            ) })
          ] }) }),
          currentStep.tips && /* @__PURE__ */ jsxs("div", { className: "step-tip-large", children: [
            /* @__PURE__ */ jsx("span", { className: "tip-icon", children: "\u{1F4A1}" }),
            /* @__PURE__ */ jsx("p", { children: currentStep.tips })
          ] })
        ]
      },
      currentStepIndex
    ) }),
    /* @__PURE__ */ jsxs("div", { className: "step-navigation", children: [
      /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => dispatch(previousStep()),
          disabled: currentStepIndex === 0,
          className: "btn btn-secondary",
          children: [
            /* @__PURE__ */ jsx(FaArrowLeft, {}),
            "Previous"
          ]
        }
      ),
      /* @__PURE__ */ jsx("div", { className: "step-dots", children: scaledRecipe.scaledSteps.map((_, index) => /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => dispatch(setCurrentStepIndex(index)),
          className: `step-dot ${index === currentStepIndex ? "active" : ""} ${index < currentStepIndex ? "completed" : ""}`
        },
        index
      )) }),
      !isLastStep ? /* @__PURE__ */ jsxs("button", { onClick: () => dispatch(nextStep()), className: "btn btn-primary", children: [
        "Next",
        /* @__PURE__ */ jsx(FaArrowRight, {})
      ] }) : /* @__PURE__ */ jsxs("button", { className: "btn btn-primary", children: [
        /* @__PURE__ */ jsx(FaCheck, {}),
        "Complete"
      ] })
    ] })
  ] });
};
var CookingModePage_default = CookingModePage;
export {
  CookingModePage_default as default
};
