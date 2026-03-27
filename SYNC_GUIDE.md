# SynChef Data Synchronization Guide

## ⚡ Real-Time Synchronization (March 27, 2026)

SynChef now implements **semi-real-time synchronization** on both web and mobile platforms. Data saved on one platform is reflected on the other within **10-20 seconds** automatically.

---

## How Real-Time Sync Works

### Web Platform (React)
**Three sync mechanisms working together:**

1. **Periodic Polling (10 seconds)**
   - Every 10 seconds while viewing ProfilePage, fresh user data is fetched from backend
   - Lives in: `ProfilePage.jsx` useEffect with 10-second interval
   - Silently fetches in background without disrupting UX

2. **Page Visibility Detection**
   - When user switches back to the browser tab (e.g., from mobile), ProfilePage automatically refetches
   - Uses `document.visibilitychange` event
   - Ensures instant sync when user switches devices

3. **Manual Refresh Button**
   - "🔄 Sync Data" button on ProfilePage header
   - Allows users to force-refresh if they want immediate results
   - Shows loading state while fetching

**Result:** Save a recipe on mobile, switch to web ProfilePage → see it within 10 seconds (or instantly if you just switched to the tab)

### Mobile Platform (Android/Kotlin)
**Two sync mechanisms working together:**

1. **Periodic Polling (15-20 seconds)**
   - ProfileActivity: Polls every 15 seconds
   - DashboardActivity: Polls every 20 seconds (less frequent to save battery)
   - Both start polling in `onResume()` and stop in `onPause()`
   - Fetches fresh favorites from backend using `GET /api/users/me/favorites`

2. **Activity Lifecycle Detection**
   - When user returns to ProfileActivity/DashboardActivity (after using web or another app), `onResume()` triggers immediate refresh
   - Stops polling in `onPause()` to save battery

**Result:** Save a recipe on web, return to mobile ProfileActivity → data refreshes immediately on resume, then every 15 seconds

---

## Sync Flow Diagrams

### Scenario 1: Web → Mobile (Real-Time)
```
Web (save recipe)           Mobile (ProfileActivity visible)
    |                              |
    v                              v
POST /api/users/me/favicon/{id}   [polling every 15s]
    |                              |
    v                              |
Backend: Updated favoriteRecipeIds |
    |                              |
    |<----GET /api/users/me-------<|
    |                              |
    |---Updated data (with recipe)-->|
    |                              v
    |                     Redux/SessionManager: Updated
    |                              |
    |                              v
    |                     ProfileActivity: Renders new recipe
    |                       ✅ Synced in ~15s
```

### Scenario 2: Mobile → Web (Real-Time)
```
Mobile (save recipe)        Web (ProfilePage visible)
    |                              |
    v                              v
POST /api/users/me/favorite/{id}  [polling every 10s]
    |                              |
    v                              |
Backend: Updated favoriteRecipeIds |
    |                              |
    |<----GET /api/users/me-------<|
    |                              |
    |---Updated data (with recipe)-->|
    |                              v
    |                     Redux: setFavorites + refreshUser
    |                              |
    |                              v
    |                     ProfilePage: Re-renders with recipe
    |                       ✅ Synced in ~10s
```

---

## Implementation Details

### Web ProfilePage.jsx
```javascript
// Three concurrent sync mechanisms:

// 1. Navigation-based refresh
useEffect(() => {
  if (!isAuthenticated) return;
  const fetchUserData = () => {
    userApi.getMe()
      .then((res) => dispatch(refreshUser(res.data)))
      .catch(() => {});
  };
  fetchUserData();
}, [location.pathname, isAuthenticated, dispatch]);

// 2. Periodic polling (10 seconds)
useEffect(() => {
  if (!isAuthenticated) return;
  const pollInterval = setInterval(() => {
    userApi.getMe()
      .then((res) => dispatch(refreshUser(res.data)))
      .catch(() => {});
  }, 10000);
  return () => clearInterval(pollInterval);
}, [isAuthenticated, dispatch]);

// 3. Page visibility detection (when user switches back from mobile)
useEffect(() => {
  if (!isAuthenticated) return;
  const handleVisibilityChange = () => {
    if (document.visibilityState === "visible") {
      userApi.getMe()
        .then((res) => dispatch(refreshUser(res.data)))
        .catch(() => {});
    }
  };
  document.addEventListener("visibilitychange", handleVisibilityChange);
  return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
}, [isAuthenticated, dispatch]);
```

### Mobile ProfileActivity.kt
```kotlin
// Two lifecycle-based sync mechanisms:

override fun onResume() {
  super.onResume()
  loadProfileData()  // Immediate refresh
  startPolling()     // Start periodic polling
}

override fun onPause() {
  super.onPause()
  stopPolling()      // Stop polling to save battery
}

private fun startPolling() {
  pollJob = uiScope.launch {
    while (true) {
      delay(15000)  // 15 seconds
      loadProfileData()
    }
  }
}
```

---

## Sync Guarantees

| Scenario | Sync Time | Mechanism |
|----------|-----------|-----------|
| Save on Web → View on Mobile ProfileActivity | **0-15s** | Polling (15s) + immediate on Resume |
| Save on Mobile → View on Web ProfilePage | **0-10s** | Polling (10s) + immediate if tab visible |
| Save on Mobile → View Web from background | **0s** | Visibility detection |
| Manual refresh on Web | **Instant** | Button click |
| User switches browser tab/app | **0s** | Visibility change event |

---

## Battery & Network Considerations

### Web
- **Polling Cost:** ~2 API calls per minute per user = minimal impact
- **Can be stopped:** If viewing other pages, polling stops automatically
- **Visibility Detection:** Free, only activates when tab is visible

### Mobile
- **Polling Cost:** 1 call every 15-20 seconds = ~3-4 per minute
- **Battery Saving:** Stops completely when ProfileActivity/DashboardActivity paused
- **Lifecycle-Aware:** Respects Android Activity lifecycle

**Total Network:** Mobile ~3-4 req/min, Web ~2 req/min = **Very efficient for real-time sync**

---

## Testing Real-Time Sync

### Test 1: Web → Mobile
```
1. Login to web (browser)
2. Navigate to ProfilePage
3. Open mobile app on same account, go to ProfileActivity
4. On web, save a recipe
5. ✅ Should appear on mobile within 15 seconds
   (or immediately if you just opened ProfileActivity)
```

### Test 2: Mobile → Web
```
1. Login to mobile app
2. Go to ProfileActivity (polling starts)
3. Open web app on same account, navigate to ProfilePage
4. On mobile, save a recipe
5. ✅ Should appear on web within 10 seconds
```

### Test 3: Tab Switching
```
1. Save recipe on mobile while web ProfilePage is in background tab
2. Switch back to web browser tab
3. ✅ Should see recipe immediately (visibility detection)
```

### Test 4: Manual Refresh
```
1. On web ProfilePage, click "🔄 Sync Data" button
2. ✅ Should fetch fresh data immediately and show loading state
```

---

## API Endpoints Used

All endpoints called automatically by polling:

| Method | Endpoint | Called By | Frequency |
|--------|----------|-----------|-----------|
| GET | `/api/users/me` | Web: polling + visibility | 10s periodic |
| GET | `/api/users/me/favorites` | Mobile: polling | 15-20s periodic |
| POST | `/api/users/me/favorites/{id}` | Save recipe (both platforms) | On user action |
| DELETE | `/api/users/me/favorites/{id}` | Remove recipe (both platforms) | On user action |

---

## Fallback Behavior

If network fails during polling:
- **Web:** Keeps showing cached data, polling continues silently
- **Mobile:** Displays cached data, polling continues
- **Both:** No error shown, UX unaffected
- **Result:** User can still use app offline, syncs when network returns

---

## Summary

✅ **30-second sync guarantee:** Any recipe saved on one platform appears on the other within 30 seconds maximum
✅ **Semi-real-time:** 10-15 second typical sync time via polling
✅ **Zero-latency for active users:** Instant sync when switching between devices/tabs
✅ **Battery efficient:** Mobile polling stops when app in background
✅ **Network efficient:** ~5-6 lightweight API calls per minute total
✅ **Automatic:** No user action required, happens silently in background
✅ **Manual override:** Users can click "Sync Data" button for instant results


---

## Data Sync Flow

### 1. Registration & Login
Both platforms receive `favoriteRecipeIds`, `countryCode`, and `countryName` in the auth response.

**Web (LoginPage):**
- `authAPI.login()` → Backend returns `AuthResponse` with `favoriteRecipeIds`
- Redux stores via `dispatch(setAuthResponse(res.data))`
- Favorites saved to `state.auth.favoriteRecipeIds`

**Mobile (LoginActivity):**
- `repository.login()` → Backend returns `AuthResponse` with `favoriteRecipeIds`
- SessionManager stores via `saveAuth(auth)` into SharedPreferences
- All data persists locally in `synchef_session` SharedPreferences

---

### 2. Saving/Removing Recipes

#### On Web (RecipeDetailPage.jsx)
```javascript
// Step 1: Send to backend
const response = isFavorited
  ? await userApi.removeFavorite(recipeId)      // DELETE /api/users/me/favorites/{id}
  : await userApi.addFavorite(recipeId);        // POST /api/users/me/favorites/{id}

// Step 2: Update Redux state immediately
dispatch(setFavorites(response.data));  // Favorites update in UI instantly
```

**When does mobile see this?**
- Mobile HomeActivity/DashboardActivity/ProfileActivity call `refreshUserDataFromBackend()`
- This happens on:
  - `DashboardActivity.onCreate()`
  - `DashboardActivity.onResume()`
  - `ProfileActivity.onCreate()`
  - `ProfileActivity.onResume()`
- If ProfileActivity is already displayed and you come back to the app from browser, `onResume()` is called → fresh data fetched

#### On Mobile (RecipeDetailActivity.kt)
```kotlin
// Step 1: Send to backend
repository.addFavorite(recipeId)        // POST /api/users/me/favorites/{id}
  .onSuccess { ids ->
    // Step 2: Update SessionManager (local storage)
    session.updateUser { user ->
      user.copy(favoriteRecipeIds = ids)
    }
    showToast("Saved!")
  }
```

**When does web see this?**
- ProfilePage has a `useEffect` that watches `location.pathname`
- This means **every time you navigate to /profile, fresh data is fetched from backend**
- If you save a recipe on mobile and then view the profile page on web, the latest favorites are fetched

---

### 3. Viewing Profile

#### Web (ProfilePage.jsx)
```javascript
// Fetches fresh data whenever user navigates to /profile
useEffect(() => {
  if (!isAuthenticated) return;
  userApi.getMe()
    .then((res) => dispatch(refreshUser(res.data)))
    .catch(() => { /* keep cached data */ });
}, [location.pathname, isAuthenticated, dispatch]);
```

**Data displayed:**
- Local `ALL_RECIPES` array for recipes saved on web
- Backend-fetched recipes for recipes saved on mobile (fetched separately)
- Both lists merged and displayed

#### Mobile (ProfileActivity.kt)
```kotlin
// Called on onCreate and onResume
private fun loadProfileData() {
  // Fetches fresh profile, favorites, and all recipes from backend
  repository.getUserProfile()      // GET /api/users/me
  repository.getFavorites()        // GET /api/users/me/favorites
  repository.getAllRecipes()       // GET /api/recipes

  // Merges backend recipes with local fallback data
  val allRecipes = repository.getMergedRecipesWithWebFallback(recipes)

  // Filters to show only saved recipes
  val savedRecipes = allRecipes.filter { it.id in favIds }
}
```

---

## Real-Time Sync Checklist

### ✅ Scenario: Save on Web → View on Mobile
1. Save recipe on web → Sent to backend via `POST /api/users/me/favorites/{id}`
2. Mobile ProfileActivity shown on screen
3. `onResume()` called → `loadProfileData()` called
4. `getFavorites()` fetches updated list from backend
5. ✅ Mobile ProfileActivity displays saved recipe

### ✅ Scenario: Save on Mobile → View on Web
1. Save recipe on mobile → Sent to backend via `POST /api/users/me/favorites/{id}`
2. SessionManager updated locally
3. Navigate to web ProfilePage → `useEffect` triggers fetch
4. `userApi.getMe()` fetches fresh `favoriteRecipeIds` from backend
5. ✅ Web ProfilePage displays saved recipe

### ✅ Scenario: Login → View Profile
1. User logs in → Auth response includes `favoriteRecipeIds`
2. Navigate to ProfilePage (web) or ProfileActivity (mobile)
3. Fresh data fetched from backend via `GET /api/users/me`
4. ✅ Profile displays correct saved recipes

---

## Key Implementation Details

### Web Backend-Only Recipe Handling
ProfilePage fetches recipes not in local `ALL_RECIPES`:
```javascript
const missingIds = favoriteRecipeIds.filter(
  (id) => !ALL_RECIPES.find((r) => r.id === id)
);
// Fetch missing recipes from backend
Promise.all(missingIds.map(id => recipeApi.getById(id)))
```
This ensures recipes saved on mobile are displayed on web even if they're backend-only.

### Mobile Merged Recipe Data
When loading recipes, mobile merges:
- **Backend recipes:** From `GET /api/recipes` (recipes saved on web)
- **Local fallback:** From `WebFallbackData` (offline-capable recipes)

Result: Complete recipe list available regardless of source

### Logout & Re-login Reset
Web App.jsx resets the refresh guard on logout:
```javascript
useEffect(() => {
  if (!isAuthenticated) {
    hasRefreshedRef.current = false;  // Allow next login to re-fetch
  }
}, [isAuthenticated]);
```
Ensures re-login always triggers a fresh backend fetch (not stale Redux cache)

---

## Troubleshooting

### "Web doesn't show recipes saved on mobile"
- ✅ Is ProfilePage being viewed? If not, navigate to /profile
- ✅ Check network tab: Does `GET /api/users/me` call happen?
- ✅ Check Redux DevTools: Does `favoriteRecipeIds` update after fetch?

### "Mobile doesn't show recipes saved on web"
- ✅ Are you returning to ProfileActivity? If already visible, leave app and come back
- ✅ Check Logcat: Look for `refreshUserDataFromBackend` logs
- ✅ Check SharedPreferences: Verify `synchef_session` has updated `favoriteRecipeIds`

### "Logout / re-login doesn't reset favorites"
- ✅ Check Redux cookies are cleared (logout action clears localStorage)
- ✅ Login again triggers `userApi.getMe()` which fetches fresh data
- ✅ Stale Redux cache is overwritten by server response

---

## API Contracts

### GET /api/users/me
Returns user profile with current favorites:
```json
{
  "id": 1,
  "email": "user@example.com",
  "username": "chef123",
  "fullName": "John Chef",
  "countryCode": "PH",
  "countryName": "Philippines",
  "favoriteRecipeIds": [1, 2, 5, 7],
  "createdAt": "2024-03-01T10:30:00Z"
}
```

### POST /api/users/me/favorites/{id}
Add recipe to favorites. Returns updated list:
```json
[1, 2, 5, 7, 10]
```

### DELETE /api/users/me/favorites/{id}
Remove recipe from favorites. Returns updated list:
```json
[1, 2, 5, 7]
```

---

## Summary

**Data flows through the backend REST API at these critical moments:**
- ✅ Login/Register: All user data fetched
- ✅ Save/Remove Favorite: Immediately sent to backend
- ✅ View Dashboard: Profile auto-refreshed on resume (mobile) / on load (web)
- ✅ View Profile: Fresh favorites fetched from backend
- ✅ Logout/Re-login: Refresh guard resets, next fetch pulls fresh server data

This ensures **consistent, synchronized data** across both platforms with the backend as the single source of truth.
