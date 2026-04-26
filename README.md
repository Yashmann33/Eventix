# 🎪 Eventix — Event Management Application

A full-stack event management web application built with Node.js, Express, MongoDB, and vanilla JavaScript.

---

## 📁 Folder Structure

```
event-app/
├── backend/
│   ├── server.js
│   ├── package.json
│   ├── .env.example
│   ├── models/
│   │   ├── User.js
│   │   └── Event.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── userController.js
│   │   └── eventController.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   └── eventRoutes.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   └── uploadMiddleware.js
│   └── uploads/         ← (auto-created, stores event images)
│
└── frontend/
    ├── index.html        ← Browse all events
    ├── login.html        ← Login page
    ├── register.html     ← Register page
    ├── dashboard.html    ← Role-based dashboard
    ├── create-event.html ← Create event form
    ├── css/
    │   └── style.css
    └── js/
        └── utils.js
```

---

## ⚙️ Prerequisites

- **Node.js** v16 or higher → https://nodejs.org
- **MongoDB** running locally (or MongoDB Atlas URI)
  - Local: `mongodb://localhost:27017`
  - Atlas: Get URI from https://cloud.mongodb.com

---

## 🚀 Setup & Run

### Step 1: Navigate to backend folder
```bash
cd event-app/backend
```

### Step 2: Install dependencies
```bash
npm install
```

### Step 3: Set up environment variables
```bash
cp .env.example .env
```

Edit `.env` with your values:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/eventmanagement
JWT_SECRET=your_super_secret_key_here
```

### Step 4: Start the server
```bash
# Production
npm start

# Development (auto-restart on changes)
npm run dev
```

### Step 5: Open in browser
Visit: **http://localhost:5000**

---

## 👤 User Roles

| Role | Description |
|------|-------------|
| **User (Attendee)** | Browse, search, and filter events |
| **Proposer (Organizer)** | Create, edit, and delete own events (requires admin verification) |
| **Admin** | Verify proposers, manage all events and users |

---

## 🔐 Creating an Admin Account

There is no admin registration through the UI (for security). To create an admin:

**Option 1: MongoDB Compass / shell**
```js
// In MongoDB shell or Compass
db.users.updateOne({ email: "admin@example.com" }, { $set: { role: "admin", isVerified: true } })
```

**Option 2: Register normally, then update via Mongo shell**
1. Register with any email on `/register.html`
2. Open MongoDB and update the role:
```bash
mongosh eventmanagement
db.users.updateOne({ email: "youremail@example.com" }, { $set: { role: "admin", isVerified: true } })
```

---

## 🌐 API Reference

### Auth
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| POST | `/api/register` | Public | Register a new user |
| POST | `/api/login` | Public | Login and get JWT |

### Users (Admin only)
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| GET | `/api/users/pending` | Admin | Get unverified proposers |
| POST | `/api/users/verify/:id` | Admin | Verify a proposer |
| GET | `/api/users/all` | Admin | Get all users |

### Events
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| GET | `/api/events` | Public | Get all events (with filters) |
| GET | `/api/events/search` | Public | Search events by keyword |
| GET | `/api/events/my` | Proposer | Get proposer's own events |
| POST | `/api/events` | Verified Proposer | Create a new event |
| PUT | `/api/events/:id` | Proposer (owner) / Admin | Update event |
| DELETE | `/api/events/:id` | Proposer (owner) / Admin | Delete event |

---

## 🎯 Feature Walkthrough

### For Attendees (Users)
1. Register at `/register.html` as **Attendee**
2. Browse events at the home page
3. Use search bar and filters (category, theme, location)

### For Organizers (Proposers)
1. Register at `/register.html` as **Organizer**
2. Note your **Unique Organizer ID** shown after registration
3. Share ID with admin for verification
4. Once verified, go to `/create-event.html` to create events
5. Edit or delete events from `/dashboard.html`

### For Admins
1. Create account and update role to `admin` via MongoDB
2. Go to `/dashboard.html`
3. View pending proposers and click **Verify** to approve them
4. Manage all events and users

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML5, CSS3, Vanilla JavaScript |
| Backend | Node.js + Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT (jsonwebtoken) |
| Passwords | bcryptjs |
| File Upload | Multer |
| Fonts | Google Fonts (Playfair Display + DM Sans) |

---

## 📝 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `MONGO_URI` | MongoDB connection string | `mongodb://localhost:27017/eventmanagement` |
| `JWT_SECRET` | Secret key for JWT signing | `mysecretkey123` |

---

## 🐛 Troubleshooting

**MongoDB connection error?**
- Make sure MongoDB is running: `mongod` or start MongoDB service
- Check `MONGO_URI` in your `.env` file

**Port already in use?**
- Change `PORT` in `.env` to another value like `3000` or `8000`

**Images not showing?**
- Make sure the `backend/uploads/` folder exists (created automatically on first upload)
- Check that you're running from inside the `backend/` directory

**JWT errors?**
- Make sure `JWT_SECRET` is set in `.env` and matches across restarts
