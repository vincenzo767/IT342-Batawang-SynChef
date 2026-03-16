package com.synchef.mobile.data

data class LoginRequest(
    val emailOrUsername: String,
    val password: String
)

data class RegisterRequest(
    val email: String,
    val username: String,
    val password: String,
    val confirmPassword: String,
    val fullName: String,
    val countryCode: String? = null,
    val countryName: String? = null
)

data class AuthResponse(
    val token: String,
    val type: String,
    val id: Long,
    val email: String,
    val username: String,
    val fullName: String?,
    val profileImageUrl: String?,
    val emailVerified: Boolean,
    val countryCode: String? = null,
    val countryName: String? = null,
    val favoriteRecipeIds: List<Long>? = null
)

data class ErrorResponse(
    val message: String?
)
