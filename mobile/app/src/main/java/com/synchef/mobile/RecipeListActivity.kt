package com.synchef.mobile

import android.app.Activity
import android.content.Intent
import android.os.Bundle
import android.view.KeyEvent
import android.view.View
import android.view.inputmethod.EditorInfo
import android.widget.Button
import android.widget.EditText
import android.widget.TextView
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout
import com.synchef.mobile.data.ApiClient
import com.synchef.mobile.data.RecipeListItem
import com.synchef.mobile.data.RecipeRepository
import com.synchef.mobile.data.SessionManager
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.launch

class RecipeListActivity : Activity() {

    companion object {
        const val EXTRA_REGION_FILTER = "region_filter"
        const val EXTRA_COUNTRY_CODE = "country_code"
    }

    private val repository = RecipeRepository()
    private val screenJob = Job()
    private val uiScope = CoroutineScope(Dispatchers.Main + screenJob)

    private lateinit var rvRecipes: RecyclerView
    private lateinit var tvStatus: TextView
    private lateinit var swipeRefresh: SwipeRefreshLayout
    private lateinit var etSearch: EditText
    private lateinit var adapter: RecipeAdapter

    private var allRecipes: List<RecipeListItem> = emptyList()
    private var regionFilter: String? = null
    private var countryCodeFilter: String? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_recipe_list)

        // Init API client with session token
        val session = SessionManager(this)
        ApiClient.tokenProvider = { session.getToken() }

        regionFilter = intent.getStringExtra(EXTRA_REGION_FILTER)
        countryCodeFilter = intent.getStringExtra(EXTRA_COUNTRY_CODE)

        rvRecipes = findViewById(R.id.rvRecipes)
        tvStatus = findViewById(R.id.tvStatus)
        swipeRefresh = findViewById(R.id.swipeRefresh)
        etSearch = findViewById(R.id.etSearch)

        adapter = RecipeAdapter(emptyList()) { recipe ->
            val intent = Intent(this, RecipeDetailActivity::class.java)
            intent.putExtra(RecipeDetailActivity.EXTRA_RECIPE_ID, recipe.id)
            startActivity(intent)
        }

        rvRecipes.layoutManager = LinearLayoutManager(this)
        rvRecipes.adapter = adapter

        findViewById<Button>(R.id.btnBack).setOnClickListener { finish() }

        findViewById<Button>(R.id.btnSearch).setOnClickListener {
            performSearch(etSearch.text.toString().trim())
        }

        etSearch.setOnEditorActionListener { _, actionId, event ->
            if (actionId == EditorInfo.IME_ACTION_SEARCH ||
                (event?.keyCode == KeyEvent.KEYCODE_ENTER && event.action == KeyEvent.ACTION_DOWN)) {
                performSearch(etSearch.text.toString().trim())
                true
            } else false
        }

        swipeRefresh.setOnRefreshListener { loadRecipes() }
        swipeRefresh.setColorSchemeColors(getColor(R.color.synchef_primary))

        loadRecipes()
    }

    private fun loadRecipes() {
        tvStatus.visibility = View.VISIBLE
        tvStatus.text = "Loading recipes..."
        swipeRefresh.isRefreshing = false

        uiScope.launch {
            val result = repository.getAllRecipes()
            result.onSuccess { recipes ->
                allRecipes = repository.getMergedRecipesWithWebFallback(recipes)
                val filtered = allRecipes.filter { recipe ->
                    val regionOk = regionFilter == null || recipe.country?.continent?.equals(regionFilter, ignoreCase = true) == true
                    val countryOk = countryCodeFilter == null || recipe.country?.code?.equals(countryCodeFilter, ignoreCase = true) == true
                    regionOk && countryOk
                }
                if (filtered.isEmpty()) {
                    tvStatus.text = "No recipes found."
                    tvStatus.visibility = View.VISIBLE
                } else {
                    tvStatus.visibility = View.GONE
                }
                adapter.updateRecipes(filtered)
            }.onFailure { err ->
                allRecipes = repository.getMergedRecipesWithWebFallback(emptyList())
                val filtered = allRecipes.filter { recipe ->
                    val regionOk = regionFilter == null || recipe.country?.continent?.equals(regionFilter, ignoreCase = true) == true
                    val countryOk = countryCodeFilter == null || recipe.country?.code?.equals(countryCodeFilter, ignoreCase = true) == true
                    regionOk && countryOk
                }
                if (filtered.isEmpty()) {
                    tvStatus.text = "Could not load recipes: ${err.message}"
                    tvStatus.visibility = View.VISIBLE
                } else {
                    tvStatus.visibility = View.GONE
                }
                adapter.updateRecipes(filtered)
            }
        }
    }

    private fun performSearch(keyword: String) {
        if (keyword.isBlank()) {
            val filtered = allRecipes.filter { recipe ->
                val regionOk = regionFilter == null || recipe.country?.continent?.equals(regionFilter, ignoreCase = true) == true
                val countryOk = countryCodeFilter == null || recipe.country?.code?.equals(countryCodeFilter, ignoreCase = true) == true
                regionOk && countryOk
            }
            adapter.updateRecipes(filtered)
            tvStatus.visibility = if (filtered.isEmpty()) View.VISIBLE else View.GONE
            return
        }

        tvStatus.visibility = View.VISIBLE
        tvStatus.text = "Searching..."

        uiScope.launch {
            val local = allRecipes.filter { r ->
                val regionOk = regionFilter == null || r.country?.continent?.equals(regionFilter, ignoreCase = true) == true
                val countryOk = countryCodeFilter == null || r.country?.code?.equals(countryCodeFilter, ignoreCase = true) == true
                val keywordOk = r.name.contains(keyword, ignoreCase = true) ||
                    r.country?.name?.contains(keyword, ignoreCase = true) == true ||
                    r.categories?.any { c -> c.name?.contains(keyword, ignoreCase = true) == true } == true
                regionOk && countryOk && keywordOk
            }

            if (local.isEmpty()) {
                tvStatus.text = "No results for \"$keyword\"."
                tvStatus.visibility = View.VISIBLE
            } else {
                tvStatus.visibility = View.GONE
            }
            adapter.updateRecipes(local)
        }
    }

    /**
     * Refresh data whenever user returns to this activity (e.g. after saving recipe in RecipeDetailActivity)
     * This ensures the favorite status and counts are always up-to-date
     */
    override fun onResume() {
        super.onResume()
        loadRecipes()
    }

    override fun onDestroy() {
        super.onDestroy()
        screenJob.cancel()
    }
}
