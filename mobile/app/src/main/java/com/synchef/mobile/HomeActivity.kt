package com.synchef.mobile

import android.app.Activity
import android.content.Intent
import android.os.Bundle
import android.text.SpannableString
import android.text.Spanned
import android.text.style.ForegroundColorSpan
import android.view.KeyEvent
import android.view.View
import android.view.inputmethod.EditorInfo
import android.widget.Button
import android.widget.EditText
import android.widget.LinearLayout
import android.widget.TextView
import androidx.core.content.ContextCompat
import androidx.recyclerview.widget.GridLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.synchef.mobile.data.ApiClient
import com.synchef.mobile.data.RecipeListItem
import com.synchef.mobile.data.RecipeRepository
import com.synchef.mobile.data.SessionManager
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.launch

class HomeActivity : Activity() {

    private val repository = RecipeRepository()
    private val screenJob = Job()
    private val uiScope = CoroutineScope(Dispatchers.Main + screenJob)

    private lateinit var sessionManager: SessionManager
    private lateinit var adapter: HomeRecipeAdapter
    private lateinit var llFilterTabs: LinearLayout
    private lateinit var tvStatus: TextView

    private var allRecipes: List<RecipeListItem> = emptyList()
    private var activeFilter = "All"

    private val continents = listOf(
        "All", "Europe", "Asia", "North America",
        "South America", "Africa", "Middle East", "Oceania"
    )

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        sessionManager = SessionManager(this)

        // Already logged in → go straight to Dashboard
        if (sessionManager.isLoggedIn()) {
            ApiClient.tokenProvider = { sessionManager.getToken() }
            startActivity(Intent(this, DashboardActivity::class.java))
            finish()
            return
        }

        setContentView(R.layout.activity_home)

        // Highlight "Global" in gold on the hero title
        val heroTitle = findViewById<TextView>(R.id.tvHeroTitle)
        val titleText = "Discover Global Flavors"
        val spannable = SpannableString(titleText)
        val goldColor = ContextCompat.getColor(this, R.color.synchef_orange)
        val start = titleText.indexOf("Global")
        spannable.setSpan(ForegroundColorSpan(goldColor), start, start + 6, Spanned.SPAN_EXCLUSIVE_EXCLUSIVE)
        heroTitle.text = spannable

        // Nav buttons
        findViewById<Button>(R.id.btnLogin).setOnClickListener {
            startActivity(Intent(this, LoginActivity::class.java))
        }

        // Explore button → full recipe list
        findViewById<Button>(R.id.btnExplore).setOnClickListener {
            startActivity(Intent(this, RecipeListActivity::class.java))
        }

        // Search
        val etSearch = findViewById<EditText>(R.id.etHomeSearch)
        findViewById<Button>(R.id.btnHomeSearch).setOnClickListener {
            performSearch(etSearch.text.toString().trim())
        }
        etSearch.setOnEditorActionListener { _, actionId, event ->
            if (actionId == EditorInfo.IME_ACTION_SEARCH ||
                (event?.keyCode == KeyEvent.KEYCODE_ENTER && event.action == KeyEvent.ACTION_DOWN)) {
                performSearch(etSearch.text.toString().trim())
                true
            } else false
        }

        // Status text + RecyclerView
        tvStatus = findViewById(R.id.tvHomeStatus)
        val rvRecipes = findViewById<RecyclerView>(R.id.rvHomeRecipes)
        adapter = HomeRecipeAdapter(emptyList()) { recipe ->
            val intent = Intent(this, RecipeDetailActivity::class.java)
            intent.putExtra(RecipeDetailActivity.EXTRA_RECIPE_ID, recipe.id)
            startActivity(intent)
        }
        rvRecipes.layoutManager = GridLayoutManager(this, 2)
        rvRecipes.adapter = adapter
        rvRecipes.isNestedScrollingEnabled = false

        // Filter tabs
        llFilterTabs = findViewById(R.id.llFilterTabs)
        buildFilterTabs()

        loadRecipes()
    }

    private fun buildFilterTabs() {
        llFilterTabs.removeAllViews()
        continents.forEach { continent ->
            val btn = Button(this)
            btn.text = continent
            btn.textSize = 12f
            btn.isAllCaps = false
            btn.stateListAnimator = null
            val params = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.WRAP_CONTENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            )
            params.marginEnd = 8
            btn.layoutParams = params
            btn.setPadding(36, 14, 36, 14)
            updateTabAppearance(btn, continent == activeFilter)
            btn.setOnClickListener {
                activeFilter = continent
                refreshTabs()
                filterAndShow()
            }
            llFilterTabs.addView(btn)
        }
    }

    private fun refreshTabs() {
        for (i in 0 until llFilterTabs.childCount) {
            val btn = llFilterTabs.getChildAt(i) as Button
            updateTabAppearance(btn, btn.text == activeFilter)
        }
    }

    private fun updateTabAppearance(btn: Button, isActive: Boolean) {
        if (isActive) {
            btn.setBackgroundResource(R.drawable.bg_filter_tab_active)
            btn.setTextColor(ContextCompat.getColor(this, R.color.white))
        } else {
            btn.setBackgroundResource(R.drawable.bg_filter_tab_inactive)
            btn.setTextColor(ContextCompat.getColor(this, R.color.synchef_text_dark))
        }
    }

    private fun filterAndShow() {
        val filtered = if (activeFilter == "All") {
            allRecipes
        } else {
            allRecipes.filter {
                it.country?.continent?.equals(activeFilter, ignoreCase = true) == true
            }
        }
        showRecipes(filtered)
    }

    private fun loadRecipes() {
        tvStatus.visibility = View.VISIBLE
        tvStatus.text = "Loading recipes..."

        uiScope.launch {
            val result = repository.getAllRecipes()
            result.onSuccess { recipes ->
                allRecipes = recipes
                filterAndShow()
            }.onFailure { err ->
                tvStatus.text = "Could not load recipes: ${err.message}"
                tvStatus.visibility = View.VISIBLE
            }
        }
    }

    private fun showRecipes(recipes: List<RecipeListItem>) {
        if (recipes.isEmpty()) {
            tvStatus.text = if (activeFilter == "All") "No recipes found." else "No recipes found for $activeFilter."
            tvStatus.visibility = View.VISIBLE
        } else {
            tvStatus.visibility = View.GONE
        }
        adapter.updateRecipes(recipes)
    }

    private fun performSearch(keyword: String) {
        if (keyword.isBlank()) {
            activeFilter = "All"
            refreshTabs()
            filterAndShow()
            return
        }

        tvStatus.visibility = View.VISIBLE
        tvStatus.text = "Searching..."

        uiScope.launch {
            val result = repository.searchRecipes(keyword)
            result.onSuccess { recipes ->
                showRecipes(recipes)
            }.onFailure {
                // Fallback to local filter
                val local = allRecipes.filter { r ->
                    r.name.contains(keyword, ignoreCase = true) ||
                        r.country?.name?.contains(keyword, ignoreCase = true) == true ||
                        r.categories?.any { c -> c.name?.contains(keyword, ignoreCase = true) == true } == true
                }
                showRecipes(local)
            }
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        screenJob.cancel()
    }
}
