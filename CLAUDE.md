# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start Vite dev server (default port 5173)
npm run build     # TypeScript compile + Vite production build — run before every commit
npm run lint      # ESLint
npm run preview   # Preview production build locally
```

Always run `npm run build` before committing to catch type errors and broken imports.

## Architecture

React 18 + Vite 4 + TypeScript SPA. No SSR. Deployed to a static host; the Spring Boot backend is at `https://world-of-dc-election.onrender.com` by default.

### Route Structure

| Path | Component | Who uses it |
|------|-----------|-------------|
| `/citizen` | CitizenPage | Public citizens — submit complaints |
| `/elections/*` | Elections section | Election-specific views |
| `/officer-dashboard` | AppShell | Officers/admins — full dashboard |
| `/dashboard/*` | Layout | Nested: complaints, tasks, `/dashboard/squad-management` |
| `/` | Redirects or landing | — |

### Auth (`src/contexts/AuthContext.tsx`)

Two login paths stored in `localStorage`:
- `login()` — citizen login → `/citizen` route
- `officerLogin()` — officer/admin login → `/officer-dashboard`

The axios instance in `src/services/api.ts` reads `token` from `localStorage` and sends it as `Bearer`. On 401 it calls `logout()` automatically.

### Officer Dashboard Views (AppShell)

Five views toggled by `activeView` state:
- `CONSOLE` — complaints/tasks feed
- `TASK_BOARD` — task management
- `TRACKING` — real-time squad member map (Leaflet)
- `SQUAD_MGMT` — squad management (create squads, add/edit/remove members, set supervisors)
- `PROFILE` — user profile

Admin-only UI gates check: `user?.role === 'DISTRICT_COMMISSIONER' || user?.role === 'ADMIN'`

### Role System (`src/constants/enums.ts`)

`UserRole` enum with `ROLE_HIERARCHY` scores (ADMIN=10 down to OTHER=1).  
`ADMIN_ROLES = [ADMIN, DC, ADC]` — used for permission checks.  
`canAssignRole(actorRole, targetRole)` — returns true if actor outranks target.

### Tracking / Squad Domain (`src/services/trackingService.ts`)

- `normalizeMember(raw)` — maps backend `TrackingMember` to frontend `Member`. Backend returns `admin` boolean; frontend needs `isAdmin`. The normalizer handles both: `isAdmin: raw.admin ?? raw.isAdmin ?? false`.
- `buildFileUrl(path)` — constructs full image URLs using `config.fileBaseUrl` (same base URL as API).
- The tracking API at `/api/tracking/**` is **public** (no auth token required on the backend). The frontend sends the token anyway but it is not required.

### Key Types (`src/types/index.ts`)

`Member` has `isAdmin?: boolean` and `squadId?: string`.  
`CreateMemberInput` and `UpdateMemberInput` accept `admin?: boolean` which maps to the backend `TrackingMember.admin` field.

### Environment

`src/config/env.ts` reads `VITE_API_BASE_URL`. Create `.env.local` to override:
```
VITE_API_BASE_URL=http://localhost:8080
```

### Component Patterns

- Squad management UI lives in `src/components/tracking/SquadManagement.tsx` — large file with multiple modals (Create squad, Add member, Edit member). Supervisor toggle uses an amber-themed checkbox (`SupervisorToggle` component inside the file).
- `src/pages/SquadManagementPage.tsx` — the page wrapper that renders SquadManagement. Shows supervisor badge (amber `ShieldCheck` icon) next to member names.
- Lucide icons throughout (`lucide-react`). Forms use `react-hook-form` + `yup`. Maps use `leaflet` / `react-leaflet`.
