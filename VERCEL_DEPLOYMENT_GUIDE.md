# Vercel Deployment Guide for Glotech High School System

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Vercel CLI** (optional): `npm install -g vercel`
3. **PostgreSQL Database**: You'll need a PostgreSQL database (Vercel doesn't provide SQLite in production)

## Important Notes

⚠️ **Database Limitation**: Vercel serverless functions don't support SQLite in production. You need to use PostgreSQL or another cloud database.

### Recommended Database Options:
- **Neon** (https://neon.tech) - Free PostgreSQL with generous limits
- **Supabase** (https://supabase.com) - Free PostgreSQL database
- **Railway** (https://railway.app) - PostgreSQL with free tier
- **ElephantSQL** (https://www.elephantsql.com) - Free PostgreSQL

## Step 1: Prepare Your Database

### Option A: Using Neon (Recommended)

1. Go to [neon.tech](https://neon.tech) and sign up
2. Create a new project
3. Copy the connection string (looks like: `postgresql://user:password@host/database`)

### Option B: Using Supabase

1. Go to [supabase.com](https://supabase.com) and sign up
2. Create a new project
3. Go to Settings → Database
4. Copy the connection string (URI format)

## Step 2: Configure Environment Variables

Create a `.env.production` file (don't commit this):

```env
# Django Settings
SECRET_KEY=your-super-secret-key-here-change-this
DEBUG=False
ALLOWED_HOSTS=.vercel.app,localhost,127.0.0.1
CSRF_TRUSTED_ORIGINS=https://*.vercel.app

# Database (PostgreSQL)
DATABASE_URL=postgresql://user:password@host:5432/database

# Optional: Redis for caching (if you have Redis)
REDIS_URL=redis://your-redis-url

# Email Settings (optional)
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
DEFAULT_FROM_EMAIL=your-email@gmail.com
```

## Step 3: Deploy to Vercel

### Method 1: Using Vercel Dashboard (Easiest)

1. **Push your code to GitHub**:
   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push origin main
   ```

2. **Import to Vercel**:
   - Go to [vercel.com/dashboard](https://vercel.com/dashboard)
   - Click "Add New" → "Project"
   - Import your GitHub repository
   - Vercel will auto-detect it's a Python project

3. **Configure Environment Variables**:
   - In the project settings, go to "Environment Variables"
   - Add all variables from your `.env.production` file:
     - `SECRET_KEY`
     - `DEBUG` = `False`
     - `DATABASE_URL` = your PostgreSQL connection string
     - `ALLOWED_HOSTS` = `.vercel.app`
     - `CSRF_TRUSTED_ORIGINS` = `https://*.vercel.app`

4. **Deploy**:
   - Click "Deploy"
   - Wait for the build to complete

### Method 2: Using Vercel CLI

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel
   ```

4. **Add Environment Variables**:
   ```bash
   vercel env add SECRET_KEY
   vercel env add DATABASE_URL
   vercel env add DEBUG
   ```

5. **Deploy to Production**:
   ```bash
   vercel --prod
   ```

## Step 4: Run Migrations

After deployment, you need to run migrations on your production database.

### Option 1: Using Vercel CLI
```bash
vercel env pull .env.production.local
python manage.py migrate --settings=config.settings
```

### Option 2: Using Local Connection
1. Set your `DATABASE_URL` environment variable locally
2. Run migrations:
   ```bash
   python manage.py migrate
   python manage.py createsuperuser
   ```

## Step 5: Create Admin User

You need to create an admin user for your production site:

```bash
# Connect to your production database locally
export DATABASE_URL="your-production-database-url"
python manage.py createsuperuser
```

Or use the management command:
```bash
python manage.py create_admin
```

## Step 6: Collect Static Files

Static files should be collected automatically during build, but if needed:

```bash
python manage.py collectstatic --noinput
```

## Step 7: Test Your Deployment

1. Visit your Vercel URL (e.g., `https://your-project.vercel.app`)
2. Test the admin panel: `https://your-project.vercel.app/admin/`
3. Login with your admin credentials
4. Test key features

## Important Configuration Files

### vercel.json
```json
{
  "version": 2,
  "builds": [
    {
      "src": "config/wsgi.py",
      "use": "@vercel/python",
      "config": { "maxLambdaSize": "15mb", "runtime": "python3.11" }
    }
  ],
  "routes": [
    {
      "src": "/static/(.*)",
      "dest": "/static/$1"
    },
    {
      "src": "/(.*)",
      "dest": "config/wsgi.py"
    }
  ]
}
```

### build_files.sh
```bash
#!/bin/bash
pip install -r requirements.txt
python manage.py collectstatic --noinput --clear
python manage.py migrate --noinput
```

## Troubleshooting

### Issue: "Application Error" or 500 Error

**Solution**: Check Vercel logs
```bash
vercel logs
```

Common causes:
- Missing environment variables
- Database connection issues
- Static files not collected

### Issue: Static Files Not Loading

**Solution**: 
1. Ensure `STATIC_ROOT` is set correctly
2. Run `python manage.py collectstatic`
3. Check `STATICFILES_STORAGE` setting

### Issue: Database Connection Failed

**Solution**:
1. Verify `DATABASE_URL` is correct
2. Check database is accessible from Vercel
3. Ensure database allows connections from Vercel IPs

### Issue: CSRF Verification Failed

**Solution**:
Add your Vercel domain to `CSRF_TRUSTED_ORIGINS`:
```python
CSRF_TRUSTED_ORIGINS = ['https://your-project.vercel.app']
```

## Limitations on Vercel

1. **No WebSockets**: Vercel doesn't support WebSocket connections (Channels won't work)
2. **No Background Tasks**: Celery and similar won't work
3. **Stateless**: Each request is handled by a new serverless function
4. **File Storage**: Use cloud storage (AWS S3, Cloudinary) for media files
5. **Execution Time**: 10-second timeout on Hobby plan, 60 seconds on Pro

## Recommended Alternatives for Full Features

If you need WebSockets, background tasks, or persistent connections:

1. **Railway** (https://railway.app) - Supports full Django features
2. **Render** (https://render.com) - Good Django support
3. **DigitalOcean App Platform** - Full control
4. **Heroku** - Classic PaaS (paid)

## Post-Deployment Checklist

- [ ] Database is connected and migrations are run
- [ ] Admin user is created
- [ ] Static files are loading correctly
- [ ] Environment variables are set
- [ ] ALLOWED_HOSTS includes your domain
- [ ] CSRF_TRUSTED_ORIGINS includes your domain
- [ ] Test login functionality
- [ ] Test key features (students, teachers, academics)
- [ ] Set up custom domain (optional)
- [ ] Configure email settings (optional)
- [ ] Set up monitoring/logging

## Custom Domain Setup

1. Go to your Vercel project settings
2. Click "Domains"
3. Add your custom domain
4. Update DNS records as instructed
5. Update `ALLOWED_HOSTS` and `CSRF_TRUSTED_ORIGINS` in environment variables

## Monitoring and Logs

View logs in real-time:
```bash
vercel logs --follow
```

Or check the Vercel dashboard for detailed logs and analytics.

## Support

For issues:
1. Check Vercel documentation: https://vercel.com/docs
2. Check Django deployment guide: https://docs.djangoproject.com/en/stable/howto/deployment/
3. Review Vercel logs for specific errors

## Security Recommendations

1. ✅ Set `DEBUG=False` in production
2. ✅ Use strong `SECRET_KEY`
3. ✅ Enable HTTPS (automatic on Vercel)
4. ✅ Set secure cookie flags
5. ✅ Use environment variables for secrets
6. ✅ Regular database backups
7. ✅ Monitor for security updates

---

**Note**: This project uses Django Channels for real-time features. These won't work on Vercel's serverless platform. Consider Railway or Render for full feature support.
