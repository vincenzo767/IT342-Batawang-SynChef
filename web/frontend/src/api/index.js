import apiClient from "../services/apiClient";

export const countryApi = {
  getAll: () => apiClient.get("/countries"),
  getById: (id) => apiClient.get(`/countries/${id}`),
  getByCode: (code) => apiClient.get(`/countries/code/${code}`),
  getByContinent: (continent) => apiClient.get(`/countries/continent/${continent}`),
  getGroupedByContinent: () => apiClient.get("/countries/continents")
};

export const recipeApi = {
  getAll: () => apiClient.get("/recipes"),
  getById: (id) => apiClient.get(`/recipes/${id}`),
  getByCountry: (countryId) => apiClient.get(`/recipes/country/${countryId}`),
  getByCountryCode: (code) => apiClient.get(`/recipes/country/code/${code}`),
  getByCategory: (categoryId) => apiClient.get(`/recipes/category/${categoryId}`),
  search: (keyword) => apiClient.get(`/recipes/search?keyword=${encodeURIComponent(keyword)}`),
  getScaled: (id, servings) => apiClient.get(`/recipes/${id}/scale?servings=${servings}`),
  getTimerSequence: (id) => apiClient.get(`/recipes/${id}/timer-sequence`)
};

export const synCookApi = {
  getPublic: () => apiClient.get("/syncook/public"),
  getMine: () => apiClient.get("/syncook/mine"),
  getById: (id) => apiClient.get(`/syncook/${id}`),
  create: (payload) => apiClient.post("/syncook", payload),
  update: (id, payload) => apiClient.put(`/syncook/${id}`, payload),
  remove: (id) => apiClient.delete(`/syncook/${id}`),
  getComments: (id) => apiClient.get(`/syncook/${id}/comments`),
  addComment: (id, content) => apiClient.post(`/syncook/${id}/comments`, { content })
};

export const userApi = {
  /** GET /api/users/me — full profile including countryCode, favoriteRecipeIds */
  getMe: () => apiClient.get("/users/me"),

  /** GET /api/users/me/favorites — returns number[] of recipe IDs */
  getFavorites: () => apiClient.get("/users/me/favorites"),

  /** POST /api/users/me/favorites/:id — add favorite, returns updated list */
  addFavorite: (recipeId) => apiClient.post(`/users/me/favorites/${recipeId}`),

  /** DELETE /api/users/me/favorites/:id — remove favorite, returns updated list */
  removeFavorite: (recipeId) => apiClient.delete(`/users/me/favorites/${recipeId}`),

  /** PUT /api/users/me/country — update stored country */
  updateCountry: (countryCode, countryName) =>
    apiClient.put("/users/me/country", { countryCode, countryName })
};

export const aiApi = {
  getSubstitutions: (ingredientName, userRegion, allergies) =>
    apiClient.post("/ai/substitutions", { ingredientName, userRegion, allergies }),
  getPersonalizedTips: (recipeName, skillLevel, dietaryRestrictions) =>
    apiClient.post("/ai/personalized-tips", { recipeName, skillLevel, dietaryRestrictions }),
  getCulturalContext: (dishName, countryCode) =>
    apiClient.get(`/ai/cultural-context?dishName=${encodeURIComponent(dishName)}&countryCode=${countryCode}`)
};

export default apiClient;
