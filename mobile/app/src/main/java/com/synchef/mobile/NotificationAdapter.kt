package com.synchef.mobile

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.synchef.mobile.data.AppNotification

class NotificationAdapter(
    private var notifications: List<AppNotification>,
    private val onOpen: (AppNotification) -> Unit,
    private val onMarkRead: (AppNotification) -> Unit
) : RecyclerView.Adapter<NotificationAdapter.NotificationViewHolder>() {

    class NotificationViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val title: TextView = view.findViewById(R.id.tvNotifTitle)
        val message: TextView = view.findViewById(R.id.tvNotifMessage)
        val time: TextView = view.findViewById(R.id.tvNotifTime)
        val markRead: Button = view.findViewById(R.id.btnNotifMarkRead)
        val dot: View = view.findViewById(R.id.viewNotifDot)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): NotificationViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_notification, parent, false)
        return NotificationViewHolder(view)
    }

    override fun onBindViewHolder(holder: NotificationViewHolder, position: Int) {
        val notification = notifications[position]
        holder.title.text = if (notification.title.isBlank()) "Chef!" else notification.title
        holder.message.text = notification.message
        holder.time.text = formatRelative(notification.createdAt)

        holder.dot.visibility = if (notification.isRead) View.INVISIBLE else View.VISIBLE
        holder.markRead.visibility = if (notification.isRead) View.GONE else View.VISIBLE

        holder.itemView.setOnClickListener { onOpen(notification) }
        holder.markRead.setOnClickListener { onMarkRead(notification) }
    }

    override fun getItemCount(): Int = notifications.size

    fun update(newNotifications: List<AppNotification>) {
        notifications = newNotifications
        notifyDataSetChanged()
    }

    private fun formatRelative(value: String?): String {
        if (value.isNullOrBlank()) return "now"
        return try {
            val created = java.time.OffsetDateTime.parse(value).toInstant().toEpochMilli()
            val diffMs = kotlin.math.max(0L, System.currentTimeMillis() - created)
            val minutes = diffMs / 60000
            when {
                minutes < 1 -> "now"
                minutes < 60 -> "${minutes}m ago"
                minutes < 1440 -> "${minutes / 60}h ago"
                else -> "${minutes / 1440}d ago"
            }
        } catch (_: Exception) {
            "now"
        }
    }
}
