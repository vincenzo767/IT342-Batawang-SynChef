package edu.cit.batawang.synchef.controller;

import edu.cit.batawang.synchef.service.AIAssistantService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for AI-powered features
 */
@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class AIController {
    
    private final AIAssistantService aiService;
    
    @PostMapping("/substitutions")
    public ResponseEntity<List<String>> getSubstitutions(@RequestBody SubstitutionRequest request) {
        List<String> substitutions = aiService.suggestSubstitutions(
            request.getIngredientName(),
            request.getUserRegion(),
            request.getAllergies()
        );
        return ResponseEntity.ok(substitutions);
    }
    
    @PostMapping("/optimize-timing")
    public ResponseEntity<String> optimizeTiming(@RequestBody TimingOptimizationRequest request) {
        String optimization = aiService.optimizeTimingStrategy(
            request.getStepDescriptions(),
            request.getServings()
        );
        return ResponseEntity.ok(optimization);
    }
    
    @PostMapping("/personalized-tips")
    public ResponseEntity<String> getPersonalizedTips(@RequestBody TipsRequest request) {
        String tips = aiService.generatePersonalizedTips(
            request.getRecipeName(),
            request.getSkillLevel(),
            request.getDietaryRestrictions()
        );
        return ResponseEntity.ok(tips);
    }
    
    @GetMapping("/cultural-context")
    public ResponseEntity<String> getCulturalContext(
            @RequestParam String dishName,
            @RequestParam String countryCode) {
        String context = aiService.explainCulturalContext(dishName, countryCode);
        return ResponseEntity.ok(context);
    }
    
    @Data
    static class SubstitutionRequest {
        private String ingredientName;
        private String userRegion;
        private List<String> allergies;
    }
    
    @Data
    static class TimingOptimizationRequest {
        private List<String> stepDescriptions;
        private Integer servings;
    }
    
    @Data
    static class TipsRequest {
        private String recipeName;
        private String skillLevel;
        private List<String> dietaryRestrictions;
    }
}
