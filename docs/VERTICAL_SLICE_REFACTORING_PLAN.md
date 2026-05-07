# SynChef - Vertical Slice Architecture Refactoring Plan

**Date**: May 7, 2026  
**Branch**: `refactor/vertical-slice-architecture`  
**Due Date**: May 9, 2026

---

## 📋 Executive Summary

This document outlines the complete vertical slice refactoring of the SynChef application. Vertical Slice Architecture organizes code by feature/domain rather than technical layers, improving maintainability, scalability, and team autonomy.

---

## 1. Current Architecture (Layered)

### Backend Structure
```
backend/
└── src/main/java/edu/cit/batawang/synchef/
    ├── controller/          ← HTTP Layer
    ├── service/             ← Business Logic Layer
    ├── repository/          ← Data Access Layer
    ├── model/               ← Entity Layer
    ├── dto/                 ← DTO Layer
    ├── config/
    └── security/
```

### Frontend Structure
```
web/frontend/
├── src/
│   ├── components/          ← UI Components
│   ├── pages/               ← Pages/Routes
│   ├── store/               ← State Management
│   ├── api/                 ← API Client
│   └── types/               ← Types
```

### Mobile Structure
```
mobile/app/
└── src/
    ├── main/
    │   ├── java/.../
    │   │   ├── activity/    ← Presentation Layer
    │   │   ├── model/       ← Data Model Layer
    │   │   ├── service/     ← Service Layer
    │   │   ├── adapter/     ← Adapter Layer
    │   │   └── util/        ← Utilities
    │   └── res/             ← Resources
```

---

## 2. Target Vertical Slice Architecture

### Core Principle
**One slice = One complete feature from UI to Database**

Each slice includes:
- Frontend UI components
- Backend API endpoints
- Business logic
- Data models
- Tests

### Identified Vertical Slices

#### Backend Slices
1. **Authentication Slice**
   - User registration, login, JWT, OAuth
   - User profile management
   
2. **Recipe Discovery Slice**
   - Browse recipes, search, filtering
   - Recipe details, ingredients, steps
   
3. **Flavor Map Slice**
   - 3D globe visualization
   - Country/continent data
   - Cuisine information
   
4. **Cooking Execution Slice**
   - Timer orchestration
   - Step-by-step progression
   - Ingredient scaling
   
5. **AI Assistant Slice**
   - Ingredient substitutions
   - Cooking tips
   - Smart suggestions

#### Frontend Slices
1. **Auth Slice**
   - Login, Register, Profile pages
   - OAuth integration
   
2. **Recipe Discovery Slice**
   - Recipe browsing, search, filters
   - Recipe detail view
   
3. **Flavor Map Slice**
   - 3D globe component
   - Country/cuisine selection
   
4. **Cooking Mode Slice**
   - Focus mode UI
   - Timer controls
   - Step progression
   
5. **AI Features Slice**
   - Substitution suggestions
   - Tips and recommendations

#### Mobile Slices
1. **Authentication Slice**
2. **Recipe Discovery Slice**
3. **Cooking Execution Slice**
4. **User Profile Slice**

---

## 3. New Directory Structure

### Backend New Structure
```
backend/
├── src/main/java/edu/cit/batawang/synchef/
│   ├── SynChefApplication.java
│   ├── config/              ← Shared configs
│   │   ├── CorsConfig.java
│   │   ├── WebSocketConfig.java
│   │   ├── AIConfiguration.java
│   │   └── SecurityConfig.java
│   │
│   ├── shared/              ← Shared utilities & DTOs
│   │   ├── dto/
│   │   ├── exception/
│   │   └── util/
│   │
│   └── features/            ← Vertical Slices
│       ├── authentication/
│       │   ├── dto/
│       │   │   ├── LoginRequest.java
│       │   │   ├── RegisterRequest.java
│       │   │   └── AuthResponse.java
│       │   ├── entity/
│       │   │   └── User.java
│       │   ├── controller/
│       │   │   └── AuthController.java
│       │   ├── service/
│       │   │   └── AuthService.java
│       │   ├── repository/
│       │   │   └── UserRepository.java
│       │   ├── security/
│       │   │   └── JwtTokenProvider.java
│       │   └── test/
│       │       └── AuthServiceTest.java
│       │
│       ├── recipeDiscovery/
│       │   ├── dto/
│       │   │   ├── RecipeDTO.java
│       │   │   ├── IngredientDTO.java
│       │   │   └── SearchRequest.java
│       │   ├── entity/
│       │   │   ├── Recipe.java
│       │   │   ├── Ingredient.java
│       │   │   ├── Category.java
│       │   │   └── RecipeIngredient.java
│       │   ├── controller/
│       │   │   └── RecipeController.java
│       │   ├── service/
│       │   │   ├── RecipeService.java
│       │   │   └── SearchService.java
│       │   ├── repository/
│       │   │   ├── RecipeRepository.java
│       │   │   ├── IngredientRepository.java
│       │   │   ├── CategoryRepository.java
│       │   │   └── RecipeIngredientRepository.java
│       │   └── test/
│       │       └── RecipeServiceTest.java
│       │
│       ├── flavorMap/
│       │   ├── dto/
│       │   │   ├── CountryDTO.java
│       │   │   ├── ContinentDTO.java
│       │   │   └── CuisineDTO.java
│       │   ├── entity/
│       │   │   ├── Country.java
│       │   │   ├── Continent.java
│       │   │   └── Cuisine.java
│       │   ├── controller/
│       │   │   └── FlavorMapController.java
│       │   ├── service/
│       │   │   ├── CountryService.java
│       │   │   └── ContinentService.java
│       │   ├── repository/
│       │   │   ├── CountryRepository.java
│       │   │   └── ContinentRepository.java
│       │   └── test/
│       │       └── FlavorMapServiceTest.java
│       │
│       ├── cookingExecution/
│       │   ├── dto/
│       │   │   ├── TimerOrchestrationDTO.java
│       │   │   ├── ScaledRecipeDTO.java
│       │   │   ├── StepProgressDTO.java
│       │   │   └── TimerSequenceDTO.java
│       │   ├── entity/
│       │   │   ├── Step.java
│       │   │   └── CookingSession.java
│       │   ├── controller/
│       │   │   ├── CookingController.java
│       │   │   └── TimerWebSocketController.java
│       │   ├── service/
│       │   │   ├── TimerOrchestrationService.java
│       │   │   ├── RecipeScalingService.java
│       │   │   └── StepProgressService.java
│       │   ├── repository/
│       │   │   └── CookingSessionRepository.java
│       │   └── test/
│       │       ├── TimerOrchestrationServiceTest.java
│       │       └── RecipeScalingServiceTest.java
│       │
│       └── aiAssistant/
│           ├── dto/
│           │   ├── SubstitutionRequest.java
│           │   ├── SubstitutionResponse.java
│           │   ├── TipRequest.java
│           │   └── TipResponse.java
│           ├── controller/
│           │   └── AIController.java
│           ├── service/
│           │   ├── AIAssistantService.java
│           │   ├── SubstitutionService.java
│           │   └── TipsService.java
│           └── test/
│               └── AIAssistantServiceTest.java
│
└── src/test/java/          ← Integration & End-to-End Tests
```

### Frontend New Structure
```
web/frontend/src/
├── features/                ← Vertical Slices
│   ├── auth/
│   │   ├── components/
│   │   │   ├── LoginForm.tsx
│   │   │   ├── RegisterForm.tsx
│   │   │   └── ProfileDropdown.tsx
│   │   ├── pages/
│   │   │   ├── LoginPage.tsx
│   │   │   ├── RegisterPage.tsx
│   │   │   └── ProfilePage.tsx
│   │   ├── store/
│   │   │   └── authSlice.ts
│   │   ├── api/
│   │   │   └── authAPI.ts
│   │   ├── types/
│   │   │   └── auth.types.ts
│   │   └── hooks/
│   │       └── useAuth.ts
│   │
│   ├── recipeDiscovery/
│   │   ├── components/
│   │   │   ├── RecipeCard.tsx
│   │   │   ├── RecipeFilter.tsx
│   │   │   └── RecipeSearch.tsx
│   │   ├── pages/
│   │   │   ├── HomePage.tsx
│   │   │   └── RecipeDetailPage.tsx
│   │   ├── store/
│   │   │   └── recipeSlice.ts
│   │   ├── api/
│   │   │   └── recipeAPI.ts
│   │   ├── types/
│   │   │   └── recipe.types.ts
│   │   └── hooks/
│   │       └── useRecipe.ts
│   │
│   ├── flavorMap/
│   │   ├── components/
│   │   │   ├── GlobeVisualization.tsx
│   │   │   ├── ContinentSelector.tsx
│   │   │   └── CountrySelector.tsx
│   │   ├── pages/
│   │   │   └── FlavorMapPage.tsx
│   │   ├── store/
│   │   │   └── flavorMapSlice.ts
│   │   ├── api/
│   │   │   └── flavorMapAPI.ts
│   │   ├── types/
│   │   │   └── flavorMap.types.ts
│   │   └── hooks/
│   │       └── useFlavorMap.ts
│   │
│   ├── cookingMode/
│   │   ├── components/
│   │   │   ├── FocusModeUI.tsx
│   │   │   ├── TimerControls.tsx
│   │   │   ├── StepProgress.tsx
│   │   │   └── IngredientScaling.tsx
│   │   ├── pages/
│   │   │   └── CookingModePage.tsx
│   │   ├── store/
│   │   │   └── cookingSlice.ts
│   │   ├── api/
│   │   │   └── cookingAPI.ts
│   │   ├── types/
│   │   │   └── cooking.types.ts
│   │   └── hooks/
│   │       └── useCooking.ts
│   │
│   └── aiFeatures/
│       ├── components/
│       │   ├── SubstitutionPanel.tsx
│       │   ├── TipsPanel.tsx
│       │   └── AIRecommendations.tsx
│       ├── api/
│       │   └── aiAPI.ts
│       ├── types/
│       │   └── ai.types.ts
│       └── hooks/
│           └── useAI.ts
│
├── shared/                  ← Shared utilities
│   ├── components/
│   │   ├── Navigation.tsx
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── Layout.tsx
│   ├── store/
│   │   └── store.ts
│   ├── api/
│   │   └── axiosClient.ts
│   ├── types/
│   │   └── common.types.ts
│   ├── hooks/
│   │   └── useAuth.ts
│   ├── utils/
│   │   ├── formatters.ts
│   │   ├── validators.ts
│   │   └── constants.ts
│   └── styles/
│       ├── theme.css
│       └── globals.css
│
├── App.tsx
├── main.tsx
└── index.css
```

### Mobile New Structure
```
mobile/app/src/main/java/edu/cit/batawang/synchef/
├── features/
│   ├── auth/
│   │   ├── presentation/
│   │   │   ├── LoginActivity.kt
│   │   │   ├── RegisterActivity.kt
│   │   │   └── ProfileActivity.kt
│   │   ├── domain/
│   │   │   ├── UserRepository.kt
│   │   │   └── AuthUseCase.kt
│   │   └── data/
│   │       ├── AuthService.kt
│   │       └── UserPreferences.kt
│   │
│   ├── recipes/
│   │   ├── presentation/
│   │   │   ├── RecipeListActivity.kt
│   │   │   ├── RecipeDetailActivity.kt
│   │   │   └── adapters/RecipeAdapter.kt
│   │   ├── domain/
│   │   │   ├── RecipeRepository.kt
│   │   │   └── RecipeUseCase.kt
│   │   └── data/
│   │       ├── RecipeService.kt
│   │       └── RecipeDatabase.kt
│   │
│   ├── cookingMode/
│   │   ├── presentation/
│   │   │   ├── CookingActivity.kt
│   │   │   ├── TimerFragment.kt
│   │   │   └── StepsFragment.kt
│   │   ├── domain/
│   │   │   └── CookingUseCase.kt
│   │   └── data/
│   │       └── CookingService.kt
│   │
│   └── profile/
│       ├── presentation/
│       │   └── UserProfileActivity.kt
│       ├── domain/
│       │   └── ProfileUseCase.kt
│       └── data/
│           └── ProfileService.kt
│
└── shared/
    ├── di/
    │   └── DIContainer.kt
    ├── util/
    │   └── Constants.kt
    └── network/
        └── ApiClient.kt
```

---

## 4. Refactoring Steps

### Phase 1: Backend Refactoring
1. Create new feature directories under `features/`
2. Move existing files to appropriate slices
3. Update package imports throughout the codebase
4. Update Spring Configuration for new package structure
5. Update pom.xml if needed
6. Run unit tests

### Phase 2: Frontend Refactoring
1. Create new feature directories under `features/`
2. Move components and pages to appropriate slices
3. Move Redux slices and API clients to feature folders
4. Update import paths
5. Update vite.config.js if needed
6. Run build and verify

### Phase 3: Mobile Refactoring
1. Create new feature packages
2. Move activities and services to packages
3. Update package imports
4. Update build.gradle if needed

---

## 5. Testing Strategy

### Unit Tests
- Test each service in isolation
- Mock dependencies

### Integration Tests  
- Test feature slices end-to-end
- Test API endpoints with real database

### End-to-End Tests
- Test complete user workflows
- Cross-platform testing

### Regression Tests
- Verify all features work after refactoring
- Test all API endpoints
- Test UI flows

---

## 6. Quality Assurance

- Code style consistency
- No breaking changes to API contracts
- All existing features remain functional
- Performance benchmarks maintained
- Security vulnerabilities resolved

---

## 7. Timeline

| Phase | Task | Duration | Start | End |
|-------|------|----------|-------|-----|
| 1 | Planning & Setup | 1 day | May 7 | May 7 |
| 2 | Backend Refactoring | 1 day | May 8 | May 8 |
| 3 | Frontend Refactoring | 0.5 day | May 8 | May 8 |
| 4 | Mobile Refactoring | 0.5 day | May 8 | May 9 |
| 5 | Test Plan Creation | 0.5 day | May 9 | May 9 |
| 6 | Regression Testing | 1 day | May 9 | May 9 |
| 7 | Report Generation | 1 day | May 9 | May 9 |
| 8 | Final Review & Push | 0.5 day | May 9 | May 9 |

---

## 8. Success Criteria

✅ All code organized by vertical slices  
✅ No functional regressions  
✅ All tests passing  
✅ Improved maintainability  
✅ Clear separation of concerns  
✅ Comprehensive test coverage  
✅ Complete documentation  

---

## 9. References

- [Vertical Slice Architecture](https://jimmybogard.com/vertical-slice-architecture/)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Spring Boot Best Practices](https://spring.io/projects/spring-boot)

---

**Branch**: `refactor/vertical-slice-architecture`  
**Status**: Planning Phase  
**Last Updated**: May 7, 2026
