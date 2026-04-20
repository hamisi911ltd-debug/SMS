# Kenyan Schools System - Automated Setup Script
# Run this script after installing Python

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Kenyan Schools System - Setup Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Python is installed
Write-Host "Step 1: Checking Python installation..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✓ Python found: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Python not found!" -ForegroundColor Red
    Write-Host "Please install Python first. See SETUP_GUIDE.md" -ForegroundColor Red
    exit 1
}

# Check Python version
$versionMatch = $pythonVersion -match "Python (\d+)\.(\d+)"
if ($versionMatch) {
    $major = [int]$Matches[1]
    $minor = [int]$Matches[2]
    
    if ($major -lt 3 -or ($major -eq 3 -and $minor -lt 10)) {
        Write-Host "✗ Python 3.10+ required. You have Python $major.$minor" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""

# Create virtual environment
Write-Host "Step 2: Creating virtual environment..." -ForegroundColor Yellow
if (Test-Path "venv") {
    Write-Host "Virtual environment already exists. Skipping..." -ForegroundColor Gray
} else {
    python -m venv venv
    Write-Host "✓ Virtual environment created" -ForegroundColor Green
}

Write-Host ""

# Activate virtual environment
Write-Host "Step 3: Activating virtual environment..." -ForegroundColor Yellow
& .\venv\Scripts\Activate.ps1
Write-Host "✓ Virtual environment activated" -ForegroundColor Green

Write-Host ""

# Upgrade pip
Write-Host "Step 4: Upgrading pip..." -ForegroundColor Yellow
python -m pip install --upgrade pip --quiet
Write-Host "✓ pip upgraded" -ForegroundColor Green

Write-Host ""

# Install dependencies
Write-Host "Step 5: Installing dependencies (this may take a few minutes)..." -ForegroundColor Yellow
pip install -r requirements.txt --quiet
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Dependencies installed" -ForegroundColor Green
} else {
    Write-Host "✗ Failed to install dependencies" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Create .env file if it doesn't exist
Write-Host "Step 6: Setting up environment variables..." -ForegroundColor Yellow
if (Test-Path ".env") {
    Write-Host ".env file already exists. Skipping..." -ForegroundColor Gray
} else {
    Copy-Item ".env.example" ".env"
    Write-Host "✓ .env file created from .env.example" -ForegroundColor Green
    Write-Host "  Please edit .env file with your settings" -ForegroundColor Cyan
}

Write-Host ""

# Run migrations
Write-Host "Step 7: Running database migrations..." -ForegroundColor Yellow
python manage.py migrate --noinput
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Database migrations completed" -ForegroundColor Green
} else {
    Write-Host "✗ Migration failed" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Collect static files
Write-Host "Step 8: Collecting static files..." -ForegroundColor Yellow
python manage.py collectstatic --noinput --clear
Write-Host "✓ Static files collected" -ForegroundColor Green

Write-Host ""

# Check if superuser exists
Write-Host "Step 9: Admin user setup..." -ForegroundColor Yellow
Write-Host "Would you like to create a superuser now? (Y/N)" -ForegroundColor Cyan
$createSuperuser = Read-Host
if ($createSuperuser -eq "Y" -or $createSuperuser -eq "y") {
    python manage.py createsuperuser
} else {
    Write-Host "Skipping superuser creation. You can create one later with:" -ForegroundColor Gray
    Write-Host "  python manage.py createsuperuser" -ForegroundColor Gray
}

Write-Host ""

# Ask about sample data
Write-Host "Step 10: Sample data..." -ForegroundColor Yellow
Write-Host "Would you like to populate sample data? (Y/N)" -ForegroundColor Cyan
$populateData = Read-Host
if ($populateData -eq "Y" -or $populateData -eq "y") {
    python manage.py populate_sample_data
    Write-Host "✓ Sample data populated" -ForegroundColor Green
} else {
    Write-Host "Skipping sample data. You can populate later with:" -ForegroundColor Gray
    Write-Host "  python manage.py populate_sample_data" -ForegroundColor Gray
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "To start the development server:" -ForegroundColor Yellow
Write-Host "  1. Activate virtual environment: .\venv\Scripts\activate" -ForegroundColor White
Write-Host "  2. Run server: python manage.py runserver" -ForegroundColor White
Write-Host "  3. Visit: http://127.0.0.1:8000" -ForegroundColor White
Write-Host ""
Write-Host "Login credentials from README.md:" -ForegroundColor Yellow
Write-Host "  Admin: eugen / 38624586" -ForegroundColor White
Write-Host "  Teacher: john.teacher / Mwangi@2024!" -ForegroundColor White
Write-Host "  Student: james.student / Odhiambo@2024" -ForegroundColor White
Write-Host ""
