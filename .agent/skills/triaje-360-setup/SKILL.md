---
name: triaje-360-setup
description: Set up Triaje-360 project for local development. Use when a developer needs to clone, configure, and run the project, or when troubleshooting startup issues with the database, backend, or frontend.
---

# Triaje-360 Local Setup

## Prerequisites

- Node.js 18+
- MySQL or MariaDB 10.4+
- npm

## Step 1: Database

```bash
# Create DB user matching Backend/config.js
mysql -u root -p -e "CREATE USER 'TFG'@'localhost' IDENTIFIED BY 'cereza2610'; GRANT ALL ON tfg.* TO 'TFG'@'localhost'; FLUSH PRIVILEGES;"

# Import schema + seed data (creates the 'tfg' database)
mysql -u root -p < BBDD/tfg.sql
```

The dump creates 14 tables with seed data: 7 users, 2 subjects, 5 medical actions, 16 patients, 16 images, 4 sounds, 2 exercises.

## Step 2: Backend Configuration

Edit `Backend/config.js`:

1. **DB credentials** -- Update `bbdd.USER`, `bbdd.PASSWORD`, `bbdd.HOST` if your MySQL setup differs
2. **ASSETS path** -- Change `routes.ASSETS` from the Windows default to your local `Frontend/src/assets/` absolute path:
   ```js
   // Linux/Mac example:
   ASSETS: '/home/youruser/code/Triaje-360/Frontend/src/assets'
   ```
3. **JWT_SECRET** -- Change `config.JWT_SECRET` from the default placeholder

## Step 3: Frontend Configuration

Edit `Frontend/src/enviroments/enviroments.ts`:

1. **Assets path** -- Uncomment the relative path and comment out the Windows path:
   ```typescript
   assets: {
       // assets:'c:/xampp/htdocs/TFG/Frontend/src/assets',
       assets:'assets'
   }
   ```
2. **API URL** -- If the backend runs on a different port, update `apiUrl`

## Step 4: Launch

Order matters: DB must be running before Backend; Backend must be running before Frontend makes API calls.

```bash
# Terminal 1 - Backend
cd Backend
npm install
npm start          # nodemon on http://localhost:3000

# Terminal 2 - Frontend
cd Frontend
npm install
npm start          # ng serve on http://localhost:4200
```

Open http://localhost:4200. The admin user is auto-created on first backend start.

## Default Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@gmail.com | admin123 |

Other seed users have emails like `usu1@gmail.com`, `usu2@gmail.com`, etc.

## Common Issues

| Problem | Cause | Fix |
|---------|-------|-----|
| Images not loading | Windows ASSETS path | Set `routes.ASSETS` in config.js to your local absolute path |
| Image upload auth fails | Token key mismatch | `ImageUploadService` reads `localStorage('token')` but auth stores `'accessToken'` -- known bug |
| DB connection error | Wrong credentials | Verify `bbdd.*` in config.js matches your MySQL user/password |
| `ng serve` fails | Missing dependencies | Run `npm install` in Frontend/ |
| CORS errors | Backend not running | Start Backend before Frontend |
| Login says invalid | No admin user | Backend auto-seeds admin on first start via `iniUser0()` |

## Build for Production

```bash
cd Frontend
npm run build      # Output in dist/triaje-360/
```

There is no Docker or CI/CD configuration in this project.
