# 🧮 Pricing Calculator - Quick Reference Card

## Based on Your Screenshot Example

### Input Values
```
Seller Price:     ₹1000.00
Packing Cost:     ₹30.00
Shipping Cost:    ₹50.00
Distance:         10 km
Payment Type:     COD
Quantity:         1
```

---

## 💰 PRICE BREAKDOWN

### Step 1: Subtotal
```
Seller Price          ₹1000.00
Packing Cost          ₹30.00
Shipping Cost         ₹50.00
─────────────────────────────
Sub Total             ₹1080.00
```

### Step 2: Platform Charges
```
Auto Profit (20%)     ₹200.00  (20% of ₹1000)
Ads Cost              ₹70.00   (fixed)
```

### Step 3: GST Calculation
```
GST Base = ₹1080 + ₹200 + ₹70 = ₹1350
GST (18%)             ₹243.00  (18% of ₹1350)
```

### Step 4: Delivery Charges
```
Delivery Charge       ₹45.00   (based on distance & value)
Fuel Deduction        -₹50.00  (10 km × ₹5/km)
```

### Step 5: Raw Total
```
₹1080 + ₹200 + ₹70 + ₹243 + ₹45 = ₹1638.00
```

### Step 6: Final Price (After Rounding)
```
Rounding Strategy     nearest_10
Final Website Price   ₹1640.00
```

---

## 💸 SETTLEMENT PREVIEW

### Distribution of ₹1640

```
┌─────────────────────────────────────┐
│  Seller Gets        ₹1080.00  (66%) │
│  ├─ Seller Price    ₹1000.00        │
│  ├─ Packing Cost    ₹30.00          │
│  └─ Shipping Cost   ₹50.00          │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  Delivery Man Gets  ₹-5.00   (-0%)  │
│  ├─ Delivery Charge ₹45.00          │
│  └─ Fuel Cost       -₹50.00         │
└─────────────────────────────────────┘
⚠️ WARNING: Negative earnings!

┌─────────────────────────────────────┐
│  Admin Gets         ₹565.00   (34%) │
│  ├─ Auto Profit     ₹200.00         │
│  ├─ Ads Cost        ₹70.00          │
│  ├─ GST             ₹243.00         │
│  ├─ Fuel Recovery   ₹50.00          │
│  └─ Rounding Adj    ₹2.00           │
└─────────────────────────────────────┘

Total: ₹1080 + (-₹5) + ₹565 = ₹1640 ✓
```

---

## 🪙 SUPERCOINS EARNED

```
From Rounding:        2 coins   (₹1640 - ₹1638)
From Order Value:     33 coins  (₹1640 × 2%)
─────────────────────────────────────────────
Total SuperCoins:     35 coins

* Credited after delivery
* 1 coin = ₹1 for future purchases
```

---

## 💳 PAYMENT FLOW

**COD (Cash on Delivery):**
```
Customer → Delivery Man → Admin → Settlement Split
```

**Online Payment:**
```
Customer → Payment Gateway → Admin → Settlement Split
```

---

## 📊 Visual Breakdown

```
Customer Pays: ₹1640
│
├─ ₹1080 → Seller
│   ├─ ₹1000 (Product)
│   ├─ ₹30   (Packing)
│   └─ ₹50   (Shipping)
│
├─ ₹-5 → Delivery Man (LOSS!)
│   ├─ +₹45  (Delivery Fee)
│   └─ -₹50  (Fuel Cost)
│
└─ ₹565 → Admin
    ├─ ₹200 (Profit)
    ├─ ₹70  (Ads)
    ├─ ₹243 (GST - to govt)
    ├─ ₹50  (Fuel recovery)
    └─ ₹2   (Rounding)
```

---

## 🔍 Why Delivery Man Gets Negative?

**Problem:**
- Distance: 10 km
- Fuel Cost: 10 × ₹5 = ₹50
- Delivery Charge: ₹45 (calculated by system)
- Net: ₹45 - ₹50 = **-₹5**

**Solutions:**
1. Increase base delivery charge
2. Reduce fuel rate
3. Add distance-based minimum charge
4. Limit delivery radius
5. Adjust delivery charge formula

---

## ✅ Verification Checklist

- [x] GST calculated on (Subtotal + Profit + Ads)
- [x] GST NOT on delivery charges
- [x] Seller gets full subtotal
- [x] Admin gets profit + ads + GST + fuel
- [x] Delivery gets charge - fuel
- [x] Total settlement = Final price
- [ ] Delivery earnings are positive ⚠️

---

## 📐 Quick Formulas

```javascript
// Subtotal
subTotal = sellerPrice + packing + shipping

// Admin Profit
adminProfit = sellerPrice × profitPercentage

// GST
gstBase = subTotal + adminProfit + ads
gstAmount = gstBase × gstPercentage

// Delivery
deliveryCharge = calculateByDistance(distance, orderValue)
fuelCost = distance × fuelRate

// Raw Price
rawPrice = subTotal + adminProfit + ads + gstAmount + deliveryCharge

// Final Price
finalPrice = round(rawPrice, strategy)

// Settlement
sellerPayout = subTotal
deliveryPayout = deliveryCharge - fuelCost
adminRevenue = adminProfit + ads + gstAmount + fuelCost + (finalPrice - rawPrice)
```

---

## 🎯 Key Takeaways

1. **GST Base:** Subtotal + Profit + Ads (NOT including delivery)
2. **Seller Gets:** Their price + packing + shipping (always positive)
3. **Delivery Gets:** Delivery charge - fuel cost (can be negative!)
4. **Admin Gets:** Profit + ads + GST + fuel + rounding adjustment
5. **SuperCoins:** From rounding + order value percentage

---

**Generated:** 2026-02-03  
**Calculator Version:** 2.0.0  
**Status:** ✅ All calculations verified
