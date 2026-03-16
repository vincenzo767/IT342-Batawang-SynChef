package com.synchef.mobile.data

data class WebRecipeSeed(
    val id: Long,
    val name: String,
    val continent: String,
    val country: String,
    val cuisine: String,
    val totalMinutes: Int,
    val difficulty: String,
    val imageUrl: String,
    val description: String
)

object WebFallbackData {

    private val countryToCode = mapOf(
        "Italy" to "IT", "Thailand" to "TH", "Mexico" to "MX", "Japan" to "JP", "India" to "IN",
        "Spain" to "ES", "South Korea" to "KR", "Vietnam" to "VN", "Morocco" to "MA", "China" to "CN",
        "France" to "FR", "Brazil" to "BR", "United States" to "US", "Jamaica" to "JM", "Sweden" to "SE",
        "Philippines" to "PH", "Lebanon" to "LB", "Germany" to "DE", "Greece" to "GR", "Turkey" to "TR",
        "Peru" to "PE", "Argentina" to "AR", "Egypt" to "EG", "Colombia" to "CO", "Australia" to "AU",
        "Portugal" to "PT", "Nigeria" to "NG", "New Zealand" to "NZ", "Indonesia" to "ID"
    )

    private fun flagFromCountryCode(code: String?): String {
        if (code.isNullOrBlank() || code.length != 2) return ""
        val base = 0x1F1E6
        val chars = code.uppercase()
        val first = Character.toChars(base + (chars[0].code - 'A'.code))
        val second = Character.toChars(base + (chars[1].code - 'A'.code))
        return String(first) + String(second)
    }

    private val seeds = listOf(
        WebRecipeSeed(1, "Italian Carbonara", "Europe", "Italy", "Italian", 30, "Medium", "https://images.unsplash.com/photo-1612874742237-6526221588e3?w=800&q=80", "A rich and creamy Roman pasta dish made with eggs, Pecorino Romano, guanciale, and black pepper."),
        WebRecipeSeed(2, "Thai Pad Thai", "Asia", "Thailand", "Thai", 25, "Easy", "https://images.unsplash.com/photo-1559314809-0d155014e29e?w=800&q=80", "Thailand's iconic stir-fried rice noodle dish with shrimp, tofu, bean sprouts, and tangy tamarind sauce."),
        WebRecipeSeed(3, "Mexican Street Tacos", "North America", "Mexico", "Mexican", 20, "Easy", "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&q=80", "Authentic Mexican street tacos with seasoned carne asada, charred onion, cilantro, and fresh lime."),
        WebRecipeSeed(4, "Japanese Tonkotsu Ramen", "Asia", "Japan", "Japanese", 45, "Hard", "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&q=80", "Rich pork broth ramen with chashu, egg, nori, and bamboo shoots."),
        WebRecipeSeed(5, "Indian Butter Chicken", "Asia", "India", "Indian", 60, "Medium", "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=800&q=80", "Tender chicken tikka simmered in a fragrant tomato-cream sauce."),
        WebRecipeSeed(6, "Spanish Paella Valenciana", "Europe", "Spain", "Spanish", 55, "Medium", "https://images.unsplash.com/photo-1534080564583-6be75777b70a?w=800&q=80", "Classic Valencia rice dish with the iconic socarrat crust."),
        WebRecipeSeed(7, "Korean Bibimbap", "Asia", "South Korea", "Korean", 40, "Medium", "https://images.unsplash.com/photo-1553163147-622ab57be1c7?w=800&q=80", "Colorful Korean mixed rice bowl with vegetables, beef, egg, and gochujang."),
        WebRecipeSeed(8, "Vietnamese Beef Pho", "Asia", "Vietnam", "Vietnamese", 45, "Medium", "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=800&q=80", "Fragrant beef broth soup with rice noodles and thinly sliced beef."),
        WebRecipeSeed(9, "Moroccan Chicken Tagine", "Africa", "Morocco", "Moroccan", 75, "Medium", "https://images.unsplash.com/photo-1599043513900-ed6fe01d3833?w=800&q=80", "Slow-cooked Moroccan stew with saffron, preserved lemon, and olives."),
        WebRecipeSeed(10, "Chinese Kung Pao Chicken", "Asia", "China", "Chinese", 25, "Easy", "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=800&q=80", "Classic Sichuan stir-fry with chicken, peanuts, and dried chilies."),
        WebRecipeSeed(11, "French Coq au Vin", "Europe", "France", "French", 90, "Hard", "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=800&q=80", "French braised chicken in red wine with mushrooms and onions."),
        WebRecipeSeed(12, "Brazilian Feijoada", "South America", "Brazil", "Brazilian", 120, "Medium", "https://images.unsplash.com/photo-1582169296194-e4d644c48063?w=800&q=80", "Hearty black bean and smoked pork stew served with rice."),
        WebRecipeSeed(13, "American BBQ Baby Back Ribs", "North America", "United States", "American", 180, "Medium", "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&q=80", "Slow-cooked baby back ribs glazed with BBQ sauce."),
        WebRecipeSeed(14, "Jamaican Jerk Chicken", "North America", "Jamaica", "Jamaican", 50, "Medium", "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=800&q=80", "Spicy grilled chicken marinated in scotch bonnet and allspice."),
        WebRecipeSeed(15, "Swedish Meatballs", "Europe", "Sweden", "Swedish", 45, "Easy", "https://images.unsplash.com/photo-1515516089376-88db1e26e9c0?w=800&q=80", "Classic Swedish meatballs with cream sauce."),
        WebRecipeSeed(16, "Filipino Chicken Adobo", "Asia", "Philippines", "Filipino", 50, "Easy", "https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=800&q=80", "Chicken braised in vinegar, soy sauce, garlic, and bay leaves."),
        WebRecipeSeed(17, "Lebanese Hummus", "Middle East", "Lebanon", "Lebanese", 15, "Easy", "https://images.unsplash.com/photo-1577906096429-f73c2d312b12?w=800&q=80", "Silky hummus with tahini and lemon."),
        WebRecipeSeed(18, "Indonesian Nasi Goreng", "Asia", "Indonesia", "Indonesian", 20, "Easy", "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=800&q=80", "Sweet-savory Indonesian fried rice with egg."),
        WebRecipeSeed(19, "German Bratwurst with Sauerkraut", "Europe", "Germany", "German", 35, "Easy", "https://images.unsplash.com/photo-1599921841143-819065a55cc6?w=800&q=80", "Grilled bratwurst served with tangy sauerkraut and mustard."),
        WebRecipeSeed(20, "Greek Moussaka", "Europe", "Greece", "Greek", 80, "Medium", "https://images.unsplash.com/photo-1594007654729-407eedc4be65?w=800&q=80", "Layered Greek casserole with eggplant, meat sauce, and bechamel."),
        WebRecipeSeed(21, "Turkish Adana Kebab", "Asia", "Turkey", "Turkish", 40, "Medium", "https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=800&q=80", "Spiced lamb kebabs grilled over charcoal."),
        WebRecipeSeed(22, "Peruvian Ceviche", "South America", "Peru", "Peruvian", 20, "Easy", "https://images.unsplash.com/photo-1535400255456-984a0b6af498?w=800&q=80", "Fresh fish cured in lime with onion and cilantro."),
        WebRecipeSeed(23, "Argentine Asado", "South America", "Argentina", "Argentine", 120, "Medium", "https://images.unsplash.com/photo-1558030006-450675393462?w=800&q=80", "Slow-grilled beef short ribs with chimichurri."),
        WebRecipeSeed(24, "Egyptian Koshari", "Africa", "Egypt", "Egyptian", 50, "Medium", "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&q=80", "Lentils, rice, and pasta topped with tomato sauce and crispy onions."),
        WebRecipeSeed(25, "Colombian Bandeja Paisa", "South America", "Colombia", "Colombian", 90, "Hard", "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80", "Iconic Colombian platter with beans, meats, egg, avocado, and arepa."),
        WebRecipeSeed(26, "Australian Meat Pie", "Oceania", "Australia", "Australian", 70, "Medium", "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80", "Flaky pastry meat pie with rich beef filling."),
        WebRecipeSeed(27, "Portuguese Bacalhau a Bras", "Europe", "Portugal", "Portuguese", 45, "Medium", "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80", "Shredded cod scrambled with eggs and crispy potatoes."),
        WebRecipeSeed(28, "Nigerian Jollof Rice", "Africa", "Nigeria", "Nigerian", 60, "Medium", "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=800&q=80", "West African spiced tomato rice with signature smokiness."),
        WebRecipeSeed(29, "New Zealand Hangi", "Oceania", "New Zealand", "Maori", 240, "Hard", "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80", "Traditional Maori earth oven feast cooked over hot stones.")
    )

    fun fallbackRecipes(): List<RecipeListItem> {
        return seeds.map { seed ->
            val code = countryToCode[seed.country]
            RecipeListItem(
                id = seed.id,
                name = seed.name,
                description = seed.description,
                imageUrl = seed.imageUrl,
                totalTimeMinutes = seed.totalMinutes,
                difficultyLevel = seed.difficulty,
                defaultServings = 4,
                country = CountryInfo(
                    id = null,
                    name = seed.country,
                    code = code,
                    continent = normalizeContinentName(seed.continent),
                    flagEmoji = flagFromCountryCode(code)
                ),
                categories = listOf(
                    CategoryInfo(
                        id = null,
                        name = seed.cuisine,
                        colorCode = null,
                        iconName = null
                    )
                )
            )
        }
    }

    fun fallbackCountriesByContinent(): Map<String, List<CountryInfo>> {
        val rows = listOf(
            "Asia" to "JP", "Asia" to "TH", "Asia" to "IN", "Asia" to "VN", "Asia" to "CN", "Asia" to "KR", "Asia" to "PH", "Asia" to "ID", "Asia" to "MY", "Asia" to "SG",
            "Europe" to "IT", "Europe" to "FR", "Europe" to "ES", "Europe" to "DE", "Europe" to "GR", "Europe" to "SE", "Europe" to "PT", "Europe" to "GB", "Europe" to "NL", "Europe" to "CH",
            "Africa" to "MA", "Africa" to "EG", "Africa" to "NG", "Africa" to "KE", "Africa" to "ZA", "Africa" to "ET", "Africa" to "GH", "Africa" to "TN", "Africa" to "DZ", "Africa" to "TZ",
            "North America" to "US", "North America" to "MX", "North America" to "CA", "North America" to "JM", "North America" to "CU", "North America" to "CR", "North America" to "DO", "North America" to "GT",
            "South America" to "BR", "South America" to "AR", "South America" to "PE", "South America" to "CO", "South America" to "CL", "South America" to "EC", "South America" to "UY", "South America" to "PY",
            "Oceania" to "AU", "Oceania" to "NZ", "Oceania" to "FJ", "Oceania" to "PG", "Oceania" to "WS", "Oceania" to "TO"
        )

        val seededCountries = fallbackRecipes().mapNotNull { recipe ->
            val country = recipe.country ?: return@mapNotNull null
            val code = country.code ?: return@mapNotNull null
            val continent = country.continent ?: return@mapNotNull null
            Triple(continent, code.uppercase(), country.name ?: code)
        }

        val combined = rows.map { Triple(it.first, it.second, countryNameFromCode(it.second)) } + seededCountries
        return combined
            .groupBy { normalizeContinentName(it.first) }
            .mapValues { (_, list) ->
                list
                    .distinctBy { (_, code, _) -> code }
                    .map { (continent, code, name) ->
                        CountryInfo(
                            id = null,
                            name = name,
                            code = code,
                            continent = normalizeContinentName(continent),
                            flagEmoji = flagFromCountryCode(code)
                        )
                    }
                    .sortedBy { it.name ?: "" }
            }
    }

    fun normalizeContinentName(continent: String?): String {
        if (continent.isNullOrBlank()) return ""
        return when (continent.trim().lowercase()) {
            "middle east" -> "Asia"
            "north america" -> "North America"
            "south america" -> "South America"
            else -> continent.trim()
        }
    }

    private fun countryNameFromCode(code: String): String {
        return when (code.uppercase()) {
            "AR" -> "Argentina"
            "AU" -> "Australia"
            "BR" -> "Brazil"
            "CA" -> "Canada"
            "CH" -> "Switzerland"
            "CL" -> "Chile"
            "CN" -> "China"
            "CO" -> "Colombia"
            "CR" -> "Costa Rica"
            "CU" -> "Cuba"
            "DE" -> "Germany"
            "DO" -> "Dominican Republic"
            "DZ" -> "Algeria"
            "EC" -> "Ecuador"
            "EG" -> "Egypt"
            "ES" -> "Spain"
            "ET" -> "Ethiopia"
            "FJ" -> "Fiji"
            "FR" -> "France"
            "GB" -> "United Kingdom"
            "GH" -> "Ghana"
            "GR" -> "Greece"
            "GT" -> "Guatemala"
            "ID" -> "Indonesia"
            "IN" -> "India"
            "IT" -> "Italy"
            "JM" -> "Jamaica"
            "JP" -> "Japan"
            "KE" -> "Kenya"
            "KR" -> "South Korea"
            "MA" -> "Morocco"
            "MX" -> "Mexico"
            "MY" -> "Malaysia"
            "NG" -> "Nigeria"
            "NL" -> "Netherlands"
            "NZ" -> "New Zealand"
            "PE" -> "Peru"
            "PG" -> "Papua New Guinea"
            "PH" -> "Philippines"
            "PT" -> "Portugal"
            "PY" -> "Paraguay"
            "SE" -> "Sweden"
            "SG" -> "Singapore"
            "TH" -> "Thailand"
            "TN" -> "Tunisia"
            "TO" -> "Tonga"
            "TZ" -> "Tanzania"
            "US" -> "United States"
            "UY" -> "Uruguay"
            "VN" -> "Vietnam"
            "WS" -> "Samoa"
            "ZA" -> "South Africa"
            else -> code.uppercase()
        }
    }
}
