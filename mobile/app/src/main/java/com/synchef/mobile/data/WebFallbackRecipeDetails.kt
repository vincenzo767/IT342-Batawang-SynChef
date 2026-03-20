package com.synchef.mobile.data

import android.content.Context
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import java.io.InputStreamReader

private data class WebFallbackIngredient(
    val amount: String?,
    val item: String?,
    val prep: String?,
    val optional: Boolean?
)

private data class WebFallbackStep(
    val instruction: String?,
    val timer: Int?,
    val timerLabel: String?,
    val tip: String?
)

private data class WebFallbackRecipeDetail(
    val id: Long,
    val title: String,
    val region: String,
    val country: String,
    val flagEmoji: String?,
    val cuisine: String,
    val totalMinutes: Int,
    val difficulty: String,
    val image: String?,
    val description: String?,
    val culturalContext: String?,
    val servings: Int,
    val ingredients: List<WebFallbackIngredient>,
    val steps: List<WebFallbackStep>
)

object WebFallbackRecipeDetails {

    private const val ASSET_PATH = "data/recipes_fallback_details.json"

    @Volatile
    private var cached: List<WebFallbackRecipeDetail>? = null

    private fun load(context: Context): List<WebFallbackRecipeDetail> {
        val existing = cached
        if (existing != null) return existing

        synchronized(this) {
            val again = cached
            if (again != null) return again

            val parsed = context.assets.open(ASSET_PATH).use { stream ->
                InputStreamReader(stream).use { reader ->
                    val listType = object : TypeToken<List<WebFallbackRecipeDetail>>() {}.type
                    Gson().fromJson<List<WebFallbackRecipeDetail>>(reader, listType) ?: emptyList()
                }
            }
            cached = parsed
            return parsed
        }
    }

    fun findByFallbackId(context: Context, fallbackRecipeId: Long): RecipeDetail? {
        val sourceId = WebFallbackData.fromFallbackRecipeId(fallbackRecipeId) ?: return null
        return findByLegacyWebId(context, sourceId)?.copy(id = fallbackRecipeId)
    }

    fun findByLegacyWebId(context: Context, webRecipeId: Long): RecipeDetail? {
        val recipe = load(context).firstOrNull { it.id == webRecipeId } ?: return null
        return toRecipeDetail(recipe, WebFallbackData.toFallbackRecipeId(recipe.id))
    }

    fun enrichFromName(context: Context, backendDetail: RecipeDetail): RecipeDetail {
        val fallback = load(context).firstOrNull {
            it.title.equals(backendDetail.name, ignoreCase = true)
        } ?: return backendDetail

        val fallbackDetail = toRecipeDetail(fallback, backendDetail.id)

        return backendDetail.copy(
            description = backendDetail.description?.takeIf { it.isNotBlank() } ?: fallbackDetail.description,
            imageUrl = backendDetail.imageUrl?.takeIf { it.isNotBlank() } ?: fallbackDetail.imageUrl,
            totalTimeMinutes = backendDetail.totalTimeMinutes.takeIf { it > 0 } ?: fallbackDetail.totalTimeMinutes,
            difficultyLevel = backendDetail.difficultyLevel?.takeIf { it.isNotBlank() } ?: fallbackDetail.difficultyLevel,
            defaultServings = backendDetail.defaultServings.takeIf { it > 0 } ?: fallbackDetail.defaultServings,
            culturalContext = backendDetail.culturalContext?.takeIf { it.isNotBlank() } ?: fallbackDetail.culturalContext,
            country = backendDetail.country ?: fallbackDetail.country,
            categories = backendDetail.categories?.takeIf { it.isNotEmpty() } ?: fallbackDetail.categories,
            ingredients = backendDetail.ingredients.takeIf { it.isNotEmpty() } ?: fallbackDetail.ingredients,
            steps = backendDetail.steps.takeIf { it.isNotEmpty() } ?: fallbackDetail.steps
        )
    }

    private fun toRecipeDetail(source: WebFallbackRecipeDetail, targetId: Long): RecipeDetail {
        val countryCode = WebFallbackData.countryCodeFor(source.country)
        val normalizedContinent = WebFallbackData.normalizeContinentName(source.region)

        return RecipeDetail(
            id = targetId,
            name = source.title,
            description = source.description,
            imageUrl = source.image,
            totalTimeMinutes = source.totalMinutes,
            difficultyLevel = source.difficulty,
            defaultServings = source.servings,
            culturalContext = source.culturalContext,
            country = CountryInfo(
                id = null,
                name = source.country,
                code = countryCode,
                continent = normalizedContinent,
                flagEmoji = source.flagEmoji ?: WebFallbackData.flagFromCountryCode(countryCode)
            ),
            categories = listOf(
                CategoryInfo(
                    id = null,
                    name = source.cuisine,
                    colorCode = null,
                    iconName = null
                )
            ),
            ingredients = source.ingredients.mapIndexed { index, ing ->
                val parsed = parseAmount(ing.amount)
                RecipeIngredient(
                    id = index.toLong() + 1,
                    quantity = parsed.first,
                    unit = parsed.second,
                    preparation = ing.prep,
                    isOptional = ing.optional == true,
                    ingredient = IngredientInfo(
                        id = null,
                        name = ing.item ?: ""
                    )
                )
            },
            steps = source.steps.mapIndexed { index, step ->
                RecipeStep(
                    id = index.toLong() + 1,
                    orderIndex = index + 1,
                    instruction = step.instruction ?: "",
                    hasTimer = (step.timer ?: 0) > 0,
                    timerSeconds = step.timer,
                    timerLabel = step.timerLabel,
                    tips = step.tip,
                    temperature = null,
                    imageUrl = null
                )
            }
        )
    }

    private fun parseAmount(amount: String?): Pair<Double?, String?> {
        if (amount.isNullOrBlank()) return null to null

        val normalized = amount.trim()
            .replace("½", "1/2")
            .replace("¼", "1/4")
            .replace("¾", "3/4")

        val regex = Regex("^([0-9]+(?:\\.[0-9]+)?(?:/[0-9]+)?)\\s*(.*)$")
        val match = regex.find(normalized) ?: return null to normalized

        val numericRaw = match.groupValues[1]
        val remainder = match.groupValues[2].trim().ifBlank { null }
        val numeric = toNumber(numericRaw)

        return if (numeric != null) numeric to remainder else null to normalized
    }

    private fun toNumber(raw: String): Double? {
        return if (raw.contains('/')) {
            val parts = raw.split('/')
            if (parts.size != 2) return null
            val n = parts[0].toDoubleOrNull() ?: return null
            val d = parts[1].toDoubleOrNull() ?: return null
            if (d == 0.0) return null
            n / d
        } else {
            raw.toDoubleOrNull()
        }
    }
}
