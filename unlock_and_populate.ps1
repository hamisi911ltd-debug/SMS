# Kill all Python processes
Get-Process python* -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 3

# Delete database
Remove-Item "db.sqlite3" -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 1

# Recreate and populate
& ".\venv\Scripts\python.exe" manage.py migrate --run-syncdb
& ".\venv\Scripts\python.exe" manage.py populate_sample_data

Write-Host "Database populated successfully!" -ForegroundColor Green
