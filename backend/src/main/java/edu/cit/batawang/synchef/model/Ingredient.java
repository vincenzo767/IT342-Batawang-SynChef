package edu.cit.batawang.synchef.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

/**
 * Ingredient entity representing food items with origin and substitutions
 */
@Entity
@Table(name = "ingredients")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Ingredient {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true, length = 200)
    private String name;
    
    @Column(length = 500)
    private String description;
    
    @ManyToOne
    @JoinColumn(name = "country_id")
    private Country country; // Origin country (optional)
    
    @Column(name = "is_traditional")
    private Boolean isTraditional = false; // True if it's culture-specific
    
    @Column(name = "category", length = 50)
    private String category; // Vegetables, Spices, Proteins, etc.
    
    @Column(name = "image_url", length = 500)
    private String imageUrl;
    
    // For AI-powered substitutions
    @ElementCollection
    @CollectionTable(name = "ingredient_substitutions", joinColumns = @JoinColumn(name = "ingredient_id"))
    @Column(name = "substitute_name")
    private List<String> commonSubstitutes = new ArrayList<>();
    
    @Column(name = "allergen_info", length = 200)
    private String allergenInfo;
    
    @OneToMany(mappedBy = "ingredient")
    private List<RecipeIngredient> recipeIngredients = new ArrayList<>();
}
