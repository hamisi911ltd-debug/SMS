# Python Installation Guide for Windows

## 🎯 Goal
Install Python 3.11+ on your Windows system with proper PATH configuration.

---

## ✅ Recommended Method: Official Python Installer

### Step 1: Download Python

1. Go to **https://www.python.org/downloads/**
2. Click the yellow "Download Python 3.11.x" button
3. Save the installer file (e.g., `python-3.11.9-amd64.exe`)

### Step 2: Run Installer

1. **Double-click** the downloaded installer
2. **⚠️ CRITICAL**: Check the box "Add Python to PATH" at the bottom
3. Click "Install Now"
4. Wait for installation to complete
5. Click "Close" when done

### Step 3: Verify Installation

1. **Close all open terminals/PowerShell windows**
2. Open a **new PowerShell** or Command Prompt
3. Run:
   ```bash
   python --version
   ```
4. You should see: `Python 3.11.x`

---

## 🔧 Alternative Method 1: Winget (Windows Package Manager)

### Requirements
- Windows 10 1809 or later
- Winget installed (comes with Windows 11)

### Installation Steps

1. Open **PowerShell as Administrator**
2. Run:
   ```powershell
   winget install Python.Python.3.11
   ```
3. Wait for installation
4. Close and reopen terminal
5. Verify:
   ```bash
   python --version
   ```

---

## 🍫 Alternative Method 2: Chocolatey

### Requirements
- Chocolatey package manager installed

### Install Chocolatey First (if needed)

1. Open **PowerShell as Administrator**
2. Run:
   ```powershell
   Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
   ```

### Install Python with Chocolatey

1. Open **PowerShell as Administrator**
2. Run:
   ```powershell
   choco install python311
   ```
3. Close and reopen terminal
4. Verify:
   ```bash
   python --version
   ```

---

## 🐍 Alternative Method 3: Anaconda/Miniconda

### For Data Science Users

1. Download Anaconda from: https://www.anaconda.com/download
2. Run installer
3. Follow installation wizard
4. Open Anaconda Prompt
5. Create environment:
   ```bash
   conda create -n school_system python=3.11
   conda activate school_system
   ```

---

## 🔍 Troubleshooting

### Problem: "Python not found" after installation

**Solution 1: Manually Add to PATH**

1. Search for "Environment Variables" in Windows
2. Click "Environment Variables"
3. Under "System variables", find "Path"
4. Click "Edit"
5. Click "New"
6. Add these paths (adjust for your installation):
   ```
   C:\Users\YourUsername\AppData\Local\Programs\Python\Python311
   C:\Users\YourUsername\AppData\Local\Programs\Python\Python311\Scripts
   ```
7. Click OK on all dialogs
8. Restart computer

**Solution 2: Reinstall Python**

1. Uninstall current Python
2. Download fresh installer
3. Make sure to check "Add Python to PATH"
4. Install again

### Problem: Multiple Python versions

**Check which Python is being used:**
```bash
where python
```

**Use specific version:**
```bash
py -3.11 --version
```

### Problem: Permission denied

**Solution:**
Run PowerShell or Command Prompt as Administrator

### Problem: "python" command not recognized, but "py" works

**Solution:**
Use `py` instead of `python`:
```bash
py --version
py -m venv venv
py manage.py runserver
```

---

## ✅ Verification Checklist

After installation, verify everything works:

- [ ] `python --version` shows Python 3.11+
- [ ] `pip --version` shows pip version
- [ ] `python -m pip --version` works
- [ ] Can create virtual environment: `python -m venv test_venv`
- [ ] Can activate virtual environment: `.\test_venv\Scripts\activate`
- [ ] Can install packages: `pip install requests`

If all checks pass, you're ready to proceed with project setup!

---

## 🎓 Understanding Python PATH

### What is PATH?

PATH is an environment variable that tells Windows where to find executable programs.

### Why is it important?

Without Python in PATH:
- ❌ `python` command won't work
- ❌ `pip` command won't work
- ❌ Scripts can't find Python

With Python in PATH:
- ✅ `python` works from any folder
- ✅ `pip` works from any folder
- ✅ Scripts can find Python automatically

### How to check if Python is in PATH:

```bash
echo %PATH%
```

Look for entries containing "Python" or "Python311"

---

## 📦 What Gets Installed

When you install Python, you get:

1. **Python Interpreter** - Runs Python code
2. **pip** - Package installer
3. **IDLE** - Basic Python editor
4. **Python Launcher** - `py` command
5. **Standard Library** - Built-in modules
6. **Documentation** - Help files

---

## 🔄 Updating Python

### Check current version:
```bash
python --version
```

### To update:

**Method 1: Download new installer**
1. Download latest from python.org
2. Run installer
3. It will upgrade existing installation

**Method 2: Using winget**
```powershell
winget upgrade Python.Python.3.11
```

**Method 3: Using Chocolatey**
```powershell
choco upgrade python311
```

---

## 🗑️ Uninstalling Python

### Method 1: Windows Settings
1. Open Settings
2. Go to Apps
3. Find "Python 3.11.x"
4. Click Uninstall

### Method 2: Control Panel
1. Open Control Panel
2. Programs and Features
3. Find Python
4. Right-click > Uninstall

### Method 3: Using installer
1. Run the original installer again
2. Choose "Uninstall"

---

## 💡 Best Practices

1. **Always use virtual environments** - Don't install packages globally
2. **Keep Python updated** - Security and bug fixes
3. **Use one Python version** - Avoid conflicts
4. **Document your version** - In requirements.txt or runtime.txt
5. **Backup before major updates** - Save your projects

---

## 🎯 Recommended Setup for This Project

```
Python Version: 3.11.9 (or latest 3.11.x)
Installation Method: Official installer from python.org
PATH: ✅ Added during installation
Virtual Environment: Yes (created by setup script)
Package Manager: pip (comes with Python)
```

---

## 📞 Getting Help

### Official Resources
- Python Documentation: https://docs.python.org/3/
- Python Downloads: https://www.python.org/downloads/
- Python FAQ: https://docs.python.org/3/faq/

### Community Resources
- Stack Overflow: https://stackoverflow.com/questions/tagged/python
- Python Discord: https://discord.gg/python
- Reddit: r/learnpython

---

## ✨ Quick Reference

```bash
# Check Python version
python --version

# Check pip version
pip --version

# Create virtual environment
python -m venv venv

# Activate virtual environment (Windows)
.\venv\Scripts\activate

# Deactivate virtual environment
deactivate

# Install package
pip install package_name

# Install from requirements
pip install -r requirements.txt

# List installed packages
pip list

# Upgrade pip
python -m pip install --upgrade pip
```

---

## 🚀 Ready to Continue?

Once Python is installed and verified:

1. ✅ Close this guide
2. ✅ Open `START_HERE.md`
3. ✅ Run the setup script
4. ✅ Start developing!

---

**Good luck with your installation! 🎉**
