package com.synchef.mobile.data

data class RecipeListItem(
    val id: Long,
    val name: String,
    val description: String?,
    val imageUrl: String?,
    val totalTimeMinutes: Int,
    val difficultyLevel: String?,
    val defaultServings: Int,
    val country: CountryInfo?,
    val categories: List<CategoryInfo>?
)

data class RecipeDetail(
    val id: Long,
    val name: String,
    val description: String?,
    val imageUrl: String?,
    val totalTimeMinutes: Int,
    val difficultyLevel: String?,
    val defaultServings: Int,
    val culturalContext: String?,
    val country: CountryInfo?,
    val categories: List<CategoryInfo>?,
    val ingredients: List<RecipeIngredient>,
    val steps: List<RecipeStep>
)

data class CountryInfo(
    val id: Long?,
    val name: String?,
    val code: String?,
    val continent: String?,
    val flagEmoji: String?
)

data class CategoryInfo(
    val id: Long?,
    val name: String?,
    val colorCode: String?,
    val iconName: String?
)

data class RecipeIngredient(
    val id: Long?,
    val quantity: Double?,
    val unit: String?,
    val preparation: String?,
    val isOptional: Boolean = false,
    val ingredient: IngredientInfo?
)

data class IngredientInfo(
    val id: Long?,
    val name: String?
)

data class RecipeStep(
    val id: Long?,
    val orderIndex: Int,
    val instruction: String,
    val hasTimer: Boolean = false,
    val timerSeconds: Int?,
    val timerLabel: String?,
    val tips: String?,
    val temperature: String?,
    val imageUrl: String?
)

data class ScaledRecipe(
    val recipeName: String,
    val scaledServings: Int,
    val scaledSteps: List<ScaledStep>
)

data class ScaledStep(
    val stepId: Long?,
    val orderIndex: Int,
    val instruction: String,
    val hasTimer: Boolean = false,
    val scaledTimerSeconds: Int?,
    val timerLabel: String?,
    val tips: String?
)

data class UserProfile(
    val id: Long?,
    val email: String?,
    val username: String?,
    val fullName: String?,
    val countryCode: String?,
    val countryName: String?,
    val profileImageUrl: String?,
    val emailVerified: Boolean = false,
    val createdAt: String?,
    val favoriteRecipeIds: List<Long>?
)

data class UpdateCountryRequest(
    val countryCode: String,
    val countryName: String
)

data class SynCookRecipe(
    val id: Long,
    val title: String,
    val country: String,
    val ingredients: List<String> = emptyList(),
    val procedures: List<String> = emptyList(),
    val imageUrl: String? = null,
    val privacy: String = "PUBLIC",
    val ownerId: Long,
    val ownerName: String,
    val canEdit: Boolean = false,
    val createdAt: String? = null,
    val updatedAt: String? = null,
    val commentCount: Long = 0,
    val comments: List<SynCookComment> = emptyList()
)

data class SynCookComment(
    val id: Long,
    val authorId: Long,
    val authorName: String,
    val content: String,
    val createdAt: String? = null
)

data class SynCookRecipePayload(
    val title: String,
    val country: String,
    val ingredients: List<String>,
    val procedures: List<String>,
    val imageUrl: String?,
    val privacy: String
)

data class SynCookCommentPayload(
    val content: String
)
