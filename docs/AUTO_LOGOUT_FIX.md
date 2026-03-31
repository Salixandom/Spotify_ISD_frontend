# Fix: Auto-Logout Issue - Token Lifetime Too Short

## Problem
User gets logged out immediately after login and redirected back to login page.

## Root Cause
The JWT **access token lifetime is only 5 minutes**! This is extremely short and causes the auto-logout issue.

### Current JWT Settings
```python
ACCESS_TOKEN_LIFETIME: 5 minutes  ⚠️ TOO SHORT!
REFRESH_TOKEN_LIFETIME: 1 day
```

### What Happens
1. User logs in ✅
2. Access token stored in localStorage ✅
3. **5 minutes later** (or even sooner due to clock skew): Token expires ❌
4. Next API call fails with 401 ❌
5. Axios interceptor tries to refresh token
6. If refresh fails or has issues, user gets logged out ❌

## Solutions

### Option 1: Increase Access Token Lifetime (Recommended)

Change the JWT settings to a more reasonable duration:

```python
# In backend settings or JWT config
"ACCESS_TOKEN_LIFETIME": timedelta(hours=1),  # 1 hour instead of 5 minutes
"REFRESH_TOKEN_LIFETIME": timedelta(days=7),    # 7 days
```

### Option 2: Improve Token Refresh Logic

Ensure the axios interceptor properly handles token refresh:

```typescript
// Current issue: token refresh might be failing
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem("refresh_token");

      if (refreshToken) {
        try {
          const response = await axios.post(
            `${API_BASE}/auth/token/refresh/`,
            { refresh: refreshToken }
          );

          // Issue: This response is NOT in our new format!
          // It needs to be unwrapped too
          const tokens = unwrapResponse<{ access: string }>(
            response.data,
            'Token refresh failed'
          );

          localStorage.setItem("access_token", tokens.access);
          originalRequest.headers.Authorization = `Bearer ${tokens.access}`;
          return axiosInstance(originalRequest);
        } catch {
          // Logout user on refresh failure
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          window.location.href = "/login";
        }
      }
    }
  }
);
```

### Option 3: Debug Token Refresh Endpoint

The token refresh endpoint (`/auth/token/refresh/`) also uses `TokenRefreshView` from simplejwt, which returns the OLD format, not our new standardized format.

## Immediate Fix

### Fix 1: Create Custom Token Refresh View

Similar to the custom login view, create a custom token refresh view that returns our standardized format.

### Fix 2: Increase Token Lifetime

Update JWT settings to give users more time before tokens expire.

## Testing

### Check Current Token Lifetime
```bash
# The access token expires in 5 minutes!
# This is too short for a good user experience
```

### Verify Token Storage
After login, check browser's localStorage:
```javascript
localStorage.getItem('access_token')   // Should exist
localStorage.getItem('refresh_token')  // Should exist
```

## Quick Temporary Fix

While we fix the backend, you can extend the session by:
1. Logging in again (gets fresh tokens)
2. Not being inactive for more than 5 minutes

But the real fix is to update the JWT settings and token refresh logic.
