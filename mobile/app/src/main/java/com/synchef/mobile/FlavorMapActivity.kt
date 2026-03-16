package com.synchef.mobile

import android.annotation.SuppressLint
import android.app.Activity
import android.content.Intent
import android.os.Bundle
import android.view.View
import android.webkit.JavascriptInterface
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.Button
import android.widget.LinearLayout
import android.widget.TextView
import androidx.core.content.ContextCompat
import androidx.recyclerview.widget.GridLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.synchef.mobile.data.ApiClient
import com.synchef.mobile.data.CountryInfo
import com.synchef.mobile.data.RecipeRepository
import com.synchef.mobile.data.SessionManager
import com.synchef.mobile.data.WebFallbackData
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.launch

class FlavorMapActivity : Activity() {

    private val repository = RecipeRepository()
    private val screenJob = Job()
    private val uiScope = CoroutineScope(Dispatchers.Main + screenJob)

    private lateinit var llContinentTabs: LinearLayout
    private lateinit var tvSelectedContinent: TextView
    private lateinit var tvCountriesTitle: TextView
    private lateinit var tvCountriesCount: TextView
    private lateinit var tvFlavorStatus: TextView
    private lateinit var countryAdapter: CountryAdapter

    private var countriesByContinent: Map<String, List<CountryInfo>> = emptyMap()
    private var selectedContinent: String = "Asia"

    private val orderedContinents = listOf(
        "Asia", "Europe", "Africa", "North America", "South America", "Oceania"
    )

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_flavor_map)

        val session = SessionManager(this)
        if (!session.isLoggedIn()) {
            startActivity(Intent(this, LoginActivity::class.java))
            finish()
            return
        }
        ApiClient.tokenProvider = { session.getToken() }

        llContinentTabs = findViewById(R.id.llContinentTabs)
        tvSelectedContinent = findViewById(R.id.tvSelectedContinent)
        tvCountriesTitle = findViewById(R.id.tvCountriesTitle)
        tvCountriesCount = findViewById(R.id.tvCountriesCount)
        tvFlavorStatus = findViewById(R.id.tvFlavorStatus)

        val rvCountries = findViewById<RecyclerView>(R.id.rvCountries)
        countryAdapter = CountryAdapter(emptyList()) { country ->
            val code = country.code ?: return@CountryAdapter
            val intent = Intent(this, RecipeListActivity::class.java)
            intent.putExtra(RecipeListActivity.EXTRA_COUNTRY_CODE, code)
            intent.putExtra(RecipeListActivity.EXTRA_REGION_FILTER, country.continent)
            startActivity(intent)
        }
        rvCountries.layoutManager = GridLayoutManager(this, 2)
        rvCountries.adapter = countryAdapter

        setupGlobeWebView(findViewById(R.id.webGlobe))
        buildContinentTabs()
        BottomNavHelper.setup(this, BottomNavHelper.TAB_FLAVOR)
        loadCountries()
    }

    private fun buildContinentTabs() {
        llContinentTabs.removeAllViews()
        orderedContinents.forEach { continent ->
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
            btn.setPadding(28, 12, 28, 12)
            styleContinentTab(btn, continent == selectedContinent)
            btn.setOnClickListener {
                selectContinent(continent)
                findViewById<WebView>(R.id.webGlobe)
                    .evaluateJavascript("window.selectContinent('${escapeJs(continent)}');", null)
            }
            llContinentTabs.addView(btn)
        }
    }

    private fun styleContinentTab(btn: Button, active: Boolean) {
        if (active) {
            btn.setBackgroundResource(R.drawable.bg_filter_tab_active)
            btn.setTextColor(ContextCompat.getColor(this, R.color.white))
        } else {
            btn.setBackgroundResource(R.drawable.bg_filter_tab_inactive)
            btn.setTextColor(ContextCompat.getColor(this, R.color.synchef_text_dark))
        }
    }

    private fun refreshContinentTabs() {
        for (i in 0 until llContinentTabs.childCount) {
            val child = llContinentTabs.getChildAt(i)
            if (child is Button) {
                styleContinentTab(child, child.text.toString() == selectedContinent)
            }
        }
    }

    private fun selectContinent(continent: String) {
        selectedContinent = WebFallbackData.normalizeContinentName(continent)
        refreshContinentTabs()
        val countries = (countriesByContinent[selectedContinent] ?: emptyList())
            .sortedBy { it.name ?: "" }

        tvSelectedContinent.text = "Selected continent: $selectedContinent"
        tvCountriesTitle.text = "Countries in $selectedContinent"
        tvCountriesCount.text = "${countries.size}"

        if (countries.isEmpty()) {
            tvFlavorStatus.visibility = View.VISIBLE
            tvFlavorStatus.text = "No countries available for $selectedContinent."
        } else {
            tvFlavorStatus.visibility = View.GONE
        }
        countryAdapter.updateCountries(countries)
    }

    private fun loadCountries() {
        tvFlavorStatus.visibility = View.VISIBLE
        tvFlavorStatus.text = "Loading countries..."

        uiScope.launch {
            val fallback = WebFallbackData.fallbackCountriesByContinent()
            val result = repository.getCountriesGroupedByContinent()
            result.onSuccess { grouped ->
                countriesByContinent = mergeCountriesByContinent(grouped, fallback)
                val initial = if (countriesByContinent.containsKey(selectedContinent)) {
                    selectedContinent
                } else {
                    orderedContinents.firstOrNull { countriesByContinent.containsKey(it) } ?: "Asia"
                }
                selectContinent(initial)
            }.onFailure { err ->
                countriesByContinent = fallback
                val initial = orderedContinents.firstOrNull { countriesByContinent.containsKey(it) } ?: "Asia"
                selectContinent(initial)
                if (countriesByContinent.isEmpty()) {
                    tvFlavorStatus.visibility = View.VISIBLE
                    tvFlavorStatus.text = "Could not load countries: ${err.message}"
                }
            }
        }
    }

    private fun mergeCountriesByContinent(
        server: Map<String, List<CountryInfo>>,
        fallback: Map<String, List<CountryInfo>>
    ): Map<String, List<CountryInfo>> {
        val merged = mutableMapOf<String, MutableList<CountryInfo>>()

        fun append(source: Map<String, List<CountryInfo>>) {
            source.forEach { (rawContinent, countries) ->
                val continent = WebFallbackData.normalizeContinentName(rawContinent)
                if (continent.isBlank()) return@forEach
                val bucket = merged.getOrPut(continent) { mutableListOf() }
                bucket.addAll(countries.map { country ->
                    country.copy(continent = continent)
                })
            }
        }

        append(server)
        append(fallback)

        return merged.mapValues { (_, countries) ->
            countries
                .filter { !it.name.isNullOrBlank() }
                .distinctBy { (it.code ?: it.name.orEmpty()).uppercase() }
                .sortedBy { it.name ?: "" }
        }
    }

    @SuppressLint("SetJavaScriptEnabled")
    private fun setupGlobeWebView(webView: WebView) {
        webView.settings.javaScriptEnabled = true
        webView.settings.domStorageEnabled = true
        webView.setBackgroundColor(ContextCompat.getColor(this, android.R.color.transparent))
        webView.webViewClient = WebViewClient()
        webView.addJavascriptInterface(GlobeBridge(), "AndroidBridge")
        webView.loadDataWithBaseURL(null, globeHtml(), "text/html", "utf-8", null)
    }

    private inner class GlobeBridge {
        @JavascriptInterface
        fun onContinentClick(continent: String) {
            runOnUiThread { selectContinent(continent) }
        }
    }

    private fun escapeJs(value: String): String = value.replace("'", "\\'")

    private fun globeHtml(): String {
        return """
            <!doctype html>
            <html>
            <head>
              <meta name='viewport' content='width=device-width, initial-scale=1.0' />
              <style>
                html, body {
                  margin: 0;
                  width: 100%;
                  height: 100%;
                  overflow: hidden;
                  background: radial-gradient(circle at 30% 25%, #0b2b4f 0%, #02112c 65%, #010814 100%);
                  font-family: Arial, sans-serif;
                }
                #scene {
                  position: relative;
                  width: 100%;
                  height: 100%;
                }
                .globe {
                  position: absolute;
                  width: min(62vw, 230px);
                  height: min(62vw, 230px);
                  left: 50%;
                  top: 52%;
                  transform: translate(-50%, -50%);
                  border-radius: 50%;
                  background:
                    radial-gradient(circle at 30% 30%, rgba(255,255,255,0.28), rgba(255,255,255,0.04) 42%, rgba(0,0,0,0.25) 85%),
                    radial-gradient(circle at 65% 65%, #4bd2ff 0%, #2176b8 35%, #0f4f8f 68%, #0a376a 100%);
                  box-shadow: inset -20px -24px 45px rgba(0,0,0,0.4), 0 18px 36px rgba(0,0,0,0.38);
                  animation: spin 16s linear infinite;
                }
                .ring {
                  position: absolute;
                  width: calc(min(62vw, 230px) + 26px);
                  height: calc(min(62vw, 230px) + 26px);
                  left: 50%;
                  top: 52%;
                  transform: translate(-50%, -50%);
                  border-radius: 50%;
                  border: 1px solid rgba(255,255,255,0.25);
                }
                .marker {
                  position: absolute;
                  transform: translate(-50%, -50%);
                  padding: 5px 8px;
                  border-radius: 999px;
                  border: 1px solid rgba(255,255,255,0.2);
                  background: rgba(3, 15, 35, 0.72);
                  color: #d8f4ff;
                  font-size: 11px;
                  font-weight: 600;
                  cursor: pointer;
                  user-select: none;
                  white-space: nowrap;
                }
                .marker.active {
                  color: #111827;
                  background: #facc15;
                  border-color: #facc15;
                }
                @keyframes spin {
                  from { transform: translate(-50%, -50%) rotateY(0deg); }
                  to { transform: translate(-50%, -50%) rotateY(360deg); }
                }
              </style>
            </head>
            <body>
              <div id='scene'>
                <div class='ring'></div>
                <div class='globe'></div>
              </div>
              <script>
                const hotspots = {
                  'Asia': { x: 72, y: 42 },
                  'Europe': { x: 47, y: 30 },
                  'Africa': { x: 49, y: 58 },
                  'North America': { x: 27, y: 33 },
                  'South America': { x: 34, y: 67 },
                  'Oceania': { x: 82, y: 69 }
                };

                const sceneEl = document.getElementById('scene');
                const markers = {};

                Object.entries(hotspots).forEach(([name, pos]) => {
                  const marker = document.createElement('div');
                  marker.className = 'marker';
                  marker.textContent = name;
                  marker.style.left = pos.x + '%';
                  marker.style.top = pos.y + '%';
                  marker.addEventListener('click', () => {
                    selectContinent(name);
                    if (window.AndroidBridge && window.AndroidBridge.onContinentClick) {
                      window.AndroidBridge.onContinentClick(name);
                    }
                  });
                  sceneEl.appendChild(marker);
                  markers[name] = marker;
                });

                function selectContinent(name) {
                  Object.entries(markers).forEach(([key, marker]) => {
                    if (key === name) marker.classList.add('active');
                    else marker.classList.remove('active');
                  });
                }
                window.selectContinent = selectContinent;
                selectContinent('Asia');
              </script>
            </body>
            </html>
        """.trimIndent()
    }

    override fun onDestroy() {
        super.onDestroy()
        screenJob.cancel()
    }
}
