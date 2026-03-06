package edu.cit.batawang.synchef.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * User entity for authentication, registration and personalization
 */
@Entity
@Table(name = "users", uniqueConstraints = {
    @UniqueConstraint(columnNames = "email"),
    @UniqueConstraint(columnNames = "username")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true, length = 100)
    private String email;
    
    @Column(nullable = false, unique = true, length = 100)
    private String username;
    
    @Column(nullable = true, length = 255)
    private String password;
    
    @Column(nullable = false, length = 200)
    private String fullName;
    
    @Column(nullable = true)
    private String profileImageUrl;
    
    @Column(nullable = false)
    private Boolean emailVerified = false;
    
    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;
    
    @Column(nullable = false)
    private Boolean active = true;
    
    @ElementCollection
    @CollectionTable(name = "user_dietary_restrictions", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "restriction")
    private List<String> dietaryRestrictions = new ArrayList<>();
    
    @ElementCollection
    @CollectionTable(name = "user_allergies", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "allergen")
    private List<String> allergies = new ArrayList<>();
    
    @ElementCollection
    @CollectionTable(name = "user_favorite_recipes", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "recipe_id")
    private List<Long> favoriteRecipeIds = new ArrayList<>();
    
    @Column(name = "preferred_unit_system", length = 20)
    private String preferredUnitSystem = "METRIC"; // METRIC or IMPERIAL
    
    @Column(name = "skill_level", length = 20)
    private String skillLevel = "BEGINNER"; // BEGINNER, INTERMEDIATE, ADVANCED
}
