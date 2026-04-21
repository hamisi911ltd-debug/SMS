# 🔒 Security Guidelines

## ⚠️ IMPORTANT: Before Deployment

### 1. Environment Variables
**NEVER commit your `.env` file to version control!**

The `.env` file contains sensitive information:
- `SECRET_KEY` - Django secret key (must be unique and random)
- Database credentials
- Email passwords
- API keys

### 2. Generate a New SECRET_KEY

Before deploying, generate a new secret key:

```python
# Run this in Python shell
from django.core.management.utils import get_random_secret_key
print(get_random_secret_key())
```

Or use this command:
```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

### 3. Database Security

- **SQLite**: The `db.sqlite3` file is excluded from git (contains all user data)
- **Production**: Use PostgreSQL with strong credentials
- **Backups**: Regular backups are essential

### 4. Files Excluded from Git

These files are automatically excluded (see `.gitignore`):
- `.env` - Environment variables
- `db.sqlite3` - Database file
- `LOGIN_CREDENTIALS.txt` - Admin credentials
- `*.log` - Log files
- `media/` - User uploaded files
- `staticfiles/` - Collected static files

### 5. Production Checklist

Before deploying to production:

- [ ] Generate new `SECRET_KEY`
- [ ] Set `DEBUG=False`
- [ ] Configure proper `ALLOWED_HOSTS`
- [ ] Set up PostgreSQL database
- [ ] Configure email settings
- [ ] Enable HTTPS
- [ ] Set up proper CSRF_TRUSTED_ORIGINS
- [ ] Review security settings in `config/settings.py`
- [ ] Change default admin password
- [ ] Set up regular backups

### 6. Sensitive Data in This Repository

**What's Safe:**
- Source code
- Configuration templates (`.env.example`)
- Documentation
- Static assets

**What's NOT Safe (and excluded):**
- `.env` file with real credentials
- Database files
- User uploaded media
- Log files with sensitive data
- Credential files

### 7. If Secrets Were Exposed

If you accidentally committed secrets:

1. **Immediately rotate all credentials:**
   - Generate new SECRET_KEY
   - Change database passwords
   - Rotate API keys
   - Change admin passwords

2. **Remove from Git history:**
   ```bash
   # This is complex - consider creating a new repository
   git filter-branch --force --index-filter \
   "git rm --cached --ignore-unmatch .env" \
   --prune-empty --tag-name-filter cat -- --all
   ```

3. **Force push (WARNING: Destructive):**
   ```bash
   git push origin --force --all
   ```

### 8. Admin Credentials

- Default admin credentials should be changed immediately after first login
- Use strong passwords (minimum 12 characters, mixed case, numbers, symbols)
- Enable two-factor authentication if available
- Never share admin credentials via email or chat

### 9. Regular Security Practices

- Keep Django and dependencies updated
- Monitor security advisories
- Review access logs regularly
- Implement rate limiting
- Use HTTPS in production
- Regular security audits

### 10. Reporting Security Issues

If you discover a security vulnerability, please email: security@yourschool.com

**DO NOT** create public GitHub issues for security vulnerabilities.

---

## 🔐 Quick Security Setup

```bash
# 1. Copy example env file
cp .env.example .env

# 2. Generate new secret key
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"

# 3. Update .env with the new key
# Edit .env and replace SECRET_KEY value

# 4. Never commit .env
git status  # Should NOT show .env file

# 5. For production, set environment variables directly on hosting platform
```

---

**Remember: Security is not a one-time setup, it's an ongoing process!**
