package edu.cit.batawang.synchef.features.cookingExecution.test;

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
 * CookingControllerTest
 * Integration tests for Cooking Execution Controller
 * Tests all REST endpoints of the Cooking Execution feature slice
 */
@SpringBootTest
@AutoConfigureMockMvc
@DisplayName("Cooking Execution Controller Integration Tests")
class CookingControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        // Setup test data if needed
    }

    /**
     * TC-COOKING-001: Start cooking mode
     */
    @Test
    @DisplayName("Should start cooking mode for a recipe")
    void testStartCookingMode_Success() throws Exception {
        mockMvc.perform(post("/api/cooking/start")
                .param("recipeId", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.cookingSessionId").isNotEmpty())
                .andExpect(jsonPath("$.status").value("active"));
    }

    /**
     * TC-COOKING-002 & TC-COOKING-003: Create timers
     */
    @Test
    @DisplayName("Should create cooking timers")
    void testCreateTimer_Success() throws Exception {
        mockMvc.perform(post("/api/cooking/1/timers")
                .param("stepId", "1")
                .param("duration", "600"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.timerId").isNotEmpty())
                .andExpect(jsonPath("$.duration").value(600))
                .andExpect(jsonPath("$.status").value("running"));
    }

    /**
     * TC-COOKING-006: Parallel execution
     */
    @Test
    @DisplayName("Should execute multiple timers in parallel")
    void testParallelTimers_Success() throws Exception {
        // Create session
        mockMvc.perform(post("/api/cooking/start")
                .param("recipeId", "1"))
                .andExpect(status().isOk());

        // Create multiple timers
        mockMvc.perform(post("/api/cooking/1/timers")
                .param("stepId", "1")
                .param("duration", "300"))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/api/cooking/1/timers")
                .param("stepId", "2")
                .param("duration", "600"))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/api/cooking/1/timers")
                .param("stepId", "3")
                .param("duration", "900"))
                .andExpect(status().isCreated());

        // Verify all timers exist
        mockMvc.perform(get("/api/cooking/1/timers"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(3)));
    }

    /**
     * TC-COOKING-008: Focus mode
     */
    @Test
    @DisplayName("Should enable focus mode")
    void testFocusMode_Enable_Success() throws Exception {
        mockMvc.perform(post("/api/cooking/1/focus-mode")
                .param("enabled", "true"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.focusModeEnabled").value(true))
                .andExpect(jsonPath("$.currentStep").isNotEmpty());
    }
}
