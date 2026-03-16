package com.synchef.mobile

import android.app.Activity
import android.content.Intent
import android.widget.TextView

object BottomNavHelper {

    const val TAB_HOME = "home"
    const val TAB_FLAVOR = "flavor"
    const val TAB_PROFILE = "profile"
    const val TAB_SETTINGS = "settings"

    fun setup(activity: Activity, selectedTab: String) {
        val home = activity.findViewById<TextView>(R.id.navHome)
        val flavor = activity.findViewById<TextView>(R.id.navFlavor)
        val profile = activity.findViewById<TextView>(R.id.navProfile)
        val settings = activity.findViewById<TextView>(R.id.navSettings)

        val tabs = mapOf(
            home to TAB_HOME,
            flavor to TAB_FLAVOR,
            profile to TAB_PROFILE,
            settings to TAB_SETTINGS
        )

        tabs.forEach { (view, tabId) ->
            val isSelected = tabId == selectedTab
            view.isSelected = isSelected
            view.alpha = if (isSelected) 1f else 0.75f
        }

        home.setOnClickListener {
            if (selectedTab != TAB_HOME) {
                activity.startActivity(Intent(activity, DashboardActivity::class.java))
                activity.finish()
            }
        }

        flavor.setOnClickListener {
            if (selectedTab != TAB_FLAVOR) {
                activity.startActivity(Intent(activity, FlavorMapActivity::class.java))
                activity.finish()
            }
        }

        profile.setOnClickListener {
            if (selectedTab != TAB_PROFILE) {
                activity.startActivity(Intent(activity, ProfileActivity::class.java))
                activity.finish()
            }
        }

        settings.setOnClickListener {
            if (selectedTab != TAB_SETTINGS) {
                activity.startActivity(Intent(activity, SettingsActivity::class.java))
                activity.finish()
            }
        }
    }
}
