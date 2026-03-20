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
      webView.settings.allowFileAccess = true
      webView.settings.allowContentAccess = true
      webView.settings.allowFileAccessFromFileURLs = true
      webView.settings.allowUniversalAccessFromFileURLs = true
        webView.setBackgroundColor(ContextCompat.getColor(this, android.R.color.transparent))
        webView.webViewClient = WebViewClient()
        webView.addJavascriptInterface(GlobeBridge(), "AndroidBridge")
      webView.loadDataWithBaseURL("file:///android_asset/", globeHtml(), "text/html", "utf-8", null)
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
                #globeCanvas {
                  width: 100%;
                  height: 100%;
                  display: block;
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
                #fallbackMessage {
                  position: absolute;
                  left: 50%;
                  top: 50%;
                  transform: translate(-50%, -50%);
                  color: #e2e8f0;
                  background: rgba(2, 6, 23, 0.72);
                  border: 1px solid rgba(148, 163, 184, 0.4);
                  border-radius: 10px;
                  padding: 8px 10px;
                  font-size: 12px;
                  display: none;
                }
              </style>
            </head>
            <body>
              <div id='scene'>
                <canvas id='globeCanvas'></canvas>
                <div id='fallbackMessage'>3D globe failed to initialize.</div>
              </div>
              <script type='module'>
                import * as THREE from './three/three.module.min.js';
                import { OrbitControls } from './three/OrbitControls.js';

                const sceneEl = document.getElementById('scene');
                const canvas = document.getElementById('globeCanvas');
                const fallbackMessage = document.getElementById('fallbackMessage');
                const markers = {};
                const labelByName = {};

                const hotspotGeo = {
                  'Asia': { latitude: 33, longitude: 95 },
                  'Europe': { latitude: 51, longitude: 15 },
                  'Africa': { latitude: 6, longitude: 20 },
                  'North America': { latitude: 46, longitude: -102 },
                  'South America': { latitude: -18, longitude: -60 },
                  'Oceania': { latitude: -23, longitude: 134 }
                };

                const continentColors = {
                  'Asia': '#ec4899',
                  'Europe': '#f59e0b',
                  'Africa': '#06b6d4',
                  'North America': '#14b8a6',
                  'South America': '#8b5cf6',
                  'Oceania': '#22c55e'
                };

                function showFallback(message) {
                  fallbackMessage.textContent = message || '3D globe failed to initialize.';
                  fallbackMessage.style.display = 'block';
                }

                try {
                  const scene = new THREE.Scene();
                  scene.background = new THREE.Color('#04142e');

                  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
                  camera.position.set(0, 0.2, 2.7);

                  const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: false });
                  renderer.setPixelRatio(window.devicePixelRatio || 1);

                  const controls = new OrbitControls(camera, renderer.domElement);
                  controls.enablePan = false;
                  controls.minDistance = 1.9;
                  controls.maxDistance = 3.6;
                  controls.autoRotate = false;

                  scene.add(new THREE.AmbientLight('#ffffff', 0.92));
                  scene.add(new THREE.HemisphereLight('#e2f3ff', '#1e3a8a', 0.56));
                  const directional = new THREE.DirectionalLight('#ffffff', 1.38);
                  directional.position.set(3.6, 2.4, 3.2);
                  scene.add(directional);
                  const point = new THREE.PointLight('#38bdf8', 0.28);
                  point.position.set(-2.6, -1.1, -3.4);
                  scene.add(point);

                  function toSpherePosition(latitude, longitude, radius) {
                    const phi = (90 - latitude) * (Math.PI / 180);
                    const theta = (longitude + 180) * (Math.PI / 180);
                    const x = -radius * Math.sin(phi) * Math.cos(theta);
                    const y = radius * Math.cos(phi);
                    const z = radius * Math.sin(phi) * Math.sin(theta);
                    return new THREE.Vector3(x, y, z);
                  }

                  const globeGroup = new THREE.Group();
                  scene.add(globeGroup);

                  const textureLoader = new THREE.TextureLoader();
                  const earthMap = textureLoader.load('./textures/planets/earth_atmos_2048.jpg');
                  const earthNormalMap = textureLoader.load('./textures/planets/earth_normal_2048.jpg');
                  const earthSpecularMap = textureLoader.load('./textures/planets/earth_specular_2048.jpg');
                  const cloudMap = textureLoader.load('./textures/planets/earth_clouds_1024.png');

                  earthMap.colorSpace = THREE.SRGBColorSpace;
                  earthSpecularMap.colorSpace = THREE.SRGBColorSpace;
                  cloudMap.colorSpace = THREE.SRGBColorSpace;

                  const earth = new THREE.Mesh(
                    new THREE.SphereGeometry(1, 64, 64),
                    new THREE.MeshPhongMaterial({
                      map: earthMap,
                      normalMap: earthNormalMap,
                      specularMap: earthSpecularMap,
                      specular: new THREE.Color('#dbeafe'),
                      shininess: 22,
                      emissive: new THREE.Color('#102743'),
                      emissiveIntensity: 0.15
                    })
                  );
                  globeGroup.add(earth);

                  const clouds = new THREE.Mesh(
                    new THREE.SphereGeometry(1.018, 64, 64),
                    new THREE.MeshPhongMaterial({
                      map: cloudMap,
                      transparent: true,
                      opacity: 0.25,
                      depthWrite: false,
                      side: THREE.DoubleSide
                    })
                  );
                  globeGroup.add(clouds);

                  const raycaster = new THREE.Raycaster();
                  const pointer = new THREE.Vector2();

                  Object.entries(hotspotGeo).forEach(([name, geo]) => {
                    const color = continentColors[name] || '#22d3ee';
                    const marker = new THREE.Mesh(
                      new THREE.SphereGeometry(0.03, 18, 18),
                      new THREE.MeshBasicMaterial({ color: color })
                    );
                    marker.position.copy(toSpherePosition(geo.latitude, geo.longitude, 1.03));
                    marker.userData.continent = name;
                    globeGroup.add(marker);
                    markers[name] = marker;

                    const label = document.createElement('div');
                    label.className = 'marker';
                    label.textContent = name;
                    label.addEventListener('click', () => {
                      selectContinent(name);
                      if (window.AndroidBridge && window.AndroidBridge.onContinentClick) {
                        window.AndroidBridge.onContinentClick(name);
                      }
                    });
                    sceneEl.appendChild(label);
                    labelByName[name] = label;
                  });

                  renderer.domElement.addEventListener('click', function(event) {
                    const rect = renderer.domElement.getBoundingClientRect();
                    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
                    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
                    raycaster.setFromCamera(pointer, camera);
                    const hitList = raycaster.intersectObjects(Object.values(markers));
                    if (!hitList || hitList.length === 0) return;
                    const name = hitList[0].object.userData.continent;
                    selectContinent(name);
                    if (window.AndroidBridge && window.AndroidBridge.onContinentClick) {
                      window.AndroidBridge.onContinentClick(name);
                    }
                  });

                  function selectContinent(name) {
                    Object.entries(markers).forEach(([continent, marker]) => {
                      const color = continentColors[continent] || '#22d3ee';
                      marker.material.color.set(continent === name ? '#facc15' : color);
                    });
                    Object.entries(labelByName).forEach(([continent, label]) => {
                      if (continent === name) label.classList.add('active');
                      else label.classList.remove('active');
                    });
                  }
                  window.selectContinent = selectContinent;

                  function resize() {
                    const width = sceneEl.clientWidth;
                    const height = sceneEl.clientHeight;
                    if (width <= 0 || height <= 0) return;
                    camera.aspect = width / height;
                    camera.updateProjectionMatrix();
                    renderer.setSize(width, height, false);
                  }

                  function renderLabels() {
                    Object.entries(markers).forEach(([name, marker]) => {
                      const screenPos = marker.position.clone().applyMatrix4(globeGroup.matrixWorld).project(camera);
                      const x = (screenPos.x * 0.5 + 0.5) * sceneEl.clientWidth;
                      const y = (screenPos.y * -0.5 + 0.5) * sceneEl.clientHeight;
                      const label = labelByName[name];
                      label.style.left = x + 'px';
                      label.style.top = y + 'px';
                      label.style.opacity = screenPos.z < 1 ? '1' : '0';
                    });
                  }

                  window.addEventListener('resize', resize);
                  resize();

                  selectContinent('Asia');

                  function animate() {
                    requestAnimationFrame(animate);
                    globeGroup.rotation.y += 0.0012;
                    clouds.rotation.y += 0.0017;
                    controls.update();
                    renderer.render(scene, camera);
                    renderLabels();
                  }

                  animate();
                } catch (err) {
                  showFallback('3D rendering error: ' + (err && err.message ? err.message : 'unknown'));
                }
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
