package edu.cit.batawang.synchef.service;

import edu.cit.batawang.synchef.dto.ScaledIngredientDTO;
import edu.cit.batawang.synchef.dto.ScaledRecipeDTO;
import edu.cit.batawang.synchef.dto.ScaledStepDTO;
import edu.cit.batawang.synchef.model.Recipe;
import edu.cit.batawang.synchef.model.RecipeIngredient;
import edu.cit.batawang.synchef.model.Step;
import edu.cit.batawang.synchef.repository.RecipeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for dynamic ingredient and time scaling based on servings
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class RecipeScalingService {
    
    private final RecipeRepository recipeRepository;
    
    @Transactional(readOnly = true)
    public ScaledRecipeDTO scaleRecipe(Long recipeId, Integer requestedServings) {
        Recipe recipe = recipeRepository.findById(recipeId)
            .orElseThrow(() -> new RuntimeException("Recipe not found with id: " + recipeId));
        
        Integer originalServings = recipe.getDefaultServings();
        double scalingFactor = (double) requestedServings / originalServings;
        
        log.info("Scaling recipe '{}' from {} to {} servings (factor: {})", 
                 recipe.getName(), originalServings, requestedServings, scalingFactor);
        
        // Scale ingredients
        List<ScaledIngredientDTO> scaledIngredients = recipe.getIngredients().stream()
            .map(ri -> scaleIngredient(ri, scalingFactor))
            .collect(Collectors.toList());
        
        // Scale steps (timing)
        List<ScaledStepDTO> scaledSteps = recipe.getSteps().stream()
            .map(step -> scaleStep(step, scalingFactor))
            .collect(Collectors.toList());
        
        // Adjust total time (cooking time scales differently than prep time)
        Integer adjustedTotalTime = calculateAdjustedTime(recipe, scalingFactor);
        
        ScaledRecipeDTO result = new ScaledRecipeDTO();
        result.setRecipeId(recipeId);
        result.setRecipeName(recipe.getName());
        result.setOriginalServings(originalServings);
        result.setRequestedServings(requestedServings);
        result.setScalingFactor(scalingFactor);
        result.setScaledIngredients(scaledIngredients);
        result.setScaledSteps(scaledSteps);
        result.setAdjustedTotalTime(adjustedTotalTime);
        
        return result;
    }
    
    private ScaledIngredientDTO scaleIngredient(RecipeIngredient ri, double scalingFactor) {
        BigDecimal originalQty = ri.getQuantity();
        BigDecimal scaledQty = originalQty.multiply(BigDecimal.valueOf(scalingFactor))
                                          .setScale(2, RoundingMode.HALF_UP);
        
        // Smart rounding for common measurements
        scaledQty = smartRound(scaledQty, ri.getUnit());
        
        ScaledIngredientDTO dto = new ScaledIngredientDTO();
        dto.setIngredientId(ri.getIngredient().getId());
        dto.setIngredientName(ri.getIngredient().getName());
        dto.setOriginalQuantity(originalQty);
        dto.setScaledQuantity(scaledQty);
        dto.setUnit(ri.getUnit());
        dto.setPreparation(ri.getPreparation());
        dto.setIsOptional(ri.getIsOptional());
        dto.setNotes(ri.getNotes());
        
        return dto;
    }
    
    private ScaledStepDTO scaleStep(Step step, double scalingFactor) {
        Integer scaledTimer = step.getTimerSeconds();
        
        // Only scale timing if marked as scalable
        if (step.getScalesWithServings() != null && step.getScalesWithServings() && scaledTimer != null) {
            // Time doesn't scale linearly - use logarithmic scaling
            scaledTimer = (int) (scaledTimer * Math.pow(scalingFactor, 0.3));
        }
        
        ScaledStepDTO dto = new ScaledStepDTO();
        dto.setStepId(step.getId());
        dto.setOrderIndex(step.getOrderIndex());
        dto.setInstruction(step.getInstruction());
        dto.setHasTimer(step.getHasTimer());
        dto.setOriginalTimerSeconds(step.getTimerSeconds());
        dto.setScaledTimerSeconds(scaledTimer);
        dto.setTimerLabel(step.getTimerLabel());
        dto.setIsParallel(step.getIsParallel());
        dto.setParallelGroup(step.getParallelGroup());
        dto.setTips(step.getTips());
        
        return dto;
    }
    
    private BigDecimal smartRound(BigDecimal value, String unit) {
        // Round to common fractions for cooking measurements
        if (unit.toLowerCase().contains("cup") || unit.toLowerCase().contains("tbsp") 
            || unit.toLowerCase().contains("tsp")) {
            // Round to nearest 1/4
            BigDecimal quarters = value.multiply(BigDecimal.valueOf(4));
            quarters = quarters.setScale(0, RoundingMode.HALF_UP);
            return quarters.divide(BigDecimal.valueOf(4), 2, RoundingMode.HALF_UP);
        }
        
        return value.setScale(2, RoundingMode.HALF_UP);
    }
    
    private Integer calculateAdjustedTime(Recipe recipe, double scalingFactor) {
        // Prep time increases slightly, cook time may stay similar
        int prepAdjustment = (int) (recipe.getPrepTimeMinutes() * Math.pow(scalingFactor, 0.5));
        int cookAdjustment = (int) (recipe.getCookTimeMinutes() * Math.pow(scalingFactor, 0.3));
        
        return prepAdjustment + cookAdjustment;
    }
}
