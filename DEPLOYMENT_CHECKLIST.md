# Quick Deployment Checklist

## ✅ Pre-Deployment Checklist

### Backend (Render)
- [ ] Updated `.env.production` with production values
- [ ] Set strong JWT_SECRET 
- [ ] Verified Node.js version compatibility
- [ ] All dependencies in package.json
- [ ] Start script configured: `npm start`

### Frontend (Vercel)  
- [ ] Updated `.env.production` with production API URLs
- [ ] All REACT_APP_ environment variables set
- [ ] Build script working: `npm run build`
- [ ] vercel.json configuration added
- [ ] API endpoints using environment variables

## 🚀 Deployment Steps

### 1. Deploy Backend to Render
1. Create Render account and connect GitHub
2. Create Web Service from your repository 
3. Set Root Directory: `backend`
4. Add environment variables in Render dashboard
5. Deploy and get your backend URL

### 2. Deploy Frontend to Vercel  
1. Create Vercel account and import GitHub project
2. Set Root Directory: `frontend` 
3. Add environment variables in Vercel dashboard
4. Update REACT_APP_API_BASE_URL with your Render backend URL
5. Deploy and get your frontend URL

### 3. Update CORS
1. Update CORS_ORIGIN in Render with your Vercel URL
2. Redeploy backend service

## 🔍 Testing
- [ ] Backend health check: `/api/health`
- [ ] Frontend loads without errors
- [ ] User registration works
- [ ] User login works  
- [ ] Software list displays
- [ ] Download functionality works

## 📋 URLs to Update

**Replace these placeholders with your actual URLs:**

- Backend Render URL: `https://midterm027comoa-backend.onrender.com`
- Frontend Vercel URL: `https://midterm027comoa-frontend.vercel.app`

**Update in these files:**
- `backend/.env.production` → CORS_ORIGIN
- `frontend/.env.production` → REACT_APP_API_BASE_URL
- Render dashboard environment variables
- Vercel dashboard environment variables