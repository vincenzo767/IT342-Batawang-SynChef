package edu.cit.batawang.synchef.features.recipeDiscovery.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import edu.cit.batawang.synchef.features.recipeDiscovery.service.RecipeService;

/**
 * RecipeController - Vertical Slice: Recipe Discovery Feature
 * 
 * REST endpoints for recipe operations
 * Endpoints:
 * - GET /api/recipes - Get all recipes with pagination
 * - GET /api/recipes/search - Search recipes
 * - GET /api/recipes/{id} - Get recipe details
 * - POST /api/recipes/{id}/scale - Scale recipe ingredients
 */
@RestController
@RequestMapping("/api/recipes")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class RecipeController {

    private final RecipeService recipeService;

    public RecipeController(RecipeService recipeService) {
        this.recipeService = recipeService;
    }

    @GetMapping
    public ResponseEntity<?> getAllRecipes(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String category) {
        
        if (category != null) {
            return ResponseEntity.ok(recipeService.filterByCategory(category));
        }
        return ResponseEntity.ok(recipeService.getAllRecipes(page, size));
    }

    @GetMapping("/search")
    public ResponseEntity<?> searchRecipes(@RequestParam String query) {
        return ResponseEntity.ok(recipeService.searchRecipes(query));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getRecipeDetails(@PathVariable Long id) {
        return ResponseEntity.ok(recipeService.getRecipeDetails(id));
    }

    @PostMapping("/{id}/scale")
    public ResponseEntity<?> scaleRecipe(
            @PathVariable Long id,
            @RequestParam int servings) {
        return ResponseEntity.ok(recipeService.scaleRecipe(id, servings));
    }
}
