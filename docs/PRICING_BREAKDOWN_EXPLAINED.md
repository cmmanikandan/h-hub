# 💰 Complete Pricing Breakdown Explained

## Overview
This document explains how prices are calculated in the H-Hub platform, including GST, delivery charges, raw total price, final website price, and how money is distributed among sellers, delivery personnel, and admin.

---

## 📊 Step-by-Step Calculation

### Example: Seller Price = ₹1000

#### **Step 1: Calculate Subtotal**
```
Seller Price:     ₹1000.00
Packing Cost:     ₹30.00
Shipping Cost:    ₹50.00
─────────────────────────
Sub Total:        ₹1080.00
```

**Formula:** `Sub Total = Seller Price + Packing Cost + Shipping Cost`

---

#### **Step 2: Calculate Admin Profit**
```
Profit Percentage: 20% (from profit rules)
Admin Profit:      ₹1000 × 20% = ₹200.00
```

**Formula:** `Admin Profit = Seller Price × Profit Percentage`

**Note:** Profit is calculated on the **seller price only**, not the subtotal.

---

#### **Step 3: Add Platform Costs**
```
Ads Cost:         ₹70.00
```

This is a fixed platform cost for advertising and marketing.

---

#### **Step 4: Calculate GST (18%)**
```
GST Base:         ₹1080 + ₹200 + ₹70 = ₹1350.00
GST Amount:       ₹1350 × 18% = ₹243.00
```

**Formula:** `GST Amount = (Sub Total + Admin Profit + Ads Cost) × GST %`

**Important:** GST is calculated on the sum of:
- Sub Total (Seller Price + Packing + Shipping)
- Admin Profit
- Ads Cost

**GST is NOT calculated on delivery charges** (they are added separately).

---

#### **Step 5: Calculate Delivery Charges**
```
Distance:         10 km
Delivery Charge:  ₹45.00 (calculated based on distance and order value)
Fuel Cost:        10 km × ₹5/km = ₹50.00
```

**Delivery Charge Formula:**
- Base: ₹20
- Distance factor: Distance × ₹2.5/km
- High value bonus: +₹15 if order > ₹1500
- Range: Min ₹20, Max ₹100

**Fuel Cost Formula:** `Fuel Cost = Distance × Fuel Rate (₹5/km)`

---

#### **Step 6: Calculate Raw Total Price**
```
Sub Total:        ₹1080.00
Admin Profit:     ₹200.00
Ads Cost:         ₹70.00
GST:              ₹243.00
Delivery Charge:  ₹45.00
─────────────────────────
Raw Total:        ₹1638.00
```

**Formula:** `Raw Price = Sub Total + Admin Profit + Ads + GST + Delivery Charge`

---

#### **Step 7: Apply Rounding Strategy**
```
Raw Price:        ₹1638.00
Rounding:         Nearest ₹10
Final Price:      ₹1640.00
```

**Rounding Strategies:**
- **Nearest ₹10:** Round to nearest 10 (₹1638 → ₹1640)
- **Psychological:** Round to end with 99 (₹1638 → ₹1599)

---

## 💸 Settlement Distribution

### Who Gets What?

```
Customer Pays:    ₹1640.00

Distribution:
├─ Seller Gets:        ₹1080.00  (66%)
├─ Delivery Man Gets:  ₹-5.00    (-0.3%)
└─ Admin Gets:         ₹565.00   (34.5%)

Total: ₹1080 + (-₹5) + ₹565 = ₹1640 ✓
```

### Breakdown by Stakeholder

#### 1️⃣ **Seller Gets: ₹1080.00**
```
Seller Price:     ₹1000.00
Packing Cost:     ₹30.00
Shipping Cost:    ₹50.00
─────────────────────────
Total:            ₹1080.00
```

**What seller receives:**
- Their product price
- Reimbursement for packing materials
- Reimbursement for shipping to warehouse

---

#### 2️⃣ **Delivery Man Gets: ₹-5.00**
```
Delivery Charge:  ₹45.00
Fuel Cost:        ₹50.00
─────────────────────────
Net Earnings:     ₹-5.00
```

**Note:** In this example, the delivery man actually **loses money** because the fuel cost (₹50) exceeds the delivery charge (₹45). This happens when:
- Distance is high (10 km)
- Order value is low (delivery charge is capped)

**In practice:** The platform should ensure delivery charges always cover fuel costs to prevent negative earnings.

---

#### 3️⃣ **Admin Gets: ₹565.00**
```
Admin Profit:     ₹200.00
Ads Cost:         ₹70.00
GST:              ₹243.00
Fuel Cost:        ₹50.00
Platform Fee:     ₹2.00 (rounding difference)
─────────────────────────
Total:            ₹565.00
```

**What admin receives:**
- Platform profit margin
- Advertising costs recovery
- GST (to be paid to government)
- Fuel cost recovery
- Rounding adjustments

---

## 🪙 SuperCoins Calculation

```
Raw Price:        ₹1638.00
Final Price:      ₹1640.00
Rounding Diff:    ₹2.00

Coins from Rounding:    2 coins
Coins from Order (2%):  ₹1640 × 2% = 33 coins
─────────────────────────────────────
Total SuperCoins:       35 coins
```

**SuperCoins are earned from:**
1. **Rounding difference** (when final price > raw price)
2. **Order value percentage** (typically 1-3% based on order amount)

**Value:** 1 SuperCoin = ₹1 for future purchases

---

## 📐 Complete Formula Reference

### Core Calculations
```
1. Sub Total = Seller Price + Packing + Shipping

2. Admin Profit = Seller Price × Profit %

3. GST Base = Sub Total + Admin Profit + Ads Cost

4. GST Amount = GST Base × GST %

5. Delivery Charge = f(distance, order_value)
   - Base: ₹20
   - + (Distance × ₹2.5)
   - + ₹15 if order > ₹1500
   - Capped: ₹20 - ₹100

6. Fuel Cost = Distance × Fuel Rate

7. Raw Price = Sub Total + Admin Profit + Ads + GST + Delivery

8. Final Price = Round(Raw Price, strategy)
```

### Settlement Distribution
```
Seller Payout = Sub Total
                (Seller Price + Packing + Shipping)

Delivery Payout = Delivery Charge - Fuel Cost

Admin Revenue = Admin Profit + Ads + GST + Fuel Cost
                + (Final Price - Raw Price)
```

### SuperCoins
```
Rounding Coins = max(0, Final Price - Raw Price)

Order Coins = ceil(Final Price × Reward %)

Total Coins = Rounding Coins + Order Coins
```

---

## 🎯 Key Insights

### 1. **GST is NOT on Delivery**
GST is calculated on the product value (subtotal + profit + ads), **not** on delivery charges. This is standard practice in e-commerce.

### 2. **Seller Gets Full Product Value**
The seller receives their asking price plus reimbursement for packing and shipping costs. They don't lose money on these operational costs.

### 3. **Delivery Earnings Can Be Negative**
If fuel costs exceed delivery charges, the delivery person loses money. The platform should:
- Set minimum delivery charges
- Adjust fuel rates
- Limit delivery distances

### 4. **Admin Revenue Includes GST**
The admin receives GST as part of revenue but must remit it to the government. The actual profit is:
```
Net Admin Profit = Admin Revenue - GST Amount
                 = ₹565 - ₹243 = ₹322
```

### 5. **Rounding Benefits Customers**
When rounding down (e.g., ₹1638 → ₹1630), customers save money and earn SuperCoins. When rounding up, they pay slightly more but still earn coins.

---

## 🔍 Example Scenarios

### Scenario 1: Low-Value, Short Distance
```
Seller Price:     ₹200
Distance:         2 km
─────────────────────────
Sub Total:        ₹280
Profit (20%):     ₹40
Ads:              ₹70
GST (18%):        ₹70.20
Delivery:         ₹25
Fuel:             ₹10
─────────────────────────
Raw Price:        ₹485.20
Final Price:      ₹490

Settlement:
- Seller:         ₹280
- Delivery:       ₹15 (₹25 - ₹10)
- Admin:          ₹195 (₹40 + ₹70 + ₹70.20 + ₹10 + ₹4.80)
```

### Scenario 2: High-Value, Long Distance
```
Seller Price:     ₹5000
Distance:         50 km
─────────────────────────
Sub Total:        ₹5080
Profit (20%):     ₹1000
Ads:              ₹70
GST (18%):        ₹1107
Delivery:         ₹100 (capped)
Fuel:             ₹250
─────────────────────────
Raw Price:        ₹7357
Final Price:      ₹7360

Settlement:
- Seller:         ₹5080
- Delivery:       ₹-150 (₹100 - ₹250) ⚠️ NEGATIVE!
- Admin:          ₹2430 (₹1000 + ₹70 + ₹1107 + ₹250 + ₹3)
```

**⚠️ Warning:** Long-distance deliveries can result in negative earnings for delivery personnel!

---

## 📝 Important Notes

1. **Preview Only:** The pricing calculator does NOT create orders or modify data. It's for testing and planning.

2. **Live Rules:** All calculations use current active rules from platform settings.

3. **Consistency:** The same calculation logic is used in:
   - Pricing Calculator
   - Product Creation
   - Checkout Process
   - Order Snapshots

4. **Accuracy:** Forward calculation (Seller Price → Final Price) is 100% accurate. Reverse calculation (Final Price → Seller Price) is approximate.

5. **Validation:** Always verify that:
   - Delivery earnings are positive
   - Total settlement equals final price
   - GST is correctly calculated

---

## 🚀 Using the Calculator

### Forward Calculation (Mode A)
**Use when:** Seller sets a price, you want to know the final customer price.

**Input:** Seller Price = ₹1000
**Output:** Final Price = ₹1640

### Reverse Calculation (Mode B)
**Use when:** You want a specific market price, need to find required seller price.

**Input:** Target Price = ₹999
**Output:** Estimated Seller Price ≈ ₹550

---

**Last Updated:** 2026-02-03  
**Version:** 2.0.0  
**Author:** H-Hub Development Team
