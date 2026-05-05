# 🚀 Option 2: Quick Deploy Card

## 5 Steps to Go Live

### 1️⃣ Render Backend Setup
```
1. Go to https://dashboard.render.com
2. Click "New" → "Web Service"
3. Connect GitHub: cmmanikandan/h-hub
4. Auto-fill from render.yaml:
   - Name: h-hub-api
   - Build: cd server && npm ci
   - Start: cd server && npm start
5. Create linked PostgreSQL database
```

### 2️⃣ Add Render Environment Variables
```
NODE_ENV = production
DB_DIALECT = postgres
DATABASE_URL = (auto from database)
ALLOWED_ORIGINS = https://YOUR_VERCEL_DOMAIN.vercel.app
SMTP_USER = your-email@gmail.com
SMTP_PASS = your-app-password
CLOUDINARY_CLOUD_NAME = your_cloud_name
CLOUDINARY_API_KEY = your_api_key
CLOUDINARY_API_SECRET = your_api_secret
```

### 3️⃣ Verify Backend
```bash
# Wait 3-5 min for Render to build
# Then test:
curl https://h-hub-api.onrender.com/api/health

# Expected: {"status": "healthy", "database": "PostgreSQL", ...}
```

### 4️⃣ Vercel Frontend Setup
```
1. Go to https://vercel.com/dashboard
2. Add Project → select GitHub repo
3. Framework: Vite
4. Build cmd: npm run build
5. Output: dist
```

### 5️⃣ Add Vercel Env Var
```
VITE_API_BASE_URL = https://h-hub-api.onrender.com/api
```

### ✅ Deploy
- Push code: `git push origin main`
- Both auto-deploy in 2-3 minutes
- Done! 🎉

---

## 🔗 Access
- **Frontend**: https://h-hub-xi.vercel.app
- **API**: https://h-hub-api.onrender.com/api
- **Logs**: Render dashboard + Vercel dashboard

---

## 🐛 If Health Check Fails
1. Check Render logs: Dashboard → h-hub-api → Logs
2. Verify DATABASE_URL is set
3. Check PostgreSQL is running: Services → h-hub-db → Status
4. Redeploy: Dashboard → Manual Redeploy

---

## 📝 Your Service URLs
```
Replace these with your actual URLs:

Render Service URL:    https://[YOUR_SERVICE].onrender.com
Vercel Frontend URL:   https://[YOUR_PROJECT].vercel.app
```

---

## ⚡ Data Flow
```
Browser
   ↓
Frontend (Vercel)
   ↓ [VITE_API_BASE_URL = backend URL]
Backend API (Render)
   ↓ [DB_DIALECT = postgres]
PostgreSQL Database (Render)
```
