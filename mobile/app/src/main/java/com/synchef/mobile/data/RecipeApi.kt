package com.synchef.mobile.data

import retrofit2.Response
import retrofit2.http.*

interface RecipeApi {

    @GET("recipes")
    suspend fun getAllRecipes(): Response<List<RecipeListItem>>

    @GET("recipes/{id}")
    suspend fun getRecipeById(@Path("id") id: Long): Response<RecipeDetail>

    @GET("recipes/search")
    suspend fun searchRecipes(@Query("keyword") keyword: String): Response<List<RecipeListItem>>

    @GET("recipes/country/code/{countryCode}")
    suspend fun getRecipesByCountryCode(
        @Path("countryCode") countryCode: String
    ): Response<List<RecipeListItem>>

    @GET("recipes/{id}/scale")
    suspend fun getScaledRecipe(
        @Path("id") id: Long,
        @Query("servings") servings: Int
    ): Response<ScaledRecipe>
}

interface CountryApi {

    @GET("countries/continents")
    suspend fun getCountriesGroupedByContinent(): Response<Map<String, List<CountryInfo>>>
}

interface UserApi {

    @GET("users/me")
    suspend fun getMe(): Response<UserProfile>

    @GET("users/me/favorites")
    suspend fun getFavorites(): Response<List<Long>>

    @POST("users/me/favorites/{id}")
    suspend fun addFavorite(@Path("id") recipeId: Long): Response<List<Long>>

    @DELETE("users/me/favorites/{id}")
    suspend fun removeFavorite(@Path("id") recipeId: Long): Response<List<Long>>

    @PUT("users/me/country")
    suspend fun updateCountry(@Body request: UpdateCountryRequest): Response<Void>
}

interface SynCookApi {

    @GET("syncook/public")
    suspend fun getPublicRecipes(): Response<List<SynCookRecipe>>

    @GET("syncook/mine")
    suspend fun getMyRecipes(): Response<List<SynCookRecipe>>

    @GET("syncook/{id}")
    suspend fun getById(@Path("id") id: Long): Response<SynCookRecipe>

    @POST("syncook")
    suspend fun create(@Body payload: SynCookRecipePayload): Response<SynCookRecipe>

    @PUT("syncook/{id}")
    suspend fun update(@Path("id") id: Long, @Body payload: SynCookRecipePayload): Response<SynCookRecipe>

    @DELETE("syncook/{id}")
    suspend fun delete(@Path("id") id: Long): Response<Unit>

    @POST("syncook/{id}/comments")
    suspend fun addComment(@Path("id") id: Long, @Body payload: SynCookCommentPayload): Response<SynCookComment>
}
