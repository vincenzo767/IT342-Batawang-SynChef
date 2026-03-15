package com.synchef.mobile

import android.app.Activity
import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.Button
import android.widget.LinearLayout
import android.widget.TextView
import com.synchef.mobile.data.ApiClient
import com.synchef.mobile.data.RecipeListItem
import com.synchef.mobile.data.RecipeRepository
import com.synchef.mobile.data.SessionManager
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.launch

class DashboardActivity : Activity() {

    private lateinit var sessionManager: SessionManager
    private val repository = RecipeRepository()
    private val screenJob = Job()
    private val uiScope = CoroutineScope(Dispatchers.Main + screenJob)

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_dashboard)

        sessionManager = SessionManager(this)
        val user = sessionManager.getUser()

        if (user == null) {
            startActivity(Intent(this, LoginActivity::class.java))
            finish()
            return
        }

        // Init authenticated API
        ApiClient.tokenProvider = { sessionManager.getToken() }

        // Welcome
        val firstName = user.fullName?.split(" ")?.firstOrNull() ?: "Chef"
        findViewById<TextView>(R.id.tvWelcome).text = "Welcome back, $firstName!"

        val countryName = sessionManager.getUserCountry()
        if (!countryName.isNullOrBlank()) {
            val tvSub = findViewById<TextView>(R.id.tvWelcomeSub)
            tvSub.text = "Explore recipes inspired by $countryName and cuisines worldwide."
            val tvCountryTag = findViewById<TextView>(R.id.tvCountryTag)
            tvCountryTag.text = "Your country: $countryName"
            tvCountryTag.visibility = View.VISIBLE
        }

        // Quick action buttons
        findViewById<Button>(R.id.btnBrowseRecipes).setOnClickListener {
            startActivity(Intent(this, RecipeListActivity::class.java))
        }
        findViewById<Button>(R.id.btnProfile).setOnClickListener {
            startActivity(Intent(this, ProfileActivity::class.java))
        }
        findViewById<Button>(R.id.btnSettings).setOnClickListener {
            startActivity(Intent(this, SettingsActivity::class.java))
        }
        findViewById<Button>(R.id.btnLogout).setOnClickListener {
            sessionManager.clear()
            startActivity(Intent(this, LoginActivity::class.java))
            finishAffinity()
        }
        findViewById<Button>(R.id.btnViewAllRecipes).setOnClickListener {
            startActivity(Intent(this, RecipeListActivity::class.java))
        }

        // Region tiles
        val regions = mapOf(
            R.id.btnRegionAsia to "Asia",
            R.id.btnRegionEurope to "Europe",
            R.id.btnRegionAfrica to "Africa",
            R.id.btnRegionNorthAmerica to "North America",
            R.id.btnRegionSouthAmerica to "South America",
            R.id.btnRegionOceania to "Oceania"
        )
        regions.forEach { (btnId, region) ->
            findViewById<Button>(btnId).setOnClickListener {
                val intent = Intent(this, RecipeListActivity::class.java)
                intent.putExtra(RecipeListActivity.EXTRA_REGION_FILTER, region)
                startActivity(intent)
            }
        }

        loadData()
    }

    private fun loadData() {
        uiScope.launch {
            // Load favorites count and recipes for stats + recommended section
            val favResult = repository.getFavorites()
            val recipesResult = repository.getAllRecipes()

            favResult.onSuccess { favIds ->
                val savedCount = favIds.size
                findViewById<TextView>(R.id.tvStatSaved).text = savedCount.toString()

                // Countries explored from favorites: need recipe details, skip for now
                // We'll show a count from fetched favorites
            }

            recipesResult.onSuccess { recipes ->
                showRecommended(recipes)
            }.onFailure {
                val tvLoading = findViewById<TextView>(R.id.tvRecommendedLoading)
                tvLoading.text = "Could not load recipes."
            }
        }
    }

    private fun showRecommended(recipes: List<RecipeListItem>) {
        val tvLoading = findViewById<TextView>(R.id.tvRecommendedLoading)
        tvLoading.visibility = View.GONE

        val llRecommended = findViewById<LinearLayout>(R.id.llRecommended)
        llRecommended.removeAllViews()

        // Pick first 3 recipes (or filter by user country if known)
        val countryName = sessionManager.getUserCountry()
        val recommended = if (!countryName.isNullOrBlank()) {
            val countryMatches = recipes.filter {
                it.country?.name?.equals(countryName, ignoreCase = true) == true
            }
            (countryMatches + recipes).distinctBy { it.id }.take(3)
        } else {
            recipes.take(3)
        }

        recommended.forEach { recipe ->
            val cardView = layoutInflater.inflate(R.layout.item_recipe_card, llRecommended, false)
            cardView.findViewById<TextView>(R.id.tvRecipeTitle).text = recipe.name
            val meta = listOfNotNull(recipe.country?.name, recipe.categories?.firstOrNull()?.name)
                .joinToString(" • ")
            cardView.findViewById<TextView>(R.id.tvRecipeMeta).text = meta
            cardView.findViewById<TextView>(R.id.tvRecipeTime).text = "${recipe.totalTimeMinutes} min"
            cardView.findViewById<TextView>(R.id.tvRecipeDifficulty).text = recipe.difficultyLevel ?: ""
            cardView.setOnClickListener {
                val intent = Intent(this, RecipeDetailActivity::class.java)
                intent.putExtra(RecipeDetailActivity.EXTRA_RECIPE_ID, recipe.id)
                startActivity(intent)
            }
            llRecommended.addView(cardView)
        }
    }

    override fun onResume() {
        super.onResume()
        // Refresh favorite count when returning from detail/profile screens
        uiScope.launch {
            repository.getFavorites().onSuccess { favIds ->
                findViewById<TextView>(R.id.tvStatSaved).text = favIds.size.toString()
            }
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        screenJob.cancel()
    }
}
