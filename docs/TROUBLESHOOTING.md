# Troubleshooting Guide

Solutions to common frontend development issues.

---

## 🔧 Development Server Issues

### Server Won't Start

**Problem:** `npm run dev` fails with port in use error
```bash
Error: Port 3000 is already in use
```

**Solutions:**
```bash
# 1. Find process using port 3000
lsof -i :3000

# 2. Kill the process
kill -9 <PID>

# 3. Or use different port
# Update vite.config.ts:
server: {
  port: 3001,
  ...
}
```

---

### Hot Module Replacement (HMR) Not Working

**Problem:** Changes to code don't reflect in browser

**Solutions:**
```bash
# 1. Clear Vite cache
rm -rf node_modules/.vite

# 2. Restart dev server
npm run dev

# 3. Check if file saved correctly
ls -la src/YourFile.tsx

# 4. Check browser console for errors
# F12 → Console tab
```

---

### White Screen After Loading

**Problem:** Blank white screen, no errors in console

**Solutions:**
```bash
# 1. Check index.html is loading
curl http://localhost:3000

# 2. Check main.tsx exists
ls -la src/main.tsx

# 3. Check for React errors in console
# F12 → Console → Look for red errors

# 4. Check if root element exists
# Open browser DevTools → Elements tab → Look for <div id="root">
```

---

## 🌐 API Integration Issues

### CORS Errors

**Problem:**
```
Access to fetch at 'http://localhost/api/auth/health/'
from origin 'http://localhost:3000' has been blocked by CORS policy
```

**Solutions:**
```bash
# 1. Verify backend is running
curl http://localhost/api/auth/health/

# 2. Check Vite proxy config
cat vite.config.ts
# Should have:
proxy: {
  '/api': {
    target: 'http://localhost',
    changeOrigin: true,
  },
}

# 3. If accessing backend directly (not through proxy),
# configure backend CORS settings:
# In Django settings.py:
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:5173",
]
```

---

### Network Errors / 404s

**Problem:** API requests return 404 or Network Error

**Diagnosis:**
```bash
# 1. Test backend directly
curl http://localhost/api/auth/health/

# 2. Test through Vite proxy
curl http://localhost:3000/api/auth/health/

# 3. Check axios base URL
# In src/api/axios.ts, verify:
const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

# 4. Check environment variable
echo $VITE_API_BASE_URL
cat .env
```

**Solutions:**
```bash
# Backend not running → Start backend
cd ../spotify-collab
docker-compose up -d

# Wrong API URL → Update .env
VITE_API_BASE_URL=http://localhost/api

# Restart dev server after .env changes
npm run dev
```

---

### Authentication Errors

**Problem:** Always redirected to login, even after logging in

**Diagnosis:**
```javascript
// Open browser console (F12) and run:
console.log('Token:', localStorage.getItem('access_token'));
console.log('User:', localStorage.getItem('user'));
```

**Solutions:**
```javascript
// 1. Check if token is being saved
// After login, token should be in localStorage

// 2. Check ProtectedRoute component
// src/App.tsx - verify token check logic

// 3. Check axios interceptor
// src/api/axios.ts - verify Authorization header is being added

// 4. Clear localStorage and try again
localStorage.clear();
location.reload();
```

---

### JWT Token Not Refreshing

**Problem:** 401 errors after token expires

**Diagnosis:**
```javascript
// Check token expiry (decode JWT):
const token = localStorage.getItem('access_token');
const payload = JSON.parse(atob(token.split('.')[1]));
console.log('Token expires:', new Date(payload.exp * 1000));
```

**Solutions:**
```typescript
// 1. Verify refresh token exists
localStorage.getItem('refresh_token');

// 2. Check refresh endpoint is working
curl -X POST http://localhost/api/auth/token/refresh/ \
  -H "Content-Type: application/json" \
  -d '{"refresh":"<your_refresh_token>"}'

// 3. Check axios interceptor in src/api/axios.ts
// Should handle 401 and refresh token automatically
```

---

## 🎨 UI/Styling Issues

### Tailwind Classes Not Working

**Problem:** Styles not applying

**Diagnosis:**
```bash
# 1. Check if Tailwind CSS is imported
grep "@tailwind" src/index.css

# 2. Check if content paths are correct
cat tailwind.config.js
# Should include:
content: [
  "./index.html",
  "./src/**/*.{js,ts,jsx,tsx}",
]
```

**Solutions:**
```bash
# 1. Restart dev server
npm run dev

# 2. Clear Vite cache
rm -rf node_modules/.vite
npm run dev

# 3. Check Tailwind CSS version
npm list tailwindcss
# Should be v4.x with @tailwindcss/postcss
```

---

### Icons Not Displaying

**Problem:** Lucide React icons not showing

**Solutions:**
```tsx
// 1. Check import
import { IconName } from 'lucide-react';

// 2. Check usage
<IconName size={24} />

// 3. Try reinstalling lucide-react
npm uninstall lucide-react
npm install lucide-react
```

---

## 📦 Build Issues

### Build Fails with TypeScript Errors

**Problem:** `npm run build` fails with type errors

**Common Errors:**
```
error TS1484: 'User' is a type and must be imported using a type-only import
```

**Solutions:**
```typescript
// ✗ Wrong
import { User } from '../types';

// ✓ Correct
import type { User } from '../types';

// Or for multiple types
import type { User, Playlist, Track } from '../types';
```

**Build Commands:**
```bash
# 1. Run TypeScript check
npx tsc --noEmit

# 2. Fix type errors

# 3. Rebuild
npm run build
```

---

### Build Output Too Large

**Problem:** Bundle size is too large (>1MB)

**Diagnosis:**
```bash
# Check bundle size
npm run build
# Look at output for file sizes

# Analyze bundle
npm install -D rollup-plugin-visualizer
# Add to vite.config.ts
```

**Solutions:**
```typescript
// 1. Lazy load routes
const HomePage = lazy(() => import('./pages/HomePage'));
const SearchPage = lazy(() => import('./pages/SearchPage'));

// 2. Dynamic imports for heavy libraries
// Instead of: import { HeavyLib } from 'heavy-lib';
// Use: const HeavyLib = await import('heavy-lib');

// 3. Remove unused dependencies
npm uninstall <unused-package>
```

---

## 🔒 Environment Variables Issues

### Environment Variable Undefined

**Problem:** `import.meta.env.VITE_API_BASE_URL` is undefined

**Solutions:**
```bash
# 1. Check .env file exists
ls -la .env

# 2. Check variable name starts with VITE_
cat .env
# ✓ VITE_API_BASE_URL=http://localhost/api
# ✗ API_BASE_URL=http://localhost/api  (missing VITE_ prefix!)

# 3. Restart dev server after .env changes
# Ctrl+C then: npm run dev

# 4. Check vite-env.d.ts exists
ls -la src/vite-env.d.ts
```

---

### Variables Work in Dev But Not in Production

**Problem:** Env vars work locally but not after deployment

**Solutions:**
```bash
# For Vercel:
# 1. Set variable in Vercel dashboard
# Project → Settings → Environment Variables
# 2. Variable name: VITE_API_BASE_URL
# 3. Value: https://your-backend-domain.com/api
# 4. Redeploy

# For Netlify:
# 1. Set variable in Netlify dashboard
# Site → Settings → Build & deploy → Environment
# 2. Key: VITE_API_BASE_URL
# 3. Value: https://your-backend-domain.com/api
# 4. Redeploy

# 3. Never commit .env file!
# It should be in .gitignore
```

---

## 🧪 Testing Issues

### Can't Test Authentication Flow

**Problem:** Need to test protected endpoints

**Solutions:**
```bash
# 1. Register test user
curl -X POST http://localhost:3000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"testpass123"}'

# 2. Login and save token
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"testpass123"}' \
  | jq -r '.access')

# 3. Use token in requests
curl http://localhost:3000/api/auth/me/ \
  -H "Authorization: Bearer $TOKEN"

# 4. Save to file for testing
echo $TOKEN > /tmp/test_token.txt
```

---

## 🚀 Deployment Issues

### Deployment Fails

**Problem:** Vercel/Netlify build fails

**Diagnosis:**
```bash
# 1. Test build locally first
npm run build

# 2. Check build output
ls -la dist/

# 3. Preview build
npm run preview
```

**Solutions:**
```bash
# 1. Fix build errors locally first
npm run build

# 2. Check environment variables in dashboard
# Vercel: Project → Settings → Environment Variables
# Netlify: Site → Settings → Build & deploy → Environment

# 3. Clear build cache and redeploy
# Vercel: Git → Commits → Redeploy
# Netlify: Site → Deploys → Trigger deploy
```

---

### Deployed App Shows Blank Screen

**Problem:** Deployment succeeds but blank screen in production

**Diagnosis:**
```javascript
// 1. Open browser console (F12)
// Check for errors

// 2. Check Network tab
// Are API requests failing?

// 3. Check environment variables
console.log('API URL:', import.meta.env.VITE_API_BASE_URL);
```

**Solutions:**
```bash
# 1. Verify environment variables are set
# Vercel: Project → Settings → Environment Variables
# Must start with VITE_ prefix!

# 2. Check API URL is correct
# Should be: https://your-backend-domain.com/api
# NOT: http://localhost/api

# 3. Check backend CORS allows production domain
# Add production URL to CORS_ALLOWED_ORIGINS
```

---

## 🐛 Debug Tools

### Browser DevTools

**Open DevTools:** F12 or Right-click → Inspect

**Useful Tabs:**
- **Console:** JavaScript errors, logs
- **Network:** API requests, responses, status codes
- **Elements:** HTML structure, CSS
- **Application:** localStorage, cookies, state

### Check Application State
```javascript
// In browser console:

// Check localStorage
console.log('Access Token:', localStorage.getItem('access_token'));
console.log('Refresh Token:', localStorage.getItem('refresh_token'));

// Check current route
console.log('Path:', window.location.pathname);

// Check React DevTools (if installed)
// Components tab → Inspect state and props
```

### Network Debugging
```javascript
// In browser console, monitor all fetch requests:
const originalFetch = window.fetch;
window.fetch = function(...args) {
  console.log('Fetch:', args[0]);
  return originalFetch.apply(this, args).then(response => {
    console.log('Response:', response.status, response.statusText);
    return response;
  });
};
```

---

## 📞 Still Need Help?

### Check Logs
```bash
# Frontend dev server logs
npm run dev
# (check terminal output)

# Backend logs
cd ../spotify-collab
docker-compose logs -f auth
```

### Get Help
1. Check browser console (F12 → Console)
2. Check Network tab (F12 → Network)
3. Check backend logs
4. Review this troubleshooting guide
5. Check [QUICKREF.md](QUICKREF.md)
6. Ask team members

---

**Common Quick Fixes:**
1. Restart dev server: `Ctrl+C` then `npm run dev`
2. Clear cache: `rm -rf node_modules/.vite`
3. Reinstall deps: `rm -rf node_modules && npm install`
4. Clear browser cache: Ctrl+Shift+R (hard refresh)
5. Check .env file has correct values
6. Verify backend is running

---

**Last Updated:** March 26, 2026
**Version:** 1.0.0
