import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  FaUsers,
} from 'react-icons/fa';
import { ALL_RECIPES, LocalRecipe, REGIONS, COUNTRIES } from '../data/recipes';
import './HomePage.css';

// ─── Favorites helpers ───────────────────────────────────────────────────────
const FAV_KEY = 'synchef_favorites';
const getFavorites = (): number[] => {
  try { return JSON.parse(localStorage.getItem(FAV_KEY) || '[]'); } catch { return []; }
};
const saveFavorites = (ids: number[]) => localStorage.setItem(FAV_KEY, JSON.stringify(ids));

// ─── Cooking Timer (used inside cooking modal) ────────────────────────────────
interface TimerState {
  running: boolean;
  remaining: number;
  started: boolean;
  completed: boolean;
}

// ─── Recipe Detail Modal ──────────────────────────────────────────────────────
const RecipeModal = ({
  recipe,
  onClose,
  onStartCooking,
  isFav,
  onToggleFav,
}: {
  recipe: LocalRecipe;
  onClose: () => void;
  onStartCooking: () => void;
  isFav: boolean;
  onToggleFav: () => void;
}) => {
  const [servings, setServings] = useState(recipe.servings);
  const scale = servings / recipe.servings;

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  return (
    <div className="hp-overlay" onClick={onClose}>
      <motion.div
        className="hp-recipe-modal"
        initial={{ opacity: 0, scale: 0.93, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.93, y: 30 }}
        transition={{ duration: 0.28 }}
        onClick={e => e.stopPropagation()}
      >
        {/* Hero image */}
        <div className="hp-modal-img-wrap">
          <img src={recipe.image} alt={recipe.title} />
          <div className="hp-modal-img-overlay" />
          <button className="hp-modal-close" onClick={onClose}><FaTimes /></button>
          <div className="hp-modal-hero-info">
            <span className="hp-modal-flag">{recipe.flagEmoji}</span>
            <div>
              <h2 className="hp-modal-title">{recipe.title}</h2>
              <span className="hp-modal-country">{recipe.country} &mdash; {recipe.cuisine}</span>
            </div>
          </div>
        </div>

        <div className="hp-modal-body">
          {/* Quick stats */}
          <div className="hp-modal-stats">
            <div className="hp-stat"><FaClock /><span>{recipe.time}</span><small>Total Time</small></div>
            <div className="hp-stat"><FaFire /><span>{recipe.difficulty}</span><small>Difficulty</small></div>
            <div className="hp-stat"><FaUsers /><span>{servings}</span><small>Servings</small></div>
            <div className="hp-stat"><FaMapMarkerAlt /><span>{recipe.region}</span><small>Region</small></div>
          </div>

          {/* Description */}
          <p className="hp-modal-desc">{recipe.description}</p>

          {/* Cultural context */}
          {recipe.culturalContext && (
            <div className="hp-modal-culture">
              <span className="hp-culture-icon">🌍</span>
              <p>{recipe.culturalContext}</p>
            </div>
          )}

          {/* Ingredients with scaling */}
          <div className="hp-modal-section">
            <div className="hp-section-header">
              <h3>Ingredients</h3>
              <div className="hp-servings-ctrl">
                <button onClick={() => setServings(s => Math.max(1, s - 1))}>−</button>
                <span>{servings} servings</span>
                <button onClick={() => setServings(s => s + 1)}>+</button>
              </div>
            </div>
            <ul className="hp-ingredients">
              {recipe.ingredients.map((ing, i) => (
                <li key={i} className={ing.optional ? 'optional' : ''}>
                  <span className="hp-ing-amount">
                    {scale === 1 ? ing.amount : scaleAmount(ing.amount, scale)}
                  </span>
                  <span className="hp-ing-item">
                    {ing.item}{ing.prep ? `, ${ing.prep}` : ''}
                    {ing.optional && <span className="hp-optional-tag">optional</span>}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Steps preview */}
          <div className="hp-modal-section">
            <h3>Steps Overview</h3>
            <ol className="hp-steps-preview">
              {recipe.steps.map((step, i) => (
                <li key={i}>
                  <span className="hp-step-num">{i + 1}</span>
                  <div>
                    <p>{step.instruction}</p>
                    {step.timer && (
                      <span className="hp-step-timer">
                        ⏱ {step.timerLabel} — {formatSeconds(step.timer)}
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </div>

          {/* Action buttons */}
          <div className="hp-modal-actions">
            <button
              className={`hp-fav-btn ${isFav ? 'active' : ''}`}
              onClick={onToggleFav}
            >
              {isFav ? <FaHeart /> : <FaRegHeart />}
              {isFav ? 'Saved to Favorites' : 'Add to Favorites'}
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

// ─── Cooking Tutorial Modal ───────────────────────────────────────────────────
const CookingModal = ({
  recipe,
  onClose,
}: {
  recipe: LocalRecipe;
  onClose: () => void;
}) => {
  const [stepIndex, setStepIndex] = useState(0);
  const [timers, setTimers] = useState<Record<number, TimerState>>({});
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const step = recipe.steps[stepIndex];
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === recipe.steps.length - 1;
  const timer = timers[stepIndex];

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  // Tick logic
  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setTimers(prev => {
        const updated = { ...prev };
        let changed = false;
        Object.keys(updated).forEach(k => {
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
    }, 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  const startTimer = () => {
    if (!step.timer) return;
    setTimers(prev => ({
      ...prev,
      [stepIndex]: { running: true, remaining: step.timer!, started: true, completed: false },
    }));
  };

  const pauseResume = () => {
    setTimers(prev => {
      const t = prev[stepIndex];
      if (!t) return prev;
      return { ...prev, [stepIndex]: { ...t, running: !t.running } };
    });
  };

  const goToStep = (idx: number) => {
    setTimers(prev => {
      const t = prev[stepIndex];
      if (t?.running) return { ...prev, [stepIndex]: { ...t, running: false } };
      return prev;
    });
    setStepIndex(idx);
  };

  // Progress for SVG ring
  const ringProgress = timer && step.timer
    ? (timer.remaining / step.timer) * 283
    : 283;

  // Active timers bar (running ones across all steps)
  const activeTimerEntries = Object.entries(timers).filter(([, t]) => t.started && !t.completed);

  return (
    <div className="hp-overlay hp-overlay-dark" onClick={onClose}>
      <motion.div
        className="hp-cooking-modal"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        transition={{ duration: 0.3 }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="hp-ck-header">
          <div>
            <h2>{recipe.title}</h2>
            <span className="hp-ck-progress">Step {stepIndex + 1} of {recipe.steps.length}</span>
          </div>
          <button className="hp-ck-close" onClick={onClose}><FaTimes /></button>
        </div>

        {/* Active timers bar */}
        {activeTimerEntries.length > 0 && (
          <div className="hp-ck-timers-bar">
            {activeTimerEntries.map(([k, t]) => {
              const s = recipe.steps[+k];
              return (
                <div key={k} className={`hp-ck-chip ${t.running ? 'running' : 'paused'}`}>
                  <span>{s?.timerLabel || `Step ${+k + 1}`}</span>
                  <span className="hp-ck-chip-time">{formatSeconds(t.remaining)}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Step card */}
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

            {/* Timer */}
            {step.timer && (
              <div className="hp-ck-timer-area">
                {!timer?.started ? (
                  <button className="hp-ck-start-btn" onClick={startTimer}>
                    <FaPlay /> Start {step.timerLabel || 'Timer'} ({formatSeconds(step.timer)})
                  </button>
                ) : (
                  <div className="hp-ck-timer-display">
                    <div className="hp-ck-circle">
                      <svg viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
                        <circle
                          cx="50" cy="50" r="45" fill="none"
                          stroke={timer.completed ? '#10b981' : '#667eea'}
                          strokeWidth="8"
                          strokeDasharray={`${ringProgress} 283`}
                          strokeLinecap="round"
                          transform="rotate(-90 50 50)"
                        />
                      </svg>
                      <div className={`hp-ck-circle-text ${timer.completed ? 'done' : ''}`}>
                        {timer.completed ? <FaCheck /> : formatSeconds(timer.remaining)}
                      </div>
                    </div>
                    {!timer.completed && (
                      <button className="hp-ck-pause-btn" onClick={pauseResume}>
                        {timer.running ? <><FaPause /> Pause</> : <><FaPlay /> Resume</>}
                      </button>
                    )}
                    {timer.completed && (
                      <span className="hp-ck-done-label">Done! Proceed to next step.</span>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Tip */}
            {step.tip && (
              <div className="hp-ck-tip">
                <span>💡</span>
                <p>{step.tip}</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="hp-ck-nav">
          <button
            className="hp-ck-nav-btn secondary"
            onClick={() => goToStep(stepIndex - 1)}
            disabled={isFirst}
          >
            <FaArrowLeft /> Previous
          </button>

          <div className="hp-ck-dots">
            {recipe.steps.map((_, i) => (
              <button
                key={i}
                className={`hp-ck-dot ${i === stepIndex ? 'active' : ''} ${i < stepIndex ? 'done' : ''}`}
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

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatSeconds(s: number): string {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return m > 0 ? `${m}:${sec.toString().padStart(2, '0')}` : `${sec}s`;
}

function parseFraction(s: string): number {
  if (s.includes('/')) {
    const [a, b] = s.split('/').map(Number);
    return b ? a / b : NaN;
  }
  return parseFloat(s);
}

function scaleAmount(amount: string, scale: number): string {
  const match = amount.match(/^([\d.]+(?:\/[\d.]+)?)\s*(.*)/);
  if (!match) return amount;
  const base = parseFraction(match[1]);
  if (isNaN(base)) return amount;
  const scaled = Math.round(base * scale * 10) / 10;
  return `${scaled}${match[2] ? ' ' + match[2] : ''}`;
}

// ─── Main Page ────────────────────────────────────────────────────────────────
const HomePage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [activeRegion, setActiveRegion] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [favorites, setFavorites] = useState<number[]>(getFavorites);
  const [selectedRecipe, setSelectedRecipe] = useState<LocalRecipe | null>(null);
  const [cookingRecipe, setCookingRecipe] = useState<LocalRecipe | null>(null);
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounce search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedQuery(searchQuery), 220);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [searchQuery]);

  const visibleRecipes = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    return ALL_RECIPES.filter(r => {
      const matchSearch = !q ||
        r.title.toLowerCase().includes(q) ||
        r.cuisine.toLowerCase().includes(q) ||
        r.country.toLowerCase().includes(q) ||
        r.region.toLowerCase().includes(q) ||
        r.ingredients.some(ing => ing.item.toLowerCase().includes(q));
      const matchRegion = !activeRegion || r.region === activeRegion;
      const matchCountry = !selectedCountry || r.country === selectedCountry;
      return matchSearch && matchRegion && matchCountry;
    });
  }, [debouncedQuery, activeRegion, selectedCountry]);

  const hasFilters = Boolean(debouncedQuery || activeRegion || selectedCountry);

  const resetFilters = () => {
    setSearchQuery('');
    setDebouncedQuery('');
    setActiveRegion(null);
    setSelectedCountry('');
  };

  const toggleFav = useCallback((id: number) => {
    setFavorites(prev => {
      const next = prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id];
      saveFavorites(next);
      return next;
    });
  }, []);

  const openRecipe = (recipe: LocalRecipe) => setSelectedRecipe(recipe);
  const closeRecipe = () => setSelectedRecipe(null);
  const openCooking = () => { setSelectedRecipe(null); setCookingRecipe(selectedRecipe); };
  const closeCooking = () => setCookingRecipe(null);

  return (
    <div className="home-page">
      <div className="synchef-gradient-bg">
        <div className="container">

          {/* ── Hero ── */}
          <section className="home-hero">
            <motion.h1 className="home-title" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
              Discover <span>Global</span> Flavors
            </motion.h1>
            <motion.p className="home-subtitle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
              Search authentic recipes from every corner of the world. Real ingredients, real culture, real cooking.
            </motion.p>

            {/* Search bar */}
            <motion.div className="hp-finder-wrap" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
              <div className="hp-search-row">
                <div className="hp-search-field">
                  <FaSearch className="hp-search-icon" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search recipe, ingredient, or country..."
                    className="hp-search-input"
                    autoComplete="off"
                  />
                  {searchQuery && (
                    <button className="hp-search-clear" onClick={() => setSearchQuery('')}><FaTimes /></button>
                  )}
                </div>

                {/* Country dropdown */}
                <div className="hp-country-dropdown">
                  <button
                    className="hp-country-btn"
                    onClick={() => setCountryDropdownOpen(o => !o)}
                  >
                    <FaGlobe />
                    <span>{selectedCountry || 'All Countries'}</span>
                    <FaChevronDown className={countryDropdownOpen ? 'rotated' : ''} />
                  </button>
                  {countryDropdownOpen && (
                    <div className="hp-country-list">
                      <button onClick={() => { setSelectedCountry(''); setCountryDropdownOpen(false); }}>
                        All Countries
                      </button>
                      {COUNTRIES.map(c => (
                        <button
                          key={c}
                          className={selectedCountry === c ? 'selected' : ''}
                          onClick={() => { setSelectedCountry(c); setCountryDropdownOpen(false); }}
                        >
                          {ALL_RECIPES.find(r => r.country === c)?.flagEmoji} {c}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Search result count */}
              {hasFilters && (
                <div className="hp-search-meta">
                  <span>{visibleRecipes.length} recipe{visibleRecipes.length !== 1 ? 's' : ''} found</span>
                  <button className="hp-clear-all" onClick={resetFilters}><FaTimes /> Clear all</button>
                </div>
              )}
            </motion.div>

            <div className="hero-actions">
              <a href="/flavor-map" className="hero-action-primary">
                Explore the Flavor Map
              </a>
            </div>
          </section>

          {/* ── Feature cards (when no filters) ── */}
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

          {/* ── Region filter pills ── */}
          <section className="hp-region-pills">
            <button
              className={`hp-region-pill ${!activeRegion ? 'active' : ''}`}
              onClick={() => setActiveRegion(null)}
            >
              All
            </button>
            {REGIONS.map(r => (
              <button
                key={r}
                className={`hp-region-pill ${activeRegion === r ? 'active' : ''}`}
                onClick={() => setActiveRegion(prev => prev === r ? null : r)}
              >
                {r}
              </button>
            ))}
          </section>

          {/* ── Recipe Grid ── */}
          <section className="recipe-section">
            <div className="recipe-section-header">
              <h2>{hasFilters ? 'Search Results' : 'Featured Recipes'}</h2>
            </div>

            {visibleRecipes.length === 0 ? (
              <div className="empty-recipe-state">
                <FaSearch style={{ fontSize: '2rem', opacity: 0.5, marginBottom: 10 }} />
                <p>No recipes found — try a different search term or country.</p>
                <button className="hp-clear-all-center" onClick={resetFilters}>Clear filters</button>
              </div>
            ) : (
              <div className="recipe-grid">
                {visibleRecipes.map(recipe => (
                  <article
                    key={recipe.id}
                    className="synchef-recipe-card"
                    onClick={() => openRecipe(recipe)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={e => e.key === 'Enter' && openRecipe(recipe)}
                  >
                    <div className="hp-card-img-wrap">
                      <img src={recipe.image} alt={recipe.title} loading="lazy" />
                      <button
                        className={`hp-card-fav ${favorites.includes(recipe.id) ? 'active' : ''}`}
                        onClick={e => { e.stopPropagation(); toggleFav(recipe.id); }}
                        title={favorites.includes(recipe.id) ? 'Remove from favorites' : 'Add to favorites'}
                      >
                        {favorites.includes(recipe.id) ? <FaHeart /> : <FaRegHeart />}
                      </button>
                      <span className="hp-card-country-badge">
                        {recipe.flagEmoji} {recipe.country}
                      </span>
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
                ))}
              </div>
            )}
          </section>
        </div>

        {/* ── Footer ── */}
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

      {/* ── Modals ── */}
      <AnimatePresence>
        {selectedRecipe && !cookingRecipe && (
          <RecipeModal
            key="recipe-modal"
            recipe={selectedRecipe}
            onClose={closeRecipe}
            onStartCooking={openCooking}
            isFav={favorites.includes(selectedRecipe.id)}
            onToggleFav={() => toggleFav(selectedRecipe.id)}
          />
        )}
        {cookingRecipe && (
          <CookingModal
            key="cooking-modal"
            recipe={cookingRecipe}
            onClose={closeCooking}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default HomePage;
