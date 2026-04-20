# Python Setup Guide for Kenyan Schools System

## Current Issue
You have the Windows Store Python placeholder, not actual Python installed.

## Step 1: Install Python

### Option A: Download from Python.org (Recommended)
1. Go to https://www.python.org/downloads/
2. Download Python 3.11.9 or later (3.11.x recommended for Django 5.2)
3. Run the installer
4. **IMPORTANT**: Check "Add Python to PATH" during installation
5. Click "Install Now"

### Option B: Using Winget (Windows Package Manager)
Open PowerShell as Administrator and run:
```powershell
winget install Python.Python.3.11
```

### Option C: Using Chocolatey
If you have Chocolatey installed:
```powershell
choco install python311
```

## Step 2: Verify Python Installation

After installation, close and reopen your terminal, then run:
```bash
python --version
```

You should see: `Python 3.11.x`

## Step 3: Create Virtual Environment

Navigate to your project directory and create a virtual environment:

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
.\venv\Scripts\activate

# You should see (venv) in your prompt
```

## Step 4: Upgrade pip

```bash
python -m pip install --upgrade pip
```

## Step 5: Install Project Dependencies

```bash
pip install -r requirements.txt
```

This will install all required packages including:
- Django 5.2.11
- Channels (WebSocket support)
- Redis support
- PostgreSQL driver
- PDF generation libraries
- And more...

## Step 6: Set Up Environment Variables

Create a `.env` file in your project root:

```bash
# Copy the example below and save as .env
```

## Step 7: Run Database Migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

## Step 8: Create Superuser (Admin)

```bash
python manage.py createsuperuser
```

Follow the prompts to create your admin account.

## Step 9: Populate Sample Data

```bash
python manage.py populate_sample_data
```

## Step 10: Run the Development Server

```bash
python manage.py runserver
```

Visit: http://127.0.0.1:8000

## Troubleshooting

### If Python command not found after installation:
1. Close all terminals
2. Open new PowerShell/Command Prompt
3. Try again

### If "python" doesn't work, try:
- `python3`
- `py`
- `py -3.11`

### If virtual environment activation fails:
You may need to enable script execution:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

## Quick Start Commands (After Setup)

```bash
# Activate virtual environment
.\venv\Scripts\activate

# Run server
python manage.py runserver

# Create migrations
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Create admin user
python manage.py createsuperuser

# Collect static files
python manage.py collectstatic

# Run tests
python manage.py test
```

## Next Steps

Once Python is installed and working, I'll help you:
1. Set up the database properly
2. Create comprehensive sample data
3. Configure Redis (optional for development)
4. Set up the admin interface
5. Test all modules

---

**Need Help?** Let me know which installation method you prefer, and I'll guide you through it!
