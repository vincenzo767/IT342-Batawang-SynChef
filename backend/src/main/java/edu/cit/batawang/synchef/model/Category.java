package edu.cit.batawang.synchef.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

/**
 * Category entity for recipe classification (Vegan, Dessert, Main Course, etc.)
 */
@Entity
@Table(name = "categories")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Category {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true, length = 50)
    private String name;
    
    @Column(length = 500)
    private String description;
    
    @Column(name = "icon_name", length = 50)
    private String iconName; // For UI display
    
    @Column(name = "color_code", length = 7)
    private String colorCode; // Hex color for UI
    
    @ManyToMany(mappedBy = "categories")
    private List<Recipe> recipes = new ArrayList<>();
}
