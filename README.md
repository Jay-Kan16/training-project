# SplitEase — MERN Expense Splitter

A Splitwise-style expense splitting app built with MongoDB, Express, React, and Node.
Code is split into small, single-responsibility files for easy maintenance.

## Folder structure

```
expense-splitter/
├── backend/
│   ├── config/db.js              # MongoDB connection
│   ├── models/                   # User, Group, Expense schemas
│   ├── middleware/                # auth (JWT), errorHandler, validate
│   ├── controllers/              # request handlers per resource
│   ├── routes/                   # Express routers per resource
│   ├── utils/
│   │   ├── splitCalculator.js    # equal / unequal / percentage split logic
│   │   └── settlementOptimizer.js# minimum-transaction settle-up algorithm
│   ├── tests/                    # Jest + Supertest tests
│   └── server.js                 # app entry point
├── frontend/                     # Vite + React (see "Frontend: Vite" below)
│   ├── index.html                 # Vite entry HTML (root-level, not in public/)
│   ├── vite.config.js             # dev server + /api proxy to the backend
│   └── src/
│       ├── main.jsx                # Vite entry point (equivalent of old index.js)
│       ├── api/axios.js          # single axios instance + auth header + 401 handling
│       ├── context/               # AuthContext, ExpenseContext (state mgmt)
│       ├── components/
│       │   ├── Navbar.jsx
│       │   ├── GroupList.jsx / GroupForm.jsx
│       │   ├── ExpenseList.jsx / ExpenseForm.jsx
│       │   ├── BalanceSummary.jsx
│       │   ├── Filters.jsx
│       │   └── Charts/ExpensePieChart.jsx, ExpenseBarChart.jsx
│       ├── pages/Login.jsx, Signup.jsx, DashboardPage.jsx
│       └── App.jsx                # routing + provider composition
└── postman/                       # Postman collection + environment (see below)
    ├── SplitEase.postman_collection.json
    └── SplitEase.postman_environment.json
```

## 1. CRUD Operations
- Users: signup/login (create), `GET/PUT/DELETE /api/users/:id`.
- Groups: full CRUD in `groupController.js` / `groupRoutes.js`.
- Expenses: full CRUD in `expenseController.js` / `expenseRoutes.js`.

## 2. Data modeling
- `User`: name, email, hashed password, role, running `balance`.
- `Expense`: amount, description, payer, participants, `shares` (per-user amount), splitType.
- `Group`: name, members, createdBy, expenses (ref array) — this is the "join" that makes a
  document database behave relationally: a group ties users and expenses together.

## 3. Auth & authorization
- JWT issued on signup/login (`authController.js`), verified by `middleware/auth.js`.
- `protect` middleware guards all group/expense/user routes.
- `authorize('admin')` restricts user listing/deletion to admins.
- Group/expense edit-delete is restricted to the creator or an admin.

## 4. Business logic — splitting & settlement
- `utils/splitCalculator.js`: equal / unequal / percentage splits, with rounding
  handled so shares always sum exactly to the total (last share absorbs remainder).
- `utils/settlementOptimizer.js`: greedy max-debtor/max-creditor matching —
  minimizes the number of payments needed to settle a group (max `n-1` transactions).
- Both are pure functions with dedicated Jest tests in `backend/tests/`.

## 5. Frontend state management
- `AuthContext`: current user, login/signup/logout, token persistence, silent
  session restore on load.
- `ExpenseContext`: groups, active group, expenses, balances, settlements —
  every component reads/writes through `useAuth()` / `useExpenses()` instead
  of prop drilling.

## 6. API integration
- `src/api/axios.js` centralizes the base URL, attaches the JWT to every
  request, and force-logs-out on a 401 response.

## 7. Error handling & validation
- Backend: `express-validator` on request bodies (`middleware/validate.js`)
  + a central `errorHandler.js` that normalizes Mongoose/cast/duplicate-key
  errors into consistent JSON responses.
- Frontend: inline form validation + server error messages surfaced in each form.

## 8. UI/UX
- Tailwind CSS throughout (see `tailwind.config.js`).
- Recharts pie chart (spend by payer) and bar chart (spend over time).
- `Filters.jsx` supports filtering the expense list by payer and date range.

## 9. Deployment
- **Backend** → Render/Heroku: set `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL` env vars
  (see `backend/.env.example`), deploy `backend/` as a Node web service, start
  command `npm start`.
- **Frontend** → Vercel/Netlify: set `REACT_APP_API_URL` to your deployed
  backend's `/api` URL, deploy `frontend/` with build command `npm run build`.
- **Database** → MongoDB Atlas free tier; whitelist your backend host's IP
  (or `0.0.0.0/0` for simplicity while testing).

## 10. Optional / next steps
- Notifications: hook a settlement-created event into an email provider
  (e.g. Nodemailer + SendGrid) or SMS (Twilio).
- Offline-first: cache `groups`/`expenses` in `localStorage` inside
  `ExpenseContext` and sync on reconnect.
- More tests: `backend/tests/` already covers split math, settlement math,
  and auth — extend with expense/group route tests and React Testing
  Library tests for the forms.

## Frontend: Vite

The frontend runs on Vite instead of Create React App:
- `index.html` lives at the project root (Vite's entry point) and loads `/src/main.jsx` as a module.
- Env vars use the `VITE_` prefix and are read via `import.meta.env.VITE_API_URL` (see `frontend/.env.example`), not `process.env.REACT_APP_*`.
- `vite.config.js` proxies `/api/*` to `http://localhost:5000` in dev, so you can call relative paths without hardcoding the backend URL if you prefer — `src/api/axios.js` still defaults to the full `VITE_API_URL` for clarity.
- Dev server runs on **http://localhost:5173** (Vite's default), not CRA's 3000.
- `npm run build` outputs to `dist/` (deploy this folder to Vercel/Netlify, not `build/`).

## Running locally

```bash
# Backend
cd backend
cp .env.example .env   # fill in MONGO_URI and JWT_SECRET
npm install
npm run dev             # http://localhost:5000

# Frontend (new terminal)
cd frontend
cp .env.example .env
npm install
npm run dev              # http://localhost:5173
```

## Running backend tests

```bash
cd backend
npm test
```

## Testing the API with Postman

Import both files from `postman/` into Postman:
- `SplitEase.postman_collection.json` — every route (Auth, Users, Groups, Expenses, health check), organized into folders.
- `SplitEase.postman_environment.json` — variables (`baseUrl`, `token`, `userId`, `groupId`, `expenseId`).

Select the **SplitEase - Local** environment, start the backend, then run:
1. **Auth → Signup** (or **Login**) — a test script automatically saves the returned `token` and `userId` into the environment, so every later request is authenticated without you copy-pasting anything.
2. **Groups → Create group** — saves `groupId` the same way.
3. **Expenses → Create expense** — saves `expenseId`.

After that, any request in the collection (balances, updates, deletes) just works, since they all reference `{{baseUrl}}`, `{{token}}`, `{{userId}}`, `{{groupId}}`, and `{{expenseId}}`. If you deploy the backend elsewhere, just change `baseUrl` in the environment.
