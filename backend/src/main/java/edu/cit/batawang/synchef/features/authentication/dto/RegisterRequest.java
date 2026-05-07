package edu.cit.batawang.synchef.features.authentication.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * RegisterRequest DTO
 * Used for user registration
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {
    private String email;
    private String password;
    private String passwordConfirm;
    private String username;
}
