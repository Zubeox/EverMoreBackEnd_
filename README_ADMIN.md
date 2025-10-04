Admin server (local proxy) for privileged Supabase operations

This small server runs with the Supabase service role key and exposes protected admin endpoints.

How to run (local dev)

- Create a `.env` file or set environment variables in your shell:
  - VITE_SUPABASE_URL="https://<your-project>.supabase.co"
  - VITE_SUPABASE_SERVICE_ROLE_KEY="<your-service-role-key>"
  - ADMIN_TOKEN="a-secret-admin-token"  # choose a strong random token

- Install dependencies (in EverMoreBackEnd_):
  npm install express cors body-parser @supabase/supabase-js

- Start the server:
  node server/index.cjs

Endpoints
- GET /api/galleries  (public read proxy)
- POST /api/admin/galleries  (create)            - requires header: x-admin-token: <ADMIN_TOKEN>
- PATCH /api/admin/galleries/:id  (update)       - requires header: x-admin-token
- DELETE /api/admin/galleries/:id  (delete)      - requires header: x-admin-token

Notes
- Keep your service role key secret. Do not commit `.env` to git.
- Authenticate admin requests via a secure mechanism in production (session/JWT). This token approach is a minimal demo scaffolding.
