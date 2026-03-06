package edu.cit.batawang.synchef.controller;

import edu.cit.batawang.synchef.dto.ScaledRecipeDTO;
import edu.cit.batawang.synchef.dto.TimerOrchestrationDTO;
import edu.cit.batawang.synchef.model.Recipe;
import edu.cit.batawang.synchef.repository.RecipeRepository;
import edu.cit.batawang.synchef.service.RecipeScalingService;
import edu.cit.batawang.synchef.service.TimerOrchestrationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for recipe operations
 */
@RestController
@RequestMapping("/api/recipes")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class RecipeController {
    
    private final RecipeRepository recipeRepository;
    private final RecipeScalingService scalingService;
    private final TimerOrchestrationService timerOrchestrationService;
    
    @GetMapping
    public ResponseEntity<List<Recipe>> getAllRecipes() {
        return ResponseEntity.ok(recipeRepository.findAll());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Recipe> getRecipeById(@PathVariable Long id) {
        return recipeRepository.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/country/{countryId}")
    public ResponseEntity<List<Recipe>> getRecipesByCountry(@PathVariable Long countryId) {
        return ResponseEntity.ok(recipeRepository.findByCountryId(countryId));
    }
    
    @GetMapping("/country/code/{countryCode}")
    public ResponseEntity<List<Recipe>> getRecipesByCountryCode(@PathVariable String countryCode) {
        return ResponseEntity.ok(recipeRepository.findByCountryCode(countryCode.toUpperCase()));
    }
    
    @GetMapping("/category/{categoryId}")
    public ResponseEntity<List<Recipe>> getRecipesByCategory(@PathVariable Long categoryId) {
        return ResponseEntity.ok(recipeRepository.findByCategoryId(categoryId));
    }
    
    @GetMapping("/difficulty/{level}")
    public ResponseEntity<List<Recipe>> getRecipesByDifficulty(@PathVariable String level) {
        return ResponseEntity.ok(recipeRepository.findByDifficultyLevel(level.toUpperCase()));
    }
    
    @GetMapping("/search")
    public ResponseEntity<List<Recipe>> searchRecipes(@RequestParam String keyword) {
        return ResponseEntity.ok(recipeRepository.searchByName(keyword));
    }
    
    @GetMapping("/{id}/scale")
    public ResponseEntity<ScaledRecipeDTO> getScaledRecipe(
            @PathVariable Long id,
            @RequestParam Integer servings) {
        return ResponseEntity.ok(scalingService.scaleRecipe(id, servings));
    }
    
    @GetMapping("/{id}/timer-sequence")
    public ResponseEntity<TimerOrchestrationDTO> getTimerSequence(@PathVariable Long id) {
        return ResponseEntity.ok(timerOrchestrationService.orchestrateTimers(id));
    }
    
    @PostMapping
    public ResponseEntity<Recipe> createRecipe(@RequestBody Recipe recipe) {
        Recipe saved = recipeRepository.save(recipe);
        return ResponseEntity.ok(saved);
    }
}
