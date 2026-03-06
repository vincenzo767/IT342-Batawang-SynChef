package edu.cit.batawang.synchef.service;

import edu.cit.batawang.synchef.model.*;
import edu.cit.batawang.synchef.repository.*;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.List;

/**
 * Service to populate database with sample recipes from different countries
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class DataSeederService {
    
    private final CountryRepository countryRepository;
    private final CategoryRepository categoryRepository;
    private final IngredientRepository ingredientRepository;
    private final RecipeRepository recipeRepository;
    
    @PostConstruct
    @Transactional
    public void seedData() {
        if (countryRepository.count() > 0) {
            log.info("Database already seeded. Skipping...");
            return;
        }
        
        log.info("Starting database seeding...");
        
        seedCountries();
        seedCategories();
        seedIngredients();
        seedRecipes();
        
        log.info("Database seeding completed!");
    }
    
    private void seedCountries() {
        List<Country> countries = Arrays.asList(
            createCountry("Philippines", "PH", "ASIA", "🇵🇭", 12.8797, 121.7740, 
                         "Known for savory-sour flavors and Spanish-influenced cuisine"),
            createCountry("Italy", "IT", "EUROPE", "🇮🇹", 41.8719, 12.5674,
                         "Home of pasta, pizza, and Mediterranean flavors"),
            createCountry("Mexico", "MX", "NORTH_AMERICA", "🇲🇽", 19.4326, -99.1332,
                         "Rich in spices, corn-based dishes, and bold flavors"),
            createCountry("Japan", "JP", "ASIA", "🇯🇵", 35.6762, 139.6503,
                         "Focused on umami, precision, and seasonal ingredients"),
            createCountry("India", "IN", "ASIA", "🇮🇳", 28.6139, 77.2090,
                         "Complex spice blends and diverse regional cuisines"),
            createCountry("Thailand", "TH", "ASIA", "🇹🇭", 13.7563, 100.5018,
                         "Balance of sweet, sour, salty, and spicy flavors"),
            createCountry("France", "FR", "EUROPE", "🇫🇷", 48.8566, 2.3522,
                         "Refined techniques and butter-rich classical cuisine"),
            createCountry("Greece", "GR", "EUROPE", "🇬🇷", 37.9838, 23.7275,
                         "Mediterranean diet with olive oil and fresh vegetables")
        );
        
        countryRepository.saveAll(countries);
        log.info("Seeded {} countries", countries.size());
    }
    
    private Country createCountry(String name, String code, String continent, String flag,
                                 double lat, double lon, String desc) {
        Country country = new Country();
        country.setName(name);
        country.setCode(code);
        country.setContinent(continent);
        country.setFlagEmoji(flag);
        country.setLatitude(lat);
        country.setLongitude(lon);
        country.setDescription(desc);
        return country;
    }
    
    private void seedCategories() {
        List<Category> categories = Arrays.asList(
            createCategory("Main Course", "Primary dishes", "🍽️", "#FF6B6B"),
            createCategory("Vegan", "Plant-based dishes", "🌱", "#51CF66"),
            createCategory("Dessert", "Sweet treats", "🍰", "#FF8C42"),
            createCategory("Appetizer", "Starters and snacks", "🥗", "#FFA94D"),
            createCategory("Soup", "Liquid-based dishes", "🍲", "#74C0FC"),
            createCategory("Seafood", "Fish and shellfish", "🦐", "#4DABF7"),
            createCategory("Vegetarian", "No meat dishes", "🥕", "#69DB7C")
        );
        
        categoryRepository.saveAll(categories);
        log.info("Seeded {} categories", categories.size());
    }
    
    private Category createCategory(String name, String desc, String icon, String color) {
        Category category = new Category();
        category.setName(name);
        category.setDescription(desc);
        category.setIconName(icon);
        category.setColorCode(color);
        return category;
    }
    
    private void seedIngredients() {
        Country philippines = countryRepository.findByCode("PH").orElseThrow();
        Country italy = countryRepository.findByCode("IT").orElseThrow();
        Country mexico = countryRepository.findByCode("MX").orElseThrow();
        
        List<Ingredient> ingredients = Arrays.asList(
            createIngredient("Calamansi", "Small citrus fruit", philippines, true, "Fruits",
                           Arrays.asList("Lemon + Lime", "Key Lime")),
            createIngredient("Soy Sauce", "Fermented soybean condiment", null, false, "Condiments",
                           Arrays.asList("Tamari", "Coconut Aminos")),
            createIngredient("Garlic", "Aromatic bulb vegetable", null, false, "Vegetables",
                           Arrays.asList("Garlic Powder", "Shallots")),
            createIngredient("Sitaw", "Long green beans", philippines, true, "Vegetables",
                           Arrays.asList("Green Beans", "Yard-long Beans")),
            createIngredient("Pasta", "Italian wheat noodles", italy, false, "Grains",
                           Arrays.asList("Gluten-free Pasta", "Zucchini Noodles")),
            createIngredient("Tomato", "Red fruit vegetable", null, false, "Vegetables",
                           Arrays.asList("Canned Tomatoes", "Cherry Tomatoes")),
            createIngredient("Chili Pepper", "Spicy pepper", mexico, false, "Spices",
                           Arrays.asList("Red Pepper Flakes", "Cayenne"))
        );
        
        ingredientRepository.saveAll(ingredients);
        log.info("Seeded {} ingredients", ingredients.size());
    }
    
    private Ingredient createIngredient(String name, String desc, Country country, boolean traditional,
                                       String category, List<String> substitutes) {
        Ingredient ingredient = new Ingredient();
        ingredient.setName(name);
        ingredient.setDescription(desc);
        ingredient.setCountry(country);
        ingredient.setIsTraditional(traditional);
        ingredient.setCategory(category);
        ingredient.setCommonSubstitutes(substitutes);
        return ingredient;
    }
    
    private void seedRecipes() {
        seedAdobongSitaw();
        log.info("Seeded sample recipes");
    }
    
    private void seedAdobongSitaw() {
        Country philippines = countryRepository.findByCode("PH").orElseThrow();
        Category mainCourse = categoryRepository.findByName("Main Course").orElseThrow();
        Category vegan = categoryRepository.findByName("Vegan").orElseThrow();
        
        Recipe recipe = new Recipe();
        recipe.setName("Adobong Sitaw");
        recipe.setDescription("Filipino style long green beans braised in soy sauce and vinegar");
        recipe.setCountry(philippines);
        recipe.setCategories(Arrays.asList(mainCourse, vegan));
        recipe.setPrepTimeMinutes(10);
        recipe.setCookTimeMinutes(20);
        recipe.setTotalTimeMinutes(30);
        recipe.setDefaultServings(4);
        recipe.setDifficultyLevel("EASY");
        recipe.setCulturalContext("Adobo is the unofficial national dish of the Philippines. " +
                                 "This vegetarian version uses sitaw (long beans) instead of meat.");
        recipe.setCreatedAt(new Date());
        recipe.setUpdatedAt(new Date());
        
        // Ingredients
        Ingredient sitaw = ingredientRepository.findByName("Sitaw").orElseThrow();
        Ingredient soySauce = ingredientRepository.findByName("Soy Sauce").orElseThrow();
        Ingredient garlic = ingredientRepository.findByName("Garlic").orElseThrow();
        
        List<RecipeIngredient> recipeIngredients = new ArrayList<>();
        recipeIngredients.add(createRecipeIngredient(recipe, sitaw, new BigDecimal("500"), "grams", 1, "cut into 2-inch pieces", false));
        recipeIngredients.add(createRecipeIngredient(recipe, soySauce, new BigDecimal("3"), "tablespoons", 2, null, false));
        recipeIngredients.add(createRecipeIngredient(recipe, garlic, new BigDecimal("6"), "cloves", 3, "minced", false));
        
        recipe.setIngredients(recipeIngredients);
        
        // Steps
        List<Step> steps = new ArrayList<>();
        steps.add(createStep(recipe, 1, "Heat oil in a large pan over medium heat.", false, null, null, false, null));
        steps.add(createStep(recipe, 2, "Sauté garlic until golden brown.", true, 120, "Sauté garlic", false, null));
        steps.add(createStep(recipe, 3, "Add sitaw and stir fry for 2 minutes.", true, 120, "Stir fry sitaw", true, 1));
        steps.add(createStep(recipe, 4, "Pour in soy sauce, vinegar, and water. Bring to boil.", false, null, null, false, null));
        steps.add(createStep(recipe, 5, "Simmer covered until beans are tender.", true, 600, "Simmer beans", false, null));
        
        recipe.setSteps(steps);
        
        recipeRepository.save(recipe);
    }
    
    private RecipeIngredient createRecipeIngredient(Recipe recipe, Ingredient ingredient, 
                                                   BigDecimal qty, String unit, int order,
                                                   String prep, boolean optional) {
        RecipeIngredient ri = new RecipeIngredient();
        ri.setRecipe(recipe);
        ri.setIngredient(ingredient);
        ri.setQuantity(qty);
        ri.setUnit(unit);
        ri.setOrderIndex(order);
        ri.setPreparation(prep);
        ri.setIsOptional(optional);
        return ri;
    }
    
    private Step createStep(Recipe recipe, int order, String instruction, boolean hasTimer,
                           Integer timerSec, String timerLabel, boolean parallel, Integer parallelGroup) {
        Step step = new Step();
        step.setRecipe(recipe);
        step.setOrderIndex(order);
        step.setInstruction(instruction);
        step.setHasTimer(hasTimer);
        step.setTimerSeconds(timerSec);
        step.setTimerLabel(timerLabel);
        step.setIsParallel(parallel);
        step.setParallelGroup(parallelGroup);
        step.setScalesWithServings(false);
        return step;
    }
}
