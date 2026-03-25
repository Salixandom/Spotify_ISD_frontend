# Frontend Architecture

Technical overview of the Spotify Collab frontend application architecture.

---

## 🏗️ System Architecture

```
User Browser (Chrome/Firefox/Safari)
    ↓
React Application (Vite Dev Server - Port 3000)
    ↓
    ├─→ React UI Components
    ├─→ Zustand Stores (State Management)
    └─→ Axios API Client (JWT Authentication)
         ↓
    Vite Proxy (/api/* → Backend)
         ↓
    Traefik Gateway (Port 80)
         ↓
    Django Microservices (Auth/Playlist/Track/etc)
```

---

## 📦 Technology Stack

### Core
- React 19.0.0 - UI library
- TypeScript 5.x - Type safety
- Vite 8.0.2 - Build tool

### Routing & State
- React Router v7 - Client-side routing
- Zustand 5.x - State management
- TanStack Query 5.x - Server state (configured)

### UI/Styling
- Tailwind CSS 4.x - Styling
- Lucide React - Icons
- React Hot Toast - Notifications
- DnD Kit 7.x - Drag & drop

### HTTP Client
- Axios 1.x - HTTP client with JWT interceptors

---

## 📁 Project Structure

```
src/
├── api/              # API client layer (6 files)
├── components/       # React components
│   ├── ui/          # Reusable UI components (5 files)
│   ├── layout/      # Layout components (4 files)
│   ├── modals/      # Modal dialogs (6 files)
│   └── [feature]/   # Feature placeholders
├── pages/           # Page components (6 files)
├── store/           # Zustand stores (2 files)
├── hooks/           # Custom hooks (3 files)
├── types/           # TypeScript definitions
├── App.tsx          # Main app with routing
└── main.tsx         # Entry point
```

---

## 🔐 Authentication Flow

1. User → Login → authAPI.login()
2. Backend → JWT tokens ({ access, refresh })
3. localStorage.setItem('access_token', token)
4. useAuthStore.setUser(user)
5. Redirect to Home (/)

**Auto-Refresh on 401:**
- Axios response interceptor catches 401
- POST /api/auth/token/refresh/ with refresh token
- Update localStorage with new access token
- Retry original request

---

## 🎨 Component Architecture

### Container/Presenter Pattern
- Container components: State, API calls
- Presenter components: Pure UI, receive props

### Composition Pattern
- Small reusable components
- Compose into larger features
- Example: Modal → Button + Input + actions

---

## 🚀 Build Process

**Development:**
```
npm run dev
→ Vite dev server (HMR enabled)
→ Fast refresh (~100-200ms)
```

**Production:**
```
npm run build
→ TypeScript compilation
→ Code splitting
→ Minification
→ Output: dist/ folder
→ Bundle: 318 KB (gzipped: 103 KB)
```

---

## 🎓 Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| Zustand over Redux | Simpler API, less boilerplate |
| Axios over fetch | Interceptors, JWT handling |
| Vite over Webpack | Faster HMR, simpler config |
| Tailwind v4 | Latest features, better performance |

---

**Last Updated:** March 26, 2026
**Version:** 1.0.0
