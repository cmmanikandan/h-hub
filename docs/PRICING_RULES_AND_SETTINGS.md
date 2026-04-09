# 🎯 Pricing Rules & Settings - Complete Guide

## Overview
This document explains how to configure and use the three main components that control pricing in H-Hub:
1. **Profit Rules** - Dynamic profit margins based on seller price ranges
2. **SuperCoin Loyalty Rules** - Reward percentages based on order value
3. **Logistics & Costs** - Fixed operational costs and delivery settings

---

## 📊 1. Rule-Based Auto Profit Generator

### What It Does
Automatically calculates admin profit percentage based on the seller's product price. Different price ranges can have different profit margins.

### Why It's Important
- **Flexibility:** Higher-value products can have lower profit percentages
- **Fairness:** Ensures consistent margins across price ranges
- **Automation:** No manual profit calculation needed
- **Optimization:** Maximize revenue while staying competitive

### Configuration Fields

| Field | Description | Example |
|-------|-------------|---------|
| **Seller Price Range** | Min-Max price range | ₹0 - ₹500 |
| **Profit (%)** | Profit percentage for this range | 25% |
| **Min Profit (INR)** | Minimum profit amount (floor) | ₹50 |
| **Max Profit Cap** | Maximum profit amount (ceiling) | ₹500 |
| **Status** | Active/Inactive | ✅ Active |

### How It Works

```javascript
// Example: Seller Price = ₹1000

Step 1: Find matching rule
- Rule 1: ₹0 - ₹500 → 25% profit
- Rule 2: ₹501 - ₹2000 → 20% profit ✓ (matches!)
- Rule 3: ₹2001+ → 15% profit

Step 2: Calculate percentage-based profit
Profit = ₹1000 × 20% = ₹200

Step 3: Apply minimum floor
If ₹200 < Min Profit (₹50) → Use ₹50
Else → Use ₹200 ✓

Step 4: Apply maximum cap
If ₹200 > Max Cap (₹500) → Use ₹500
Else → Use ₹200 ✓

Final Admin Profit = ₹200
```

### Example Rules Setup

```
┌─────────────────────────────────────────────────────────┐
│ Rule 1: Budget Products                                 │
├─────────────────────────────────────────────────────────┤
│ Seller Price Range:  ₹0 - ₹500                          │
│ Profit (%):          25%                                 │
│ Min Profit (INR):    ₹50                                 │
│ Max Profit Cap:      ₹200                                │
│ Status:              ✅ Active                           │
│                                                          │
│ Example: ₹300 product → ₹75 profit (25% of ₹300)        │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ Rule 2: Mid-Range Products                              │
├─────────────────────────────────────────────────────────┤
│ Seller Price Range:  ₹501 - ₹2000                       │
│ Profit (%):          20%                                 │
│ Min Profit (INR):    ₹100                                │
│ Max Profit Cap:      ₹500                                │
│ Status:              ✅ Active                           │
│                                                          │
│ Example: ₹1000 product → ₹200 profit (20% of ₹1000)     │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ Rule 3: Premium Products                                │
├─────────────────────────────────────────────────────────┤
│ Seller Price Range:  ₹2001 - ₹10000                     │
│ Profit (%):          15%                                 │
│ Min Profit (INR):    ₹200                                │
│ Max Profit Cap:      ₹1500                               │
│ Status:              ✅ Active                           │
│                                                          │
│ Example: ₹5000 product → ₹750 profit (15% of ₹5000)     │
└─────────────────────────────────────────────────────────┘
```

### Best Practices

✅ **DO:**
- Create non-overlapping price ranges
- Set realistic profit percentages (15-30%)
- Use minimum profit to ensure profitability on low-value items
- Use maximum cap to stay competitive on high-value items
- Test rules with the pricing calculator before activating

❌ **DON'T:**
- Create overlapping ranges (system uses first match)
- Set profit % too high (reduces competitiveness)
- Leave gaps in price ranges (defaults to 10% profit)
- Forget to activate rules after creation

### Default Behavior

**If no rule matches:**
```javascript
Default Profit = Seller Price × 10%
```

**If no rules are defined:**
```
Platform defaults to 10% profit on all products
```

---

## 🪙 2. SuperCoin Loyalty Rules

### What It Does
Rewards customers with SuperCoins based on their order value. Higher order values earn higher reward percentages.

### Why It's Important
- **Customer Retention:** Incentivizes repeat purchases
- **Order Value Increase:** Encourages customers to buy more
- **Loyalty Program:** Builds long-term customer relationships
- **Competitive Edge:** Differentiates from competitors

### Configuration Fields

| Field | Description | Example |
|-------|-------------|---------|
| **Order Amount Range** | Min-Max order value | ₹500 - ₹2000 |
| **Reward (%)** | Percentage of order value as coins | 2% |
| **Status** | Active/Inactive | ✅ Active |

### How It Works

```javascript
// Example: Order Value = ₹1500

Step 1: Find matching rule
- Rule 1: ₹0 - ₹499 → 1% reward
- Rule 2: ₹500 - ₹2000 → 2% reward ✓ (matches!)
- Rule 3: ₹2001+ → 3% reward

Step 2: Calculate reward coins
Order Coins = ₹1500 × 2% = 30 coins

Step 3: Add rounding coins
Rounding Coins = Final Price - Raw Price
Example: ₹1640 - ₹1638 = 2 coins

Step 4: Total SuperCoins
Total = 30 + 2 = 32 coins

1 SuperCoin = ₹1 for future purchases
```

### Example Rules Setup

```
┌─────────────────────────────────────────────────────────┐
│ Rule 1: Small Orders                                     │
├─────────────────────────────────────────────────────────┤
│ Order Amount Range:  ₹0 - ₹499                          │
│ Reward (%):          1%                                  │
│ Status:              ✅ Active                           │
│                                                          │
│ Example: ₹300 order → 3 coins (1% of ₹300)              │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ Rule 2: Medium Orders                                    │
├─────────────────────────────────────────────────────────┤
│ Order Amount Range:  ₹500 - ₹2000                       │
│ Reward (%):          2%                                  │
│ Status:              ✅ Active                           │
│                                                          │
│ Example: ₹1500 order → 30 coins (2% of ₹1500)           │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ Rule 3: Large Orders                                     │
├─────────────────────────────────────────────────────────┤
│ Order Amount Range:  ₹2001 - ₹999999                    │
│ Reward (%):          3%                                  │
│ Status:              ✅ Active                           │
│                                                          │
│ Example: ₹5000 order → 150 coins (3% of ₹5000)          │
└─────────────────────────────────────────────────────────┘
```

### SuperCoin Sources

Customers earn SuperCoins from **two sources**:

#### 1. Order Value Reward (Rule-Based)
```
Coins = Order Amount × Reward %
Example: ₹1500 × 2% = 30 coins
```

#### 2. Rounding Difference
```
Coins = Final Price - Raw Price (if positive)
Example: ₹1640 - ₹1638 = 2 coins
```

#### Total SuperCoins
```
Total = Order Coins + Rounding Coins
Example: 30 + 2 = 32 coins
```

### Best Practices

✅ **DO:**
- Create tiered rewards (1%, 2%, 3%)
- Encourage larger orders with higher percentages
- Keep ranges simple and clear
- Test coin calculations before going live

❌ **DON'T:**
- Set reward % too high (impacts profitability)
- Create overlapping ranges
- Forget to communicate coin value to customers
- Change rules frequently (confuses customers)

### Default Behavior

**If no rule matches:**
```javascript
// Default tiered rewards
if (orderAmount < 500) reward = 1%
else if (orderAmount <= 2000) reward = 2%
else reward = 3%
```

---

## 📦 3. Logistics & Costs

### What It Does
Defines fixed operational costs that are added to every product price. These costs cover platform operations and logistics.

### Why It's Important
- **Cost Recovery:** Ensures operational costs are covered
- **Transparency:** Clear breakdown of all charges
- **Profitability:** Prevents selling at a loss
- **Consistency:** Same costs applied to all products

### Configuration Fields

#### A. Product Costs

| Field | Description | Default | Impact |
|-------|-------------|---------|--------|
| **Packing Cost** | Cost of packaging materials | ₹30 | Added to subtotal |
| **Shipping Cost** | Cost to ship to warehouse | ₹50 | Added to subtotal |
| **Ads Cost** | Marketing/advertising cost | ₹70 | Added before GST |

#### B. Delivery Costs

| Field | Description | Default | Impact |
|-------|-------------|---------|--------|
| **Delivery Charge (Base)** | Base delivery fee | ₹50 | Charged to customer |
| **Fuel Rate (₹/km)** | Cost per kilometer | ₹5 | Deducted from delivery fee |

### How Costs Are Applied

```javascript
// Example: Seller Price = ₹1000, Distance = 10 km

Step 1: Add Product Costs
Seller Price:     ₹1000
+ Packing Cost:   ₹30
+ Shipping Cost:  ₹50
─────────────────────────
Sub Total:        ₹1080

Step 2: Add Platform Costs
Sub Total:        ₹1080
+ Admin Profit:   ₹200 (from profit rules)
+ Ads Cost:       ₹70
─────────────────────────
Before GST:       ₹1350

Step 3: Calculate GST
GST Base:         ₹1350
× GST (18%):      ₹243
─────────────────────────
After GST:        ₹1593

Step 4: Add Delivery
After GST:        ₹1593
+ Delivery:       ₹45 (calculated)
─────────────────────────
Raw Price:        ₹1638

Step 5: Round
Final Price:      ₹1640
```

### Delivery Charge Calculation

The delivery charge is **dynamically calculated** based on:

```javascript
function calculateDeliveryCharge(orderValue, distance) {
    // Base charge
    let charge = 20;
    
    // Distance factor (₹2.5 per km)
    charge += distance * 2.5;
    
    // High-value bonus
    if (orderValue > 1500) {
        charge += 15;
    }
    
    // Apply range limits
    charge = Math.max(20, Math.min(100, charge));
    
    return Math.round(charge);
}

// Example: ₹1500 order, 10 km distance
// = ₹20 + (10 × ₹2.5) + ₹15 = ₹60
// Capped at ₹100, minimum ₹20
```

### Fuel Cost Deduction

```javascript
// Fuel cost is deducted from delivery man's earnings
Fuel Cost = Distance × Fuel Rate

// Example: 10 km × ₹5/km = ₹50

Delivery Man Gets = Delivery Charge - Fuel Cost
                  = ₹45 - ₹50 = -₹5 (LOSS!)
```

⚠️ **Warning:** Ensure delivery charges always exceed fuel costs to prevent negative earnings!

### Cost Breakdown by Stakeholder

```
┌─────────────────────────────────────────────────────────┐
│ SELLER RECEIVES                                          │
├─────────────────────────────────────────────────────────┤
│ ✓ Seller Price        ₹1000                              │
│ ✓ Packing Cost        ₹30   (reimbursement)              │
│ ✓ Shipping Cost       ₹50   (reimbursement)              │
│ ─────────────────────────────                            │
│ Total:                ₹1080                               │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ DELIVERY MAN RECEIVES                                    │
├─────────────────────────────────────────────────────────┤
│ ✓ Delivery Charge     ₹45                                │
│ ✗ Fuel Cost           -₹50  (deducted)                   │
│ ─────────────────────────────                            │
│ Total:                ₹-5   ⚠️ NEGATIVE!                 │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ ADMIN RECEIVES                                           │
├─────────────────────────────────────────────────────────┤
│ ✓ Admin Profit        ₹200  (from profit rules)          │
│ ✓ Ads Cost            ₹70   (cost recovery)              │
│ ✓ GST                 ₹243  (to be paid to govt)         │
│ ✓ Fuel Cost           ₹50   (cost recovery)              │
│ ✓ Rounding Adj        ₹2    (₹1640 - ₹1638)             │
│ ─────────────────────────────                            │
│ Total:                ₹565                                │
│ Net Profit:           ₹322  (₹565 - ₹243 GST)           │
└─────────────────────────────────────────────────────────┘
```

### Recommended Settings

#### For Small/Local Business
```
Packing Cost:         ₹20
Shipping Cost:        ₹30
Ads Cost:             ₹50
Delivery Charge Base: ₹40
Fuel Rate:            ₹4/km
```

#### For Medium Business
```
Packing Cost:         ₹30
Shipping Cost:        ₹50
Ads Cost:             ₹70
Delivery Charge Base: ₹50
Fuel Rate:            ₹5/km
```

#### For Large Business
```
Packing Cost:         ₹40
Shipping Cost:        ₹60
Ads Cost:             ₹100
Delivery Charge Base: ₹60
Fuel Rate:            ₹6/km
```

### Best Practices

✅ **DO:**
- Set realistic costs based on actual expenses
- Review costs monthly and adjust as needed
- Ensure delivery charges cover fuel costs
- Test pricing with calculator before applying
- Keep costs competitive with market rates

❌ **DON'T:**
- Set costs too high (reduces competitiveness)
- Set costs too low (reduces profitability)
- Change costs frequently (confuses sellers)
- Forget to account for inflation
- Ignore negative delivery earnings warnings

---

## 🔄 4. Display & Rounding

### Price Rounding Strategy

Rounding makes prices look cleaner and more appealing to customers.

#### Option 1: Nearest ₹10
```
₹1638 → ₹1640
₹1632 → ₹1630
₹1635 → ₹1640 (rounds up at 5)
```

**Best for:** General products, clean pricing

#### Option 2: Psychological Pricing
```
₹1638 → ₹1599 (ends with 99)
₹2450 → ₹2399
₹5200 → ₹4999
```

**Best for:** Retail, consumer products, perceived discounts

### Rounding Impact

```
Raw Price:        ₹1638.00
Final Price:      ₹1640.00
Difference:       ₹2.00

Customer Impact:
- Pays ₹2 more
- Earns 2 SuperCoins (₹2 value)
- Net: ₹0 (balanced)

Admin Impact:
- Receives ₹2 extra
- Added to admin revenue
```

### Synchronize Master Pricing

The **"Recalculate All"** button:
- Updates ALL product prices based on new rules
- Applies new costs to existing products
- Recalculates GST and delivery charges
- Updates final prices with new rounding strategy

⚠️ **Warning:** This affects ALL products! Use carefully.

---

## 🎯 5. How Everything Works Together

### Complete Pricing Flow

```
┌─────────────────────────────────────────────────────────┐
│ STEP 1: Seller Sets Price                               │
│ Seller Price: ₹1000                                      │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ STEP 2: Apply Logistics & Costs                         │
│ + Packing Cost:   ₹30                                    │
│ + Shipping Cost:  ₹50                                    │
│ = Sub Total:      ₹1080                                  │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ STEP 3: Apply Profit Rule                               │
│ Rule: ₹501-₹2000 → 20% profit                           │
│ + Admin Profit:   ₹200 (20% of ₹1000)                   │
│ + Ads Cost:       ₹70                                    │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ STEP 4: Calculate GST                                   │
│ GST Base: ₹1080 + ₹200 + ₹70 = ₹1350                    │
│ + GST (18%):      ₹243                                   │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ STEP 5: Add Delivery                                    │
│ Distance: 10 km                                          │
│ + Delivery:       ₹45                                    │
│ = Raw Price:      ₹1638                                  │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ STEP 6: Apply Rounding                                  │
│ Strategy: Nearest ₹10                                    │
│ = Final Price:    ₹1640                                  │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ STEP 7: Calculate SuperCoins (Coin Rule)                │
│ Rule: ₹500-₹2000 → 2% reward                            │
│ Order Coins:      33 (2% of ₹1640)                       │
│ Rounding Coins:   2 (₹1640 - ₹1638)                     │
│ = Total Coins:    35 coins                               │
└─────────────────────────────────────────────────────────┘
```

### Real-World Example

**Scenario:** Electronics Store selling a smartphone

```
Product: Smartphone
Seller Price: ₹15,000
Distance: 25 km
Payment: Online

┌─────────────────────────────────────────────────────────┐
│ CALCULATION                                              │
├─────────────────────────────────────────────────────────┤
│ Seller Price:         ₹15,000                            │
│ + Packing:            ₹30                                │
│ + Shipping:           ₹50                                │
│ = Sub Total:          ₹15,080                            │
│                                                          │
│ Profit Rule: ₹10,001+ → 12%                             │
│ + Admin Profit:       ₹1,800 (12% of ₹15,000)           │
│ + Ads Cost:           ₹70                                │
│                                                          │
│ GST Base:             ₹16,950                            │
│ + GST (18%):          ₹3,051                             │
│                                                          │
│ + Delivery:           ₹100 (capped)                      │
│ - Fuel:               ₹125 (25 km × ₹5)                  │
│                                                          │
│ = Raw Price:          ₹20,101                            │
│ = Final Price:        ₹20,100 (rounded)                 │
│                                                          │
│ Coin Rule: ₹10,001+ → 3%                                │
│ = SuperCoins:         603 coins                          │
├─────────────────────────────────────────────────────────┤
│ SETTLEMENT                                               │
├─────────────────────────────────────────────────────────┤
│ Seller Gets:          ₹15,080                            │
│ Delivery Gets:        ₹-25 ⚠️                            │
│ Admin Gets:           ₹5,045                             │
│ Admin Net Profit:     ₹1,994 (after GST)                │
└─────────────────────────────────────────────────────────┘
```

---

## 📊 6. Configuration Checklist

### Initial Setup

- [ ] **Set Profit Rules**
  - [ ] Create rule for ₹0-₹500 (25% profit)
  - [ ] Create rule for ₹501-₹2000 (20% profit)
  - [ ] Create rule for ₹2001+ (15% profit)
  - [ ] Activate all rules

- [ ] **Set SuperCoin Rules**
  - [ ] Create rule for ₹0-₹499 (1% reward)
  - [ ] Create rule for ₹500-₹2000 (2% reward)
  - [ ] Create rule for ₹2001+ (3% reward)
  - [ ] Activate all rules

- [ ] **Configure Logistics & Costs**
  - [ ] Set packing cost (₹30)
  - [ ] Set shipping cost (₹50)
  - [ ] Set ads cost (₹70)
  - [ ] Set delivery base (₹50)
  - [ ] Set fuel rate (₹5/km)

- [ ] **Set Display & Rounding**
  - [ ] Choose rounding strategy
  - [ ] Test with pricing calculator

- [ ] **Test Everything**
  - [ ] Use pricing calculator with various prices
  - [ ] Verify GST calculations
  - [ ] Check delivery earnings (ensure positive)
  - [ ] Confirm SuperCoin calculations
  - [ ] Review settlement distribution

### Regular Maintenance

- [ ] **Monthly Review**
  - [ ] Check if costs are still accurate
  - [ ] Review profit margins vs. competition
  - [ ] Analyze delivery earnings reports
  - [ ] Adjust rules if needed

- [ ] **Quarterly Optimization**
  - [ ] Review SuperCoin redemption rates
  - [ ] Analyze profit margins by category
  - [ ] Optimize delivery charge formula
  - [ ] Update fuel rates if needed

---

## 🚨 Common Issues & Solutions

### Issue 1: Negative Delivery Earnings
**Problem:** Delivery man loses money on long-distance orders

**Solution:**
```
Option A: Increase delivery base charge
Option B: Reduce fuel rate
Option C: Add distance-based surcharge
Option D: Limit delivery radius
```

### Issue 2: Prices Too High
**Problem:** Final prices are not competitive

**Solution:**
```
Option A: Reduce profit percentages
Option B: Lower logistics costs
Option C: Optimize ads cost
Option D: Use psychological pricing
```

### Issue 3: Low Profitability
**Problem:** Admin profit margins are too thin

**Solution:**
```
Option A: Increase profit percentages
Option B: Add minimum profit floors
Option C: Review and reduce costs
Option D: Optimize delivery charges
```

### Issue 4: No Rules Defined
**Problem:** System shows "No profit rules defined"

**Solution:**
```
1. Click "Add Profit Rule" button
2. Fill in all required fields
3. Set status to Active
4. Save the rule
5. Test with pricing calculator
```

---

## 📚 API Endpoints

### Get Current Settings
```javascript
GET /api/admin/settings
Response: { packing_cost, shipping_cost, ads_cost, ... }
```

### Get Profit Rules
```javascript
GET /api/admin/profit-rules
Response: [{ id, minSellerPrice, maxSellerPrice, profitPercentage, ... }]
```

### Get SuperCoin Rules
```javascript
GET /api/admin/supercoin-rules
Response: [{ id, minOrderAmount, maxOrderAmount, rewardPercentage, ... }]
```

### Update Settings
```javascript
PUT /api/admin/settings
Body: { packing_cost: 30, shipping_cost: 50, ... }
```

### Create Profit Rule
```javascript
POST /api/admin/profit-rules
Body: { minSellerPrice, maxSellerPrice, profitPercentage, ... }
```

### Create SuperCoin Rule
```javascript
POST /api/admin/supercoin-rules
Body: { minOrderAmount, maxOrderAmount, rewardPercentage, ... }
```

---

## 🎓 Summary

### Key Takeaways

1. **Profit Rules** control how much admin earns based on seller price
2. **SuperCoin Rules** reward customers based on order value
3. **Logistics & Costs** define fixed operational expenses
4. **All three work together** to calculate final prices
5. **Always test** with pricing calculator before going live
6. **Monitor delivery earnings** to prevent negative payouts
7. **Review and adjust** rules regularly for optimization

### Quick Reference

```
Final Price = Seller Price 
            + Packing + Shipping          (Logistics)
            + Admin Profit                (Profit Rule)
            + Ads Cost                    (Logistics)
            + GST (18%)                   (Tax)
            + Delivery Charge             (Logistics)
            → Rounded                     (Display)

SuperCoins = (Final Price × Reward %)    (Coin Rule)
           + Rounding Difference

Settlement:
- Seller:   Seller Price + Packing + Shipping
- Delivery: Delivery Charge - Fuel Cost
- Admin:    Profit + Ads + GST + Fuel + Rounding
```

---

**Last Updated:** 2026-02-03  
**Version:** 1.0.0  
**Author:** H-Hub Development Team
