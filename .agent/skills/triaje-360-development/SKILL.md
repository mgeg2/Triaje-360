---
name: triaje-360-development
description: Day-to-day development workflow and frontend architecture for Triaje-360. Use when working on Angular components, modifying routes, understanding the auth flow, editing the Marzipano 360 viewer, or navigating the frontend module structure.
---

# Triaje-360 Development Workflow

## Frontend Structure

```
Frontend/src/app/
├── core/                     # Singleton services and auth
│   ├── auth/                 # AuthService, AuthGuard, NoAuthGuard, authInterceptor
│   ├── user/                 # UserService, User interface
│   ├── asignaturas/          # AsignaturasService
│   ├── ejercicios/           # EjerciciosService
│   ├── pacientes/            # PacientesService
│   ├── image-manager/        # ImageUploadService
│   ├── audio-manager/        # AudioService, AudioUploadService
│   ├── icons/                # IconsService (Material, Heroicons, Feather)
│   ├── navigation/           # NavigationService
│   └── transloco/            # i18n loader (unused effectively)
├── modules/                  # Feature pages (lazy-loaded routes)
│   ├── admin/example/        # Dashboard
│   ├── auth/                 # sign-in, sign-up, sign-out, forgot-password, etc.
│   ├── asignaturas/          # Subject management
│   ├── ejercicios/           # Exercise builder (prof) / player launcher (alu)
│   ├── pacientes/            # Patient CRUD
│   ├── marzipano360/         # 360-degree triage simulation
│   ├── image-manager/        # Image upload/management
│   ├── audio-manager/        # Audio upload/management
│   ├── resultados/           # Student results viewer
│   └── landing/home/         # Public landing page
├── layout/                   # Layout system (classic, classy, etc.)
├── mock-api/                 # Fuse mock APIs (auth, navigation, dashboards)
└── app.routes.ts             # All route definitions
```

## Routing

All routes defined in `app.routes.ts`. Two guard types:

- **AuthGuard**: Checks JWT validity, redirects to `/sign-in` if invalid
- **NoAuthGuard**: Prevents authenticated users from accessing guest pages

| Route | Guard | Layout | Resolver |
|-------|-------|--------|----------|
| `/sign-in`, `/sign-up`, `/forgot-password`, `/reset-password` | NoAuthGuard | empty | -- |
| `/sign-out`, `/unlock-session` | AuthGuard | empty | -- |
| `/home` | None | empty | -- |
| `/example`, `/asignaturas`, `/ejercicios`, `/pacientes`, `/marzipano360/:id`, `/image-manager`, `/audio-manager`, `/resultados` | AuthGuard | default | initialDataResolver |

`initialDataResolver` pre-fetches navigation, messages, notifications, quick-chat, and shortcuts from mock-api.

**No role-based guards exist** -- all authenticated users can access all routes. Authorization is only enforced server-side.

## Auth Flow

1. `AuthService.signIn(credentials)` -> POST `/api/users/login`
2. Response: `{ token, user: { id, email, nickname, role } }`
3. Token saved: `localStorage.setItem('accessToken', token)`
4. User saved: `localStorage.setItem('user', JSON.stringify(user))`
5. `authInterceptor` attaches raw token (no "Bearer " prefix) to `Authorization` header

**Token storage gotcha:** `AuthService` uses key `'accessToken'`, but `ImageUploadService` and `AudioUploadService` manually read from `'token'` -- a different key. This means image/audio uploads will fail auth. When fixing, use `'accessToken'` consistently.

## Role-Based Navigation

Navigation menus are defined in `mock-api/common/navigation/data.ts` with separate arrays:

- **admin**: Example, Asignaturas, Pacientes, Gestor de Imagenes, Gestor de Audios
- **prof**: Example, Ejercicios, Pacientes
- **alu**: Example, Ejercicios

The active navigation is selected based on `req.role` (from sessionStorage) inside `NavigationMockApi`.

## Key Components

### EjerciciosComponent (`/ejercicios`)

Largest component (~1137 lines). Dual-mode:
- **Professor**: 5-step MatStepper wizard (datos generales -> escenario -> sonidos -> pacientes -> ubicar pacientes)
- **Student**: Card grid with play button -> navigates to `/marzipano360/{id}`

### Marzipano360Component (`/marzipano360/:id`)

Core simulation. Key internals:
- `Marzipano.Viewer` with `CubeGeometry` and `RectilinearView`
- 6 cube face tiles from `assets/escenarios/Tiles/{name}/{face}.png` (b, d, f, l, r, u)
- Hardcoded **4x16 yaw/pitch grid** mapping `(fila, columna)` -> panorama coordinates
- Patient hotspots: circular `<img>` elements attached as Marzipano hotspots
- Deterioration check runs every 5 seconds via `setInterval`
- Sound playback: all exercise sounds play simultaneously in infinite loops
- On finish: saves time + actions to backend, navigates to `/ejercicios`

### ResultadosComponent (`/resultados`)

Student-only. Lists attempts with expandable details. Uses `EjerciciosService.obtenerResultadosUsuario()`.

### ImageManagerComponent (`/image-manager`)

Two types: `paciente` (direct upload) and `escenario` (equirectangular -> cubemap conversion via `equirect-cubemap-faces-js` at 512px per face).

## Services Map

| Service | Config Source | Backend Endpoints |
|---------|-------------|-------------------|
| AuthService | `environment.apiUrl` + `environment.usr.login` | POST `/api/users/login` |
| UserService | `environment.apiUrl` + `environment.usr.all` | GET `/api/users` |
| AsignaturasService | `environment.apiUrl` + `environment.asig.*` | `/api/asignatures/*` |
| EjerciciosService | `environment.apiUrl` + `environment.ejer.*` | `/api/ejercicios/*` |
| PacientesService | `environment.apiUrl` + `environment.pac.*` | `/api/pacientes/*` |
| ImageUploadService | `environment.apiUrl` (hardcoded paths) | `/api/imagenes/*` |
| AudioService | `environment.apiUrl` (hardcoded paths) | `/api/ejercicios/*/sonidos` |
| AudioUploadService | **Hardcoded** `http://localhost:3000/api` | `/api/audios/*` |

## Environment Config

File: `Frontend/src/enviroments/enviroments.ts` (note: typo in folder name, should be `environments`)

All endpoint paths are centralized here. When adding new API routes, add the path to the appropriate section (`usr`, `asig`, `ejer`, `pac`) and reference it in services as `environment.apiUrl + environment.{section}.{endpoint}`.

## Development Commands

```bash
# Frontend dev server (auto-reload)
cd Frontend && npm start       # ng serve on :4200

# Frontend production build
cd Frontend && npm run build   # output: dist/triaje-360/

# Backend dev server (nodemon auto-reload)
cd Backend && npm start        # :3000

# Run frontend tests
cd Frontend && npm test        # Karma
```

## Known Issues to Watch

1. **Token key mismatch**: `'accessToken'` vs `'token'` -- affects image/audio uploads
2. **Role name**: DB stores `'prof'` but some controllers check for `'profesor'`
3. **Mock-api dependency**: Navigation, messages, notifications come from mock-api; breaking mock-api breaks the resolver
4. **signInUsingToken()**: Points to mock endpoint, not real backend -- token refresh is non-functional
5. **ASSETS path**: Must match OS; Windows paths in defaults break Linux/Mac
6. **Debug logs**: `console.log('EL INTERCEPTOR METE BARER')` and others remain in production code
