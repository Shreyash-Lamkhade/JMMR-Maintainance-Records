# jmmr-vehicle-maintenance

Minimal full-stack vehicle maintenance record app.

## Tech

- Next.js (App Router) + Tailwind
- Next.js API route handlers (`app/api/...`)
- Prisma ORM
- PostgreSQL (Neon)
- Deploy: Vercel

## Features (only these)

- Add record
- View all records
- Search by vehicle number
- Edit record **only once** (then `isEdited=true` and edits are disabled)
- Show amount
- **No delete**

## Local setup

1) Create a Neon database and copy its connection string.

2) Create `.env` in the project root:

```bash
DATABASE_URL="YOUR_NEON_POSTGRES_URL"
```

3) Install deps:

```bash
npm install
```

4) Create tables:

```bash
npx prisma db push
```

5) Run dev server:

```bash
npm run dev
```

Open `http://localhost:3000` (it redirects to `/dashboard`).

## API routes

- `POST /api/records` create
- `GET /api/records` list all
- `GET /api/records?vehicle=ABC` filter by vehicle number (contains, case-insensitive)
- `PUT /api/records/[id]` edit only if `isEdited=false` (sets `isEdited=true`)

## Deploy to Vercel

1) Push to GitHub and import into Vercel.
2) Add env var in Vercel:
   - `DATABASE_URL` = Neon connection string
3) Deploy.

Notes:
- `package.json` includes `postinstall: prisma generate`.
- `vercel-build` runs `prisma db push` for a minimal setup.
