import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FaClock, FaUsers, FaSearch, FaTimes } from 'react-icons/fa';
import { recipeApi } from '../api';
import { Recipe } from '../types';
import './HomePage.css';

interface Category {
  id: number;
  name: string;
  iconName: string;
}

const HomePage = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const navigate = useNavigate();

  // Sample categories - in production, fetch from backend
  const defaultCategories: Category[] = [
    { id: 1, name: 'Breakfast', iconName: '🍳' },
    { id: 2, name: 'Lunch', iconName: '🍲' },
    { id: 3, name: 'Dinner', iconName: '🍽️' },
    { id: 4, name: 'Dessert', iconName: '🍰' },
    { id: 5, name: 'Appetizer', iconName: '🥗' },
    { id: 6, name: 'Beverage', iconName: '☕' },
  ];

  useEffect(() => {
    setCategories(defaultCategories);
    loadRecipes();
  }, []);

  useEffect(() => {
    filterRecipes();
  }, [recipes, searchTerm, selectedCategory]);

  const loadRecipes = async () => {
    try {
      const response = await recipeApi.getAll();
      setRecipes(response.data);
    } catch (error) {
      console.error('Failed to load recipes:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterRecipes = () => {
    let filtered = recipes;

    // Filter by search term
    if (searchTerm.trim()) {
      filtered = filtered.filter(recipe =>
        recipe.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recipe.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(recipe =>
        recipe.categories?.some(cat => cat.name === selectedCategory)
      );
    }

    setFilteredRecipes(filtered);
  };

  const handleSearch = () => {
    // Already filtered via useEffect
  };

  const handleRecipeClick = (recipeId: number) => {
    navigate(`/recipe/${recipeId}`);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory(null);
  };

  return (
    <div className="home-page page">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="hero-section"
        >
          <h1 className="hero-title">
            Welcome to <span className="gradient-text">SynChef</span>
          </h1>
          <p className="hero-subtitle">
            AI-Powered Global Cooking Assistant with Real-Time Execution
          </p>

          <div className="search-bar">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search recipes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="search-input"
            />
            <button onClick={handleSearch} className="btn btn-primary">
              Search
            </button>
          </div>

          <button
            onClick={() => navigate('/flavor-map')}
            className="btn btn-primary btn-large"
          >
            <FaUsers />
            Explore Global Flavor Map
          </button>
        </motion.div>

        <div className="features-section">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="feature-card"
          >
            <div className="feature-icon">⏱️</div>
            <h3>Parallel Timers</h3>
            <p>Track multiple cooking tasks simultaneously</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="feature-card"
          >
            <div className="feature-icon">🌍</div>
            <h3>Global Gastronomy</h3>
            <p>Explore authentic recipes from around the world</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="feature-card"
          >
            <div className="feature-icon">🤖</div>
            <h3>AI Assistant</h3>
            <p>Smart substitutions and personalized tips</p>
          </motion.div>
        </div>

        <div className="recipes-section">
          <div className="section-header">
            <h2 className="section-title">
              {selectedCategory ? `${selectedCategory} Recipes` : 'Popular Recipes'}
            </h2>
            {(searchTerm || selectedCategory) && (
              <button className="clear-filters-btn" onClick={clearFilters}>
                <FaTimes /> Clear Filters
              </button>
            )}
          </div>

          <div className="category-filter">
            <button
              className={`category-btn ${!selectedCategory ? 'active' : ''}`}
              onClick={() => setSelectedCategory(null)}
            >
              All
            </button>
            {categories.map(category => (
              <button
                key={category.id}
                className={`category-btn ${selectedCategory === category.name ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category.name)}
              >
                {category.iconName} {category.name}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="loading">
              <div className="spinner" />
            </div>
          ) : filteredRecipes.length > 0 ? (
            <>
              <p className="recipes-count">{filteredRecipes.length} recipe{filteredRecipes.length !== 1 ? 's' : ''} found</p>
              <div className="grid grid-2">
                {filteredRecipes.map((recipe) => (
                  <motion.div
                    key={recipe.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.02 }}
                    className="recipe-card card"
                    onClick={() => handleRecipeClick(recipe.id)}
                  >
                    <div className="recipe-header">
                      <h3>{recipe.name}</h3>
                      {recipe.country?.flagEmoji && (
                        <span className="country-flag">{recipe.country.flagEmoji}</span>
                      )}
                    </div>

                    <p className="recipe-description">{recipe.description}</p>

                    <div className="recipe-meta">
                      <div className="meta-item">
                        <FaClock />
                        <span>{recipe.totalTimeMinutes || 0} min</span>
                      </div>
                      <div className="meta-item">
                        <FaUsers />
                        <span>{recipe.defaultServings || 1} servings</span>
                      </div>
                      {recipe.difficultyLevel && (
                        <span className={`badge badge-${recipe.difficultyLevel.toLowerCase()}`}>
                          {recipe.difficultyLevel}
                        </span>
                      )}
                    </div>

                    <div className="recipe-categories">
                      {recipe.categories?.slice(0, 3).map((cat) => (
                        <span key={cat.id} className="category-tag">
                          {cat.iconName} {cat.name}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </>
          ) : (
            <div className="no-recipes">
              <p>No recipes found matching your filters.</p>
              <button className="btn btn-primary" onClick={clearFilters}>
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
