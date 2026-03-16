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

class HomeRecipeAdapter(
    private var recipes: List<RecipeListItem>,
    private val onItemClick: (RecipeListItem) -> Unit
) : RecyclerView.Adapter<HomeRecipeAdapter.ViewHolder>() {

    class ViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val imgRecipe: ImageView = view.findViewById(R.id.imgRecipeGrid)
        val tvCountry: TextView = view.findViewById(R.id.tvRecipeCountry)
        val tvCategory: TextView = view.findViewById(R.id.tvRecipeCategory)
        val tvDifficulty: TextView = view.findViewById(R.id.tvRecipeDifficultyGrid)
        val tvTitle: TextView = view.findViewById(R.id.tvRecipeTitleGrid)
        val tvDescription: TextView = view.findViewById(R.id.tvRecipeDescription)
        val tvTime: TextView = view.findViewById(R.id.tvRecipeTimeGrid)
        val tvServings: TextView = view.findViewById(R.id.tvRecipeServings)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_recipe_card_grid, parent, false)
        return ViewHolder(view)
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        val recipe = recipes[position]

        holder.tvTitle.text = recipe.name
        holder.tvDescription.text = recipe.description ?: ""
        holder.tvTime.text = "⏱ ${recipe.totalTimeMinutes} min"
        holder.tvServings.text = "👥 ${recipe.defaultServings} servings"
        holder.tvDifficulty.text = recipe.difficultyLevel ?: ""
        holder.tvCategory.text = recipe.categories?.firstOrNull()?.name ?: ""

        val country = recipe.country
        holder.tvCountry.text = buildString {
            country?.flagEmoji?.let { append(it); append(" ") }
            country?.code?.uppercase()?.let { append(it); append(" ") }
            country?.name?.let { append(it) }
        }.trim()

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
