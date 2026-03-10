import { jsx, jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaClock, FaUsers, FaPlay, FaUtensils } from "react-icons/fa";
import { recipeApi } from "../api";
import "./RecipeDetailPage.css";
const RecipeDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(null);
  const [servings, setServings] = useState(4);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (id) {
      loadRecipe(parseInt(id));
    }
  }, [id]);
  const loadRecipe = async (recipeId) => {
    try {
      const response = await recipeApi.getById(recipeId);
      setRecipe(response.data);
      setServings(response.data.defaultServings);
    } catch (error) {
      console.error("Failed to load recipe:", error);
    } finally {
      setLoading(false);
    }
  };
  const handleStartCooking = () => {
    navigate(`/cooking/${id}?servings=${servings}`);
  };
  if (loading) {
    return /* @__PURE__ */ jsx("div", { className: "recipe-detail-page page", children: /* @__PURE__ */ jsx("div", { className: "loading", children: /* @__PURE__ */ jsx("div", { className: "spinner" }) }) });
  }
  if (!recipe) {
    return /* @__PURE__ */ jsx("div", { className: "recipe-detail-page page", children: /* @__PURE__ */ jsx("div", { className: "container", children: /* @__PURE__ */ jsx("h2", { children: "Recipe not found" }) }) });
  }
  return /* @__PURE__ */ jsx("div", { className: "recipe-detail-page page", children: /* @__PURE__ */ jsxs("div", { className: "container", children: [
    /* @__PURE__ */ jsxs(
      motion.div,
      {
        initial: { opacity: 0, y: -20 },
        animate: { opacity: 1, y: 0 },
        className: "recipe-header-section",
        children: [
          /* @__PURE__ */ jsxs("div", { className: "recipe-title-area", children: [
            /* @__PURE__ */ jsx("h1", { children: recipe.name }),
            /* @__PURE__ */ jsx("span", { className: "country-flag-xl", children: recipe.country.flagEmoji })
          ] }),
          /* @__PURE__ */ jsx("p", { className: "recipe-subtitle", children: recipe.description }),
          /* @__PURE__ */ jsxs("div", { className: "recipe-stats", children: [
            /* @__PURE__ */ jsxs("div", { className: "stat-item", children: [
              /* @__PURE__ */ jsx(FaClock, { className: "stat-icon" }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsxs("div", { className: "stat-value", children: [
                  recipe.totalTimeMinutes,
                  " min"
                ] }),
                /* @__PURE__ */ jsx("div", { className: "stat-label", children: "Total Time" })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "stat-item", children: [
              /* @__PURE__ */ jsx(FaUtensils, { className: "stat-icon" }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("div", { className: "stat-value", children: recipe.difficultyLevel }),
                /* @__PURE__ */ jsx("div", { className: "stat-label", children: "Difficulty" })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "stat-item", children: [
              /* @__PURE__ */ jsx(FaUsers, { className: "stat-icon" }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("div", { className: "stat-value", children: recipe.defaultServings }),
                /* @__PURE__ */ jsx("div", { className: "stat-label", children: "Default Servings" })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "categories-list", children: recipe.categories.map((cat) => /* @__PURE__ */ jsxs("span", { className: "category-badge", style: { background: cat.colorCode }, children: [
            cat.iconName,
            " ",
            cat.name
          ] }, cat.id)) })
        ]
      }
    ),
    recipe.culturalContext && /* @__PURE__ */ jsxs(
      motion.div,
      {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        transition: { delay: 0.2 },
        className: "cultural-context card",
        children: [
          /* @__PURE__ */ jsx("h3", { children: "\u{1F30D} Cultural Context" }),
          /* @__PURE__ */ jsx("p", { children: recipe.culturalContext })
        ]
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: "recipe-content", children: [
      /* @__PURE__ */ jsxs(
        motion.div,
        {
          initial: { opacity: 0, x: -20 },
          animate: { opacity: 1, x: 0 },
          transition: { delay: 0.3 },
          className: "ingredients-section card",
          children: [
            /* @__PURE__ */ jsx("h2", { children: "Ingredients" }),
            /* @__PURE__ */ jsxs("div", { className: "servings-control", children: [
              /* @__PURE__ */ jsx("label", { children: "Servings:" }),
              /* @__PURE__ */ jsxs("div", { className: "servings-buttons", children: [
                /* @__PURE__ */ jsx("button", { onClick: () => setServings(Math.max(1, servings - 1)), children: "-" }),
                /* @__PURE__ */ jsx("span", { children: servings }),
                /* @__PURE__ */ jsx("button", { onClick: () => setServings(servings + 1), children: "+" })
              ] })
            ] }),
            /* @__PURE__ */ jsx("ul", { className: "ingredients-list", children: recipe.ingredients.map((ri) => {
              const scaledQty = ri.quantity * servings / recipe.defaultServings;
              return /* @__PURE__ */ jsxs("li", { className: ri.isOptional ? "optional" : "", children: [
                /* @__PURE__ */ jsxs("span", { className: "ingredient-quantity", children: [
                  scaledQty.toFixed(2),
                  " ",
                  ri.unit
                ] }),
                /* @__PURE__ */ jsxs("span", { className: "ingredient-name", children: [
                  ri.ingredient.name,
                  ri.preparation && ` (${ri.preparation})`
                ] }),
                ri.isOptional && /* @__PURE__ */ jsx("span", { className: "optional-tag", children: "Optional" })
              ] }, ri.id);
            }) })
          ]
        }
      ),
      /* @__PURE__ */ jsxs(
        motion.div,
        {
          initial: { opacity: 0, x: 20 },
          animate: { opacity: 1, x: 0 },
          transition: { delay: 0.4 },
          className: "instructions-section card",
          children: [
            /* @__PURE__ */ jsx("h2", { children: "Instructions" }),
            /* @__PURE__ */ jsx("div", { className: "steps-list", children: recipe.steps.map((step) => /* @__PURE__ */ jsxs("div", { className: "step-item", children: [
              /* @__PURE__ */ jsx("div", { className: "step-number", children: step.orderIndex }),
              /* @__PURE__ */ jsxs("div", { className: "step-content", children: [
                /* @__PURE__ */ jsx("p", { children: step.instruction }),
                step.hasTimer && /* @__PURE__ */ jsxs("div", { className: "step-timer-info", children: [
                  "\u23F1\uFE0F Timer: ",
                  step.timerLabel || "Set timer",
                  " for",
                  " ",
                  Math.floor(step.timerSeconds / 60),
                  " min ",
                  step.timerSeconds % 60,
                  " sec"
                ] }),
                step.tips && /* @__PURE__ */ jsxs("div", { className: "step-tip", children: [
                  "\u{1F4A1} Tip: ",
                  step.tips
                ] })
              ] })
            ] }, step.id)) })
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxs(
      motion.div,
      {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { delay: 0.5 },
        className: "start-cooking-section",
        children: [
          /* @__PURE__ */ jsxs("button", { onClick: handleStartCooking, className: "btn btn-primary btn-large", children: [
            /* @__PURE__ */ jsx(FaPlay, {}),
            "Start Cooking Mode"
          ] }),
          /* @__PURE__ */ jsx("p", { className: "cooking-mode-hint", children: "Enter Focus Mode with parallel timers and step-by-step guidance" })
        ]
      }
    )
  ] }) });
};
var RecipeDetailPage_default = RecipeDetailPage;
export {
  RecipeDetailPage_default as default
};
