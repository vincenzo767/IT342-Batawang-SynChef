import { jsx, jsxs } from "react/jsx-runtime";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { FaCalendarAlt, FaMapMarkerAlt } from "react-icons/fa";
import "./ProfilePage.css";
const ProfilePage = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const countryCode = localStorage.getItem("userCountry") || "us";
  const countryNameMap = {
    us: "United States",
    uk: "United Kingdom",
    ca: "Canada",
    au: "Australia",
    de: "Germany",
    fr: "France",
    it: "Italy",
    es: "Spain",
    jp: "Japan",
    cn: "China",
    in: "India",
    br: "Brazil",
    mx: "Mexico",
    other: "Other"
  };
  const fullName = user?.fullName || "John Doe";
  const email = user?.email || "john.doe@example.com";
  const countryName = countryNameMap[countryCode] || "Unknown";
  const initials = useMemo(
    () => fullName.split(" ").filter(Boolean).map((token) => token[0]).join("").slice(0, 2).toUpperCase(),
    [fullName]
  );
  const savedRecipes = [
    {
      title: "Pad Thai",
      subtitle: "Thailand \u2022 30 min",
      image: "https://images.unsplash.com/photo-1559314809-0d155014e29e?w=1200"
    },
    {
      title: "Paella Valenciana",
      subtitle: "Spain \u2022 45 min",
      image: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=1200"
    }
  ];
  return /* @__PURE__ */ jsx("div", { className: "profile-page", children: /* @__PURE__ */ jsxs("div", { className: "container profile-shell", children: [
    /* @__PURE__ */ jsxs("section", { className: "profile-header-card", children: [
      /* @__PURE__ */ jsx("div", { className: "profile-cover" }),
      /* @__PURE__ */ jsxs("div", { className: "profile-header-content", children: [
        /* @__PURE__ */ jsx("div", { className: "profile-avatar-wrap", children: /* @__PURE__ */ jsx("div", { className: "profile-avatar", children: initials }) }),
        /* @__PURE__ */ jsxs("div", { className: "profile-identity", children: [
          /* @__PURE__ */ jsx("h2", { children: fullName }),
          /* @__PURE__ */ jsx("p", { children: email })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "profile-stats-grid", children: [
        /* @__PURE__ */ jsxs("article", { children: [
          /* @__PURE__ */ jsx("h3", { children: "24" }),
          /* @__PURE__ */ jsx("p", { children: "Saved Recipes" })
        ] }),
        /* @__PURE__ */ jsxs("article", { children: [
          /* @__PURE__ */ jsx("h3", { className: "tone-indigo", children: "12" }),
          /* @__PURE__ */ jsx("p", { children: "Countries Explored" })
        ] }),
        /* @__PURE__ */ jsxs("article", { children: [
          /* @__PURE__ */ jsx("h3", { className: "tone-green", children: "38" }),
          /* @__PURE__ */ jsx("p", { children: "Recipes Tried" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "profile-grid", children: [
      /* @__PURE__ */ jsxs("aside", { className: "profile-left-col", children: [
        /* @__PURE__ */ jsxs("section", { className: "profile-panel", children: [
          /* @__PURE__ */ jsx("h3", { children: "About" }),
          /* @__PURE__ */ jsxs("div", { className: "about-list", children: [
            /* @__PURE__ */ jsxs("div", { className: "about-row", children: [
              /* @__PURE__ */ jsx(FaMapMarkerAlt, {}),
              /* @__PURE__ */ jsx("span", { children: countryName })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "about-row", children: [
              /* @__PURE__ */ jsx(FaCalendarAlt, {}),
              /* @__PURE__ */ jsx("span", { children: "Joined March 2026" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("section", { className: "profile-panel", children: [
          /* @__PURE__ */ jsx("h3", { children: "Achievements" }),
          /* @__PURE__ */ jsxs("div", { className: "achievements-list", children: [
            /* @__PURE__ */ jsxs("article", { children: [
              /* @__PURE__ */ jsx("div", { className: "achievement-badge", children: "\u{1F3C6}" }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("h4", { children: "World Explorer" }),
                /* @__PURE__ */ jsx("p", { children: "Tried recipes from 10+ countries" })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("article", { children: [
              /* @__PURE__ */ jsx("div", { className: "achievement-badge", children: "\u{1F525}" }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("h4", { children: "Cooking Streak" }),
                /* @__PURE__ */ jsx("p", { children: "7 days in a row" })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("article", { children: [
              /* @__PURE__ */ jsx("div", { className: "achievement-badge", children: "\u2B50" }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("h4", { children: "Recipe Master" }),
                /* @__PURE__ */ jsx("p", { children: "Completed 30+ recipes" })
              ] })
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("main", { className: "profile-right-col", children: [
        /* @__PURE__ */ jsxs("section", { className: "profile-panel", children: [
          /* @__PURE__ */ jsx("h3", { children: "Favorite Cuisines" }),
          /* @__PURE__ */ jsxs("div", { className: "favorite-cuisines-grid", children: [
            /* @__PURE__ */ jsxs("button", { type: "button", onClick: () => navigate("/flavor-map"), children: [
              /* @__PURE__ */ jsx("div", { className: "cuisine-emoji", children: "\u{1F355}" }),
              /* @__PURE__ */ jsx("strong", { children: "Italian" }),
              /* @__PURE__ */ jsx("span", { children: "12 recipes" })
            ] }),
            /* @__PURE__ */ jsxs("button", { type: "button", onClick: () => navigate("/flavor-map"), children: [
              /* @__PURE__ */ jsx("div", { className: "cuisine-emoji", children: "\u{1F35C}" }),
              /* @__PURE__ */ jsx("strong", { children: "Asian" }),
              /* @__PURE__ */ jsx("span", { children: "18 recipes" })
            ] }),
            /* @__PURE__ */ jsxs("button", { type: "button", onClick: () => navigate("/flavor-map"), children: [
              /* @__PURE__ */ jsx("div", { className: "cuisine-emoji", children: "\u{1F32E}" }),
              /* @__PURE__ */ jsx("strong", { children: "Mexican" }),
              /* @__PURE__ */ jsx("span", { children: "8 recipes" })
            ] }),
            /* @__PURE__ */ jsxs("button", { type: "button", onClick: () => navigate("/flavor-map"), children: [
              /* @__PURE__ */ jsx("div", { className: "cuisine-emoji", children: "\u{1F35B}" }),
              /* @__PURE__ */ jsx("strong", { children: "Indian" }),
              /* @__PURE__ */ jsx("span", { children: "14 recipes" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("section", { className: "profile-panel", children: [
          /* @__PURE__ */ jsx("h3", { children: "Recent Activity" }),
          /* @__PURE__ */ jsxs("div", { className: "activity-list", children: [
            /* @__PURE__ */ jsxs("article", { className: "activity tone-purple", children: [
              /* @__PURE__ */ jsx("h4", { children: "Completed Pad Thai recipe" }),
              /* @__PURE__ */ jsx("p", { children: "2 days ago" })
            ] }),
            /* @__PURE__ */ jsxs("article", { className: "activity tone-indigo", children: [
              /* @__PURE__ */ jsx("h4", { children: "Saved Paella Valenciana" }),
              /* @__PURE__ */ jsx("p", { children: "3 days ago" })
            ] }),
            /* @__PURE__ */ jsxs("article", { className: "activity tone-green", children: [
              /* @__PURE__ */ jsx("h4", { children: "Earned World Explorer badge" }),
              /* @__PURE__ */ jsx("p", { children: "5 days ago" })
            ] }),
            /* @__PURE__ */ jsxs("article", { className: "activity tone-orange", children: [
              /* @__PURE__ */ jsx("h4", { children: "Tried Butter Chicken" }),
              /* @__PURE__ */ jsx("p", { children: "1 week ago" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("section", { className: "profile-panel", children: [
          /* @__PURE__ */ jsx("h3", { children: "Saved Recipes" }),
          /* @__PURE__ */ jsx("div", { className: "saved-recipes-grid", children: savedRecipes.map((recipe) => /* @__PURE__ */ jsxs(
            "button",
            {
              type: "button",
              className: "saved-recipe-card",
              onClick: () => navigate("/"),
              children: [
                /* @__PURE__ */ jsx("img", { src: recipe.image, alt: recipe.title, loading: "lazy" }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("h4", { children: recipe.title }),
                  /* @__PURE__ */ jsx("p", { children: recipe.subtitle })
                ] })
              ]
            },
            recipe.title
          )) })
        ] })
      ] })
    ] })
  ] }) });
};
var ProfilePage_default = ProfilePage;
export {
  ProfilePage_default as default
};
