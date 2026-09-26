# PulseTrack Deployment Guide 🚀

This document covers all options for deploying the PulseTrack backend API and distributing the mobile application.

---

## 1. Quick Start: Docker Compose (Self-Hosted / VPS)

The easiest way to run the production backend with automatic persistent storage:

```bash
# Build and run container in detached mode
docker compose up -d --build

# View logs
docker compose logs -f

# Check health
curl http://localhost:5000/health
```

The database file is persisted under the named Docker volume `api_data` (mounted at `/app/data`).

---

## 2. Cloud Deployment Options

### Option A: Render.com (Recommended Free/Low Cost)
1. Fork or push your repository to GitHub.
2. In the Render Dashboard, click **New > Blueprint**.
3. Select your repository. Render automatically reads [`render.yaml`](./render.yaml).
4. Render provisions:
   - Web service running Node.js 20
   - Healthcheck on `/health`
   - Persistent disk for data storage
5. Copy your Render URL (e.g., `https://pulsetrack-api.onrender.com`).

### Option B: Fly.io
1. Install Fly CLI: `curl -L https://fly.io/install.sh | sh`
2. Run in project root:
   ```bash
   fly launch --config fly.toml
   fly volumes create pulsetrack_data --size 1
   fly deploy
   ```

### Option C: Railway
1. Go to [railway.app](https://railway.app) and create a new project from your GitHub repo.
2. Set root directory to `backend`.
3. Set start command to `npm run start` and build command to `npm run build`.
4. Add environment variables:
   - `NODE_ENV=production`
   - `PORT=5000`
   - `JWT_SECRET=your-secure-random-secret`

---

## 3. Connecting the Mobile App to Deployed Backend

In your mobile app root, create or update `.env`:

```env
EXPO_PUBLIC_API_URL=https://your-deployed-backend.com/api
```

Expo automatically reads `EXPO_PUBLIC_*` environment variables and injects them into the bundle.

---

## 4. Mobile App Distribution (Expo EAS)

To build production APKs/AABs for Android or IPAs for iOS:

```bash
# 1. Install EAS CLI
npm install -g eas-cli

# 2. Login to Expo
eas login

# 3. Configure EAS Build
eas build:configure

# 4. Build Android APK for testing
eas build -p android --profile preview

# 5. Build for Play Store / App Store
eas build -p android --profile production
eas build -p ios --profile production
```

---

## 5. API Endpoints Overview

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Healthcheck (status, memory, uptime) |
| `GET` | `/api/workouts` | List workouts (supports `?type=` and `?date=`) |
| `POST` | `/api/workouts` | Log a new workout (awards gamified XP) |
| `PUT` | `/api/workouts/:id` | Update an existing workout |
| `DELETE` | `/api/workouts/:id` | Remove a workout |
| `GET` | `/api/stats/today` | Fetch today's steps, calories, active mins |
| `POST` | `/api/stats/today` | Update today's live stats |
| `GET` | `/api/stats/summary` | Aggregate analytics (totals, distribution, streak) |
| `GET` | `/api/nutrition` | List logged meals and calculate daily macros |
| `POST` | `/api/nutrition` | Log a meal (breakfast, lunch, dinner, snack) |
| `GET` | `/api/sleep` | List sleep logs and sleep quality trends |
| `POST` | `/api/sleep` | Log bedtime, wake time, and quality rating |
| `GET` | `/api/goals` | List personal fitness goals & milestone targets |
| `POST` | `/api/goals` | Create a new target goal |
| `POST` | `/api/sync` | Batch synchronization endpoint for offline-first sync |
| `POST` | `/api/auth/demo` | Instant demo login token |
| `POST` | `/api/auth/register` | Register new user account |
| `POST` | `/api/auth/login` | Authenticate with email and password |
