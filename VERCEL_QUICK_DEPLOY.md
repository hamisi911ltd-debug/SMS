# 🚀 Quick Vercel Deployment Guide

## ⚡ Fast Setup (5 Minutes)

### Step 1: Get a PostgreSQL Database (Required)

**Option 1: Neon (Recommended - Free)**
1. Go to https://neon.tech
2. Sign up and create a project
3. Copy the connection string

**Option 2: Supabase (Free)**
1. Go to https://supabase.com
2. Create project → Settings → Database
3. Copy the connection string (URI format)

### Step 2: Deploy to Vercel

1. **Push to GitHub** (if not already done)
2. **Go to Vercel**: https://vercel.com/new
3. **Import your repository**
4. **Add Environment Variables**:

```
SECRET_KEY=django-insecure-change-this-to-something-random-and-long-123456789
DEBUG=False
DATABASE_URL=postgresql://user:password@host:5432/database
ALLOWED_HOSTS=.vercel.app
CSRF_TRUSTED_ORIGINS=https://*.vercel.app
```

5. **Click Deploy**

### Step 3: Run Migrations

After deployment, connect to your database locally and run:

```bash
# Set your database URL
export DATABASE_URL="your-postgresql-url-here"

# Run migrations
python manage.py migrate

# Create admin user
python manage.py createsuperuser
```

### Step 4: Access Your Site

- **Main Site**: `https://your-project.vercel.app`
- **Admin Panel**: `https://your-project.vercel.app/admin/`

---

## 📋 Environment Variables Needed

| Variable | Value | Required |
|----------|-------|----------|
| `SECRET_KEY` | Random string (50+ chars) | ✅ Yes |
| `DEBUG` | `False` | ✅ Yes |
| `DATABASE_URL` | PostgreSQL connection string | ✅ Yes |
| `ALLOWED_HOSTS` | `.vercel.app` | ✅ Yes |
| `CSRF_TRUSTED_ORIGINS` | `https://*.vercel.app` | ✅ Yes |

---

## ⚠️ Important Notes

1. **SQLite won't work on Vercel** - You MUST use PostgreSQL
2. **WebSockets disabled** - Real-time messaging won't work on Vercel
3. **Use Railway or Render** if you need full Django features

---

## 🔧 Troubleshooting

**Error: Application Error**
- Check Vercel logs: `vercel logs`
- Verify all environment variables are set
- Ensure DATABASE_URL is correct

**Static files not loading**
- Vercel handles this automatically via `build_files.sh`

**Can't login**
- Make sure you created a superuser
- Check CSRF_TRUSTED_ORIGINS includes your domain

---

## 📞 Need Help?

Check the full guide: `VERCEL_DEPLOYMENT_GUIDE.md`
