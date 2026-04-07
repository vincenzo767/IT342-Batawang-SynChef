package com.synchef.mobile

import android.app.Activity
import android.os.Bundle
import android.view.View
import android.widget.Button
import android.widget.ImageButton
import android.widget.TextView
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.synchef.mobile.data.ApiClient
import com.synchef.mobile.data.AppNotification
import com.synchef.mobile.data.RecipeRepository
import com.synchef.mobile.data.SessionManager
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

class NotificationActivity : Activity() {

    private lateinit var sessionManager: SessionManager
    private val repository = RecipeRepository()
    private val screenJob = Job()
    private val uiScope = CoroutineScope(Dispatchers.Main + screenJob)

    private lateinit var adapter: NotificationAdapter
    private lateinit var tvStatus: TextView
    private lateinit var tvAllBadge: TextView

    private var notifications: List<AppNotification> = emptyList()
    private var tab: String = "all"
    private var pollJob: Job? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_notification)

        sessionManager = SessionManager(this)
        ApiClient.tokenProvider = { sessionManager.getToken() }

        tvStatus = findViewById(R.id.tvNotificationStatus)
        tvAllBadge = findViewById(R.id.tvAllCount)

        findViewById<ImageButton>(R.id.btnNotifBack).setOnClickListener { finish() }
        findViewById<Button>(R.id.btnMarkAllRead).setOnClickListener { markAllAsRead() }

        val btnAll = findViewById<Button>(R.id.btnNotifTabAll)
        val btnUnread = findViewById<Button>(R.id.btnNotifTabUnread)
        btnAll.setOnClickListener {
            tab = "all"
            updateTabState(btnAll, btnUnread)
            renderList()
        }
        btnUnread.setOnClickListener {
            tab = "unread"
            updateTabState(btnAll, btnUnread)
            renderList()
        }

        val recycler = findViewById<RecyclerView>(R.id.rvNotifications)
        adapter = NotificationAdapter(emptyList(),
            onOpen = { notification ->
                if (!notification.isRead) {
                    markAsRead(notification.id)
                }
            },
            onMarkRead = { notification ->
                markAsRead(notification.id)
            }
        )
        recycler.layoutManager = LinearLayoutManager(this)
        recycler.adapter = adapter

        updateTabState(btnAll, btnUnread)
        fetchNotifications()
    }

    override fun onResume() {
        super.onResume()
        startPolling()
    }

    override fun onPause() {
        super.onPause()
        stopPolling()
    }

    override fun onDestroy() {
        super.onDestroy()
        screenJob.cancel()
    }

    private fun updateTabState(btnAll: Button, btnUnread: Button) {
        val activeColor = android.graphics.Color.parseColor("#FFFFFF")
        val inactiveColor = android.graphics.Color.parseColor("#D7DBE3")

        btnAll.isSelected = tab == "all"
        btnUnread.isSelected = tab == "unread"
        btnAll.setTextColor(if (tab == "all") activeColor else inactiveColor)
        btnUnread.setTextColor(if (tab == "unread") activeColor else inactiveColor)
    }

    private fun fetchNotifications() {
        tvStatus.visibility = View.VISIBLE
        tvStatus.text = "Loading notifications..."

        uiScope.launch {
            repository.getNotifications(false)
                .onSuccess {
                    notifications = it
                    renderList()
                }
                .onFailure { err ->
                    tvStatus.visibility = View.VISIBLE
                    tvStatus.text = err.message ?: "Failed to load notifications"
                }
        }
    }

    private fun renderList() {
        val unreadCount = notifications.count { !it.isRead }
        tvAllBadge.text = unreadCount.toString()
        tvAllBadge.visibility = if (unreadCount > 0) View.VISIBLE else View.GONE

        val shown = if (tab == "unread") notifications.filter { !it.isRead } else notifications
        adapter.update(shown)
        tvStatus.visibility = if (shown.isEmpty()) View.VISIBLE else View.GONE
        tvStatus.text = if (shown.isEmpty()) "No notifications" else ""
    }

    private fun markAsRead(id: Long) {
        uiScope.launch {
            repository.markNotificationAsRead(id)
                .onSuccess {
                    notifications = notifications.map { n -> if (n.id == id) n.copy(isRead = true) else n }
                    renderList()
                }
                .onFailure {
                    // noop
                }
        }
    }

    private fun markAllAsRead() {
        uiScope.launch {
            repository.markAllNotificationsAsRead()
                .onSuccess {
                    notifications = notifications.map { it.copy(isRead = true) }
                    renderList()
                }
                .onFailure {
                    // noop
                }
        }
    }

    private fun startPolling() {
        stopPolling()
        pollJob = uiScope.launch {
            while (true) {
                delay(3000)
                repository.getNotifications(false)
                    .onSuccess {
                        notifications = it
                        renderList()
                    }
            }
        }
    }

    private fun stopPolling() {
        pollJob?.cancel()
        pollJob = null
    }
}
