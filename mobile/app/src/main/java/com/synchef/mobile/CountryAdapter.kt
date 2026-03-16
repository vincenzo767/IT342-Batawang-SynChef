package com.synchef.mobile

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.synchef.mobile.data.CountryInfo

class CountryAdapter(
    private var countries: List<CountryInfo>,
    private val onItemClick: (CountryInfo) -> Unit
) : RecyclerView.Adapter<CountryAdapter.CountryViewHolder>() {

    class CountryViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val tvCountryName: TextView = view.findViewById(R.id.tvCountryName)
        val tvCountryMeta: TextView = view.findViewById(R.id.tvCountryMeta)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): CountryViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_country_card, parent, false)
        return CountryViewHolder(view)
    }

    override fun onBindViewHolder(holder: CountryViewHolder, position: Int) {
        val country = countries[position]
        holder.tvCountryName.text = buildString {
            if (!country.flagEmoji.isNullOrBlank()) append("${country.flagEmoji} ")
            append(country.name ?: "Unknown")
        }
        holder.tvCountryMeta.text = listOfNotNull(
            country.code?.uppercase(),
            country.continent
        ).joinToString(" • ")
        holder.itemView.setOnClickListener { onItemClick(country) }
    }

    override fun getItemCount(): Int = countries.size

    fun updateCountries(newCountries: List<CountryInfo>) {
        countries = newCountries
        notifyDataSetChanged()
    }
}
