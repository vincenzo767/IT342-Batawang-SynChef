import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars, useTexture } from "@react-three/drei";
import * as THREE from "three";
import ReactCountryFlag from "react-country-flag";
import { FaChevronLeft, FaChevronRight, FaSearch, FaTimes, FaClock, FaFire } from "react-icons/fa";
import { countryApi, recipeApi } from "../api";
import { ALL_RECIPES } from "../data/recipes";
import "./FlavorMapPage.css";

const continentColors = {
  "Asia": "#ec4899",
  "Europe": "#f59e0b",
  "Africa": "#06b6d4",
  "North America": "#14b8a6",
  "South America": "#8b5cf6",
  "Oceania": "#22c55e"
};
const continentOrder = ["Asia", "Europe", "Africa", "North America", "South America", "Oceania"];
const defaultContinent = continentOrder[0];
const countriesPageSize = 12;
const restCountriesApiUrl =
  "https://restcountries.com/v3.1/all?fields=cca2,name,region,subregion,capital,latlng,flag,independent,unMember";

const continentHotspots = {
  "Asia": { latitude: 33, longitude: 95, markerRadius: 0.03, hitRadius: 0.09 },
  "Europe": { latitude: 51, longitude: 15, markerRadius: 0.028, hitRadius: 0.085 },
  "Africa": { latitude: 6, longitude: 20, markerRadius: 0.03, hitRadius: 0.09 },
  "North America": { latitude: 46, longitude: -102, markerRadius: 0.03, hitRadius: 0.09 },
  "South America": { latitude: -18, longitude: -60, markerRadius: 0.029, hitRadius: 0.088 },
  "Oceania": { latitude: -23, longitude: 134, markerRadius: 0.028, hitRadius: 0.085 }
};

const continentShapes = {
  "Asia": "M18,70 L36,42 L70,35 L112,18 L148,26 L178,46 L188,64 L170,88 L136,98 L92,94 L56,102 L24,90 Z",
  "Europe": "M24,70 L46,44 L82,36 L118,40 L148,56 L136,80 L106,88 L74,84 L52,94 L30,86 Z",
  "Africa": "M78,16 L112,26 L136,54 L132,88 L104,112 L72,96 L60,66 L68,36 Z",
  "North America": "M16,72 L42,38 L86,20 L130,26 L160,46 L148,72 L124,88 L96,82 L76,94 L42,96 Z",
  "South America": "M98,14 L126,30 L138,58 L126,86 L108,114 L88,104 L76,74 L80,42 Z",
  "Oceania": "M26,70 L52,56 L86,60 L114,76 L98,94 L64,96 L42,88 Z"
};

const normalizeContinentName = (name) => name.replace(/_/g, " ");
const getContinentColor = (name) => continentColors[normalizeContinentName(name)] || "#667eea";

const toSpherePosition = (latitude, longitude, radius) => {
  const phi = (90 - latitude) * (Math.PI / 180);
  const theta = (longitude + 180) * (Math.PI / 180);
  const x = -radius * Math.sin(phi) * Math.cos(theta);
  const y = radius * Math.cos(phi);
  const z = radius * Math.sin(phi) * Math.sin(theta);
  return new THREE.Vector3(x, y, z);
};

// Normalize a local (ALL_RECIPES) recipe to the FlavorMap display format
const toFlavorMapRecipe = (r) => ({
  id: r.id,
  name: r.title,
  description: r.description,
  totalTimeMinutes: r.totalMinutes,
  difficultyLevel: r.difficulty,
  image: r.image,
  culturalContext: r.culturalContext || null,
  _raw: r
});

const ContinentHotspot = ({ continent, selectedContinent, onSelect }) => {
  const normalizedName = normalizeContinentName(continent);
  const hotspot = continentHotspots[normalizedName];
  const color = getContinentColor(continent);
  const meshRef = useRef(null);
  const pulseRef = useRef(null);
  const isSelected = selectedContinent === continent;

  const surfacePosition = useMemo(
    () => toSpherePosition(hotspot.latitude, hotspot.longitude, 1.012),
    [hotspot.latitude, hotspot.longitude]
  );
  const normal = useMemo(() => surfacePosition.clone().normalize(), [surfacePosition]);
  const orientation = useMemo(
    () => new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal),
    [normal]
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
        onClick={(e) => { e.stopPropagation(); onSelect(continent); }}
      >
        <circleGeometry args={[hotspot.markerRadius, 36]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={isSelected ? 1.05 : 0.22} transparent opacity={0.98} side={THREE.DoubleSide} />
      </mesh>
      <mesh
        position={surfacePosition}
        quaternion={orientation}
        onClick={(e) => { e.stopPropagation(); onSelect(continent); }}
      >
        <circleGeometry args={[hotspot.hitRadius, 28]} />
        <meshBasicMaterial transparent opacity={0} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
};

const GlobeScene = ({ continents, selectedContinent, onSelect }) => {
  const globeRef = useRef(null);
  const cloudRef = useRef(null);
  const [earthMap, earthNormalMap, earthSpecularMap, cloudMap] = useTexture([
    "https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg",
    "https://threejs.org/examples/textures/planets/earth_normal_2048.jpg",
    "https://threejs.org/examples/textures/planets/earth_specular_2048.jpg",
    "https://threejs.org/examples/textures/planets/earth_clouds_1024.png"
  ]);
  earthMap.colorSpace = THREE.SRGBColorSpace;
  earthSpecularMap.colorSpace = THREE.SRGBColorSpace;
  cloudMap.colorSpace = THREE.SRGBColorSpace;

  useFrame((_, delta) => {
    if (globeRef.current) globeRef.current.rotation.y += delta / 16;
    if (cloudRef.current) cloudRef.current.rotation.y += delta / 10;
  });

  return (
    <Fragment>
      <color attach="background" args={["#04142e"]} />
      <ambientLight intensity={0.92} />
      <hemisphereLight args={["#e2f3ff", "#1e3a8a", 0.56]} />
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
          if (!continentHotspots[normalizedName]) return null;
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
      <OrbitControls enablePan={false} minDistance={2} maxDistance={3.6} autoRotate={false} />
    </Fragment>
  );
};

const ContinentShape = ({ selectedContinent }) => {
  const normalizedName = normalizeContinentName(selectedContinent);
  const color = getContinentColor(selectedContinent);
  const shapePath = continentShapes[normalizedName] || continentShapes["Europe"];
  return (
    <div className="continent-shape-card">
      <svg viewBox="0 0 220 130" className="continent-shape-svg" aria-label={`${normalizedName} map`}>
        <title>{normalizedName} map</title>
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

const mergeCountries = (primary, fallback) => {
  const deduped = new Map();
  [...fallback, ...primary].forEach((c) => deduped.set(c.code, c));
  return Array.from(deduped.values());
};
const sortCountriesByName = (arr) => [...arr].sort((a, b) => a.name.localeCompare(b.name));
const getFallbackIdFromCode = (code) =>
  code.toUpperCase().split("").reduce((sum, l) => sum + l.charCodeAt(0), 1000);

const mapRegionToContinent = (region, subregion) => {
  const r = (region || "").trim();
  const s = (subregion || "").trim();
  if (["Asia", "Europe", "Africa", "Oceania"].includes(r)) return r;
  if (r === "Americas") return s.toLowerCase().includes("south") ? "South America" : "North America";
  return null;
};

const mapRestCountryToCountry = (entry) => {
  const code = (entry.cca2 || "").trim().toUpperCase();
  if (code.length !== 2) return null;
  const continent = mapRegionToContinent(entry.region, entry.subregion);
  if (!continent) return null;
  if (!(entry.independent === true || entry.unMember === true)) return null;
  const name = (entry.name?.common || "").trim();
  if (!name) return null;
  const capital = entry.capital?.[0] || "";
  return {
    id: getFallbackIdFromCode(code),
    name,
    code,
    continent,
    flagEmoji: entry.flag || "🏳️",
    latitude: Array.isArray(entry.latlng) ? Number(entry.latlng[0]) : 0,
    longitude: Array.isArray(entry.latlng) ? Number(entry.latlng[1]) : 0,
    description: capital ? `Signature flavors from ${name} (${capital})` : `Distinct culinary traditions from ${name}`
  };
};

const buildRestCountriesByContinent = (restCountries) => {
  const grouped = {};
  continentOrder.forEach((c) => { grouped[c] = []; });
  restCountries.forEach((entry) => {
    const mapped = mapRestCountryToCountry(entry);
    if (!mapped) return;
    grouped[mapped.continent] = grouped[mapped.continent] || [];
    grouped[mapped.continent].push(mapped);
  });
  continentOrder.forEach((c) => { grouped[c] = sortCountriesByName(mergeCountries(grouped[c] || [], [])); });
  return grouped;
};

const fetchRestCountries = async () => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch(restCountriesApiUrl, { signal: controller.signal });
    if (!response.ok) throw new Error(`REST Countries failed: ${response.status}`);
    const payload = await response.json();
    return buildRestCountriesByContinent(payload || []);
  } finally {
    clearTimeout(timeout);
  }
};

const mockContinents = {
  "Asia": [
    { id: 1, name: "Japan", code: "JP", continent: "Asia", flagEmoji: "🇯🇵", latitude: 36.2048, longitude: 138.2529, description: "Island nation with unique cuisine" },
    { id: 2, name: "Thailand", code: "TH", continent: "Asia", flagEmoji: "🇹🇭", latitude: 15.87, longitude: 100.9925, description: "Southeast Asian spice hub" },
    { id: 3, name: "India", code: "IN", continent: "Asia", flagEmoji: "🇮🇳", latitude: 20.5937, longitude: 78.9629, description: "Land of diverse spices" },
    { id: 4, name: "South Korea", code: "KR", continent: "Asia", flagEmoji: "🇰🇷", latitude: 35.9078, longitude: 127.7669, description: "Vibrant modern cuisine" },
    { id: 5, name: "Vietnam", code: "VN", continent: "Asia", flagEmoji: "🇻🇳", latitude: 14.0583, longitude: 108.2772, description: "Fresh and balanced flavors" },
    { id: 30, name: "Turkey", code: "TR", continent: "Asia", flagEmoji: "🇹🇷", latitude: 38.9637, longitude: 35.2433, description: "Bridge between East and West" },
    { id: 31, name: "Indonesia", code: "ID", continent: "Asia", flagEmoji: "🇮🇩", latitude: -0.7893, longitude: 113.9213, description: "Archipelago of bold flavors" },
    { id: 32, name: "Philippines", code: "PH", continent: "Asia", flagEmoji: "🇵🇭", latitude: 12.8797, longitude: 121.774, description: "Tropical Southeast Asian cuisine" },
    { id: 33, name: "Lebanon", code: "LB", continent: "Asia", flagEmoji: "🇱🇧", latitude: 33.8547, longitude: 35.8623, description: "Heart of Middle Eastern cooking" },
    { id: 34, name: "China", code: "CN", continent: "Asia", flagEmoji: "🇨🇳", latitude: 35.8617, longitude: 104.1954, description: "Ancient and diverse culinary traditions" }
  ],
  "Europe": [
    { id: 6, name: "France", code: "FR", continent: "Europe", flagEmoji: "🇫🇷", latitude: 46.2276, longitude: 2.2137, description: "Culinary capital of the world" },
    { id: 7, name: "Italy", code: "IT", continent: "Europe", flagEmoji: "🇮🇹", latitude: 41.8719, longitude: 12.5674, description: "Pasta and pizza paradise" },
    { id: 8, name: "Spain", code: "ES", continent: "Europe", flagEmoji: "🇪🇸", latitude: 40.4637, longitude: -3.7492, description: "Mediterranean flavors" },
    { id: 9, name: "Greece", code: "GR", continent: "Europe", flagEmoji: "🇬🇷", latitude: 39.0742, longitude: 21.8243, description: "Ancient Mediterranean tradition" },
    { id: 10, name: "Germany", code: "DE", continent: "Europe", flagEmoji: "🇩🇪", latitude: 51.1657, longitude: 10.4515, description: "Hearty and rich flavors" },
    { id: 35, name: "Sweden", code: "SE", continent: "Europe", flagEmoji: "🇸🇪", latitude: 60.1282, longitude: 18.6435, description: "Nordic culinary heritage" },
    { id: 36, name: "Portugal", code: "PT", continent: "Europe", flagEmoji: "🇵🇹", latitude: 39.3999, longitude: -8.2245, description: "Seafood and pastry traditions" }
  ],
  "Africa": [
    { id: 11, name: "Egypt", code: "EG", continent: "Africa", flagEmoji: "🇪🇬", latitude: 26.8206, longitude: 30.8025, description: "Ancient culinary traditions" },
    { id: 12, name: "Morocco", code: "MA", continent: "Africa", flagEmoji: "🇲🇦", latitude: 31.7917, longitude: -7.0926, description: "Spiced tagines and couscous" },
    { id: 13, name: "South Africa", code: "ZA", continent: "Africa", flagEmoji: "🇿🇦", latitude: -30.5595, longitude: 22.9375, description: "Fusion of cultures" },
    { id: 14, name: "Ethiopia", code: "ET", continent: "Africa", flagEmoji: "🇪🇹", latitude: 9.145, longitude: 40.4897, description: "Unique spice blends" },
    { id: 37, name: "Nigeria", code: "NG", continent: "Africa", flagEmoji: "🇳🇬", latitude: 9.082, longitude: 8.6753, description: "West African bold flavors" }
  ],
  "North America": [
    { id: 15, name: "Mexico", code: "MX", continent: "North America", flagEmoji: "🇲🇽", latitude: 23.6345, longitude: -102.5528, description: "Vibrant and complex flavors" },
    { id: 16, name: "United States", code: "US", continent: "North America", flagEmoji: "🇺🇸", latitude: 37.0902, longitude: -95.7129, description: "Diverse regional cuisines" },
    { id: 17, name: "Canada", code: "CA", continent: "North America", flagEmoji: "🇨🇦", latitude: 56.1304, longitude: -106.3468, description: "Fresh and local ingredients" },
    { id: 38, name: "Jamaica", code: "JM", continent: "North America", flagEmoji: "🇯🇲", latitude: 18.1096, longitude: -77.2975, description: "Caribbean island spices" }
  ],
  "South America": [
    { id: 18, name: "Peru", code: "PE", continent: "South America", flagEmoji: "🇵🇪", latitude: -9.19, longitude: -75.0152, description: "Ancient Andean cuisine" },
    { id: 19, name: "Brazil", code: "BR", continent: "South America", flagEmoji: "🇧🇷", latitude: -14.235, longitude: -51.9253, description: "Tropical and bold flavors" },
    { id: 20, name: "Argentina", code: "AR", continent: "South America", flagEmoji: "🇦🇷", latitude: -38.4161, longitude: -63.6167, description: "Grilled meats and wine culture" },
    { id: 21, name: "Colombia", code: "CO", continent: "South America", flagEmoji: "🇨🇴", latitude: 4.5709, longitude: -74.2973, description: "Rich coffee and tropical fruits" }
  ],
  "Oceania": [
    { id: 22, name: "Australia", code: "AU", continent: "Oceania", flagEmoji: "🇦🇺", latitude: -25.2744, longitude: 133.7751, description: "Modern and indigenous fusion" },
    { id: 23, name: "New Zealand", code: "NZ", continent: "Oceania", flagEmoji: "🇳🇿", latitude: -40.9006, longitude: 174.886, description: "Pacific seafood and meats" }
  ]
};

const buildContinentsData = (fetchedData, restData = {}) => {
  const baseData = {};
  continentOrder.forEach((c) => {
    const mockData = [...(mockContinents[c] || [])];
    const restCountries = restData[c] || [];
    baseData[c] = mergeCountries(restCountries, mockData);
  });
  Object.entries(fetchedData).forEach(([key, fetchedCountries]) => {
    const cont = normalizeContinentName(key);
    const fallback = baseData[cont] || [];
    baseData[cont] = mergeCountries(fetchedCountries || [], fallback);
  });
  continentOrder.forEach((c) => { baseData[c] = sortCountriesByName(baseData[c] || []); });
  return baseData;
};

const initialContinents = buildContinentsData({});

const FlavorMapPage = () => {
  const [countries, setCountries] = useState(() => Object.values(initialContinents).flat());
  const [continents, setContinents] = useState(initialContinents);
  const [selectedContinent, setSelectedContinent] = useState(defaultContinent);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recipesLoading, setRecipesLoading] = useState(false);
  const [countriesPage, setCountriesPage] = useState(0);
  const [showAllCountries, setShowAllCountries] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => { loadCountries(); }, []);

  const loadCountries = async () => {
    try {
      const [backendResponse, restResponse] = await Promise.allSettled([
        countryApi.getGroupedByContinent(),
        fetchRestCountries()
      ]);
      const backendData = backendResponse.status === "fulfilled" ? backendResponse.value.data || {} : {};
      const restData = restResponse.status === "fulfilled" ? restResponse.value : {};
      const mergedContinents = buildContinentsData(backendData, restData);
      setContinents(mergedContinents);
      setCountries(Object.values(mergedContinents).flat());
    } catch {
      // mock data is already set as initial state; nothing extra needed
    } finally {
      setLoading(false);
    }
  };

  const handleContinentClick = (continent) => {
    setSelectedContinent(continent);
    setSelectedCountry(null);
    setRecipes([]);
    setCountriesPage(0);
    setShowAllCountries(false);
    setCountrySearch("");
  };

  const getLocalRecipes = (country) =>
    ALL_RECIPES.filter(
      (r) => r.country.toLowerCase() === country.name.toLowerCase()
    ).map(toFlavorMapRecipe).slice(0, 10);

  const handleCountryClick = async (country) => {
    setSelectedCountry(country);
    setRecipesLoading(true);
    setRecipes([]);
    try {
      const response = await recipeApi.getByCountryCode(country.code);
      const backendRecipes = Array.isArray(response.data) ? response.data : [];
      if (backendRecipes.length > 0) {
        // Backend has recipes — use them, capped at 10
        setRecipes(backendRecipes.slice(0, 10));
      } else {
        // Backend returned nothing — fall back to local data
        setRecipes(getLocalRecipes(country));
      }
    } catch {
      // Network/server error — fall back to local data
      setRecipes(getLocalRecipes(country));
    } finally {
      setRecipesLoading(false);
    }
  };

  const handleRecipeClick = (recipe) => {
    // Pass recipe data via router state so RecipeDetailPage can use it without backend
    navigate(`/recipe/${recipe.id}`, { state: { localRecipe: recipe._raw || null } });
  };

  const availableContinents = continentOrder.filter((c) => continents[c]);

  const displayedCountries = useMemo(() => {
    const src = selectedContinent ? continents[selectedContinent] || [] : countries;
    return sortCountriesByName(src);
  }, [selectedContinent, continents, countries]);

  const searchFilteredCountries = useMemo(() => {
    const q = countrySearch.trim().toLowerCase();
    return q ? displayedCountries.filter((c) => c.name.toLowerCase().includes(q)) : displayedCountries;
  }, [displayedCountries, countrySearch]);

  const visibleCountries = useMemo(() => {
    if (showAllCountries) return searchFilteredCountries;
    const start = countriesPage * countriesPageSize;
    return searchFilteredCountries.slice(start, start + countriesPageSize);
  }, [searchFilteredCountries, showAllCountries, countriesPage]);

  const totalCountriesInView = searchFilteredCountries.length;
  const totalPages = Math.max(1, Math.ceil(totalCountriesInView / countriesPageSize));
  const hasCountryPagination = totalCountriesInView > countriesPageSize;

  useEffect(() => {
    if (countriesPage > totalPages - 1) setCountriesPage(0);
  }, [countriesPage, totalPages]);

  return (
    <div className="flavor-map-page page">
      <div className="container">
        <motion.h1 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="page-title">
          🌍 Global Flavor Map
        </motion.h1>
        <div className="flavor-map-layout">
          {/* Globe section */}
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
                  const count = (continents[continent] || []).length;
                  return (
                    <button
                      key={continent}
                      className={`continent-picker-btn ${isSelected ? "active" : ""}`}
                      style={{ borderColor: getContinentColor(continent) }}
                      onClick={() => handleContinentClick(continent)}
                    >
                      <span className="continent-picker-dot" style={{ backgroundColor: getContinentColor(continent) }} />
                      <span className="continent-picker-name">{continent}</span>
                      <span className="continent-picker-count">{count}</span>
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

          {/* Selection section */}
          <div className="selection-section">
            {/* Country finder */}
            <div className="country-finder-bar">
              <div className="country-finder-header">
                <div className="country-finder-title-row">
                  <FaSearch className="country-finder-icon" />
                  <h3 className="country-finder-title">Country Recipe Finder</h3>
                </div>
                <p className="country-finder-subtitle">
                  Search within{" "}
                  <span className="country-finder-continent">
                    {selectedContinent ? normalizeContinentName(selectedContinent) : "all continents"}
                  </span>
                </p>
              </div>
              <div className="country-finder-input-wrap">
                <FaSearch className="country-finder-input-icon" />
                <input
                  type="text"
                  className="country-finder-input"
                  placeholder="e.g. Japan, Brazil, Nigeria…"
                  value={countrySearch}
                  onChange={(e) => { setCountrySearch(e.target.value); setCountriesPage(0); }}
                />
                {countrySearch && (
                  <button
                    type="button"
                    className="country-finder-clear"
                    aria-label="Clear search"
                    onClick={() => { setCountrySearch(""); setCountriesPage(0); }}
                  >
                    <FaTimes />
                  </button>
                )}
              </div>
              {countrySearch.trim() && (
                <p className="country-finder-results">
                  {totalCountriesInView === 0
                    ? `No countries match "${countrySearch.trim()}"`
                    : `${totalCountriesInView} result${totalCountriesInView !== 1 ? "s" : ""} for "${countrySearch.trim()}"`}
                </p>
              )}
            </div>

            {/* Countries grid */}
            {displayedCountries.length > 0 && (
              <div className="countries-section">
                <h3>
                  {selectedContinent ? `Countries in ${normalizeContinentName(selectedContinent)}` : "All Countries"}
                  <span className="count-badge">{totalCountriesInView}</span>
                </h3>
                <div className="countries-toolbar">
                  <p className="countries-view-state">
                    Showing {visibleCountries.length} of {totalCountriesInView} countries
                  </p>
                  {hasCountryPagination && (
                    <div className="countries-pagination-controls">
                      {!showAllCountries && (
                        <>
                          <span className="countries-page-indicator">{countriesPage + 1} / {totalPages}</span>
                          <button
                            type="button"
                            className="country-nav-btn"
                            onClick={() => setCountriesPage((p) => Math.max(0, p - 1))}
                            disabled={countriesPage === 0}
                            aria-label="Previous"
                          >
                            <FaChevronLeft />
                          </button>
                          <button
                            type="button"
                            className="country-nav-btn"
                            onClick={() => setCountriesPage((p) => Math.min(totalPages - 1, p + 1))}
                            disabled={countriesPage >= totalPages - 1}
                            aria-label="Next"
                          >
                            <FaChevronRight />
                          </button>
                        </>
                      )}
                      <button
                        type="button"
                        className="country-see-all-btn"
                        onClick={() => { setShowAllCountries((v) => !v); setCountriesPage(0); }}
                      >
                        {showAllCountries ? "Show by Page" : "See All"}
                      </button>
                    </div>
                  )}
                </div>
                <div className="countries-grid">
                  {visibleCountries.map((country) => (
                    <motion.div
                      key={country.code}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`country-card ${selectedCountry?.id === country.id ? "selected" : ""}`}
                      onClick={() => handleCountryClick(country)}
                    >
                      <div className="country-flag-wrap">
                        <ReactCountryFlag countryCode={country.code} svg className="country-flag-svg" title={country.name} />
                      </div>
                      <h4>{country.name}</h4>
                      {country.description && <p className="country-desc">{country.description}</p>}
                      <span className="click-hint">Click to view recipes →</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Recipes section */}
            {selectedCountry && (
              <div className="recipes-section">
                <h3>🍳 Recipes from {selectedCountry.name} {selectedCountry.flagEmoji}</h3>
                {recipesLoading ? (
                  <div className="loading">
                    <div className="spinner" />
                    <p>Loading recipes...</p>
                  </div>
                ) : recipes.length > 0 ? (
                  <div className="recipes-grid">
                    {recipes.map((recipe) => (
                      <motion.div
                        key={recipe.id}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        className="recipe-card-mini card"
                        onClick={() => handleRecipeClick(recipe)}
                        style={{ cursor: "pointer" }}
                      >
                        {recipe.image && (
                          <div className="recipe-card-img-wrap">
                            <img src={recipe.image} alt={recipe.name} loading="lazy" />
                          </div>
                        )}
                        <div className="recipe-card-mini-body">
                          <h4>{recipe.name}</h4>
                          <p>{recipe.description?.slice(0, 90)}…</p>
                          <div className="recipe-quick-info">
                            <span><FaClock style={{ marginRight: 4 }} />{recipe.totalTimeMinutes} min</span>
                            <span className={`badge badge-${(recipe.difficultyLevel || "medium").toLowerCase()}`}>
                              <FaFire style={{ marginRight: 3 }} />{recipe.difficultyLevel}
                            </span>
                          </div>
                          <span className="click-hint">Click to view full recipe →</span>
                        </div>
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
