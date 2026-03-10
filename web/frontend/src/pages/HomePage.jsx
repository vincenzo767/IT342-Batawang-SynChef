import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaClock,
  FaGlobe,
  FaHeart,
  FaMapMarkerAlt,
  FaPause,
  FaPlay,
  FaRegHeart,
  FaSearch,
  FaTimes,
  FaUtensils,
  FaArrowLeft,
  FaArrowRight,
  FaCheck,
  FaChevronDown,
  FaFire,
  FaUsers
} from "react-icons/fa";
import { ALL_RECIPES, REGIONS, COUNTRIES } from "../data/recipes";
import "./HomePage.css";
const FAV_KEY = "synchef_favorites";
const getFavorites = () => {
  try {
    return JSON.parse(localStorage.getItem(FAV_KEY) || "[]");
  } catch {
    return [];
  }
};
const saveFavorites = (ids) => localStorage.setItem(FAV_KEY, JSON.stringify(ids));
const RecipeModal = ({
  recipe,
  onClose,
  onStartCooking,
  isFav,
  onToggleFav
}) => {
  const [servings, setServings] = useState(recipe.servings);
  const scale = servings / recipe.servings;
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);
  return /* @__PURE__ */ jsx("div", { className: "hp-overlay", onClick: onClose, children: /* @__PURE__ */ jsxs(
    motion.div,
    {
      className: "hp-recipe-modal",
      initial: { opacity: 0, scale: 0.93, y: 30 },
      animate: { opacity: 1, scale: 1, y: 0 },
      exit: { opacity: 0, scale: 0.93, y: 30 },
      transition: { duration: 0.28 },
      onClick: (e) => e.stopPropagation(),
      children: [
        /* @__PURE__ */ jsxs("div", { className: "hp-modal-img-wrap", children: [
          /* @__PURE__ */ jsx("img", { src: recipe.image, alt: recipe.title }),
          /* @__PURE__ */ jsx("div", { className: "hp-modal-img-overlay" }),
          /* @__PURE__ */ jsx("button", { className: "hp-modal-close", onClick: onClose, children: /* @__PURE__ */ jsx(FaTimes, {}) }),
          /* @__PURE__ */ jsxs("div", { className: "hp-modal-hero-info", children: [
            /* @__PURE__ */ jsx("span", { className: "hp-modal-flag", children: recipe.flagEmoji }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("h2", { className: "hp-modal-title", children: recipe.title }),
              /* @__PURE__ */ jsxs("span", { className: "hp-modal-country", children: [
                recipe.country,
                " \u2014 ",
                recipe.cuisine
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "hp-modal-body", children: [
          /* @__PURE__ */ jsxs("div", { className: "hp-modal-stats", children: [
            /* @__PURE__ */ jsxs("div", { className: "hp-stat", children: [
              /* @__PURE__ */ jsx(FaClock, {}),
              /* @__PURE__ */ jsx("span", { children: recipe.time }),
              /* @__PURE__ */ jsx("small", { children: "Total Time" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "hp-stat", children: [
              /* @__PURE__ */ jsx(FaFire, {}),
              /* @__PURE__ */ jsx("span", { children: recipe.difficulty }),
              /* @__PURE__ */ jsx("small", { children: "Difficulty" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "hp-stat", children: [
              /* @__PURE__ */ jsx(FaUsers, {}),
              /* @__PURE__ */ jsx("span", { children: servings }),
              /* @__PURE__ */ jsx("small", { children: "Servings" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "hp-stat", children: [
              /* @__PURE__ */ jsx(FaMapMarkerAlt, {}),
              /* @__PURE__ */ jsx("span", { children: recipe.region }),
              /* @__PURE__ */ jsx("small", { children: "Region" })
            ] })
          ] }),
          /* @__PURE__ */ jsx("p", { className: "hp-modal-desc", children: recipe.description }),
          recipe.culturalContext && /* @__PURE__ */ jsxs("div", { className: "hp-modal-culture", children: [
            /* @__PURE__ */ jsx("span", { className: "hp-culture-icon", children: "\u{1F30D}" }),
            /* @__PURE__ */ jsx("p", { children: recipe.culturalContext })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "hp-modal-section", children: [
            /* @__PURE__ */ jsxs("div", { className: "hp-section-header", children: [
              /* @__PURE__ */ jsx("h3", { children: "Ingredients" }),
              /* @__PURE__ */ jsxs("div", { className: "hp-servings-ctrl", children: [
                /* @__PURE__ */ jsx("button", { onClick: () => setServings((s) => Math.max(1, s - 1)), children: "\u2212" }),
                /* @__PURE__ */ jsxs("span", { children: [
                  servings,
                  " servings"
                ] }),
                /* @__PURE__ */ jsx("button", { onClick: () => setServings((s) => s + 1), children: "+" })
              ] })
            ] }),
            /* @__PURE__ */ jsx("ul", { className: "hp-ingredients", children: recipe.ingredients.map((ing, i) => /* @__PURE__ */ jsxs("li", { className: ing.optional ? "optional" : "", children: [
              /* @__PURE__ */ jsx("span", { className: "hp-ing-amount", children: scale === 1 ? ing.amount : scaleAmount(ing.amount, scale) }),
              /* @__PURE__ */ jsxs("span", { className: "hp-ing-item", children: [
                ing.item,
                ing.prep ? `, ${ing.prep}` : "",
                ing.optional && /* @__PURE__ */ jsx("span", { className: "hp-optional-tag", children: "optional" })
              ] })
            ] }, i)) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "hp-modal-section", children: [
            /* @__PURE__ */ jsx("h3", { children: "Steps Overview" }),
            /* @__PURE__ */ jsx("ol", { className: "hp-steps-preview", children: recipe.steps.map((step, i) => /* @__PURE__ */ jsxs("li", { children: [
              /* @__PURE__ */ jsx("span", { className: "hp-step-num", children: i + 1 }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("p", { children: step.instruction }),
                step.timer && /* @__PURE__ */ jsxs("span", { className: "hp-step-timer", children: [
                  "\u23F1 ",
                  step.timerLabel,
                  " \u2014 ",
                  formatSeconds(step.timer)
                ] })
              ] })
            ] }, i)) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "hp-modal-actions", children: [
            /* @__PURE__ */ jsxs(
              "button",
              {
                className: `hp-fav-btn ${isFav ? "active" : ""}`,
                onClick: onToggleFav,
                children: [
                  isFav ? /* @__PURE__ */ jsx(FaHeart, {}) : /* @__PURE__ */ jsx(FaRegHeart, {}),
                  isFav ? "Saved to Favorites" : "Add to Favorites"
                ]
              }
            ),
            /* @__PURE__ */ jsxs("button", { className: "hp-cook-btn", onClick: onStartCooking, children: [
              /* @__PURE__ */ jsx(FaPlay, {}),
              " Cooking Time!"
            ] })
          ] })
        ] })
      ]
    }
  ) });
};
const CookingModal = ({
  recipe,
  onClose
}) => {
  const [stepIndex, setStepIndex] = useState(0);
  const [timers, setTimers] = useState({});
  const intervalRef = useRef(null);
  const step = recipe.steps[stepIndex];
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === recipe.steps.length - 1;
  const timer = timers[stepIndex];
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);
  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setTimers((prev) => {
        const updated = { ...prev };
        let changed = false;
        Object.keys(updated).forEach((k) => {
          const t = updated[+k];
          if (t.running && t.remaining > 0) {
            updated[+k] = { ...t, remaining: t.remaining - 1 };
            changed = true;
          } else if (t.running && t.remaining === 0) {
            updated[+k] = { ...t, running: false, completed: true };
            changed = true;
          }
        });
        return changed ? updated : prev;
      });
    }, 1e3);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);
  const startTimer = () => {
    if (!step.timer) return;
    setTimers((prev) => ({
      ...prev,
      [stepIndex]: { running: true, remaining: step.timer, started: true, completed: false }
    }));
  };
  const pauseResume = () => {
    setTimers((prev) => {
      const t = prev[stepIndex];
      if (!t) return prev;
      return { ...prev, [stepIndex]: { ...t, running: !t.running } };
    });
  };
  const goToStep = (idx) => {
    setTimers((prev) => {
      const t = prev[stepIndex];
      if (t?.running) return { ...prev, [stepIndex]: { ...t, running: false } };
      return prev;
    });
    setStepIndex(idx);
  };
  const ringProgress = timer && step.timer ? timer.remaining / step.timer * 283 : 283;
  const activeTimerEntries = Object.entries(timers).filter(([, t]) => t.started && !t.completed);
  return /* @__PURE__ */ jsx("div", { className: "hp-overlay hp-overlay-dark", onClick: onClose, children: /* @__PURE__ */ jsxs(
    motion.div,
    {
      className: "hp-cooking-modal",
      initial: { opacity: 0, y: 40 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: 40 },
      transition: { duration: 0.3 },
      onClick: (e) => e.stopPropagation(),
      children: [
        /* @__PURE__ */ jsxs("div", { className: "hp-ck-header", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h2", { children: recipe.title }),
            /* @__PURE__ */ jsxs("span", { className: "hp-ck-progress", children: [
              "Step ",
              stepIndex + 1,
              " of ",
              recipe.steps.length
            ] })
          ] }),
          /* @__PURE__ */ jsx("button", { className: "hp-ck-close", onClick: onClose, children: /* @__PURE__ */ jsx(FaTimes, {}) })
        ] }),
        activeTimerEntries.length > 0 && /* @__PURE__ */ jsx("div", { className: "hp-ck-timers-bar", children: activeTimerEntries.map(([k, t]) => {
          const s = recipe.steps[+k];
          return /* @__PURE__ */ jsxs("div", { className: `hp-ck-chip ${t.running ? "running" : "paused"}`, children: [
            /* @__PURE__ */ jsx("span", { children: s?.timerLabel || `Step ${+k + 1}` }),
            /* @__PURE__ */ jsx("span", { className: "hp-ck-chip-time", children: formatSeconds(t.remaining) })
          ] }, k);
        }) }),
        /* @__PURE__ */ jsx(AnimatePresence, { mode: "wait", children: /* @__PURE__ */ jsxs(
          motion.div,
          {
            className: "hp-ck-step-card",
            initial: { opacity: 0, x: 60 },
            animate: { opacity: 1, x: 0 },
            exit: { opacity: 0, x: -60 },
            transition: { duration: 0.25 },
            children: [
              /* @__PURE__ */ jsx("div", { className: "hp-ck-step-num", children: stepIndex + 1 }),
              /* @__PURE__ */ jsx("p", { className: "hp-ck-instruction", children: step.instruction }),
              step.timer && /* @__PURE__ */ jsx("div", { className: "hp-ck-timer-area", children: !timer?.started ? /* @__PURE__ */ jsxs("button", { className: "hp-ck-start-btn", onClick: startTimer, children: [
                /* @__PURE__ */ jsx(FaPlay, {}),
                " Start ",
                step.timerLabel || "Timer",
                " (",
                formatSeconds(step.timer),
                ")"
              ] }) : /* @__PURE__ */ jsxs("div", { className: "hp-ck-timer-display", children: [
                /* @__PURE__ */ jsxs("div", { className: "hp-ck-circle", children: [
                  /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 100 100", children: [
                    /* @__PURE__ */ jsx("circle", { cx: "50", cy: "50", r: "45", fill: "none", stroke: "rgba(255,255,255,0.1)", strokeWidth: "8" }),
                    /* @__PURE__ */ jsx(
                      "circle",
                      {
                        cx: "50",
                        cy: "50",
                        r: "45",
                        fill: "none",
                        stroke: timer.completed ? "#10b981" : "#667eea",
                        strokeWidth: "8",
                        strokeDasharray: `${ringProgress} 283`,
                        strokeLinecap: "round",
                        transform: "rotate(-90 50 50)"
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsx("div", { className: `hp-ck-circle-text ${timer.completed ? "done" : ""}`, children: timer.completed ? /* @__PURE__ */ jsx(FaCheck, {}) : formatSeconds(timer.remaining) })
                ] }),
                !timer.completed && /* @__PURE__ */ jsx("button", { className: "hp-ck-pause-btn", onClick: pauseResume, children: timer.running ? /* @__PURE__ */ jsxs(Fragment, { children: [
                  /* @__PURE__ */ jsx(FaPause, {}),
                  " Pause"
                ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
                  /* @__PURE__ */ jsx(FaPlay, {}),
                  " Resume"
                ] }) }),
                timer.completed && /* @__PURE__ */ jsx("span", { className: "hp-ck-done-label", children: "Done! Proceed to next step." })
              ] }) }),
              step.tip && /* @__PURE__ */ jsxs("div", { className: "hp-ck-tip", children: [
                /* @__PURE__ */ jsx("span", { children: "\u{1F4A1}" }),
                /* @__PURE__ */ jsx("p", { children: step.tip })
              ] })
            ]
          },
          stepIndex
        ) }),
        /* @__PURE__ */ jsxs("div", { className: "hp-ck-nav", children: [
          /* @__PURE__ */ jsxs(
            "button",
            {
              className: "hp-ck-nav-btn secondary",
              onClick: () => goToStep(stepIndex - 1),
              disabled: isFirst,
              children: [
                /* @__PURE__ */ jsx(FaArrowLeft, {}),
                " Previous"
              ]
            }
          ),
          /* @__PURE__ */ jsx("div", { className: "hp-ck-dots", children: recipe.steps.map((_, i) => /* @__PURE__ */ jsx(
            "button",
            {
              className: `hp-ck-dot ${i === stepIndex ? "active" : ""} ${i < stepIndex ? "done" : ""}`,
              onClick: () => goToStep(i)
            },
            i
          )) }),
          !isLast ? /* @__PURE__ */ jsxs("button", { className: "hp-ck-nav-btn primary", onClick: () => goToStep(stepIndex + 1), children: [
            "Next ",
            /* @__PURE__ */ jsx(FaArrowRight, {})
          ] }) : /* @__PURE__ */ jsxs("button", { className: "hp-ck-nav-btn success", onClick: onClose, children: [
            /* @__PURE__ */ jsx(FaCheck, {}),
            " Complete!"
          ] })
        ] })
      ]
    }
  ) });
};
function formatSeconds(s) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return m > 0 ? `${m}:${sec.toString().padStart(2, "0")}` : `${sec}s`;
}
function parseFraction(s) {
  if (s.includes("/")) {
    const [a, b] = s.split("/").map(Number);
    return b ? a / b : NaN;
  }
  return parseFloat(s);
}
function scaleAmount(amount, scale) {
  const match = amount.match(/^([\d.]+(?:\/[\d.]+)?)\s*(.*)/);
  if (!match) return amount;
  const base = parseFraction(match[1]);
  if (isNaN(base)) return amount;
  const scaled = Math.round(base * scale * 10) / 10;
  return `${scaled}${match[2] ? " " + match[2] : ""}`;
}
const HomePage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [activeRegion, setActiveRegion] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [favorites, setFavorites] = useState(getFavorites);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [cookingRecipe, setCookingRecipe] = useState(null);
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);
  const debounceRef = useRef(null);
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedQuery(searchQuery), 220);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchQuery]);
  const visibleRecipes = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    return ALL_RECIPES.filter((r) => {
      const matchSearch = !q || r.title.toLowerCase().includes(q) || r.cuisine.toLowerCase().includes(q) || r.country.toLowerCase().includes(q) || r.region.toLowerCase().includes(q) || r.ingredients.some((ing) => ing.item.toLowerCase().includes(q));
      const matchRegion = !activeRegion || r.region === activeRegion;
      const matchCountry = !selectedCountry || r.country === selectedCountry;
      return matchSearch && matchRegion && matchCountry;
    });
  }, [debouncedQuery, activeRegion, selectedCountry]);
  const hasFilters = Boolean(debouncedQuery || activeRegion || selectedCountry);
  const resetFilters = () => {
    setSearchQuery("");
    setDebouncedQuery("");
    setActiveRegion(null);
    setSelectedCountry("");
  };
  const toggleFav = useCallback((id) => {
    setFavorites((prev) => {
      const next = prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id];
      saveFavorites(next);
      return next;
    });
  }, []);
  const openRecipe = (recipe) => setSelectedRecipe(recipe);
  const closeRecipe = () => setSelectedRecipe(null);
  const openCooking = () => {
    setSelectedRecipe(null);
    setCookingRecipe(selectedRecipe);
  };
  const closeCooking = () => setCookingRecipe(null);
  return /* @__PURE__ */ jsxs("div", { className: "home-page", children: [
    /* @__PURE__ */ jsxs("div", { className: "synchef-gradient-bg", children: [
      /* @__PURE__ */ jsxs("div", { className: "container", children: [
        /* @__PURE__ */ jsxs("section", { className: "home-hero", children: [
          /* @__PURE__ */ jsxs(motion.h1, { className: "home-title", initial: { opacity: 0, y: -20 }, animate: { opacity: 1, y: 0 }, children: [
            "Discover ",
            /* @__PURE__ */ jsx("span", { children: "Global" }),
            " Flavors"
          ] }),
          /* @__PURE__ */ jsx(motion.p, { className: "home-subtitle", initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { delay: 0.1 }, children: "Search authentic recipes from every corner of the world. Real ingredients, real culture, real cooking." }),
          /* @__PURE__ */ jsxs(motion.div, { className: "hp-finder-wrap", initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.15 }, children: [
            /* @__PURE__ */ jsxs("div", { className: "hp-search-row", children: [
              /* @__PURE__ */ jsxs("div", { className: "hp-search-field", children: [
                /* @__PURE__ */ jsx(FaSearch, { className: "hp-search-icon" }),
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: "text",
                    value: searchQuery,
                    onChange: (e) => setSearchQuery(e.target.value),
                    placeholder: "Search recipe, ingredient, or country...",
                    className: "hp-search-input",
                    autoComplete: "off"
                  }
                ),
                searchQuery && /* @__PURE__ */ jsx("button", { className: "hp-search-clear", onClick: () => setSearchQuery(""), children: /* @__PURE__ */ jsx(FaTimes, {}) })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "hp-country-dropdown", children: [
                /* @__PURE__ */ jsxs(
                  "button",
                  {
                    className: "hp-country-btn",
                    onClick: () => setCountryDropdownOpen((o) => !o),
                    children: [
                      /* @__PURE__ */ jsx(FaGlobe, {}),
                      /* @__PURE__ */ jsx("span", { children: selectedCountry || "All Countries" }),
                      /* @__PURE__ */ jsx(FaChevronDown, { className: countryDropdownOpen ? "rotated" : "" })
                    ]
                  }
                ),
                countryDropdownOpen && /* @__PURE__ */ jsxs("div", { className: "hp-country-list", children: [
                  /* @__PURE__ */ jsx("button", { onClick: () => {
                    setSelectedCountry("");
                    setCountryDropdownOpen(false);
                  }, children: "All Countries" }),
                  COUNTRIES.map((c) => /* @__PURE__ */ jsxs(
                    "button",
                    {
                      className: selectedCountry === c ? "selected" : "",
                      onClick: () => {
                        setSelectedCountry(c);
                        setCountryDropdownOpen(false);
                      },
                      children: [
                        ALL_RECIPES.find((r) => r.country === c)?.flagEmoji,
                        " ",
                        c
                      ]
                    },
                    c
                  ))
                ] })
              ] })
            ] }),
            hasFilters && /* @__PURE__ */ jsxs("div", { className: "hp-search-meta", children: [
              /* @__PURE__ */ jsxs("span", { children: [
                visibleRecipes.length,
                " recipe",
                visibleRecipes.length !== 1 ? "s" : "",
                " found"
              ] }),
              /* @__PURE__ */ jsxs("button", { className: "hp-clear-all", onClick: resetFilters, children: [
                /* @__PURE__ */ jsx(FaTimes, {}),
                " Clear all"
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "hero-actions", children: /* @__PURE__ */ jsx("a", { href: "/flavor-map", className: "hero-action-primary", children: "Explore the Flavor Map" }) })
        ] }),
        !hasFilters && /* @__PURE__ */ jsxs("section", { className: "home-features", children: [
          /* @__PURE__ */ jsxs("article", { className: "home-feature-card", children: [
            /* @__PURE__ */ jsx("div", { className: "feature-icon-wrap", children: /* @__PURE__ */ jsx(FaGlobe, {}) }),
            /* @__PURE__ */ jsx("h3", { children: "Global Cuisine Explorer" }),
            /* @__PURE__ */ jsx("p", { children: "Discover authentic recipes from 6 continents with cultural insights." })
          ] }),
          /* @__PURE__ */ jsxs("article", { className: "home-feature-card", children: [
            /* @__PURE__ */ jsx("div", { className: "feature-icon-wrap", children: /* @__PURE__ */ jsx(FaUtensils, {}) }),
            /* @__PURE__ */ jsx("h3", { children: "Step-by-Step Cooking Mode" }),
            /* @__PURE__ */ jsx("p", { children: "Guided tutorials with integrated timers for every step." })
          ] }),
          /* @__PURE__ */ jsxs("article", { className: "home-feature-card", children: [
            /* @__PURE__ */ jsx("div", { className: "feature-icon-wrap", children: /* @__PURE__ */ jsx(FaMapMarkerAlt, {}) }),
            /* @__PURE__ */ jsx("h3", { children: "Cultural Deep Dives" }),
            /* @__PURE__ */ jsx("p", { children: "Learn the stories and traditions behind every dish." })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("section", { className: "hp-region-pills", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              className: `hp-region-pill ${!activeRegion ? "active" : ""}`,
              onClick: () => setActiveRegion(null),
              children: "All"
            }
          ),
          REGIONS.map((r) => /* @__PURE__ */ jsx(
            "button",
            {
              className: `hp-region-pill ${activeRegion === r ? "active" : ""}`,
              onClick: () => setActiveRegion((prev) => prev === r ? null : r),
              children: r
            },
            r
          ))
        ] }),
        /* @__PURE__ */ jsxs("section", { className: "recipe-section", children: [
          /* @__PURE__ */ jsx("div", { className: "recipe-section-header", children: /* @__PURE__ */ jsx("h2", { children: hasFilters ? "Search Results" : "Featured Recipes" }) }),
          visibleRecipes.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "empty-recipe-state", children: [
            /* @__PURE__ */ jsx(FaSearch, { style: { fontSize: "2rem", opacity: 0.5, marginBottom: 10 } }),
            /* @__PURE__ */ jsx("p", { children: "No recipes found \u2014 try a different search term or country." }),
            /* @__PURE__ */ jsx("button", { className: "hp-clear-all-center", onClick: resetFilters, children: "Clear filters" })
          ] }) : /* @__PURE__ */ jsx("div", { className: "recipe-grid", children: visibleRecipes.map((recipe) => /* @__PURE__ */ jsxs(
            "article",
            {
              className: "synchef-recipe-card",
              onClick: () => openRecipe(recipe),
              role: "button",
              tabIndex: 0,
              onKeyDown: (e) => e.key === "Enter" && openRecipe(recipe),
              children: [
                /* @__PURE__ */ jsxs("div", { className: "hp-card-img-wrap", children: [
                  /* @__PURE__ */ jsx("img", { src: recipe.image, alt: recipe.title, loading: "lazy" }),
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      className: `hp-card-fav ${favorites.includes(recipe.id) ? "active" : ""}`,
                      onClick: (e) => {
                        e.stopPropagation();
                        toggleFav(recipe.id);
                      },
                      title: favorites.includes(recipe.id) ? "Remove from favorites" : "Add to favorites",
                      children: favorites.includes(recipe.id) ? /* @__PURE__ */ jsx(FaHeart, {}) : /* @__PURE__ */ jsx(FaRegHeart, {})
                    }
                  ),
                  /* @__PURE__ */ jsxs("span", { className: "hp-card-country-badge", children: [
                    recipe.flagEmoji,
                    " ",
                    recipe.country
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "synchef-recipe-body", children: [
                  /* @__PURE__ */ jsxs("div", { className: "recipe-badges", children: [
                    /* @__PURE__ */ jsx("span", { className: "cuisine-badge", children: recipe.cuisine }),
                    /* @__PURE__ */ jsx("span", { className: "difficulty-badge", children: recipe.difficulty })
                  ] }),
                  /* @__PURE__ */ jsx("h3", { children: recipe.title }),
                  /* @__PURE__ */ jsxs("p", { className: "hp-card-desc", children: [
                    recipe.description.slice(0, 80),
                    "\u2026"
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "recipe-meta-row", children: [
                    /* @__PURE__ */ jsxs("span", { children: [
                      /* @__PURE__ */ jsx(FaClock, {}),
                      " ",
                      recipe.time
                    ] }),
                    /* @__PURE__ */ jsxs("span", { children: [
                      /* @__PURE__ */ jsx(FaUsers, {}),
                      " ",
                      recipe.servings,
                      " servings"
                    ] })
                  ] })
                ] })
              ]
            },
            recipe.id
          )) })
        ] })
      ] }),
      /* @__PURE__ */ jsx("footer", { className: "home-footer", children: /* @__PURE__ */ jsxs("div", { className: "container home-footer-inner", children: [
        /* @__PURE__ */ jsxs("div", { className: "footer-brand", children: [
          /* @__PURE__ */ jsx(FaUtensils, {}),
          /* @__PURE__ */ jsx("span", { children: "SynChef" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "footer-links", children: [
          /* @__PURE__ */ jsx("button", { type: "button", children: "Privacy Policy" }),
          /* @__PURE__ */ jsx("button", { type: "button", children: "Terms of Service" }),
          /* @__PURE__ */ jsx("button", { type: "button", children: "Contact Us" })
        ] }),
        /* @__PURE__ */ jsx("p", { children: "\xA9 2026 SynChef AI. All rights reserved." })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxs(AnimatePresence, { children: [
      selectedRecipe && !cookingRecipe && /* @__PURE__ */ jsx(
        RecipeModal,
        {
          recipe: selectedRecipe,
          onClose: closeRecipe,
          onStartCooking: openCooking,
          isFav: favorites.includes(selectedRecipe.id),
          onToggleFav: () => toggleFav(selectedRecipe.id)
        },
        "recipe-modal"
      ),
      cookingRecipe && /* @__PURE__ */ jsx(
        CookingModal,
        {
          recipe: cookingRecipe,
          onClose: closeCooking
        },
        "cooking-modal"
      )
    ] })
  ] });
};
var HomePage_default = HomePage;
export {
  HomePage_default as default
};
