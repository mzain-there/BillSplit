# BillSplit — Frontend

Run the dev server:

```bash
cd frontend
npm install --legacy-peer-deps
npm run dev
```

Notes:
- Tailwind is loaded via CDN in `index.html`.
- Auth is a simple `AuthContext` storing a `token` in `localStorage`.
- Protected routes are implemented with `ProtectedRoute`.
