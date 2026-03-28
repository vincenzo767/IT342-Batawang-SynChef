package com.synchef.mobile

import android.app.Activity
import android.content.Intent
import android.view.View
import android.view.ViewGroup
import android.view.animation.DecelerateInterpolator
import android.widget.ImageView
import androidx.core.content.ContextCompat

object BottomNavHelper {

    const val TAB_HOME = "home"
    const val TAB_FLAVOR = "flavor"
    const val TAB_SYNCOOK = "syncook"
    const val TAB_PROFILE = "profile"
    const val TAB_SETTINGS = "settings"
    private const val CONTENT_ENTER_DURATION_MS = 280L
    private const val CONTENT_ENTER_STAGGER_MS = 35L

    fun setup(activity: Activity, selectedTab: String) {
        val home = activity.findViewById<View>(R.id.navHome)
        val flavor = activity.findViewById<View>(R.id.navFlavor)
        val synCook = activity.findViewById<View>(R.id.navSynCook)
        val profile = activity.findViewById<View>(R.id.navProfile)
        val settings = activity.findViewById<View>(R.id.navSettings)

        val tabs = mapOf(
            home to TAB_HOME,
            flavor to TAB_FLAVOR,
            synCook to TAB_SYNCOOK,
            profile to TAB_PROFILE,
            settings to TAB_SETTINGS
        )

        tabs.forEach { (view, tabId) ->
            val isSelected = tabId == selectedTab
            view.isSelected = isSelected
            view.alpha = if (isSelected) 1f else 0.75f

            if (view is ImageView) {
                val tint = if (isSelected) {
                    ContextCompat.getColor(activity, R.color.white)
                } else {
                    ContextCompat.getColor(activity, R.color.synchef_orange)
                }
                view.setColorFilter(tint)
            }
        }

        animatePageContentOnly(home)

        home.setOnClickListener {
            if (selectedTab != TAB_HOME) {
                navigateTo(activity, DashboardActivity::class.java)
            }
        }

        flavor.setOnClickListener {
            if (selectedTab != TAB_FLAVOR) {
                navigateTo(activity, FlavorMapActivity::class.java)
            }
        }

        synCook.setOnClickListener {
            if (selectedTab != TAB_SYNCOOK) {
                navigateTo(activity, SynCookActivity::class.java)
            }
        }

        profile.setOnClickListener {
            if (selectedTab != TAB_PROFILE) {
                navigateTo(activity, ProfileActivity::class.java)
            }
        }

        settings.setOnClickListener {
            if (selectedTab != TAB_SETTINGS) {
                navigateTo(activity, SettingsActivity::class.java)
            }
        }
    }

    private fun navigateTo(activity: Activity, target: Class<*>) {
        activity.startActivity(Intent(activity, target))
        // Disable window-level animation so the nav bar appears fixed across tabs.
        activity.overridePendingTransition(0, 0)
        activity.finish()
    }

    private fun animatePageContentOnly(navHomeView: View) {
        val navContainer = navHomeView.parent as? View ?: return
        val contentFrame = navHomeView.rootView.findViewById<ViewGroup>(android.R.id.content) ?: return
        val screenRoot = contentFrame.getChildAt(0) as? ViewGroup ?: return
        if (navContainer.parent != screenRoot) return

        val contentChildren = mutableListOf<View>()
        for (index in 0 until screenRoot.childCount) {
            val child = screenRoot.getChildAt(index)
            if (child !== navContainer) {
                contentChildren.add(child)
            }
        }

        if (contentChildren.isEmpty()) return

        contentChildren.forEachIndexed { index, child ->
            child.alpha = 0f
            child.translationY = 22f
            child.animate()
                .alpha(1f)
                .translationY(0f)
                .setStartDelay(index * CONTENT_ENTER_STAGGER_MS)
                .setDuration(CONTENT_ENTER_DURATION_MS)
                .setInterpolator(DecelerateInterpolator())
                .start()
        }
    }
}
