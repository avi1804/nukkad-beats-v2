# 🎵 Nukkad Beats & Studio - Full Stack Application

This is the complete source code for the **Nukkad Beats & Studio** platform, featuring a Cafe ordering system, Studio booking system, and a comprehensive Admin Dashboard.

---

## 🛠️ Technology Stack

This project is a modern, decoupled Full-Stack application split into a separate Frontend and Backend.

### **Frontend (`/frontend-next`)**
- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **State Management / Data Fetching:** React Hooks, Axios
- **Deployment:** Vercel (Recommended) or Netlify

### **Backend (`/backend`)**
- **Runtime:** Node.js
- **Framework:** Express.js
- **Language:** TypeScript
- **Database ORM:** Prisma
- **Database:** MySQL (Can be easily swapped to PostgreSQL/Supabase)
- **Authentication:** JWT (JSON Web Tokens)
- **Media Storage:** Cloudinary (for image uploads)
- **Deployment:** Render, Railway, or Heroku (Recommended)

---

## 🚀 Deployment Guide

Because this is a decoupled application, you will need to deploy the **Database**, **Backend**, and **Frontend** separately.

### Step 1: Database Setup
You need a hosted database.
1. Create a free MySQL or PostgreSQL database using [Supabase](https://supabase.com/), [Aiven](https://aiven.io/), or [Render](https://render.com/).
2. Copy your connection string (it will look like `mysql://user:pass@host:port/db` or `postgresql://...`).

### Step 2: Backend Deployment (Render / Railway)
1. Push your code to GitHub.
2. Go to [Render.com](https://render.com/) or [Railway.app](https://railway.app/) and create a new **Web Service**.
3. Connect your GitHub repository.
4. Set the Root Directory to `backend` (if supported) OR configure the build commands:
   - **Build Command:** `npm install && npx prisma generate && npm run build`
   - **Start Command:** `npm start`
5. **Add Environment Variables:**
   ```env
   PORT=5000
   DATABASE_URL=your_cloud_database_url
   JWT_SECRET=create_a_random_secure_long_string
   JWT_EXPIRES_IN=30d
   CORS_ORIGIN=https://your-frontend-domain.vercel.app
   
   # Cloudinary (Required for Admin Image Uploads)
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```
6. Deploy the backend. Once it is live, copy the backend URL (e.g., `https://nukkad-backend.onrender.com`).

### Step 3: Database Migration
Once your cloud database is connected to your local code, you need to push your Prisma schema to it:
1. In your local terminal (inside `backend`), update your `.env` `DATABASE_URL` to the new cloud URL.
2. Run `npx prisma db push` to create the tables.
3. Run `npx prisma db seed` to create your initial Admin account.

### Step 4: Frontend Deployment (Vercel)
1. Go to [Vercel.com](https://vercel.com/) and create a new project.
2. Connect your GitHub repository.
3. Set the **Root Directory** to `frontend-next`.
4. Vercel will automatically detect that it is a Next.js project.
5. **Add Environment Variables:**
   ```env
   NEXT_PUBLIC_API_URL=https://your-backend-domain.onrender.com/api
   ```
   *(Make sure to replace this with the actual URL of your deployed backend).*
6. Click **Deploy**.

---

## 💻 Local Development

If you want to run the project locally on your machine:

**1. Start the Backend:**
```bash
cd backend
npm install
npm run dev
```

**2. Start the Frontend:**
```bash
cd frontend-next
npm install
npm run dev
```

The frontend will run on `http://localhost:3000` and the backend will run on `http://localhost:5000`.
