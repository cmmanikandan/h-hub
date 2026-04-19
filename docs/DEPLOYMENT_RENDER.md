# Render Backend Deployment

Use this repo to deploy the backend on Render and keep the frontend on Vercel.

## Backend on Render

1. Create a new Render service from the `render.yaml` blueprint.
2. Let Render create the linked PostgreSQL database.
3. Confirm these env vars are set for the web service:
   - `NODE_ENV=production`
   - `DB_DIALECT=postgres`
   - `DATABASE_URL` from the Render database connection string
   - `ALLOWED_ORIGINS=https://h-hub-xi.vercel.app`
4. Deploy the service and verify `https://<your-service>.onrender.com/api/health` returns 200.

## Frontend on Vercel

Set the frontend env var in Vercel:

```env
VITE_API_BASE_URL=https://<your-service>.onrender.com/api
```

Then redeploy the Vercel app so the React client points at the Render backend.

## Notes

- The backend already reads `PORT`, so Render can inject its own port automatically.
- Upload URLs are built from the request host, so they work behind Render as long as the backend is reachable publicly.
- If you use a different frontend domain, update `ALLOWED_ORIGINS` accordingly.