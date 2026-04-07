import { useMemo, useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { FaCalendarAlt, FaMapMarkerAlt, FaBookmark, FaHeart } from "react-icons/fa";
import { Client } from "@stomp/stompjs";
import { ALL_RECIPES } from "../data/recipes";
import { refreshUser } from "../store/authSlice";
import { userApi, recipeApi } from "../api";
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
  const location = useLocation();
  const dispatch = useDispatch();
  const { user, favoriteRecipeIds, isAuthenticated } = useSelector((state) => state.auth);
  const fileInputRef = useRef(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const profileImageUrl = useMemo(() => {
    if (!user?.profileImageUrl) return "";
    if (user.profileImageUrl.startsWith("http://") || user.profileImageUrl.startsWith("https://")) {
      return user.profileImageUrl;
    }
    return user.profileImageUrl;
  }, [user?.profileImageUrl]);

  useEffect(() => {
    if (!isAuthenticated || !user?.id) return undefined;

    let subscription = null;
    const wsLocation = globalThis.location;
    const client = new Client({
      brokerURL: `${wsLocation?.protocol === "https:" ? "wss" : "ws"}://${wsLocation?.host}/ws-native`,
      reconnectDelay: 5000,
      onConnect: () => {
        subscription = client.subscribe(`/topic/user-profile/${user.id}`, (frame) => {
          try {
            const payload = JSON.parse(frame.body);
            dispatch(refreshUser(payload));
          } catch {
            // Ignore malformed payloads from stale clients.
          }
        });
      }
    });

    client.activate();
    return () => {
      if (subscription) subscription.unsubscribe();
      client.deactivate();
    };
  }, [isAuthenticated, user?.id, dispatch]);

  const triggerImagePicker = () => {
    fileInputRef.current?.click();
  };

  const handleProfileImageChange = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setIsUploadingImage(true);
    try {
      const res = await userApi.uploadProfileImage(file);
      dispatch(refreshUser(res.data));
    } catch {
      // Keep current image if upload fails.
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Fetch fresh user data whenever navigating to /profile
  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchUserData = () => {
      userApi.getMe()
        .then((res) => dispatch(refreshUser(res.data)))
        .catch(() => { /* keep cached data on network errors */ });
    };
    fetchUserData();
  }, [location.pathname, isAuthenticated, dispatch]);

  // Poll for fresh data every 10 seconds while viewing ProfilePage
  // This ensures real-time sync if another device (mobile) saves recipes
  useEffect(() => {
    if (!isAuthenticated) return;
    console.log("[ProfilePage] Starting 10-second polling");
    const pollInterval = setInterval(() => {
      console.log("[ProfilePage] Polling tick - fetching fresh data");
      userApi.getMe()
        .then((res) => {
          dispatch(refreshUser(res.data));
        })
        .catch(() => { /* keep cached profile on transient errors */ });
    }, 10000); // 10 seconds
    return () => clearInterval(pollInterval);
  }, [isAuthenticated, dispatch]);

  // Refresh data when browser tab regains focus (user switches back from mobile)
  useEffect(() => {
    if (!isAuthenticated) return;
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        userApi.getMe()
          .then((res) => dispatch(refreshUser(res.data)))
          .catch(() => { /* keep cached data */ });
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [isAuthenticated, dispatch]);

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

  // Mobile uses FALLBACK_ID_OFFSET (10000) to store local recipe IDs:
  // mobile recipe 26 → stored in backend favorites as 10026.
  // We need to recognize these when resolving favorites cross-platform.
  const FALLBACK_OFFSET = 10000;

  // For saved recipe IDs that aren't resolvable locally (neither direct nor via
  // mobile fallback offset), fetch their details from the backend.
  const [backendOnlyRecipes, setBackendOnlyRecipes] = useState([]);

  useEffect(() => {
    const missingIds = (favoriteRecipeIds || []).filter((id) => {
      if (ALL_RECIPES.some((r) => r.id === id)) return false;
      // Mobile fallback ID: id = FALLBACK_OFFSET + webRecipeId
      if (id >= FALLBACK_OFFSET && ALL_RECIPES.some((r) => r.id === id - FALLBACK_OFFSET)) return false;
      return true;
    });
    if (missingIds.length === 0) {
      setBackendOnlyRecipes([]);
      return;
    }
    Promise.all(
      missingIds.map((id) =>
        recipeApi.getById(id)
          .then((res) => ({
            id: res.data.id,
            title: res.data.name,
            country: res.data.country?.name || "",
            cuisine: res.data.categories?.[0]?.name || "",
            time: `${res.data.totalTimeMinutes} min`,
            image: res.data.imageUrl || null
          }))
          .catch(() => null)
      )
    ).then((results) => setBackendOnlyRecipes(results.filter(Boolean)));
  }, [favoriteRecipeIds]);

  // Saved recipes — resolve direct IDs, then mobile fallback IDs, then backend-only
  const savedRecipes = useMemo(() => {
    const seen = new Set();
    const local = (favoriteRecipeIds || [])
      .map((id) => {
        const direct = ALL_RECIPES.find((r) => r.id === id);
        if (direct) return direct;
        // Translate mobile fallback ID back to local recipe
        if (id >= FALLBACK_OFFSET) {
          const fromFallback = ALL_RECIPES.find((r) => r.id === id - FALLBACK_OFFSET);
          if (fromFallback) return fromFallback;
        }
        return null;
      })
      .filter((r) => {
        if (!r) return false;
        if (seen.has(r.id)) return false;
        seen.add(r.id);
        return true;
      });
    return [...local, ...backendOnlyRecipes];
  }, [favoriteRecipeIds, backendOnlyRecipes]);

  const savedCount = savedRecipes.length;

  // Countries Explored — unique countries across all saved recipes (real-time)
  const countriesExplored = useMemo(
    () => new Set(savedRecipes.map((r) => r.country)).size,
    [savedRecipes]
  );

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
    if (savedCount > 4) list.push({ badge: "🔥", title: "Recipe Collector", desc: "Saved 5+ recipes" });
    if (savedCount >= 10) list.push({ badge: "🏆", title: "Culinary Explorer", desc: "Saved 10+ recipes" });
    if (userCountry) list.push({ badge: "🌍", title: "World Citizen", desc: `Cooking from ${userCountry.name}` });
    if (list.length === 0)
      list.push({ badge: "👨‍🍳", title: "New Chef", desc: "Save recipes to earn your first badge!" });
    return list;
  }, [savedCount, userCountry]);

  const earnedBadgeCount = achievements.filter((a) => a.badge !== "👨‍�").length;

  return (
    <div className="profile-page">
      <div className="container profile-shell">
        <section className="profile-header-card">
          <div className="profile-cover" />
          <div className="profile-header-content">
            <div className="profile-avatar-wrap">
              <div className="profile-avatar">
                {profileImageUrl ? (
                  <img src={profileImageUrl} alt={`${fullName} profile`} />
                ) : (
                  initials
                )}
              </div>
              <button
                type="button"
                className="profile-avatar-upload"
                onClick={triggerImagePicker}
                disabled={isUploadingImage}
              >
                {isUploadingImage ? "Uploading..." : "Change Photo"}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                onChange={handleProfileImageChange}
                hidden
              />
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
              <h3 className="tone-indigo">{countriesExplored}</h3>
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
                    <span>{savedCount} saved recipe{savedCount === 1 ? "" : "s"}</span>
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
                    <button
                      key={item.id}
                      type="button"
                      className="activity tone-purple"
                      onClick={() => navigate(`/recipe/${item.id}`)}
                    >
                      <h4>
                        <FaHeart style={{ marginRight: 6, fontSize: "0.82em", verticalAlign: "middle" }} />
                        {item.text}
                      </h4>
                      <p>{item.sub}</p>
                    </button>
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
