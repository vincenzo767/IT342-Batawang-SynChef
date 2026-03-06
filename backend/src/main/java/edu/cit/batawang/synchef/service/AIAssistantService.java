package edu.cit.batawang.synchef.service;

import edu.cit.batawang.synchef.model.Ingredient;
import edu.cit.batawang.synchef.repository.IngredientRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.ChatClient;
import org.springframework.ai.chat.ChatResponse;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

/**
 * AI-powered service for ingredient substitutions, timing optimization, and personalization
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AIAssistantService {
    
    private final ChatClient chatClient;
    private final IngredientRepository ingredientRepository;
    
    /**
     * AI-powered ingredient substitution with cultural awareness
     */
    public List<String> suggestSubstitutions(String ingredientName, String userRegion, List<String> allergies) {
        Ingredient ingredient = ingredientRepository.findByName(ingredientName).orElse(null);
        
        String prompt = buildSubstitutionPrompt(ingredientName, ingredient, userRegion, allergies);
        
        try {
            ChatResponse response = chatClient.call(new Prompt(prompt));
            String suggestions = response.getResult().getOutput().getContent();
            
            return parseSubstitutions(suggestions);
        } catch (Exception e) {
            log.error("AI substitution failed for ingredient: {}", ingredientName, e);
            // Fallback to database substitutes
            return ingredient != null ? ingredient.getCommonSubstitutes() : new ArrayList<>();
        }
    }
    
    /**
     * AI optimization of cooking steps and timing
     */
    public String optimizeTimingStrategy(List<String> stepDescriptions, Integer servings) {
        String prompt = String.format(
            "You are a professional chef optimizing a recipe workflow for %d servings. " +
            "Given these cooking steps, suggest the optimal order and parallel execution strategy " +
            "to minimize total cooking time while maintaining food quality:\n\n%s\n\n" +
            "Provide a brief, practical optimization strategy.",
            servings,
            String.join("\n", stepDescriptions)
        );
        
        try {
            ChatResponse response = chatClient.call(new Prompt(prompt));
            return response.getResult().getOutput().getContent();
        } catch (Exception e) {
            log.error("AI timing optimization failed", e);
            return "Follow steps sequentially for best results.";
        }
    }
    
    /**
     * Personalized cooking tips based on user skill level and preferences
     */
    public String generatePersonalizedTips(String recipeName, String skillLevel, List<String> dietaryRestrictions) {
        String prompt = String.format(
            "Provide 3 concise, practical cooking tips for '%s' tailored to a %s-level cook " +
            "with these dietary considerations: %s. Focus on technique and common mistakes.",
            recipeName,
            skillLevel.toLowerCase(),
            String.join(", ", dietaryRestrictions.isEmpty() ? List.of("none") : dietaryRestrictions)
        );
        
        try {
            ChatResponse response = chatClient.call(new Prompt(prompt));
            return response.getResult().getOutput().getContent();
        } catch (Exception e) {
            log.error("AI tip generation failed for recipe: {}", recipeName, e);
            return "Take your time and read each step carefully before proceeding.";
        }
    }
    
    /**
     * Cultural context and history explanation
     */
    public String explainCulturalContext(String dishName, String countryCode) {
        String prompt = String.format(
            "Provide a brief (3-4 sentences) cultural background and historical context for '%s' " +
            "from %s. Include its significance in local cuisine and any interesting traditions.",
            dishName,
            countryCode
        );
        
        try {
            ChatResponse response = chatClient.call(new Prompt(prompt));
            return response.getResult().getOutput().getContent();
        } catch (Exception e) {
            log.error("AI cultural context failed for dish: {}", dishName, e);
            return "This is a traditional dish with rich cultural heritage.";
        }
    }
    
    private String buildSubstitutionPrompt(String ingredientName, Ingredient ingredient, 
                                          String userRegion, List<String> allergies) {
        StringBuilder prompt = new StringBuilder();
        prompt.append(String.format("Suggest 3-5 practical substitutions for '%s' ", ingredientName));
        
        if (ingredient != null && ingredient.getCountry() != null) {
            prompt.append(String.format("(traditional to %s) ", ingredient.getCountry().getName()));
        }
        
        prompt.append(String.format("that are available in %s. ", userRegion));
        
        if (!allergies.isEmpty()) {
            prompt.append(String.format("Avoid: %s. ", String.join(", ", allergies)));
        }
        
        prompt.append("Format as a comma-separated list of ingredient names only.");
        
        return prompt.toString();
    }
    
    private List<String> parseSubstitutions(String aiResponse) {
        String[] items = aiResponse.split(",");
        List<String> substitutions = new ArrayList<>();
        
        for (String item : items) {
            String cleaned = item.trim()
                .replaceAll("^[\\d.]+\\.?\\s*", "") // Remove numbering
                .replaceAll("[\\n\\r]", "")
                .trim();
            
            if (!cleaned.isEmpty() && cleaned.length() < 100) {
                substitutions.add(cleaned);
            }
        }
        
        return substitutions;
    }
}
