package edu.cit.batawang.synchef.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO for scaled recipe with adjusted ingredients and timing
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ScaledRecipeDTO {
    private Long recipeId;
    private String recipeName;
    private Integer originalServings;
    private Integer requestedServings;
    private Double scalingFactor;
    private List<ScaledIngredientDTO> scaledIngredients;
    private List<ScaledStepDTO> scaledSteps;
    private Integer adjustedTotalTime;
}
