package edu.cit.batawang.synchef.repository;

import edu.cit.batawang.synchef.model.SynCookComment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SynCookCommentRepository extends JpaRepository<SynCookComment, Long> {
    List<SynCookComment> findByRecipeIdOrderByCreatedAtAsc(Long recipeId);

    long countByRecipeId(Long recipeId);

    void deleteByRecipeId(Long recipeId);
}
