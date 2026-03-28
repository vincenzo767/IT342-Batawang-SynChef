package edu.cit.batawang.synchef.repository;

import edu.cit.batawang.synchef.model.SynCookRecipe;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SynCookRecipeRepository extends JpaRepository<SynCookRecipe, Long> {
    List<SynCookRecipe> findByPrivacyOrderByCreatedAtDesc(String privacy);

    List<SynCookRecipe> findByOwnerIdOrderByUpdatedAtDesc(Long ownerId);
}
