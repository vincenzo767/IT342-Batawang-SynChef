import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { FaCalendarAlt, FaMapMarkerAlt, FaBookmark } from "react-icons/fa";
import { ALL_RECIPES } from "../data/recipes";
import "./ProfilePage.css";

// localStorage fallback only — Redux (backend) is the source of truth
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

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const fullName = user?.fullName || "Chef";
  const email = user?.email || "";

  // Country — sourced from Redux (populated from backend on login/register)
  const userCountry = useMemo(() => {
    if (user?.countryCode || user?.countryName) {
      return { code: user.countryCode || "", name: user.countryName || "" };
    }
    return getStoredCountry();
  }, [user]);

  const initials = useMemo(
    () => fullName.split(" ").filter(Boolean).map((t) => t[0]).join("").slice(0, 2).toUpperCase(),
    [fullName]
  );

  // Saved count — sourced from Redux (populated from backend)
  const savedCount = user?.favoriteRecipeIds?.length ?? 0;

  // Saved recipe cards — sourced from Redux favoriteRecipeIds (backend-persisted)
  const savedRecipeCards = useMemo(() => {
    const ids = user?.favoriteRecipeIds || [];
    const matched = ids
      .map((id) => ALL_RECIPES.find((r) => r.id === id))
      .filter(Boolean)
      .slice(0, 4);
    if (matched.length > 0) {
      return matched.map((r) => ({ id: r.id, title: r.title, subtitle: `${r.country} • ${r.time}`, image: r.image }));
    }
    // Placeholder cards shown for new accounts with no favorites yet
    return [
      { id: 2, title: "Pad Thai", subtitle: "Thailand • 30 min", image: "https://images.unsplash.com/photo-1559314809-0d155014e29e?w=800" },
      { id: 3, title: "Paella Valenciana", subtitle: "Spain • 45 min", image: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=800" }
    ];
  }, [user]);

  return (
    <div className="profile-page">
      <div className="container profile-shell">
        <section className="profile-header-card">
          <div className="profile-cover" />
          <div className="profile-header-content">
            <div className="profile-avatar-wrap">
              <div className="profile-avatar">{initials}</div>
            </div>
            <div className="profile-identity">
              <h2>{fullName}</h2>
              <p>{email}</p>
            </div>
          </div>

          <div className="profile-stats-grid">
            <article>
              <h3>{savedCount}</h3>
              <p>Saved Recipes</p>
            </article>
            <article>
              <h3 className="tone-indigo">{userCountry ? 1 : 0}</h3>
              <p>Countries Explored</p>
            </article>
            <article>
              <h3 className="tone-green">0</h3>
              <p>Recipes Tried</p>
            </article>
          </div>
        </section>

        <div className="profile-grid">
          <aside className="profile-left-col">
            <section className="profile-panel">
              <h3>About</h3>
              <div className="about-list">
                {userCountry?.name && (
                  <div className="about-row">
                    <FaMapMarkerAlt />
                    <span>{userCountry.name}</span>
                  </div>
                )}
                <div className="about-row">
                  <FaCalendarAlt />
                  <span>Joined March 2026</span>
                </div>
                <div className="about-row">
                  <FaBookmark />
                  <span>{savedCount} saved recipe{savedCount !== 1 ? "s" : ""}</span>
                </div>
              </div>
            </section>

            <section className="profile-panel">
              <h3>Achievements</h3>
              <div className="achievements-list">
                <article>
                  <div className="achievement-badge">🏆</div>
                  <div>
                    <h4>World Explorer</h4>
                    <p>Tried recipes from 10+ countries</p>
                  </div>
                </article>
                <article>
                  <div className="achievement-badge">🔥</div>
                  <div>
                    <h4>Cooking Streak</h4>
                    <p>7 days in a row</p>
                  </div>
                </article>
                <article>
                  <div className="achievement-badge">⭐</div>
                  <div>
                    <h4>Recipe Master</h4>
                    <p>Completed 30+ recipes</p>
                  </div>
                </article>
              </div>
            </section>
          </aside>

          <main className="profile-right-col">
            <section className="profile-panel">
              <h3>Favorite Cuisines</h3>
              <div className="favorite-cuisines-grid">
                {[
                  { emoji: "🍕", label: "Italian", count: ALL_RECIPES.filter((r) => r.country === "Italy").length },
                  { emoji: "🍜", label: "Asian", count: ALL_RECIPES.filter((r) => r.region === "Asia").length },
                  { emoji: "🌮", label: "Mexican", count: ALL_RECIPES.filter((r) => r.country === "Mexico").length },
                  { emoji: "🍛", label: "Indian", count: ALL_RECIPES.filter((r) => r.country === "India").length }
                ].map((c) => (
                  <button key={c.label} type="button" onClick={() => navigate("/flavor-map")}>
                    <div className="cuisine-emoji">{c.emoji}</div>
                    <strong>{c.label}</strong>
                    <span>{c.count} recipes</span>
                  </button>
                ))}
              </div>
            </section>

            <section className="profile-panel">
              <h3>Recent Activity</h3>
              <div className="activity-list">
                <article className="activity tone-purple">
                  <h4>Completed Pad Thai recipe</h4>
                  <p>2 days ago</p>
                </article>
                <article className="activity tone-indigo">
                  <h4>Saved Paella Valenciana</h4>
                  <p>3 days ago</p>
                </article>
                <article className="activity tone-green">
                  <h4>Earned World Explorer badge</h4>
                  <p>5 days ago</p>
                </article>
                <article className="activity tone-orange">
                  <h4>Tried Butter Chicken</h4>
                  <p>1 week ago</p>
                </article>
              </div>
            </section>

            <section className="profile-panel">
              <h3>Saved Recipes</h3>
              <div className="saved-recipes-grid">
                {savedRecipeCards.map((recipe) => (
                  <button
                    key={recipe.title}
                    type="button"
                    className="saved-recipe-card"
                    onClick={() => navigate(`/recipe/${recipe.id}`)}
                  >
                    <img src={recipe.image} alt={recipe.title} loading="lazy" />
                    <div>
                      <h4>{recipe.title}</h4>
                      <p>{recipe.subtitle}</p>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
