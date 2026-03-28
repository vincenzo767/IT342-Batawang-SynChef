package com.synchef.mobile

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.ImageView
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.bumptech.glide.Glide
import com.synchef.mobile.data.SynCookRecipe

class SynCookRecipeAdapter(
    private var recipes: List<SynCookRecipe>,
    private val showOwnerActions: Boolean,
    private val onView: (SynCookRecipe) -> Unit,
    private val onEdit: (SynCookRecipe) -> Unit,
    private val onDelete: (SynCookRecipe) -> Unit
) : RecyclerView.Adapter<SynCookRecipeAdapter.ViewHolder>() {

    class ViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val image: ImageView = view.findViewById(R.id.imgSynCook)
        val title: TextView = view.findViewById(R.id.tvSynCookTitle)
        val meta: TextView = view.findViewById(R.id.tvSynCookMeta)
        val comments: TextView = view.findViewById(R.id.tvSynCookComments)
        val btnView: Button = view.findViewById(R.id.btnSynCookView)
        val btnEdit: Button = view.findViewById(R.id.btnSynCookEdit)
        val btnDelete: Button = view.findViewById(R.id.btnSynCookDelete)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_syncook_recipe, parent, false)
        return ViewHolder(view)
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        val recipe = recipes[position]
        holder.title.text = recipe.title
        holder.meta.text = "${recipe.country} • ${recipe.ownerName}"
        holder.comments.text = "${recipe.commentCount} comments"

        val fallback = "https://images.unsplash.com/photo-1547592180-85f173990554?w=1200&q=80"
        Glide.with(holder.itemView.context)
            .load(recipe.imageUrl ?: fallback)
            .centerCrop()
            .into(holder.image)

        holder.btnView.setOnClickListener { onView(recipe) }

        if (showOwnerActions) {
            holder.btnEdit.visibility = View.VISIBLE
            holder.btnDelete.visibility = View.VISIBLE
            holder.btnEdit.setOnClickListener { onEdit(recipe) }
            holder.btnDelete.setOnClickListener { onDelete(recipe) }
        } else {
            holder.btnEdit.visibility = View.GONE
            holder.btnDelete.visibility = View.GONE
        }
    }

    override fun getItemCount(): Int = recipes.size

    fun updateRecipes(newRecipes: List<SynCookRecipe>) {
        recipes = newRecipes
        notifyDataSetChanged()
    }
}
