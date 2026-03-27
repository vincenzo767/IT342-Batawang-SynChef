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
        CountryOption("AF", "Afghanistan"), CountryOption("AL", "Albania"), CountryOption("DZ", "Algeria"),
        CountryOption("AD", "Andorra"), CountryOption("AO", "Angola"), CountryOption("AG", "Antigua and Barbuda"),
        CountryOption("AR", "Argentina"), CountryOption("AM", "Armenia"), CountryOption("AU", "Australia"),
        CountryOption("AT", "Austria"), CountryOption("AZ", "Azerbaijan"), CountryOption("BS", "Bahamas"),
        CountryOption("BH", "Bahrain"), CountryOption("BD", "Bangladesh"), CountryOption("BB", "Barbados"),
        CountryOption("BY", "Belarus"), CountryOption("BE", "Belgium"), CountryOption("BZ", "Belize"),
        CountryOption("BJ", "Benin"), CountryOption("BT", "Bhutan"), CountryOption("BO", "Bolivia"),
        CountryOption("BA", "Bosnia and Herzegovina"), CountryOption("BW", "Botswana"), CountryOption("BR", "Brazil"),
        CountryOption("BN", "Brunei"), CountryOption("BG", "Bulgaria"), CountryOption("BF", "Burkina Faso"),
        CountryOption("BI", "Burundi"), CountryOption("CV", "Cabo Verde"), CountryOption("KH", "Cambodia"),
        CountryOption("CM", "Cameroon"), CountryOption("CA", "Canada"), CountryOption("CF", "Central African Republic"),
        CountryOption("TD", "Chad"), CountryOption("CL", "Chile"), CountryOption("CN", "China"),
        CountryOption("CO", "Colombia"), CountryOption("KM", "Comoros"), CountryOption("CG", "Congo"),
        CountryOption("CD", "Congo (DRC)"), CountryOption("CR", "Costa Rica"), CountryOption("HR", "Croatia"),
        CountryOption("CU", "Cuba"), CountryOption("CY", "Cyprus"), CountryOption("CZ", "Czech Republic"),
        CountryOption("DK", "Denmark"), CountryOption("DJ", "Djibouti"), CountryOption("DM", "Dominica"),
        CountryOption("DO", "Dominican Republic"), CountryOption("EC", "Ecuador"), CountryOption("EG", "Egypt"),
        CountryOption("SV", "El Salvador"), CountryOption("GQ", "Equatorial Guinea"), CountryOption("ER", "Eritrea"),
        CountryOption("EE", "Estonia"), CountryOption("SZ", "Eswatini"), CountryOption("ET", "Ethiopia"),
        CountryOption("FJ", "Fiji"), CountryOption("FI", "Finland"), CountryOption("FR", "France"),
        CountryOption("GA", "Gabon"), CountryOption("GM", "Gambia"), CountryOption("GE", "Georgia"),
        CountryOption("DE", "Germany"), CountryOption("GH", "Ghana"), CountryOption("GR", "Greece"),
        CountryOption("GD", "Grenada"), CountryOption("GT", "Guatemala"), CountryOption("GN", "Guinea"),
        CountryOption("GW", "Guinea-Bissau"), CountryOption("GY", "Guyana"), CountryOption("HT", "Haiti"),
        CountryOption("HN", "Honduras"), CountryOption("HU", "Hungary"), CountryOption("IS", "Iceland"),
        CountryOption("IN", "India"), CountryOption("ID", "Indonesia"), CountryOption("IR", "Iran"),
        CountryOption("IQ", "Iraq"), CountryOption("IE", "Ireland"), CountryOption("IL", "Israel"),
        CountryOption("IT", "Italy"), CountryOption("JM", "Jamaica"), CountryOption("JP", "Japan"),
        CountryOption("JO", "Jordan"), CountryOption("KZ", "Kazakhstan"), CountryOption("KE", "Kenya"),
        CountryOption("KI", "Kiribati"), CountryOption("KP", "North Korea"), CountryOption("KR", "South Korea"),
        CountryOption("KW", "Kuwait"), CountryOption("KG", "Kyrgyzstan"), CountryOption("LA", "Laos"),
        CountryOption("LV", "Latvia"), CountryOption("LB", "Lebanon"), CountryOption("LS", "Lesotho"),
        CountryOption("LR", "Liberia"), CountryOption("LY", "Libya"), CountryOption("LI", "Liechtenstein"),
        CountryOption("LT", "Lithuania"), CountryOption("LU", "Luxembourg"), CountryOption("MG", "Madagascar"),
        CountryOption("MW", "Malawi"), CountryOption("MY", "Malaysia"), CountryOption("MV", "Maldives"),
        CountryOption("ML", "Mali"), CountryOption("MT", "Malta"), CountryOption("MH", "Marshall Islands"),
        CountryOption("MR", "Mauritania"), CountryOption("MU", "Mauritius"), CountryOption("MX", "Mexico"),
        CountryOption("FM", "Micronesia"), CountryOption("MD", "Moldova"), CountryOption("MC", "Monaco"),
        CountryOption("MN", "Mongolia"), CountryOption("ME", "Montenegro"), CountryOption("MA", "Morocco"),
        CountryOption("MZ", "Mozambique"), CountryOption("MM", "Myanmar"), CountryOption("NA", "Namibia"),
        CountryOption("NR", "Nauru"), CountryOption("NP", "Nepal"), CountryOption("NL", "Netherlands"),
        CountryOption("NZ", "New Zealand"), CountryOption("NI", "Nicaragua"), CountryOption("NE", "Niger"),
        CountryOption("NG", "Nigeria"), CountryOption("MK", "North Macedonia"), CountryOption("NO", "Norway"),
        CountryOption("OM", "Oman"), CountryOption("PK", "Pakistan"), CountryOption("PW", "Palau"),
        CountryOption("PA", "Panama"), CountryOption("PG", "Papua New Guinea"), CountryOption("PY", "Paraguay"),
        CountryOption("PE", "Peru"), CountryOption("PH", "Philippines"), CountryOption("PL", "Poland"),
        CountryOption("PT", "Portugal"), CountryOption("QA", "Qatar"), CountryOption("RO", "Romania"),
        CountryOption("RU", "Russia"), CountryOption("RW", "Rwanda"), CountryOption("KN", "Saint Kitts and Nevis"),
        CountryOption("LC", "Saint Lucia"), CountryOption("VC", "Saint Vincent and the Grenadines"),
        CountryOption("WS", "Samoa"), CountryOption("SM", "San Marino"), CountryOption("ST", "São Tomé and Príncipe"),
        CountryOption("SA", "Saudi Arabia"), CountryOption("SN", "Senegal"), CountryOption("RS", "Serbia"),
        CountryOption("SC", "Seychelles"), CountryOption("SL", "Sierra Leone"), CountryOption("SG", "Singapore"),
        CountryOption("SK", "Slovakia"), CountryOption("SI", "Slovenia"), CountryOption("SB", "Solomon Islands"),
        CountryOption("SO", "Somalia"), CountryOption("ZA", "South Africa"), CountryOption("SS", "South Sudan"),
        CountryOption("ES", "Spain"), CountryOption("LK", "Sri Lanka"), CountryOption("SD", "Sudan"),
        CountryOption("SR", "Suriname"), CountryOption("SE", "Sweden"), CountryOption("CH", "Switzerland"),
        CountryOption("SY", "Syria"), CountryOption("TW", "Taiwan"), CountryOption("TJ", "Tajikistan"),
        CountryOption("TZ", "Tanzania"), CountryOption("TH", "Thailand"), CountryOption("TL", "Timor-Leste"),
        CountryOption("TG", "Togo"), CountryOption("TO", "Tonga"), CountryOption("TT", "Trinidad and Tobago"),
        CountryOption("TN", "Tunisia"), CountryOption("TR", "Turkey"), CountryOption("TM", "Turkmenistan"),
        CountryOption("TV", "Tuvalu"), CountryOption("UG", "Uganda"), CountryOption("UA", "Ukraine"),
        CountryOption("AE", "United Arab Emirates"), CountryOption("GB", "United Kingdom"),
        CountryOption("US", "United States"), CountryOption("UY", "Uruguay"), CountryOption("UZ", "Uzbekistan"),
        CountryOption("VU", "Vanuatu"), CountryOption("VE", "Venezuela"), CountryOption("VN", "Vietnam"),
        CountryOption("YE", "Yemen"), CountryOption("ZM", "Zambia"), CountryOption("ZW", "Zimbabwe")
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
