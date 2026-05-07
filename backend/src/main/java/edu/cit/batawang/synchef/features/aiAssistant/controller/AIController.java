package edu.cit.batawang.synchef.features.aiAssistant.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import edu.cit.batawang.synchef.features.aiAssistant.service.AIAssistantService;

/**
 * AIController - Vertical Slice: AI Assistant Feature
 * 
 * REST endpoints for AI features
 * Endpoints:
 * - GET /api/ai/substitutions - Get ingredient substitutions
 * - GET /api/ai/tips - Get cooking tips
 * - GET /api/ai/optimize - Get timing optimization
 */
@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class AIController {

    private final AIAssistantService aiService;

    public AIController(AIAssistantService aiService) {
        this.aiService = aiService;
    }

    @GetMapping("/substitutions")
    public ResponseEntity<?> getSubstitutions(
            @RequestParam String ingredient,
            @RequestParam(required = false) String region) {
        return ResponseEntity.ok(aiService.getSubstitutions(ingredient, region));
    }

    @GetMapping("/tips")
    public ResponseEntity<?> getCookingTips(
            @RequestParam Long stepId,
            @RequestParam(defaultValue = "intermediate") String skillLevel) {
        return ResponseEntity.ok(aiService.getCookingTips(stepId, skillLevel));
    }

    @GetMapping("/optimize")
    public ResponseEntity<?> getTimingOptimization(@RequestParam Long recipeId) {
        return ResponseEntity.ok(aiService.getTimingOptimization(recipeId));
    }
}
