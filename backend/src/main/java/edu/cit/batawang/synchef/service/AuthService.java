package edu.cit.batawang.synchef.service;

import edu.cit.batawang.synchef.dto.AuthResponse;
import edu.cit.batawang.synchef.dto.LoginRequest;
import edu.cit.batawang.synchef.dto.RegisterRequest;
import edu.cit.batawang.synchef.model.User;
import edu.cit.batawang.synchef.repository.UserRepository;
import edu.cit.batawang.synchef.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

/**
 * Service for user authentication and registration
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {
    
    private final UserRepository userRepository;
    private final JwtTokenProvider tokenProvider;
    private static final PasswordEncoder PASSWORD_ENCODER = new BCryptPasswordEncoder();
    
    /**
     * Register a new user
     */
    public AuthResponse register(RegisterRequest request) {
        String email = normalize(request.getEmail());
        String username = normalize(request.getUsername());
        String fullName = normalize(request.getFullName());

        if (isBlank(email) || isBlank(username) || isBlank(fullName)) {
            throw new IllegalArgumentException("Email, username, and full name are required");
        }

        if (isBlank(request.getPassword()) || isBlank(request.getConfirmPassword())) {
            throw new IllegalArgumentException("Password and confirm password are required");
        }

        // Validate password match
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new IllegalArgumentException("Passwords do not match");
        }
        
        // Check if email already exists
        if (userRepository.findByEmail(email).isPresent()) {
            throw new IllegalArgumentException("Email already registered");
        }
        
        // Check if username already exists
        if (userRepository.findByUsername(username).isPresent()) {
            throw new IllegalArgumentException("Username already taken");
        }
        
        // Create new user
        User user = new User();
        user.setEmail(email);
        user.setUsername(username);
        user.setPassword(PASSWORD_ENCODER.encode(request.getPassword()));
        user.setFullName(fullName);
        user.setEmailVerified(false);
        user.setActive(true);
        if (!isBlank(request.getCountryCode())) {
            user.setCountryCode(request.getCountryCode().toUpperCase().trim());
        }
        if (!isBlank(request.getCountryName())) {
            user.setCountryName(request.getCountryName().trim());
        }
        
        user = userRepository.save(user);
        
        log.info("User registered: {}", user.getEmail());
        
        return buildAuthResponse(user);
    }
    
    /**
     * Login user with email/username and password
     */
    public AuthResponse login(LoginRequest request) {
        String emailOrUsername = normalize(request.getEmailOrUsername());
        if (isBlank(emailOrUsername) || isBlank(request.getPassword())) {
            throw new IllegalArgumentException("Email/username and password are required");
        }

        // Find user by email or username
        Optional<User> userOpt = userRepository.findByEmail(emailOrUsername)
                .or(() -> userRepository.findByUsername(emailOrUsername));
        
        if (userOpt.isEmpty()) {
            throw new IllegalArgumentException("Invalid email or username");
        }
        
        User user = userOpt.get();
        
        if (isBlank(user.getPassword())) {
            throw new IllegalArgumentException("Password login is unavailable for this account.");
        }

        // Support both legacy plain-text and BCrypt-hashed passwords
        boolean passwordMatches = PASSWORD_ENCODER.matches(request.getPassword(), user.getPassword())
                || user.getPassword().equals(request.getPassword());

        if (!passwordMatches) {
            throw new IllegalArgumentException("Invalid password");
        }

        // Upgrade legacy plain-text password to BCrypt after successful login
        if (user.getPassword().equals(request.getPassword())) {
            user.setPassword(PASSWORD_ENCODER.encode(request.getPassword()));
            userRepository.save(user);
        }
        
        if (!Boolean.TRUE.equals(user.getActive())) {
            throw new IllegalArgumentException("Account is inactive");
        }
        
        log.info("User logged in: {}", user.getEmail());
        
        return buildAuthResponse(user);
    }
    
    /**
     * Build AuthResponse from User entity
     */
    private AuthResponse buildAuthResponse(User user) {
        String token = tokenProvider.generateToken(user);

        AuthResponse response = new AuthResponse();
        response.setToken(token);
        response.setType("Bearer");
        response.setId(user.getId());
        response.setEmail(user.getEmail());
        response.setUsername(user.getUsername());
        response.setFullName(user.getFullName());
        response.setProfileImageUrl(user.getProfileImageUrl());
        response.setEmailVerified(user.getEmailVerified());
        response.setCountryCode(user.getCountryCode());
        response.setCountryName(user.getCountryName());
        response.setFavoriteRecipeIds(
            user.getFavoriteRecipeIds() != null ? user.getFavoriteRecipeIds() : new java.util.ArrayList<>()
        );
        response.setCreatedAt(user.getCreatedAt());

        return response;
    }
    
    private String normalize(String value) {
        return value == null ? null : value.trim();
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }

}
