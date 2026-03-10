import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars, useTexture } from "@react-three/drei";
import * as THREE from "three";
import ReactCountryFlag from "react-country-flag";
import { FaChevronLeft, FaChevronRight, FaSearch, FaTimes } from "react-icons/fa";
import { countryApi, recipeApi } from "../api";
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
const restCountriesApiUrl = "https://restcountries.com/v3.1/all?fields=cca2,name,region,subregion,capital,latlng,flag,independent,unMember";
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
const getContinentColor = (name) => {
  const normalizedName = normalizeContinentName(name);
  return continentColors[normalizedName] || "#667eea";
};
const toSpherePosition = (latitude, longitude, radius) => {
  const phi = (90 - latitude) * (Math.PI / 180);
  const theta = (longitude + 180) * (Math.PI / 180);
  const x = -radius * Math.sin(phi) * Math.cos(theta);
  const y = radius * Math.cos(phi);
  const z = radius * Math.sin(phi) * Math.sin(theta);
  return new THREE.Vector3(x, y, z);
};
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
  return /* @__PURE__ */ jsxs("group", { children: [
    /* @__PURE__ */ jsxs("mesh", { ref: pulseRef, position: surfacePosition, quaternion: orientation, children: [
      /* @__PURE__ */ jsx("ringGeometry", { args: [hotspot.markerRadius * 1.35, hotspot.markerRadius * 1.9, 40] }),
      /* @__PURE__ */ jsx("meshBasicMaterial", { color, transparent: true, opacity: isSelected ? 1 : 0.42, side: THREE.DoubleSide })
    ] }),
    /* @__PURE__ */ jsxs(
      "mesh",
      {
        ref: meshRef,
        position: surfacePosition,
        quaternion: orientation,
        onClick: (event) => {
          event.stopPropagation();
          onSelect(continent);
        },
        children: [
          /* @__PURE__ */ jsx("circleGeometry", { args: [hotspot.markerRadius, 36] }),
          /* @__PURE__ */ jsx("meshStandardMaterial", { color, emissive: color, emissiveIntensity: isSelected ? 1.05 : 0.22, transparent: true, opacity: 0.98, side: THREE.DoubleSide })
        ]
      }
    ),
    /* @__PURE__ */ jsxs(
      "mesh",
      {
        position: surfacePosition,
        quaternion: orientation,
        onClick: (event) => {
          event.stopPropagation();
          onSelect(continent);
        },
        children: [
          /* @__PURE__ */ jsx("circleGeometry", { args: [hotspot.hitRadius, 28] }),
          /* @__PURE__ */ jsx("meshBasicMaterial", { transparent: true, opacity: 0, side: THREE.DoubleSide })
        ]
      }
    )
  ] });
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
    if (globeRef.current) {
      globeRef.current.rotation.y += delta / 16;
    }
    if (cloudRef.current) {
      cloudRef.current.rotation.y += delta / 10;
    }
  });
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("color", { attach: "background", args: ["#04142e"] }),
    /* @__PURE__ */ jsx("ambientLight", { intensity: 0.92 }),
    /* @__PURE__ */ jsx("hemisphereLight", { args: ["#e2f3ff", "#1e3a8a", 0.56] }),
    /* @__PURE__ */ jsx("directionalLight", { position: [3.6, 2.4, 3.2], intensity: 1.38, color: "#ffffff" }),
    /* @__PURE__ */ jsx("pointLight", { position: [-2.6, -1.1, -3.4], intensity: 0.28, color: "#38bdf8" }),
    /* @__PURE__ */ jsx(Stars, { radius: 80, depth: 35, count: 2500, factor: 3, saturation: 0, fade: true, speed: 0.3 }),
    /* @__PURE__ */ jsxs("group", { ref: globeRef, children: [
      /* @__PURE__ */ jsxs("mesh", { children: [
        /* @__PURE__ */ jsx("sphereGeometry", { args: [1, 64, 64] }),
        /* @__PURE__ */ jsx(
          "meshPhongMaterial",
          {
            map: earthMap,
            normalMap: earthNormalMap,
            specularMap: earthSpecularMap,
            specular: "#dbeafe",
            shininess: 22,
            emissive: "#102743",
            emissiveIntensity: 0.15
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("mesh", { ref: cloudRef, children: [
        /* @__PURE__ */ jsx("sphereGeometry", { args: [1.018, 64, 64] }),
        /* @__PURE__ */ jsx("meshPhongMaterial", { map: cloudMap, transparent: true, opacity: 0.25, depthWrite: false, side: THREE.DoubleSide })
      ] }),
      continents.map((continent) => {
        const normalizedName = normalizeContinentName(continent);
        if (!continentHotspots[normalizedName]) {
          return null;
        }
        return /* @__PURE__ */ jsx(
          ContinentHotspot,
          {
            continent,
            selectedContinent,
            onSelect
          },
          continent
        );
      })
    ] }),
    /* @__PURE__ */ jsx(
      OrbitControls,
      {
        enablePan: false,
        minDistance: 2,
        maxDistance: 3.6,
        autoRotate: false
      }
    )
  ] });
};
const ContinentShape = ({ selectedContinent }) => {
  const normalizedName = normalizeContinentName(selectedContinent);
  const color = getContinentColor(selectedContinent);
  const shapePath = continentShapes[normalizedName] || continentShapes["Europe"];
  return /* @__PURE__ */ jsxs("div", { className: "continent-shape-card", children: [
    /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 220 130", className: "continent-shape-svg", "aria-label": `${normalizedName} map`, children: [
      /* @__PURE__ */ jsx("title", { children: `${normalizedName} map` }),
      /* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsxs("linearGradient", { id: "continentGradient", x1: "0%", y1: "0%", x2: "100%", y2: "100%", children: [
        /* @__PURE__ */ jsx("stop", { offset: "0%", stopColor: color, stopOpacity: "0.9" }),
        /* @__PURE__ */ jsx("stop", { offset: "100%", stopColor: "#0f172a", stopOpacity: "0.85" })
      ] }) }),
      /* @__PURE__ */ jsx("rect", { x: "0", y: "0", width: "220", height: "130", rx: "14", fill: "#020617" }),
      /* @__PURE__ */ jsx("path", { d: shapePath, fill: "url(#continentGradient)", stroke: color, strokeWidth: "2" })
    ] }),
    /* @__PURE__ */ jsx("p", { className: "continent-shape-caption", children: normalizedName })
  ] });
};
const mergeCountries = (primary, fallback) => {
  const deduped = /* @__PURE__ */ new Map();
  [...fallback, ...primary].forEach((country) => {
    deduped.set(country.code, country);
  });
  return Array.from(deduped.values());
};
const sortCountriesByName = (countriesToSort) => {
  return [...countriesToSort].sort((left, right) => left.name.localeCompare(right.name));
};
const getFallbackIdFromCode = (code) => {
  return code.toUpperCase().split("").reduce((sum, letter) => sum + letter.charCodeAt(0), 1e3);
};
const mapRegionToContinent = (region, subregion) => {
  const normalizedRegion = (region || "").trim();
  const normalizedSubregion = (subregion || "").trim();
  if (normalizedRegion === "Asia" || normalizedRegion === "Europe" || normalizedRegion === "Africa" || normalizedRegion === "Oceania") {
    return normalizedRegion;
  }
  if (normalizedRegion === "Americas") {
    if (normalizedSubregion.toLowerCase().includes("south america")) {
      return "South America";
    }
    return "North America";
  }
  return null;
};
const buildCountryDescriptionFromCapital = (countryName, capital) => {
  const primaryCapital = capital && capital.length > 0 ? capital[0] : "";
  if (!primaryCapital) {
    return `Distinct culinary traditions from ${countryName}`;
  }
  return `Signature flavors from ${countryName} (${primaryCapital})`;
};
const mapRestCountryToCountry = (entry) => {
  const code = (entry.cca2 || "").trim().toUpperCase();
  if (code.length !== 2) {
    return null;
  }
  const continent = mapRegionToContinent(entry.region, entry.subregion);
  if (!continent) {
    return null;
  }
  const shouldInclude = entry.independent === true || entry.unMember === true;
  if (!shouldInclude) {
    return null;
  }
  const name = (entry.name?.common || "").trim();
  if (!name) {
    return null;
  }
  return {
    id: getFallbackIdFromCode(code),
    name,
    code,
    continent,
    flagEmoji: entry.flag || "\u{1F3F3}\uFE0F",
    latitude: Array.isArray(entry.latlng) && entry.latlng.length > 0 ? Number(entry.latlng[0]) : 0,
    longitude: Array.isArray(entry.latlng) && entry.latlng.length > 1 ? Number(entry.latlng[1]) : 0,
    description: buildCountryDescriptionFromCapital(name, entry.capital)
  };
};
const buildRestCountriesByContinent = (restCountries) => {
  const grouped = {};
  continentOrder.forEach((continent) => {
    grouped[continent] = [];
  });
  restCountries.forEach((entry) => {
    const mapped = mapRestCountryToCountry(entry);
    if (!mapped) {
      return;
    }
    grouped[mapped.continent] = grouped[mapped.continent] || [];
    grouped[mapped.continent].push(mapped);
  });
  continentOrder.forEach((continent) => {
    grouped[continent] = sortCountriesByName(mergeCountries(grouped[continent] || [], []));
  });
  return grouped;
};
const fetchRestCountries = async () => {
  const response = await fetch(restCountriesApiUrl);
  if (!response.ok) {
    throw new Error(`REST Countries request failed: ${response.status}`);
  }
  const payload = await response.json();
  return buildRestCountriesByContinent(payload || []);
};
const buildContinentsData = (fetchedData, restData = {}) => {
  const baseData = {};
  continentOrder.forEach((continent) => {
    const mockData = [...mockContinents[continent] || []];
    const restCountries = restData[continent] || [];
    baseData[continent] = mergeCountries(restCountries, mockData);
  });
  Object.entries(fetchedData).forEach(([continentKey, fetchedCountries]) => {
    const normalizedContinent = normalizeContinentName(continentKey);
    const fallbackCountries = baseData[normalizedContinent] || [];
    baseData[normalizedContinent] = mergeCountries(fetchedCountries || [], fallbackCountries);
  });
  continentOrder.forEach((continent) => {
    baseData[continent] = sortCountriesByName(baseData[continent] || []);
  });
  return baseData;
};
const mockContinents = {
  "Asia": [
    { id: 1, name: "Japan", code: "JP", continent: "Asia", flagEmoji: "\u{1F1EF}\u{1F1F5}", latitude: 36.2048, longitude: 138.2529, description: "Island nation with unique cuisine" },
    { id: 2, name: "Thailand", code: "TH", continent: "Asia", flagEmoji: "\u{1F1F9}\u{1F1ED}", latitude: 15.87, longitude: 100.9925, description: "Southeast Asian spice hub" },
    { id: 3, name: "India", code: "IN", continent: "Asia", flagEmoji: "\u{1F1EE}\u{1F1F3}", latitude: 20.5937, longitude: 78.9629, description: "Land of diverse spices" },
    { id: 4, name: "South Korea", code: "KR", continent: "Asia", flagEmoji: "\u{1F1F0}\u{1F1F7}", latitude: 35.9078, longitude: 127.7669, description: "Vibrant modern cuisine" },
    { id: 5, name: "Vietnam", code: "VN", continent: "Asia", flagEmoji: "\u{1F1FB}\u{1F1F3}", latitude: 14.0583, longitude: 108.2772, description: "Fresh and balanced flavors" }
  ],
  "Europe": [
    { id: 6, name: "France", code: "FR", continent: "Europe", flagEmoji: "\u{1F1EB}\u{1F1F7}", latitude: 46.2276, longitude: 2.2137, description: "Culinary capital of the world" },
    { id: 7, name: "Italy", code: "IT", continent: "Europe", flagEmoji: "\u{1F1EE}\u{1F1F9}", latitude: 41.8719, longitude: 12.5674, description: "Pasta and pizza paradise" },
    { id: 8, name: "Spain", code: "ES", continent: "Europe", flagEmoji: "\u{1F1EA}\u{1F1F8}", latitude: 40.4637, longitude: -3.7492, description: "Mediterranean flavors" },
    { id: 9, name: "Greece", code: "GR", continent: "Europe", flagEmoji: "\u{1F1EC}\u{1F1F7}", latitude: 39.0742, longitude: 21.8243, description: "Ancient Mediterranean tradition" },
    { id: 10, name: "Germany", code: "DE", continent: "Europe", flagEmoji: "\u{1F1E9}\u{1F1EA}", latitude: 51.1657, longitude: 10.4515, description: "Hearty and rich flavors" }
  ],
  "Africa": [
    { id: 11, name: "Egypt", code: "EG", continent: "Africa", flagEmoji: "\u{1F1EA}\u{1F1EC}", latitude: 26.8206, longitude: 30.8025, description: "Ancient culinary traditions" },
    { id: 12, name: "Morocco", code: "MA", continent: "Africa", flagEmoji: "\u{1F1F2}\u{1F1E6}", latitude: 31.7917, longitude: -7.0926, description: "Spiced tagines and couscous" },
    { id: 13, name: "South Africa", code: "ZA", continent: "Africa", flagEmoji: "\u{1F1FF}\u{1F1E6}", latitude: -30.5595, longitude: 22.9375, description: "Fusion of cultures" },
    { id: 14, name: "Ethiopia", code: "ET", continent: "Africa", flagEmoji: "\u{1F1EA}\u{1F1F9}", latitude: 9.145, longitude: 40.4897, description: "Unique spice blends" }
  ],
  "North America": [
    { id: 15, name: "Mexico", code: "MX", continent: "North America", flagEmoji: "\u{1F1F2}\u{1F1FD}", latitude: 23.6345, longitude: -102.5528, description: "Vibrant and complex flavors" },
    { id: 16, name: "United States", code: "US", continent: "North America", flagEmoji: "\u{1F1FA}\u{1F1F8}", latitude: 37.0902, longitude: -95.7129, description: "Diverse regional cuisines" },
    { id: 17, name: "Canada", code: "CA", continent: "North America", flagEmoji: "\u{1F1E8}\u{1F1E6}", latitude: 56.1304, longitude: -106.3468, description: "Fresh and local ingredients" }
  ],
  "South America": [
    { id: 18, name: "Peru", code: "PE", continent: "South America", flagEmoji: "\u{1F1F5}\u{1F1EA}", latitude: -9.19, longitude: -75.0152, description: "Ancient Andean cuisine" },
    { id: 19, name: "Brazil", code: "BR", continent: "South America", flagEmoji: "\u{1F1E7}\u{1F1F7}", latitude: -14.235, longitude: -51.9253, description: "Tropical and bold flavors" },
    { id: 20, name: "Argentina", code: "AR", continent: "South America", flagEmoji: "\u{1F1E6}\u{1F1F7}", latitude: -38.4161, longitude: -63.6167, description: "Grilled meats and wine culture" },
    { id: 21, name: "Colombia", code: "CO", continent: "South America", flagEmoji: "\u{1F1E8}\u{1F1F4}", latitude: 4.5709, longitude: -74.2973, description: "Rich coffee and tropical fruits" }
  ],
  "Oceania": [
    { id: 22, name: "Australia", code: "AU", continent: "Oceania", flagEmoji: "\u{1F1E6}\u{1F1FA}", latitude: -25.2744, longitude: 133.7751, description: "Modern and indigenous fusion" },
    { id: 23, name: "New Zealand", code: "NZ", continent: "Oceania", flagEmoji: "\u{1F1F3}\u{1F1FF}", latitude: -40.9006, longitude: 174.886, description: "Pacific seafood and meats" }
  ]
};
const FlavorMapPage = () => {
  const [countries, setCountries] = useState([]);
  const [continents, setContinents] = useState({});
  const [selectedContinent, setSelectedContinent] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [countriesPage, setCountriesPage] = useState(0);
  const [showAllCountries, setShowAllCountries] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");
  const navigate = useNavigate();
  useEffect(() => {
    loadCountries();
  }, []);
  const loadCountries = async () => {
    try {
      const [backendResponse, restResponse] = await Promise.allSettled([
        countryApi.getGroupedByContinent(),
        fetchRestCountries()
      ]);
      const backendData = backendResponse.status === "fulfilled" ? backendResponse.value.data || {} : {};
      const restData = restResponse.status === "fulfilled" ? restResponse.value : {};
      if (restResponse.status === "rejected") {
        console.warn("REST Countries failed, using backend/mock fallback:", restResponse.reason);
      }
      const mergedContinents = buildContinentsData(backendData, restData);
      setContinents(mergedContinents);
      const allCountries = Object.values(mergedContinents).flat();
      setCountries(allCountries);
      setSelectedContinent((current) => current || defaultContinent);
    } catch (error) {
      console.error("Failed to load countries, using mock data:", error);
      const fallbackContinents = buildContinentsData({});
      setContinents(fallbackContinents);
      const allCountries = Object.values(fallbackContinents).flat();
      setCountries(allCountries);
      setSelectedContinent((current) => current || defaultContinent);
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
  const handleCountryClick = async (country) => {
    setSelectedCountry(country);
    setLoading(true);
    try {
      const response = await recipeApi.getByCountryCode(country.code);
      setRecipes(response.data);
    } catch (error) {
      console.error("Failed to load recipes, using mock data:", error);
      const mockRecipes = [
        {
          id: 1,
          name: `${country.name} Classic Dish`,
          description: `Traditional recipe from ${country.name}`,
          country,
          categories: [],
          prepTimeMinutes: 15,
          cookTimeMinutes: 30,
          totalTimeMinutes: 45,
          defaultServings: 4,
          difficultyLevel: "Medium",
          culturalContext: `A beloved dish from ${country.name}`,
          ingredients: [],
          steps: []
        },
        {
          id: 2,
          name: `Modern ${country.name} Fusion`,
          description: `Contemporary take on ${country.name} flavors`,
          country,
          categories: [],
          prepTimeMinutes: 20,
          cookTimeMinutes: 40,
          totalTimeMinutes: 60,
          defaultServings: 4,
          difficultyLevel: "Hard",
          culturalContext: `A modern interpretation of ${country.name} cuisine`,
          ingredients: [],
          steps: []
        }
      ];
      setRecipes(mockRecipes);
    } finally {
      setLoading(false);
    }
  };
  const handleRecipeClick = (recipeId) => {
    navigate(`/recipe/${recipeId}`);
  };
  const availableContinents = continentOrder.filter((continent) => continents[continent]);
  const displayedCountries = useMemo(() => {
    const sourceCountries = selectedContinent ? continents[selectedContinent] || [] : countries;
    return sortCountriesByName(sourceCountries);
  }, [selectedContinent, continents, countries]);
  const searchFilteredCountries = useMemo(() => {
    const query = countrySearch.trim().toLowerCase();
    if (!query) return displayedCountries;
    return displayedCountries.filter((c) => c.name.toLowerCase().includes(query));
  }, [displayedCountries, countrySearch]);
  const visibleCountries = useMemo(() => {
    if (showAllCountries) {
      return searchFilteredCountries;
    }
    const start = countriesPage * countriesPageSize;
    return searchFilteredCountries.slice(start, start + countriesPageSize);
  }, [searchFilteredCountries, showAllCountries, countriesPage]);
  const totalCountriesInView = searchFilteredCountries.length;
  const totalPages = Math.max(1, Math.ceil(totalCountriesInView / countriesPageSize));
  const hasCountryPagination = totalCountriesInView > countriesPageSize;
  useEffect(() => {
    if (countriesPage > totalPages - 1) {
      setCountriesPage(0);
    }
  }, [countriesPage, totalPages]);
  return /* @__PURE__ */ jsx("div", { className: "flavor-map-page page", children: /* @__PURE__ */ jsxs("div", { className: "container", children: [
    /* @__PURE__ */ jsx(
      motion.h1,
      {
        initial: { opacity: 0, y: -20 },
        animate: { opacity: 1, y: 0 },
        className: "page-title",
        children: "\u{1F30D} Global Flavor Map"
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: "flavor-map-layout", children: [
      /* @__PURE__ */ jsxs("div", { className: "globe-section", children: [
        /* @__PURE__ */ jsxs("div", { className: "globe-card", children: [
          /* @__PURE__ */ jsxs("div", { className: "map-header", children: [
            /* @__PURE__ */ jsx("h2", { children: "3D Flavor Globe" }),
            /* @__PURE__ */ jsx("p", { children: "Rotate and click a continent hotspot to explore countries and cuisines" })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "globe-canvas-wrapper", children: /* @__PURE__ */ jsx(Canvas, { camera: { position: [0, 0.2, 2.65], fov: 45 }, children: /* @__PURE__ */ jsx(
            GlobeScene,
            {
              continents: availableContinents,
              selectedContinent,
              onSelect: handleContinentClick
            }
          ) }) }),
          /* @__PURE__ */ jsx("div", { className: "continent-picker", "aria-label": "Choose continent", children: availableContinents.map((continent) => {
            const isSelected = selectedContinent === continent;
            const countryCount = (continents[continent] || []).length;
            return /* @__PURE__ */ jsxs(
              "button",
              {
                className: `continent-picker-btn ${isSelected ? "active" : ""}`,
                style: { borderColor: getContinentColor(continent) },
                onClick: () => handleContinentClick(continent),
                children: [
                  /* @__PURE__ */ jsx(
                    "span",
                    {
                      className: "continent-picker-dot",
                      style: { backgroundColor: getContinentColor(continent) }
                    }
                  ),
                  /* @__PURE__ */ jsx("span", { className: "continent-picker-name", children: continent }),
                  /* @__PURE__ */ jsx("span", { className: "continent-picker-count", children: countryCount })
                ]
              },
              continent
            );
          }) }),
          /* @__PURE__ */ jsxs("div", { className: "map-footer", children: [
            /* @__PURE__ */ jsxs("p", { children: [
              "\u{1F4CD} Total Countries: ",
              countries.length
            ] }),
            /* @__PURE__ */ jsx("p", { children: "\u{1F37D}\uFE0F Click any continent label around the globe to start exploring" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "continent-selected-panel", children: [
          /* @__PURE__ */ jsx("h3", { children: "Continent Selected" }),
          selectedContinent ? /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx(ContinentShape, { selectedContinent }),
            /* @__PURE__ */ jsxs("div", { className: "continent-meta", children: [
              /* @__PURE__ */ jsx(
                "span",
                {
                  className: "continent-chip",
                  style: { backgroundColor: getContinentColor(selectedContinent) },
                  children: normalizeContinentName(selectedContinent)
                }
              ),
              /* @__PURE__ */ jsxs("span", { className: "continent-country-count", children: [
                (continents[selectedContinent] || []).length,
                " countries available"
              ] })
            ] })
          ] }) : /* @__PURE__ */ jsx("p", { className: "continent-empty", children: "Select a continent on the globe to preview it here." })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "selection-section", children: [
        /* @__PURE__ */ jsxs("div", { className: "country-finder-bar", children: [
          /* @__PURE__ */ jsxs("div", { className: "country-finder-header", children: [
            /* @__PURE__ */ jsxs("div", { className: "country-finder-title-row", children: [
              /* @__PURE__ */ jsx(FaSearch, { className: "country-finder-icon" }),
              /* @__PURE__ */ jsx("h3", { className: "country-finder-title", children: "Country Recipe Finder" })
            ] }),
            /* @__PURE__ */ jsxs("p", { className: "country-finder-subtitle", children: [
              "Search within",
              " ",
              /* @__PURE__ */ jsx("span", { className: "country-finder-continent", children: selectedContinent ? normalizeContinentName(selectedContinent) : "all continents" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "country-finder-input-wrap", children: [
            /* @__PURE__ */ jsx(FaSearch, { className: "country-finder-input-icon" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                className: "country-finder-input",
                placeholder: "e.g. Japan, Brazil, Nigeria\u2026",
                value: countrySearch,
                onChange: (e) => {
                  setCountrySearch(e.target.value);
                  setCountriesPage(0);
                }
              }
            ),
            countrySearch && /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                className: "country-finder-clear",
                "aria-label": "Clear search",
                onClick: () => {
                  setCountrySearch("");
                  setCountriesPage(0);
                },
                children: /* @__PURE__ */ jsx(FaTimes, {})
              }
            )
          ] }),
          countrySearch.trim() && /* @__PURE__ */ jsx("p", { className: "country-finder-results", children: totalCountriesInView === 0 ? `No countries match "${countrySearch.trim()}"` : `${totalCountriesInView} result${totalCountriesInView !== 1 ? "s" : ""} for "${countrySearch.trim()}"` })
        ] }),
        displayedCountries.length > 0 && /* @__PURE__ */ jsxs("div", { className: "countries-section", children: [
          /* @__PURE__ */ jsxs("h3", { children: [
            selectedContinent ? `Countries in ${normalizeContinentName(selectedContinent)}` : "All Countries",
            /* @__PURE__ */ jsx("span", { className: "count-badge", children: totalCountriesInView })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "countries-toolbar", children: [
            /* @__PURE__ */ jsxs("p", { className: "countries-view-state", children: [
              "Showing ",
              visibleCountries.length,
              " of ",
              totalCountriesInView,
              " countries"
            ] }),
            hasCountryPagination && /* @__PURE__ */ jsxs("div", { className: "countries-pagination-controls", children: [
              !showAllCountries && /* @__PURE__ */ jsxs(Fragment, { children: [
                /* @__PURE__ */ jsxs("span", { className: "countries-page-indicator", children: [
                  countriesPage + 1,
                  " / ",
                  totalPages
                ] }),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    type: "button",
                    className: "country-nav-btn",
                    onClick: () => setCountriesPage((current) => Math.max(0, current - 1)),
                    disabled: countriesPage === 0,
                    "aria-label": "Previous countries",
                    children: /* @__PURE__ */ jsx(FaChevronLeft, {})
                  }
                ),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    type: "button",
                    className: "country-nav-btn",
                    onClick: () => setCountriesPage((current) => Math.min(totalPages - 1, current + 1)),
                    disabled: countriesPage >= totalPages - 1,
                    "aria-label": "Next countries",
                    children: /* @__PURE__ */ jsx(FaChevronRight, {})
                  }
                )
              ] }),
              /* @__PURE__ */ jsx(
                "button",
                {
                  type: "button",
                  className: "country-see-all-btn",
                  onClick: () => {
                    setShowAllCountries((current) => !current);
                    setCountriesPage(0);
                  },
                  children: showAllCountries ? "Show by Page" : "See All"
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "countries-grid", children: visibleCountries.map((country) => /* @__PURE__ */ jsxs(
            motion.div,
            {
              whileHover: { scale: 1.05 },
              whileTap: { scale: 0.95 },
              className: `country-card ${selectedCountry?.id === country.id ? "selected" : ""}`,
              onClick: () => handleCountryClick(country),
              children: [
                /* @__PURE__ */ jsx("div", { className: "country-flag-wrap", children: /* @__PURE__ */ jsx(
                  ReactCountryFlag,
                  {
                    countryCode: country.code,
                    svg: true,
                    className: "country-flag-svg",
                    title: country.name
                  }
                ) }),
                /* @__PURE__ */ jsx("h4", { children: country.name }),
                country.description && /* @__PURE__ */ jsx("p", { className: "country-desc", children: country.description }),
                /* @__PURE__ */ jsx("span", { className: "click-hint", children: "Click to view recipes \u2192" })
              ]
            },
            country.code
          )) })
        ] }),
        selectedCountry && /* @__PURE__ */ jsxs("div", { className: "recipes-section", children: [
          /* @__PURE__ */ jsxs("h3", { children: [
            "\u{1F373} Recipes from ",
            selectedCountry.name,
            " ",
            selectedCountry.flagEmoji
          ] }),
          loading ? /* @__PURE__ */ jsxs("div", { className: "loading", children: [
            /* @__PURE__ */ jsx("div", { className: "spinner" }),
            /* @__PURE__ */ jsx("p", { children: "Loading recipes..." })
          ] }) : recipes.length > 0 ? /* @__PURE__ */ jsx("div", { className: "recipes-grid", children: recipes.map((recipe) => /* @__PURE__ */ jsxs(
            motion.div,
            {
              whileHover: { scale: 1.05 },
              whileTap: { scale: 0.95 },
              className: "recipe-card-mini card",
              onClick: () => handleRecipeClick(recipe.id),
              children: [
                /* @__PURE__ */ jsx("h4", { children: recipe.name }),
                /* @__PURE__ */ jsx("p", { children: recipe.description }),
                /* @__PURE__ */ jsxs("div", { className: "recipe-quick-info", children: [
                  /* @__PURE__ */ jsxs("span", { children: [
                    "\u23F1\uFE0F ",
                    recipe.totalTimeMinutes,
                    " min"
                  ] }),
                  /* @__PURE__ */ jsx("span", { className: `badge badge-${recipe.difficultyLevel.toLowerCase()}`, children: recipe.difficultyLevel })
                ] }),
                /* @__PURE__ */ jsx("span", { className: "click-hint", children: "Click to view full recipe \u2192" })
              ]
            },
            recipe.id
          )) }) : /* @__PURE__ */ jsxs("div", { className: "no-recipes", children: [
            /* @__PURE__ */ jsxs("p", { children: [
              "No recipes available yet for ",
              selectedCountry.name
            ] }),
            /* @__PURE__ */ jsx("p", { className: "no-recipes-hint", children: "Try selecting a different country!" })
          ] })
        ] }),
        !selectedCountry && displayedCountries.length > 0 && /* @__PURE__ */ jsx("div", { className: "recipes-section empty-state", children: /* @__PURE__ */ jsx("p", { children: "\u{1F448} Select a country to view its delicious recipes!" }) })
      ] })
    ] })
  ] }) });
};
var FlavorMapPage_default = FlavorMapPage;
export {
  FlavorMapPage_default as default
};
