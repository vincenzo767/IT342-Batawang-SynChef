package com.synchef.mobile

import android.app.Activity
import android.content.Intent
import android.os.Bundle
import android.view.Gravity
import android.view.View
import android.widget.Button
import android.widget.LinearLayout
import android.widget.TextView
import com.synchef.mobile.data.ApiClient
import com.synchef.mobile.data.RecipeListItem
import com.synchef.mobile.data.RecipeRepository
import com.synchef.mobile.data.SessionManager
import com.synchef.mobile.data.UserProfile
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.launch

class ProfileActivity : Activity() {

    private val repository = RecipeRepository()
    private val screenJob = Job()
    private val uiScope = CoroutineScope(Dispatchers.Main + screenJob)

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_profile)

        val sessionManager = SessionManager(this)
        ApiClient.tokenProvider = { sessionManager.getToken() }
        val user = sessionManager.getUser()

        // Avatar initials
        val initials = user?.fullName
            ?.split(" ")
            ?.filter { it.isNotBlank() }
            ?.take(2)
            ?.joinToString("") { it.first().uppercaseChar().toString() }
            ?: "?"
        findViewById<TextView>(R.id.tvAvatar).text = initials
        findViewById<TextView>(R.id.tvFullName).text = user?.fullName ?: "—"
        findViewById<TextView>(R.id.tvEmail).text = user?.email ?: "—"
        findViewById<TextView>(R.id.tvUsername).text = "@${user?.username ?: "—"}"

        val countryName = sessionManager.getUserCountry()
        val tvCountry = findViewById<TextView>(R.id.tvCountry)
        if (!countryName.isNullOrBlank()) {
            tvCountry.text = "Country: $countryName"
            tvCountry.visibility = View.VISIBLE
        }

        val joinedText = "Member since recently"
        findViewById<TextView>(R.id.tvJoined).text = joinedText

        findViewById<Button>(R.id.btnBack).setOnClickListener { finish() }
        findViewById<Button>(R.id.btnViewAllSaved).setOnClickListener {
            startActivity(Intent(this, RecipeListActivity::class.java))
        }

        BottomNavHelper.setup(this, BottomNavHelper.TAB_PROFILE)
        loadProfileData()
    }

    private fun loadProfileData() {
        uiScope.launch {
            val sessionManager = SessionManager(this@ProfileActivity)
            repository.getUserProfile().onSuccess { profile ->
                sessionManager.updateUserProfile(profile)
                findViewById<TextView>(R.id.tvFullName).text = profile.fullName ?: "—"
                findViewById<TextView>(R.id.tvEmail).text = profile.email ?: "—"
                findViewById<TextView>(R.id.tvUsername).text = "@${profile.username ?: "—"}"
                if (!profile.countryName.isNullOrBlank()) {
                    val tvCountry = findViewById<TextView>(R.id.tvCountry)
                    tvCountry.text = "Country: ${profile.countryName}"
                    tvCountry.visibility = View.VISIBLE
                }
            }

            val favResult = repository.getFavorites()
            val recipesResult = repository.getAllRecipes()

            var favIds: List<Long> = emptyList()
            var allRecipes: List<RecipeListItem> = emptyList()

            favResult.onSuccess { ids -> favIds = ids }
            recipesResult.onSuccess { recipes -> allRecipes = recipes }

            val savedRecipes = allRecipes.filter { it.id in favIds }
            val countriesExplored = savedRecipes.mapNotNull { it.country?.name }.toSet().size
            val savedCount = savedRecipes.size

            // Stats
            findViewById<TextView>(R.id.tvStatSaved).text = savedCount.toString()
            findViewById<TextView>(R.id.tvStatCountries).text = countriesExplored.toString()

            // Achievements
            val achievements = buildAchievements(savedCount)
            val earnedCount = achievements.count { it.first != "New Chef" }
            findViewById<TextView>(R.id.tvStatBadges).text = earnedCount.toString()
            showAchievements(achievements)

            // Saved recipes (up to 3)
            val llSaved = findViewById<LinearLayout>(R.id.llSavedRecipes)
            val tvNoSaved = findViewById<TextView>(R.id.tvNoSaved)
            if (savedRecipes.isEmpty()) {
                tvNoSaved.visibility = View.VISIBLE
                llSaved.visibility = View.GONE
            } else {
                tvNoSaved.visibility = View.GONE
                llSaved.visibility = View.VISIBLE
                showSavedRecipes(savedRecipes.take(4), llSaved)
            }
        }
    }

    private fun buildAchievements(savedCount: Int): List<Pair<String, String>> {
        val list = mutableListOf<Pair<String, String>>()
        if (savedCount >= 1) list.add(Pair("First Save", "Saved your first recipe"))
        if (savedCount >= 5) list.add(Pair("Recipe Collector", "Saved 5+ recipes"))
        if (savedCount >= 10) list.add(Pair("Culinary Explorer", "Saved 10+ recipes"))
        val country = SessionManager(this).getUserCountry()
        if (!country.isNullOrBlank()) list.add(Pair("World Citizen", "Cooking from $country"))
        if (list.isEmpty()) list.add(Pair("New Chef", "Save recipes to earn your first badge!"))
        return list
    }

    private fun showAchievements(achievements: List<Pair<String, String>>) {
        val llAchievements = findViewById<LinearLayout>(R.id.llAchievements)
        llAchievements.removeAllViews()

        achievements.forEach { (title, desc) ->
            val row = LinearLayout(this).apply {
                orientation = LinearLayout.HORIZONTAL
                gravity = Gravity.CENTER_VERTICAL
                val params = LinearLayout.LayoutParams(
                    LinearLayout.LayoutParams.MATCH_PARENT,
                    LinearLayout.LayoutParams.WRAP_CONTENT
                )
                params.setMargins(0, 0, 0, resources.getDimensionPixelSize(android.R.dimen.app_icon_size) / 6)
                layoutParams = params
                setPadding(0, 8, 0, 8)
            }

            val badge = TextView(this).apply {
                text = when (title) {
                    "First Save" -> "⭐"
                    "Recipe Collector" -> "🔥"
                    "Culinary Explorer" -> "🏆"
                    "World Citizen" -> "🌍"
                    else -> "👨‍🍳"
                }
                textSize = 24f
                val p = LinearLayout.LayoutParams(
                    LinearLayout.LayoutParams.WRAP_CONTENT,
                    LinearLayout.LayoutParams.WRAP_CONTENT
                )
                p.setMargins(0, 0, 16, 0)
                layoutParams = p
            }

            val textCol = LinearLayout(this).apply {
                orientation = LinearLayout.VERTICAL
                layoutParams = LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f)
            }

            val tvTitle = TextView(this).apply {
                text = title
                textSize = 14f
                setTextColor(getColor(R.color.synchef_text_dark))
                setTypeface(null, android.graphics.Typeface.BOLD)
            }

            val tvDesc = TextView(this).apply {
                text = desc
                textSize = 12f
                setTextColor(getColor(R.color.synchef_text_light))
            }

            textCol.addView(tvTitle)
            textCol.addView(tvDesc)
            row.addView(badge)
            row.addView(textCol)
            llAchievements.addView(row)
        }
    }

    private fun showSavedRecipes(recipes: List<RecipeListItem>, container: LinearLayout) {
        container.removeAllViews()
        recipes.forEach { recipe ->
            val cardView = layoutInflater.inflate(R.layout.item_recipe_card, container, false)
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
            container.addView(cardView)
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        screenJob.cancel()
    }
}
