/* eslint-disable react/no-unknown-property */
import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { countryApi, recipeApi } from '../api';
import { Country, Recipe } from '../types';
import './FlavorMapPage.css';

// Continent colors used by globe hotspots and selected map panel.
const continentColors: Record<string, string> = {
  'Asia': '#ec4899',
  'Europe': '#f59e0b',
  'Africa': '#06b6d4',
  'North America': '#14b8a6',
  'South America': '#8b5cf6',
  'Oceania': '#22c55e',
};

const continentOrder = ['Asia', 'Europe', 'Africa', 'North America', 'South America', 'Oceania'];
const defaultContinent = continentOrder[0];

const continentHotspots: Record<string, { latitude: number; longitude: number; markerRadius: number; hitRadius: number }> = {
  'Asia': { latitude: 33, longitude: 95, markerRadius: 0.03, hitRadius: 0.09 },
  'Europe': { latitude: 51, longitude: 15, markerRadius: 0.028, hitRadius: 0.085 },
  'Africa': { latitude: 6, longitude: 20, markerRadius: 0.03, hitRadius: 0.09 },
  'North America': { latitude: 46, longitude: -102, markerRadius: 0.03, hitRadius: 0.09 },
  'South America': { latitude: -18, longitude: -60, markerRadius: 0.029, hitRadius: 0.088 },
  'Oceania': { latitude: -23, longitude: 134, markerRadius: 0.028, hitRadius: 0.085 },
};

const continentShapes: Record<string, string> = {
  'Asia': 'M18,70 L36,42 L70,35 L112,18 L148,26 L178,46 L188,64 L170,88 L136,98 L92,94 L56,102 L24,90 Z',
  'Europe': 'M24,70 L46,44 L82,36 L118,40 L148,56 L136,80 L106,88 L74,84 L52,94 L30,86 Z',
  'Africa': 'M78,16 L112,26 L136,54 L132,88 L104,112 L72,96 L60,66 L68,36 Z',
  'North America': 'M16,72 L42,38 L86,20 L130,26 L160,46 L148,72 L124,88 L96,82 L76,94 L42,96 Z',
  'South America': 'M98,14 L126,30 L138,58 L126,86 L108,114 L88,104 L76,74 L80,42 Z',
  'Oceania': 'M26,70 L52,56 L86,60 L114,76 L98,94 L64,96 L42,88 Z',
};

const normalizeContinentName = (name: string) => name.replace(/_/g, ' ');

const getContinentColor = (name: string) => {
  const normalizedName = normalizeContinentName(name);
  return continentColors[normalizedName] || '#667eea';
};

const toSpherePosition = (latitude: number, longitude: number, radius: number) => {
  // Convert lat/long to Three.js coordinates on a sphere surface.
  const phi = (90 - latitude) * (Math.PI / 180);
  const theta = (longitude + 180) * (Math.PI / 180);
  const x = -radius * Math.sin(phi) * Math.cos(theta);
  const y = radius * Math.cos(phi);
  const z = radius * Math.sin(phi) * Math.sin(theta);
  return new THREE.Vector3(x, y, z);
};

type ContinentHotspotProps = {
  continent: string;
  selectedContinent: string | null;
  onSelect: (continent: string) => void;
};

const ContinentHotspot = ({ continent, selectedContinent, onSelect }: ContinentHotspotProps) => {
  const normalizedName = normalizeContinentName(continent);
  const hotspot = continentHotspots[normalizedName];
  const color = getContinentColor(continent);
  const meshRef = useRef<THREE.Mesh>(null);
  const pulseRef = useRef<THREE.Mesh>(null);
  const isSelected = selectedContinent === continent;

  const surfacePosition = useMemo(
    () => toSpherePosition(hotspot.latitude, hotspot.longitude, 1.012),
    [hotspot.latitude, hotspot.longitude],
  );
  const normal = useMemo(() => surfacePosition.clone().normalize(), [surfacePosition]);
  const orientation = useMemo(
    () => new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal),
    [normal],
  );

  useFrame(({ clock }) => {
    const pulseWave = (Math.sin(clock.elapsedTime * 4.2) + 1) / 2;
    const pulseScale = 1 + pulseWave * 0.18;
    if (pulseRef.current) {
      pulseRef.current.scale.setScalar(isSelected ? 1.45 + pulseWave * 0.2 : pulseScale);
    }
    if (meshRef.current) {
      const selectedScale = 1.18 + pulseWave * 0.1;
      meshRef.current.scale.setScalar(isSelected ? selectedScale : 1);
    }
  });

  return (
    <group>
      <mesh ref={pulseRef} position={surfacePosition} quaternion={orientation}>
        <ringGeometry args={[hotspot.markerRadius * 1.35, hotspot.markerRadius * 1.9, 40]} />
        <meshBasicMaterial color={color} transparent opacity={isSelected ? 1 : 0.42} side={THREE.DoubleSide} />
      </mesh>

      <mesh
        ref={meshRef}
        position={surfacePosition}
        quaternion={orientation}
        onClick={(event) => {
          event.stopPropagation();
          onSelect(continent);
        }}
      >
        <circleGeometry args={[hotspot.markerRadius, 36]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={isSelected ? 1.05 : 0.22} transparent opacity={0.98} side={THREE.DoubleSide} />
      </mesh>

      <mesh
        position={surfacePosition}
        quaternion={orientation}
        onClick={(event) => {
          event.stopPropagation();
          onSelect(continent);
        }}
      >
        <circleGeometry args={[hotspot.hitRadius, 28]} />
        <meshBasicMaterial transparent opacity={0} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
};

type GlobeSceneProps = {
  continents: string[];
  selectedContinent: string | null;
  onSelect: (continent: string) => void;
};

const GlobeScene = ({ continents, selectedContinent, onSelect }: GlobeSceneProps) => {
  const globeRef = useRef<THREE.Group>(null);
  const cloudRef = useRef<THREE.Mesh>(null);
  const [earthMap, earthNormalMap, earthSpecularMap, cloudMap] = useTexture([
    'https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg',
    'https://threejs.org/examples/textures/planets/earth_normal_2048.jpg',
    'https://threejs.org/examples/textures/planets/earth_specular_2048.jpg',
    'https://threejs.org/examples/textures/planets/earth_clouds_1024.png',
  ]);

  earthMap.colorSpace = THREE.SRGBColorSpace;
  earthSpecularMap.colorSpace = THREE.SRGBColorSpace;
  cloudMap.colorSpace = THREE.SRGBColorSpace;

  useFrame((_, delta) => {
    if (globeRef.current) {
      // Rotate Earth and continent markers together so markers stay locked to continents.
      globeRef.current.rotation.y += delta / 16;
    }
    if (cloudRef.current) {
      // Slightly faster cloud movement relative to Earth spin.
      cloudRef.current.rotation.y += delta / 10;
    }
  });

  return (
    <>
      <color attach="background" args={['#04142e']} />
      <ambientLight intensity={0.92} />
      <hemisphereLight args={['#e2f3ff', '#1e3a8a', 0.56]} />
      <directionalLight position={[3.6, 2.4, 3.2]} intensity={1.38} color="#ffffff" />
      <pointLight position={[-2.6, -1.1, -3.4]} intensity={0.28} color="#38bdf8" />

      <Stars radius={80} depth={35} count={2500} factor={3} saturation={0} fade speed={0.3} />

      <group ref={globeRef}>
        <mesh>
          <sphereGeometry args={[1, 64, 64]} />
          <meshPhongMaterial
            map={earthMap}
            normalMap={earthNormalMap}
            specularMap={earthSpecularMap}
            specular="#dbeafe"
            shininess={22}
            emissive="#102743"
            emissiveIntensity={0.15}
          />
        </mesh>

        <mesh ref={cloudRef}>
          <sphereGeometry args={[1.018, 64, 64]} />
          <meshPhongMaterial map={cloudMap} transparent opacity={0.25} depthWrite={false} side={THREE.DoubleSide} />
        </mesh>

        {continents.map((continent) => {
          const normalizedName = normalizeContinentName(continent);
          if (!continentHotspots[normalizedName]) {
            return null;
          }

          return (
            <ContinentHotspot
              key={continent}
              continent={continent}
              selectedContinent={selectedContinent}
              onSelect={onSelect}
            />
          );
        })}
      </group>

      <OrbitControls
        enablePan={false}
        minDistance={2}
        maxDistance={3.6}
        autoRotate={false}
      />
    </>
  );
};

const ContinentShape = ({ selectedContinent }: { selectedContinent: string }) => {
  const normalizedName = normalizeContinentName(selectedContinent);
  const color = getContinentColor(selectedContinent);
  const shapePath = continentShapes[normalizedName] || continentShapes['Europe'];

  return (
    <div className="continent-shape-card">
      <svg viewBox="0 0 220 130" className="continent-shape-svg" aria-label={`${normalizedName} map`}>
        <title>{`${normalizedName} map`}</title>
        <defs>
          <linearGradient id="continentGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.9" />
            <stop offset="100%" stopColor="#0f172a" stopOpacity="0.85" />
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="220" height="130" rx="14" fill="#020617" />
        <path d={shapePath} fill="url(#continentGradient)" stroke={color} strokeWidth="2" />
      </svg>
      <p className="continent-shape-caption">{normalizedName}</p>
    </div>
  );
};

const mergeCountries = (primary: Country[], fallback: Country[]) => {
  const deduped = new Map<string, Country>();

  [...fallback, ...primary].forEach((country) => {
    deduped.set(country.code, country);
  });

  return Array.from(deduped.values());
};

const buildContinentsData = (fetchedData: Record<string, Country[]>) => {
  const baseData: Record<string, Country[]> = {};

  continentOrder.forEach((continent) => {
    baseData[continent] = [...(mockContinents[continent] || [])];
  });

  Object.entries(fetchedData).forEach(([continentKey, fetchedCountries]) => {
    const normalizedContinent = normalizeContinentName(continentKey);
    const fallbackCountries = baseData[normalizedContinent] || [];
    baseData[normalizedContinent] = mergeCountries(fetchedCountries || [], fallbackCountries);
  });

  return baseData;
};

// Mock data for when backend is not available
const mockContinents: Record<string, Country[]> = {
  'Asia': [
    { id: 1, name: 'Japan', code: 'JP', continent: 'Asia', flagEmoji: '🇯🇵', latitude: 36.2048, longitude: 138.2529, description: 'Island nation with unique cuisine' },
    { id: 2, name: 'Thailand', code: 'TH', continent: 'Asia', flagEmoji: '🇹🇭', latitude: 15.8700, longitude: 100.9925, description: 'Southeast Asian spice hub' },
    { id: 3, name: 'India', code: 'IN', continent: 'Asia', flagEmoji: '🇮🇳', latitude: 20.5937, longitude: 78.9629, description: 'Land of diverse spices' },
    { id: 4, name: 'South Korea', code: 'KR', continent: 'Asia', flagEmoji: '🇰🇷', latitude: 35.9078, longitude: 127.7669, description: 'Vibrant modern cuisine' },
    { id: 5, name: 'Vietnam', code: 'VN', continent: 'Asia', flagEmoji: '🇻🇳', latitude: 14.0583, longitude: 108.2772, description: 'Fresh and balanced flavors' },
  ],
  'Europe': [
    { id: 6, name: 'France', code: 'FR', continent: 'Europe', flagEmoji: '🇫🇷', latitude: 46.2276, longitude: 2.2137, description: 'Culinary capital of the world' },
    { id: 7, name: 'Italy', code: 'IT', continent: 'Europe', flagEmoji: '🇮🇹', latitude: 41.8719, longitude: 12.5674, description: 'Pasta and pizza paradise' },
    { id: 8, name: 'Spain', code: 'ES', continent: 'Europe', flagEmoji: '🇪🇸', latitude: 40.4637, longitude: -3.7492, description: 'Mediterranean flavors' },
    { id: 9, name: 'Greece', code: 'GR', continent: 'Europe', flagEmoji: '🇬🇷', latitude: 39.0742, longitude: 21.8243, description: 'Ancient Mediterranean tradition' },
    { id: 10, name: 'Germany', code: 'DE', continent: 'Europe', flagEmoji: '🇩🇪', latitude: 51.1657, longitude: 10.4515, description: 'Hearty and rich flavors' },
  ],
  'Africa': [
    { id: 11, name: 'Egypt', code: 'EG', continent: 'Africa', flagEmoji: '🇪🇬', latitude: 26.8206, longitude: 30.8025, description: 'Ancient culinary traditions' },
    { id: 12, name: 'Morocco', code: 'MA', continent: 'Africa', flagEmoji: '🇲🇦', latitude: 31.7917, longitude: -7.0926, description: 'Spiced tagines and couscous' },
    { id: 13, name: 'South Africa', code: 'ZA', continent: 'Africa', flagEmoji: '🇿🇦', latitude: -30.5595, longitude: 22.9375, description: 'Fusion of cultures' },
    { id: 14, name: 'Ethiopia', code: 'ET', continent: 'Africa', flagEmoji: '🇪🇹', latitude: 9.1450, longitude: 40.4897, description: 'Unique spice blends' },
  ],
  'North America': [
    { id: 15, name: 'Mexico', code: 'MX', continent: 'North America', flagEmoji: '🇲🇽', latitude: 23.6345, longitude: -102.5528, description: 'Vibrant and complex flavors' },
    { id: 16, name: 'United States', code: 'US', continent: 'North America', flagEmoji: '🇺🇸', latitude: 37.0902, longitude: -95.7129, description: 'Diverse regional cuisines' },
    { id: 17, name: 'Canada', code: 'CA', continent: 'North America', flagEmoji: '🇨🇦', latitude: 56.1304, longitude: -106.3468, description: 'Fresh and local ingredients' },
  ],
  'South America': [
    { id: 18, name: 'Peru', code: 'PE', continent: 'South America', flagEmoji: '🇵🇪', latitude: -9.1900, longitude: -75.0152, description: 'Ancient Andean cuisine' },
    { id: 19, name: 'Brazil', code: 'BR', continent: 'South America', flagEmoji: '🇧🇷', latitude: -14.2350, longitude: -51.9253, description: 'Tropical and bold flavors' },
    { id: 20, name: 'Argentina', code: 'AR', continent: 'South America', flagEmoji: '🇦🇷', latitude: -38.4161, longitude: -63.6167, description: 'Grilled meats and wine culture' },
    { id: 21, name: 'Colombia', code: 'CO', continent: 'South America', flagEmoji: '🇨🇴', latitude: 4.5709, longitude: -74.2973, description: 'Rich coffee and tropical fruits' },
  ],
  'Oceania': [
    { id: 22, name: 'Australia', code: 'AU', continent: 'Oceania', flagEmoji: '🇦🇺', latitude: -25.2744, longitude: 133.7751, description: 'Modern and indigenous fusion' },
    { id: 23, name: 'New Zealand', code: 'NZ', continent: 'Oceania', flagEmoji: '🇳🇿', latitude: -40.9006, longitude: 174.8860, description: 'Pacific seafood and meats' },
  ],
};

const FlavorMapPage = () => {
  const [countries, setCountries] = useState<Country[]>([]);
  const [continents, setContinents] = useState<Record<string, Country[]>>({});
  const [selectedContinent, setSelectedContinent] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadCountries();
  }, []);

  const loadCountries = async () => {
    try {
      const response = await countryApi.getGroupedByContinent();
      const mergedContinents = buildContinentsData(response.data || {});
      setContinents(mergedContinents);
      const allCountries = Object.values(mergedContinents).flat();
      setCountries(allCountries);
      setSelectedContinent((current) => current || defaultContinent);
    } catch (error) {
      console.error('Failed to load countries, using mock data:', error);
      // Use mock data when backend is not available
      const fallbackContinents = buildContinentsData({});
      setContinents(fallbackContinents);
      const allCountries = Object.values(fallbackContinents).flat();
      setCountries(allCountries);
      setSelectedContinent((current) => current || defaultContinent);
    } finally {
      setLoading(false);
    }
  };

  const handleContinentClick = (continent: string) => {
    setSelectedContinent(continent);
    setSelectedCountry(null);
    setRecipes([]);
  };

  const handleCountryClick = async (country: Country) => {
    setSelectedCountry(country);
    setLoading(true);
    try {
      const response = await recipeApi.getByCountryCode(country.code);
      setRecipes(response.data);
    } catch (error) {
      console.error('Failed to load recipes, using mock data:', error);
      // Use mock recipes for demo
      const mockRecipes: Recipe[] = [
        {
          id: 1,
          name: `${country.name} Classic Dish`,
          description: `Traditional recipe from ${country.name}`,
          country: country,
          categories: [],
          prepTimeMinutes: 15,
          cookTimeMinutes: 30,
          totalTimeMinutes: 45,
          defaultServings: 4,
          difficultyLevel: 'Medium',
          culturalContext: `A beloved dish from ${country.name}`,
          ingredients: [],
          steps: [],
        },
        {
          id: 2,
          name: `Modern ${country.name} Fusion`,
          description: `Contemporary take on ${country.name} flavors`,
          country: country,
          categories: [],
          prepTimeMinutes: 20,
          cookTimeMinutes: 40,
          totalTimeMinutes: 60,
          defaultServings: 4,
          difficultyLevel: 'Hard',
          culturalContext: `A modern interpretation of ${country.name} cuisine`,
          ingredients: [],
          steps: [],
        },
      ];
      setRecipes(mockRecipes);
    } finally {
      setLoading(false);
    }
  };

  const handleRecipeClick = (recipeId: number) => {
    navigate(`/recipe/${recipeId}`);
  };

  const availableContinents = continentOrder.filter((continent) => continents[continent]);
  const displayedCountries = selectedContinent
    ? continents[selectedContinent] || []
    : countries;

  return (
    <div className="flavor-map-page page">
      <div className="container">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="page-title"
        >
          🌍 Global Flavor Map
        </motion.h1>

        <div className="flavor-map-layout">
          {/* 3D Globe Section */}
          <div className="globe-section">
            <div className="globe-card">
              <div className="map-header">
                <h2>3D Flavor Globe</h2>
                <p>Rotate and click a continent hotspot to explore countries and cuisines</p>
              </div>

              <div className="globe-canvas-wrapper">
                <Canvas camera={{ position: [0, 0.2, 2.65], fov: 45 }}>
                  <GlobeScene
                    continents={availableContinents}
                    selectedContinent={selectedContinent}
                    onSelect={handleContinentClick}
                  />
                </Canvas>
              </div>

              <div className="continent-picker" aria-label="Choose continent">
                {availableContinents.map((continent) => {
                  const isSelected = selectedContinent === continent;
                  const countryCount = (continents[continent] || []).length;

                  return (
                    <button
                      key={continent}
                      className={`continent-picker-btn ${isSelected ? 'active' : ''}`}
                      style={{ borderColor: getContinentColor(continent) }}
                      onClick={() => handleContinentClick(continent)}
                    >
                      <span
                        className="continent-picker-dot"
                        style={{ backgroundColor: getContinentColor(continent) }}
                      />
                      <span className="continent-picker-name">{continent}</span>
                      <span className="continent-picker-count">{countryCount}</span>
                    </button>
                  );
                })}
              </div>

              <div className="map-footer">
                <p>📍 Total Countries: {countries.length}</p>
                <p>🍽️ Click any continent label around the globe to start exploring</p>
              </div>
            </div>

            <div className="continent-selected-panel">
              <h3>Continent Selected</h3>
              {selectedContinent ? (
                <>
                  <ContinentShape selectedContinent={selectedContinent} />
                  <div className="continent-meta">
                    <span
                      className="continent-chip"
                      style={{ backgroundColor: getContinentColor(selectedContinent) }}
                    >
                      {normalizeContinentName(selectedContinent)}
                    </span>
                    <span className="continent-country-count">
                      {(continents[selectedContinent] || []).length} countries available
                    </span>
                  </div>
                </>
              ) : (
                <p className="continent-empty">Select a continent on the globe to preview it here.</p>
              )}
            </div>
          </div>

          {/* Selection & Recipes Section */}
          <div className="selection-section">
            <div className="section-intro">
              <p>Explore the world's most delicious cuisines</p>
            </div>

            {displayedCountries.length > 0 && (
              <div className="countries-section">
                <h3>
                  {selectedContinent ? `Countries in ${normalizeContinentName(selectedContinent)}` : 'All Countries'}
                  <span className="count-badge">{displayedCountries.length}</span>
                </h3>
                <div className="countries-grid">
                  {displayedCountries.map((country) => (
                    <motion.div
                      key={country.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`country-card ${selectedCountry?.id === country.id ? 'selected' : ''}`}
                      onClick={() => handleCountryClick(country)}
                    >
                      <span className="country-flag-large">{country.flagEmoji}</span>
                      <h4>{country.name}</h4>
                      {country.description && <p className="country-desc">{country.description}</p>}
                      <span className="click-hint">Click to view recipes →</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {selectedCountry && (
              <div className="recipes-section">
                <h3>🍳 Recipes from {selectedCountry.name} {selectedCountry.flagEmoji}</h3>
                {loading ? (
                  <div className="loading">
                    <div className="spinner" />
                    <p>Loading recipes...</p>
                  </div>
                ) : recipes.length > 0 ? (
                  <div className="recipes-grid">
                    {recipes.map((recipe) => (
                      <motion.div
                        key={recipe.id}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="recipe-card-mini card"
                        onClick={() => handleRecipeClick(recipe.id)}
                      >
                        <h4>{recipe.name}</h4>
                        <p>{recipe.description}</p>
                        <div className="recipe-quick-info">
                          <span>⏱️ {recipe.totalTimeMinutes} min</span>
                          <span className={`badge badge-${recipe.difficultyLevel.toLowerCase()}`}>
                            {recipe.difficultyLevel}
                          </span>
                        </div>
                        <span className="click-hint">Click to view full recipe →</span>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="no-recipes">
                    <p>No recipes available yet for {selectedCountry.name}</p>
                    <p className="no-recipes-hint">Try selecting a different country!</p>
                  </div>
                )}
              </div>
            )}

            {!selectedCountry && displayedCountries.length > 0 && (
              <div className="recipes-section empty-state">
                <p>👈 Select a country to view its delicious recipes!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlavorMapPage;
