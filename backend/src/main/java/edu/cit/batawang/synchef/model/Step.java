package edu.cit.batawang.synchef.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Step entity representing individual cooking instructions with timer support
 */
@Entity
@Table(name = "steps")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Step {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipe_id", nullable = false)
    private Recipe recipe;
    
    @Column(name = "order_index", nullable = false)
    private Integer orderIndex;
    
    @Column(nullable = false, columnDefinition = "TEXT")
    private String instruction;
    
    @Column(name = "has_timer", nullable = false)
    private Boolean hasTimer = false;
    
    @Column(name = "timer_seconds")
    private Integer timerSeconds; // Duration in seconds
    
    @Column(name = "timer_label", length = 100)
    private String timerLabel; // "Boil pasta", "Sauté garlic", etc.
    
    @Column(name = "is_parallel")
    private Boolean isParallel = false; // Can be done simultaneously with other steps
    
    @Column(name = "parallel_group")
    private Integer parallelGroup; // Group ID for parallel execution
    
    @Column(name = "image_url", length = 500)
    private String imageUrl; // Optional step illustration
    
    @Column(columnDefinition = "TEXT")
    private String tips; // Pro tips for this step
    
    @Column(name = "temperature", length = 50)
    private String temperature; // "Medium heat", "350°F", etc.
    
    // For dynamic scaling of time based on servings
    @Column(name = "scales_with_servings")
    private Boolean scalesWithServings = false;
}
