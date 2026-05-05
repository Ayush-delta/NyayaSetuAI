NyayaSetuAI Frontend — Auth & Run Notes

- Install dependencies in `frontend`:

```bash
cd frontend
npm install
# or
pnpm install
```

- Recommended packages (icons/animations):

```bash
npm install lucide-react framer-motion
```

- Start dev server:

```bash
npm run dev
```

- Notes:
  - Authentication token is stored in `localStorage` key `nyaya_token` and mirrored to a cookie for middleware route protection.
  - Protected routes: `/upload`, `/dashboard`, `/query`, `/admin`.
  - Backend base URL used: `http://localhost:8000`.
