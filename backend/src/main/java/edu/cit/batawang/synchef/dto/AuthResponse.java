package edu.cit.batawang.synchef.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * DTO for authentication response with JWT token
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private String type = "Bearer";
    private Long id;
    private String email;
    private String username;
    private String fullName;
    private String profileImageUrl;
    private Boolean emailVerified;
    private String countryCode;
    private String countryName;
    private List<Long> favoriteRecipeIds = new ArrayList<>();
    private LocalDateTime createdAt;
}
