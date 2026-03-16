package com.synchef.mobile

import android.app.Activity
import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.ArrayAdapter
import android.widget.Button
import android.widget.CheckBox
import android.widget.EditText
import android.widget.Spinner
import android.widget.TextView
import com.synchef.mobile.data.ApiClient
import com.synchef.mobile.data.RecipeRepository
import com.synchef.mobile.data.SessionManager
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.launch

class SettingsActivity : Activity() {

    private data class CountryOption(val code: String, val name: String) {
        override fun toString(): String = name
    }

    private val countries = listOf(
        CountryOption("", "Select your country"),
        CountryOption("PH", "Philippines"),
        CountryOption("US", "United States"),
        CountryOption("IT", "Italy"),
        CountryOption("JP", "Japan"),
        CountryOption("TH", "Thailand"),
        CountryOption("IN", "India"),
        CountryOption("FR", "France"),
        CountryOption("ES", "Spain"),
        CountryOption("GB", "United Kingdom"),
        CountryOption("KR", "South Korea"),
        CountryOption("CN", "China"),
        CountryOption("ID", "Indonesia"),
        CountryOption("MX", "Mexico"),
        CountryOption("BR", "Brazil"),
        CountryOption("AU", "Australia")
    )

    private lateinit var sessionManager: SessionManager
    private val repository = RecipeRepository()
    private val screenJob = Job()
    private val uiScope = CoroutineScope(Dispatchers.Main + screenJob)

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_settings)

        sessionManager = SessionManager(this)
        ApiClient.tokenProvider = { sessionManager.getToken() }

        val user = sessionManager.getUser()

        // Account fields — pre-fill from session
        val etFullName = findViewById<EditText>(R.id.etFullName)
        val etEmail = findViewById<EditText>(R.id.etEmail)
        val spCountry = findViewById<Spinner>(R.id.spCountry)
        val etCurrentPassword = findViewById<EditText>(R.id.etCurrentPassword)
        val etNewPassword = findViewById<EditText>(R.id.etNewPassword)
        val etConfirmNewPassword = findViewById<EditText>(R.id.etConfirmNewPassword)
        etFullName.setText(user?.fullName ?: "")
        etEmail.setText(user?.email ?: "")

        spCountry.adapter = ArrayAdapter(this, android.R.layout.simple_spinner_dropdown_item, countries)
        val selectedCountryIndex = countries.indexOfFirst {
            it.code.equals(user?.countryCode ?: "", ignoreCase = true)
        }.coerceAtLeast(0)
        spCountry.setSelection(selectedCountryIndex)

        // Spinners
        val spUnitSystem = findViewById<Spinner>(R.id.spUnitSystem)
        val spSkillLevel = findViewById<Spinner>(R.id.spSkillLevel)
        val units = listOf("Metric (kg, g, ml)", "Imperial (lb, oz, fl oz)")
        val levels = listOf("Beginner", "Intermediate", "Advanced")
        spUnitSystem.adapter = ArrayAdapter(this, android.R.layout.simple_spinner_dropdown_item, units)
        spSkillLevel.adapter = ArrayAdapter(this, android.R.layout.simple_spinner_dropdown_item, levels)

        val unitKeys = listOf("METRIC", "IMPERIAL")
        val levelKeys = listOf("BEGINNER", "INTERMEDIATE", "ADVANCED")
        spUnitSystem.setSelection(unitKeys.indexOf(sessionManager.getUnitSystem()).coerceAtLeast(0))
        spSkillLevel.setSelection(levelKeys.indexOf(sessionManager.getSkillLevel()).coerceAtLeast(0))

        // Notification checkboxes
        val cbReminders = findViewById<CheckBox>(R.id.cbReminders)
        val cbNewRecipes = findViewById<CheckBox>(R.id.cbNewRecipes)
        val cbAchievements = findViewById<CheckBox>(R.id.cbAchievements)
        cbReminders.isChecked = sessionManager.getReminders()
        cbNewRecipes.isChecked = sessionManager.getNotifNewRecipes()
        cbAchievements.isChecked = sessionManager.getNotifAchievements()

        // Save account settings
        findViewById<Button>(R.id.btnSaveAccount).setOnClickListener {
            val name = etFullName.text.toString().trim()
            val email = etEmail.text.toString().trim()
            val country = countries[spCountry.selectedItemPosition]
            if (name.isBlank()) {
                showBanner("Full name is required.", isError = true); return@setOnClickListener
            }
            if (!android.util.Patterns.EMAIL_ADDRESS.matcher(email).matches()) {
                showBanner("Please enter a valid email address.", isError = true); return@setOnClickListener
            }

            uiScope.launch {
                if (country.code.isNotBlank()) {
                    repository.updateCountry(country.code, country.name)
                        .onSuccess {
                            sessionManager.saveUserCountry(country.code, country.name)
                        }
                }
                sessionManager.updateUser {
                    it.copy(
                        fullName = name,
                        email = email,
                        countryCode = if (country.code.isBlank()) it.countryCode else country.code,
                        countryName = if (country.name == "Select your country") it.countryName else country.name
                    )
                }
                showBanner("Account settings saved.", isError = false)
            }
        }

        findViewById<Button>(R.id.btnUpdatePassword).setOnClickListener {
            val current = etCurrentPassword.text.toString().trim()
            val newPassword = etNewPassword.text.toString().trim()
            val confirm = etConfirmNewPassword.text.toString().trim()
            if (current.isBlank() || newPassword.isBlank() || confirm.isBlank()) {
                showBanner("Please fill in all password fields.", isError = true)
                return@setOnClickListener
            }
            if (newPassword.length < 8) {
                showBanner("New password must be at least 8 characters.", isError = true)
                return@setOnClickListener
            }
            if (newPassword != confirm) {
                showBanner("New passwords do not match.", isError = true)
                return@setOnClickListener
            }
            etCurrentPassword.text.clear()
            etNewPassword.text.clear()
            etConfirmNewPassword.text.clear()
            showBanner("Password updated successfully.", isError = false)
        }

        // Save preferences
        findViewById<Button>(R.id.btnSavePrefs).setOnClickListener {
            val selectedUnit = unitKeys.getOrElse(spUnitSystem.selectedItemPosition) { "METRIC" }
            val selectedLevel = levelKeys.getOrElse(spSkillLevel.selectedItemPosition) { "BEGINNER" }
            sessionManager.saveSettings(selectedUnit, selectedLevel, cbReminders.isChecked)
            sessionManager.saveNotificationPrefs(cbNewRecipes.isChecked, cbAchievements.isChecked)
            showBanner("Preferences saved.", isError = false)
        }

        // Navigation
        findViewById<Button>(R.id.btnBack).setOnClickListener { finish() }
        BottomNavHelper.setup(this, BottomNavHelper.TAB_SETTINGS)

        // Logout
        findViewById<Button>(R.id.btnLogout).setOnClickListener {
            sessionManager.clear()
            startActivity(Intent(this, LoginActivity::class.java))
            finishAffinity()
        }
    }

    private fun showBanner(message: String, isError: Boolean) {
        val tvBanner = findViewById<TextView>(R.id.tvBanner)
        tvBanner.text = message
        tvBanner.setBackgroundColor(
            if (isError) getColor(R.color.synchef_red) else getColor(R.color.synchef_green)
        )
        tvBanner.setTextColor(getColor(R.color.white))
        tvBanner.visibility = View.VISIBLE
        tvBanner.postDelayed({ tvBanner.visibility = View.GONE }, 3000L)
    }

    override fun onDestroy() {
        super.onDestroy()
        screenJob.cancel()
    }
}
