import { jsx, jsxs } from "react/jsx-runtime";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  FaBookmark,
  FaCheckCircle,
  FaClock,
  FaGlobe
} from "react-icons/fa";
import "./DashboardPage.css";
const DashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const firstName = user?.fullName?.split(" ")[0] || "Chef";
  const stats = [
    {
      label: "Saved Recipes",
      value: "24",
      tone: "purple",
      icon: /* @__PURE__ */ jsx(FaBookmark, {})
    },
    {
      label: "Countries Explored",
      value: "12",
      tone: "indigo",
      icon: /* @__PURE__ */ jsx(FaGlobe, {})
    },
    {
      label: "Recipes Tried",
      value: "38",
      tone: "green",
      icon: /* @__PURE__ */ jsx(FaCheckCircle, {})
    },
    {
      label: "Cooking Time",
      value: "42h",
      tone: "orange",
      icon: /* @__PURE__ */ jsx(FaClock, {})
    }
  ];
  const discoveredRecipes = [
    {
      title: "Pad Thai",
      subtitle: "Thailand \u2022 Asian Cuisine",
      time: "30 min",
      image: "https://images.unsplash.com/photo-1559314809-0d155014e29e?w=1200"
    },
    {
      title: "Paella Valenciana",
      subtitle: "Spain \u2022 European Cuisine",
      time: "45 min",
      image: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=1200"
    },
    {
      title: "Butter Chicken",
      subtitle: "India \u2022 Asian Cuisine",
      time: "50 min",
      image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=1200"
    }
  ];
  const flavorRegions = [
    { emoji: "\u{1F30F}", name: "Asia", count: "2,847 recipes", tone: "blue" },
    { emoji: "\u{1F30D}", name: "Africa", count: "1,234 recipes", tone: "yellow" },
    { emoji: "\u{1F30E}", name: "North America", count: "3,156 recipes", tone: "green" },
    { emoji: "\u{1F30E}", name: "South America", count: "1,892 recipes", tone: "orange" },
    { emoji: "\u{1F30D}", name: "Europe", count: "4,521 recipes", tone: "purple" },
    { emoji: "\u{1F30F}", name: "Oceania", count: "789 recipes", tone: "teal" }
  ];
  return /* @__PURE__ */ jsx("div", { className: "dashboard-page", children: /* @__PURE__ */ jsxs("div", { className: "dashboard-shell container", children: [
    /* @__PURE__ */ jsxs("section", { className: "dashboard-card welcome-card", children: [
      /* @__PURE__ */ jsxs("h2", { children: [
        "Welcome back, ",
        /* @__PURE__ */ jsx("span", { children: firstName }),
        "!"
      ] }),
      /* @__PURE__ */ jsx("p", { children: "Discover new recipes and explore culinary traditions from around the world" })
    ] }),
    /* @__PURE__ */ jsx("section", { className: "stats-grid", children: stats.map((item) => /* @__PURE__ */ jsxs("article", { className: "dashboard-card stat-card", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("p", { children: item.label }),
        /* @__PURE__ */ jsx("h3", { className: `tone-${item.tone}`, children: item.value })
      ] }),
      /* @__PURE__ */ jsx("div", { className: `stat-icon tone-bg-${item.tone}`, children: item.icon })
    ] }, item.label)) }),
    /* @__PURE__ */ jsxs("section", { className: "dashboard-card discovered-card", children: [
      /* @__PURE__ */ jsx("h3", { children: "Recently Discovered" }),
      /* @__PURE__ */ jsx("div", { className: "discovered-grid", children: discoveredRecipes.map((recipe) => /* @__PURE__ */ jsxs("article", { className: "discover-item", children: [
        /* @__PURE__ */ jsx("img", { src: recipe.image, alt: recipe.title, loading: "lazy" }),
        /* @__PURE__ */ jsxs("div", { className: "discover-body", children: [
          /* @__PURE__ */ jsx("h4", { children: recipe.title }),
          /* @__PURE__ */ jsx("p", { children: recipe.subtitle }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs("span", { children: [
              "\u23F1\uFE0F ",
              recipe.time
            ] }),
            /* @__PURE__ */ jsx("button", { type: "button", onClick: () => navigate("/"), children: "View Recipe \u2192" })
          ] })
        ] })
      ] }, recipe.title)) })
    ] }),
    /* @__PURE__ */ jsxs("section", { className: "dashboard-card flavor-card", children: [
      /* @__PURE__ */ jsx("h3", { children: "Global Flavor Map" }),
      /* @__PURE__ */ jsx("p", { children: "Explore recipes by continent - Click on a region to discover more" }),
      /* @__PURE__ */ jsx("div", { className: "flavor-grid", children: flavorRegions.map((region) => /* @__PURE__ */ jsxs(
        "button",
        {
          type: "button",
          className: `flavor-tile tone-bg-${region.tone}`,
          onClick: () => navigate("/flavor-map"),
          children: [
            /* @__PURE__ */ jsx("div", { className: "emoji", children: region.emoji }),
            /* @__PURE__ */ jsx("h4", { children: region.name }),
            /* @__PURE__ */ jsx("span", { children: region.count })
          ]
        },
        region.name
      )) })
    ] })
  ] }) });
};
var DashboardPage_default = DashboardPage;
export {
  DashboardPage_default as default
};
