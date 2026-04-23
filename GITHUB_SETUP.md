# 🚀 GitHub Setup Instructions

## Step 1: Create GitHub Repository

1. **Go to GitHub**: Visit [github.com](https://github.com) and login
2. **Create New Repository**:
   - Click the "+" icon in the top right
   - Select "New repository"
   - Repository name: `glotech-school-nodejs` (or your preferred name)
   - Description: `Glotech High School Management System - Node.js Version`
   - Set to **Public** (so Railway can access it)
   - **DO NOT** initialize with README, .gitignore, or license (we already have these)
   - Click "Create repository"

## Step 2: Push Code to GitHub

After creating the repository, GitHub will show you commands. Use these in your terminal:

```bash
# Add the remote repository (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/glotech-school-nodejs.git

# Push the code to GitHub
git branch -M main
git push -u origin main
```

## Step 3: Verify Upload

1. Refresh your GitHub repository page
2. You should see all the Node.js files uploaded
3. Check that these key files are present:
   - `server.js`
   - `package.json`
   - `README.md`
   - `DEPLOYMENT_GUIDE.md`
   - `routes/` folder with all API files
   - `public/` folder with frontend files

## Step 4: Deploy to Railway

### Option A: Railway CLI (Recommended)

1. **Install Railway CLI**:
   ```bash
   npm install -g @railway/cli
   ```

2. **Login to Railway**:
   ```bash
   railway login
   ```

3. **Initialize and Deploy**:
   ```bash
   railway init
   railway up
   ```

4. **Set Environment Variables**:
   ```bash
   # Set your MongoDB connection string
   railway variables set MONGODB_URI="mongodb+srv://username:password@cluster.mongodb.net/glotech_school"
   
   # Set JWT secret (generate a random string)
   railway variables set JWT_SECRET="your-super-secret-jwt-key-here"
   
   # Set session secret
   railway variables set SESSION_SECRET="your-session-secret-here"
   
   # Set environment
   railway variables set NODE_ENV="production"
   ```

### Option B: GitHub Integration

1. **Go to Railway Dashboard**: Visit [railway.app](https://railway.app)
2. **Create New Project**: Click "New Project"
3. **Deploy from GitHub**: Select "Deploy from GitHub repo"
4. **Select Repository**: Choose your `glotech-school-nodejs` repository
5. **Configure Environment Variables**: Add the same variables as above
6. **Deploy**: Railway will automatically build and deploy

## Step 5: Database Setup

### MongoDB Atlas (Recommended)

1. **Create Account**: Go to [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. **Create Cluster**: Choose the free tier
3. **Create Database User**: Set username and password
4. **Whitelist IP**: Add `0.0.0.0/0` for Railway access
5. **Get Connection String**: Copy the connection string
6. **Update Railway**: Set the `MONGODB_URI` variable in Railway

### Connection String Format:
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/glotech_school?retryWrites=true&w=majority
```

## Step 6: Test Deployment

1. **Access Your App**: Railway will provide a URL like `https://your-app.railway.app`
2. **Test Login**: Use the demo credentials:
   - Admin: `admin` / `admin123`
   - Teacher: `john.teacher` / `teacher123`
   - Student: `jane.student` / `student123`
3. **Change Passwords**: Immediately change all default passwords!

## 🔧 Troubleshooting

### Common Issues:

1. **Build Fails**: Check Railway logs for errors
2. **Database Connection**: Verify MongoDB URI is correct
3. **Environment Variables**: Ensure all required variables are set
4. **Port Issues**: Railway automatically sets PORT, don't hardcode it

### Getting Help:

- Check `DEPLOYMENT_GUIDE.md` for detailed instructions
- Review Railway logs for specific errors
- Ensure GitHub repository is public
- Verify all environment variables are set correctly

## 📋 Quick Checklist

- [ ] GitHub repository created and code pushed
- [ ] Railway project created and connected to GitHub
- [ ] MongoDB Atlas cluster created
- [ ] Environment variables set in Railway
- [ ] Application deployed and accessible
- [ ] Default passwords changed
- [ ] Database connection working

---

**🎉 Once completed, your Glotech School Management System will be live on Railway!**