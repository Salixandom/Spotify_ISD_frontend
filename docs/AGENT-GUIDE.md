# AI Agent Guide: Spotify ISD Frontend

**Purpose**: Quick reference for AI agents working on the frontend codebase
**Last Updated**: March 26, 2026
**Project Stack**: React 19, TypeScript, Vite, Zustand, TanStack Query

---

## 🚀 Quick Start for Agents

### First Steps When Starting Work

1. **Read session documentation first** - Always check the most recent session docs:
   ```bash
   ls -lt docs/SESSION-*.md | head -5
   # Read the latest 2-3 session files to understand recent context
   ```

2. **Check the tech stack**:
   - **Framework**: React 19.2.4 with TypeScript 5.9
   - **Build Tool**: Vite 8.0.1 (NOT Next.js, Create React App, etc.)
   - **Package Manager**: npm (uses package-lock.json)
   - **Styling**: Tailwind CSS 4.x
   - **State**: Zustand 5.x
   - **Data Fetching**: TanStack Query 5.x
   - **Routing**: React Router v7

3. **Understand the environment**:
   - Development: Vite dev server (port 5173 → proxies to 3000)
   - API Proxy: `/api/*` → Backend services (via vite.config.ts)
   - Deployment: Vercel (vercel.json configuration)

---

## 📋 Command Patterns

### Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev
# Runs on http://localhost:5173 (proxies /api/* to backend)

# Build for production
npm run build
# Outputs to /dist directory

# Preview production build
npm run preview

# Run linter
npm run lint
```

### Testing Changes

```bash
# 1. Start dev server
npm run dev

# 2. Open browser
# Navigate to http://localhost:5173 (or configured port)

# 3. Check console for errors
# Look for:
#   - TypeScript errors
#   - ESLint warnings
#   - Network errors (check Network tab)
#   - React hydration errors
```

---

## 🎯 Project Structure

### Directory Layout

```
spotify-collab-frontend/
├── src/
│   ├── api/                    # API client layer
│   │   ├── axios.ts           # Axios instance with interceptors
│   │   ├── auth.ts            # Authentication API calls
│   │   ├── playlists.ts        # Playlist endpoints
│   │   ├── tracks.ts          # Track endpoints
│   │   └── search.ts           # Search endpoints
│   │
│   ├── components/            # React components
│   │   ├── ui/               # Reusable UI primitives (Button, Input, etc.)
│   │   ├── layout/            # Layout components (Header, Sidebar, etc.)
│   │   ├── modals/            # Modal dialogs
│   │   └── [feature]/         # Feature-specific components
│   │
│   ├── pages/                 # Page components (route handlers)
│   │   ├── HomePage.tsx
│   │   ├── LoginPage.tsx
│   │   └── ...
│   │
│   ├── store/                 # Zustand state management
│   │   ├── authStore.ts        # Authentication state
│   │   └── playlistStore.ts    # Playlist state
│   │
│   ├── hooks/                 # Custom React hooks
│   │   ├── useAuth.ts          # Auth hook
│   │   └── usePlaylists.ts     # Playlist data hook
│   │
│   ├── types/                 # TypeScript definitions
│   │   ├── api.ts              # API response types
│   │   ├── models.ts           # Data models
│   │   └── index.ts
│   │
│   ├── App.tsx                # Main app with routing
│   ├── main.tsx                # Entry point
│   └── vite-env.d.ts           # Vite environment types
│
├── public/                     # Static assets
├── docs/                       # Documentation
├── package.json                # Dependencies
├── vite.config.ts              # Vite configuration
├── tsconfig.json               # TypeScript config
├── tailwind.config.js          # Tailwind CSS config
├── vercel.json                 # Vercel deployment config
└── .env.example                # Environment variables template
```

---

## 🔧 Common Tasks for Agents

### Task 1: Running the Application

```bash
# Development server
npm run dev
# Opens on http://localhost:5173
# Hot Module Replacement (HMR) enabled

# Production build
npm run build
# Outputs optimized static files to /dist
```

### Task 2: Adding Dependencies

```bash
# Install new package
npm install package-name

# Install dev dependency
npm install -D package-name

# Check for outdated packages
npm outdated

# Update dependencies
npm update
```

### Task 3: Environment Configuration

```bash
# Copy example env file
cp .env.example .env

# Edit .env to configure:
VITE_API_BASE_URL=http://localhost/api
VITE_APP_NAME=Spotify Collab

# ⚠️ CRITICAL: Vite requires VITE_ prefix for client-side env vars
# Only variables with VITE_ prefix are exposed to client code
```

### Task 4: API Proxy Configuration

**Gotcha**: Frontend doesn't directly call backend services

```typescript
// vite.config.ts
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:80',  // Traefik gateway
      changeOrigin: true,
    }
  }
}
```

**What this means**:
- Frontend calls `/api/auth/*` → Routes to backend auth service
- Frontend calls `/api/playlists/*` → Routes to backend core service
- Traefik handles routing to specific microservices

### Task 5: Type Checking

```bash
# Run TypeScript compiler check
npx tsc --noEmit

# Fix type errors before building
npm run build  # Will fail on type errors
```

### Task 6: Linting

```bash
# Run ESLint
npm run lint

# Auto-fix linting issues
npm run lint -- --fix
```

---

## 📚 Context Sources (Always Check These!)

### 1. Session Documentation (Most Important)
```bash
# Latest session has the most recent context
ls -lt docs/SESSION-*.md

# Read the most recent 2-3 sessions
# They contain: what features were built, decisions made, files changed
```

### 2. Architecture Documentation
```
docs/ARCHITECTURE.md          # System architecture overview
docs/QUICKREF.md             # Quick reference
docs/DEPLOYMENT.md            # Deployment procedures
docs/TROUBLESHOOTING.md       # Common issues
docs/CONTRIBUTING.md          # Contribution guidelines
```

### 3. Environment Configuration
```bash
# Check available env vars
cat .env.example

# Current env (gitignored, for local dev)
cat .env
```

---

## ⚠️ Critical Gotchas for Agents

### Environment Variables: VITE_ Prefix Required

**Gotcha**: Only variables with `VITE_` prefix are exposed to client code

```bash
# ✅ CORRECT - Exposed to client
VITE_API_BASE_URL=http://localhost/api

# ❌ WRONG - NOT exposed to client, undefined in browser
API_BASE_URL=http://localhost/api
REACT_APP_NAME=My App
```

**Why?** Vite requires `VITE_` prefix for security and clarity

### Build Tool: Vite NOT Next.js/CRA

**Gotcha**: This is NOT Create React App or Next.js

```bash
# ❌ WRONG - These commands don't exist
npm start           # CRA only
npm run dev          # Next.js only
next dev             # Next.js only

# ✅ CORRECT - Vite commands
npm run dev          # Vite dev server
npm run build        # Vite production build
```

### API Proxy: Frontend → Traefik → Backend

**Gotcha**: Frontend doesn't call backend services directly

```
Browser → Frontend (localhost:5173)
         ↓
         vite.config.ts proxy: /api/* → http://localhost:80
         ↓
         Traefik Gateway (localhost:80)
         ↓
         Routes to: /api/auth/* → auth service (port 8001)
                   /api/playlists/* → core service (port 8002)
                   /api/collab/* → collaboration service (port 8003)
```

**What to remember**:
- All API calls use `/api/*` prefix (relative path)
- Don't use `http://localhost:8001` directly
- Let Vite proxy + Traefik handle routing

### Package Manager: npm NOT yarn/pnpm

**Gotcha**: This project uses npm (package-lock.json confirms)

```bash
# ✅ CORRECT
npm install
npm run build

# ❌ WRONG - These use different lock files
yarn install          # Uses yarn.lock
pnpm install          # Uses pnpm-lock.yaml
bun install           # Uses bun.lockb
```

### React Version: 19.x NOT 18.x

**Gotcha**: React 19 has some breaking changes from 18.x

```typescript
// React 19: useRef requires initial value
const ref = useRef<HTMLDivElement>(null)  // ✅ Correct

const ref = useRef()  // ❌ Error - missing initial value
```

**What to remember**:
- Always provide initial value to `useRef()`
- Check React 19 docs for new patterns

---

## 🎨 Code Patterns to Follow

### Adding New API Endpoints

1. Create API client function in `src/api/`:
   ```typescript
   // src/api/myfeature.ts
   import axios from './axios';

   export const getMyFeature = async () => {
     const response = await axios.get('/api/myfeature/');
     return response.data;
   };
   ```

2. Create React Query hook in `src/hooks/`:
   ```typescript
   // src/hooks/useMyFeature.ts
   import { useQuery } from '@tanstack/react-query';
   import { getMyFeature } from '../api/myfeature';

   export const useMyFeature = () => {
     return useQuery({
       queryKey: ['myfeature'],
       queryFn: getMyFeature,
     });
   };
   ```

3. Use in component:
   ```typescript
   const { data, isLoading, error } = useMyFeature();
   ```

### Creating New Pages

1. Create page component in `src/pages/`:
   ```typescript
   // src/pages/MyPage.tsx
   export function MyPage() {
     return <div>My Page</div>;
   }
   ```

2. Add route in `src/App.tsx`:
   ```typescript
   import { BrowserRouter, Routes, Route } from 'react-router-dom';
   import { MyPage } from './pages/MyPage';

   <BrowserRouter>
     <Routes>
       <Route path="/mypage" element={<MyPage />} />
     </Routes>
   </BrowserRouter>
   ```

### Adding Environment Variables

1. Add to `.env`:
   ```bash
   VITE_MY_VAR=value
   ```

2. Add to `vite-env.d.ts` (for TypeScript):
   ```typescript
   /// <reference types="vite/client" />

   interface ImportMetaEnv {
     readonly VITE_MY_VAR: string;
     // ... other vars
   }
   ```

3. Use in code:
   ```typescript
   const myVar = import.meta.env.VITE_MY_VAR;
   ```

---

## 🔍 Debugging Guide for Agents

### When Dev Server Won't Start

**Step 1: Check port availability**
```bash
# Check if port 5173 is in use
lsof -i :5173
```

**Step 2: Check for build errors**
```bash
# Run TypeScript check
npx tsc --noEmit
```

**Step 3: Clear Vite cache**
```bash
rm -rf node_modules/.vite
npm run dev
```

**Step 4: Reinstall dependencies**
```bash
rm -rf node_modules package-lock.json
npm install
```

### When API Calls Fail

**Step 1: Check backend is running**
```bash
# In backend directory
docker-compose ps
curl http://localhost/api/auth/health/
```

**Step 2: Verify proxy configuration**
```bash
# Check vite.config.ts has proxy configured
cat vite.config.ts | grep -A 5 proxy
```

**Step 3: Check environment variable**
```bash
# Should be: VITE_API_BASE_URL=http://localhost/api
cat .env | grep VITE_API_BASE_URL
```

**Step 4: Check browser console**
- Look for CORS errors
- Check Network tab for failed requests
- Verify request URLs are correct

### When Build Fails

**Step 1: Check for TypeScript errors**
```bash
npx tsc --noEmit
```

**Step 2: Check for ESLint errors**
```bash
npm run lint
```

**Step 3: Check Vite build output**
```bash
npm run build 2>&1 | tee build.log
# Review build.log for errors
```

**Common Issues**:
- TypeScript type errors → Fix type definitions
- Missing imports → Add imports
- ESLint errors → Fix linting issues
- Environment variable issues → Ensure `VITE_` prefix

---

## 📝 Making Changes: Best Practices

### Before Making Changes

1. **Read recent session docs** - Understand what's been done
2. **Check existing patterns** - Look at similar components
3. **Follow established conventions** - Match code style

### When Editing Code

1. **Use TypeScript** - Don't add `.js` or `.jsx` files (all `.tsx`/`.ts`)
2. **Follow component patterns** - Container/Presenter pattern
3. **Use Tailwind CSS** - Don't add CSS files (use utility classes)
4. **Test after changes** - Verify dev server still starts

### When Adding Features

1. **Check existing components first** - May already exist
2. **Follow file structure** - Keep components in appropriate directories
3. **Update documentation** - Add session doc entry for new features
4. **Test all user flows** - Verify feature works end-to-end

**⚠️ GIT POLICY**: After adding features, **ASK USER** to commit and push. Never run git commands yourself.

---

## 🔄 CI/CD Pre-Commit Checklist (CRITICAL!)

**BEFORE pushing or creating PRs, ALWAYS run these checks locally to avoid CI failures:**

### ✅ Mandatory Pre-Push Checks

#### 1. ESLint Code Quality Check

**Why**: CI runs ESLint and will fail if there are linting errors

```bash
# Run ESLint
npm run lint

# Auto-fix linting issues (if possible)
npm run lint -- --fix

# Check specific files
npm run lint -- src/components/MyComponent.tsx
```

**What ESLint catches**:
- Unused variables and imports
- React hooks dependency issues
- TypeScript type errors
- Code style violations
- Missing props validation

#### 2. TypeScript Type Check

**Why**: CI runs `npx tsc --noEmit` and will fail on type errors

```bash
# Run TypeScript compiler check
npx tsc --noEmit

# This will:
# - Check all TypeScript files for type errors
# - Verify type imports are correct
# - Catch undefined types/variables
# - Fail the build if errors are found
```

**Common type errors**:
- Missing type imports → Add proper import statement
- `any` types → Replace with proper TypeScript types
- Missing interface definitions → Define types in `src/types/`
- Props mismatch → Check component props interface

#### 3. Build Verification

**Why**: CI builds the project - catch build errors locally

```bash
# Production build
npm run build

# This will:
# - Compile all TypeScript files
# - Optimize and bundle code with Vite
# - Output to /dist directory
# - Fail if there are TypeScript or build errors
```

**Common build failures**:
- TypeScript errors → Fix type definitions
- Missing dependencies → Run `npm install`
- Import errors → Check import paths
- Environment variable issues → Ensure `VITE_` prefix

#### 4. Check for Dependencies Issues

**Why**: Missing or outdated dependencies can cause CI failures

```bash
# Check if package-lock.json is up to date
npm install

# Check for outdated packages
npm outdated

# Check for security vulnerabilities
npm audit
```

---

### 🚀 Quick Pre-Push Command (Run This Before Every Push)

```bash
# One command to check everything
echo "🔍 Running pre-push CI checks..."

# 1. Run ESLint
echo "▶ Running ESLint..."
npm run lint || { echo "❌ ESLint check failed"; exit 1; }

# 2. TypeScript type check
echo "▶ Running TypeScript type check..."
npx tsc --noEmit || { echo "❌ Type check failed"; exit 1; }

# 3. Build verification
echo "▶ Building project..."
npm run build || { echo "❌ Build failed"; exit 1; }

# 4. Check git status
echo "▶ Checking what changed..."
git status --short

echo "✅ All pre-push checks passed! Ready to commit/push."
```

---

### 📋 CI Job Reference

When CI fails, check which job failed:

| CI Job | What It Checks | Quick Fix |
|--------|---------------|-----------|
| **Lint & Type Check** | ESLint + TypeScript | Run `npm run lint` and `npx tsc --noEmit` locally |
| **Build Frontend** | Production build with Vite | Run `npm run build` locally |
| **Merge Conflict** | Can merge to main | `git fetch origin main && git merge origin/main` |

---

### 🎯 Agent Workflow: Before Making Changes

1. **Read session docs** (as always)
2. **Make your changes**
3. **Run pre-push checks** (see above)
4. **Ask user to commit and push**

**NEVER skip step 3** - CI failures waste time and block PRs!

---

## ⚠️ AGENT GIT POLICY (IMPORTANT!)

### ❌ NEVER Run These Commands

**Agents MUST NOT execute git operations:**
- `git add`
- `git commit`
- `git push`
- `git pull` (without explicit user request)
- `git rebase`
- `git reset`

### ✅ ALWAYS Ask the User

**Instead, inform the user what to commit:**

```bash
# ❌ WRONG - Agent runs git commands
git add src/components/NewComponent.tsx
git commit -m "Add new component"
git push

# ✅ RIGHT - Agent instructs user
"Please commit the following changes:
git add src/components/NewComponent.tsx src/api/newfeature.ts
git add package-lock.json  (if dependencies changed)

Commit message:
feat: add new feature component

Then push with: git push"
```

### Why This Policy?

1. **User control** - Git operations change history, user should review first
2. **Avoid mistakes** - Agents might commit wrong files or make bad commit messages
3. **Code review** - User should see what's being committed before it's pushed
4. **Accidental pushes** - Prevents pushing incomplete or broken work

### Exception: Read-Only Git Commands

**These ARE allowed** (they don't modify state):
- `git status`
- `git diff`
- `git log`
- `git show`
- `git branch`

---

## 🚨 Safety Checks

### Before Running Destructive Commands

❌ **DON'T** run these without confirmation:
- `rm -rf node_modules` (unless reinstalling)
- `rm -rf dist` (unless cleaning build)
- `npm install -f` (force reinstall - can break things)
- `git clean -fdx` (deletes untracked files)

✅ **DO** ask user first if any of these seem necessary

### Before Committing Changes

1. **Run type check** - `npx tsc --noEmit`
2. **Run linter** - `npm run lint`
3. **Test build** - `npm run build`
4. **Test app** - `npm run dev` and manually test

---

## 🎯 Quick Reference Commands

```bash
# Development
npm run dev                    # Start dev server (port 5173)
npm run build                  # Production build
npm run preview               # Preview production build
npm run lint                   # Run linter

# Dependencies
npm install                    # Install dependencies
npm install package-name       # Add specific package
npm update                     # Update dependencies

# Type Checking
npx tsc --noEmit               # TypeScript check
npx tsc                        # Full compile (output to virtual FS)

# Testing
npm run dev                    # Start server, then open browser
# Check console for errors
# Check Network tab for API calls
```

---

## 📖 Recommended Reading Order for New Agents

1. **Latest session doc** - `docs/SESSION-2026-03-26.md`
2. **This file** - Get familiar with command patterns
3. **Architecture doc** - `docs/ARCHITECTURE.md`
4. **Quick reference** - `docs/QUICKREF.md`
5. **Previous sessions** - Check 2-3 most recent for context

---

## 💡 Agent Best Practices

### DO ✅

- **Read session docs first** - They contain crucial context
- **Check existing code** - Use `Read` tool before editing
- **Follow patterns** - Match existing code style and structure
- **Test changes** - Verify dev server starts after modifications
- **Ask for clarification** - If unsure, ask user before proceeding
- **Document changes** - Update session docs when implementing features
- **Run pre-push CI checks** - ESLint, TypeScript, and build verification
- **Ask user to commit** - After making changes, provide clear git commands for user to run

### DON'T ❌

- **Skip reading docs** - Always check session docs first
- **Make assumptions** - Verify file contents before editing
- **Use wrong build tool** - This is Vite, not Next.js or CRA
- **Ignore VITE_ prefix** - Client env vars MUST have `VITE_` prefix
- **Direct backend calls** - Use `/api/*` prefix and proxy
- **Skip type checking** - TypeScript errors will break build
- **Run git commands** - NEVER use `git add`, `git commit`, `git push`, `git pull`

---

## 🆘 Getting Unstuck

### If You're Confused

1. **Read the session docs** - Answer is likely there
2. **Check browser console** - Look for errors, warnings
3. **Verify proxy config** - Ensure `/api/*` routing is correct
4. **Test backend endpoints** - Verify backend is running
5. **Ask user for clarification** - Better to ask than break something

### Common Error Messages

| Error | Meaning | Fix |
|-------|---------|-----|
| "Module not found" | Missing dependency | Run `npm install <package>` |
| "process is not defined" | Node.js polyfill needed | Use `import.meta.env.VITE_*` instead |
| "Cannot find module" | Import path wrong | Check import paths, use relative imports |
| "Port already in use" | Old process running | Kill process on port 5173 |
| "CORS error" | Backend not running or CORS misconfigured | Start backend or check CORS settings |
| "Environment variable not defined" | Missing `VITE_` prefix | Add `VITE_` prefix to env var |

---

## 🔌 Key Technical Differences from Backend

| Aspect | Backend (Django) | Frontend (React + Vite) |
|--------|------------------|----------------------|
| **Package manager** | `uv` | `npm` |
| **Run command** | `uv run python manage.py` | `npm run dev` |
| **Build output** | N/A (Python runtime) | `/dist` directory |
| **Dev server** | Docker containers | Vite dev server |
| **Environment vars** | Any prefix (no requirement) | MUST have `VITE_` prefix |
| **Type checking** | Python type hints | TypeScript compilation |
| **Linting** | Flake8/Black | ESLint |
| **Hot reload** | Docker volume mounts | Vite HMR |

---

## 🎯 Frontend-Specific Patterns

### State Management with Zustand

```typescript
// src/store/authStore.ts
import { create } from 'zustand';

interface AuthState {
  user: User | null;
  token: string | null;
  setUser: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  setUser: (user, token) => set({ user, token }),
  logout: () => set({ user: null, token: null }),
}));
```

### Data Fetching with TanStack Query

```typescript
// src/hooks/usePlaylists.ts
import { useQuery } from '@tanstack/react-query';
import { getPlaylists } from '../api/playlists';

export const usePlaylists = () => {
  return useQuery({
    queryKey: ['playlists'],
    queryFn: getPlaylists,
    staleTime: 1000 * 60, // 1 minute
  });
};
```

### Protected Routes

```typescript
// In page component or route wrapper
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
```

---

**Remember**: This is a Vite + React project, NOT Next.js! All commands and patterns are different from the backend Django services. 📚
