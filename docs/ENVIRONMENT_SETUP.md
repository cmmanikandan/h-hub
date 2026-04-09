# 🔧 Environment Configuration Guide

## Overview
This guide explains how to configure environment variables for the H-Hub E-Commerce Platform.

## Location
Create a `.env` file in the **`server/`** folder of your project:
```
hub-new/
├── server/
│   ├── .env          ← Create this file here
│   ├── index.js
│   ├── db.js
│   └── package.json
```

## Configuration Variables

### 📧 Email (SMTP) Configuration

#### Gmail Setup (Recommended)
```env
SMTP_USER=your-email@gmail.com
SMTP_PASS=xxxx-yyyy-zzzz-wwww
```

**Steps:**
1. Enable 2-Factor Authentication: https://myaccount.google.com/security
2. Generate App Password: https://myaccount.google.com/apppasswords
3. Copy the 16-character password
4. Paste into `.env` as `SMTP_PASS`

#### Alternative SMTP Services
```env
# SendGrid
SMTP_USER=apikey
SMTP_PASS=SG.your-api-key-here

# Outlook
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password

# Custom SMTP Server
SMTP_USER=your-username
SMTP_PASS=your-password
```

---

### 🗄️ Database Configuration

#### MySQL Configuration
```env
DB_DIALECT=mysql
DB_HOST=localhost
DB_USER=root
DB_PASS=your_database_password
DB_NAME=hub_db
```

#### SQLite Configuration (Default)
```env
DB_DIALECT=sqlite
# No other DB variables needed for SQLite
```

---

## 🔐 Security Best Practices

❌ **DO NOT:**
- Commit `.env` file to Git
- Share `.env` file publicly
- Use weak passwords
- Use production passwords in development

✅ **DO:**
- Add `.env` to `.gitignore`
- Use strong, unique passwords
- Keep `.env` file local only
- Rotate passwords regularly
- Use environment-specific `.env` files

---

## 📝 Sample `.env` File

```env
# ============================================
# EMAIL CONFIGURATION (SMTP)
# ============================================
SMTP_USER=noreply@hhub.in
SMTP_PASS=xxxx-xxxx-xxxx-xxxx

# ============================================
# DATABASE CONFIGURATION
# ============================================
DB_DIALECT=mysql
DB_HOST=localhost
DB_USER=root
DB_PASS=CMMANI02
DB_NAME=hub_db

# ============================================
# SERVER CONFIGURATION (Optional)
# ============================================
NODE_ENV=development
PORT=5000
API_URL=http://localhost:5000

# ============================================
# FEATURE FLAGS (Optional)
# ============================================
ENABLE_OTP_DELIVERY=true
ENABLE_EMAIL_VERIFICATION=true
ENABLE_SMS_ALERTS=false
```

---

## 🚀 Deployment Configuration

### Development (.env.development)
```env
SMTP_USER=dev@example.com
SMTP_PASS=dev-password
DB_DIALECT=sqlite
NODE_ENV=development
```

### Production (.env.production)
```env
SMTP_USER=noreply@hhub.com
SMTP_PASS=strong-production-password
DB_DIALECT=mysql
DB_HOST=db.hhub.com
DB_USER=hhub_user
DB_PASS=strong-secure-password
DB_NAME=hhub_production
NODE_ENV=production
```

---

## ⚙️ Configuration by Feature

### OTP Delivery Verification
**Required Variables:**
- `SMTP_USER` - Email address for sending OTPs
- `SMTP_PASS` - Password for email account

**Features:**
- Delivery personnel can initiate delivery
- OTP sent to customer's email
- Secure delivery confirmation

### Database Persistence
**Required Variables:**
- `DB_DIALECT` - `mysql` or `sqlite`
- For MySQL: `DB_HOST`, `DB_USER`, `DB_PASS`, `DB_NAME`

---

## 🧪 Testing Configuration

### Test Email Verification
```env
SMTP_USER=test-email@gmail.com
SMTP_PASS=test-app-password
```

**Test Flow:**
1. Register with a test email
2. System sends OTP to test email
3. Use OTP to verify account

### Development Email Mode
If no `SMTP_USER` is set:
```env
# SMTP_USER and SMTP_PASS are commented out or empty
# System runs in development mode:
# - Emails are NOT sent
# - OTP codes are logged to console
# - Perfect for testing without real emails
```

---

## 📋 Troubleshooting

### Issue: "SMTP Connection Error"
**Solution:**
- Verify `SMTP_USER` and `SMTP_PASS` are correct
- Check internet connection
- Ensure Gmail account has App Passwords enabled
- Verify firewall allows SMTP connections

### Issue: "Database Connection Failed"
**Solution:**
- Check MySQL is running: `mysql -u root -p`
- Verify `DB_HOST` is correct (usually `localhost`)
- Verify `DB_USER` and `DB_PASS` are correct
- Check database exists: `CREATE DATABASE hub_db;`

### Issue: "OTP Not Sent"
**Solution:**
- Check `SMTP_USER` and `SMTP_PASS` are set
- Verify customer email is valid
- Check server logs for SMTP errors
- Try sending test email from Gmail account

---

## 📚 Related Documentation

- [RUN_GUIDE.txt](../RUN_GUIDE.txt) - Quick start guide
- [DELIVERY_OTP_VERIFICATION.md](./DELIVERY_OTP_VERIFICATION.md) - OTP system details
- [PRICING_CALCULATOR.md](./PRICING_CALCULATOR.md) - Pricing configuration

---

**Last Updated:** February 5, 2026
**Status:** ✅ Active
