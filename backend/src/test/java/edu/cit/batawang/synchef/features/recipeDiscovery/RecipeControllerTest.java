package edu.cit.batawang.synchef.features.recipeDiscovery.test;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.hamcrest.Matchers.*;

/**
 * RecipeControllerTest
 * Integration tests for Recipe Controller
 * Tests all REST endpoints of the Recipe Discovery feature slice
 */
@SpringBootTest
@AutoConfigureMockMvc
@DisplayName("Recipe Discovery Controller Integration Tests")
class RecipeControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        // Setup test data if needed
    }

    /**
     * TC-RECIPE-001: Browse all recipes
     */
    @Test
    @DisplayName("Should retrieve all recipes with pagination")
    void testGetAllRecipes_Success() throws Exception {
        mockMvc.perform(get("/api/recipes")
                .param("page", "0")
                .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(0))));
    }

    /**
     * TC-RECIPE-002: Filter by category
     */
    @Test
    @DisplayName("Should filter recipes by category")
    void testFilterRecipesByCategory_Success() throws Exception {
        mockMvc.perform(get("/api/recipes")
                .param("category", "breakfast"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[*].category", everyItem(equalTo("breakfast"))));
    }

    /**
     * TC-RECIPE-004: Search recipe by name
     */
    @Test
    @DisplayName("Should search recipes by name")
    void testSearchRecipeByName_Success() throws Exception {
        mockMvc.perform(get("/api/recipes/search")
                .param("query", "pasta"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[*].name", everyItem(
                        stringContainsInOrder("pasta", "Pasta", "PASTA"))));
    }

    /**
     * TC-RECIPE-007: View recipe details
     */
    @Test
    @DisplayName("Should retrieve recipe details by ID")
    void testGetRecipeDetails_Success() throws Exception {
        mockMvc.perform(get("/api/recipes/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.name").isNotEmpty())
                .andExpect(jsonPath("$.ingredients").isArray());
    }

    /**
     * TC-RECIPE-011: Scale ingredients up
     */
    @Test
    @DisplayName("Should scale ingredients up")
    void testScaleRecipe_Up_Success() throws Exception {
        mockMvc.perform(post("/api/recipes/1/scale")
                .param("servings", "8"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.ingredients[0].quantity", greaterThan(0)));
    }

    /**
     * TC-RECIPE-012: Scale ingredients down
     */
    @Test
    @DisplayName("Should scale ingredients down")
    void testScaleRecipe_Down_Success() throws Exception {
        mockMvc.perform(post("/api/recipes/1/scale")
                .param("servings", "2"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.ingredients[0].quantity", greaterThan(0)));
    }
}
