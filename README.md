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
- ✅ Shareable collaboration invite links

---

## 🤝 Collaboration Invite Flow

Users can invite others to collaborate on playlists via shareable invite links.

### How It Works

1. **Generate Invite Link**: Playlist owner clicks "Invite collaborators" button on playlist page
2. **Share Link**: Owner shares the invite link with potential collaborators
3. **Accept Invite**: When someone visits the link:
   - If logged in: See invite modal on home page with Accept/Reject options
   - If not logged in: Redirected to login/register, then see modal after authentication
   - If already collaborator: See confirmation modal with "Go to Playlist" button
   - If link expired: See error page with explanation

### Invite Link Format

```
http://yourdomain.com/invite/{token}
```

Invite links expire after 24 hours for security.

### User Flow Examples

**New Collaborator (Logged In):**
1. Visit `/invite/{token}`
2. Redirects to `/?invite={token}`
3. Modal opens with playlist name and collaboration benefits
4. Click "Accept" → Redirected to playlist page as collaborator
5. Click "Reject" → Modal closes, stays on home page

**New Collaborator (Not Logged In):**
1. Visit `/invite/{token}`
2. Redirects to `/login?redirect=/invite/{token}`
3. Log in or register
4. Redirects back to `/invite/{token}`
5. Flow continues as logged-in user

**Already Collaborator:**
1. Visit `/invite/{token}`
2. Modal shows "You're already a collaborator" message
3. Single "Go to Playlist" button
4. Redirects to playlist page

### Frontend Components

- **InvitePage** (`src/pages/InvitePage.tsx`) - Entry point for invite links
- **InviteModal** (`src/components/modals/InviteModal.tsx`) - Accept/reject modal
- **InviteErrorPage** (`src/pages/InviteErrorPage.tsx`) - Error page for invalid/expired links
- **HomePage** - Auto-detects invite URL params and opens modal

### Backend API Endpoints

- **POST** `/collab/{playlist_id}/invite/` - Generate invite token
  - Request: `{"playlist_id": number}`
  - Response: `{"token": "uuid", "expires_at": "timestamp"}`

- **GET** `/collab/join/{token}/` - Validate invite token
  - Response: `{"playlist_id": number, "playlist_name": string, "inviter_name": string, "collaborators": array, "is_collaborative": boolean, "owner_id": number, "valid": boolean}`

- **POST** `/collab/join/{token}/` - Accept invite and join playlist
  - Response: `Collaborator object` or `{"already_member": true}`

### State Management

The invite flow uses URL parameters for state management:
- `?invite={token}` - Indicates pending invite
- `&status=already_collaborator` - Indicates user is already a collaborator

This approach:
- ✅ Survives page refreshes
- ✅ Survives authentication flow
- ✅ No cleanup needed (params cleared when modal closes)
- ✅ Easy to test manually

### Security Considerations

- Invite tokens expire after 24 hours
- Tokens are single-use (can be reused but only for same playlist)
- Authentication required for all actions
- Backend validates tokens before allowing access

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
