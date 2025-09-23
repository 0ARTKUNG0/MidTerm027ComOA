# Deployment Guide: Software Download Manager

## Overview
This guide will help you deploy your Software Download Manager application:
- **Frontend**: React app deployed on Vercel
- **Backend**: Node.js/Express API deployed on Render

## 🚀 Backend Deployment (Render)

### Step 1: Prepare Backend for Render

1. **Create Render Account**: Sign up at [render.com](https://render.com)

2. **Connect GitHub Repository**: 
   - Link your GitHub account to Render
   - Select your repository: `MidTerm027ComOA`

3. **Create Web Service**:
   - Click "New +" → "Web Service"
   - Choose your repository
   - Configure the service:

   ```
   Name: midterm027comoa-backend
   Region: Oregon (US West) or closest to your users
   Branch: main
   Root Directory: backend
   Runtime: Node
   Build Command: npm install
   Start Command: npm start
   ```

### Step 2: Configure Environment Variables on Render

In your Render dashboard, go to **Environment** tab and add:

```bash
NODE_ENV=production
PORT=5000
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-render-2024
JWT_EXPIRES_IN=24h
SERVER_NAME=Software Download Manager Backend
VERSION=1.0.0
CORS_ORIGIN=https://your-vercel-app-name.vercel.app
API_BASE_URL=https://your-render-service-name.onrender.com
```

**Important**: 
- Replace `your-vercel-app-name` with your actual Vercel app name
- Replace `your-render-service-name` with your actual Render service name
- Change `JWT_SECRET` to a strong, unique secret

### Step 3: Deploy Backend

1. Click **"Create Web Service"**
2. Wait for deployment to complete (5-10 minutes)
3. Note your backend URL: `https://midterm027comoa-backend.onrender.com`

---

## 🌐 Frontend Deployment (Vercel)

### Step 1: Prepare Frontend for Vercel

1. **Create Vercel Account**: Sign up at [vercel.com](https://vercel.com)

2. **Install Vercel CLI** (optional):
   ```bash
   npm install -g vercel
   ```

### Step 2: Deploy via Vercel Dashboard

1. **Import Project**:
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your GitHub repository
   - Select the `frontend` folder as root directory

2. **Configure Build Settings**:
   ```
   Framework Preset: Create React App
   Root Directory: frontend
   Build Command: npm run build
   Output Directory: build
   Install Command: npm install
   ```

### Step 3: Configure Environment Variables on Vercel

In Vercel dashboard, go to **Settings** → **Environment Variables** and add:

```bash
REACT_APP_API_BASE_URL=https://midterm027comoa-backend.onrender.com/api
REACT_APP_BACKEND_URL=https://midterm027comoa-backend.onrender.com
REACT_APP_NAME=Software Download Manager
REACT_APP_VERSION=1.0.0
REACT_APP_DESCRIPTION=Find and download your favorite software
REACT_APP_DEBUG=false
```

**Important**: Replace `midterm027comoa-backend` with your actual Render service name

### Step 4: Deploy Frontend

1. Click **"Deploy"**
2. Wait for deployment to complete (2-5 minutes)
3. Note your frontend URL: `https://your-app-name.vercel.app`

---

## 🔄 Update CORS Configuration

After both deployments are complete:

1. **Update Backend CORS**: In Render dashboard, update the `CORS_ORIGIN` environment variable:
   ```
   CORS_ORIGIN=https://your-actual-vercel-app-name.vercel.app
   ```

2. **Redeploy Backend**: Go to Render dashboard and trigger a manual deploy

---

## 🧪 Testing Your Deployment

### Test Backend API
Visit your backend URL and test these endpoints:
- Health check: `https://your-backend-url.onrender.com/api/health`
- Software list: `https://your-backend-url.onrender.com/api/software`

### Test Frontend
1. Visit your Vercel URL
2. Test user registration and login
3. Test software browsing and download functionality

---

## 📝 Environment Variables Reference

### Backend (.env file)
```bash
NODE_ENV=production
PORT=5000
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h
CORS_ORIGIN=https://your-vercel-app.vercel.app
API_BASE_URL=https://your-render-backend.onrender.com
SERVER_NAME=Software Download Manager Backend
VERSION=1.0.0
```

### Frontend (.env file)
```bash
REACT_APP_API_BASE_URL=https://your-render-backend.onrender.com/api
REACT_APP_BACKEND_URL=https://your-render-backend.onrender.com
REACT_APP_NAME=Software Download Manager
REACT_APP_VERSION=1.0.0
REACT_APP_DESCRIPTION=Find and download your favorite software
REACT_APP_DEBUG=false
```

---

## 🔧 Troubleshooting

### Common Issues:

1. **CORS Errors**: 
   - Ensure `CORS_ORIGIN` in backend matches your Vercel URL exactly
   - Include protocol (https://) and no trailing slash

2. **Environment Variables Not Working**:
   - Frontend: Variables must start with `REACT_APP_`
   - Backend: Restart/redeploy after adding variables

3. **Build Failures**:
   - Check Node.js version compatibility
   - Ensure all dependencies are in package.json

4. **API Connection Issues**:
   - Verify backend URL in frontend environment variables
   - Check network logs in browser developer tools

### Render Free Tier Limitations:
- Services sleep after 15 minutes of inactivity
- First request after sleep may take 30+ seconds
- Consider upgrading to paid plan for production

---

## 🎉 Success!

Your Software Download Manager should now be live:
- **Frontend**: https://your-app-name.vercel.app
- **Backend**: https://your-backend-name.onrender.com

Share these URLs to access your deployed application!

---

## 📚 Additional Resources

- [Render Documentation](https://render.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Create React App Deployment](https://create-react-app.dev/docs/deployment/)
- [Express.js Production Best Practices](https://expressjs.com/en/advanced/best-practice-performance.html)