# 🚀 PRODUCTION DEPLOYMENT GUIDE

Complete guide to deploy your Kenyan Schools Administration System to production.

---

## 📋 PRE-DEPLOYMENT CHECKLIST

Before deploying, ensure:

- [ ] All tests pass
- [ ] Database migrations are up to date
- [ ] Static files are collected
- [ ] Environment variables are configured
- [ ] SECRET_KEY is strong and unique
- [ ] DEBUG=False in production
- [ ] ALLOWED_HOSTS is properly set
- [ ] Email settings are configured
- [ ] Database backups are planned

---

## 🌐 DEPLOYMENT OPTIONS

### Option 1: Railway (Recommended - Easiest)

**Pros**: Free tier, automatic deployments, PostgreSQL included, easy setup  
**Cons**: Limited free tier resources

#### Steps:

1. **Prepare Repository**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-github-repo>
   git push -u origin main
   ```

2. **Create Railway Account**
   - Go to https://railway.app
   - Sign up with GitHub

3. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository

4. **Add PostgreSQL Database**
   - Click "New"
   - Select "Database"
   - Choose "PostgreSQL"
   - Railway will provide DATABASE_URL automatically

5. **Set Environment Variables**
   ```
   SECRET_KEY=<your-strong-secret-key>
   DEBUG=False
   ALLOWED_HOSTS=.up.railway.app
   DATABASE_URL=<automatically-set-by-railway>
   ```

6. **Deploy**
   - Railway deploys automatically
   - Check logs for any errors
   - Run migrations: `railway run python manage.py migrate`

7. **Create Superuser**
   ```bash
   railway run python manage.py createsuperuser
   ```

---

### Option 2: Heroku

**Pros**: Well-documented, reliable, PostgreSQL included  
**Cons**: No free tier anymore

#### Steps:

1. **Install Heroku CLI**
   ```bash
   # Download from https://devcenter.heroku.com/articles/heroku-cli
   ```

2. **Login to Heroku**
   ```bash
   heroku login
   ```

3. **Create Heroku App**
   ```bash
   heroku create your-school-system
   ```

4. **Add PostgreSQL**
   ```bash
   heroku addons:create heroku-postgresql:mini
   ```

5. **Set Environment Variables**
   ```bash
   heroku config:set SECRET_KEY='<your-secret-key>'
   heroku config:set DEBUG=False
   heroku config:set ALLOWED_HOSTS='.herokuapp.com'
   ```

6. **Deploy**
   ```bash
   git push heroku main
   ```

7. **Run Migrations**
   ```bash
   heroku run python manage.py migrate
   heroku run python manage.py createsuperuser
   ```

8. **Open App**
   ```bash
   heroku open
   ```

---

### Option 3: DigitalOcean/AWS/VPS

**Pros**: Full control, scalable, cost-effective for large deployments  
**Cons**: Requires more setup and maintenance

#### Steps:

1. **Create Server**
   - Ubuntu 22.04 LTS recommended
   - Minimum: 2GB RAM, 1 CPU, 25GB storage

2. **Connect to Server**
   ```bash
   ssh root@your-server-ip
   ```

3. **Update System**
   ```bash
   apt update && apt upgrade -y
   ```

4. **Install Dependencies**
   ```bash
   apt install python3.11 python3.11-venv python3-pip postgresql nginx supervisor -y
   ```

5. **Create User**
   ```bash
   adduser schoolsystem
   usermod -aG sudo schoolsystem
   su - schoolsystem
   ```

6. **Clone Repository**
   ```bash
   git clone <your-repo-url>
   cd KENYAN-SCHOOLS-ADMINISTRATION-SYSTEM
   ```

7. **Set Up Virtual Environment**
   ```bash
   python3.11 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```

8. **Configure PostgreSQL**
   ```bash
   sudo -u postgres psql
   CREATE DATABASE schoolsystem;
   CREATE USER schooluser WITH PASSWORD 'strong-password';
   GRANT ALL PRIVILEGES ON DATABASE schoolsystem TO schooluser;
   \q
   ```

9. **Configure Environment**
   ```bash
   nano .env
   # Add your environment variables
   ```

10. **Run Migrations**
    ```bash
    python manage.py migrate
    python manage.py collectstatic --noinput
    python manage.py createsuperuser
    ```

11. **Configure Gunicorn**
    ```bash
    # Create gunicorn config
    nano gunicorn_config.py
    ```
    
    ```python
    bind = "127.0.0.1:8000"
    workers = 3
    ```

12. **Configure Supervisor**
    ```bash
    sudo nano /etc/supervisor/conf.d/schoolsystem.conf
    ```
    
    ```ini
    [program:schoolsystem]
    directory=/home/schoolsystem/KENYAN-SCHOOLS-ADMINISTRATION-SYSTEM
    command=/home/schoolsystem/KENYAN-SCHOOLS-ADMINISTRATION-SYSTEM/venv/bin/gunicorn config.wsgi:application -c gunicorn_config.py
    user=schoolsystem
    autostart=true
    autorestart=true
    redirect_stderr=true
    stdout_logfile=/home/schoolsystem/logs/gunicorn.log
    ```

13. **Configure Nginx**
    ```bash
    sudo nano /etc/nginx/sites-available/schoolsystem
    ```
    
    ```nginx
    server {
        listen 80;
        server_name your-domain.com;

        location /static/ {
            alias /home/schoolsystem/KENYAN-SCHOOLS-ADMINISTRATION-SYSTEM/staticfiles/;
        }

        location /media/ {
            alias /home/schoolsystem/KENYAN-SCHOOLS-ADMINISTRATION-SYSTEM/media/;
        }

        location / {
            proxy_pass http://127.0.0.1:8000;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
    ```

14. **Enable Site**
    ```bash
    sudo ln -s /etc/nginx/sites-available/schoolsystem /etc/nginx/sites-enabled/
    sudo nginx -t
    sudo systemctl restart nginx
    ```

15. **Start Application**
    ```bash
    sudo supervisorctl reread
    sudo supervisorctl update
    sudo supervisorctl start schoolsystem
    ```

16. **Set Up SSL (Let's Encrypt)**
    ```bash
    sudo apt install certbot python3-certbot-nginx -y
    sudo certbot --nginx -d your-domain.com
    ```

---

## 🔒 PRODUCTION ENVIRONMENT VARIABLES

Create a `.env` file with these variables:

```bash
# Django Core
SECRET_KEY=<generate-strong-50-char-key>
DEBUG=False
ALLOWED_HOSTS=your-domain.com,www.your-domain.com

# Database (PostgreSQL)
DATABASE_URL=postgresql://user:password@host:5432/dbname

# Security
CSRF_TRUSTED_ORIGINS=https://your-domain.com,https://www.your-domain.com

# Email (Example with Gmail)
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
DEFAULT_FROM_EMAIL=noreply@your-school.com

# Redis (Optional - for caching and WebSocket)
REDIS_URL=redis://localhost:6379/0

# M-Pesa (Optional - for fee payments)
MPESA_CONSUMER_KEY=your-consumer-key
MPESA_CONSUMER_SECRET=your-consumer-secret
MPESA_SHORTCODE=your-shortcode
MPESA_PASSKEY=your-passkey
MPESA_CALLBACK_URL=https://your-domain.com/finance/mpesa/callback/
```

---

## 🔧 POST-DEPLOYMENT TASKS

After deployment:

1. **Create Superuser**
   ```bash
   python manage.py createsuperuser
   ```

2. **Set Up Academic Year**
   - Login to admin panel
   - Create current academic year
   - Create terms

3. **Add Initial Data**
   - Add subjects
   - Create classes
   - Add teachers
   - Add students

4. **Configure Email**
   - Test email sending
   - Set up email templates

5. **Set Up Backups**
   - Database backups (daily)
   - Media files backups (weekly)
   - Use cron jobs or backup service

6. **Monitor Application**
   - Set up error tracking (Sentry)
   - Monitor server resources
   - Check logs regularly

---

## 📊 MONITORING & MAINTENANCE

### Daily Tasks
- Check error logs
- Monitor server resources
- Verify backups completed

### Weekly Tasks
- Review user activity
- Check database size
- Update dependencies (if needed)

### Monthly Tasks
- Security updates
- Performance optimization
- Database cleanup
- Backup verification

---

## 🆘 TROUBLESHOOTING

### Static Files Not Loading
```bash
python manage.py collectstatic --noinput
# Check STATIC_ROOT and STATIC_URL settings
```

### Database Connection Error
```bash
# Check DATABASE_URL format
# Verify database credentials
# Ensure database server is running
```

### 502 Bad Gateway
```bash
# Check if Gunicorn is running
sudo supervisorctl status schoolsystem
# Check Gunicorn logs
tail -f /home/schoolsystem/logs/gunicorn.log
```

### Permission Errors
```bash
# Fix file permissions
sudo chown -R schoolsystem:schoolsystem /home/schoolsystem/
chmod -R 755 /home/schoolsystem/KENYAN-SCHOOLS-ADMINISTRATION-SYSTEM
```

---

## 📞 SUPPORT

For deployment issues:
1. Check logs: `logs/django.log`
2. Check server logs: `/var/log/nginx/error.log`
3. Check application logs: Gunicorn/Supervisor logs
4. Review Django documentation
5. Check Railway/Heroku documentation

---

## ✅ DEPLOYMENT CHECKLIST

- [ ] Code pushed to repository
- [ ] Environment variables set
- [ ] Database created and configured
- [ ] Migrations run successfully
- [ ] Static files collected
- [ ] Superuser created
- [ ] Email configured and tested
- [ ] SSL certificate installed
- [ ] Backups configured
- [ ] Monitoring set up
- [ ] Domain configured
- [ ] Application accessible
- [ ] All features tested

---

**Your system is now ready for production! 🎉**
