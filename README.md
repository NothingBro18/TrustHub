# TrustHub

TrustHub is a MERN marketplace where customers can discover administrator-approved local providers, request bookings, message providers, and review completed work. Providers manage service listings and booking requests; administrators review provider accounts and moderate listings.

## Stack

- Frontend: React 19, Vite 8, Tailwind CSS
- Backend: Node.js, Express 4, Mongoose
- Database: MongoDB
- Authentication: JWT, with optional Google and GitHub OAuth
- Login sessions are stored per browser tab, so separate tabs can use separate accounts.

## Requirements

- Node.js 20.19+ or 22.12+
- MongoDB, local or hosted

## Local setup

In PowerShell, open two terminals from the project root.

Backend:

```powershell
Copy-Item server\.env.example server\.env
Set-Location server
npm install
npm run dev
```

Frontend:

```powershell
Copy-Item client\.env.example client\.env
Set-Location client
npm install
npm run dev
```

The frontend runs at `http://localhost:5173`; the API runs at `http://localhost:5000`. Check `http://localhost:5000/api/health` to confirm the API process is responding. The server must also connect to MongoDB before it starts.

## Configuration

Set `MONGO_URI` and a long random `JWT_SECRET` in `server\.env`. Google and GitHub sign-in are optional and require OAuth application credentials, the matching callback URLs below, and a `CLIENT_URL` that points to the frontend:

- `http://localhost:5000/api/auth/google/callback`
- `http://localhost:5000/api/auth/github/callback`

Password reset emails require SMTP configuration (`EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS`, and `EMAIL_FROM`). Without it, the password-reset request reports that email delivery is unavailable. The frontend API base URL can be changed with `VITE_API_URL` in `client\.env`.

The app sends each tab's JWT as a Bearer token and does not use a shared authentication cookie. OAuth redirects exchange a short-lived, single-use code into the current tab's session.

## Deployment notes

- Build the frontend with `npm --prefix client run build` and serve `client/dist` with SPA route fallback; start the API with `npm --prefix server start`.
- Deploy the API and frontend over HTTPS. Set `CLIENT_URL` to the exact frontend origin and set `VITE_API_URL` before building the frontend.
- Configure OAuth provider callback URLs to match the deployed API origin and the callback paths above.
- Use a production MongoDB URI, a strong unique `JWT_SECRET`, and real SMTP credentials. Do not commit `.env` files.
- The API stores uploaded images in `server/uploads`; use persistent storage and backups for this directory. The current implementation does not provide shared object storage for multiple API replicas.
- TrustHub has no payment gateway. Provider-reported offline receipts are not independently verified.

## Main workflows

- Customers: browse active services and administrator-approved providers, request appointments, manage bookings, message providers, save providers, and review completed bookings.
- Providers: manage service listings, respond to bookings, record completed work and directly collected payments, view earnings, and message customers.
- Administrators: review provider verification, moderate services, manage users, inspect reports, and manage flagged activities.

TrustHub does not process customer payments. Customers and providers agree on price and payment directly. Amounts shown as received and provider collections are provider-reported offline receipts; TrustHub does not independently verify them. Booking requests contain a preferred date and time, which the provider confirms.

## Validation

From the project root:

```powershell
npm --prefix server test
npm --prefix client run build
npm --prefix client run lint
```

The backend tests do not require a live MongoDB instance. Full end-to-end testing requires MongoDB and any external OAuth/SMTP services being tested. OAuth callbacks set an HTTP-only authentication cookie and return to the frontend callback route; in production, use HTTPS and configure `CLIENT_URL`, the OAuth callback URLs, and CORS consistently. Never commit real environment files or credentials.
