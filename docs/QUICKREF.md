# Quick Reference: Frontend Development

## 🚀 For New Developers

### Step 1: Navigate to Frontend
```bash
cd spotify-collab-frontend
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Environment Setup
```bash
# Copy environment template
cp .env.example .env

# Edit .env if needed (defaults work for local development)
# VITE_API_BASE_URL=http://localhost/api
```

### Step 4: Start Development Server
```bash
npm run dev
```

Frontend: http://localhost:3000
Backend API: http://localhost/api/*

---

## 🔄 Quick Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server on port 3000 |
| `npm run build` | Build for production (outputs to `dist/`) |
| `npm run preview` | Preview production build locally |
| `npm install` | Install dependencies |
| `npm run lint` | Run ESLint |

---

## 🔗 Important URLs

### Development
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost/api/*
- **API Proxy**: http://localhost:3000/api/* → http://localhost/api/*

### Production (After Deployment)
- **Your Domain**: https://your-domain.vercel.app
- **API**: https://your-backend-domain.com/api

---

## 📁 Project Structure

```
src/
├── api/              # API client (axios with JWT)
├── components/       # React components
│   ├── ui/          # Reusable UI components
│   ├── layout/      # Layout (Sidebar, Navbar, Player)
│   ├── modals/      # Modal dialogs
│   └── [feature]/   # Feature components (placeholders)
├── pages/           # Page components
├── store/           # Zustand state management
├── hooks/           # Custom React hooks
├── types/           # TypeScript definitions
├── App.tsx          # Main app with routing
└── main.tsx         # Entry point
```

---

## 🔐 Authentication Flow

### How JWT Works in This App

1. **Login/Register** → Backend returns JWT tokens
2. **Token Storage** → Saved to localStorage
3. **API Requests** → Axios interceptor adds `Authorization: Bearer <token>`
4. **Auto-Refresh** → On 401, refresh token is used automatically
5. **Logout** → Tokens cleared, redirect to `/login`

### Test Authentication
```bash
# Register
curl -X POST http://localhost:3000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"pass123"}'

# Login
curl -X POST http://localhost:3000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"pass123"}'

# Save access token from response
export TOKEN="<access_token_from_login>"

# Access protected endpoint
curl http://localhost:3000/api/auth/me/ \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🛠️ Common Tasks

### Add New API Endpoint
```typescript
// src/api/myFeature.ts
import api from './axios';
import type { MyType } from '../types';

export const myFeatureAPI = {
  get: async (id: number): Promise<MyType> => {
    const res = await api.get(`/myfeature/${id}/`);
    return res.data;
  },
};
```

### Add New Page
```typescript
// src/pages/MyPage.tsx
import React from 'react';

export const MyPage: React.FC = () => {
  return <div>My Page</div>;
};

// Add to App.tsx routes:
// <Route path="mypage" element={<MyPage />} />
```

### Add New State Store
```typescript
// src/store/myStore.ts
import { create } from 'zustand';
import type { MyType } from '../types';

interface MyStore {
  data: MyType | null;
  setData: (data: MyType) => void;
}

export const useMyStore = create<MyStore>((set) => ({
  data: null,
  setData: (data) => set({ data }),
}));
```

### Add Custom Hook
```typescript
// src/hooks/useMyHook.ts
import { useMyStore } from '../store/myStore';

export const useMyHook = () => {
  const { data, setData } = useMyStore();
  return { data, setData };
};
```

---

## 🎨 Styling Guide

### Tailwind Classes
```tsx
// Spotify colors
bg-spotify-black      // #121212
bg-spotify-dark       // #1a1a1a
bg-spotify-surface    // #242424
bg-spotify-elevated   // #2a2a2a
bg-spotify-green      // #1db954
text-spotify-text     // #ffffff
text-spotify-subtext  // #b3b3b3
border-spotify-border // #333333
```

### Component Patterns
```tsx
// Button component usage
<Button variant="primary" size="md" onClick={handleClick}>
  Click Me
</Button>

// Modal component
<Modal isOpen={showModal} onClose={() => setShowModal(false)} title="My Modal">
  <p>Modal content</p>
</Modal>
```

---

## 🐛 Quick Fixes

### Environment Variables Not Working
```bash
# 1. Check .env file exists
ls -la .env

# 2. Restart dev server
# Ctrl+C then: npm run dev

# 3. Check variable starts with VITE_
# Only VITE_ prefixed variables are available in browser!
```

### API Requests Failing
```bash
# 1. Check backend is running
curl http://localhost/api/auth/health/

# 2. Check proxy in vite.config.ts
# Should have: '/api': { target: 'http://localhost', changeOrigin: true }

# 3. Check VITE_API_BASE_URL in .env
# Should be: http://localhost/api
```

### Hot Reload Not Working
```bash
# Clear Vite cache
rm -rf node_modules/.vite
npm run dev
```

### TypeScript Errors
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Build Failing
```bash
# Check TypeScript errors
npm run build

# Fix type imports (use 'type' keyword)
import type { User } from '../types';  // ✓
import { User } from '../types';       // ✗
```

---

## 🔄 Git Workflow

### Standard Feature Development
```bash
# 1. Start from main
git checkout main
git pull origin main

# 2. Create feature branch
git checkout -b feature/my-feature

# 3. Make changes and commit
git add .
git commit -m "feat: add user profile page"

# 4. Push branch
git push -u origin feature/my-feature

# 5. Create PR on GitHub
```

### Commit Message Conventions
```
feat:     add new feature
fix:      fix bug
docs:     update documentation
style:    formatting changes
refactor: code refactoring
test:     add tests
chore:    maintenance tasks
```

---

## 📦 Dependencies

### Key Packages
- **react**: ^19.0.0 - UI framework
- **react-router-dom**: ^7.x - Routing
- **axios**: ^1.x - HTTP client
- **@tanstack/react-query**: ^5.x - Data fetching
- **zustand**: ^5.x - State management
- **tailwindcss**: ^4.x - Styling
- **lucide-react**: ^0.x - Icons
- **react-hot-toast**: ^2.x - Notifications
- **@dnd-kit/***: ^7.x - Drag and drop

### Add New Dependency
```bash
# Runtime dependency
npm install package-name

# Development dependency
npm install -D package-name
```

---

## 🧪 Testing Checklist

Before committing, verify:
- [ ] No TypeScript errors
- [ ] No console errors (F12 → Console)
- [ ] App loads without crashes
- [ ] API requests working (Network tab)
- [ ] Authentication flow works
- [ ] Responsive design (mobile view)

---

## 🚀 Production Deployment

### Vercel (Recommended)
```bash
npm i -g vercel
vercel
# Follow prompts
```

### Netlify
```bash
npm i -g netlify-cli
npm run build
netlify deploy --prod
```

See [DEPLOYMENT.md](../DEPLOYMENT.md) for detailed instructions.

---

## 📞 Need Help?

- Check [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
- Check [DEPLOYMENT.md](../DEPLOYMENT.md)
- Check browser console (F12)
- Check backend logs: `docker-compose logs -f`

---

**Last Updated:** March 26, 2026
**Version:** 1.0.0
