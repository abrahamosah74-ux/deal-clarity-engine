# Backend Deployment Diagnostics

## Issues to Check on Render:

### 1. **Environment Variables**
- [ ] `MONGO_URI` is set
- [ ] `JWT_SECRET` is set
- [ ] `NODE_ENV` is set to `production` or empty
- [ ] Check if `RENDER` env var is automatically set by Render

### 2. **Port Binding**
- Backend should bind to `0.0.0.0:5000` on Render
- Current code checks: `process.env.RENDER === 'true'` OR `process.env.NODE_ENV === 'production'`

### 3. **Database Connection**
- MongoDB URI: `mongodb+srv://Teestone45:4eaver3D@teestone45.hr5ugdq.mongodb.net/deal_clarity`
- Check if Render can access MongoDB
- Check firewall rules for MongoDB Atlas

### 4. **CORS Configuration**
- Should allow: `https://deal-clarity-engine.onrender.com`
- Should allow: `https://app.deal-clarity.com`
- Should allow: `https://deal-clarity-engine.vercel.app`

### 5. **Email Service**
- Not required for forgot-password to work
- Reset code is generated and saved to DB
- Email is optional (gracefully fails)

## Debugging Steps:

1. **Check Render Logs**:
   - Go to https://dashboard.render.com/
   - Find your `deal-clarity-engine` service
   - Click "Logs" to see startup messages
   - Look for error messages like:
     - Port already in use
     - Database connection failed
     - Socket.IO initialization error

2. **Test Backend Directly**:
   - Try accessing: `https://deal-clarity-engine.onrender.com/`
   - Should return welcome JSON response
   - Try: `https://deal-clarity-engine.onrender.com/api/health`

3. **Check Network Tab**:
   - Open browser DevTools
   - Network tab
   - Try forgot-password
   - Check request/response details
   - Look for CORS errors

## Recent Changes:

- Fixed backend binding logic to detect Render environment
- Added CORS support for frontend origins
- Enhanced error logging throughout
- Backend routes are correctly configured

## Expected Behavior:

1. User enters email on `/forgot-password`
2. Frontend sends POST to `https://deal-clarity-engine.onrender.com/api/auth/forgot-password`
3. Backend receives request, validates email, generates reset code
4. Reset code saved to MongoDB
5. Email sent (or fails silently)
6. Frontend redirects to `/reset-password`
7. User can then reset their password
