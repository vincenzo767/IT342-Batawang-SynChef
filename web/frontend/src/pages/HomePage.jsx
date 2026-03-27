import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { setFavorites } from "../store/authSlice";
import { userApi } from "../api";
import {
  FaClock, FaGlobe, FaHeart, FaMapMarkerAlt, FaPause, FaPlay,
  FaRegHeart, FaSearch, FaTimes, FaUtensils, FaArrowLeft, FaArrowRight,
  FaCheck, FaChevronDown, FaFire, FaUsers, FaStar
} from "react-icons/fa";
import { ALL_RECIPES, REGIONS, COUNTRIES } from "../data/recipes";
import "./HomePage.css";

// Get user country from localStorage (set during registration)
const getUserCountry = () => {
  try {
    const raw = localStorage.getItem("userCountry");
    if (!raw) return null;
    // Support both JSON {code, name} format (new) and plain string (old)
    if (raw.startsWith("{")) return JSON.parse(raw);
    return { code: raw, name: raw };
  } catch {
    return null;
  }
};

// Country name → recipe country lookup map (ISO code → recipe country name)
const COUNTRY_CODE_TO_RECIPE_COUNTRY = {
  IT: "Italy", TH: "Thailand", MX: "Mexico", JP: "Japan", IN: "India",
  ES: "Spain", KR: "South Korea", VN: "Vietnam", MA: "Morocco", CN: "China",
  FR: "France", BR: "Brazil", US: "United States", JM: "Jamaica", SE: "Sweden",
  PH: "Philippines", LB: "Lebanon", ID: "Indonesia", DE: "Germany", GR: "Greece",
  TR: "Turkey", PE: "Peru", AR: "Argentina", EG: "Egypt", CO: "Colombia",
  AU: "Australia", PT: "Portugal", NG: "Nigeria", NZ: "New Zealand"
};

// Get recommended recipes for a country code (by country + same region)
const getRecommendedRecipes = (countryCode, countryName) => {
  if (!countryCode && !countryName) return [];
  const recipeCountry = COUNTRY_CODE_TO_RECIPE_COUNTRY[countryCode?.toUpperCase()] || countryName;

  // Exact country match first
  const exact = ALL_RECIPES.filter((r) => r.country.toLowerCase() === recipeCountry?.toLowerCase());
  if (exact.length >= 3) return exact.slice(0, 6);

  // Supplement with same-region recipes
  const region = exact[0]?.region;
  const regional = region
    ? ALL_RECIPES.filter((r) => r.region === region && r.country.toLowerCase() !== recipeCountry?.toLowerCase())
    : [];

  return [...exact, ...regional].slice(0, 6);
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

const RecipeModal = ({ recipe, onClose, onStartCooking, isFav, onToggleFav }) => {
  const [servings, setServings] = useState(recipe.servings);
  const scale = servings / recipe.servings;
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <div className="hp-overlay" onClick={onClose}>
      <motion.div
        className="hp-recipe-modal"
        initial={{ opacity: 0, scale: 0.93, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.93, y: 30 }}
        transition={{ duration: 0.28 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="hp-modal-img-wrap">
          <img src={recipe.image} alt={recipe.title} />
          <div className="hp-modal-img-overlay" />
          <button className="hp-modal-close" onClick={onClose}><FaTimes /></button>
          <div className="hp-modal-hero-info">
            <span className="hp-modal-flag">{recipe.flagEmoji}</span>
            <div>
              <h2 className="hp-modal-title">{recipe.title}</h2>
              <span className="hp-modal-country">{recipe.country} — {recipe.cuisine}</span>
            </div>
          </div>
        </div>
        <div className="hp-modal-body">
          <div className="hp-modal-stats">
            <div className="hp-stat"><FaClock /><span>{recipe.time}</span><small>Total Time</small></div>
            <div className="hp-stat"><FaFire /><span>{recipe.difficulty}</span><small>Difficulty</small></div>
            <div className="hp-stat"><FaUsers /><span>{servings}</span><small>Servings</small></div>
            <div className="hp-stat"><FaMapMarkerAlt /><span>{recipe.region}</span><small>Region</small></div>
          </div>
          <p className="hp-modal-desc">{recipe.description}</p>
          {recipe.culturalContext && (
            <div className="hp-modal-culture">
              <span className="hp-culture-icon">🌍</span>
              <p>{recipe.culturalContext}</p>
            </div>
          )}
          <div className="hp-modal-section">
            <div className="hp-section-header">
              <h3>Ingredients</h3>
              <div className="hp-servings-ctrl">
                <button onClick={() => setServings((s) => Math.max(1, s - 1))}>−</button>
                <span>{servings} servings</span>
                <button onClick={() => setServings((s) => s + 1)}>+</button>
              </div>
            </div>
            <ul className="hp-ingredients">
              {recipe.ingredients.map((ing, i) => (
                <li key={i} className={ing.optional ? "optional" : ""}>
                  <span className="hp-ing-amount">{scale === 1 ? ing.amount : scaleAmount(ing.amount, scale)}</span>
                  <span className="hp-ing-item">
                    {ing.item}{ing.prep ? `, ${ing.prep}` : ""}
                    {ing.optional && <span className="hp-optional-tag">optional</span>}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div className="hp-modal-section">
            <h3>Steps Overview</h3>
            <ol className="hp-steps-preview">
              {recipe.steps.map((step, i) => (
                <li key={i}>
                  <span className="hp-step-num">{i + 1}</span>
                  <div>
                    <p>{step.instruction}</p>
                    {step.timer && (
                      <span className="hp-step-timer">⏱ {step.timerLabel} — {formatSeconds(step.timer)}</span>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <div className="hp-modal-actions">
            <button className={`hp-fav-btn ${isFav ? "active" : ""}`} onClick={onToggleFav}>
              {isFav ? <FaHeart /> : <FaRegHeart />}
              {isFav ? "Saved to Favorites" : "Add to Favorites"}
            </button>
            <button className="hp-cook-btn" onClick={onStartCooking}>
              <FaPlay /> Cooking Time!
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const CookingModal = ({ recipe, onClose }) => {
  const [stepIndex, setStepIndex] = useState(0);
  const [timers, setTimers] = useState({});
  const intervalRef = useRef(null);
  const step = recipe.steps[stepIndex];
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === recipe.steps.length - 1;
  const timer = timers[stepIndex];

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setTimers((prev) => {
        const updated = { ...prev };
        let changed = false;
        Object.keys(updated).forEach((k) => {
          const t = updated[+k];
          if (t.running && t.remaining > 0) { updated[+k] = { ...t, remaining: t.remaining - 1 }; changed = true; }
          else if (t.running && t.remaining === 0) { updated[+k] = { ...t, running: false, completed: true }; changed = true; }
        });
        return changed ? updated : prev;
      });
    }, 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  const startTimer = () => {
    if (!step.timer) return;
    setTimers((prev) => ({ ...prev, [stepIndex]: { running: true, remaining: step.timer, started: true, completed: false } }));
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

  const ringProgress = timer && step.timer ? (timer.remaining / step.timer) * 283 : 283;
  const activeTimerEntries = Object.entries(timers).filter(([, t]) => t.started && !t.completed);

  return (
    <div className="hp-overlay hp-overlay-dark" onClick={onClose}>
      <motion.div
        className="hp-cooking-modal"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        transition={{ duration: 0.3 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="hp-ck-header">
          <div>
            <h2>{recipe.title}</h2>
            <span className="hp-ck-progress">Step {stepIndex + 1} of {recipe.steps.length}</span>
          </div>
          <button className="hp-ck-close" onClick={onClose}><FaTimes /></button>
        </div>

        {activeTimerEntries.length > 0 && (
          <div className="hp-ck-timers-bar">
            {activeTimerEntries.map(([k, t]) => {
              const s = recipe.steps[+k];
              return (
                <div key={k} className={`hp-ck-chip ${t.running ? "running" : "paused"}`}>
                  <span>{s?.timerLabel || `Step ${+k + 1}`}</span>
                  <span className="hp-ck-chip-time">{formatSeconds(t.remaining)}</span>
                </div>
              );
            })}
          </div>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={stepIndex}
            className="hp-ck-step-card"
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -60 }}
            transition={{ duration: 0.25 }}
          >
            <div className="hp-ck-step-num">{stepIndex + 1}</div>
            <p className="hp-ck-instruction">{step.instruction}</p>
            {step.timer && (
              <div className="hp-ck-timer-area">
                {!timer?.started ? (
                  <button className="hp-ck-start-btn" onClick={startTimer}>
                    <FaPlay /> Start {step.timerLabel || "Timer"} ({formatSeconds(step.timer)})
                  </button>
                ) : (
                  <div className="hp-ck-timer-display">
                    <div className="hp-ck-circle">
                      <svg viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
                        <circle
                          cx="50" cy="50" r="45" fill="none"
                          stroke={timer.completed ? "#10b981" : "#667eea"}
                          strokeWidth="8"
                          strokeDasharray={`${ringProgress} 283`}
                          strokeLinecap="round"
                          transform="rotate(-90 50 50)"
                        />
                      </svg>
                      <div className={`hp-ck-circle-text ${timer.completed ? "done" : ""}`}>
                        {timer.completed ? <FaCheck /> : formatSeconds(timer.remaining)}
                      </div>
                    </div>
                    {!timer.completed && (
                      <button className="hp-ck-pause-btn" onClick={pauseResume}>
                        {timer.running ? <Fragment><FaPause /> Pause</Fragment> : <Fragment><FaPlay /> Resume</Fragment>}
                      </button>
                    )}
                    {timer.completed && <span className="hp-ck-done-label">Done! Proceed to next step.</span>}
                  </div>
                )}
              </div>
            )}
            {step.tip && (
              <div className="hp-ck-tip"><span>💡</span><p>{step.tip}</p></div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="hp-ck-nav">
          <button className="hp-ck-nav-btn secondary" onClick={() => goToStep(stepIndex - 1)} disabled={isFirst}>
            <FaArrowLeft /> Previous
          </button>
          <div className="hp-ck-dots">
            {recipe.steps.map((_, i) => (
              <button
                key={i}
                className={`hp-ck-dot ${i === stepIndex ? "active" : ""} ${i < stepIndex ? "done" : ""}`}
                onClick={() => goToStep(i)}
              />
            ))}
          </div>
          {!isLast ? (
            <button className="hp-ck-nav-btn primary" onClick={() => goToStep(stepIndex + 1)}>
              Next <FaArrowRight />
            </button>
          ) : (
            <button className="hp-ck-nav-btn success" onClick={onClose}>
              <FaCheck /> Complete!
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

const RecipeCard = ({ recipe, isFav, onOpen, onToggleFav }) => (
  <article
    className="synchef-recipe-card"
    onClick={() => onOpen(recipe)}
    role="button"
    tabIndex={0}
    onKeyDown={(e) => e.key === "Enter" && onOpen(recipe)}
  >
    <div className="hp-card-img-wrap">
      <img src={recipe.image} alt={recipe.title} loading="lazy" />
      <button
        className={`hp-card-fav ${isFav ? "active" : ""}`}
        onClick={(e) => { e.stopPropagation(); onToggleFav(recipe.id); }}
        title={isFav ? "Remove from favorites" : "Add to favorites"}
      >
        {isFav ? <FaHeart /> : <FaRegHeart />}
      </button>
      <span className="hp-card-country-badge">{recipe.flagEmoji} {recipe.country}</span>
    </div>
    <div className="synchef-recipe-body">
      <div className="recipe-badges">
        <span className="cuisine-badge">{recipe.cuisine}</span>
        <span className="difficulty-badge">{recipe.difficulty}</span>
      </div>
      <h3>{recipe.title}</h3>
      <p className="hp-card-desc">{recipe.description.slice(0, 80)}…</p>
      <div className="recipe-meta-row">
        <span><FaClock /> {recipe.time}</span>
        <span><FaUsers /> {recipe.servings} servings</span>
      </div>
    </div>
  </article>
);

const HomePage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [activeRegion, setActiveRegion] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [favorites, setLocalFavorites] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [cookingRecipe, setCookingRecipe] = useState(null);
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);
  const [loginPrompt, setLoginPrompt] = useState(false);
  const debounceRef = useRef(null);
  const loginPromptRef = useRef(null);
  const dispatch = useDispatch();

  // Read auth state and user country
  const { user, isAuthenticated, favoriteRecipeIds } = useSelector((state) => state.auth);

  // Sync local favorites mirror from top-level Redux state (no localStorage)
  useEffect(() => {
    if (isAuthenticated) {
      setLocalFavorites(favoriteRecipeIds || []);
    } else {
      setLocalFavorites([]);
    }
  }, [isAuthenticated, favoriteRecipeIds]);
  const userCountry = useMemo(() => {
    // Try Redux user first (set on login), then localStorage
    if (user?.countryCode || user?.countryName) {
      return { code: user.countryCode || "", name: user.countryName || "" };
    }
    return getUserCountry();
  }, [user]);

  const recommendedRecipes = useMemo(() => {
    if (!isAuthenticated || !userCountry) return [];
    return getRecommendedRecipes(userCountry.code, userCountry.name);
  }, [isAuthenticated, userCountry]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedQuery(searchQuery), 220);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [searchQuery]);

  const visibleRecipes = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    return ALL_RECIPES.filter((r) => {
      const matchSearch = !q ||
        r.title.toLowerCase().includes(q) ||
        r.cuisine.toLowerCase().includes(q) ||
        r.country.toLowerCase().includes(q) ||
        r.region.toLowerCase().includes(q) ||
        r.ingredients.some((ing) => ing.item.toLowerCase().includes(q));
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

  const showLoginPrompt = useCallback(() => {
    setLoginPrompt(true);
    if (loginPromptRef.current) clearTimeout(loginPromptRef.current);
    loginPromptRef.current = setTimeout(() => setLoginPrompt(false), 3000);
  }, []);

  // Mobile stores web recipe IDs with +10000 offset. Check both when reading/toggling favorites.
  const FALLBACK_OFFSET = 10000;

  // Returns the ID actually stored in the favorites list for the given web recipe ID,
  // or null if not saved. Checks both the web ID and the mobile fallback ID.
  const getStoredFavId = useCallback((webId) => {
    if (favorites.includes(webId)) return webId;
    const fallbackId = webId + FALLBACK_OFFSET;
    if (favorites.includes(fallbackId)) return fallbackId;
    return null;
  }, [favorites]);

  const toggleFav = useCallback(async (id) => {
    if (!isAuthenticated) {
      showLoginPrompt();
      return;
    }
    const storedId = getStoredFavId(id);
    const isCurrent = storedId !== null;
    // Optimistic update — mirror the backend result locally
    setLocalFavorites((prev) =>
      isCurrent ? prev.filter((f) => f !== storedId) : [...prev, id]
    );
    try {
      const response = isCurrent
        ? await userApi.removeFavorite(storedId)
        : await userApi.addFavorite(id);
      // Update top-level Redux state (no localStorage)
      dispatch(setFavorites(response.data));
    } catch {
      // Revert optimistic update on failure
      setLocalFavorites(favoriteRecipeIds || []);
    }
  }, [isAuthenticated, favorites, favoriteRecipeIds, getStoredFavId, dispatch, showLoginPrompt]);

  const openRecipe = (recipe) => setSelectedRecipe(recipe);
  const closeRecipe = () => setSelectedRecipe(null);
  const openCooking = () => { setSelectedRecipe(null); setCookingRecipe(selectedRecipe); };
  const closeCooking = () => setCookingRecipe(null);

  const firstName = user?.fullName?.split(" ")[0] || null;

  return (
    <div className="home-page">
      <div className="synchef-gradient-bg">
        <div className="container">
          {/* Hero */}
          <section className="home-hero">
            <motion.h1 className="home-title" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
              Discover <span>Global</span> Flavors
            </motion.h1>
            <motion.p
              className="home-subtitle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              Search authentic recipes from every corner of the world. Real ingredients, real culture, real cooking.
            </motion.p>

            {/* Recipe Finder */}
            <motion.div
              className="hp-finder-wrap"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <div className="hp-search-row">
                <div className="hp-search-field">
                  <FaSearch className="hp-search-icon" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search recipe, ingredient, or country…"
                    className="hp-search-input"
                    autoComplete="off"
                  />
                  {searchQuery && (
                    <button className="hp-search-clear" onClick={() => setSearchQuery("")}><FaTimes /></button>
                  )}
                </div>

                <div className="hp-country-dropdown">
                  <button
                    className="hp-country-btn"
                    onClick={() => setCountryDropdownOpen((o) => !o)}
                  >
                    <FaGlobe />
                    <span>{selectedCountry || "All Countries"}</span>
                    <FaChevronDown className={countryDropdownOpen ? "rotated" : ""} />
                  </button>
                  {countryDropdownOpen && (
                    <div className="hp-country-list">
                      <button onClick={() => { setSelectedCountry(""); setCountryDropdownOpen(false); }}>
                        All Countries
                      </button>
                      {COUNTRIES.map((c) => (
                        <button
                          key={c}
                          className={selectedCountry === c ? "selected" : ""}
                          onClick={() => { setSelectedCountry(c); setCountryDropdownOpen(false); }}
                        >
                          {ALL_RECIPES.find((r) => r.country === c)?.flagEmoji} {c}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {hasFilters && (
                <div className="hp-search-meta">
                  <span>{visibleRecipes.length} recipe{visibleRecipes.length !== 1 ? "s" : ""} found</span>
                  <button className="hp-clear-all" onClick={resetFilters}>
                    <FaTimes /> Clear all
                  </button>
                </div>
              )}
            </motion.div>

            <div className="hero-actions">
              <a href="/flavor-map" className="hero-action-primary">Explore the Flavor Map</a>
            </div>
          </section>

          {/* Feature cards (only when no filters active) */}
          {!hasFilters && (
            <section className="home-features">
              <article className="home-feature-card">
                <div className="feature-icon-wrap"><FaGlobe /></div>
                <h3>Global Cuisine Explorer</h3>
                <p>Discover authentic recipes from 6 continents with cultural insights.</p>
              </article>
              <article className="home-feature-card">
                <div className="feature-icon-wrap"><FaUtensils /></div>
                <h3>Step-by-Step Cooking Mode</h3>
                <p>Guided tutorials with integrated timers for every step.</p>
              </article>
              <article className="home-feature-card">
                <div className="feature-icon-wrap"><FaMapMarkerAlt /></div>
                <h3>Cultural Deep Dives</h3>
                <p>Learn the stories and traditions behind every dish.</p>
              </article>
            </section>
          )}

          {/* ── Personalized Recommendations (logged-in users only) ── */}
          {isAuthenticated && !hasFilters && recommendedRecipes.length > 0 && (
            <motion.section
              className="hp-recommendations"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="hp-rec-header">
                <div className="hp-rec-title-row">
                  <FaStar className="hp-rec-star" />
                  <h2>
                    {firstName ? `Recommended for You, ${firstName}` : "Recommended for You"}
                  </h2>
                </div>
                {userCountry?.name && (
                  <p className="hp-rec-subtitle">
                    Based on your country: <strong>{userCountry.name}</strong>
                  </p>
                )}
              </div>
              <div className="recipe-grid">
                {recommendedRecipes.map((recipe) => (
                  <RecipeCard
                    key={recipe.id}
                    recipe={recipe}
                    isFav={getStoredFavId(recipe.id) !== null}
                    onOpen={openRecipe}
                    onToggleFav={toggleFav}
                  />
                ))}
              </div>
            </motion.section>
          )}

          {/* Region pills */}
          <section className="hp-region-pills">
            <button
              className={`hp-region-pill ${!activeRegion ? "active" : ""}`}
              onClick={() => setActiveRegion(null)}
            >
              All
            </button>
            {REGIONS.map((r) => (
              <button
                key={r}
                className={`hp-region-pill ${activeRegion === r ? "active" : ""}`}
                onClick={() => setActiveRegion((prev) => prev === r ? null : r)}
              >
                {r}
              </button>
            ))}
          </section>

          {/* Recipe grid */}
          <section className="recipe-section">
            <div className="recipe-section-header">
              <h2>{hasFilters ? "Search Results" : "Featured Recipes"}</h2>
            </div>
            {visibleRecipes.length === 0 ? (
              <div className="empty-recipe-state">
                <FaSearch style={{ fontSize: "2rem", opacity: 0.5, marginBottom: 10 }} />
                <p>No recipes found — try a different search term or country.</p>
                <button className="hp-clear-all-center" onClick={resetFilters}>Clear filters</button>
              </div>
            ) : (
              <div className="recipe-grid">
                {visibleRecipes.map((recipe) => (
                  <RecipeCard
                    key={recipe.id}
                    recipe={recipe}
                    isFav={getStoredFavId(recipe.id) !== null}
                    onOpen={openRecipe}
                    onToggleFav={toggleFav}
                  />
                ))}
              </div>
            )}
          </section>
        </div>

        <footer className="home-footer">
          <div className="container home-footer-inner">
            <div className="footer-brand"><FaUtensils /><span>SynChef</span></div>
            <div className="footer-links">
              <button type="button">Privacy Policy</button>
              <button type="button">Terms of Service</button>
              <button type="button">Contact Us</button>
            </div>
            <p>© 2026 SynChef AI. All rights reserved.</p>
          </div>
        </footer>
      </div>

      {/* Login-required toast — shown when a guest tries to save a recipe */}
      <AnimatePresence>
        {loginPrompt && (
          <motion.div
            key="login-prompt"
            className="hp-login-toast"
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ duration: 0.25 }}
          >
            <span>🔒</span>
            <span>Log in first, to discover.</span>
            <a href="/login" className="hp-login-toast-btn">Log In</a>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedRecipe && !cookingRecipe && (
          <RecipeModal
            key="recipe-modal"
            recipe={selectedRecipe}
            onClose={closeRecipe}
            onStartCooking={openCooking}
            isFav={getStoredFavId(selectedRecipe.id) !== null}
            onToggleFav={() => toggleFav(selectedRecipe.id)}
          />
        )}
        {cookingRecipe && (
          <CookingModal key="cooking-modal" recipe={cookingRecipe} onClose={closeCooking} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default HomePage;
