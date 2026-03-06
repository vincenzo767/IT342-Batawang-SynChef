package edu.cit.batawang.synchef.repository;

import edu.cit.batawang.synchef.model.Recipe;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RecipeRepository extends JpaRepository<Recipe, Long> {
    List<Recipe> findByCountryId(Long countryId);
    
    @Query("SELECT r FROM Recipe r JOIN r.categories c WHERE c.id = :categoryId")
    List<Recipe> findByCategoryId(@Param("categoryId") Long categoryId);
    
    @Query("SELECT r FROM Recipe r WHERE r.country.code = :countryCode")
    List<Recipe> findByCountryCode(@Param("countryCode") String countryCode);
    
    @Query("SELECT r FROM Recipe r WHERE r.difficultyLevel = :level")
    List<Recipe> findByDifficultyLevel(@Param("level") String level);
    
    @Query("SELECT r FROM Recipe r WHERE LOWER(r.name) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Recipe> searchByName(@Param("keyword") String keyword);
}
