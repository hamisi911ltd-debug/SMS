# Installation Checklist ✅

Follow this checklist step by step. Check off each item as you complete it.

---

## Phase 1: Python Installation

- [ ] **Download Python 3.11+** from https://www.python.org/downloads/
- [ ] **Run Python installer**
- [ ] **✅ CRITICAL: Check "Add Python to PATH"** during installation
- [ ] **Complete installation**
- [ ] **Close all terminal windows**
- [ ] **Open new PowerShell/Command Prompt**
- [ ] **Verify installation**: Run `python --version`
  - Expected output: `Python 3.11.x` or higher
  - If not working, try: `python3 --version` or `py --version`

---

## Phase 2: Project Setup

- [ ] **Navigate to project folder** in terminal
  ```bash
  cd "C:\Users\Admin\OneDrive - Equity Bank (Kenya) Limited~\Desktop\SCHLP DOCS\my codes\SCHOOL MANAGEMENT SYSTEM\KENYAN-SCHOOLS-ADMINISTRATION-SYSTEM"
  ```

- [ ] **Run setup script** (choose one):
  - PowerShell: `.\setup.ps1`
  - Batch: `setup.bat`
  - Manual: Follow `SETUP_GUIDE.md`

- [ ] **Wait for setup to complete** (may take 5-10 minutes)

---

## Phase 3: Verification

- [ ] **Check virtual environment created**: Look for `venv` folder
- [ ] **Activate virtual environment**: `.\venv\Scripts\activate`
  - You should see `(venv)` in your prompt
- [ ] **Verify Django installed**: `python -m django --version`
  - Expected: `5.2.11`
- [ ] **Check database**: Look for `db.sqlite3` file
- [ ] **Verify migrations**: `python manage.py showmigrations`
  - All should have `[X]` marks

---

## Phase 4: Create Admin User

- [ ] **Create superuser**: `python manage.py createsuperuser`
  - Username: (your choice)
  - Email: (your choice)
  - Password: (your choice - remember this!)

OR

- [ ] **Use existing admin**: Username: `eugen`, Password: `38624586`

---

## Phase 5: Populate Data

- [ ] **Run sample data script**: `python manage.py populate_sample_data`
- [ ] **Wait for completion** (may take 2-3 minutes)
- [ ] **Verify data created**:
  ```bash
  python manage.py shell
  >>> from students.models import Student
  >>> Student.objects.count()
  >>> exit()
  ```

---

## Phase 6: Start Server

- [ ] **Start development server**: `python manage.py runserver`
- [ ] **Check for errors** in terminal output
- [ ] **Open browser** to http://127.0.0.1:8000
- [ ] **Verify homepage loads**

---

## Phase 7: Test Login

- [ ] **Go to admin panel**: http://127.0.0.1:8000/admin/
- [ ] **Login with admin credentials**
- [ ] **Verify you can see**:
  - [ ] Users
  - [ ] Students
  - [ ] Teachers
  - [ ] Academic Years
  - [ ] Subjects
  - [ ] Classes

- [ ] **Test teacher login**: http://127.0.0.1:8000/
  - Username: `john.teacher`
  - Password: `Mwangi@2024!`

- [ ] **Test student login**: http://127.0.0.1:8000/
  - Username: `james.student`
  - Password: `Odhiambo@2024`

---

## Phase 8: Verify Modules

- [ ] **Dashboard** - Check role-based dashboards load
- [ ] **Students** - View student list
- [ ] **Teachers** - View teacher list
- [ ] **Academics** - Check academic years, terms, subjects
- [ ] **Classes** - Verify classes exist
- [ ] **Attendance** - Check attendance module
- [ ] **Finance** - View fee structures
- [ ] **Messaging** - Test messaging system
- [ ] **Reports** - Try generating a report

---

## Common Issues & Solutions

### ❌ Python not found
**Solution**: 
1. Reinstall Python with "Add to PATH" checked
2. Restart computer
3. Try again

### ❌ Virtual environment won't activate
**Solution**:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### ❌ pip install fails
**Solution**:
```bash
python -m pip install --upgrade pip
pip install -r requirements.txt --no-cache-dir
```

### ❌ Migration errors
**Solution**:
```bash
python manage.py migrate --run-syncdb
```

### ❌ Port 8000 already in use
**Solution**:
```bash
python manage.py runserver 8080
```

### ❌ Static files not loading
**Solution**:
```bash
python manage.py collectstatic --clear
python manage.py collectstatic --noinput
```

---

## Success Criteria ✅

You've successfully set up the system when:

✅ Python is installed and accessible
✅ Virtual environment is created and activated
✅ All dependencies are installed
✅ Database migrations are applied
✅ Admin user exists
✅ Sample data is populated
✅ Development server runs without errors
✅ You can login to admin panel
✅ You can login as teacher
✅ You can login as student
✅ All modules are accessible

---

## What's Next?

Once everything is checked off:

1. **Explore the admin panel** - Familiarize yourself with the interface
2. **Review the data** - Check students, teachers, classes
3. **Test features** - Try attendance, results entry, messaging
4. **Customize** - Add your school's data
5. **Deploy** - When ready, deploy to Railway or other hosting

---

## Need Help?

- 📖 Read `SETUP_GUIDE.md` for detailed instructions
- 🚀 Check `QUICK_START.md` for common commands
- 📝 Review `README.md` for system overview
- 🐛 Check error messages carefully
- 💬 Ask for help with specific error messages

---

**Current Status**: ⬜ Not Started | 🟡 In Progress | ✅ Complete

Mark your overall progress:
- [ ] Phase 1: Python Installation
- [ ] Phase 2: Project Setup
- [ ] Phase 3: Verification
- [ ] Phase 4: Create Admin User
- [ ] Phase 5: Populate Data
- [ ] Phase 6: Start Server
- [ ] Phase 7: Test Login
- [ ] Phase 8: Verify Modules

**Good luck! 🎉**
