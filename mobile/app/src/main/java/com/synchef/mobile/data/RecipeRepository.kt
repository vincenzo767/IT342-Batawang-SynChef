package com.synchef.mobile.data

import android.content.Context

class RecipeRepository {

    private val api = ApiClient.recipeApi
    private val userApi = ApiClient.userApi
    private val countryApi = ApiClient.countryApi

    suspend fun getAllRecipes(): Result<List<RecipeListItem>> = safeCall {
        val response = api.getAllRecipes()
        if (response.isSuccessful) response.body() ?: emptyList()
        else throw Exception("Failed to load recipes (${response.code()})")
    }

    suspend fun getRecipeById(id: Long): Result<RecipeDetail> = safeCall {
        val response = api.getRecipeById(id)
        response.body() ?: throw Exception("Recipe not found")
    }

    suspend fun getRecipeByIdWithFallback(context: Context, id: Long): Result<RecipeDetail> = safeCall {
        if (WebFallbackData.isFallbackRecipeId(id)) {
            return@safeCall WebFallbackRecipeDetails.findByFallbackId(context, id)
                ?: throw Exception("Recipe not found")
        }

        val response = api.getRecipeById(id)
        val backendDetail = response.body()
        if (backendDetail != null) {
            return@safeCall WebFallbackRecipeDetails.enrichFromName(context, backendDetail)
        }

        WebFallbackRecipeDetails.findByLegacyWebId(context, id)
            ?: throw Exception("Recipe not found")
    }

    suspend fun searchRecipes(keyword: String): Result<List<RecipeListItem>> = safeCall {
        val response = api.searchRecipes(keyword)
        if (response.isSuccessful) response.body() ?: emptyList()
        else throw Exception("Search failed (${response.code()})")
    }

    suspend fun getRecipesByCountryCode(countryCode: String): Result<List<RecipeListItem>> = safeCall {
        val response = api.getRecipesByCountryCode(countryCode)
        if (response.isSuccessful) response.body() ?: emptyList()
        else throw Exception("Failed to load recipes by country (${response.code()})")
    }

    suspend fun getScaledRecipe(id: Long, servings: Int): Result<ScaledRecipe> = safeCall {
        val response = api.getScaledRecipe(id, servings)
        response.body() ?: throw Exception("Scaled recipe not found")
    }

    suspend fun getFavorites(): Result<List<Long>> = safeCall {
        val response = userApi.getFavorites()
        if (response.isSuccessful) response.body() ?: emptyList()
        else throw Exception("Failed to load favorites (${response.code()})")
    }

    suspend fun addFavorite(recipeId: Long): Result<List<Long>> = safeCall {
        val response = userApi.addFavorite(recipeId)
        if (response.isSuccessful) response.body() ?: emptyList()
        else throw Exception("Failed to add favorite (${response.code()})")
    }

    suspend fun removeFavorite(recipeId: Long): Result<List<Long>> = safeCall {
        val response = userApi.removeFavorite(recipeId)
        if (response.isSuccessful) response.body() ?: emptyList()
        else throw Exception("Failed to remove favorite (${response.code()})")
    }

    suspend fun getUserProfile(): Result<UserProfile> = safeCall {
        val response = userApi.getMe()
        response.body() ?: throw Exception("Failed to load profile")
    }

    suspend fun updateCountry(countryCode: String, countryName: String): Result<Unit> = safeCall {
        val response = userApi.updateCountry(UpdateCountryRequest(countryCode, countryName))
        if (!response.isSuccessful) throw Exception("Failed to update country (${response.code()})")
    }

    suspend fun getCountriesGroupedByContinent(): Result<Map<String, List<CountryInfo>>> = safeCall {
        val response = countryApi.getCountriesGroupedByContinent()
        if (response.isSuccessful) response.body() ?: emptyMap()
        else throw Exception("Failed to load countries (${response.code()})")
    }

    fun getMergedRecipesWithWebFallback(serverRecipes: List<RecipeListItem>): List<RecipeListItem> {
        val fallback = WebFallbackData.fallbackRecipes()
        val merged = (serverRecipes + fallback)
            .distinctBy { it.name.trim().lowercase() }
        return merged.sortedBy { it.name.lowercase() }
    }

    private inline fun <T> safeCall(block: () -> T): Result<T> {
        return try {
            Result.success(block())
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
