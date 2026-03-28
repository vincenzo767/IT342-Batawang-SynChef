import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  FaBookmark,
  FaCheckCircle,
  FaClock,
  FaEdit,
  FaGlobe,
  FaPaperPlane,
  FaPlus,
  FaStar,
  FaTrash
} from "react-icons/fa";
import { synCookApi } from "../api";
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
  const { user, favoriteRecipeIds } = useSelector((state) => state.auth);
  const firstName = user?.fullName?.split(" ")[0] || "Chef";
  const userId = user?.id;

  const [publicRecipes, setPublicRecipes] = useState([]);
  const [myRecipes, setMyRecipes] = useState([]);
  const [synCookLoading, setSynCookLoading] = useState(true);
  const [synCookError, setSynCookError] = useState("");

  const [filterKeyword, setFilterKeyword] = useState("");

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showManageModal, setShowManageModal] = useState(false);
  const [detailRecipe, setDetailRecipe] = useState(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [commentDraft, setCommentDraft] = useState("");
  const [editingRecipeId, setEditingRecipeId] = useState(null);

  const [form, setForm] = useState({
    title: "",
    country: "",
    ingredientsText: "",
    proceduresText: "",
    privacy: "PUBLIC",
    imageUrl: ""
  });

  const defaultDishImage = "https://images.unsplash.com/photo-1547592180-85f173990554?w=1200&q=80";

  const safeImageSrc = (value) => {
    const image = (value || "").trim();
    if (!image) return defaultDishImage;
    if (image.startsWith("data:image/")) {
      return image.includes(";base64,") ? image : defaultDishImage;
    }
    return image;
  };

  // Resolve user country — backend (Redux) is the source of truth; localStorage is a fallback
  const userCountry = useMemo(() => {
    if (user?.countryCode || user?.countryName) {
      return { code: user.countryCode || "", name: user.countryName || "" };
    }
    return getStoredCountry();
  }, [user]);

  // Saved recipes — read from top-level favoriteRecipeIds (no localStorage).
  // Mobile stores fallback IDs (webId + 10000); translate back to local recipe.
  const FALLBACK_OFFSET = 10000;
  const savedRecipes = useMemo(() => {
    const seen = new Set();
    return (favoriteRecipeIds || [])
      .map((id) => {
        const direct = ALL_RECIPES.find((r) => r.id === id);
        if (direct) return direct;
        if (id >= FALLBACK_OFFSET) return ALL_RECIPES.find((r) => r.id === id - FALLBACK_OFFSET) || null;
        return null;
      })
      .filter((r) => {
        if (!r) return false;
        if (seen.has(r.id)) return false;
        seen.add(r.id);
        return true;
      });
  }, [favoriteRecipeIds]);

  const savedCount = savedRecipes.length;

  // Countries Explored — unique countries across all saved recipes (updates in real-time)
  const countriesExplored = useMemo(() => {
    const uniqueCountries = new Set(savedRecipes.map((r) => r.country));
    return uniqueCountries.size;
  }, [savedRecipes]);

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

  const stats = [
    { label: "Saved Recipes", value: savedCount, tone: "purple", icon: <FaBookmark /> },
    { label: "Countries Explored", value: countriesExplored, tone: "indigo", icon: <FaGlobe /> },
    { label: "Recipes Tried", value: 0, tone: "green", icon: <FaCheckCircle /> },
    { label: "Cooking Time", value: "0h", tone: "orange", icon: <FaClock /> }
  ];

  const filteredPublicRecipes = useMemo(() => {
    const keyword = filterKeyword.trim().toLowerCase();
    if (!keyword) return publicRecipes;
    return publicRecipes.filter((recipe) => {
      return (
        recipe.title?.toLowerCase().includes(keyword) ||
        recipe.country?.toLowerCase().includes(keyword) ||
        recipe.ownerName?.toLowerCase().includes(keyword)
      );
    });
  }, [publicRecipes, filterKeyword]);

  const resetForm = () => {
    setEditingRecipeId(null);
    setForm({
      title: "",
      country: "",
      ingredientsText: "",
      proceduresText: "",
      privacy: "PUBLIC",
      imageUrl: ""
    });
  };

  const mapFormToPayload = () => ({
    title: form.title.trim(),
    country: form.country.trim(),
    privacy: form.privacy,
    imageUrl: form.imageUrl.trim() || null,
    ingredients: form.ingredientsText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean),
    procedures: form.proceduresText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
  });

  const seedFormFromRecipe = (recipe) => {
    setEditingRecipeId(recipe.id);
    setForm({
      title: recipe.title || "",
      country: recipe.country || "",
      privacy: recipe.privacy || "PUBLIC",
      imageUrl: recipe.imageUrl || "",
      ingredientsText: (recipe.ingredients || []).join("\n"),
      proceduresText: (recipe.procedures || []).join("\n")
    });
    setShowCreateModal(true);
    setShowManageModal(false);
  };

  const loadSynCook = async () => {
    setSynCookLoading(true);
    setSynCookError("");
    try {
      const [publicRes, myRes] = await Promise.all([synCookApi.getPublic(), synCookApi.getMine()]);
      setPublicRecipes(publicRes.data || []);
      setMyRecipes(myRes.data || []);
    } catch (error) {
      setSynCookError(error?.response?.data?.message || "Could not load SynCook recipes.");
    } finally {
      setSynCookLoading(false);
    }
  };

  const openRecipeDetail = async (recipeId) => {
    try {
      const res = await synCookApi.getById(recipeId);
      setDetailRecipe(res.data);
    } catch (error) {
      setSynCookError(error?.response?.data?.message || "Could not open recipe.");
    }
  };

  const submitRecipe = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setSynCookError("");
    try {
      const payload = mapFormToPayload();
      if (editingRecipeId) {
        await synCookApi.update(editingRecipeId, payload);
      } else {
        await synCookApi.create(payload);
      }
      setShowCreateModal(false);
      resetForm();
      await loadSynCook();
    } catch (error) {
      setSynCookError(error?.response?.data?.message || "Could not save recipe.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (recipeId) => {
    const confirmed = globalThis.confirm("Delete this dish permanently?");
    if (!confirmed) return;
    try {
      await synCookApi.remove(recipeId);
      if (detailRecipe?.id === recipeId) setDetailRecipe(null);
      await loadSynCook();
    } catch (error) {
      setSynCookError(error?.response?.data?.message || "Could not delete recipe.");
    }
  };

  const submitComment = async () => {
    if (!detailRecipe?.id || !commentDraft.trim()) return;
    try {
      await synCookApi.addComment(detailRecipe.id, commentDraft.trim());
      setCommentDraft("");
      await openRecipeDetail(detailRecipe.id);
      await loadSynCook();
    } catch (error) {
      setSynCookError(error?.response?.data?.message || "Could not send comment.");
    }
  };

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      setForm((prev) => ({ ...prev, imageUrl: result }));
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    loadSynCook();
  }, []);

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

        {/* Stats — all values are live from Redux (backend-synced) */}
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

        <section className="syncook-shell">
          <div className="syncook-header">
            <div>
              <h3>Let&apos;s SynCook!</h3>
              <p>Explore local recipes from the SynCook community</p>
            </div>
            <div className="syncook-actions">
              <button
                type="button"
                className="syncook-action-btn"
                onClick={() => {
                  resetForm();
                  setShowCreateModal(true);
                }}
              >
                <FaPlus /> Create
              </button>
              <button
                type="button"
                className="syncook-action-btn"
                onClick={() => setShowManageModal(true)}
              >
                Manage
              </button>
            </div>
          </div>

          <div className="syncook-toolbar">
            <input
              type="text"
              placeholder="Search by dish, country, or chef"
              value={filterKeyword}
              onChange={(event) => setFilterKeyword(event.target.value)}
            />
          </div>

          {synCookLoading && <p className="syncook-status">Loading SynCook dishes...</p>}
          {!synCookLoading && synCookError && <p className="syncook-status syncook-status-error">{synCookError}</p>}

          <div className="syncook-grid">
            {filteredPublicRecipes.map((recipe) => (
              <article key={recipe.id} className="syncook-card">
                <img
                  src={safeImageSrc(recipe.imageUrl)}
                  alt={recipe.title}
                />
                <div className="syncook-card-body">
                  <h4>{recipe.title}</h4>
                  <p>{recipe.country} • by {recipe.ownerName}</p>
                  <div className="syncook-card-footer">
                    <span>{recipe.commentCount || 0} comments</span>
                    <button type="button" onClick={() => openRecipeDetail(recipe.id)}>
                      View Recipe →
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>

      {(showCreateModal || showManageModal || detailRecipe) && (
        <div className="syncook-modal-backdrop">
          {showCreateModal && (
            <div className="syncook-modal">
              <h3>{editingRecipeId ? "Edit SynCook Dish" : "Create SynCook Dish"}</h3>
              <form onSubmit={submitRecipe} className="syncook-form">
                <label>
                  <span>Dish Name</span>
                  <input
                    value={form.title}
                    onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
                    required
                  />
                </label>

                <label>
                  <span>Country</span>
                  <input
                    value={form.country}
                    onChange={(event) => setForm((prev) => ({ ...prev, country: event.target.value }))}
                    required
                  />
                </label>

                <label>
                  <span>Ingredients (one per line)</span>
                  <textarea
                    rows={4}
                    value={form.ingredientsText}
                    onChange={(event) => setForm((prev) => ({ ...prev, ingredientsText: event.target.value }))}
                    required
                  />
                </label>

                <label>
                  <span>Procedures (one per line)</span>
                  <textarea
                    rows={5}
                    value={form.proceduresText}
                    onChange={(event) => setForm((prev) => ({ ...prev, proceduresText: event.target.value }))}
                    required
                  />
                </label>

                <div className="syncook-form-row">
                  <label>
                    <span>Privacy</span>
                    <select
                      value={form.privacy}
                      onChange={(event) => setForm((prev) => ({ ...prev, privacy: event.target.value }))}
                    >
                      <option value="PUBLIC">Public</option>
                      <option value="PRIVATE">Private</option>
                    </select>
                  </label>

                  <label>
                    <span>Upload Image</span>
                    <input type="file" accept="image/*" onChange={handleImageUpload} />
                  </label>
                </div>

                <label>
                  <span>Image URL (optional)</span>
                  <input
                    value={form.imageUrl}
                    onChange={(event) => setForm((prev) => ({ ...prev, imageUrl: event.target.value }))}
                  />
                </label>

                {!!synCookError && (
                  <p className="syncook-status syncook-status-error" style={{ margin: 0 }}>
                    {synCookError}
                  </p>
                )}

                <div className="syncook-modal-actions">
                  <button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Saving..." : "Upload"}
                  </button>
                  <button type="button" onClick={() => setShowCreateModal(false)}>Cancel</button>
                </div>
              </form>
            </div>
          )}

          {showManageModal && (
            <div className="syncook-modal">
              <h3>Personal Collection</h3>
              <p className="syncook-manage-subtitle">Uploaded: {myRecipes.length}</p>
              <div className="syncook-manage-grid">
                {myRecipes.map((recipe) => (
                  <article key={recipe.id} className="syncook-manage-item">
                    <img
                      src={safeImageSrc(recipe.imageUrl)}
                      alt={recipe.title}
                    />
                    <div>
                      <h4>{recipe.title}</h4>
                      <p>{recipe.country} • {recipe.privacy}</p>
                    </div>
                    <div className="syncook-manage-actions">
                      <button type="button" onClick={() => seedFormFromRecipe(recipe)}><FaEdit /> Edit</button>
                      <button type="button" onClick={() => handleDelete(recipe.id)}><FaTrash /> Delete</button>
                    </div>
                  </article>
                ))}
              </div>
              <div className="syncook-modal-actions">
                <button type="button" onClick={() => setShowManageModal(false)}>Close</button>
              </div>
            </div>
          )}

          {detailRecipe && (
            <div className="syncook-modal">
              <h3>{detailRecipe.title}</h3>
              <p className="syncook-detail-meta">
                {detailRecipe.country} • by {detailRecipe.ownerName}
              </p>
              {detailRecipe.imageUrl && (
                <img className="syncook-detail-image" src={safeImageSrc(detailRecipe.imageUrl)} alt={detailRecipe.title} />
              )}

              <div className="syncook-detail-sections">
                <div>
                  <h4>Ingredients</h4>
                  <ul>
                    {(detailRecipe.ingredients || []).map((item, index) => (
                      <li key={`${item}-${index}`}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4>Procedures</h4>
                  <ol>
                    {(detailRecipe.procedures || []).map((item, index) => (
                      <li key={`${item}-${index}`}>{item}</li>
                    ))}
                  </ol>
                </div>
              </div>

              <div className="syncook-comments">
                <h4>Comments / Feedback</h4>
                <div className="syncook-comment-list">
                  {(detailRecipe.comments || []).map((comment) => (
                    <article key={comment.id}>
                      <strong>{comment.authorName}</strong>
                      <p>{comment.content}</p>
                    </article>
                  ))}
                </div>
                <div className="syncook-comment-box">
                  <textarea
                    rows={3}
                    value={commentDraft}
                    onChange={(event) => setCommentDraft(event.target.value)}
                    placeholder="Leave feedback"
                  />
                  <button type="button" onClick={submitComment}>
                    <FaPaperPlane /> Send
                  </button>
                </div>
              </div>

              {detailRecipe.canEdit && detailRecipe.ownerId === userId && (
                <div className="syncook-owner-actions">
                  <button type="button" onClick={() => seedFormFromRecipe(detailRecipe)}>
                    <FaEdit /> Edit This Recipe
                  </button>
                  <button type="button" onClick={() => handleDelete(detailRecipe.id)}>
                    <FaTrash /> Delete
                  </button>
                </div>
              )}

              <div className="syncook-modal-actions">
                <button type="button" onClick={() => setDetailRecipe(null)}>Close</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
