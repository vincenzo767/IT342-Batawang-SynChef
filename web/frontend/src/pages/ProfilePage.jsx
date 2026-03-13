import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { FaCalendarAlt, FaMapMarkerAlt, FaBookmark, FaHeart } from "react-icons/fa";
import { ALL_RECIPES } from "../data/recipes";
import "./ProfilePage.css";

const formatJoinDate = (dateStr) => {
  if (!dateStr) return "Recently";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  } catch {
    return "Recently";
  }
};

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const fullName = user?.fullName || "Chef";
  const email = user?.email || "";

  const userCountry = useMemo(() => {
    if (user?.countryCode || user?.countryName) {
      return { code: user.countryCode || "", name: user.countryName || "" };
    }
    return null;
  }, [user]);

  const initials = useMemo(
    () => fullName.split(" ").filter(Boolean).map((t) => t[0]).join("").slice(0, 2).toUpperCase(),
    [fullName]
  );

  // Saved recipes — sourced entirely from backend via Redux (favoriteRecipeIds)
  const savedRecipes = useMemo(() => {
    const ids = user?.favoriteRecipeIds || [];
    return ids.map((id) => ALL_RECIPES.find((r) => r.id === id)).filter(Boolean);
  }, [user]);

  const savedCount = savedRecipes.length;

  // Recent activity — derived from the user's actual saved recipes (most recent last → reversed)
  const recentActivity = useMemo(
    () =>
      savedRecipes
        .slice(-4)
        .reverse()
        .map((r) => ({ id: r.id, text: `Saved "${r.title}"`, sub: `${r.country} • ${r.cuisine}` })),
    [savedRecipes]
  );

  // Achievements — data-driven based on real saved count
  const achievements = useMemo(() => {
    const list = [];
    if (savedCount >= 1) list.push({ badge: "⭐", title: "First Save", desc: "Saved your first recipe" });
    if (savedCount >= 5) list.push({ badge: "🔥", title: "Recipe Collector", desc: "Saved 5+ recipes" });
    if (savedCount >= 10) list.push({ badge: "🏆", title: "Culinary Explorer", desc: "Saved 10+ recipes" });
    if (userCountry) list.push({ badge: "🌍", title: "World Citizen", desc: `Cooking from ${userCountry.name}` });
    if (list.length === 0)
      list.push({ badge: "👨‍🍳", title: "New Chef", desc: "Save recipes to earn your first badge!" });
    return list;
  }, [savedCount, userCountry]);

  const earnedBadgeCount = achievements.filter((a) => a.badge !== "👨‍🍳").length;

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
              <h3 className="tone-green">{earnedBadgeCount}</h3>
              <p>Badges Earned</p>
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
                  <span>Joined {formatJoinDate(user?.createdAt)}</span>
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
                {achievements.map((a) => (
                  <article key={a.title}>
                    <div className="achievement-badge">{a.badge}</div>
                    <div>
                      <h4>{a.title}</h4>
                      <p>{a.desc}</p>
                    </div>
                  </article>
                ))}
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
              {recentActivity.length > 0 ? (
                <div className="activity-list">
                  {recentActivity.map((item) => (
                    <article
                      key={item.id}
                      className="activity tone-purple"
                      style={{ cursor: "pointer" }}
                      onClick={() => navigate(`/recipe/${item.id}`)}
                    >
                      <h4>
                        <FaHeart style={{ marginRight: 6, fontSize: "0.82em", verticalAlign: "middle" }} />
                        {item.text}
                      </h4>
                      <p>{item.sub}</p>
                    </article>
                  ))}
                </div>
              ) : (
                <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.9rem", padding: "12px 0" }}>
                  No activity yet — start saving recipes to see them here!
                </p>
              )}
            </section>

            <section className="profile-panel">
              <h3>Saved Recipes</h3>
              {savedRecipes.length > 0 ? (
                <div className="saved-recipes-grid">
                  {savedRecipes.slice(0, 4).map((recipe) => (
                    <button
                      key={recipe.id}
                      type="button"
                      className="saved-recipe-card"
                      onClick={() => navigate(`/recipe/${recipe.id}`)}
                    >
                      <img src={recipe.image} alt={recipe.title} loading="lazy" />
                      <div>
                        <h4>{recipe.title}</h4>
                        <p>{recipe.country} • {recipe.time}</p>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.9rem", padding: "12px 0" }}>
                  No saved recipes yet — browse recipes and tap ♥ to save them here.
                </p>
              )}
            </section>
          </main>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
