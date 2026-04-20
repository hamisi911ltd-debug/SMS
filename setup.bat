@echo off
REM Kenyan Schools System - Setup Script (Batch version)
REM Run this if PowerShell script doesn't work

echo ========================================
echo Kenyan Schools System - Setup Script
echo ========================================
echo.

REM Check Python
echo Step 1: Checking Python installation...
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python not found!
    echo Please install Python first. See SETUP_GUIDE.md
    pause
    exit /b 1
)
echo [OK] Python found
echo.

REM Create virtual environment
echo Step 2: Creating virtual environment...
if exist venv (
    echo Virtual environment already exists. Skipping...
) else (
    python -m venv venv
    echo [OK] Virtual environment created
)
echo.

REM Activate virtual environment
echo Step 3: Activating virtual environment...
call venv\Scripts\activate.bat
echo [OK] Virtual environment activated
echo.

REM Upgrade pip
echo Step 4: Upgrading pip...
python -m pip install --upgrade pip --quiet
echo [OK] pip upgraded
echo.

REM Install dependencies
echo Step 5: Installing dependencies (this may take a few minutes)...
pip install -r requirements.txt
if errorlevel 1 (
    echo [ERROR] Failed to install dependencies
    pause
    exit /b 1
)
echo [OK] Dependencies installed
echo.

REM Create .env file
echo Step 6: Setting up environment variables...
if exist .env (
    echo .env file already exists. Skipping...
) else (
    copy .env.example .env
    echo [OK] .env file created
)
echo.

REM Run migrations
echo Step 7: Running database migrations...
python manage.py migrate --noinput
if errorlevel 1 (
    echo [ERROR] Migration failed
    pause
    exit /b 1
)
echo [OK] Database migrations completed
echo.

REM Collect static files
echo Step 8: Collecting static files...
python manage.py collectstatic --noinput --clear
echo [OK] Static files collected
echo.

echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo To start the development server:
echo   1. Activate virtual environment: venv\Scripts\activate
echo   2. Run server: python manage.py runserver
echo   3. Visit: http://127.0.0.1:8000
echo.
echo You can create a superuser with:
echo   python manage.py createsuperuser
echo.
echo You can populate sample data with:
echo   python manage.py populate_sample_data
echo.
pause
