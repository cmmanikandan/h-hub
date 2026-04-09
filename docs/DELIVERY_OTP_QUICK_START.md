# 🚚 Delivery OTP - Quick Start Guide

## What is it?
A secure verification system that sends a One-Time Password (OTP) to the customer's email when delivery personnel is about to complete a delivery. This ensures only authorized deliveries are confirmed.

---

## 🎯 Quick Setup (2 Minutes)

### Step 1: Configure Email (Development)
**For testing without actual emails:**
1. Just run the system normally
2. OTP will be printed in the server console
3. Use that code to test

### Step 2: Configure Email (Production)
To send real emails:

1. **Get Gmail App Password:**
   - Open: https://myaccount.google.com/apppasswords
   - Select "Mail" and "Windows Computer"
   - Copy the 16-character password

2. **Create `.env` file in `server/` folder:**
   ```env
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=xxxx-yyyy-zzzz-wwww
   DB_DIALECT=mysql
   DB_HOST=localhost
   DB_USER=root
   DB_PASS=CMMANI02
   DB_NAME=hub_db
   ```

3. **Restart the server:**
   - Stop current server
   - Run `npm start` again
   - Check for connection message

### Step 3: Test the Feature
1. Login as delivery personnel
2. Accept an order
3. Click "Deliver Order" button
4. OTP modal appears
5. OTP sent to customer's email
6. Enter code to complete delivery

---

## 📧 How It Works

### For Delivery Personnel
```
1. Accept Order
   ↓
2. Click "Deliver Order"
   ↓
3. OTP Modal Opens
   ↓
4. OTP Sent to Customer Email
   ↓
5. Customer Provides Code
   ↓
6. Enter Code & Verify
   ↓
7. Delivery Complete ✅
```

### For Customers
```
1. Order Ready for Delivery
   ↓
2. Email Received with OTP
   ↓
3. Share Code with Delivery Person
   ↓
4. Delivery Confirmed
   ↓
5. Notifications Sent
```

---

## 🔐 OTP Codes

### Development Mode
**No Gmail setup needed:**
- OTP appears in server console
- Example: `1234`
- Use for testing without email

### Production Mode
**With Gmail configured:**
- OTP sent to customer's registered email
- 4-digit random code
- Valid for 10 minutes
- Used once and discarded

---

## ✅ Verification Flow

### Correct Code
```
Enter: 1234
Server: "OTP Verified ✅"
Result: Order marked as Delivered
Earned: Delivery charges credited
```

### Wrong Code
```
Enter: 5678
Server: "Invalid OTP ❌"
Result: Try again
Hint: Ask customer to check email
```

---

## 🧪 Test Scenarios

### Scenario 1: Development Testing
```
1. Start system without .env email
2. Accept order
3. Click "Deliver Order"
4. Check server console for OTP
5. Enter OTP in modal
6. ✅ Delivery complete
No email needed!
```

### Scenario 2: Production Testing
```
1. Configure .env with Gmail
2. Accept order
3. Click "Deliver Order"
4. Check customer email inbox
5. Share code with customer
6. Customer provides code
7. Enter OTP in modal
8. ✅ Delivery complete & Earnings added
```

### Scenario 3: OTP Expiry
```
1. OTP sent and generated
2. Wait 10+ minutes
3. Enter old OTP
4. ❌ Invalid OTP error
5. Request new OTP
6. Use fresh OTP
```

---

## ⚡ Common Issues & Fixes

### "OTP Not Showing"
**Development Mode:**
- Look at server console output
- Check for lines with "🚚 DELIVERY OTP"

**Production Mode:**
- Check customer's email inbox/spam folder
- Verify Gmail app password is correct
- Check SMTP_USER and SMTP_PASS in .env

### "Invalid OTP Error"
- Double-check digits
- Ensure customer reading correct code
- Request new OTP if expired
- Check order ID matches

### "Email Not Sending"
- Verify .env has SMTP_USER and SMTP_PASS
- Check internet connection
- Ensure Gmail has App Passwords enabled
- Restart server after .env changes

---

## 📊 Data Flow

```
Delivery Personnel Action
│
├─→ "Deliver Order" Button Clicked
│   │
│   ├─→ POST /api/orders/{orderId}/send-delivery-otp
│   │   │
│   │   ├─ Generate OTP: 1234
│   │   ├─ Store in Memory
│   │   ├─ Get Customer Email
│   │   ├─ Send Email with OTP
│   │   └─ Return Success + (devOtp if dev mode)
│   │
│   └─ OTP Modal Opens
│       │
│       └─ Waiting for OTP Input
│
└─→ Customer Code Entry
    │
    ├─→ Enter Code in Modal
    │
    ├─→ PUT /api/orders/{orderId}/deliver
    │   │
    │   ├─ Verify OTP
    │   ├─ Mark Order as Delivered
    │   ├─ Award SuperCoins
    │   ├─ Credit Earnings
    │   ├─ Send Notifications
    │   └─ Return Success
    │
    └─ ✅ Delivery Complete
       │
       └─ Earnings Updated!
```

---

## 🎓 Learning Path

**Just Want It Working?**
1. Read this guide
2. Run system with DEV mode (no email setup)
3. Test with OTP from console

**Want Production Setup?**
1. Complete this guide
2. Read ENVIRONMENT_SETUP.md
3. Configure .env with Gmail
4. Test with real emails

**Want Deep Dive?**
1. Read DELIVERY_OTP_VERIFICATION.md
2. Check server/index.js (lines 1633-1730)
3. Check src/pages/DeliveryDashboard.jsx
4. Customize email template as needed

---

## 🚀 Next Steps

1. **Read Full Documentation:**
   - `/docs/DELIVERY_OTP_VERIFICATION.md` - Complete system details
   - `/docs/ENVIRONMENT_SETUP.md` - Email configuration guide

2. **Setup Email (Optional):**
   - Enable 2FA on Gmail
   - Generate App Password
   - Add to .env file
   - Restart server

3. **Test Thoroughly:**
   - Try development mode first
   - Move to production mode
   - Test error scenarios
   - Monitor email delivery

4. **Monitor & Maintain:**
   - Check server logs
   - Monitor email delivery
   - Collect feedback from delivery personnel
   - Update email template as needed

---

## 🆘 Support

**For Issues:**
1. Check server console output
2. Review `DELIVERY_OTP_VERIFICATION.md` Troubleshooting section
3. Check `ENVIRONMENT_SETUP.md` for email config
4. Contact support: support@hhub.com

**For Customization:**
- Email template: `server/index.js` lines 1680-1720
- OTP length: Change `Math.floor(1000 + Math.random() * 9000)` in line 1644
- OTP expiry: Implement in `otpStore` management

---

**Make Deliveries Secure & Verifiable! 🔐**

Last Updated: February 5, 2026
