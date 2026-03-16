package com.synchef.mobile

import android.app.Activity
import android.content.Intent
import android.os.Bundle
import android.text.SpannableString
import android.text.Spanned
import android.text.style.ForegroundColorSpan
import android.widget.Button
import android.widget.TextView
import androidx.core.content.ContextCompat
import com.synchef.mobile.data.ApiClient
import com.synchef.mobile.data.SessionManager

class HomeActivity : Activity() {

    private lateinit var sessionManager: SessionManager

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

        findViewById<Button>(R.id.btnLogin).setOnClickListener {
            startActivity(Intent(this, LoginActivity::class.java))
        }

        findViewById<Button>(R.id.btnSignUp).setOnClickListener {
            startActivity(Intent(this, RegisterActivity::class.java))
        }
    }
}
