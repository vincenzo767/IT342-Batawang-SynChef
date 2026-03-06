# Quick Start Guide - Phase 1 Implementation

## ✅ Status: COMPLETED AND READY TO USE

All User Registration and Login features are fully implemented, tested, and verified.

---

## Prerequisites
- Java 17+ installed
- Node.js 18+ and npm installed
- Maven installed

---

## Running the Application

### Step 1: Start the Backend Server
```bash
cd backend
java -jar target/synchef-backend-1.0.0.jar
```
- Server starts on: `http://localhost:8080`
- Wait for message: `Tomcat started on port(s): 8080`

### Step 2: Start the Frontend Development Server
```bash
cd web/frontend
npm run dev
```
- Frontend starts on: `http://localhost:3001` (or next available port)
- Look for message: `VITE ready in XXX ms`

### Step 3: Open Browser
- Navigate to: `http://localhost:3001`
- You will see the home page

---

## Testing the Features

### Test 1: User Registration
1. Click on "Sign Up" link or navigate to `/register`
2. Fill in the form:
   - **Full Name:** John Doe
   - **Email:** john@example.com
   - **Username:** johndoe
   - **Password:** password123
   - **Confirm Password:** password123
3. Click "Sign Up"
4. **Expected Result:** Redirect to dashboard with "Welcome back" message
5. ✅ **Feature Verified:** User registered successfully

### Test 2: Verify Duplicate Email Prevention
1. Try to register again with the same email
2. **Expected Result:** Error message "Email already registered"
3. ✅ **Feature Verified:** Duplicate emails prevented

### Test 3: User Login with Email
1. Logout or go to `/login`
2. Enter credentials:
   - **Email or Username:** john@example.com
   - **Password:** password123
3. Click "Sign In"
4. **Expected Result:** Redirect to dashboard
5. ✅ **Feature Verified:** Login with email works

### Test 4: User Login with Username
1. Logout or go to `/login`
2. Enter credentials:
   - **Email or Username:** johndoe
   - **Password:** password123
3. Click "Sign In"
4. **Expected Result:** Redirect to dashboard
5. ✅ **Feature Verified:** Login with username works

### Test 5: Invalid Login Prevention
1. Go to `/login`
2. Enter credentials:
   - **Email or Username:** john@example.com
   - **Password:** wrongpassword
3. Click "Sign In"
4. **Expected Result:** Error message "Invalid password"
5. ✅ **Feature Verified:** Invalid credentials prevented

### Test 6: Form Validation
1. Go to `/register`
2. Try to submit with empty fields
3. **Expected Result:** Validation error messages appear
4. Try invalid email format
5. **Expected Result:** Error "Invalid email format"
6. Try password < 6 characters
7. **Expected Result:** Error "Password must be at least 6 characters"
8. ✅ **Feature Verified:** Form validation works

### Test 7: Protected Routes
1. Logout (if logged in)
2. Try to navigate to `/dashboard`
3. **Expected Result:** Redirect to `/login`
4. Login with valid credentials
5. Click on dashboard, profile, or settings
6. **Expected Result:** Can access protected pages
7. ✅ **Feature Verified:** Route protection works

---

## API Endpoints

### POST /api/auth/register
Register a new user

**Request Body:**
```json
{
  "email": "user@example.com",
  "username": "username",
  "fullName": "User Name",
  "password": "password123",
  "confirmPassword": "password123"
}
```

**Response (201 Created):**
```json
{
  "token": "eyJhbGciOiJIUzM4NCJ9...",
  "type": "Bearer",
  "id": 1,
  "email": "user@example.com",
  "username": "username",
  "fullName": "User Name",
  "profileImageUrl": null,
  "emailVerified": false
}
```

### POST /api/auth/login
Login a user

**Request Body:**
```json
{
  "emailOrUsername": "user@example.com",
  "password": "password123"
}
```

**Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzM4NCJ9...",
  "type": "Bearer",
  "id": 1,
  "email": "user@example.com",
  "username": "username",
  "fullName": "User Name",
  "profileImageUrl": null,
  "emailVerified": false
}
```

**Error Responses:**
- `400 Bad Request` - Invalid input or duplicate email/username
- `401 Unauthorized` - Invalid credentials or account inactive

---

## Database

### View Data (H2 Console)
During development, you can view the database:
1. Open: `http://localhost:8080/h2-console`
2. Click "Connect"
3. Query: `SELECT * FROM users;`

### Database Tables
- `users` - User accounts with email, username, password (hashed)
- `user_dietary_restrictions` - User dietary preferences
- `user_allergies` - User allergen preferences
- `user_favorite_recipes` - User favorite recipes

---

## Features Implemented ✅

### User Registration
- ✅ Name (Full Name) field
- ✅ Email field with validation
- ✅ Username field with validation
- ✅ Password field with confirmation
- ✅ Required field validation
- ✅ Duplicate email prevention
- ✅ Secure password hashing (BCrypt)
- ✅ Database storage

### User Login
- ✅ Email or Username field
- ✅ Password field
- ✅ Database credential validation
- ✅ Invalid credential prevention
- ✅ JWT token generation
- ✅ Session management
- ✅ Route protection

### Security
- ✅ Passwords hashed with BCrypt
- ✅ JWT tokens (24-hour expiration)
- ✅ CORS configured
- ✅ Unique constraints on email and username
- ✅ Account active check
- ✅ Input validation

---

## Troubleshooting

### Backend won't start
- **Issue:** Port 8080 already in use
- **Solution:** Kill existing process: `taskkill /F /IM java.exe` or use different port

### Frontend won't start
- **Issue:** Port 3000/3001 already in use
- **Solution:** Vite will automatically try next port, or kill existing process

### Can't connect to backend from frontend
- **Issue:** Backend not running
- **Solution:** Make sure backend is started first: `java -jar target/synchef-backend-1.0.0.jar`

### CORS Error
- **Issue:** Frontend and backend on different ports but request fails
- **Solution:** Ensure backend is running on `http://localhost:8080`

### Password hashing errors
- **Issue:** Password won't hash correctly
- **Solution:** Ensure BCrypt dependency is included in pom.xml (already included)

### Lost session data
- **Issue:** Refresh page and logged in user gone
- **Solution:** Redux state is persisted to localStorage, should persist across refresh. Check browser DevTools > Application > LocalStorage

---

## Development Notes

### Key Files
- **Backend Auth:** `backend/src/main/java/com/synchef/service/AuthService.java`
- **Frontend Registration:** `web/frontend/src/pages/RegisterPage.tsx`
- **Frontend Login:** `web/frontend/src/pages/LoginPage.tsx`
- **API Client:** `web/frontend/src/services/authAPI.ts`
- **Redux Store:** `web/frontend/src/store/authSlice.ts`

### Configuration Files
- **Backend Config:** `backend/src/main/resources/application.properties`
  - Database connection
  - JWT secret (change in production!)
  - CORS origins

- **Frontend Routes:** `web/frontend/src/App.tsx`
  - Public routes: `/`, `/register`, `/login`
  - Protected routes: `/dashboard`, `/profile`, `/settings`

---

## Next Steps (Phase 2)

After Phase 1, the following can be implemented:
1. Email verification
2. Password reset functionality
3. User profile updates
4. OAuth/Social login
5. Two-factor authentication
6. Additional user preferences
7. User activity logging

---

## Summary

✅ **All requirements met and tested**
- User Registration: Complete
- User Login: Complete
- Security: Implemented
- Database: Operational
- Frontend UI: Functional
- API: Fully working

**Ready for Phase 2 development!**

---

Generated: March 6, 2026  
Status: Production Ready (with noted production configuration items)
