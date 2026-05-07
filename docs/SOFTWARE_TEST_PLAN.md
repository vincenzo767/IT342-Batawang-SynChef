# SynChef - Comprehensive Software Test Plan

**Project**: SynChef - AI-Powered Real-Time Global Cooking Assistant  
**Date**: May 7, 2026  
**Branch**: `refactor/vertical-slice-architecture`  
**Scope**: Full Regression Testing

---

## 1. Executive Summary

This document defines the complete test strategy and test cases for SynChef application. It covers all functional requirements with comprehensive test cases, test scripts, and automated testing procedures.

**Test Objective**: Ensure that all features remain functional after vertical slice refactoring and no regressions are introduced.

---

## 2. Test Scope

### Included in Scope
- ✅ Backend API endpoints
- ✅ Frontend UI components
- ✅ Mobile application features
- ✅ WebSocket communication (timers)
- ✅ Database operations
- ✅ Authentication and authorization
- ✅ Data validation

### Out of Scope
- Performance testing
- Load testing
- Stress testing
- Security vulnerability scanning
- Browser compatibility (basic modern browsers only)

---

## 3. Functional Requirements and Test Coverage

### 3.1 Authentication Module

#### Requirement 1.1: User Registration
**Description**: Users can create a new account with email and password

**Test Cases**:

| TC ID | Test Case | Steps | Expected Result | Status |
|-------|-----------|-------|-----------------|--------|
| TC-AUTH-001 | Register with valid credentials | 1. Navigate to register page<br>2. Enter email<br>3. Enter password (min 8 chars)<br>4. Confirm password<br>5. Click register | Account created, redirect to login | ⏳ Pending |
| TC-AUTH-002 | Register with existing email | 1. Attempt to register with existing email | Error: "Email already exists" | ⏳ Pending |
| TC-AUTH-003 | Register with weak password | 1. Enter password < 8 characters | Error: "Password too weak" | ⏳ Pending |
| TC-AUTH-004 | Register with mismatched passwords | 1. Enter different passwords | Error: "Passwords don't match" | ⏳ Pending |
| TC-AUTH-005 | Register with invalid email | 1. Enter invalid email format | Error: "Invalid email" | ⏳ Pending |

#### Requirement 1.2: User Login
**Description**: Users can log in with credentials or Google OAuth

**Test Cases**:

| TC ID | Test Case | Steps | Expected Result | Status |
|-------|-----------|-------|-----------------|--------|
| TC-AUTH-006 | Login with valid credentials | 1. Enter email<br>2. Enter correct password<br>3. Click login | Logged in, redirect to home page | ⏳ Pending |
| TC-AUTH-007 | Login with incorrect password | 1. Enter correct email<br>2. Enter wrong password | Error: "Invalid credentials" | ⏳ Pending |
| TC-AUTH-008 | Login with non-existent email | 1. Enter email that doesn't exist | Error: "User not found" | ⏳ Pending |
| TC-AUTH-009 | Login with empty fields | 1. Leave email/password empty<br>2. Click login | Error: "Required fields missing" | ⏳ Pending |
| TC-AUTH-010 | JWT token validation | 1. Login successfully<br>2. Verify token in localStorage | Token exists, valid format | ⏳ Pending |

#### Requirement 1.3: Google OAuth Integration
**Description**: Users can sign in using Google account

**Test Cases**:

| TC ID | Test Case | Steps | Expected Result | Status |
|-------|-----------|-------|-----------------|--------|
| TC-AUTH-011 | OAuth login success | 1. Click "Login with Google"<br>2. Complete OAuth flow | Logged in, account linked | ⏳ Pending |
| TC-AUTH-012 | OAuth token refresh | 1. Login via OAuth<br>2. Wait for token expiry<br>3. Make API call | Token automatically refreshed | ⏳ Pending |

#### Requirement 1.4: User Profile Management
**Description**: Users can view and edit their profile

**Test Cases**:

| TC ID | Test Case | Steps | Expected Result | Status |
|-------|-----------|-------|-----------------|--------|
| TC-AUTH-013 | View profile | 1. Login<br>2. Click profile icon<br>3. View profile page | Profile displays correctly | ⏳ Pending |
| TC-AUTH-014 | Update profile | 1. Edit profile fields<br>2. Save changes | Changes persisted, confirmation shown | ⏳ Pending |
| TC-AUTH-015 | Logout | 1. Click logout | Token cleared, redirected to home | ⏳ Pending |

---

### 3.2 Recipe Discovery Module

#### Requirement 2.1: Browse All Recipes
**Description**: Users can browse and search recipes with filters

**Test Cases**:

| TC ID | Test Case | Steps | Expected Result | Status |
|-------|-----------|-------|-----------------|--------|
| TC-RECIPE-001 | Browse all recipes | 1. Navigate to home page<br>2. View recipe list | All recipes displayed with pagination | ⏳ Pending |
| TC-RECIPE-002 | Filter by category | 1. Select breakfast category<br>2. View filtered results | Only breakfast recipes shown | ⏳ Pending |
| TC-RECIPE-003 | Filter by multiple categories | 1. Select breakfast and lunch<br>2. View results | Recipes from both categories shown | ⏳ Pending |
| TC-RECIPE-004 | Search recipe by name | 1. Enter "Pasta" in search<br>2. View results | Only recipes with "Pasta" shown | ⏳ Pending |
| TC-RECIPE-005 | Search with no results | 1. Search for non-existent recipe | "No recipes found" message | ⏳ Pending |
| TC-RECIPE-006 | Clear all filters | 1. Apply filters<br>2. Click "Clear filters" | All recipes shown again | ⏳ Pending |

#### Requirement 2.2: View Recipe Details
**Description**: Users can view detailed recipe information

**Test Cases**:

| TC ID | Test Case | Steps | Expected Result | Status |
|-------|-----------|-------|-----------------|--------|
| TC-RECIPE-007 | View recipe details | 1. Click on a recipe<br>2. View detail page | Shows ingredients, steps, timing | ⏳ Pending |
| TC-RECIPE-008 | View ingredients list | 1. Open recipe details | Ingredients with quantities displayed | ⏳ Pending |
| TC-RECIPE-009 | View cooking steps | 1. Open recipe details<br>2. Scroll to steps | All steps visible with descriptions | ⏳ Pending |
| TC-RECIPE-010 | View preparation time | 1. Open recipe | Prep time displayed correctly | ⏳ Pending |

#### Requirement 2.3: Ingredient Scaling
**Description**: Users can scale ingredients based on servings

**Test Cases**:

| TC ID | Test Case | Steps | Expected Result | Status |
|-------|-----------|-------|-----------------|--------|
| TC-RECIPE-011 | Scale ingredients up | 1. Open recipe<br>2. Increase servings from 4 to 8 | All ingredient quantities doubled | ⏳ Pending |
| TC-RECIPE-012 | Scale ingredients down | 1. Open recipe<br>2. Decrease servings from 4 to 2 | All ingredient quantities halved | ⏳ Pending |
| TC-RECIPE-013 | Scale to 1 serving | 1. Set servings to 1 | Ingredient quantities correctly calculated | ⏳ Pending |
| TC-RECIPE-014 | Smart rounding | 1. Scale to fraction | Measurements rounded intelligently (e.g., 0.33 cup → ⅓ cup) | ⏳ Pending |

---

### 3.3 Flavor Map Module

#### Requirement 3.1: 3D Globe Visualization
**Description**: Users can interact with 3D rotating globe

**Test Cases**:

| TC ID | Test Case | Steps | Expected Result | Status |
|-------|-----------|-------|-----------------|--------|
| TC-FLAVOR-001 | Load 3D globe | 1. Navigate to Flavor Map<br>2. Wait for loading | Globe renders, auto-rotates | ⏳ Pending |
| TC-FLAVOR-002 | Rotate globe with mouse | 1. Click and drag on globe | Globe rotates smoothly | ⏳ Pending |
| TC-FLAVOR-003 | Zoom in/out | 1. Use mouse wheel on globe | Zoom in/out functionality works | ⏳ Pending |
| TC-FLAVOR-004 | View continent markers | 1. Observe globe | Continent markers visible | ⏳ Pending |

#### Requirement 3.2: Continent Selection
**Description**: Users can select continents to view associated countries

**Test Cases**:

| TC ID | Test Case | Steps | Expected Result | Status |
|-------|-----------|-------|-----------------|--------|
| TC-FLAVOR-005 | Select continent | 1. Click on Asia continent button | Asia countries displayed in grid | ⏳ Pending |
| TC-FLAVOR-006 | View continent info | 1. Hover over continent | Shows country count and description | ⏳ Pending |
| TC-FLAVOR-007 | Change continent | 1. Select Europe then Africa | Europe countries → Africa countries | ⏳ Pending |

#### Requirement 3.3: Country and Cuisine Selection
**Description**: Users can select countries to explore cuisines and recipes

**Test Cases**:

| TC ID | Test Case | Steps | Expected Result | Status |
|-------|-----------|-------|-----------------|--------|
| TC-FLAVOR-008 | Select country | 1. Click on Italy from Europe | Italy recipes displayed | ⏳ Pending |
| TC-FLAVOR-009 | View country info | 1. Hover over country card | Shows flag, name, description | ⏳ Pending |
| TC-FLAVOR-010 | Browse country recipes | 1. Select country | Recipes from that country shown | ⏳ Pending |
| TC-FLAVOR-011 | Cuisine information | 1. View country<br>2. Read cuisine description | Cultural context displayed | ⏳ Pending |

---

### 3.4 Cooking Execution Module

#### Requirement 4.1: Parallel Timer System
**Description**: Users can track multiple cooking tasks with parallel timers

**Test Cases**:

| TC ID | Test Case | Steps | Expected Result | Status |
|-------|-----------|-------|-----------------|--------|
| TC-COOKING-001 | Start cooking mode | 1. Open recipe in home<br>2. Click "Start Cooking" | Switches to cooking mode view | ⏳ Pending |
| TC-COOKING-002 | Create single timer | 1. Click on first step<br>2. Add 10 min timer | Timer created and starts counting | ⏳ Pending |
| TC-COOKING-003 | Create multiple timers | 1. Add multiple timers for different steps | All timers run in parallel | ⏳ Pending |
| TC-COOKING-004 | Timer countdown | 1. Start timer for 5 seconds<br>2. Observe countdown | Timer counts down correctly | ⏳ Pending |
| TC-COOKING-005 | Timer completion | 1. Wait for timer to complete | Notification shown, sound alert | ⏳ Pending |
| TC-COOKING-006 | Parallel execution | 1. Start 3 timers (5s, 10s, 15s)<br>2. Verify all run together | All timers progress independently | ⏳ Pending |
| TC-COOKING-007 | Stop timer | 1. Start timer<br>2. Click stop button | Timer stops | ⏳ Pending |

#### Requirement 4.2: Focus Mode
**Description**: One instruction visible at a time to prevent information overload

**Test Cases**:

| TC ID | Test Case | Steps | Expected Result | Status |
|-------|-----------|-------|-----------------|--------|
| TC-COOKING-008 | Enter focus mode | 1. In cooking mode<br>2. Click "Focus Mode" | Shows only current step | ⏳ Pending |
| TC-COOKING-009 | Navigate steps | 1. In focus mode<br>2. Click next button | Shows next step with animation | ⏳ Pending |
| TC-COOKING-010 | Go to previous step | 1. In focus mode<br>2. Click previous button | Shows previous step | ⏳ Pending |
| TC-COOKING-011 | Step indicator | 1. View focus mode | Shows "Step X of Y" | ⏳ Pending |

#### Requirement 4.3: WebSocket Real-Time Updates
**Description**: Real-time timer updates via WebSocket

**Test Cases**:

| TC ID | Test Case | Steps | Expected Result | Status |
|-------|-----------|-------|-----------------|--------|
| TC-COOKING-012 | WebSocket connection | 1. Open cooking mode<br>2. Start timer | WebSocket connects successfully | ⏳ Pending |
| TC-COOKING-013 | Real-time updates | 1. Multiple users start timers<br>2. Verify sync | All users see same timer values | ⏳ Pending |
| TC-COOKING-014 | Connection recovery | 1. Start timer<br>2. Simulate disconnect<br>3. Reconnect | Timer resumes correctly | ⏳ Pending |

---

### 3.5 AI Assistant Module

#### Requirement 5.1: Ingredient Substitutions
**Description**: AI suggests ingredient substitutions based on region and availability

**Test Cases**:

| TC ID | Test Case | Steps | Expected Result | Status |
|-------|-----------|-------|-----------------|--------|
| TC-AI-001 | Request substitution | 1. In cooking mode<br>2. Click "Suggest substitution"<br>3. Select ingredient | AI provides alternatives | ⏳ Pending |
| TC-AI-002 | Regional substitution | 1. Request substitution<br>2. Specify region | Culturally appropriate alternatives shown | ⏳ Pending |
| TC-AI-003 | Availability-based | 1. Request substitution<br>2. Mark ingredient unavailable | Suggestions for available items | ⏳ Pending |

#### Requirement 5.2: Cooking Tips
**Description**: AI provides personalized cooking tips

**Test Cases**:

| TC ID | Test Case | Steps | Expected Result | Status |
|-------|-----------|-------|-----------------|--------|
| TC-AI-004 | Request tips | 1. Click "Get Tips"<br>2. In cooking mode | Tips displayed for current step | ⏳ Pending |
| TC-AI-005 | Tips based on skill level | 1. Set skill level<br>2. Request tips | Tips match skill level | ⏳ Pending |

#### Requirement 5.3: Smart Recommendations
**Description**: AI provides timing optimization suggestions

**Test Cases**:

| TC ID | Test Case | Steps | Expected Result | Status |
|-------|-----------|-------|-----------------|--------|
| TC-AI-006 | Timing optimization | 1. AI analyzes steps<br>2. Suggests optimal timing | Suggestions improve efficiency | ⏳ Pending |

---

## 4. Test Execution Strategy

### 4.1 Test Environment Setup

**Backend**:
- Server: `http://localhost:8080`
- Database: PostgreSQL (local instance)
- Java: 17+
- Spring Boot: 3.3.0

**Frontend**:
- Server: `http://localhost:5173`
- Browser: Chrome/Firefox (latest)
- Node.js: 16+
- npm: 8+

**Mobile**:
- Android Studio: Latest
- Android 8+ emulator
- Real device: Android 10+

### 4.2 Test Execution Steps

#### Step 1: Setup
1. Clone refactor branch
2. Build backend: `mvn clean install`
3. Start backend: `mvn spring-boot:run`
4. Install frontend deps: `npm install`
5. Start frontend: `npm run dev`

#### Step 2: Manual Testing
1. Execute test cases from Test Cases table
2. Record results (Pass/Fail/Blocked)
3. Document bugs found
4. Create screenshots for issues

#### Step 3: Automated Testing
1. Run unit tests: `mvn test`
2. Run integration tests: `mvn verify`
3. Run frontend tests: `npm test`
4. Generate coverage report

#### Step 4: Regression Testing
1. Re-execute all test cases
2. Verify no new regressions
3. Document all findings

---

## 5. Automated Test Cases

### 5.1 Backend Automated Tests

#### Unit Test: AuthService
```java
@SpringBootTest
class AuthServiceTest {
    
    @Test
    void testRegisterUser_Success() {
        // Given
        RegisterRequest request = new RegisterRequest("user@test.com", "password123");
        
        // When
        AuthResponse response = authService.register(request);
        
        // Then
        assertNotNull(response.getToken());
        assertEquals("user@test.com", response.getEmail());
    }
    
    @Test
    void testLoginUser_WithValidCredentials() {
        // Test successful login
    }
    
    @Test
    void testLoginUser_WithInvalidPassword() {
        // Test login fails with wrong password
    }
}
```

#### Integration Test: RecipeController
```java
@SpringBootTest
@AutoConfigureMockMvc
class RecipeControllerTest {
    
    @Autowired
    private MockMvc mockMvc;
    
    @Test
    void testGetAllRecipes() throws Exception {
        mockMvc.perform(get("/api/recipes"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(greaterThan(0))));
    }
    
    @Test
    void testFilterRecipesByCategory() throws Exception {
        mockMvc.perform(get("/api/recipes?category=breakfast"))
            .andExpect(status().isOk());
    }
}
```

### 5.2 Frontend Automated Tests

#### Unit Test: Auth Slice
```typescript
import { configureStore } from '@reduxjs/toolkit';
import authReducer, { setUser, logout } from './authSlice';

describe('authSlice', () => {
    it('should set user on successful login', () => {
        const store = configureStore({ reducer: { auth: authReducer } });
        const user = { id: '1', email: 'test@test.com' };
        store.dispatch(setUser(user));
        expect(store.getState().auth.user).toEqual(user);
    });
    
    it('should clear user on logout', () => {
        const store = configureStore({ reducer: { auth: authReducer } });
        store.dispatch(logout());
        expect(store.getState().auth.user).toBeNull();
    });
});
```

#### Component Test: RecipeCard
```typescript
import { render, screen } from '@testing-library/react';
import RecipeCard from './RecipeCard';

describe('RecipeCard', () => {
    it('should render recipe with name and prep time', () => {
        const recipe = {
            id: '1',
            name: 'Pasta',
            prepTime: '20 min',
            difficulty: 'Medium'
        };
        render(<RecipeCard recipe={recipe} />);
        expect(screen.getByText('Pasta')).toBeInTheDocument();
        expect(screen.getByText('20 min')).toBeInTheDocument();
    });
});
```

---

## 6. Test Results Report Template

### Test Summary
| Metric | Value |
|--------|-------|
| Total Test Cases | - |
| Passed | - |
| Failed | - |
| Blocked | - |
| Pass Rate | - % |

### Issues Found

| Issue ID | Severity | Description | Status |
|----------|----------|-------------|--------|
| BUG-001 | Critical | - | - |
| BUG-002 | Major | - | - |

### Fixes Applied

| Fix ID | Issue | Changes | Status |
|--------|-------|---------|--------|
| FIX-001 | BUG-001 | - | - |

---

## 7. Sign-Off

**Test Lead**: ___________________  
**Date**: ___________________  
**Approved By**: ___________________  

---

**Document Version**: 1.0  
**Last Updated**: May 7, 2026  
**Status**: In Progress
