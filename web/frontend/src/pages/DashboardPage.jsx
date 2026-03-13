import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { FaBookmark, FaCheckCircle, FaClock, FaGlobe, FaStar, FaUtensils } from "react-icons/fa";
import { ALL_RECIPES } from "../data/recipes";
import "./DashboardPage.css";

// localStorage fallback for sessions before Redux rehydrates country from backend
const getStoredCountry = () => {
  try {
    const raw = localStorage.getItem("userCountry");
    if (!raw) return null;
    if (raw.startsWith("{")) return JSON.parse(raw);
    return { code: raw, name: raw };
  } catch {
    return null;
  }
};

// ISO code → recipe country name
const CODE_TO_COUNTRY = {
  IT: "Italy", TH: "Thailand", MX: "Mexico", JP: "Japan", IN: "India",
  ES: "Spain", KR: "South Korea", VN: "Vietnam", MA: "Morocco", CN: "China",
  FR: "France", BR: "Brazil", US: "United States", JM: "Jamaica", SE: "Sweden",
  PH: "Philippines", LB: "Lebanon", ID: "Indonesia", DE: "Germany", GR: "Greece",
  TR: "Turkey", PE: "Peru", AR: "Argentina", EG: "Egypt", CO: "Colombia",
  AU: "Australia", PT: "Portugal", NG: "Nigeria", NZ: "New Zealand"
};

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const firstName = user?.fullName?.split(" ")[0] || "Chef";

  // Resolve user country — backend (Redux) is the source of truth; localStorage is a fallback
  const userCountry = useMemo(() => {
    if (user?.countryCode || user?.countryName) {
      return { code: user.countryCode || "", name: user.countryName || "" };
    }
    return getStoredCountry();
  }, [user]);

  // Get recipes recommended for user's country/region
  const recommendedRecipes = useMemo(() => {
    if (!userCountry) return ALL_RECIPES.slice(0, 3);
    const recipeCountry = CODE_TO_COUNTRY[userCountry.code?.toUpperCase()] || userCountry.name;
    const exact = ALL_RECIPES.filter((r) => r.country.toLowerCase() === recipeCountry?.toLowerCase());
    if (exact.length >= 3) return exact.slice(0, 3);
    const region = exact[0]?.region;
    const regional = region
      ? ALL_RECIPES.filter((r) => r.region === region && r.country.toLowerCase() !== recipeCountry?.toLowerCase())
      : ALL_RECIPES;
    return [...exact, ...regional].slice(0, 3);
  }, [userCountry]);

  // Saved count — sourced from Redux (populated from backend on login/register)
  const savedCount = user?.favoriteRecipeIds?.length ?? 0;

  const stats = [
    { label: "Saved Recipes", value: savedCount || 0, tone: "purple", icon: <FaBookmark /> },
    { label: "Countries Explored", value: userCountry ? 1 : 0, tone: "indigo", icon: <FaGlobe /> },
    { label: "Recipes Tried", value: 0, tone: "green", icon: <FaCheckCircle /> },
    { label: "Cooking Time", value: "0h", tone: "orange", icon: <FaClock /> }
  ];

  const flavorRegions = [
    { emoji: "🌏", name: "Asia", tone: "blue" },
    { emoji: "🌍", name: "Africa", tone: "yellow" },
    { emoji: "🌎", name: "North America", tone: "green" },
    { emoji: "🌎", name: "South America", tone: "orange" },
    { emoji: "🌍", name: "Europe", tone: "purple" },
    { emoji: "🌏", name: "Oceania", tone: "teal" }
  ];

  return (
    <div className="dashboard-page">
      <div className="dashboard-shell container">
        {/* Welcome banner */}
        <section className="dashboard-card welcome-card">
          <h2>
            Welcome back, <span>{firstName}</span>!
          </h2>
          <p>
            {userCountry?.name
              ? `Explore recipes inspired by your home country, ${userCountry.name}, and cuisines from around the world.`
              : "Discover new recipes and explore culinary traditions from around the world."}
          </p>
          {userCountry?.name && (
            <p className="welcome-country-tag">
              🏠 Your country: <strong>{userCountry.name}</strong>
            </p>
          )}
        </section>

        {/* Stats */}
        <section className="stats-grid">
          {stats.map((item) => (
            <article key={item.label} className="dashboard-card stat-card">
              <div>
                <p>{item.label}</p>
                <h3 className={`tone-${item.tone}`}>{item.value}</h3>
              </div>
              <div className={`stat-icon tone-bg-${item.tone}`}>{item.icon}</div>
            </article>
          ))}
        </section>

        {/* Recommended for you */}
        <section className="dashboard-card discovered-card">
          <div className="discovered-header">
            <FaStar style={{ color: "#fbbf24", marginRight: 8 }} />
            <h3>
              {userCountry?.name
                ? `Recommended for ${firstName} — ${userCountry.name} & Region`
                : "Featured Recipes for You"}
            </h3>
          </div>
          <div className="discovered-grid">
            {recommendedRecipes.map((recipe) => (
              <article key={recipe.id} className="discover-item">
                <img src={recipe.image} alt={recipe.title} loading="lazy" />
                <div className="discover-body">
                  <h4>{recipe.title}</h4>
                  <p>{recipe.country} • {recipe.cuisine}</p>
                  <div>
                    <span>⏱️ {recipe.time}</span>
                    <button
                      type="button"
                      onClick={() => navigate(`/recipe/${recipe.id}`)}
                    >
                      View Recipe →
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Quick Actions */}
        <section className="dashboard-card" style={{ padding: "24px 28px" }}>
          <h3 style={{ marginTop: 0 }}>Quick Actions</h3>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button
              className="flavor-tile tone-bg-purple"
              style={{ borderRadius: 12, padding: "12px 20px", border: "none", cursor: "pointer", color: "#fff", display: "flex", alignItems: "center", gap: 8, fontWeight: 600 }}
              onClick={() => navigate("/")}
            >
              <FaUtensils /> Browse Recipes
            </button>
            <button
              className="flavor-tile tone-bg-indigo"
              style={{ borderRadius: 12, padding: "12px 20px", border: "none", cursor: "pointer", color: "#fff", display: "flex", alignItems: "center", gap: 8, fontWeight: 600 }}
              onClick={() => navigate("/flavor-map")}
            >
              <FaGlobe /> Explore Flavor Map
            </button>
          </div>
        </section>

        {/* Global Flavor Map tiles */}
        <section className="dashboard-card flavor-card">
          <h3>Global Flavor Map</h3>
          <p>Explore recipes by continent — Click a region to discover more</p>
          <div className="flavor-grid">
            {flavorRegions.map((region) => (
              <button
                key={region.name}
                type="button"
                className={`flavor-tile tone-bg-${region.tone}`}
                onClick={() => navigate("/flavor-map")}
              >
                <div className="emoji">{region.emoji}</div>
                <h4>{region.name}</h4>
                <span>{ALL_RECIPES.filter((r) => r.region === region.name).length} recipes</span>
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default DashboardPage;
