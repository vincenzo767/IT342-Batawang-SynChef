package edu.cit.batawang.synchef.repository;

import edu.cit.batawang.synchef.model.Step;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StepRepository extends JpaRepository<Step, Long> {
    @Query("SELECT s FROM Step s WHERE s.recipe.id = :recipeId ORDER BY s.orderIndex ASC")
    List<Step> findByRecipeIdOrderByOrderIndex(@Param("recipeId") Long recipeId);
    
    @Query("SELECT s FROM Step s WHERE s.recipe.id = :recipeId AND s.hasTimer = true")
    List<Step> findTimerStepsByRecipeId(@Param("recipeId") Long recipeId);
}
