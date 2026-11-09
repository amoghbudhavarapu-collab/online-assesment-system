# ExamFlow frontend
React + Vite + Tailwind CSS frontend for the Online Examination System PRD.

## Run
1. Install Node.js 18 or newer.
2. Run `npm install`.
3. Copy `.env.example` to `.env` and set `VITE_API_URL` to your Express API (default `http://localhost:5000/api`).
4. Run `npm run dev` and open http://localhost:5173.

This ZIP contains frontend code only. It expects the Express backend and MongoDB Atlas setup described in the PRD. The frontend calls `/auth`, `/exams`, `/attempts`, `/results`, and `/users` endpoints. Backend authentication, role checks, exam timing, answer persistence, evaluation, and authorization must be enforced by the backend. Demo fallback data is only for UI preview and is not persistent.
