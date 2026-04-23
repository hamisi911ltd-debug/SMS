# 🔒 Security Guidelines

## ⚠️ IMPORTANT SECURITY NOTICE

This repository contains a school management system. Please follow these security guidelines:

### 🚨 **NEVER COMMIT SECRETS**

**DO NOT commit any of the following to this repository:**
- Real database connection strings
- JWT secrets or session secrets
- API keys (M-Pesa, email, etc.)
- Passwords or authentication tokens
- SSL certificates or private keys
- Any `.env` files with real values

### ✅ **Safe Practices**

1. **Environment Variables**: Always use environment variables for secrets
2. **Example Files**: Only commit `.env.example` with placeholder values
3. **Documentation**: Use generic placeholders in documentation
4. **Local Development**: Create your own `.env` file locally (never commit it)

### 🔧 **Setting Up Secrets Safely**

#### For Local Development:
```bash
# Copy the example file
cp .env.example .env

# Edit .env with your real values (this file is gitignored)
nano .env
```

#### For Production (Railway):
```bash
# Set environment variables in Railway dashboard or CLI
railway variables set MONGODB_URI="your-real-mongodb-uri"
railway variables set JWT_SECRET="your-real-jwt-secret"
railway variables set SESSION_SECRET="your-real-session-secret"
```

### 🛡️ **Default Credentials**

The system includes default demo credentials for testing:
- **Admin**: `admin` / `admin123`
- **Teacher**: `john.teacher` / `teacher123`
- **Student**: `jane.student` / `student123`

**⚠️ CHANGE THESE IMMEDIATELY IN PRODUCTION!**

### 📋 **Security Checklist**

Before deploying to production:

- [ ] All secrets are set as environment variables
- [ ] Default passwords have been changed
- [ ] Database has proper authentication
- [ ] HTTPS is enabled
- [ ] CORS is properly configured
- [ ] Rate limiting is active
- [ ] Input validation is in place
- [ ] No sensitive data in logs

### 🚨 **If Secrets Are Exposed**

If you accidentally commit secrets:

1. **Immediately rotate all exposed secrets**
2. **Remove secrets from git history** (use `git filter-branch` or BFG)
3. **Update all systems using the old secrets**
4. **Review access logs for unauthorized usage**

### 📞 **Reporting Security Issues**

If you find security vulnerabilities:
1. Do NOT create a public issue
2. Contact the maintainers privately
3. Provide detailed information about the vulnerability
4. Allow time for the issue to be fixed before disclosure

### 🔗 **Resources**

- [OWASP Security Guidelines](https://owasp.org/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [MongoDB Security Checklist](https://docs.mongodb.com/manual/administration/security-checklist/)

---

**Remember: Security is everyone's responsibility!** 🛡️