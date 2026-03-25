# Deployment Guide

This guide explains how to deploy the Spotify Collab frontend to production.

## Environment Variables

### Required Variables

- `VITE_API_BASE_URL` - Your backend API base URL (e.g., `https://api.example.com/api`)
- `VITE_APP_NAME` - Application name (default: "Spotify Collab")

### Setting Environment Variables

**⚠️ IMPORTANT:** Never commit `.env` files to version control!

#### Local Development
```bash
cp .env.example .env
# Edit .env with your local settings
```

#### Production (Vercel)
```bash
# Install Vercel CLI
npm i -g vercel

# Link your project
vercel link

# Set environment variables
vercel env add VITE_API_BASE_URL production
# Enter: https://your-backend-domain.com/api

vercel env add VITE_APP_NAME production
# Enter: Spotify Collab
```

#### Production (Netlify)
```bash
# Via Netlify dashboard:
# Site Settings → Environment Variables → Add Variable
# VITE_API_BASE_URL = https://your-backend-domain.com/api
# VITE_APP_NAME = Spotify Collab
```

## Deployment Options

### Option 1: Vercel (Recommended)

**Prerequisites:**
- Backend API must be publicly accessible (not localhost)
- Backend CORS must allow your frontend domain

**Steps:**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
npm run build
vercel --prod
```

**Automatic Deployments:**
1. Push code to GitHub/GitLab/Bitbucket
2. Import project in Vercel dashboard
3. Configure environment variables in dashboard
4. Deploy automatically on push

### Option 2: Netlify

**Create `netlify.toml`:**
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/api/*"
  to = "https://your-backend-domain.com/api/:splat"
  status = 200
```

**Deploy:**
```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
npm run build
netlify deploy --prod
```

### Option 3: Static Hosting (Nginx/Apache)

**Build:**
```bash
npm run build
```

**Deploy to server:**
```bash
# Copy dist/ contents to your web server
scp -r dist/* user@server:/var/www/html/
```

**Nginx config:**
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/html;
    index index.html;

    # SPA routing - redirect all requests to index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API proxy (optional - or use backend directly)
    location /api/ {
        proxy_pass https://your-backend-domain.com/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## Backend Configuration

### CORS Setup

Your backend must allow requests from your frontend domain. Update your Django settings:

**`services/auth/core/settings.py` (and other services):**
```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:5173",
    "https://your-frontend-domain.vercel.app",
    "https://your-custom-domain.com",
]

# For development
CORS_ALLOW_ALL_ORIGINS = True  # ⚠️ ONLY FOR DEV!
```

### Production Backend URL

Update your `.env.production`:
```bash
VITE_API_BASE_URL=https://api.your-domain.com/api
```

## Build & Test Locally

```bash
# 1. Install dependencies
npm install

# 2. Build for production
npm run build

# 3. Preview production build locally
npm run preview

# 4. Test at http://localhost:4173
```

## Troubleshooting

### "Network Error" or CORS Issues
- ✅ Check `VITE_API_BASE_URL` is correct
- ✅ Verify backend CORS allows your domain
- ✅ Ensure backend is accessible from internet (not localhost)

### Environment Variables Not Working
- ✅ Variables MUST start with `VITE_` prefix
- ✅ Rebuild after changing env vars: `npm run build`
- ✅ Check browser console for actual values: `console.log(import.meta.env)`

### Routes Return 404 on Refresh
- ✅ Ensure server has SPA fallback configured (see Nginx config above)
- ✅ Vercel/Netlify handle this automatically

### API Requests Fail in Production
- ✅ Backend must be deployed separately (frontend is static)
- ✅ Backend needs valid SSL certificate
- ✅ Check browser Network tab for actual error messages

## Quick Checklist Before Deploying

- [ ] Environment variables set in hosting platform
- [ ] Backend deployed and publicly accessible
- [ ] Backend CORS allows frontend domain
- [ ] Tested `npm run build` locally
- [ ] Previewed build with `npm run preview`
- [ ] Backend `/api/health/` endpoints return 200
- [ ] JWT authentication flow tested with production backend

## Support

For issues:
1. Check browser console (F12) for errors
2. Check Network tab for failed API requests
3. Verify backend logs
4. Check environment variables in hosting dashboard
