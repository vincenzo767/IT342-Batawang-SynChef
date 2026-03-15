package edu.cit.batawang.synchef.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * Join entity between Recipe and Ingredient with quantity and scaling info
 */
@Entity
@Table(name = "recipe_ingredients")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RecipeIngredient {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipe_id", nullable = false)
    private Recipe recipe;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "ingredient_id", nullable = false)
    private Ingredient ingredient;
    
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal quantity;
    
    @Column(nullable = false, length = 50)
    private String unit; // cups, tbsp, grams, pieces, etc.
    
    @Column(name = "order_index", nullable = false)
    private Integer orderIndex;
    
    @Column(length = 200)
    private String preparation; // "diced", "minced", "julienned", etc.
    
    @Column(name = "is_optional")
    private Boolean isOptional = false;
    
    @Column(columnDefinition = "TEXT")
    private String notes; // Additional info
}
