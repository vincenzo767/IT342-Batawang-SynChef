package com.synchef.mobile

import android.app.Activity
import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.Button
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.TextView
import android.widget.Toast
import androidx.core.widget.NestedScrollView
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.bumptech.glide.Glide
import com.synchef.mobile.data.ApiClient
import com.synchef.mobile.data.RecipeDetail
import com.synchef.mobile.data.RecipeRepository
import com.synchef.mobile.data.SessionManager
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.launch

class RecipeDetailActivity : Activity() {

    companion object {
        const val EXTRA_RECIPE_ID = "recipe_id"
    }

    private val repository = RecipeRepository()
    private val screenJob = Job()
    private val uiScope = CoroutineScope(Dispatchers.Main + screenJob)

    private lateinit var session: SessionManager
    private var currentRecipe: RecipeDetail? = null
    private var currentServings = 4
    private var defaultServings = 4
    private var isFavorited = false
    private var favoriteIds: List<Long> = emptyList()

    private lateinit var ingredientAdapter: IngredientAdapter

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_recipe_detail)

        session = SessionManager(this)
        ApiClient.tokenProvider = { session.getToken() }

        val recipeId = intent.getLongExtra(EXTRA_RECIPE_ID, -1L)
        if (recipeId < 0) { finish(); return }

        findViewById<Button>(R.id.btnBack).setOnClickListener { finish() }
        findViewById<Button>(R.id.btnFavorite).setOnClickListener { toggleFavorite(recipeId) }
        findViewById<Button>(R.id.btnServingsDown).setOnClickListener {
            if (currentServings > 1) {
                currentServings--
                updateServingsDisplay()
            }
        }
        findViewById<Button>(R.id.btnServingsUp).setOnClickListener {
            currentServings++
            updateServingsDisplay()
        }
        findViewById<Button>(R.id.btnStartCooking).setOnClickListener {
            val intent = Intent(this, CookingModeActivity::class.java)
            intent.putExtra(CookingModeActivity.EXTRA_RECIPE_ID, recipeId)
            intent.putExtra(CookingModeActivity.EXTRA_SERVINGS, currentServings)
            startActivity(intent)
        }

        loadFavorites()
        loadRecipe(recipeId)
    }

    private fun loadFavorites() {
        uiScope.launch {
            repository.getFavorites().onSuccess { ids ->
                favoriteIds = ids
            }
        }
    }

    private fun loadRecipe(recipeId: Long) {
        uiScope.launch {
            val result = repository.getRecipeById(recipeId)
            result.onSuccess { recipe ->
                currentRecipe = recipe
                defaultServings = recipe.defaultServings.takeIf { it > 0 } ?: 4
                currentServings = defaultServings

                isFavorited = favoriteIds.contains(recipeId)
                updateFavoriteButton()
                showRecipe(recipe)
            }.onFailure { err ->
                findViewById<TextView>(R.id.tvLoading).text = "Error: ${err.message}"
            }
        }
    }

    private fun showRecipe(recipe: RecipeDetail) {
        // Hide loading, show content
        findViewById<TextView>(R.id.tvLoading).visibility = View.GONE
        val scrollContent = findViewById<NestedScrollView>(R.id.scrollContent)
        scrollContent.visibility = View.VISIBLE

        // Header title
        findViewById<TextView>(R.id.tvDetailTitle).text = recipe.name

        // Hero image
        val imgHero = findViewById<ImageView>(R.id.imgHero)
        if (!recipe.imageUrl.isNullOrBlank()) {
            imgHero.visibility = View.VISIBLE
            Glide.with(this)
                .load(recipe.imageUrl)
                .centerCrop()
                .into(imgHero)
        }

        // Recipe name + flag
        findViewById<TextView>(R.id.tvRecipeName).text = recipe.name
        findViewById<TextView>(R.id.tvFlagEmoji).text = recipe.country?.flagEmoji ?: ""
        findViewById<TextView>(R.id.tvDescription).text = recipe.description ?: ""

        // Stats
        findViewById<TextView>(R.id.tvTime).text = "${recipe.totalTimeMinutes} min"
        findViewById<TextView>(R.id.tvDifficulty).text = recipe.difficultyLevel ?: "—"
        findViewById<TextView>(R.id.tvCountry).text = recipe.country?.name ?: "—"

        // Cultural context
        if (!recipe.culturalContext.isNullOrBlank()) {
            val section = findViewById<LinearLayout>(R.id.culturalContextSection)
            section.visibility = View.VISIBLE
            findViewById<TextView>(R.id.tvCulturalContext).text = recipe.culturalContext
        }

        // Servings
        updateServingsDisplay()

        // Ingredients
        val rvIngredients = findViewById<RecyclerView>(R.id.rvIngredients)
        ingredientAdapter = IngredientAdapter(recipe.ingredients, currentServings, defaultServings)
        rvIngredients.layoutManager = LinearLayoutManager(this)
        rvIngredients.adapter = ingredientAdapter
        rvIngredients.isNestedScrollingEnabled = false

        // Steps
        val rvSteps = findViewById<RecyclerView>(R.id.rvSteps)
        rvSteps.layoutManager = LinearLayoutManager(this)
        rvSteps.adapter = StepAdapter(recipe.steps)
        rvSteps.isNestedScrollingEnabled = false
    }

    private fun updateServingsDisplay() {
        findViewById<TextView>(R.id.tvServings).text = currentServings.toString()
        if (::ingredientAdapter.isInitialized) {
            ingredientAdapter.updateServings(currentServings)
        }
    }

    private fun toggleFavorite(recipeId: Long) {
        uiScope.launch {
            if (isFavorited) {
                repository.removeFavorite(recipeId).onSuccess { ids ->
                    favoriteIds = ids
                    isFavorited = false
                    updateFavoriteButton()
                    Toast.makeText(this@RecipeDetailActivity, "Removed from favorites", Toast.LENGTH_SHORT).show()
                }.onFailure {
                    Toast.makeText(this@RecipeDetailActivity, "Failed to update favorites", Toast.LENGTH_SHORT).show()
                }
            } else {
                repository.addFavorite(recipeId).onSuccess { ids ->
                    favoriteIds = ids
                    isFavorited = true
                    updateFavoriteButton()
                    Toast.makeText(this@RecipeDetailActivity, "Saved to favorites!", Toast.LENGTH_SHORT).show()
                }.onFailure {
                    Toast.makeText(this@RecipeDetailActivity, "Failed to update favorites", Toast.LENGTH_SHORT).show()
                }
            }
        }
    }

    private fun updateFavoriteButton() {
        val btn = findViewById<Button>(R.id.btnFavorite)
        btn.text = if (isFavorited) "Saved" else "Save"
        btn.setTextColor(
            if (isFavorited) getColor(R.color.synchef_favorite)
            else getColor(R.color.synchef_primary)
        )
    }

    override fun onDestroy() {
        super.onDestroy()
        screenJob.cancel()
    }
}
