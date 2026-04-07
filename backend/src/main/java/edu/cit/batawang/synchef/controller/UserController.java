package edu.cit.batawang.synchef.controller;

import edu.cit.batawang.synchef.dto.AuthResponse;
import edu.cit.batawang.synchef.dto.NotificationResponse;
import edu.cit.batawang.synchef.model.User;
import edu.cit.batawang.synchef.repository.UserRepository;
import edu.cit.batawang.synchef.service.ProfileImageStorageService;
import edu.cit.batawang.synchef.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;
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
    private final NotificationService notificationService;
    private final ProfileImageStorageService profileImageStorageService;
    private final SimpMessagingTemplate messagingTemplate;

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

    private void publishProfileUpdate(User user) {
        messagingTemplate.convertAndSend("/topic/user-profile/" + user.getId(), toProfile(user));
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
            publishProfileUpdate(user);
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
            publishProfileUpdate(user);
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
        user = userRepository.save(user);
        publishProfileUpdate(user);
        return ResponseEntity.ok(Map.of(
                "countryCode", user.getCountryCode() != null ? user.getCountryCode() : "",
                "countryName", user.getCountryName() != null ? user.getCountryName() : ""
        ));
    }

    /** POST /api/users/me/profile-image — upload and persist profile photo */
    @PostMapping(value = "/me/profile-image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<AuthResponse> uploadProfileImage(@RequestParam("file") MultipartFile file) {
        User user = getCurrentUser();
        String imageUrl = profileImageStorageService.store(file, user.getId());
        user.setProfileImageUrl(imageUrl);
        user = userRepository.save(user);
        AuthResponse profile = toProfile(user);
        messagingTemplate.convertAndSend("/topic/user-profile/" + user.getId(), profile);
        return ResponseEntity.ok(profile);
    }

    /** GET /api/users/me/notifications — returns current user's notifications */
    @GetMapping("/me/notifications")
    public ResponseEntity<java.util.List<NotificationResponse>> getNotifications(
            @RequestParam(name = "unreadOnly", defaultValue = "false") boolean unreadOnly) {
        User user = getCurrentUser();
        return ResponseEntity.ok(notificationService.getNotifications(user.getId(), unreadOnly));
    }

    /** GET /api/users/me/notifications/unread-count — returns unread notification count */
    @GetMapping("/me/notifications/unread-count")
    public ResponseEntity<Map<String, Long>> unreadCount() {
        User user = getCurrentUser();
        return ResponseEntity.ok(Map.of("unreadCount", notificationService.unreadCount(user.getId())));
    }

    /** PATCH /api/users/me/notifications/{id}/read — mark a notification as read */
    @PatchMapping("/me/notifications/{id}/read")
    public ResponseEntity<NotificationResponse> markAsRead(@PathVariable Long id) {
        User user = getCurrentUser();
        return ResponseEntity.ok(notificationService.markAsRead(user.getId(), id));
    }

    /** POST /api/users/me/notifications/read-all — mark all notifications as read */
    @PostMapping("/me/notifications/read-all")
    public ResponseEntity<Map<String, Long>> markAllAsRead() {
        User user = getCurrentUser();
        long markedCount = notificationService.markAllAsRead(user.getId());
        return ResponseEntity.ok(Map.of("markedCount", markedCount));
    }
}
