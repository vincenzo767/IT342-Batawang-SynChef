package edu.cit.batawang.synchef.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ScaledIngredientDTO {
    private Long ingredientId;
    private String ingredientName;
    private BigDecimal originalQuantity;
    private BigDecimal scaledQuantity;
    private String unit;
    private String preparation;
    private Boolean isOptional;
    private String notes;
}
