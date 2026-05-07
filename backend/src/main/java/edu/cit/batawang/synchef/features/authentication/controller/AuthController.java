package edu.cit.batawang.synchef.features.authentication.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import edu.cit.batawang.synchef.features.authentication.dto.LoginRequest;
import edu.cit.batawang.synchef.features.authentication.dto.RegisterRequest;
import edu.cit.batawang.synchef.features.authentication.dto.AuthResponse;
import edu.cit.batawang.synchef.features.authentication.service.AuthService;

/**
 * AuthController - Vertical Slice: Authentication Feature
 *
 * Handles user registration, login, and authentication operations.
 * This controller is part of the Authentication vertical slice.
 *
 * Endpoints:
 * - POST /api/auth/register - Register new user
 * - POST /api/auth/login - Login with credentials
 * - POST /api/auth/google - Login via Google OAuth
 * - GET /api/auth/validate-token - Validate JWT token
 * - POST /api/auth/logout - Logout user
 */
@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    /**
     * Register a new user
     *
     * @param request RegisterRequest containing email and password
     * @return AuthResponse with JWT token and user details
     */
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {
        try {
            AuthResponse response = authService.register(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    /**
     * Login with email and password
     *
     * @param request LoginRequest containing email and password
     * @return AuthResponse with JWT token and user details
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        try {
            AuthResponse response = authService.login(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }

    /**
     * Google OAuth login
     *
     * @param googleToken Token from Google OAuth
     * @return AuthResponse with JWT token
     */
    @PostMapping("/google")
    public ResponseEntity<AuthResponse> googleLogin(@RequestParam String googleToken) {
        try {
            AuthResponse response = authService.googleLogin(googleToken);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }

    /**
     * Validate JWT token
     *
     * @param token JWT token to validate
     * @return ResponseEntity with validation result
     */
    @GetMapping("/validate-token")
    public ResponseEntity<Boolean> validateToken(@RequestHeader("Authorization") String token) {
        boolean isValid = authService.validateToken(token);
        return ResponseEntity.ok(isValid);
    }

    /**
     * Logout user (client-side token cleanup)
     *
     * @return Success message
     */
    @PostMapping("/logout")
    public ResponseEntity<String> logout() {
        return ResponseEntity.ok("Logged out successfully");
    }
}
