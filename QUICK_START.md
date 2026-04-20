# Quick Start Guide

## 🚀 First Time Setup

### 1. Install Python
Download and install Python 3.11+ from https://www.python.org/downloads/
**IMPORTANT**: Check "Add Python to PATH" during installation!

### 2. Run Setup Script
Choose one method:

**Method A - PowerShell (Recommended):**
```powershell
.\setup.ps1
```

**Method B - Batch File:**
```cmd
setup.bat
```

**Method C - Manual Setup:**
See `SETUP_GUIDE.md` for detailed manual instructions.

---

## 📋 Daily Development Workflow

### Start Working
```bash
# 1. Activate virtual environment
.\venv\Scripts\activate

# 2. Start development server
python manage.py runserver

# 3. Open browser to http://127.0.0.1:8000
```

### Stop Working
```bash
# Press Ctrl+C to stop server
# Type 'deactivate' to exit virtual environment
deactivate
```

---

## 🔑 Default Login Credentials

### Admin
- Username: `eugen`
- Password: `38624586`
- URL: http://127.0.0.1:8000/admin/

### Teacher
- Username: `john.teacher`
- Password: `Mwangi@2024!`
- URL: http://127.0.0.1:8000/

### Student
- Username: `james.student`
- Password: `Odhiambo@2024`
- URL: http://127.0.0.1:8000/

---

## 🛠️ Common Commands

### Database
```bash
# Create migrations after model changes
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Reset database (WARNING: Deletes all data!)
python manage.py flush
```

### User Management
```bash
# Create superuser
python manage.py createsuperuser

# Create admin user
python manage.py create_admin

# Change user password
python manage.py changepassword username
```

### Data Management
```bash
# Populate sample data
python manage.py populate_sample_data

# Import students from CSV
python manage.py import_students path/to/file.csv

# Generate fee invoices
python manage.py generate_fees
```

### Static Files
```bash
# Collect static files
python manage.py collectstatic

# Clear collected static files
python manage.py collectstatic --clear
```

### Development
```bash
# Run development server
python manage.py runserver

# Run on specific port
python manage.py runserver 8080

# Run on all interfaces
python manage.py runserver 0.0.0.0:8000

# Run tests
python manage.py test

# Run specific app tests
python manage.py test academics

# Check for issues
python manage.py check
```

### Shell Access
```bash
# Django shell
python manage.py shell

# Database shell
python manage.py dbshell
```

---

## 📁 Project Structure

```
kenyan_schools_system/
├── accounts/          # User management, authentication
├── students/          # Student profiles, clubs, sports
├── teachers/          # Teacher profiles, leave, salary
├── academics/         # Classes, subjects, exams, results
├── finance/           # Fees, payments, M-Pesa
├── attendance/        # Student & teacher attendance
├── messaging/         # Internal messaging system
├── dashboard/         # Role-based dashboards
├── reports/           # PDF report generation
├── config/            # Django settings
├── static/            # CSS, JS, images
├── templates/         # HTML templates
├── media/             # Uploaded files
├── venv/              # Virtual environment (created by setup)
├── manage.py          # Django management script
└── requirements.txt   # Python dependencies
```

---

## 🐛 Troubleshooting

### Python not found
- Close and reopen terminal after Python installation
- Check "Add Python to PATH" was selected during install
- Try `python3` or `py` instead of `python`

### Virtual environment activation fails
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Port already in use
```bash
# Use different port
python manage.py runserver 8080
```

### Database locked error
- Close all connections to database
- Stop any running Django servers
- Delete `db.sqlite3` and run migrations again

### Static files not loading
```bash
python manage.py collectstatic --clear
python manage.py collectstatic
```

### Module not found error
```bash
# Ensure virtual environment is activated
.\venv\Scripts\activate

# Reinstall dependencies
pip install -r requirements.txt
```

---

## 📚 Useful URLs

- **Homepage**: http://127.0.0.1:8000/
- **Admin Panel**: http://127.0.0.1:8000/admin/
- **API Docs**: http://127.0.0.1:8000/api/
- **Student Dashboard**: http://127.0.0.1:8000/dashboard/student/
- **Teacher Dashboard**: http://127.0.0.1:8000/dashboard/teacher/
- **Admin Dashboard**: http://127.0.0.1:8000/dashboard/admin/

---

## 🎯 Next Steps After Setup

1. ✅ Login to admin panel
2. ✅ Create academic year and terms
3. ✅ Add subjects
4. ✅ Create classes (Form 1-4 with streams)
5. ✅ Add teachers and assign subjects
6. ✅ Add students
7. ✅ Set up fee structures
8. ✅ Configure attendance sessions
9. ✅ Test all modules

---

## 💡 Tips

- Always activate virtual environment before working
- Run migrations after pulling code changes
- Backup database before major changes
- Use admin panel for quick data entry
- Check logs folder for error details
- Keep requirements.txt updated

---

**Need Help?** Check `SETUP_GUIDE.md` for detailed instructions!
