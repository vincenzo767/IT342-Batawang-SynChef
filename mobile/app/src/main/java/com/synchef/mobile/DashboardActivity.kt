package com.synchef.mobile

import android.app.Activity
import android.content.Intent
import android.os.Bundle
import android.view.KeyEvent
import android.view.View
import android.view.inputmethod.EditorInfo
import android.widget.Button
import android.widget.EditText
import android.widget.PopupMenu
import android.widget.TextView
import com.synchef.mobile.data.ApiClient
import com.synchef.mobile.data.RecipeListItem
import com.synchef.mobile.data.RecipeRepository
import com.synchef.mobile.data.SessionManager
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

class DashboardActivity : Activity() {

    private lateinit var sessionManager: SessionManager
    private val repository = RecipeRepository()
    private val screenJob = Job()
    private val uiScope = CoroutineScope(Dispatchers.Main + screenJob)

    // Background polling job for real-time sync with web
    private var pollJob: Job? = null

    private lateinit var adapter: RecipeAdapter
    private lateinit var tvStatus: TextView
    private lateinit var etSearch: EditText

    private var allRecipes: List<RecipeListItem> = emptyList()
    private var selectedContinent: String = "All"

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

        findViewById<Button>(R.id.btnLogout).setOnClickListener {
            sessionManager.clear()
            startActivity(Intent(this, LoginActivity::class.java))
            finishAffinity()
        }

        val firstName = user.fullName?.split(" ")?.firstOrNull() ?: "Chef"
        findViewById<TextView>(R.id.tvWelcome).text = "Discover Global Flavors"
        findViewById<TextView>(R.id.tvWelcomeSub).text = "Welcome, $firstName"

        tvStatus = findViewById(R.id.tvDashboardStatus)
        etSearch = findViewById(R.id.etDashboardSearch)

        val rvRecipes = findViewById<androidx.recyclerview.widget.RecyclerView>(R.id.rvDashboardRecipes)
        adapter = RecipeAdapter(emptyList()) { recipe ->
            val intent = Intent(this, RecipeDetailActivity::class.java)
            intent.putExtra(RecipeDetailActivity.EXTRA_RECIPE_ID, recipe.id)
            startActivity(intent)
        }
        rvRecipes.layoutManager = androidx.recyclerview.widget.LinearLayoutManager(this)
        rvRecipes.adapter = adapter

        findViewById<Button>(R.id.btnFilter).setOnClickListener { showFilterMenu(it) }

        findViewById<Button>(R.id.btnSearch).setOnClickListener {
            performSearch(etSearch.text.toString().trim())
        }
        etSearch.setOnEditorActionListener { _, actionId, event ->
            if (actionId == EditorInfo.IME_ACTION_SEARCH ||
                (event?.keyCode == KeyEvent.KEYCODE_ENTER && event.action == KeyEvent.ACTION_DOWN)
            ) {
                performSearch(etSearch.text.toString().trim())
                true
            } else {
                false
            }
        }

        BottomNavHelper.setup(this, BottomNavHelper.TAB_HOME)
        
        // Refresh user profile and favorites from backend on app startup
        // This ensures mobile data is always in sync with backend
        refreshUserDataFromBackend()
        
        loadRecipes()
    }

    /**
     * Refresh user profile and favorites from the backend.
     * Called on activity creation and resume to ensure data is always synchronized.
     */
    private fun refreshUserDataFromBackend() {
        android.util.Log.d("DashboardActivity", "refreshUserDataFromBackend() called")
        uiScope.launch {
            // Fetch fresh user profile (loads country, usernames, etc.)
            repository.getUserProfile().onSuccess { profile ->
                android.util.Log.d("DashboardActivity", "Profile refreshed: ${profile.email}")
                sessionManager.updateUserProfile(profile)
            }.onFailure { err ->
                android.util.Log.e("DashboardActivity", "Failed to refresh user profile: ${err.message}")
            }

            // Fetch fresh favorites list from backend
            repository.getFavorites().onSuccess { favoriteIds ->
                android.util.Log.d("DashboardActivity", "Favorites refreshed: $favoriteIds")
                sessionManager.updateUser {
                    it.copy(favoriteRecipeIds = favoriteIds)
                }
            }.onFailure { err ->
                android.util.Log.e("DashboardActivity", "Failed to refresh favorites: ${err.message}")
            }
        }
    }

    /**
     * Refresh data whenever user returns to this activity (e.g. after visiting ProfileActivity or web app)
     * This ensures cross-platform sync: if user saved recipes on web, mobile will pick them up
     */
    override fun onResume() {
        super.onResume()
        refreshUserDataFromBackend()

        // Start polling for changes every 20 seconds while DashboardActivity is visible
        // This ensures real-time sync if web saves recipes
        startPolling()
    }

    /**
     * Stop polling when activity is paused to save battery
     */
    override fun onPause() {
        super.onPause()
        stopPolling()
    }

    private fun startPolling() {
        // Cancel existing poll job if any
        stopPolling()

        android.util.Log.d("DashboardActivity", "Starting polling every 20 seconds")
        // Start new polling job
        pollJob = uiScope.launch {
            while (true) {
                delay(20000) // 20 seconds
                android.util.Log.d("DashboardActivity", "Polling tick at ${System.currentTimeMillis()}")
                refreshUserDataFromBackend()
            }
        }
    }

    private fun stopPolling() {
        if (pollJob != null) {
            android.util.Log.d("DashboardActivity", "Stopping polling")
        }
        pollJob?.cancel()
        pollJob = null
    }

    private fun loadRecipes() {
        tvStatus.visibility = View.VISIBLE
        tvStatus.text = "Loading recipes..."

        uiScope.launch {
            val result = repository.getAllRecipes()
            result.onSuccess { recipes ->
                allRecipes = repository.getMergedRecipesWithWebFallback(recipes)
                applyFiltersAndRender()
            }.onFailure { err ->
                allRecipes = repository.getMergedRecipesWithWebFallback(emptyList())
                if (allRecipes.isEmpty()) {
                    tvStatus.text = "Could not load recipes: ${err.message}"
                    tvStatus.visibility = View.VISIBLE
                } else {
                    applyFiltersAndRender()
                }
            }
        }
    }

    private fun showFilterMenu(anchor: View) {
        val popup = PopupMenu(this, anchor)
        val continents = listOf("All", "Asia", "Europe", "Africa", "North America", "South America", "Oceania")
        continents.forEachIndexed { index, continent ->
            popup.menu.add(0, index, index, continent)
        }
        popup.setOnMenuItemClickListener { item ->
            selectedContinent = item.title.toString()
            findViewById<Button>(R.id.btnFilter).text = "Filter: $selectedContinent"
            applyFiltersAndRender()
            true
        }
        popup.show()
    }

    private fun performSearch(keyword: String) {
        if (keyword.isBlank()) {
            applyFiltersAndRender()
            return
        }

        tvStatus.visibility = View.VISIBLE
        tvStatus.text = "Searching..."

        uiScope.launch {
            val local = applyContinentFilter(allRecipes).filter { r ->
                r.name.contains(keyword, ignoreCase = true) ||
                    r.country?.name?.contains(keyword, ignoreCase = true) == true ||
                    r.categories?.any { c -> c.name?.contains(keyword, ignoreCase = true) == true } == true
            }
            renderRecipes(local, keyword)
        }
    }

    private fun applyFiltersAndRender() {
        val filtered = applyContinentFilter(allRecipes)
        renderRecipes(filtered, null)
    }

    private fun applyContinentFilter(source: List<RecipeListItem>): List<RecipeListItem> {
        return if (selectedContinent == "All") {
            source
        } else {
            source.filter { it.country?.continent?.equals(selectedContinent, ignoreCase = true) == true }
        }
    }

    private fun renderRecipes(recipes: List<RecipeListItem>, keyword: String?) {
        if (recipes.isEmpty()) {
            tvStatus.visibility = View.VISIBLE
            tvStatus.text = if (!keyword.isNullOrBlank()) {
                "No results for \"$keyword\"."
            } else {
                "No recipes available for $selectedContinent."
            }
        } else {
            tvStatus.visibility = View.GONE
        }
        adapter.updateRecipes(recipes)
    }

    override fun onDestroy() {
        super.onDestroy()
        screenJob.cancel()
    }
}
