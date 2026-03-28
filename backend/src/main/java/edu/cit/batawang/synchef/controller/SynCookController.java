package edu.cit.batawang.synchef.controller;

import edu.cit.batawang.synchef.dto.SynCookCommentRequest;
import edu.cit.batawang.synchef.dto.SynCookCommentResponse;
import edu.cit.batawang.synchef.dto.SynCookRecipeRequest;
import edu.cit.batawang.synchef.dto.SynCookRecipeResponse;
import edu.cit.batawang.synchef.model.SynCookComment;
import edu.cit.batawang.synchef.model.SynCookRecipe;
import edu.cit.batawang.synchef.model.User;
import edu.cit.batawang.synchef.repository.SynCookCommentRepository;
import edu.cit.batawang.synchef.repository.SynCookRecipeRepository;
import edu.cit.batawang.synchef.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/syncook")
@RequiredArgsConstructor
@CrossOrigin(originPatterns = {"http://localhost:*", "http://127.0.0.1:*"})
public class SynCookController {

    private final SynCookRecipeRepository recipeRepository;
    private final SynCookCommentRepository commentRepository;
    private final UserRepository userRepository;

    @GetMapping("/public")
    public ResponseEntity<List<SynCookRecipeResponse>> getPublicRecipes() {
        User user = getCurrentUser();
        List<SynCookRecipeResponse> data = recipeRepository.findByPrivacyOrderByCreatedAtDesc("PUBLIC")
            .stream()
            .map(recipe -> toRecipeResponse(recipe, user.getId(), false))
            .toList();
        return ResponseEntity.ok(data);
    }

    @GetMapping("/mine")
    public ResponseEntity<List<SynCookRecipeResponse>> getMyRecipes() {
        User user = getCurrentUser();
        List<SynCookRecipeResponse> data = recipeRepository.findByOwnerIdOrderByUpdatedAtDesc(user.getId())
            .stream()
            .map(recipe -> toRecipeResponse(recipe, user.getId(), true))
            .toList();
        return ResponseEntity.ok(data);
    }

    @GetMapping("/{id}")
    public ResponseEntity<SynCookRecipeResponse> getById(@PathVariable Long id) {
        User user = getCurrentUser();
        SynCookRecipe recipe = recipeRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Recipe not found"));
        enforceCanRead(recipe, user.getId());
        return ResponseEntity.ok(toRecipeResponse(recipe, user.getId(), true));
    }

    @PostMapping
    @Transactional
    public ResponseEntity<SynCookRecipeResponse> create(@RequestBody SynCookRecipeRequest request) {
        User user = getCurrentUser();
        validateRecipeRequest(request);

        SynCookRecipe recipe = new SynCookRecipe();
        recipe.setTitle(request.getTitle().trim());
        recipe.setCountry(request.getCountry().trim());
        recipe.setIngredients(cleanLines(request.getIngredients()));
        recipe.setProcedures(cleanLines(request.getProcedures()));
        recipe.setImageUrl(normalizeOptional(request.getImageUrl()));
        recipe.setPrivacy(normalizePrivacy(request.getPrivacy()));
        recipe.setOwnerId(user.getId());
        recipe.setOwnerName(resolveDisplayName(user));

        SynCookRecipe saved = recipeRepository.save(recipe);
        return ResponseEntity.status(HttpStatus.CREATED).body(toRecipeResponse(saved, user.getId(), true));
    }

    @PutMapping("/{id}")
    @Transactional
    public ResponseEntity<SynCookRecipeResponse> update(
        @PathVariable Long id,
        @RequestBody SynCookRecipeRequest request
    ) {
        User user = getCurrentUser();
        validateRecipeRequest(request);

        SynCookRecipe recipe = recipeRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Recipe not found"));
        enforceOwner(recipe, user.getId());

        recipe.setTitle(request.getTitle().trim());
        recipe.setCountry(request.getCountry().trim());
        recipe.setIngredients(cleanLines(request.getIngredients()));
        recipe.setProcedures(cleanLines(request.getProcedures()));
        // Preserve existing image URL if new one is blank/null (prevents image loss on edit)
        String newImageUrl = normalizeOptional(request.getImageUrl());
        if (newImageUrl != null) {
            recipe.setImageUrl(newImageUrl);
        }
        recipe.setPrivacy(normalizePrivacy(request.getPrivacy()));

        SynCookRecipe saved = recipeRepository.save(recipe);
        return ResponseEntity.ok(toRecipeResponse(saved, user.getId(), true));
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        User user = getCurrentUser();
        SynCookRecipe recipe = recipeRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Recipe not found"));
        enforceOwner(recipe, user.getId());
        commentRepository.deleteByRecipeId(recipe.getId());
        recipeRepository.delete(recipe);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/comments")
    public ResponseEntity<List<SynCookCommentResponse>> getComments(@PathVariable Long id) {
        User user = getCurrentUser();
        SynCookRecipe recipe = recipeRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Recipe not found"));
        enforceCanRead(recipe, user.getId());

        List<SynCookCommentResponse> comments = commentRepository.findByRecipeIdOrderByCreatedAtAsc(id)
            .stream()
            .map(this::toCommentResponse)
            .toList();
        return ResponseEntity.ok(comments);
    }

    @PostMapping("/{id}/comments")
    @Transactional
    public ResponseEntity<SynCookCommentResponse> addComment(
        @PathVariable Long id,
        @RequestBody SynCookCommentRequest request
    ) {
        User user = getCurrentUser();
        String content = normalizeOptional(request.getContent());
        if (content == null || content.length() < 2) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Comment is required");
        }

        SynCookRecipe recipe = recipeRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Recipe not found"));
        enforceCanRead(recipe, user.getId());

        SynCookComment comment = new SynCookComment();
        comment.setRecipe(recipe);
        comment.setAuthorId(user.getId());
        comment.setAuthorName(resolveDisplayName(user));
        comment.setContent(content);

        SynCookComment saved = commentRepository.save(comment);
        return ResponseEntity.status(HttpStatus.CREATED).body(toCommentResponse(saved));
    }

    private SynCookRecipeResponse toRecipeResponse(SynCookRecipe recipe, Long requesterId, boolean includeComments) {
        List<SynCookCommentResponse> comments = includeComments
            ? commentRepository.findByRecipeIdOrderByCreatedAtAsc(recipe.getId())
                .stream()
                .map(this::toCommentResponse)
                .toList()
            : List.of();

        return new SynCookRecipeResponse(
            recipe.getId(),
            recipe.getTitle(),
            recipe.getCountry(),
            recipe.getIngredients() == null ? List.of() : recipe.getIngredients(),
            recipe.getProcedures() == null ? List.of() : recipe.getProcedures(),
            recipe.getImageUrl(),
            recipe.getPrivacy(),
            recipe.getOwnerId(),
            recipe.getOwnerName(),
            recipe.getOwnerId().equals(requesterId),
            recipe.getCreatedAt(),
            recipe.getUpdatedAt(),
            commentRepository.countByRecipeId(recipe.getId()),
            comments
        );
    }

    private SynCookCommentResponse toCommentResponse(SynCookComment comment) {
        return new SynCookCommentResponse(
            comment.getId(),
            comment.getAuthorId(),
            comment.getAuthorName(),
            comment.getContent(),
            comment.getCreatedAt()
        );
    }

    private void validateRecipeRequest(SynCookRecipeRequest request) {
        if (normalizeOptional(request.getTitle()) == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Title is required");
        }
        if (normalizeOptional(request.getCountry()) == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Country is required");
        }

        List<String> ingredients = cleanLines(request.getIngredients());
        if (ingredients.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "At least one ingredient is required");
        }

        List<String> procedures = cleanLines(request.getProcedures());
        if (procedures.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "At least one procedure is required");
        }
    }

    private List<String> cleanLines(List<String> values) {
        if (values == null) return new ArrayList<>();
        return values.stream()
            .map(this::normalizeOptional)
            .filter(value -> value != null)
            .collect(Collectors.toCollection(ArrayList::new));
    }

    private String normalizeOptional(String value) {
        if (value == null) return null;
        String cleaned = value.trim();
        return cleaned.isEmpty() ? null : cleaned;
    }

    private String normalizePrivacy(String privacy) {
        String normalized = normalizeOptional(privacy);
        if (normalized == null) return "PUBLIC";
        String upper = normalized.toUpperCase(Locale.ROOT);
        return upper.equals("PRIVATE") ? "PRIVATE" : "PUBLIC";
    }

    private void enforceCanRead(SynCookRecipe recipe, Long requesterId) {
        if (recipe.getOwnerId().equals(requesterId)) return;
        if ("PUBLIC".equalsIgnoreCase(recipe.getPrivacy())) return;
        throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Private recipe");
    }

    private void enforceOwner(SynCookRecipe recipe, Long requesterId) {
        if (!recipe.getOwnerId().equals(requesterId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You cannot modify other users' recipes");
        }
    }

    private String resolveDisplayName(User user) {
        String fullName = normalizeOptional(user.getFullName());
        if (fullName != null) return fullName;
        String username = normalizeOptional(user.getUsername());
        if (username != null) return username;
        return user.getEmail();
    }

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated");
        }

        Object principal = auth.getPrincipal();
        Long userId = null;

        if (principal instanceof Number numberPrincipal) {
            userId = numberPrincipal.longValue();
        } else if (principal instanceof String stringPrincipal) {
            if (!"anonymousUser".equalsIgnoreCase(stringPrincipal)) {
                try {
                    userId = Long.parseLong(stringPrincipal);
                } catch (NumberFormatException ignored) {
                    userId = null;
                }
            }
        } else if (principal instanceof User userPrincipal) {
            userId = userPrincipal.getId();
        }

        if (userId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated");
        }

        return userRepository.findById(userId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
    }
}
