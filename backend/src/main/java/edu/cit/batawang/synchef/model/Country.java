package edu.cit.batawang.synchef.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

/**
 * Country entity representing different nations with their culinary traditions
 */
@Entity
@Table(name = "countries")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Country {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true, length = 100)
    private String name;
    
    @Column(nullable = false, length = 50)
    private String code; // ISO country code (e.g., PH, IT, MX)
    
    @Column(nullable = false, length = 50)
    private String continent;
    
    @Column(length = 500)
    private String description;
    
    @Column(name = "flag_emoji", length = 10)
    private String flagEmoji;
    
    // Geographic coordinates for 3D globe positioning
    @Column(nullable = false)
    private Double latitude;
    
    @Column(nullable = false)
    private Double longitude;
    
    @JsonIgnore
    @OneToMany(mappedBy = "country", cascade = CascadeType.ALL)
    private List<Recipe> recipes = new ArrayList<>();

    @JsonIgnore
    @OneToMany(mappedBy = "country", cascade = CascadeType.ALL)
    private List<Ingredient> traditionalIngredients = new ArrayList<>();
}
