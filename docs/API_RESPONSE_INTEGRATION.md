# Frontend API Response Integration

## Summary

The frontend has been updated to work with the new backend standardized response format. All API calls now properly unwrap the `SuccessResponse` and `ErrorResponse` wrappers.

## Backend Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "error": "error_type",
  "message": "Human-readable error message",
  "details": { ... }  // Optional, for validation errors
}
```

## Changes Made

### 1. Created API Response Utility (`src/utils/apiResponse.ts`)

A comprehensive utility for handling backend responses:

- **`unwrapResponse<T>(response, errorMessage?)`** - Extracts data from SuccessResponse, throws on ErrorResponse
- **`unwrapResponseOrNull<T>(response)`** - Safe extraction, returns null on error
- **`getErrorMessage(error)`** - User-friendly error message extraction
- **`isErrorType(error, errorType)`** - Check for specific error types (e.g., 'validation_error', 'not_found')
- **`getValidationErrors(error)`** - Extracts field-level validation errors

### 2. Updated API Calls (`src/api/auth.ts`)

All API methods now use `unwrapResponse`:

```typescript
export const authAPI = {
  register: async (username: string, password: string): Promise<User> => {
    const res = await api.post('/auth/register/', { username, password });
    return unwrapResponse<User>(res.data, 'Registration failed');
  },

  login: async (username: string, password: string): Promise<AuthTokens> => {
    const res = await api.post('/auth/login/', { username, password });
    const tokens = unwrapResponse<AuthTokens>(res.data, 'Login failed');
    localStorage.setItem('access_token', tokens.access);
    localStorage.setItem('refresh_token', tokens.refresh);
    return tokens;
  },

  me: async (): Promise<User> => {
    const res = await api.get('/auth/me/');
    return unwrapResponse<User>(res.data, 'Failed to fetch user');
  },
};
```

### 3. Updated Axios Interceptor (`src/api/axios.ts`)

Token refresh now uses the response wrapper:

```typescript
const tokens = unwrapResponse<{ access: string }>(
  response.data,
  'Token refresh failed'
);
localStorage.setItem("access_token", tokens.access);
```

### 4. Simplified Error Handling in Components

**Before:**
```typescript
catch (err) {
  const error = err as { response?: { data?: { detail?: string } } };
  if (error.response?.data?.detail) {
    setError(error.response.data.detail);
  } else {
    setError("Failed to login");
  }
}
```

**After:**
```typescript
catch (err) {
  setError(getErrorMessage(err));
}
```

## Usage Examples

### Basic API Call
```typescript
import { unwrapResponse } from '../utils/apiResponse';

const getUser = async (id: number): Promise<User> => {
  const res = await api.get(`/users/${id}/`);
  return unwrapResponse<User>(res.data, 'Failed to fetch user');
};
```

### Handling Validation Errors
```typescript
import { getValidationErrors } from '../utils/apiResponse';

try {
  await updateProfile(data);
} catch (err) {
  const errors = getValidationErrors(err);
  if (errors) {
    setFieldErrors(errors); // { username: 'This field is required.' }
  }
}
```

### Checking Error Types
```typescript
import { isErrorType } from '../utils/apiResponse';

try {
  await createResource(data);
} catch (err) {
  if (isErrorType(err, 'conflict')) {
    showError('Resource already exists');
  } else if (isErrorType(err, 'validation_error')) {
    showValidationErrors();
  }
}
```

### Safe Data Extraction
```typescript
import { unwrapResponseOrNull } from '../utils/apiResponse';

const prefs = unwrapResponseOrNull<Preferences>(
  await api.get('/preferences/').data
);

if (prefs) {
  // Use preferences
} else {
  // Use defaults
}
```

## Benefits

1. **Type Safety**: Full TypeScript support with generics
2. **Cleaner Code**: No manual response unwrapping in every API call
3. **Consistent Error Handling**: All errors are handled uniformly
4. **Better User Experience**: User-friendly error messages with network detection
5. **Easier Maintenance**: Single source of truth for response handling
6. **Validation Support**: Built-in support for field-level validation errors

## Testing

The frontend builds successfully with all changes:
```bash
npm run build
# ✓ built in 598ms
```

## Migration Guide for Other API Files

To update other API files to use the new response wrapper:

1. Import the utility:
   ```typescript
   import { unwrapResponse } from '../utils/apiResponse';
   ```

2. Update API calls:
   ```typescript
   // Before
   const res = await api.get('/endpoint/');
   return res.data;

   // After
   const res = await api.get('/endpoint/');
   return unwrapResponse<DataType>(res.data);
   ```

3. Update error handling in components:
   ```typescript
   // Before
   catch (err) {
     const msg = err.response?.data?.detail || 'Error';
     setError(msg);
   }

   // After
   catch (err) {
     setError(getErrorMessage(err));
   }
   ```
