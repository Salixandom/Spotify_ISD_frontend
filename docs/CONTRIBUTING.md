# Contributing to Spotify ISD Frontend

## Welcome! 👋

We're excited to have you contribute to the Spotify ISD frontend. This document will help you get started and understand our workflow.

## Team Size: 6 Developers

With multiple developers working simultaneously, we use strict CI/CD processes to prevent broken builds and merge conflicts.

## Branch Strategy

We use a simplified Git flow:

- **`main`** = Production branch (protected)
- **`develop`** = Integration branch (optional, for testing features together)
- **`feature/*`** = New features
- **`bugfix/*`** = Bug fixes
- **`hotfix/*`** = Urgent production fixes

## Workflow

### 1. Start a New Feature

```bash
# Always start from the latest main
git checkout main
git pull origin main

# Create your feature branch
git checkout -b feature/your-feature-name
```

### 2. Make Changes

```bash
# Make your changes
git add .
git commit -m "feat: add your descriptive message"
```

**Commit message format:**
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `refactor:` - Code refactoring
- `test:` - Adding tests
- `chore:` - Maintenance tasks

### 3. Push and Create PR

```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub.

### 4. CI Checks

Your PR will automatically run these checks:
- ✅ ESLint (code quality)
- ✅ TypeScript type check
- ✅ Build verification
- ✅ Merge conflict detection
- ✅ Branch up-to-date check

**All checks must pass before merge.**

### 5. Code Review

- At least **1 team member** must approve your PR
- Address all review comments
- Update PR as needed

### 6. Merge

Once approved and all checks pass:
- Click "Merge pull request"
- Use "Squash and merge" to keep history clean
- Delete your branch after merging

## Required CI Checks

### What Gets Checked

1. **Linting** (`npm run lint`)
   - Code style and consistency
   - Catches common errors

2. **Type Check** (`tsc --noEmit`)
   - TypeScript type safety
   - Catches type errors before runtime

3. **Build** (`npm run build`)
   - Verifies production build works
   - Catches import errors
   - Tests Vite bundling

4. **Merge Conflicts**
   - Automatically detects conflicts with `main`
   - Comments on PR if conflicts found

5. **Branch Up-to-Date**
   - Ensures your branch has latest `main` changes
   - Prompts you to merge if behind

## Automatic Deployments

### Preview Deployments 🚀

Every PR automatically gets a **preview URL** where you can test your changes before merging.

### Production Deployments

Merging to `main` automatically deploys to **production** via Vercel.

## Setup Secrets

For CI/CD to work, add these secrets in GitHub repo settings (`Settings → Secrets and variables → Actions`):

### Required for Frontend

```
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_org_id
VERCEL_PROJECT_ID=your_project_id
```

**How to get these values:**

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Link project
cd /path/to/spotify-collab-frontend
vercel link

# Get IDs
cat .vercel/project.json
```

Add these 3 values to GitHub Secrets.

## Merge Conflict Prevention

Our CI automatically detects merge conflicts. If found:

1. **Don't panic!** This is normal with 6 developers
2. Update your branch:
   ```bash
   git fetch origin main
   git merge origin/main
   ```
3. Resolve conflicts manually
4. Commit and push
5. CI will re-run automatically

## Testing Locally Before Push

Always test locally before pushing:

```bash
# Run linter
npm run lint

# Type check
npx tsc --noEmit

# Build
npm run build

# Run dev server
npm run dev
```

## Common Issues

### "Branch is behind main"

```bash
git fetch origin main
git merge origin/main
# Resolve any conflicts
git push
```

### "Merge conflicts detected"

```bash
git fetch origin main
git merge origin/main
# Fix conflicts in your editor
git add .
git commit -m "resolve merge conflicts"
git push
```

### "TypeScript errors"

```bash
# Check errors
npx tsc --noEmit

# Fix reported errors, then commit
```

## Questions?

- Check the [GitHub Issues](https://github.com/your-org/spotify-collab-frontend/issues)
- Ask in team chat/Slack
- Create a "Discussion" on GitHub for design questions

## Happy Contributing! 🎉
