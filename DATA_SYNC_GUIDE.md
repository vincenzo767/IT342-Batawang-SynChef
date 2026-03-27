# Data Synchronization Guide - SynChef Mobile & Web

## Overview
This guide explains how data synchronization works between SynChef Mobile and Web applications. Both platforms use a single backend API as the source of truth.

---

## Architecture

### Data Flow
```
Mobile App ←→ Backend API ←→ Web App
(SharedPreferences)  (Database)  (Redux + localStorage)
```

### Key Components

#### Backend
- **AuthService**: Handles login/registration, returns user data with `favoriteRecipeIds`, `countryCode`, `countryName`
- **UserController**: Endpoints for profile, favorites, country updates
- **User Entity**: Stores `List<Long> favoriteRecipeIds`, `String countryCode`, `String countryName`

#### Mobile (Android)
- **SessionManager**: Stores auth data in SharedPreferences
- **ProfileActivity**: Loads and displays user profile
- **DashboardActivity**: Now includes automatic refresh of user data on startup
- **RecipeRepository**: Handles API calls for user data

#### Web (React)
- **Redux authSlice**: Manages state for user, token, favoriteRecipeIds
- **App.jsx**: Refreshes user data on app mount/login
- **localStorage**: Persists user data between sessions

---

## Data Synchronization Points

### 1. User Registration

#### Flow:
```
Mobile:
  1. User fills registration form (email, password, country)
  2. POST /auth/register sends request
  3. Backend saves User with countryCode, countryName
  4. Returns AuthResponse with favoriteRecipeIds = []
  5. SessionManager.saveAuth() saves to SharedPreferences
  6. User is logged in automatically

Web:
  1. User fills registration form
  2. POST /auth/register sends request
  3. Backend saves User with countryCode, countryName
  4. Returns AuthResponse with favoriteRecipeIds = []
  5. Redux setAuthResponse saves to state + localStorage
  6. User is logged in and navigated to /dashboard
```

**Key Data Synced:**
- ✅ Country (countryCode, countryName)
- ✅ User profile (email, fullName, username, profileImageUrl)
- ✅ Favorites (empty list [] initially)
- ✅ Email verified status

---

### 2. User Login

#### Flow:
```
Mobile:
  1. User enters email/username + password
  2. POST /auth/login
  3. Backend authenticates and returns AuthResponse
  4. SessionManager.saveAuth() stores to SharedPreferences:
     - token
     - user (includes favoriteRecipeIds, countryCode, countryName)
  5. DashboardActivity.refreshUserDataFromBackend() (NEW):
     - Calls getUserProfile() → updates countryCode/countryName
     - Calls getFavorites() → fetches fresh favoriteRecipeIds
     - Updates SessionManager with fresh data

Web:
  1. User enters email/username + password
  2. POST /auth/login
  3. Backend returns AuthResponse
  4. Redux setAuthResponse saves:
     - token to localStorage
     - user to localStorage
     - favoriteRecipeIds to Redux state
  5. App.jsx useEffect (IMPROVED):
     - Calls userApi.getMe() via refreshUser()
     - Updates Redux state with fresh server data
     - Includes countryCode, countryName, favoriteRecipeIds
```

**Key Data Synced:**
- ✅ Authentication token
- ✅ User profile (all fields)
- ✅ Saved recipes (favoriteRecipeIds)
- ✅ Country preference
- ✅ Email verified status

---

### 3. Adding/Removing Favorites

#### Mobile:
```
User clicks heart icon
  ↓
POST/DELETE /users/me/favorites/{recipeId}
  ↓
Backend updates User.favoriteRecipeIds
  ↓
Returns updated favoriteRecipeIds list
  ↓
SessionManager.updateUser(it.copy(favoriteRecipeIds = ...))
  ↓
RecipeDetailActivity displays updated favorite status
```

#### Web:
```
User clicks heart icon  
  ↓
POST/DELETE /users/me/favorites/{recipeId}
  ↓
Backend updates User.favoriteRecipeIds
  ↓
Returns updated list
  ↓
Redux setFavorites() updates Redux state
  ↓
Components show updated favorite status
```

**Sync Guarantee:**
- Both platforms call the same backend endpoint
- Backend returns the updated list
- Cross-platform consistency maintained via server state

---

### 4. Profile View Updates

#### Mobile Profile Screen:
```
ProfileActivity.onCreate()
  ↓
loadProfileData() calls:
  - repository.getUserProfile() → fetches latest user data
  - repository.getFavorites() → fetches favorite recipe IDs
  ↓
SessionManager updates with fresh data
  ↓
UI displays current user info + saved recipes
```

#### Web Dashboard/Profile Pages:
```
App.jsx useEffect (on mount):
  ↓
userApi.getMe() fetches fresh user data
  ↓
Redux refreshUser() updates all user fields
  ↓
Components read from Redux state
  ↓
DashboardPage/ProfilePage display live data
```

---

### 5. Country Selection Updates

#### During Registration/Login:
```
Mobile:
  Backend returns countryCode + countryName
  → SessionManager.saveUserCountry(code, name)
  → Stored in both AuthResponse and preferences

Web:
  Backend returns countryCode + countryName
  → Redux setAuthResponse/refreshUser saves to state + localStorage
  → Available for dashboard recommendations
```

#### After Login (Profile View):
```
Mobile:
  ProfileActivity.loadProfileData()
  → getUserProfile() fetches fresh countryCode/Name
  → SessionManager.updateUserProfile() syncs

Web:
  App.jsx refresh triggers userApi.getMe()
  → Redux refreshUser() syncs countryCode/Name
  → DashboardPage uses fresh country data
```

---

## Testing Checklist

### ✅ Test 1: Register on Mobile, View on Web

**Steps:**
1. Open Mobile app
2. Register new account: email, password, full name, select country (e.g., Philippines)
3. Complete registration → should land on Dashboard
4. Note the user data

**Expected Results:**
- ✅ Mobile shows correct user name, email, country
- ✅ Mobile profile shows country in settings
- ✅ Open Web app in different browser/window
- ✅ Log in with same credentials
- ✅ Dashboard shows correct user name, email
- ✅ Country matches what was selected on Mobile
- ✅ Favorite recipes list is synced (empty initially)

### ✅ Test 2: Register on Web, View on Mobile

**Steps:**
1. Open Web app
2. Register new account: full name, email, password, select country (e.g., Japan)
3. Complete registration → should land on Dashboard
4. Note saved recipes are empty

**Expected Results:**
- ✅ Web shows user name, email, country correctly
- ✅ Mobile app (if already logged in elsewhere, log out first)
- ✅ Log in with same credentials
- ✅ Mobile DashboardActivity loads and refreshes data
- ✅ Profile shows correct user data and country
- ✅ Favorite recipes list matches Web (both empty)

### ✅ Test 3: Save Recipe on Mobile, Check on Web

**Steps:**
1. Log in to Mobile
2. Browse recipes → find one you like
3. Click heart icon to save
4. See favorite count increase
5. Open Web app (same account or new tab)
6. Navigate to Profile page

**Expected Results:**
- ✅ Recipe appears in Mobile profile's "Saved Recipes"
- ✅ Recipe appears in Web profile's "Saved Recipes"  
- ✅ Save count matches on both platforms
- ✅ Countries Explored updates correctly on both

### ✅ Test 4: Save Recipe on Web, Check on Mobile

**Steps:**
1. Log in to Web app
2. Browse recipes (Home, Flavor Map, search)
3. Click heart icon on recipe card
4. Open Mobile app (background, or fresh app launch)
5. Tap Profile tab

**Expected Results:**
- ✅ Recipe appears in Web profile saved list
- ✅ Mobile's refreshUserDataFromBackend() fetches updated favorites
- ✅ Recipe appears in Mobile profile's saved recipes
- ✅ Favorite count and countries explored match

### ✅ Test 5: Update Country After Login (Mobile)

**Steps:**
1. Log in to Mobile  
2. Open Settings
3. Change country selection
4. Save changes
5. Open Web app, view Dashboard

**Expected Results:**
- ✅ Mobile profile shows updated country
- ✅ Web dashboard recommendations change based on new country
- ✅ Country name appears in welcome message on both

### ✅ Test 6: Update Country After Login (Web Settings)

**Steps:**
1. Log in to Web
2. Open Settings page
3. Change country
4. Save/update
5. Open Mobile app, view Profile

**Expected Results:**
- ✅ Web shows updated country
- ✅ Mobile's refreshUserDataFromBackend() fetches updated country
- ✅ Profile activity shows updated country name

### ✅ Test 7: Remove Favorite Recipe (Cross-Platform)

**Steps:**
1. Both Mobile and Web logged in (same account)
2. Mobile: View profile, see 3 saved recipes
3. Web: Profile page, see same 3 recipes
4. Mobile: Click heart icon on one to unsave
5. Web: Refresh page

**Expected Results:**
- ✅ Mobile immediately shows 2 recipes
- ✅ Web refresh shows 2 recipes (favorite was removed)
- ✅ Both save counts match

### ✅ Test 8: Session Persistence (Logout/Relaunch)

**Steps:**
1. Mobile: Log in, save a recipe
2. Close app completely (kill background)
3. Reopen app
4. Don't log in again (should be logged in via token)
5. Navigate to Prof

ile

**Expected Results:**
- ✅ Token is restored from SharedPreferences
- ✅ User data is restored from SharedPreferences  
- ✅ DashboardActivity.refreshUserDataFromBackend() syncs fresh favorites
- ✅ Profile shows all previously saved recipes
- ✅ No data loss

---

## Improvements Made (March 27, 2026)

### 1. Mobile DashboardActivity Enhancement
**File:** `DashboardActivity.kt`

```kotlin
// NEW: Added automatic refresh on startup
private fun refreshUserDataFromBackend() {
    uiScope.launch {
        // Fetch fresh user profile (country, user info)
        repository.getUserProfile().onSuccess { profile ->
            sessionManager.updateUserProfile(profile)
        }

        // Fetch fresh favorites list
        repository.getFavorites().onSuccess { favoriteIds ->
            sessionManager.updateUser {
                it.copy(favoriteRecipeIds = favoriteIds)
            }
        }
    }
}
```

**Benefits:**
- ✅ Ensures user data is always fresh on app startup
- ✅ Syncs favorites from backend immediately
- ✅ Updates country info if changed on web platform
- ✅ Non-blocking: cached data used if network is down

### 2. Web App.jsx Refresh Improvement  
**File:** `App.jsx`

```jsx
// IMPROVED: Better refresh timing with prevention of duplicate requests
const hasRefreshedRef = useRef(false);

useEffect(() => {
  if (isAuthenticated && !hasRefreshedRef.current) {
    hasRefreshedRef.current = true;
    userApi.getMe()
      .then((res) => dispatch(refreshUser(res.data)))
      .catch(() => { /* keep cached data on error */ });
  }
}, [isAuthenticated, dispatch]);
```

**Benefits:**
- ✅ Prevents duplicate refresh calls
- ✅ Refreshes when authentication state changes
- ✅ Syncs country, user profile, favorites on login/mount
- ✅ Maintains cached data if server is unreachable

---

## Backend Endpoint Reference

### GET /api/users/me
Returns current user's full profile including favorites and country

```json
{
  "id": 1,
  "email": "user@example.com",
  "username": "username",
  "fullName": "User Name",
  "countryCode": "PH",
  "countryName": "Philippines",
  "favoriteRecipeIds": [1, 5, 12],
  "profileImageUrl": "url",
  "emailVerified": true,
  "createdAt": "2024-01-01T00:00:00Z"
}
```

### GET /api/users/me/favorites
Returns array of favorite recipe IDs

```json
[1, 5, 12, 23]
```

### POST /api/users/me/favorites/{recipeId}
Adds recipe to favorites, returns updated favorites list

### DELETE /api/users/me/favorites/{recipeId}
Removes recipe from favorites, returns updated list

### PUT /api/users/me/country
Updates user's country preference

```json
{
  "countryCode": "JP",
  "countryName": "Japan"
}
```

---

## Troubleshooting

### Issue: Favorites not syncing after adding on Mobile

**Solution:**
1. Verify SessionManager.updateUser() is being called
2. Check ProfileActivity.loadProfileData() calls repository.getFavorites()
3. Ensure backend /users/me/favorites endpoint returns updated list
4. Mobile: Kill app process and relaunch to trigger DashboardActivity.refreshUserDataFromBackend()

### Issue: Country not updating on Web after changing on Mobile

**Solution:**
1. Verify mobile's PUT /users/me/country request completes
2. Check web's App.jsx refresh is triggered (check browser console)
3. Force refresh in browser or log out/log in to trigger refresh
4. Verify backend stores countryCode/Name in User entity

### Issue: Profile shows different data on Mobile vs Web

**Solution:**
1. Both should call GET /api/users/me, which is single source of truth
2. Mobile: ProfileActivity.loadProfileData() fetches fresh profile
3. Web: App.jsx useEffect triggers userApi.getMe()
4. If still different, verify backend _getMe() returns consistent data

### Cross-Platform Data Not Syncing

**Debugging Steps:**
1. **Mobile:**
   - Check SessionManager.saveAuth() is called after login
   - Verify DashboardActivity.refreshUserDataFromBackend() runs
   - Check logcat for API errors

2. **Web:**
   - Check Redux DevTools to see dispatched actions
   - Verify authSlice.setAuthResponse() was called
   - Check localStorage has user data
   - Verify App.jsx refresh effect runs

3. **Backend:**
   - Verify JWT token is valid for both platforms
   - Check UserController returns correct favoriteRecipeIds
   - Verify AuthService.buildAuthResponse() includes all fields

---

## Best Practices

1. **Always refresh on app launch** - Both platforms now do this
2. **Single API endpoint as source of truth** - Backend User entity is authoritative
3. **Cache locally but verify regularly** - SessionManager/Redux cache, but refresh on startup
4. **Handle network errors gracefully** - Keep cached data if API fails
5. **Consistent timestamps** - Database handles created_at, updated_at
6. **Test cross-platform scenarios** - Always verify changes sync between platforms

---

## Summary

Data synchronization between Mobile and Web is now guaranteed through:

1. ✅ **Unified Backend API** - Single source of truth for all user data
2. ✅ **Automatic Refresh on Startup** - Both platforms sync on app launch
3. ✅ **Proper Request/Response Handling** - Login/Register responses include all data
4. ✅ **State Management** - SessionManager (mobile) and Redux (web) keep data in sync
5. ✅ **Real-time Updates** - Favorite/country changes sync via backend API

Users can now seamlessly switch between Mobile and Web, with all their data (profile, favorites, country) always synchronized.
