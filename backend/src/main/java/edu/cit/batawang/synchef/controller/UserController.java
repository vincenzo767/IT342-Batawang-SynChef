package edu.cit.batawang.synchef.controller;

import edu.cit.batawang.synchef.dto.AuthResponse;
import edu.cit.batawang.synchef.model.User;
import edu.cit.batawang.synchef.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * REST controller for user profile and per-user data (favorites, country).
 * All endpoints require a valid JWT (enforced by SecurityConfig).
 */
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@CrossOrigin(originPatterns = {"http://localhost:*", "http://127.0.0.1:*"})
public class UserController {

    private final UserRepository userRepository;

    // ── helpers ──────────────────────────────────────────────────────────────

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) {
            throw new IllegalStateException("Not authenticated");
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
            throw new IllegalStateException("Not authenticated");
        }

        return userRepository.findById(userId)
                .orElseThrow(() -> new IllegalStateException("Authenticated user not found"));
    }

    private AuthResponse toProfile(User user) {
        AuthResponse r = new AuthResponse();
        r.setId(user.getId());
        r.setEmail(user.getEmail());
        r.setUsername(user.getUsername());
        r.setFullName(user.getFullName());
        r.setProfileImageUrl(user.getProfileImageUrl());
        r.setEmailVerified(user.getEmailVerified());
        r.setCountryCode(user.getCountryCode());
        r.setCountryName(user.getCountryName());
        r.setFavoriteRecipeIds(user.getFavoriteRecipeIds() != null
                ? user.getFavoriteRecipeIds() : new ArrayList<>());
        r.setCreatedAt(user.getCreatedAt());
        return r;
    }

    // ── endpoints ─────────────────────────────────────────────────────────────

    /** GET /api/users/me — returns current user's full profile */
    @GetMapping("/me")
    public ResponseEntity<AuthResponse> getMe() {
        return ResponseEntity.ok(toProfile(getCurrentUser()));
    }

    /** GET /api/users/me/favorites — returns list of favorite recipe IDs */
    @GetMapping("/me/favorites")
    public ResponseEntity<List<Long>> getFavorites() {
        User user = getCurrentUser();
        List<Long> ids = user.getFavoriteRecipeIds();
        return ResponseEntity.ok(ids != null ? ids : new ArrayList<>());
    }

    /** POST /api/users/me/favorites/{recipeId} — add a recipe to favorites */
    @PostMapping("/me/favorites/{recipeId}")
    public ResponseEntity<List<Long>> addFavorite(@PathVariable Long recipeId) {
        User user = getCurrentUser();
        if (user.getFavoriteRecipeIds() == null) {
            user.setFavoriteRecipeIds(new ArrayList<>());
        }
        if (!user.getFavoriteRecipeIds().contains(recipeId)) {
            user.getFavoriteRecipeIds().add(recipeId);
            user = userRepository.save(user);
        }
        return ResponseEntity.ok(user.getFavoriteRecipeIds());
    }

    /** DELETE /api/users/me/favorites/{recipeId} — remove a recipe from favorites */
    @DeleteMapping("/me/favorites/{recipeId}")
    public ResponseEntity<List<Long>> removeFavorite(@PathVariable Long recipeId) {
        User user = getCurrentUser();
        if (user.getFavoriteRecipeIds() != null) {
            user.getFavoriteRecipeIds().remove(recipeId);
            user = userRepository.save(user);
        }
        return ResponseEntity.ok(user.getFavoriteRecipeIds() != null
                ? user.getFavoriteRecipeIds() : new ArrayList<>());
    }

    /** PUT /api/users/me/country — update stored country (for Settings page) */
    @PutMapping("/me/country")
    public ResponseEntity<Map<String, String>> updateCountry(
            @RequestBody Map<String, String> body) {
        User user = getCurrentUser();
        String code = body.getOrDefault("countryCode", "").trim().toUpperCase();
        String name = body.getOrDefault("countryName", "").trim();
        if (!code.isEmpty()) user.setCountryCode(code);
        if (!name.isEmpty()) user.setCountryName(name);
        userRepository.save(user);
        return ResponseEntity.ok(Map.of(
                "countryCode", user.getCountryCode() != null ? user.getCountryCode() : "",
                "countryName", user.getCountryName() != null ? user.getCountryName() : ""
        ));
    }
}
