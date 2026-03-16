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
import android.widget.Toast
import com.synchef.mobile.data.AuthRepository
import com.synchef.mobile.data.NetworkModule
import com.synchef.mobile.data.RegisterRequest
import com.synchef.mobile.data.SessionManager
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.launch

class RegisterActivity : Activity() {

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
    private val repository = AuthRepository(NetworkModule.authApi)
    private val screenJob = Job()
    private val uiScope = CoroutineScope(Dispatchers.Main + screenJob)

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_register)

        sessionManager = SessionManager(this)

        val etFullName = findViewById<EditText>(R.id.etFullName)
        val etEmail = findViewById<EditText>(R.id.etEmail)
        val etPassword = findViewById<EditText>(R.id.etPassword)
        val etConfirmPassword = findViewById<EditText>(R.id.etConfirmPassword)
        val spCountry = findViewById<Spinner>(R.id.spCountry)
        val cbTerms = findViewById<CheckBox>(R.id.cbTerms)
        val tvError = findViewById<TextView>(R.id.tvError)
        val btnRegister = findViewById<Button>(R.id.btnRegister)
        val tvGoToLogin = findViewById<TextView>(R.id.tvGoToLogin)
        val btnGoogle = findViewById<Button>(R.id.btnGoogle)
        val btnFacebook = findViewById<Button>(R.id.btnFacebook)

        spCountry.adapter = ArrayAdapter(this, android.R.layout.simple_spinner_dropdown_item, countries)

        btnRegister.setOnClickListener {
            val fullName = etFullName.text.toString().trim()
            val email = etEmail.text.toString().trim()
            val password = etPassword.text.toString().trim()
            val confirmPassword = etConfirmPassword.text.toString().trim()
            val selectedCountry = countries[spCountry.selectedItemPosition]

            tvError.visibility = View.GONE

            if (fullName.isBlank() || email.isBlank() || password.isBlank() || confirmPassword.isBlank()) {
                tvError.text = "All fields are required"
                tvError.visibility = View.VISIBLE
                return@setOnClickListener
            }

            if (!android.util.Patterns.EMAIL_ADDRESS.matcher(email).matches()) {
                tvError.text = "Please enter a valid email address"
                tvError.visibility = View.VISIBLE
                return@setOnClickListener
            }

            if (password.length < 8) {
                tvError.text = "Password must be at least 8 characters"
                tvError.visibility = View.VISIBLE
                return@setOnClickListener
            }

            if (password != confirmPassword) {
                tvError.text = "Passwords do not match"
                tvError.visibility = View.VISIBLE
                return@setOnClickListener
            }

            if (selectedCountry.code.isBlank()) {
                tvError.text = "Please select your country"
                tvError.visibility = View.VISIBLE
                return@setOnClickListener
            }

            if (!cbTerms.isChecked) {
                tvError.text = "You must agree to the terms to continue"
                tvError.visibility = View.VISIBLE
                return@setOnClickListener
            }

            val usernameBase = (email.substringBefore("@").ifBlank {
                fullName.lowercase().replace(" ", "")
            }).replace(Regex("[^a-zA-Z0-9]"), "").take(12)
            val username = "${usernameBase.ifBlank { "chef" }}${(1000..9999).random()}"

            btnRegister.isEnabled = false
            btnRegister.text = "Creating..."

            uiScope.launch {
                val result = repository.register(
                    RegisterRequest(
                        email = email,
                        username = username,
                        password = password,
                        confirmPassword = confirmPassword,
                        fullName = fullName,
                        countryCode = selectedCountry.code,
                        countryName = selectedCountry.name
                    )
                )

                btnRegister.isEnabled = true
                btnRegister.text = "Create Account"

                result.onSuccess { auth ->
                    sessionManager.saveAuth(auth)
                    sessionManager.saveUserCountry(auth.countryCode ?: selectedCountry.code, auth.countryName ?: selectedCountry.name)
                    startActivity(Intent(this@RegisterActivity, DashboardActivity::class.java))
                    finishAffinity()
                }.onFailure { err ->
                    tvError.text = err.message ?: "Registration failed"
                    tvError.visibility = View.VISIBLE
                }
            }
        }

        btnGoogle.setOnClickListener {
            Toast.makeText(this, "Google sign up is not available yet.", Toast.LENGTH_SHORT).show()
        }

        btnFacebook.setOnClickListener {
            Toast.makeText(this, "Facebook sign up is not available yet.", Toast.LENGTH_SHORT).show()
        }

        tvGoToLogin.setOnClickListener {
            finish()
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        screenJob.cancel()
    }
}
