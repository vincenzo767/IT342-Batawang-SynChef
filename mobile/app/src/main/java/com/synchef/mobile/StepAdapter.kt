package com.synchef.mobile

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.synchef.mobile.data.RecipeStep

class StepAdapter(
    private val steps: List<RecipeStep>
) : RecyclerView.Adapter<StepAdapter.StepViewHolder>() {

    class StepViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val tvStepNumber: TextView = view.findViewById(R.id.tvStepNumber)
        val tvInstruction: TextView = view.findViewById(R.id.tvStepInstruction)
        val tvTimer: TextView = view.findViewById(R.id.tvStepTimer)
        val tvTemperature: TextView = view.findViewById(R.id.tvStepTemperature)
        val tvTip: TextView = view.findViewById(R.id.tvStepTip)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): StepViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_step, parent, false)
        return StepViewHolder(view)
    }

    override fun onBindViewHolder(holder: StepViewHolder, position: Int) {
        val step = steps[position]
        holder.tvStepNumber.text = step.orderIndex.toString()
        holder.tvInstruction.text = step.instruction

        if (step.hasTimer && (step.timerSeconds ?: 0) > 0) {
            val secs = step.timerSeconds ?: 0
            val m = secs / 60
            val s = secs % 60
            val timeStr = if (m > 0) "${m}m${if (s > 0) " ${s}s" else ""}" else "${s}s"
            holder.tvTimer.text = "⏱ ${step.timerLabel ?: "Timer"} — $timeStr"
            holder.tvTimer.visibility = View.VISIBLE
        } else {
            holder.tvTimer.visibility = View.GONE
        }

        if (!step.temperature.isNullOrBlank()) {
            holder.tvTemperature.text = "🌡 ${step.temperature}"
            holder.tvTemperature.visibility = View.VISIBLE
        } else {
            holder.tvTemperature.visibility = View.GONE
        }

        if (!step.tips.isNullOrBlank()) {
            holder.tvTip.text = "💡 Tip: ${step.tips}"
            holder.tvTip.visibility = View.VISIBLE
        } else {
            holder.tvTip.visibility = View.GONE
        }
    }

    override fun getItemCount() = steps.size
}
