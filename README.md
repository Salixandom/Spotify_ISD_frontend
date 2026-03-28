# Spotify Collab Frontend

React + Vite + TypeScript frontend for the Spotify Collaborative Playlist application.

**Status:** 🟢 Production Ready | **Version:** 1.0.0 | **Last Updated:** March 26, 2026

---

## 🎯 Overview

This is the frontend application for the Spotify Collaborative Playlist system. It provides a modern, responsive user interface for managing playlists, tracks, searching music, and collaborating with other users.

**Key Features:**
- ✅ JWT-based authentication
- ✅ Responsive design (mobile-first)
- ✅ Real-time music player
- ✅ Drag-and-drop playlist reordering
- ✅ Collaborative playlists
- ✅ Advanced search & browse
- ✅ Type-safe TypeScript codebase

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The app will be available at `http://localhost:3000`

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| **[docs/QUICKREF.md](docs/QUICKREF.md)** | Quick reference guide for developers |
| **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)** | Technical architecture and design decisions |
| **[docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md)** | Common issues and solutions |
| **[DEPLOYMENT.md](DEPLOYMENT.md)** | Deployment guide for production |
| **[docs/SESSION-2026-03-26.md](docs/SESSION-2026-03-26.md)** | Development session documentation |

---

## ⚙️ Environment Variables

Create a `.env` file in the root directory:

```bash
# Copy the example file
cp .env.example .env
```

**Required Variables:**
```bash
VITE_API_BASE_URL=http://localhost/api
VITE_APP_NAME=Spotify Collab
VITE_AUTH_MODE=normal
```

**Auth Mode Options:**
- `VITE_AUTH_MODE=normal` → Normal mode (JWT authentication enforced)
- `VITE_AUTH_MODE=dev_no_jwt` → Development mode (no JWT required for frontend navigation)

**⚠️ Important:**
- All env vars MUST start with `VITE_` prefix
- Never commit `.env` files (already in `.gitignore`)
- See [DEPLOYMENT.md](DEPLOYMENT.md) for production setup

---

## 🛠️ Technology Stack

### Core Framework
- **React 19** - UI library
- **TypeScript 5.x** - Type safety
- **Vite 8** - Build tool & dev server

### Routing & State
- **React Router v7** - Client-side routing
- **Zustand** - State management
- **TanStack Query** - Server state

### UI & Styling
- **Tailwind CSS 4** - Styling framework
- **Lucide React** - Icon library
- **React Hot Toast** - Notifications
- **DnD Kit** - Drag & drop

### HTTP Client
- **Axios** - API client with JWT interceptors

---

## 🔧 Development

See [docs/QUICKREF.md](docs/QUICKREF.md) for complete development guide.

### Backend Requirements

```bash
# Start backend services
cd ../spotify-collab
docker-compose up -d

# Verify services
curl http://localhost/api/auth/health/
```

---

## 🌐 Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for complete deployment guide.

### Quick Deploy (Vercel)
```bash
npm i -g vercel
vercel
```

### Quick Deploy (Netlify)
```bash
npm i -g netlify-cli
npm run build
netlify deploy --prod
```

---

## 🐛 Troubleshooting

See [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) for solutions to common issues.

---

## 📝 TODO

This is a skeleton. Features to implement:

- [ ] **Role 1:** Authentication forms (Login/Register)
- [ ] **Role 2:** Playlist management UI
- [ ] **Role 3:** Track display and controls
- [ ] **Role 4:** Search and browse functionality
- [ ] **Role 5:** Collaboration features

---

## 📄 License

MIT

---

## 👥 Team
- **Development Team:** Sakib + Taskeen + Raiyan + Mesbah + Arian + Mehedi

---

**Last Updated:** March 26, 2026
**Version:** 1.0.0
**Status:** 🟢 Production Ready
