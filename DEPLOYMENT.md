# 🚀 Deployment Guide: International Draughts

This guide will walk you through deploying your International Draughts application to the web.

---

## 📋 Prerequisites

Before you start, you'll need:

1. **GitHub Account** (free) - [github.com](https://github.com)
2. **Railway Account** (free tier) - [railway.app](https://railway.app)
3. **Git installed** on your computer

---

## 🎯 Quick Start: Railway Deployment (Recommended)

Railway is the easiest option because it handles everything in one place.

### Step 1: Create a GitHub Repository

1. Go to [github.com](https://github.com) and sign in
2. Click the **+** icon → **New repository**
3. Name it: `international-draughts`
4. Keep it **Public** (free Railway deployment)
5. Click **Create repository**

### Step 2: Push Your Code to GitHub

Open your terminal/command prompt in your project folder and run:

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Create first commit
git commit -m "Initial commit - International Draughts game"

# Add your GitHub repository as remote
git remote add origin https://github.com/YOUR_USERNAME/international-draughts.git

# Push to GitHub
git branch -M main
git push -u origin main
```

Replace `YOUR_USERNAME` with your GitHub username.

### Step 3: Create Railway Account

1. Go to [railway.app](https://railway.app)
2. Click **Start a New Project**
3. Sign up with **GitHub** (recommended for easy connection)
4. Authorize Railway to access your GitHub

### Step 4: Deploy Your App

1. In Railway dashboard, click **+ New Project**
2. Select **Deploy from GitHub repo**
3. Choose your `international-draughts` repository
4. Railway will automatically detect it's a Next.js app

### Step 5: Add Environment Variables

In Railway dashboard:

1. Click on your project
2. Go to **Variables** tab
3. Add these variables:

```
DATABASE_URL=file:./db/production.db
NEXTAUTH_SECRET=your-random-secret-key-here
NEXTAUTH_URL=https://your-app-name.railway.app
```

To generate a random secret:
```bash
# Run this in your terminal
openssl rand -base64 32
```

### Step 6: Deploy the WebSocket Service

1. In Railway, click **+ New Service**
2. Select **GitHub Repo** again
3. Choose the same repository
4. Set **Root Directory** to: `mini-services/game-service`
5. Add variable: `PORT=3003`

### Step 7: Get Your URLs

Railway will give you URLs like:
- Main App: `https://international-draughts-production.up.railway.app`
- WebSocket: `https://international-draughts-ws.up.railway.app`

---

## 🔧 Alternative: Render (Free Option)

Render has a generous free tier but requires more setup.

### Step 1: Create Render Account

1. Go to [render.com](https://render.com)
2. Sign up with GitHub

### Step 2: Create Database (Free PostgreSQL)

1. Click **New** → **PostgreSQL**
2. Name it: `draughts-db`
3. Select **Free** tier
4. Click **Create Database**
5. Copy the **Internal Database URL**

### Step 3: Deploy Main App

1. Click **New** → **Web Service**
2. Connect your GitHub repository
3. Configure:
   - **Name**: `international-draughts`
   - **Environment**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
4. Add Environment Variables:
   ```
   DATABASE_URL=[paste your database URL]
   NEXTAUTH_SECRET=[random 32-character string]
   NEXTAUTH_URL=https://your-app-name.onrender.com
   ```
5. Click **Create Web Service**

### Step 4: Deploy WebSocket Service

1. Click **New** → **Web Service**
2. Same repository, but set **Root Directory**: `mini-services/game-service`
3. **Build Command**: `npm install`
4. **Start Command**: `node index.js`
5. Add variable: `PORT=3003`

---

## 🌐 Alternative: Vercel + Separate Backend

Vercel is great for the frontend but WebSocket needs a separate host.

### Step 1: Deploy Frontend to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Click **Add New** → **Project**
4. Import your `international-draughts` repository
5. Click **Deploy**
6. Wait for deployment

### Step 2: Deploy Backend to Render/Railway

Follow the Render or Railway steps above, but only for the WebSocket service.

### Step 3: Update Frontend URL

In Vercel environment variables, add:
```
NEXT_PUBLIC_WS_URL=https://your-backend-url.render.com
```

---

## 📱 Post-Deployment Checklist

After deployment, test these features:

- [ ] App loads in browser
- [ ] You can enter your name
- [ ] You can start a game vs computer
- [ ] The board displays correctly
- [ ] You can make moves
- [ ] Timer works
- [ ] Chat works (if using WebSocket)

---

## 🔍 Troubleshooting

### App shows 500 error
- Check environment variables are set correctly
- Check DATABASE_URL is correct
- View logs in Railway/Render dashboard

### WebSocket not connecting
- Make sure WebSocket service is running
- Check the WebSocket URL in frontend code
- Ensure CORS is configured

### Database errors
- Run migrations: `npx prisma migrate deploy`
- Check DATABASE_URL format

### Build fails
- Check Node.js version (should be 18+)
- Check all dependencies are in package.json
- View build logs for specific errors

---

## 💰 Cost Comparison

| Platform | Free Tier | Paid Plans |
|----------|-----------|------------|
| Railway | $5/month free credit | Pay as you go |
| Render | 750 hours/month free | $7/month |
| Vercel | Generous free tier | $20/month |
| Fly.io | 3 VMs free | Pay as you go |

---

## 🎓 Learning Resources

- [Railway Documentation](https://docs.railway.app)
- [Render Documentation](https://render.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)

---

## 🆘 Need Help?

If you encounter issues:

1. Check the deployment logs
2. Verify environment variables
3. Test locally first with `bun run dev`
4. Check GitHub Issues for similar problems

---

## ✅ Quick Deployment Checklist

1. [ ] Create GitHub repository
2. [ ] Push code to GitHub
3. [ ] Create Railway/Render account
4. [ ] Connect repository
5. [ ] Add environment variables
6. [ ] Deploy main app
7. [ ] Deploy WebSocket service
8. [ ] Test the live app
9. [ ] Share with friends! 🎉
