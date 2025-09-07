<div align="center">

<!-- GitHub-friendly animated banner -->
<img src="https://capsule-render.vercel.app/api?type=waving&color=0:00C2FF,100:8B5CF6&height=180&section=header&text=Student%20Management%20System&fontColor=ffffff&fontSize=36&fontAlignY=35" alt="Banner" />

<img src="https://readme-typing-svg.demolab.com?font=Inter&weight=700&size=22&duration=2800&pause=900&multiline=true&center=true&vCenter=true&width=700&height=60&lines=MERN+%E2%80%A2+Admin+%E2%80%A2+Teacher+%E2%80%A2+Student+%E2%80%A2+Secure+%E2%80%A2+Responsive" alt="Typing" />

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


