# Web-Side Sync Diagnosis Guide

## Current Status
✅ Mobile polling: **Working** (confirmed in logcat - polling every 15s, fetching favorites)
❓ Web polling: **Unknown** (needs verification)

## Diagnostic Steps

### Step 1: Verify Web Polling is Executing
**Open your browser and follow these steps:**

1. Navigate to the web app (http://localhost:3000 or your actual URL)
2. Login to your account
3. Go to `/profile` page
4. **Open DevTools:** Press `F12` or `Ctrl+Shift+I` (Windows)
5. **Go to Network tab**
6. **Filter by:** Type `getMe` or just view all XHR requests
7. **Wait 15-20 seconds** and observe:
   - Do you see repeated `GET /api/users/me` requests every ~10 seconds?
   - Check the timestamp column - should show a new request every 10 seconds
   - If YES: Polling is working, move to Step 2
   - If NO: Polling is broken, move to Step 3

**What you should see:**
```
GET /api/users/me  [10:30:15]  200 OK
GET /api/users/me  [10:30:25]  200 OK  ← 10 seconds later
GET /api/users/me  [10:30:35]  200 OK  ← 10 seconds later
```

### Step 2: Verify Redux State is Updating
**If polling IS executing:**

1. **Install Redux DevTools browser extension** (if not already installed)
   - Chrome: Search "Redux DevTools" in Chrome Web Store
   - Firefox: Search "Redux DevTools" in Firefox Add-ons

2. **Open DevTools** again (F12)
3. **Go to Redux tab** (you'll see it appear once extension is installed)
4. **Look for `refreshUser` action dispatches**
   - Every 10 seconds you should see a `refreshUser` action
   - Each action should show updated `favoriteRecipeIds` in the payload
5. **Trigger a test:** On mobile, save a new recipe
6. **Watch Redux tab** - within 10 seconds, you should see a new `refreshUser` action with the new recipe ID in `favoriteRecipeIds`

**What you should see in Redux:**
```
[refreshUser]
  payload: {
    id: 1,
    email: "user@example.com",
    favoriteRecipeIds: [10026, 10012, 2, 10011],  ← New recipe 10011
    ...
  }
```

### Step 3: Check Browser Console for Errors
**If polling is NOT executing:**

1. In DevTools, go to **Console tab**
2. Look for any red error messages
3. Look for the polling logs we added:
   ```
   [ProfilePage] Polling tick - fetching fresh data
   [ProfilePage] Polling success - favorites: [...]
   ```

**Common issues:**
- `Cannot GET /api/users/me` → Backend not running on port 8080
- `NetworkError` → Connection issue
- `useEffect: ProfilePage not authenticated` → Logout before login
- Missing logs → Component might not be mounted or code not deployed

### Step 4: Verify Profile Page Component is Visible
1. Make sure you're on the `/profile` route
2. Polling only happens on ProfilePage component
3. If you navigate away (e.g., to `/dashboard`), polling stops
4. Come back to `/profile` to restart polling

---

## Test Cycle (Once Web Polling Confirmed)

**Complete End-to-End Test:**

1. **Mobile → Web Test:**
   - On **mobile**: Open ProfileActivity (keep it visible)
   - On **web**: Open `/profile` page (keep it visible)
   - On **mobile**: Save a new recipe (e.g., ID 999)
   - On **mobile logcat**: You should see `Favorites fetched: [..., 999]`
   - On **web**: Wait max 10 seconds
   - On **web**: Recipe 999 should appear in profile
   - On **browser console**: You should see `[ProfilePage] Polling success - favorites: [..., 999]`

2. **Web → Mobile Test:**
   - On **web**: Open `/profile` page
   - On **mobile**: Open ProfileActivity
   - On **web**: Save a new recipe (e.g., ID 888)
   - On **mobile**: Wait max 15 seconds
   - On **mobile logcat**: Should see `Favorites fetched: [..., 888]`
   - On **mobile profile**: Recipe 888 should appear

---

## If Polling is Working but Data Not Syncing

**The issue must be one of these:**

1. **Different user accounts on web vs mobile**
   - Get user ID from mobile logcat: Look for "Profile fetched: [email]"
   - Verify same email logged in on web
   - Example: Mobile shows "jojo@cit.edu" but web is logged in as "different@email.com"

2. **Recipe IDs not matching**
   - When you save on web, what ID is returned?
   - Does mobile see that same ID in favorites?
   - Check backend response in browser Network tab

3. **UI not re-rendering**
   - Redux state updated but ProfilePage doesn't show it
   - This would show in Redux DevTools: action dispatched but UI doesn't change
   - Solution: Check if ProfilePage component is watching `favoriteRecipeIds` from Redux

---

## What Each Component Should Do

### Web ProfilePage.jsx
- ✅ useEffect 1: Navigate to `/profile` → Fetch immediately
- ✅ useEffect 2: Polling every 10s → Keep data fresh
- ✅ useEffect 3: Visibility change → Sync when switching back from mobile tab
- ✅ Button: Manual refresh → Instant fetch

### Mobile ProfileActivity.kt
- ✅ onResume(): Fetch immediately → Latest data when app visible
- ✅ Polling: Every 15s → Background refresh
- ✅ onPause(): Stop polling → Save battery

### Mobile DashboardActivity.kt
- ✅ onResume(): Fetch immediately + start polling
- ✅ Polling: Every 20s → Lower frequency to save battery
- ✅ onPause(): Stop polling

---

## Quick Verification Checklist

- [ ] Web browser DevTools Network tab shows `GET /api/users/me` every 10s
- [ ] Browser console shows `[ProfilePage] Polling tick` logs
- [ ] Redux tab shows `refreshUser` actions with updated `favoriteRecipeIds`
- [ ] Mobile logcat shows "Polling tick" every 15s
- [ ] Same user email logged in on both platforms
- [ ] Save on one platform, appear on other within 10-15s

If any of these fail, the issue is identified and we can fix it specifically.
