# Payment Settlement Flow

## Complete Payment Distribution After Delivery

### Example Order:
```
Product Cost (Seller Price):    ₹5,000
+ Packing Cost:                 ₹30
+ Shipping Cost:                ₹50
+ Admin Profit (20%):           ₹1,000
+ Ads Cost:                     ₹70
+ GST (18%):                    ₹1,045
+ Delivery Charge:              ₹200
─────────────────────────────────────
TOTAL PRICE (Customer Pays):    ₹7,395
```

---

## After Delivery → Settlement Distribution

### Money Flow:
```
Customer Pays ₹7,395
        ↓
    Admin Collects
        ↓
    ---Split---
    ↙         ↓         ↘
 Seller    Delivery   Admin Keeps
 Man        Partner    (Platform)
```

### Settlement Breakdown:

#### 1️⃣ **Seller Gets** (sellerPayout)
```
Seller Price:    ₹5,000
+ Packing:       ₹30
+ Shipping:      ₹50
─────────────────────
Total to Seller: ₹5,080
```

#### 2️⃣ **Delivery Partner Gets** (deliveryPayout)
```
Delivery Charge: ₹200
- Fuel Charge:   ₹0
─────────────────────
Total to Delivery: ₹200
```

#### 3️⃣ **Admin Keeps** (Admin Profit)
```
Admin Profit:    ₹1,000
+ Ads Cost:      ₹70
+ GST Amount:    ₹1,045
+ Fuel Recovery: ₹0
─────────────────────
Total to Admin:  ₹2,115
```

---

## Verification Formula

```
Admin Profit = Total Price - (Seller Payout + Delivery Payout)
Admin Profit = ₹7,395 - (₹5,080 + ₹200)
Admin Profit = ₹7,395 - ₹5,280
Admin Profit = ₹2,115 ✓

Verification:
₹5,080 (Seller) + ₹200 (Delivery) + ₹2,115 (Admin) = ₹7,395 (Total) ✓
```

---

## Database Fields Involved

### Order Table
- `totalAmount` - Total price customer pays
- `sellerAmount` - Product price from seller
- `packingCost` - Packing cost
- `shippingCost` - Shipping cost
- `deliveryCharge` - Delivery charge
- `fuelCharge` - Fuel charge (deducted from delivery)
- `adminProfit` - Admin's profit margin
- `adsCost` - Advertising cost
- `gstAmount` - GST amount
- `settlementStatus` - Pending / Completed

### Settlement After Delivery

```javascript
// 1. Seller gets:
sellerPayout = sellerAmount + packingCost + shippingCost

// 2. Delivery Partner gets:
deliveryPayout = deliveryCharge - fuelCharge

// 3. Admin keeps:
adminRevenue = adminProfit + adsCost + gstAmount + fuelCharge

// Verification:
totalAmount = sellerPayout + deliveryPayout + adminRevenue
```

---

## Current Implementation

✅ **Automatic Settlement Process**
- Admin can trigger settlement from Admin Dashboard → Settlements tab
- Seller receives payment in wallet
- Delivery partner receives payment in wallet
- All amounts recorded in ProfitTransaction table
- Audit logs created for each settlement

✅ **Payment States**
- Before Delivery: Pending
- After Delivery: Ready for Settlement
- After Settlement: Completed

---

## Summary

The payment system correctly implements:
1. ✅ Customer pays full price to platform
2. ✅ Admin collects money after delivery
3. ✅ Admin distributes to seller + delivery partner
4. ✅ Admin keeps profit = Total - (Seller + Delivery)

All money flows are atomic transactions with notifications sent to sellers and delivery partners.
