package edu.cit.batawang.synchef.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "syncook_recipes")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SynCookRecipe {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 180)
    private String title;

    @Column(nullable = false, length = 120)
    private String country;

    @ElementCollection
    @CollectionTable(name = "syncook_recipe_ingredients", joinColumns = @JoinColumn(name = "recipe_id"))
    @Column(name = "ingredient", columnDefinition = "TEXT")
    @OrderColumn(name = "order_index")
    private List<String> ingredients = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "syncook_recipe_procedures", joinColumns = @JoinColumn(name = "recipe_id"))
    @Column(name = "procedure_step", columnDefinition = "TEXT")
    @OrderColumn(name = "order_index")
    private List<String> procedures = new ArrayList<>();

    @Column(columnDefinition = "TEXT")
    private String imageUrl;

    @Column(nullable = false, length = 12)
    private String privacy = "PUBLIC";

    @Column(nullable = false)
    private Long ownerId;

    @Column(nullable = false, length = 200)
    private String ownerName;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
