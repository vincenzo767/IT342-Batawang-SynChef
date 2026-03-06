import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  FaBookmark,
  FaCheckCircle,
  FaClock,
  FaGlobe
} from 'react-icons/fa';
import { RootState } from '../store';
import './DashboardPage.css';

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);

  const firstName = user?.fullName?.split(' ')[0] || 'Chef';

  const stats = [
    {
      label: 'Saved Recipes',
      value: '24',
      tone: 'purple',
      icon: <FaBookmark />
    },
    {
      label: 'Countries Explored',
      value: '12',
      tone: 'indigo',
      icon: <FaGlobe />
    },
    {
      label: 'Recipes Tried',
      value: '38',
      tone: 'green',
      icon: <FaCheckCircle />
    },
    {
      label: 'Cooking Time',
      value: '42h',
      tone: 'orange',
      icon: <FaClock />
    }
  ];

  const discoveredRecipes = [
    {
      title: 'Pad Thai',
      subtitle: 'Thailand • Asian Cuisine',
      time: '30 min',
      image: 'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=1200'
    },
    {
      title: 'Paella Valenciana',
      subtitle: 'Spain • European Cuisine',
      time: '45 min',
      image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=1200'
    },
    {
      title: 'Butter Chicken',
      subtitle: 'India • Asian Cuisine',
      time: '50 min',
      image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=1200'
    }
  ];

  const flavorRegions = [
    { emoji: '🌏', name: 'Asia', count: '2,847 recipes', tone: 'blue' },
    { emoji: '🌍', name: 'Africa', count: '1,234 recipes', tone: 'yellow' },
    { emoji: '🌎', name: 'North America', count: '3,156 recipes', tone: 'green' },
    { emoji: '🌎', name: 'South America', count: '1,892 recipes', tone: 'orange' },
    { emoji: '🌍', name: 'Europe', count: '4,521 recipes', tone: 'purple' },
    { emoji: '🌏', name: 'Oceania', count: '789 recipes', tone: 'teal' }
  ];

  return (
    <div className="dashboard-page">
      <div className="dashboard-shell container">
        <section className="dashboard-card welcome-card">
          <h2>
            Welcome back, <span>{firstName}</span>!
          </h2>
          <p>Discover new recipes and explore culinary traditions from around the world</p>
        </section>

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

        <section className="dashboard-card discovered-card">
          <h3>Recently Discovered</h3>
          <div className="discovered-grid">
            {discoveredRecipes.map((recipe) => (
              <article key={recipe.title} className="discover-item">
                <img src={recipe.image} alt={recipe.title} loading="lazy" />
                <div className="discover-body">
                  <h4>{recipe.title}</h4>
                  <p>{recipe.subtitle}</p>
                  <div>
                    <span>⏱️ {recipe.time}</span>
                    <button type="button" onClick={() => navigate('/')}>View Recipe →</button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="dashboard-card flavor-card">
          <h3>Global Flavor Map</h3>
          <p>Explore recipes by continent - Click on a region to discover more</p>
          <div className="flavor-grid">
            {flavorRegions.map((region) => (
              <button
                key={region.name}
                type="button"
                className={`flavor-tile tone-bg-${region.tone}`}
                onClick={() => navigate('/flavor-map')}
              >
                <div className="emoji">{region.emoji}</div>
                <h4>{region.name}</h4>
                <span>{region.count}</span>
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default DashboardPage;
