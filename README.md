<div align="center">

<!-- Animated SVG Banner (GitHub-safe) -->
<svg width="100%" height="160" viewBox="0 0 1200 160" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Student Management System">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#00C2FF">
        <animate attributeName="offset" values="0;1;0" dur="8s" repeatCount="indefinite" />
      </stop>
      <stop offset="100%" stop-color="#8B5CF6">
        <animate attributeName="offset" values="1;0;1" dur="8s" repeatCount="indefinite" />
      </stop>
    </linearGradient>
  </defs>
  <rect width="1200" height="160" fill="#0B1220" />
  <g opacity="0.15">
    <circle cx="100" cy="40" r="3" fill="#fff">
      <animate attributeName="cy" values="40;34;40" dur="5s" repeatCount="indefinite" />
    </circle>
    <circle cx="300" cy="80" r="2" fill="#fff">
      <animate attributeName="cy" values="80;76;80" dur="6s" repeatCount="indefinite" />
    </circle>
    <circle cx="900" cy="50" r="2.5" fill="#fff">
      <animate attributeName="cy" values="50;44;50" dur="5.5s" repeatCount="indefinite" />
    </circle>
  </g>
  <text x="50%" y="56%" text-anchor="middle" fill="url(#grad)" font-size="36" font-weight="700" font-family="Segoe UI, Inter, Roboto, Arial">
    Student Management System
  </text>
  <text x="50%" y="82%" text-anchor="middle" fill="#B6C2E0" font-size="16" font-weight="500" font-family="Segoe UI, Inter, Roboto, Arial">
    MERN • Admin • Teacher • Student • Secure • Responsive
  </text>
  <rect x="0" y="158" width="1200" height="2" fill="url(#grad)" />
  Sorry, your browser does not support inline SVG.
  </svg>

<br/>

<a href="#"> <img alt="license" src="https://img.shields.io/badge/License-Apache--2.0-8B5CF6?style=for-the-badge"> </a>
<a href="#"> <img alt="stack" src="https://img.shields.io/badge/Stack-MERN-00C2FF?style=for-the-badge"> </a>
<a href="#"> <img alt="build" src="https://img.shields.io/badge/CI-ready-0EA5E9?style=for-the-badge"> </a>

</div>

### About
An all‑in‑one, production‑ready Student Management System for schools and institutes, featuring role‑based portals for Admins, Teachers, and Students. Manage classes, subjects, schedules, grades, fees, and attendance with a clean and responsive UI.

### Monorepo Structure
```
backend/    Express API, MongoDB (Mongoose), Nodemailer, Multer
frontend/   React + Vite app, React Router, CSS Modules
```

### Key Features
- Admin: manage schools, classes, subjects, teachers, students
- Teacher: mark attendance, manage schedules, submit grades
- Student: view grades, schedules, attendance, fees
- Auth: login/register with role‑based protected routes
- Mail: configurable notifications (Nodemailer)
- Files: safe uploads (git‑ignored in repo)

### Tech Stack
- Backend: Node.js, Express, MongoDB (Mongoose)
- Frontend: React + Vite, React Router
- Utilities: Multer, Nodemailer

### Environment
Copy and edit the template then fill in your secrets.
```bash
cp .env.example .env
```
Required variables:
- `MONGO_URI`
- `CONTACT_EMAIL_SERVICE`, `CONTACT_EMAIL_USER`, `CONTACT_EMAIL_PASS`
- `SUPPORT_EMAIL`, `ADMIN_EMAIL`, `DEFAULT_TEACHER_EMAIL`

### Setup
```bash
# from repo root
npm i
cd backend && npm i && cd ../frontend && npm i && cd ..

# run both servers (concurrently)
npm start
```
Backend defaults to `mongodb://localhost:27017/project` if `MONGO_URI` is not set.

### Scripts
- Root: `npm start` – runs backend (nodemon) and frontend (vite) together
- Backend: `npm start`
- Frontend: `npm run dev`

### API Overview (selected)
- `POST /auth/register` – register school/admin
- `POST /auth/login` – login by role
- `GET /student/:id` – get student profile
- `POST /attendance/mark` – mark attendance
- `GET /grades/:studentId` – fetch grades

### Security & Privacy
- No secrets in code. Use `.env` only (git‑ignored)
- `backend/uploads/` is ignored; a `.gitkeep` placeholder is committed
- Safe defaults and descriptive errors server‑side

### Visual Preview
Add screenshots or gifs to this section to showcase UI flows.

### Contributing
PRs welcome! Please open an issue to discuss major changes first.

### License
Apache-2.0. See `LICENSE`. Copyright © 2025 VKS.


