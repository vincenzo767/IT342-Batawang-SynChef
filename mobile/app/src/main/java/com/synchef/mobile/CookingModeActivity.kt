package com.synchef.mobile

import android.app.Activity
import android.graphics.Color
import android.os.Bundle
import android.os.CountDownTimer
import android.view.Gravity
import android.view.View
import android.widget.Button
import android.widget.LinearLayout
import android.widget.TextView
import com.synchef.mobile.data.ApiClient
import com.synchef.mobile.data.RecipeDetail
import com.synchef.mobile.data.RecipeRepository
import com.synchef.mobile.data.SessionManager
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.launch

class CookingModeActivity : Activity() {

    companion object {
        const val EXTRA_RECIPE_ID = "recipe_id"
        const val EXTRA_SERVINGS = "servings"
    }

    private val repository = RecipeRepository()
    private val screenJob = Job()
    private val uiScope = CoroutineScope(Dispatchers.Main + screenJob)

    private var currentStepIndex = 0
    private var recipe: RecipeDetail? = null
    private var countDownTimer: CountDownTimer? = null
    private var timerRunning = false
    private var remainingMillis = 0L

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_cooking_mode)

        val session = SessionManager(this)
        ApiClient.tokenProvider = { session.getToken() }

        val recipeId = intent.getLongExtra(EXTRA_RECIPE_ID, -1L)
        if (recipeId < 0) { finish(); return }

        findViewById<Button>(R.id.btnBack).setOnClickListener { finish() }
        findViewById<Button>(R.id.btnPrev).setOnClickListener { navigateStep(-1) }
        findViewById<Button>(R.id.btnNext).setOnClickListener { navigateStep(1) }
        findViewById<Button>(R.id.btnStartTimer).setOnClickListener { startTimer() }
        findViewById<Button>(R.id.btnPauseTimer).setOnClickListener { pauseOrResumeTimer() }

        loadRecipe(recipeId)
    }

    private fun loadRecipe(recipeId: Long) {
        uiScope.launch {
            repository.getRecipeByIdWithFallback(this@CookingModeActivity, recipeId).onSuccess { r ->
                recipe = r
                if (r.steps.isEmpty()) {
                    finish()
                    return@onSuccess
                }
                currentStepIndex = 0
                buildDots()
                showStep()
            }.onFailure {
                finish()
            }
        }
    }

    private fun buildDots() {
        val r = recipe ?: return
        val llDots = findViewById<LinearLayout>(R.id.llDots)
        llDots.removeAllViews()
        val size = resources.getDimensionPixelSize(android.R.dimen.app_icon_size) / 4
        val margin = resources.getDimensionPixelSize(android.R.dimen.app_icon_size) / 8

        r.steps.forEachIndexed { idx, _ ->
            val dot = View(this)
            val params = LinearLayout.LayoutParams(size, size).apply {
                setMargins(margin, 0, margin, 0)
                gravity = Gravity.CENTER_VERTICAL
            }
            dot.layoutParams = params
            dot.setBackgroundResource(R.drawable.bg_step_number)
            dot.alpha = if (idx == currentStepIndex) 1f else 0.35f
            llDots.addView(dot)
        }
    }

    private fun updateDots() {
        val llDots = findViewById<LinearLayout>(R.id.llDots)
        for (i in 0 until llDots.childCount) {
            llDots.getChildAt(i).alpha = if (i == currentStepIndex) 1f else 0.35f
        }
    }

    private fun showStep() {
        val r = recipe ?: return
        val steps = r.steps.sortedBy { it.orderIndex }
        val step = steps.getOrNull(currentStepIndex) ?: return

        // Reset timer on step change
        countDownTimer?.cancel()
        timerRunning = false
        remainingMillis = ((step.timerSeconds ?: 0) * 1000L)

        // Header
        findViewById<TextView>(R.id.tvCookingTitle).text = r.name
        findViewById<TextView>(R.id.tvStepProgress).text = "${currentStepIndex + 1}/${steps.size}"

        // Step content
        findViewById<TextView>(R.id.tvStepNumber).text = step.orderIndex.toString()
        findViewById<TextView>(R.id.tvStepInstruction).text = step.instruction

        // Temperature
        val tvTemperature = findViewById<TextView>(R.id.tvCookingTemperature)
        if (!step.temperature.isNullOrBlank()) {
            tvTemperature.text = "🌡 ${step.temperature}"
            tvTemperature.visibility = View.VISIBLE
        } else {
            tvTemperature.visibility = View.GONE
        }

        // Tip
        val tipSection = findViewById<LinearLayout>(R.id.tipSection)
        val tvTip = findViewById<TextView>(R.id.tvStepTip)
        if (!step.tips.isNullOrBlank()) {
            tvTip.text = step.tips
            tipSection.visibility = View.VISIBLE
        } else {
            tipSection.visibility = View.GONE
        }

        // Timer
        val timerSection = findViewById<LinearLayout>(R.id.timerSection)
        if (step.hasTimer && (step.timerSeconds ?: 0) > 0) {
            timerSection.visibility = View.VISIBLE
            val tvLabel = findViewById<TextView>(R.id.tvTimerLabel)
            tvLabel.text = step.timerLabel ?: "Timer"
            updateTimerDisplay(remainingMillis)
            // Show start, hide pause
            findViewById<Button>(R.id.btnStartTimer).visibility = View.VISIBLE
            findViewById<Button>(R.id.btnPauseTimer).visibility = View.GONE
        } else {
            timerSection.visibility = View.GONE
        }

        // Navigation buttons
        val btnPrev = findViewById<Button>(R.id.btnPrev)
        val btnNext = findViewById<Button>(R.id.btnNext)
        btnPrev.isEnabled = currentStepIndex > 0
        btnPrev.alpha = if (currentStepIndex > 0) 1f else 0.4f

        val isLast = currentStepIndex == steps.size - 1
        btnNext.text = if (isLast) "Finish" else "Next"

        updateDots()
    }

    private fun navigateStep(direction: Int) {
        val r = recipe ?: return
        val newIndex = currentStepIndex + direction
        if (newIndex < 0 || newIndex >= r.steps.size) {
            if (direction > 0 && newIndex >= r.steps.size) finish()
            return
        }
        currentStepIndex = newIndex
        showStep()
    }

    private fun startTimer() {
        countDownTimer?.cancel()
        timerRunning = true
        if (remainingMillis <= 0) return

        countDownTimer = object : CountDownTimer(remainingMillis, 1000L) {
            override fun onTick(millisUntilFinished: Long) {
                remainingMillis = millisUntilFinished
                updateTimerDisplay(millisUntilFinished)
            }

            override fun onFinish() {
                remainingMillis = 0
                updateTimerDisplay(0)
                timerRunning = false
                findViewById<Button>(R.id.btnStartTimer).visibility = View.VISIBLE
                findViewById<Button>(R.id.btnPauseTimer).visibility = View.GONE
                val tvDisplay = findViewById<TextView>(R.id.tvTimerDisplay)
                tvDisplay.text = "Done!"
            }
        }.start()

        findViewById<Button>(R.id.btnStartTimer).visibility = View.GONE
        findViewById<Button>(R.id.btnPauseTimer).apply {
            text = "Pause"
            visibility = View.VISIBLE
        }
    }

    private fun pauseOrResumeTimer() {
        val btnPause = findViewById<Button>(R.id.btnPauseTimer)
        if (timerRunning) {
            // Pause
            countDownTimer?.cancel()
            timerRunning = false
            btnPause.text = "Resume"
        } else {
            // Resume
            startTimer()
            btnPause.text = "Pause"
        }
    }

    private fun updateTimerDisplay(millis: Long) {
        val totalSecs = millis / 1000
        val mins = totalSecs / 60
        val secs = totalSecs % 60
        val timeStr = "%d:%02d".format(mins, secs)
        findViewById<TextView>(R.id.tvTimerDisplay).text = timeStr
    }

    override fun onDestroy() {
        super.onDestroy()
        countDownTimer?.cancel()
        screenJob.cancel()
    }
}
