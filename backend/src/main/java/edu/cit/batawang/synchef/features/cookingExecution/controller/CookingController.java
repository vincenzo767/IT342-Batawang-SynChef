package edu.cit.batawang.synchef.features.cookingExecution.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import edu.cit.batawang.synchef.features.cookingExecution.service.TimerOrchestrationService;

/**
 * CookingController - Vertical Slice: Cooking Execution Feature
 * 
 * REST endpoints for cooking operations
 * Endpoints:
 * - POST /api/cooking/start - Start cooking mode
 * - POST /api/cooking/{sessionId}/timers - Create timer
 * - GET /api/cooking/{sessionId}/timers - Get all timers
 * - POST /api/cooking/{sessionId}/focus-mode - Enable focus mode
 */
@RestController
@RequestMapping("/api/cooking")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class CookingController {

    private final TimerOrchestrationService timerService;

    public CookingController(TimerOrchestrationService timerService) {
        this.timerService = timerService;
    }

    @PostMapping("/start")
    public ResponseEntity<?> startCookingMode(@RequestParam Long recipeId) {
        try {
            Object session = timerService.startCookingSession(recipeId);
            return ResponseEntity.ok(session);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/{sessionId}/timers")
    public ResponseEntity<?> createTimer(
            @PathVariable String sessionId,
            @RequestParam Long stepId,
            @RequestParam int duration) {
        try {
            Object timer = timerService.createTimer(sessionId, stepId, duration);
            return ResponseEntity.status(HttpStatus.CREATED).body(timer);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/{sessionId}/timers")
    public ResponseEntity<?> getTimers(@PathVariable String sessionId) {
        return ResponseEntity.ok(timerService.getTimers(sessionId));
    }

    @PostMapping("/{sessionId}/focus-mode")
    public ResponseEntity<?> enableFocusMode(
            @PathVariable String sessionId,
            @RequestParam boolean enabled) {
        // TODO: Implement focus mode logic
        return ResponseEntity.ok(new Object());
    }

    @DeleteMapping("/timers/{timerId}")
    public ResponseEntity<?> stopTimer(@PathVariable String timerId) {
        timerService.stopTimer(timerId);
        return ResponseEntity.noContent().build();
    }
}
