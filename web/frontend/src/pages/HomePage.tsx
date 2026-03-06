import { useMemo, useState } from 'react';
import {
  FaClock,
  FaGlobe,
  FaMapMarkerAlt,
  FaSearch,
  FaTimes,
  FaUtensils
} from 'react-icons/fa';
import './HomePage.css';

interface LocalRecipe {
  id: number;
  title: string;
  region: string;
  cuisine: string;
  time: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  image: string;
}

const recipes: LocalRecipe[] = [
  { id: 1, title: 'Italian Carbonara', region: 'Europe', cuisine: 'Italian', time: '30 min', difficulty: 'Medium', image: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=800' },
  { id: 2, title: 'Thai Pad Thai', region: 'Asia', cuisine: 'Thai', time: '25 min', difficulty: 'Easy', image: 'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=800' },
  { id: 3, title: 'Mexican Tacos', region: 'North America', cuisine: 'Mexican', time: '20 min', difficulty: 'Easy', image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800' },
  { id: 4, title: 'Japanese Ramen', region: 'Asia', cuisine: 'Japanese', time: '45 min', difficulty: 'Hard', image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800' },
  { id: 5, title: 'French Coq au Vin', region: 'Europe', cuisine: 'French', time: '90 min', difficulty: 'Hard', image: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=800' },
  { id: 6, title: 'Indian Butter Chicken', region: 'Asia', cuisine: 'Indian', time: '60 min', difficulty: 'Medium', image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=800' },
  { id: 7, title: 'Brazilian Feijoada', region: 'South America', cuisine: 'Brazilian', time: '120 min', difficulty: 'Medium', image: 'https://images.unsplash.com/photo-1582169296194-e4d644c48063?w=800' },
  { id: 8, title: 'Moroccan Tagine', region: 'Africa', cuisine: 'Moroccan', time: '75 min', difficulty: 'Medium', image: 'https://images.unsplash.com/photo-1599043513900-ed6fe01d3833?w=800' },
  { id: 9, title: 'Australian Meat Pie', region: 'Oceania', cuisine: 'Australian', time: '40 min', difficulty: 'Medium', image: 'https://images.unsplash.com/photo-1619881991144-3f7e3c285e0f?w=800' }
];

const continents = [
  { name: 'North America', count: '1,234' },
  { name: 'South America', count: '876' },
  { name: 'Europe', count: '2,156' },
  { name: 'Africa', count: '1,543' },
  { name: 'Asia', count: '3,421' },
  { name: 'Oceania', count: '432' }
];

const HomePage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeRegion, setActiveRegion] = useState<string | null>(null);
  const [flavorMapOpen, setFlavorMapOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    globalThis.setTimeout(() => setToast(null), 2800);
  };

  const visibleRecipes = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return recipes.filter((recipe) => {
      const matchesSearch =
        !query ||
        recipe.title.toLowerCase().includes(query) ||
        recipe.cuisine.toLowerCase().includes(query) ||
        recipe.region.toLowerCase().includes(query);

      const matchesRegion = !activeRegion || recipe.region === activeRegion;
      return matchesSearch && matchesRegion;
    });
  }, [activeRegion, searchQuery]);

  const hasFilters = Boolean(searchQuery.trim() || activeRegion);

  const handleContinentSelect = (continent: string) => {
    setActiveRegion(continent);
    setFlavorMapOpen(false);
    showToast(`Showing recipes from ${continent}`);
  };

  const resetFilters = () => {
    setSearchQuery('');
    setActiveRegion(null);
  };

  return (
    <div className="home-page">
      <div className="synchef-gradient-bg">
        <div className="container">
          <section className="home-hero">
            <h1 className="home-title">
              Discover <span>Global</span> Flavors
            </h1>
            <p className="home-subtitle">
              Explore authentic recipes from around the world, powered by AI-driven recommendations tailored to your taste.
            </p>

            <div className="home-search-wrap">
              <FaSearch className="home-search-icon" />
              <input
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search by cuisine, ingredient, or region..."
                className="home-search-input"
              />
            </div>

            <div className="hero-actions">
              <button className="hero-action-primary" onClick={() => setFlavorMapOpen(true)}>
                Explore the Flavor Map
              </button>
            </div>
          </section>

          {!hasFilters && (
            <section className="home-features">
              <article className="home-feature-card">
                <div className="feature-icon-wrap"><FaGlobe /></div>
                <h3>Global Cuisine Explorer</h3>
                <p>Discover authentic recipes from 6 continents with cultural insights.</p>
              </article>
              <article className="home-feature-card">
                <div className="feature-icon-wrap"><FaUtensils /></div>
                <h3>AI-Powered Suggestions</h3>
                <p>Smart recommendations based on your preferences and cooking style.</p>
              </article>
              <article className="home-feature-card">
                <div className="feature-icon-wrap"><FaMapMarkerAlt /></div>
                <h3>Cultural Deep Dives</h3>
                <p>Learn the stories and traditions behind every dish.</p>
              </article>
            </section>
          )}

          <section className="recipe-section">
            <div className="recipe-section-header">
              <h2>Featured Recipes</h2>
              {hasFilters && (
                <button className="clear-filters-btn" onClick={resetFilters}>
                  <FaTimes /> Clear Filters
                </button>
              )}
            </div>

            {visibleRecipes.length === 0 ? (
              <div className="empty-recipe-state">No recipes found</div>
            ) : (
              <div className="recipe-grid">
                {visibleRecipes.map((recipe) => (
                  <article key={recipe.id} className="synchef-recipe-card">
                    <img src={recipe.image} alt={recipe.title} loading="lazy" />
                    <div className="synchef-recipe-body">
                      <div className="recipe-badges">
                        <span className="cuisine-badge">{recipe.cuisine}</span>
                        <span className="difficulty-badge">{recipe.difficulty}</span>
                      </div>
                      <h3>{recipe.title}</h3>
                      <div className="recipe-meta-row">
                        <span><FaClock /> {recipe.time}</span>
                        <span><FaMapMarkerAlt /> {recipe.region}</span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>

        <footer className="home-footer">
          <div className="container home-footer-inner">
            <div className="footer-brand">
              <FaUtensils />
              <span>SynChef</span>
            </div>
            <div className="footer-links">
              <button type="button">Privacy Policy</button>
              <button type="button">Terms of Service</button>
              <button type="button">Contact Us</button>
            </div>
            <p>© 2026 SynChef AI. All rights reserved.</p>
          </div>
        </footer>

        {flavorMapOpen && (
          <dialog className="flavor-map-modal" open>
            <div className="flavor-map-panel">
              <div className="flavor-map-header">
                <h2>Global Flavor Map</h2>
                <button type="button" onClick={() => setFlavorMapOpen(false)} aria-label="Close flavor map">
                  <FaTimes />
                </button>
              </div>
              <p className="flavor-map-subtitle">Click on any continent to explore recipes from that region.</p>
              <div className="continent-grid">
                {continents.map((continent) => (
                  <button
                    type="button"
                    key={continent.name}
                    className="continent-card"
                    onClick={() => handleContinentSelect(continent.name)}
                  >
                    <h3>{continent.name}</h3>
                    <span>{continent.count} recipes</span>
                  </button>
                ))}
              </div>
            </div>
          </dialog>
        )}

        {toast && (
          <output className={`home-toast ${toast.type}`} aria-live="polite">
            {toast.message}
          </output>
        )}
      </div>
    </div>
  );
};

export default HomePage;
