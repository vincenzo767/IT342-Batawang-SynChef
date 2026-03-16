package com.synchef.mobile

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.bumptech.glide.Glide
import com.synchef.mobile.data.ImageUrlResolver
import com.synchef.mobile.data.RecipeListItem

class RecipeAdapter(
    private var recipes: List<RecipeListItem>,
    private val onItemClick: (RecipeListItem) -> Unit
) : RecyclerView.Adapter<RecipeAdapter.RecipeViewHolder>() {

    class RecipeViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val imgRecipe: ImageView = view.findViewById(R.id.imgRecipe)
        val tvTitle: TextView = view.findViewById(R.id.tvRecipeTitle)
        val tvMeta: TextView = view.findViewById(R.id.tvRecipeMeta)
        val tvTime: TextView = view.findViewById(R.id.tvRecipeTime)
        val tvDifficulty: TextView = view.findViewById(R.id.tvRecipeDifficulty)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): RecipeViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_recipe_card, parent, false)
        return RecipeViewHolder(view)
    }

    override fun onBindViewHolder(holder: RecipeViewHolder, position: Int) {
        val recipe = recipes[position]
        holder.tvTitle.text = recipe.name

        val metaParts = mutableListOf<String>()
        recipe.country?.name?.let { metaParts.add(it) }
        recipe.country?.continent?.let { metaParts.add(it) }
        recipe.categories?.firstOrNull()?.name?.let { metaParts.add(it) }
        holder.tvMeta.text = metaParts.joinToString(" • ")

        holder.tvTime.text = "${recipe.totalTimeMinutes} min"
        holder.tvDifficulty.text = recipe.difficultyLevel ?: ""

        val resolvedImageUrl = ImageUrlResolver.resolve(recipe.imageUrl)
        if (!resolvedImageUrl.isNullOrBlank()) {
            Glide.with(holder.itemView.context)
            .load(resolvedImageUrl)
                .placeholder(android.R.drawable.ic_menu_gallery)
                .error(android.R.drawable.ic_menu_gallery)
                .centerCrop()
                .into(holder.imgRecipe)
        } else {
            holder.imgRecipe.setImageResource(android.R.drawable.ic_menu_gallery)
        }

        holder.itemView.setOnClickListener { onItemClick(recipe) }
    }

    override fun getItemCount() = recipes.size

    fun updateRecipes(newRecipes: List<RecipeListItem>) {
        recipes = newRecipes
        notifyDataSetChanged()
    }
}
