# Deployment Guide - Glotech School Management System

This guide will help you deploy the Glotech School Management System to Railway (or other platforms).

## Prerequisites

1. **Node.js** (v18 or higher)
2. **MongoDB Database** (Cloud or local)
3. **Git** for version control
4. **Railway Account** (for deployment)

## Step 1: Database Setup

### Option A: MongoDB Atlas (Recommended for Production)

1. **Create MongoDB Atlas Account**
   - Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Sign up for a free account
   - Create a new cluster

2. **Get Connection String**
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database password

3. **Example Connection String:**
   ```
   mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/glotech_school?retryWrites=true&w=majority
   ```

### Option B: Local MongoDB (Development Only)

1. **Install MongoDB**
   - Download from [MongoDB Community Server](https://www.mongodb.com/try/download/community)
   - Install and start the MongoDB service

2. **Connection String:**
   ```
   mongodb://localhost:27017/glotech_school
   ```

## Step 2: Environment Configuration

1. **Create `.env` file** (copy from `.env.example`):
   ```bash
   cp .env.example .env
   ```

2. **Update `.env` with your values:**
   ```env
   # Database Configuration
   MONGODB_URI=your-mongodb-connection-string-here
   
   # JWT Configuration
   JWT_SECRET=generate-a-strong-random-secret-here-make-it-long
   JWT_EXPIRES_IN=24h
   
   # Session Configuration
   SESSION_SECRET=generate-another-strong-random-secret-here
   
   # Server Configuration
   NODE_ENV=production
   PORT=3000
   FRONTEND_URL=https://your-app-domain.railway.app
   ```

## Step 3: Local Testing

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Setup Database:**
   ```bash
   npm run setup-db
   ```

3. **Start Development Server:**
   ```bash
   npm run dev
   ```

4. **Test the Application:**
   - Open `http://localhost:3000`
   - Login with default credentials:
     - **Admin**: `admin` / `admin123`
     - **Teacher**: `john.teacher` / `teacher123`
     - **Student**: `jane.student` / `student123`

## Step 4: Railway Deployment

### Method 1: Railway CLI (Recommended)

1. **Install Railway CLI:**
   ```bash
   npm install -g @railway/cli
   ```

2. **Login to Railway:**
   ```bash
   railway login
   ```

3. **Initialize Project:**
   ```bash
   railway init
   ```

4. **Set Environment Variables:**
   ```bash
   railway variables set MONGODB_URI="your-mongodb-connection-string"
   railway variables set JWT_SECRET="generate-a-strong-random-secret"
   railway variables set SESSION_SECRET="generate-another-strong-secret"
   railway variables set NODE_ENV="production"
   ```

5. **Deploy:**
   ```bash
   railway up
   ```

### Method 2: GitHub Integration

1. **Push to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/glotech-school.git
   git push -u origin main
   ```

2. **Connect to Railway:**
   - Go to [Railway Dashboard](https://railway.app/dashboard)
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository

3. **Set Environment Variables:**
   - Go to your project settings
   - Add the environment variables from your `.env` file

4. **Deploy:**
   - Railway will automatically deploy when you push to main branch

## Step 5: Post-Deployment Setup

1. **Setup Database (Production):**
   ```bash
   # If using Railway CLI
   railway run npm run setup-db
   
   # Or access the deployed app and it will create default users automatically
   ```

2. **Verify Deployment:**
   - Visit your Railway app URL
   - Test login with default credentials
   - Change default passwords immediately!

3. **Custom Domain (Optional):**
   - Go to Railway project settings
   - Add your custom domain
   - Update DNS records as instructed

## Step 6: Security Checklist

### Immediate Actions After Deployment:

1. **Change Default Passwords:**
   - Login as admin and change the password
   - Update all default user passwords

2. **Update Environment Variables:**
   - Use strong, unique secrets for JWT_SECRET and SESSION_SECRET
   - Never commit `.env` files to version control

3. **Database Security:**
   - Ensure MongoDB Atlas has IP whitelisting enabled
   - Use strong database passwords
   - Enable database authentication

4. **Application Security:**
   - Review user permissions
   - Test all authentication flows
   - Verify rate limiting is working

## Step 7: Monitoring and Maintenance

1. **Monitor Application:**
   - Check Railway logs for errors
   - Monitor database performance
   - Set up uptime monitoring

2. **Regular Updates:**
   - Keep dependencies updated
   - Monitor security advisories
   - Backup database regularly

3. **Performance Optimization:**
   - Monitor response times
   - Optimize database queries
   - Consider CDN for static assets

## Troubleshooting

### Common Issues:

1. **Database Connection Failed:**
   - Verify MONGODB_URI is correct
   - Check MongoDB Atlas IP whitelist
   - Ensure database user has proper permissions

2. **Application Won't Start:**
   - Check Railway logs for errors
   - Verify all environment variables are set
   - Ensure PORT is not hardcoded

3. **Authentication Issues:**
   - Verify JWT_SECRET is set
   - Check if cookies are being set properly
   - Ensure FRONTEND_URL matches your domain

4. **Static Files Not Loading:**
   - Verify public folder is being served
   - Check file paths in HTML
   - Ensure Railway is serving static files

### Getting Help:

1. **Check Logs:**
   ```bash
   railway logs
   ```

2. **Railway Documentation:**
   - [Railway Docs](https://docs.railway.app/)
   - [Node.js Deployment Guide](https://docs.railway.app/deploy/deployments)

3. **MongoDB Atlas Support:**
   - [Atlas Documentation](https://docs.atlas.mongodb.com/)
   - [Connection Troubleshooting](https://docs.atlas.mongodb.com/troubleshoot-connection/)

## Alternative Deployment Platforms

### Heroku
1. Create Heroku app
2. Set environment variables
3. Deploy via Git or GitHub integration

### Vercel
1. Install Vercel CLI
2. Configure `vercel.json`
3. Deploy with `vercel --prod`

### DigitalOcean App Platform
1. Connect GitHub repository
2. Configure environment variables
3. Deploy through dashboard

## Production Checklist

- [ ] MongoDB database configured and accessible
- [ ] Environment variables set securely
- [ ] Default passwords changed
- [ ] SSL/HTTPS enabled
- [ ] Domain configured (if using custom domain)
- [ ] Monitoring set up
- [ ] Backup strategy implemented
- [ ] Error logging configured
- [ ] Performance monitoring enabled
- [ ] Security headers configured
- [ ] Rate limiting tested
- [ ] User permissions verified

## Support

For deployment support:
- Check the main README.md for general setup
- Review Railway documentation
- Contact the development team for specific issues

---

**Note:** Always test your deployment in a staging environment before going live with production data.