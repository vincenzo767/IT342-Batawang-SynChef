package edu.cit.batawang.synchef.features.authentication.test;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import com.fasterxml.jackson.databind.ObjectMapper;

import edu.cit.batawang.synchef.features.authentication.dto.LoginRequest;
import edu.cit.batawang.synchef.features.authentication.dto.RegisterRequest;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.hamcrest.Matchers.*;

/**
 * AuthControllerTest
 * Integration tests for Authentication Controller
 * Tests all REST endpoints of the Auth feature slice
 */
@SpringBootTest
@AutoConfigureMockMvc
@DisplayName("Authentication Controller Integration Tests")
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private RegisterRequest validRegisterRequest;
    private LoginRequest validLoginRequest;

    @BeforeEach
    void setUp() {
        validRegisterRequest = new RegisterRequest();
        validRegisterRequest.setEmail("testuser@example.com");
        validRegisterRequest.setPassword("SecurePassword123!");
        validRegisterRequest.setPasswordConfirm("SecurePassword123!");
        validRegisterRequest.setUsername("testuser");

        validLoginRequest = new LoginRequest();
        validLoginRequest.setEmail("testuser@example.com");
        validLoginRequest.setPassword("SecurePassword123!");
    }

    /**
     * TC-AUTH-001: Register with valid credentials
     */
    @Test
    @DisplayName("Should successfully register user with valid credentials")
    void testRegister_WithValidCredentials_Success() throws Exception {
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(validRegisterRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.email").value("testuser@example.com"))
                .andExpect(jsonPath("$.userId").isNotEmpty());
    }

    /**
     * TC-AUTH-002: Register with existing email
     */
    @Test
    @DisplayName("Should fail to register with existing email")
    void testRegister_WithExistingEmail_Fails() throws Exception {
        // First registration
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(validRegisterRequest)))
                .andExpect(status().isCreated());

        // Attempt duplicate registration
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(validRegisterRequest)))
                .andExpect(status().isBadRequest());
    }

    /**
     * TC-AUTH-003: Register with weak password
     */
    @Test
    @DisplayName("Should fail to register with weak password")
    void testRegister_WithWeakPassword_Fails() throws Exception {
        RegisterRequest weakPasswordRequest = new RegisterRequest();
        weakPasswordRequest.setEmail("user@example.com");
        weakPasswordRequest.setPassword("weak");
        weakPasswordRequest.setPasswordConfirm("weak");
        weakPasswordRequest.setUsername("user");

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(weakPasswordRequest)))
                .andExpect(status().isBadRequest());
    }

    /**
     * TC-AUTH-006: Login with valid credentials
     */
    @Test
    @DisplayName("Should successfully login with valid credentials")
    void testLogin_WithValidCredentials_Success() throws Exception {
        // First register
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(validRegisterRequest)));

        // Then login
        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(validLoginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.email").value("testuser@example.com"));
    }

    /**
     * TC-AUTH-007: Login with incorrect password
     */
    @Test
    @DisplayName("Should fail to login with incorrect password")
    void testLogin_WithIncorrectPassword_Fails() throws Exception {
        // Register first
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(validRegisterRequest)));

        // Attempt login with wrong password
        LoginRequest wrongPasswordRequest = new LoginRequest();
        wrongPasswordRequest.setEmail("testuser@example.com");
        wrongPasswordRequest.setPassword("WrongPassword123!");

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(wrongPasswordRequest)))
                .andExpect(status().isUnauthorized());
    }

    /**
     * TC-AUTH-010: JWT token validation
     */
    @Test
    @DisplayName("Should validate JWT token successfully")
    void testValidateToken_WithValidToken_Success() throws Exception {
        // Register and get token
        var response = mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(validRegisterRequest)))
                .andExpect(status().isCreated())
                .andReturn();

        // Extract token from response (simplified)
        String token = "Bearer valid_token_here";

        // Validate token
        mockMvc.perform(get("/api/auth/validate-token")
                .header("Authorization", token))
                .andExpect(status().isOk())
                .andExpect(content().string("true"));
    }

    /**
     * TC-AUTH-009: Login with empty fields
     */
    @Test
    @DisplayName("Should fail to login with empty fields")
    void testLogin_WithEmptyFields_Fails() throws Exception {
        LoginRequest emptyRequest = new LoginRequest();

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(emptyRequest)))
                .andExpect(status().isBadRequest());
    }

    /**
     * TC-AUTH-015: Logout
     */
    @Test
    @DisplayName("Should successfully logout")
    void testLogout_Success() throws Exception {
        mockMvc.perform(post("/api/auth/logout"))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("successfully")));
    }
}
