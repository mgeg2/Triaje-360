---
name: triaje-360-api
description: Backend API reference and architecture guide for Triaje-360. Use when modifying API endpoints, adding new routes, working with controllers or services, understanding the auth middleware, debugging backend issues, or working with the database schema.
---

# Triaje-360 Backend API & Architecture

## Architecture

3-layer pattern: **Routes** -> **Controllers** -> **Services** -> **MySQL**

```
Backend/
├── routes/           # Express route definitions, mount auth middleware
│   ├── IndexRoutes.js    # Main router, mounts all sub-routers
│   ├── UserRoutes.js
│   ├── AsignaturasRoutes.js
│   ├── EjerciciosRoutes.js
│   ├── PacientesRoutes.js
│   ├── ImageRoutes.js
│   └── AudioRoutes.js
├── controllers/      # Parse req, call JWT check, call service, send res
├── services/         # Business logic, SQL queries (parameterized)
├── middlewares/
│   └── validar-jwt.js    # JWT verification
├── config.js         # All config: ports, DB, secrets, paths, admin
├── db.js             # Single MySQL connection (mysql2)
└── index.js          # Express app, CORS, JSON, routes mount on /api
```

## Authentication Pattern

The JWT middleware is NOT used as standard Express middleware. Instead, controllers call it manually:

```javascript
const jwt = require('../middlewares/validar-jwt');

const someEndpoint = async (req, res) => {
    jwt.comprobartoken(req, res, function() {
        // Inside callback: req.id, req.email, req.role, req.nickname are set
        if (req.role !== 'admin') {
            return res.status(403).json({ message: 'Acceso denegado' });
        }
        // ... proceed with logic
    });
};
```

**Known bugs with this pattern:**
- Code placed AFTER `comprobartoken()` but OUTSIDE the callback runs regardless of auth (see `UserController.getUsersfromAsignature`)
- The middleware reads `req.headers['authorization']` raw -- does NOT strip "Bearer " prefix
- Returns 400 instead of 401 for auth failures

## Role Names

The database stores roles as: `admin`, `prof`, `alu`.

**Known inconsistency:** `AsignaturasController` checks for `'profesor'` but DB stores `'prof'` -- this causes role checks to silently fail for professors on asignatura endpoints.

## Adding a New Endpoint

1. Add the route in `routes/{Domain}Routes.js`
2. Create the handler in `controllers/{Domain}Controller.js`
3. Add business logic + SQL in `services/{Domain}Services.js`
4. For protected endpoints, wrap with `jwt.comprobartoken(req, res, callback)` and check `req.role`

## Complete Endpoint Reference

### `/api/users` -- UserRoutes

| Method | Path | Auth | Roles |
|--------|------|------|-------|
| POST | `/login` | No | Any |
| GET | `/` | Yes | admin |
| POST | `/` | Yes | admin |
| GET | `/alus` | Yes | admin, profesor |
| GET | `/profs` | Yes | admin, profesor |

### `/api/asignatures` -- AsignaturasRoutes

| Method | Path | Auth | Roles |
|--------|------|------|-------|
| GET | `/` | Yes | admin, profesor |
| POST | `/` | Yes | admin |
| GET | `/:id` | Yes | admin, profesor |
| PUT | `/:id` | Yes | admin |
| DELETE | `/:id` | Yes | admin |
| GET | `/user/:idprof` | Yes | admin, prof, alu |
| POST | `/:idAsig/:idUser` | Yes | admin |
| DELETE | `/:idAsig/:idUser` | Yes | admin |
| GET | `/users/:idAsig` | Yes | profesor, admin |
| GET | `/nousers/:idAsig` | Yes | profesor, admin |

### `/api/ejercicios` -- EjerciciosRoutes

| Method | Path | Auth | Roles |
|--------|------|------|-------|
| GET | `/` | Yes | admin, prof |
| POST | `/phase/:phaseId` | Yes | admin, prof |
| GET | `/:id` | Yes | admin, prof |
| PUT | `/:id` | Yes | admin, prof |
| DELETE | `/:id` | Yes | admin, prof |
| GET | `/asignaturas/:idAsig` | Yes | admin, prof, alu |
| GET | `/imagenes/:tipo` | Yes | admin, prof |
| POST | `/paciente` | Yes | prof |
| GET | `/:id/pacientes` | Yes | prof, alu |
| GET | `/:id/imagenes` | Yes | prof, alu |
| POST | `/:id/locatePaciente` | Yes | prof |
| DELETE | `/:id/paciente/:idPac` | Yes | prof |
| GET | `/:id/pacientesLocations` | Yes | prof, alu |
| POST | `/:id/tiempo` | Yes | alu |
| GET | `/resultados/usuario` | Yes | alu |
| GET | `/resultados/:intentoId` | Yes | alu |
| POST | `/resultados/:intentoId/acciones` | Yes | alu |
| POST | `/sonidos` | Yes | admin, prof |
| GET | `/:id/sonidos` | Yes | admin, prof, alu |
| DELETE | `/:id/sonido/:sonidoId` | Yes | admin, prof |

### `/api/pacientes` -- PacientesRoutes (NO AUTH)

| Method | Path | Auth |
|--------|------|------|
| GET | `/` | No |
| POST | `/` | No |
| PUT | `/:id` | No |
| DELETE | `/:id` | No |
| GET | `/accionesPaciente` | No |

### `/api/imagenes` -- ImageRoutes

| Method | Path | Auth | Roles |
|--------|------|------|-------|
| POST | `/upload` | Yes | admin, prof |
| POST | `/upload/cubemap` | Yes | admin, prof |
| DELETE | `/delete/:id` | Yes | admin, prof |
| GET | `/lista/:type` | No | -- |
| GET | `/bbdd/:type` | No | -- |
| GET | `/:type/:fileName` | No | -- |

### `/api/audios` -- AudioRoutes

| Method | Path | Auth | Roles |
|--------|------|------|-------|
| POST | `/upload` | Yes | admin, prof |
| DELETE | `/delete/:id` | Yes | admin, prof |
| GET | `/lista` | No | -- |
| GET | `/bbdd` | No | -- |
| GET | `/:fileName` | No | -- |

## File Uploads (Multer)

- Images: multer in-memory, types `paciente` and `escenario`, saved to `routes.ASSETS/{type}s/`
- Cubemap: equirectangular image + 6 tile PNGs (b, d, f, l, r, u) saved to `routes.ASSETS/escenarios/Tiles/{name}/`
- Audio: multer in-memory, 50MB max, saved to `Frontend/src/assets/sonidos/`

## Database Schema (Key Tables)

| Table | Purpose | Relationships |
|-------|---------|--------------|
| `users` | Accounts (admin/prof/alu) | -> user_asignatura, intentos_ejercicio |
| `asignatura` | Courses | -> user_asignatura, ejercicios |
| `ejercicios` | Exercise assignments | -> pacientes_ejercicio, imagenes_ejercicio, sonidos_ejercicio, intentos_ejercicio |
| `pacientes` | Patient templates | -> acciones_paciente (actions), imagenes (photo) |
| `pacientes_ejercicio` | Patient copies in exercises | -> acciones_paciente_ejercicio, ubicacion_pacientes_ejercicio, acciones_intento |
| `imagenes` | Uploaded images | -> pacientes.imagen, imagenes_ejercicio |
| `sonidos` | Uploaded sounds | -> sonidos_ejercicio |
| `acciones` | Medical actions (5 types) | -> acciones_paciente, acciones_paciente_ejercicio, acciones_intento |
| `intentos_ejercicio` | Student attempts | -> acciones_intento |
| `ubicacion_pacientes_ejercicio` | 4x16 grid positions | Composite PK (paciente, ejercicio) |

All SQL queries use parameterized placeholders (`?`) -- no SQL injection risk.

## Known Backend Issues

- Secrets hardcoded in `config.js` (JWT, DB password, admin credentials)
- Single DB connection (`db.js`) instead of connection pool
- `PacientesRoutes` has zero authentication
- `EjerciciosServices` uses `SET FOREIGN_KEY_CHECKS=0` instead of transactions
- ReferenceError bugs: `EjerciciosServices.js:168` (`err` vs `errAccion`), `ImageServices.js:146` (`error` vs `err`)
- Race condition in `PacientesServices.updatePacienteAcciones`
- No ownership check on student result endpoints
