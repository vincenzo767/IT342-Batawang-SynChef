import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { FaClock, FaUsers, FaPlay, FaUtensils, FaMapMarkerAlt, FaFire, FaHeart, FaRegHeart } from "react-icons/fa";
import { recipeApi, userApi } from "../api";
import { setFavorites } from "../store/authSlice";
import { ALL_RECIPES } from "../data/recipes";
import "./RecipeDetailPage.css";

// Parse amount string like "400g", "2 tbsp", "1 cup" into { qty, unit }
function parseAmount(amountStr) {
  if (!amountStr) return { qty: 1, unit: "" };
  const match = String(amountStr).match(/^([\d./]+(?:\s*[\d./]+)?)\s*(.*)/);
  if (!match) return { qty: 1, unit: amountStr };
  const numStr = match[1].trim();
  // Handle fractions like "1/2"
  let qty = 1;
  if (numStr.includes("/")) {
    const [a, b] = numStr.split("/").map(Number);
    qty = b ? a / b : 1;
  } else {
    qty = parseFloat(numStr) || 1;
  }
  return { qty, unit: match[2].trim() };
}

// Convert ALL_RECIPES local format → normalized display format
function normalizeLocalRecipe(r) {
  return {
    id: r.id,
    title: r.title,
    countryName: r.country,
    flagEmoji: r.flagEmoji,
    cuisine: r.cuisine,
    description: r.description,
    totalMinutes: r.totalMinutes,
    difficulty: r.difficulty,
    servings: r.servings,
    image: r.image,
    region: r.region,
    culturalContext: r.culturalContext || null,
    categories: r.cuisine ? [{ id: 1, name: r.cuisine, color: "#667eea", icon: "🍽️" }] : [],
    ingredients: (r.ingredients || []).map((ing, idx) => {
      const { qty, unit } = parseAmount(ing.amount);
      return {
        id: idx + 1,
        qty,
        unit,
        rawAmount: ing.amount,
        name: ing.item,
        prep: ing.prep || "",
        optional: ing.optional || false
      };
    }),
    steps: (r.steps || []).map((step, idx) => ({
      id: idx + 1,
      order: idx + 1,
      instruction: step.instruction,
      hasTimer: !!step.timer,
      timerLabel: step.timerLabel || "",
      timerSeconds: step.timer || 0,
      tip: step.tip || ""
    }))
  };
}

// Convert backend API format → normalized display format
function normalizeBackendRecipe(r) {
  return {
    id: r.id,
    title: r.name,
    countryName: r.country?.name || "",
    flagEmoji: r.country?.flagEmoji || "",
    cuisine: r.categories?.[0]?.name || "",
    description: r.description,
    totalMinutes: r.totalTimeMinutes,
    difficulty: r.difficultyLevel,
    servings: r.defaultServings,
    image: r.imageUrl || null,
    region: r.country?.continent || "",
    culturalContext: r.culturalContext || null,
    categories: (r.categories || []).map((cat) => ({
      id: cat.id,
      name: cat.name,
      color: cat.colorCode || "#667eea",
      icon: cat.iconName || "🍽️"
    })),
    ingredients: (r.ingredients || []).map((ri, idx) => ({
      id: ri.id || idx + 1,
      qty: ri.quantity,
      unit: ri.unit || "",
      rawAmount: `${ri.quantity} ${ri.unit || ""}`.trim(),
      name: ri.ingredient?.name || ri.name || "",
      prep: ri.preparation || "",
      optional: ri.isOptional || false
    })),
    steps: (r.steps || []).map((step) => ({
      id: step.id,
      order: step.orderIndex,
      instruction: step.instruction,
      hasTimer: step.hasTimer || !!step.timerSeconds,
      timerLabel: step.timerLabel || "",
      timerSeconds: step.timerSeconds || 0,
      tip: step.tips || ""
    }))
  };
}

function scaleAmount(rawAmount, qty, baseServings, currentServings) {
  if (!rawAmount && !qty) return "";
  const scale = currentServings / baseServings;
  if (qty && qty !== 1) {
    const scaled = Math.round(qty * scale * 10) / 10;
    return `${scaled}`;
  }
  // Try to scale the raw amount string
  const match = String(rawAmount).match(/^([\d./]+(?:\s*[\d./]+)?)\s*(.*)/);
  if (!match) return rawAmount;
  let num;
  if (match[1].includes("/")) {
    const [a, b] = match[1].split("/").map(Number);
    num = b ? a / b : parseFloat(match[1]);
  } else {
    num = parseFloat(match[1]);
  }
  if (isNaN(num)) return rawAmount;
  const scaled = Math.round(num * scale * 10) / 10;
  return `${scaled}${match[2] ? " " + match[2] : ""}`;
}

function formatTimer(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${s > 0 ? s + "s" : ""}`.trim() : `${s}s`;
}

const RecipeDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { isAuthenticated, favoriteRecipeIds } = useSelector((state) => state.auth);
  const [recipe, setRecipe] = useState(null);
  const [servings, setServings] = useState(4);
  const [loading, setLoading] = useState(true);
  const [favLoading, setFavLoading] = useState(false);

  const recipeId = Number.parseInt(id);

  // Mobile stores web recipe IDs with a +10000 offset (FALLBACK_ID_OFFSET).
  // e.g. web recipe 2 → mobile saves as 10002. Check both when determining favorite state.
  const FALLBACK_OFFSET = 10000;
  const mobileFallbackId = recipeId + FALLBACK_OFFSET;
  const ids = favoriteRecipeIds || [];
  const isFavorited = ids.includes(recipeId) || ids.includes(mobileFallbackId);
  // The ID actually stored in the backend (prefer small web ID, fallback to mobile ID)
  const storedFavoriteId = ids.includes(recipeId) ? recipeId : ids.includes(mobileFallbackId) ? mobileFallbackId : null;

  const toggleFavorite = useCallback(async () => {
    if (!isAuthenticated) return;
    setFavLoading(true);
    try {
      let response;
      if (isFavorited) {
        // Remove whichever ID variant is stored (web ID or mobile fallback ID)
        response = await userApi.removeFavorite(storedFavoriteId ?? recipeId);
      } else {
        // Always add using the web small ID from this platform
        response = await userApi.addFavorite(recipeId);
      }
      // Update top-level favoriteRecipeIds in Redux — no localStorage
      dispatch(setFavorites(response.data));
    } catch {
      // ignore — isFavorited reverts automatically via Redux state
    } finally {
      setFavLoading(false);
    }
  }, [isAuthenticated, isFavorited, recipeId, storedFavoriteId, dispatch]);

  useEffect(() => {
    loadRecipe(Number.parseInt(id));
  }, [id]);

  const loadRecipe = async (recipeId) => {
    // 1. Check if FlavorMap passed local recipe via router state
    if (location.state?.localRecipe) {
      const norm = normalizeLocalRecipe(location.state.localRecipe);
      setRecipe(norm);
      setServings(norm.servings);
      setLoading(false);
      return;
    }

    // 2. Try to find in ALL_RECIPES by ID (instant, no network needed)
    const localMatch = ALL_RECIPES.find((r) => r.id === recipeId);
    if (localMatch) {
      const norm = normalizeLocalRecipe(localMatch);
      setRecipe(norm);
      setServings(norm.servings);
      setLoading(false);
      return;
    }

    // 3. Fallback to backend API
    try {
      const response = await recipeApi.getById(recipeId);
      const norm = normalizeBackendRecipe(response.data);
      setRecipe(norm);
      setServings(norm.servings || 4);
    } catch {
      setRecipe(null);
    } finally {
      setLoading(false);
    }
  };

  const handleStartCooking = () => {
    navigate(`/cooking/${id}?servings=${servings}`, {
      state: { localRecipe: location.state?.localRecipe || ALL_RECIPES.find((r) => r.id === Number.parseInt(id)) || null }
    });
  };

  if (loading) {
    return (
      <div className="recipe-detail-page page">
        <div className="loading">
          <div className="spinner" />
        </div>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="recipe-detail-page page">
        <div className="container">
          <h2>Recipe not found</h2>
          <button className="btn btn-primary" onClick={() => navigate("/")}>Back to Home</button>
        </div>
      </div>
    );
  }

  const baseServings = recipe.servings || 4;

  return (
    <div className="recipe-detail-page page">
      <div className="container">
        {/* Hero image */}
        {recipe.image && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="recipe-hero-img-wrap"
          >
            <img src={recipe.image} alt={recipe.title} className="recipe-hero-img" />
            <div className="recipe-hero-overlay" />
          </motion.div>
        )}

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="recipe-header-section"
        >
          <div className="recipe-title-area">
            <h1>{recipe.title}</h1>
            <span className="country-flag-xl">{recipe.flagEmoji}</span>
          </div>
          <p className="recipe-subtitle">{recipe.description}</p>

          <div className="recipe-stats">
            <div className="stat-item">
              <FaClock className="stat-icon" />
              <div>
                <div className="stat-value">{recipe.totalMinutes} min</div>
                <div className="stat-label">Total Time</div>
              </div>
            </div>
            <div className="stat-item">
              <FaFire className="stat-icon" />
              <div>
                <div className="stat-value">{recipe.difficulty}</div>
                <div className="stat-label">Difficulty</div>
              </div>
            </div>
            <div className="stat-item">
              <FaUsers className="stat-icon" />
              <div>
                <div className="stat-value">{servings}</div>
                <div className="stat-label">Servings</div>
              </div>
            </div>
            {recipe.countryName && (
              <div className="stat-item">
                <FaMapMarkerAlt className="stat-icon" />
                <div>
                  <div className="stat-value">{recipe.countryName}</div>
                  <div className="stat-label">{recipe.region}</div>
                </div>
              </div>
            )}
          </div>

          {recipe.categories.length > 0 && (
            <div className="categories-list">
              {recipe.categories.map((cat) => (
                <span key={cat.id} className="category-badge" style={{ background: cat.color }}>
                  {cat.icon} {cat.name}
                </span>
              ))}
            </div>
          )}
        </motion.div>

        {/* Cultural context */}
        {recipe.culturalContext && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="cultural-context card"
          >
            <h3>🌍 Cultural Context</h3>
            <p>{recipe.culturalContext}</p>
          </motion.div>
        )}

        {/* Ingredients + Steps */}
        <div className="recipe-content">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="ingredients-section card"
          >
            <h2>Ingredients</h2>
            <div className="servings-control">
              <label>Servings:</label>
              <div className="servings-buttons">
                <button onClick={() => setServings((s) => Math.max(1, s - 1))}>−</button>
                <span>{servings}</span>
                <button onClick={() => setServings((s) => s + 1)}>+</button>
              </div>
            </div>
            <ul className="ingredients-list">
              {recipe.ingredients.map((ing) => (
                <li key={ing.id} className={ing.optional ? "optional" : ""}>
                  <span className="ingredient-quantity">
                    {scaleAmount(ing.rawAmount, ing.qty, baseServings, servings)}
                    {ing.unit && !ing.rawAmount?.includes(ing.unit) ? ` ${ing.unit}` : ""}
                  </span>
                  <span className="ingredient-name">
                    {ing.name}
                    {ing.prep ? `, ${ing.prep}` : ""}
                  </span>
                  {ing.optional && <span className="optional-tag">Optional</span>}
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="instructions-section card"
          >
            <h2>Instructions</h2>
            <div className="steps-list">
              {recipe.steps.map((step) => (
                <div key={step.id} className="step-item">
                  <div className="step-number">{step.order}</div>
                  <div className="step-content">
                    <p>{step.instruction}</p>
                    {step.hasTimer && (
                      <div className="step-timer-info">
                        ⏱️ {step.timerLabel || "Timer"}: {formatTimer(step.timerSeconds)}
                      </div>
                    )}
                    {step.tip && (
                      <div className="step-tip">💡 Tip: {step.tip}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Start Cooking */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="start-cooking-section"
        >
          {isAuthenticated && (
            <button
              onClick={toggleFavorite}
              disabled={favLoading}
              className={`btn btn-favorite${isFavorited ? " active" : ""}`}
            >
              {isFavorited ? <FaHeart /> : <FaRegHeart />}
              {isFavorited ? "Saved to Favorites" : "Add to Favorites"}
            </button>
          )}
          <button onClick={handleStartCooking} className="btn btn-primary btn-large">
            <FaPlay /> Start Cooking Mode
          </button>
          <p className="cooking-mode-hint">
            Enter Focus Mode with parallel timers and step-by-step guidance
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default RecipeDetailPage;
