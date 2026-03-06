# IT342 Phase 1 – User Registration and Login
## Implementation Summary

**Project:** SynChef - Smart Recipe Companion  
**Group:** IT342_G5 - Batawang  
**Date:** March 6, 2026  
**Phase:** 1 - User Authentication  

---

## 1. User Registration

### Registration Fields
The system collects the following information during user registration:
- **Email** - Required, unique identifier for the user account
- **Username** - Required, unique username for login
- **Full Name** - Required, user's display name
- **Password** - Required, must match confirmation password
- **Confirm Password** - Required, validates password entry

### Validation Process
The registration process implements comprehensive validation:

1. **Required Field Validation**: All fields (email, username, full name, password, confirmPassword) must be provided
2. **Password Match Validation**: Password and confirmPassword must match exactly
3. **Duplicate Email Prevention**: System checks if email already exists in database before registration
4. **Duplicate Username Prevention**: System checks if username already exists in database
5. **Input Normalization**: Email and username are normalized (trimmed whitespace) before processing

### Duplicate Account Prevention
The system prevents duplicate accounts through multiple mechanisms:

**Database Level:**
- Unique constraints on `email` column in `users` table
- Unique constraints on `username` column in `users` table
- PostgreSQL-compatible database enforces uniqueness at data layer

**Application Level:**
- `UserRepository.findByEmail()` checks existence before creating account
- `UserRepository.findByUsername()` checks existence before creating account
- Returns HTTP 400 Bad Request with descriptive error message if duplicate detected

### Password Security
Passwords are stored securely using industry best practices:

- **Hashing Algorithm**: BCrypt with automatic salt generation
- **Implementation**: Spring Security's `BCryptPasswordEncoder`
- **Storage**: Only hashed passwords stored in database (never plain text)
- **Hash Format**: BCrypt produces 60-character hashes with embedded salt
- **Example Hash**: `$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy`
- **Verification**: Password verification uses BCrypt's time-constant comparison to prevent timing attacks

---

## 2. User Login

### Login Credentials
Users can authenticate using **either** of the following:
- **Email** + Password
- **Username** + Password

The system accepts both authentication methods through a single flexible endpoint that checks both fields.

### User Verification Process
The login process follows these steps:

1. **Input Validation**: Ensures email/username and password are provided
2. **User Lookup**: Searches database for user by email OR username
3. **Existence Check**: Returns 401 Unauthorized if user not found
4. **Password Verification**: Uses BCrypt to verify password against stored hash
5. **Account Status Check**: Verifies account is active before allowing login
6. **Token Generation**: Creates JWT token for authenticated session

### Post-Login Behavior
Upon successful authentication, the system:

1. **Generates JWT Token**: Creates signed token with user information
   - Token expiration: 24 hours (86400000 ms)
   - Signing algorithm: HMAC-SHA384
   - Claims included: userId, email, username, fullName

2. **Returns Authentication Response** (HTTP 200 OK):
   ```json
   {
     "token": "eyJhbGciOiJIUzM4NCJ9...",
     "type": "Bearer",
     "id": 2,
     "email": "user@example.com",
     "username": "username",
     "fullName": "User Name",
     "profileImageUrl": null,
     "emailVerified": false
   }
   ```

3. **Frontend Integration**: React application:
   - Stores JWT token in Redux state and localStorage
   - Sets Authorization header for subsequent API requests
   - Redirects user to Dashboard (/dashboard)
   - Maintains authentication state across page refreshes

---

## 3. Database Table

### Table: `users`

**Columns:**

| Column Name | Data Type | Constraints | Description |
|------------|-----------|-------------|-------------|
| `id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Unique user identifier |
| `email` | VARCHAR(100) | NOT NULL, UNIQUE | User's email address |
| `username` | VARCHAR(100) | NOT NULL, UNIQUE | User's username |
| `password` | VARCHAR(255) | NULLABLE | BCrypt hashed password (nullable for OAuth users) |
| `full_name` | VARCHAR(200) | NOT NULL | User's full display name |
| `profile_image_url` | VARCHAR(255) | NULLABLE | URL to user's profile picture |
| `email_verified` | BOOLEAN | NOT NULL, DEFAULT FALSE | Email verification status |
| `active` | BOOLEAN | NOT NULL, DEFAULT TRUE | Account active status |
| `created_at` | TIMESTAMP | NOT NULL, AUTO | Account creation timestamp |
| `updated_at` | TIMESTAMP | NOT NULL, AUTO | Last update timestamp |
| `preferred_unit_system` | VARCHAR(20) | DEFAULT 'METRIC' | User's measurement preference |
| `skill_level` | VARCHAR(20) | DEFAULT 'BEGINNER' | User's cooking skill level |

**Additional Tables (Related):**
- `user_dietary_restrictions` - Stores user's dietary restrictions
- `user_allergies` - Stores user's food allergies
- `user_favorite_recipes` - Stores user's favorite recipe IDs

---

## 4. API Endpoints

### Registration Endpoint
**POST** `/api/auth/register`

**Request Body:**
```json
{
  "email": "user@example.com",
  "username": "username",
  "password": "SecurePassword123",
  "confirmPassword": "SecurePassword123",
  "fullName": "John Doe"
}
```

**Success Response (HTTP 201 Created):**
```json
{
  "token": "eyJhbGciOiJIUzM4NCJ9...",
  "type": "Bearer",
  "id": 1,
  "email": "user@example.com",
  "username": "username",
  "fullName": "John Doe",
  "profileImageUrl": null,
  "emailVerified": false
}
```

**Error Response (HTTP 400 Bad Request):**
```json
{
  "message": "Email already registered"
}
```

### Login Endpoint
**POST** `/api/auth/login`

**Request Body:**
```json
{
  "emailOrUsername": "user@example.com",
  "password": "SecurePassword123"
}
```

**Success Response (HTTP 200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzM8NCJ9...",
  "type": "Bearer",
  "id": 1,
  "email": "user@example.com",
  "username": "username",
  "fullName": "John Doe",
  "profileImageUrl": null,
  "emailVerified": false
}
```

**Error Response (HTTP 401 Unauthorized):**
```json
{
  "message": "Invalid password"
}
```

---

## 5. Technology Stack

**Backend:**
- Spring Boot 3.2.2
- Java 17
- Spring Security with BCrypt
- JWT Authentication (JJWT 0.12.3)
- H2 Database (Development) / PostgreSQL (Production Compatible)
- Maven Build System

**Frontend:**
- React 18.2.0
- TypeScript 5.2.2
- Redux Toolkit 2.1.0
- Vite 5.0.12
- Axios for API communication

---

## 6. Testing Results

All Phase 1 requirements have been implemented and tested successfully:

✅ **User Registration** - Creates new accounts with validation  
✅ **User Login (Email)** - Authenticates using email + password  
✅ **User Login (Username)** - Authenticates using username + password  
✅ **Invalid Credentials Rejection** - Returns 401 for wrong password  
✅ **Duplicate Email Prevention** - Returns 400 for existing email  
✅ **Password Hashing** - BCrypt encryption verified  
✅ **JWT Token Generation** - 24-hour tokens with user claims  
✅ **Database Integration** - User data persisted correctly  
✅ **Frontend Integration** - React pages functional with Redux state management  

---

## 7. Conclusion

Phase 1 implementation successfully delivers secure user authentication with registration and login capabilities. The system follows security best practices with BCrypt password hashing, JWT token-based authentication, and comprehensive input validation. All specified requirements from the Software Design Document have been implemented and tested.

**Status:** ✅ Phase 1 Complete and Production Ready
