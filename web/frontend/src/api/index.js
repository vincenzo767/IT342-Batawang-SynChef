import apiClient from "../services/apiClient";
const countryApi = {
  getAll: () => apiClient.get("/countries"),
  getById: (id) => apiClient.get(`/countries/${id}`),
  getByCode: (code) => apiClient.get(`/countries/code/${code}`),
  getByContinent: (continent) => apiClient.get(`/countries/continent/${continent}`),
  getGroupedByContinent: () => apiClient.get("/countries/continents")
};
const recipeApi = {
  getAll: () => apiClient.get("/recipes"),
  getById: (id) => apiClient.get(`/recipes/${id}`),
  getByCountry: (countryId) => apiClient.get(`/recipes/country/${countryId}`),
  getByCountryCode: (code) => apiClient.get(`/recipes/country/code/${code}`),
  getByCategory: (categoryId) => apiClient.get(`/recipes/category/${categoryId}`),
  search: (keyword) => apiClient.get(`/recipes/search?keyword=${keyword}`),
  getScaled: (id, servings) => apiClient.get(`/recipes/${id}/scale?servings=${servings}`),
  getTimerSequence: (id) => apiClient.get(`/recipes/${id}/timer-sequence`)
};
const aiApi = {
  getSubstitutions: (ingredientName, userRegion, allergies) => apiClient.post("/ai/substitutions", { ingredientName, userRegion, allergies }),
  getPersonalizedTips: (recipeName, skillLevel, dietaryRestrictions) => apiClient.post("/ai/personalized-tips", { recipeName, skillLevel, dietaryRestrictions }),
  getCulturalContext: (dishName, countryCode) => apiClient.get(`/ai/cultural-context?dishName=${dishName}&countryCode=${countryCode}`)
};
var api_default = apiClient;
export {
  aiApi,
  countryApi,
  api_default as default,
  recipeApi
};
