# TrustHub

> **Find Trusted Service Providers Near You** — Safe. Verified. Reliable.

A fullstack MERN web application — A Secure Service Marketplace Platform.

## 🚀 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite + Tailwind CSS |
| Backend | Node.js + Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT + Google OAuth + GitHub OAuth |

## 📁 Project Structure

```
TrustHub/
├── client/     # Frontend (React + Vite + Tailwind CSS)
├── server/     # Backend (Node.js + Express + MongoDB)
└── docs/       # Documentation
```

## ⚡ Getting Started

### Prerequisites
- Node.js >= 18
- MongoDB (local or Atlas)

### Backend Setup

```bash
cd server
npm install
# Edit .env with your credentials
npm run dev
```

### Frontend Setup

```bash
cd client
npm install
npm run dev
```

## 🔑 Environment Variables

### Server `.env`
```
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/trusthub
JWT_SECRET=your_secret_key
CLIENT_URL=http://localhost:5173
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
```

### Client `.env`
```
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=TrustHub
```

## 👥 User Roles

| Role | Access |
|---|---|
| Customer | Browse providers, book services, manage bookings |
| Provider | Manage services, view bookings, track earnings |
| Admin | Full system access, verify providers, manage flagged activities |

## 📄 Pages

1. Home Page
2. Service Search Page
3. Provider Profile Page
4. Booking Flow (5-step)
5. Customer Dashboard
6. Provider Dashboard
7. Admin Dashboard
8. Login / Sign Up Page

## 👤 Author

**Sujal** — Built with ❤️ using the MERN Stack
