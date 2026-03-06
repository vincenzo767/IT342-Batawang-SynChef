import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FaCalendarAlt, FaMapMarkerAlt } from 'react-icons/fa';
import { RootState } from '../store';
import './ProfilePage.css';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);

  const countryCode = localStorage.getItem('userCountry') || 'us';
  const countryNameMap: Record<string, string> = {
    us: 'United States',
    uk: 'United Kingdom',
    ca: 'Canada',
    au: 'Australia',
    de: 'Germany',
    fr: 'France',
    it: 'Italy',
    es: 'Spain',
    jp: 'Japan',
    cn: 'China',
    in: 'India',
    br: 'Brazil',
    mx: 'Mexico',
    other: 'Other'
  };

  const fullName = user?.fullName || 'John Doe';
  const email = user?.email || 'john.doe@example.com';
  const countryName = countryNameMap[countryCode] || 'Unknown';

  const initials = useMemo(
    () =>
      fullName
        .split(' ')
        .filter(Boolean)
        .map((token) => token[0])
        .join('')
        .slice(0, 2)
        .toUpperCase(),
    [fullName]
  );

  const savedRecipes = [
    {
      title: 'Pad Thai',
      subtitle: 'Thailand • 30 min',
      image: 'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=1200'
    },
    {
      title: 'Paella Valenciana',
      subtitle: 'Spain • 45 min',
      image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=1200'
    }
  ];

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
              <h3>24</h3>
              <p>Saved Recipes</p>
            </article>
            <article>
              <h3 className="tone-indigo">12</h3>
              <p>Countries Explored</p>
            </article>
            <article>
              <h3 className="tone-green">38</h3>
              <p>Recipes Tried</p>
            </article>
          </div>
        </section>

        <div className="profile-grid">
          <aside className="profile-left-col">
            <section className="profile-panel">
              <h3>About</h3>
              <div className="about-list">
                <div className="about-row">
                  <FaMapMarkerAlt />
                  <span>{countryName}</span>
                </div>
                <div className="about-row">
                  <FaCalendarAlt />
                  <span>Joined March 2026</span>
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
                <button type="button" onClick={() => navigate('/flavor-map')}>
                  <div className="cuisine-emoji">🍕</div>
                  <strong>Italian</strong>
                  <span>12 recipes</span>
                </button>
                <button type="button" onClick={() => navigate('/flavor-map')}>
                  <div className="cuisine-emoji">🍜</div>
                  <strong>Asian</strong>
                  <span>18 recipes</span>
                </button>
                <button type="button" onClick={() => navigate('/flavor-map')}>
                  <div className="cuisine-emoji">🌮</div>
                  <strong>Mexican</strong>
                  <span>8 recipes</span>
                </button>
                <button type="button" onClick={() => navigate('/flavor-map')}>
                  <div className="cuisine-emoji">🍛</div>
                  <strong>Indian</strong>
                  <span>14 recipes</span>
                </button>
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
                {savedRecipes.map((recipe) => (
                  <button
                    key={recipe.title}
                    type="button"
                    className="saved-recipe-card"
                    onClick={() => navigate('/')}
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
