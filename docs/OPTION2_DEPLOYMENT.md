# Option 2: Render Backend + Vercel Frontend

## ✅ Pre-Deployment Checklist

### Backend (Render)
- [ ] Push all code to GitHub main branch
- [ ] `render.yaml` is committed (already exists)
- [ ] Render account created and linked to GitHub repo
- [ ] Database plan set to **PostgreSQL** (free tier or paid)
- [ ] Environment variables configured in Render dashboard
- [ ] Health check endpoint `/api/health` verified locally

### Frontend (Vercel)  
- [ ] Vercel project created and linked to GitHub repo
- [ ] `VITE_API_BASE_URL` env var set to backend service URL
- [ ] Build command: `npm run build`
- [ ] Output directory: `dist`
- [ ] Auto-deploy on git push enabled

### Database Migration
- [ ] First Render deploy auto-creates PostgreSQL
- [ ] No manual SQL migration needed (Sequelize auto-syncs schema)
- [ ] Verify health endpoint returns `{ status: 'healthy', database: 'PostgreSQL' }`

---

## 🚀 Step-by-Step Deployment

### 1. Create Render Backend Service

**Option A: Use Blueprint (Recommended)**
```bash
# Navigate to https://render.com/deploy?repo=YOUR_GITHUB_REPO_URL
# Render will parse render.yaml and create both service + database
```

**Option B: Manual Creation**
1. Go to [render.com/dashboard](https://render.com/dashboard)
2. Click **New → Web Service**
3. Connect GitHub repo (`cmmanikandan/h-hub`)
4. Configure:
   - **Name**: `h-hub-api` 
   - **Environment**: `Node`
   - **Build Command**: `cd server && npm ci`
   - **Start Command**: `cd server && npm start`
   - **Plan**: Free or Starter
5. Add environment variables (see **Step 2** below)
6. Create database (PostgreSQL, free tier)

### 2. Set Render Environment Variables

In Render dashboard → Service Settings → Environment:

```
NODE_ENV=production
DB_DIALECT=postgres
PORT=10000
DATABASE_URL=(auto-filled by Render from database)
ALLOWED_ORIGINS=https://YOUR_VERCEL_DOMAIN.vercel.app
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

**Note**: `DATABASE_URL` is automatically injected by Render when you create the linked database.

### 3. Deploy & Test Backend

1. Render auto-deploys on git push
2. Wait ~3-5 minutes for build + database setup
3. Once deployed, test the health endpoint:

```bash
curl https://h-hub-api.onrender.com/api/health
```

**Expected response**:
```json
{
  "status": "healthy",
  "database": "PostgreSQL",
  "tables": { "users": 0, "products": 0, "orders": 0 },
  "timestamp": "2025-05-05T..."
}
```

### 4. Create Vercel Frontend Project

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click **Add New → Project**
3. Select GitHub repo (`cmmanikandan/h-hub`)
4. Root directory: `.` (repo root)
5. Framework: **Vite**
6. Build command: `npm run build`
7. Output directory: `dist`

### 5. Set Vercel Environment Variables

In Vercel project → Settings → Environment Variables:

```
VITE_API_BASE_URL=https://h-hub-api.onrender.com/api
```

**Example**: If Render service is `h-hub-api.onrender.com`, use:
```
VITE_API_BASE_URL=https://h-hub-api.onrender.com/api
```

### 6. Deploy Frontend

Option A: **Auto-deploy** (push to main)
```bash
git push origin main
```

Option B: **Manual redeploy** (after env var change)
- Vercel dashboard → h-hub project → Deployments → Redeploy

Wait ~2-3 minutes. Once deployed:
```
https://h-hub-xivercel.app
```

---

## 🔗 Data Flow

```
┌─────────────────────────────────────────┐
│  Browser / Frontend (Vercel)            │
│  https://h-hub-xi.vercel.app           │
│  (VITE_API_BASE_URL = /api base URL)   │
└──────────────┬──────────────────────────┘
               │ CORS enabled
               ↓
┌─────────────────────────────────────────┐
│  Backend API (Render)                   │
│  https://h-hub-api.onrender.com         │
│  - /api/health                          │
│  - /api/auth/login                      │
│  - /api/products                        │
│  - /api/orders                          │
│  - etc.                                 │
└──────────────┬──────────────────────────┘
               │ Sequelize ORM
               ↓
┌─────────────────────────────────────────┐
│  PostgreSQL Database (Render)           │
│  h-hub-db                               │
│  (free tier or paid)                    │
└─────────────────────────────────────────┘
```

---

## 🔐 CORS Configuration

Backend (`server/index.js`) checks `ALLOWED_ORIGINS` env var:

```javascript
const corsOrigins = (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map(origin => origin.trim())
    .filter(Boolean);
```

**Vercel domain**: Update `ALLOWED_ORIGINS` in Render:
```
ALLOWED_ORIGINS=https://h-hub-xi.vercel.app
```

If you have multiple frontend domains (preview deploys, etc.):
```
ALLOWED_ORIGINS=https://h-hub-xi.vercel.app,https://h-hub-staging-*.vercel.app
```

---

## 🧪 Smoke Tests

### Backend Health
```bash
curl -X GET https://h-hub-api.onrender.com/api/health
```

### Frontend Load
```bash
# Visit in browser
https://h-hub-xi.vercel.app

# Check console for API calls
# Network tab: verify requests go to https://h-hub-api.onrender.com/api/*
```

### Database Connection
1. Login to app
2. Verify user is stored in PostgreSQL
3. Check Render dashboard → Data → Database → Table inspection

---

## 📊 Monitoring & Logs

### Render Backend Logs
- **Dashboard**: https://dashboard.render.com → Services → h-hub-api → Logs
- **Real-time**: Scroll to see request/error logs
- **Failures**: Check health endpoint if service won't start

### Vercel Frontend Logs
- **Dashboard**: https://vercel.com/dashboard/h-hub → Deployments
- **Build logs**: Click deployment → click "Logs"
- **Runtime errors**: Browser console (F12 → Console tab)

### Database
- **Render Dashboard**: Services → h-hub-db → Info
- **Connection string**: Copy for external tools (pgAdmin, DBeaver)
- **Query inspection**: None (read-only on free plan), use Render CLI for advanced debugging

---

## 🔄 Updating Code

### Push Updates to Production

1. **Make code changes locally**
   ```bash
   git add .
   git commit -m "Fix: update feature"
   git push origin main
   ```

2. **Render auto-deploys backend**
   - Watches main branch
   - Builds `server/` folder
   - Deploys in ~2-3 minutes
   - Check logs in Render dashboard

3. **Vercel auto-deploys frontend**
   - Watches main branch
   - Builds with `npm run build`
   - Deploys in ~1-2 minutes
   - Check logs in Vercel dashboard

### To Pause/Restart
- **Render**: Dashboard → Service → Suspend/Resume
- **Vercel**: Dashboard → Settings → Pause/Redeploy

---

## ⚡ Performance Tips

1. **Use Vercel Analytics** to monitor frontend performance
2. **Use Render APM** (paid) to trace backend requests
3. **Enable Gzip** on backend (Express auto-enables)
4. **Cache static assets** on Vercel (CDN) — automatic
5. **Database indexes**: Already created by Sequelize migrations
6. **Cloudinary uploads**: Better than local file storage for scaling

---

## 🐛 Troubleshooting

### CORS Error: "Access-Control-Allow-Origin"
- Check Vercel domain matches `ALLOWED_ORIGINS` in Render
- Render dashboard → Environment → Verify `ALLOWED_ORIGINS`
- Redeploy Render service after change

### Health Check Fails
- Check database connection string in Render
- Verify PostgreSQL is running: Render → Services → h-hub-db → Status
- Check backend logs for SQL errors

### Frontend Shows 404 or Blank Page
- Verify build succeeded: Vercel → Deployments → Build log
- Check `VITE_API_BASE_URL` is set correctly
- Verify frontend can reach backend: Browser DevTools → Network tab

### Slow Uploads / Timeouts
- Move uploads to Cloudinary (already configured)
- Render free tier has 0.5 GB storage (uploads won't persist anyway)
- Set `FILE_SIZE_LIMIT` in backend if needed

---

## 💾 Backup & Recovery

### Database Backups
- Render free tier: No automatic backups
- Render paid tier: Daily automatic backups
- **Manual backup**: Use `pg_dump` with connection string
  ```bash
  pg_dump "postgresql://..." > backup.sql
  ```

### Code Backups
- GitHub is your backup (main branch is production)
- Tag releases: `git tag v1.0.0 && git push origin v1.0.0`

---

## 🎉 You're Live!

- **Frontend**: https://h-hub-xi.vercel.app
- **API**: https://h-hub-api.onrender.com
- **Logs**: Render dashboard + Vercel dashboard
- **Database**: Connected via Render service

Next steps:
- [ ] Update DNS if using custom domain
- [ ] Set up error tracking (Sentry, Rollbar)
- [ ] Configure analytics
- [ ] Monitor performance
