package edu.cit.batawang.synchef.repository;

import edu.cit.batawang.synchef.model.Ingredient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface IngredientRepository extends JpaRepository<Ingredient, Long> {
    Optional<Ingredient> findByName(String name);
    List<Ingredient> findByCountryId(Long countryId);
    List<Ingredient> findByIsTraditionalTrue();
    List<Ingredient> findByCategory(String category);
    
    @Query("SELECT i FROM Ingredient i WHERE i.country.code = :countryCode AND i.isTraditional = true")
    List<Ingredient> findTraditionalByCountryCode(@Param("countryCode") String countryCode);
}
