package com.synchef.mobile

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.synchef.mobile.data.RecipeIngredient

class IngredientAdapter(
    private val ingredients: List<RecipeIngredient>,
    private var currentServings: Int,
    private val defaultServings: Int
) : RecyclerView.Adapter<IngredientAdapter.IngredientViewHolder>() {

    class IngredientViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val tvAmount: TextView = view.findViewById(R.id.tvIngredientAmount)
        val tvName: TextView = view.findViewById(R.id.tvIngredientName)
        val tvOptional: TextView = view.findViewById(R.id.tvOptional)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): IngredientViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_ingredient, parent, false)
        return IngredientViewHolder(view)
    }

    override fun onBindViewHolder(holder: IngredientViewHolder, position: Int) {
        val ing = ingredients[position]
        val scale = if (defaultServings > 0) currentServings.toDouble() / defaultServings else 1.0
        val scaledQty = ing.quantity?.let {
            val raw = it * scale
            if (raw == raw.toLong().toDouble()) raw.toLong().toString() else "%.1f".format(raw)
        }

        val amountText = buildString {
            scaledQty?.let { append(it) }
            ing.unit?.let { u -> if (u.isNotBlank()) { if (isNotEmpty()) append(" "); append(u) } }
        }
        holder.tvAmount.text = amountText

        val nameText = buildString {
            append(ing.ingredient?.name ?: "")
            ing.preparation?.let { p -> if (p.isNotBlank()) append(", $p") }
        }
        holder.tvName.text = nameText
        holder.tvOptional.visibility = if (ing.isOptional) View.VISIBLE else View.GONE
    }

    override fun getItemCount() = ingredients.size

    fun updateServings(servings: Int) {
        currentServings = servings
        notifyDataSetChanged()
    }
}
