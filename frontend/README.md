# ExamFlow frontend

React + Vite + Tailwind CSS client for the Online Examination and Assessment System.

## Stack

- React Router for role-based pages
- Axios with in-memory access tokens and cookie-based refresh
- TanStack Query for server state
- Recharts for dashboards
- React Hot Toast for feedback

Access tokens are never written to `localStorage` or `sessionStorage`.

## Run

1. Install Node.js 18 or newer.
2. From this folder run `npm install`.
3. Copy `.env.example` to `.env`.
4. Set `VITE_API_BASE_URL=http://localhost:5000` (the app appends `/api/v1`).
5. Run `npm run dev` and open http://localhost:5173.

The Express backend must be running with CORS allowing `http://localhost:5173` and `credentials: true`.
