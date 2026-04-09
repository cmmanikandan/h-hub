# 🎯 Enhanced Pricing & Settings Page

## ✨ Overview
The Pricing & Settings page has been completely redesigned with comprehensive guidelines, advanced percentage-based controls, and visual examples to help administrators understand and configure the pricing system.

---

## 📚 New Guidelines Section

### Location
**Top of the page** - Beautiful gradient purple banner with white text

### Features
1. **3 Visual Example Cards**
   - 💰 Example: ₹500 Product (Full breakdown)
   - 💸 Settlement Split (How money is distributed)
   - 📐 Key Formulas (All calculation formulas)

2. **4 Important Notes**
   - 🎯 Profit % calculation explanation
   - 💡 GST % application explanation
   - 🪙 SuperCoins source explanation
   - ⚡ Settings application scope

---

## 💯 Advanced Percentage Fields

### 1. **Global GST Percentage (%)**
- **Range:** 0-30%
- **Step:** 0.1%
- **Applied On:** SubTotal (Seller Price + Packing + Shipping)
- **Example:** 18% GST on ₹580 = ₹104.40

### 2. **Default Profit Percentage (%)**
- **Range:** 0-100%
- **Step:** 1%
- **Applied On:** Seller Price
- **Note:** Can be overridden by profit rules
- **Example:** 20% of ₹500 = ₹100 profit

### 3. **Platform Fee Percentage (%)**
- **Range:** 0-20%
- **Step:** 0.5%
- **Applied On:** Total order value
- **Purpose:** Additional platform service fee
- **Example:** 5% of ₹900 = ₹45

### 4. **SuperCoin Reward Percentage (%)**
- **Range:** 0-10%
- **Step:** 0.1%
- **Applied On:** Final order value
- **Conversion:** 1 SuperCoin = ₹1
- **Example:** 2% of ₹900 = 18 coins

### 5. **Maximum Discount Cap (%)**
- **Range:** 0-100%
- **Step:** 5%
- **Purpose:** Maximum discount allowed on any product
- **Example:** 50% cap means max ₹450 off on ₹900 product

---

## 📊 Example Calculation Breakdown

### Input
- Seller Price: **₹500**
- Distance: **10 km**
- Payment: **COD**

### Calculation Steps

```
1. Base Costs
   Seller Price:        ₹500.00
   + Packing Cost:      ₹30.00
   + Shipping Cost:     ₹50.00
   ─────────────────────────────
   Sub Total:           ₹580.00

2. Platform Charges
   + Profit (20%):      ₹100.00  (20% of ₹500)
   + Ads Cost:          ₹70.00
   + GST (18%):         ₹104.40  (18% of ₹580)
   + Delivery:          ₹45.00
   - Fuel (10km×₹5):   -₹50.00
   ─────────────────────────────
   Raw Total:           ₹899.40

3. Rounding
   Rounding Strategy:   Nearest ₹10
   ─────────────────────────────
   Final Price:         ₹900.00

4. SuperCoins
   From Rounding:       +1 coin   (₹900 - ₹899.40)
   From Reward (2%):    +18 coins (2% of ₹900)
   ─────────────────────────────
   Total Coins:         19 coins
```

### Settlement Split

```
Customer Pays: ₹900.00

Distribution:
┌─────────────────────────────────┐
│ ✓ Seller Gets:    ₹580.00      │ (Base + Costs)
│ ✓ Delivery Gets:  ₹25.00       │ (Fee - Fuel: ₹45 - ₹20)
│ ✓ Admin Gets:     ₹295.00      │ (Profit + Ads + GST + Fuel)
└─────────────────────────────────┘
Total: ₹580 + ₹25 + ₹295 = ₹900 ✓
```

---

## 🔑 Key Formulas

| Component | Formula | Example |
|-----------|---------|---------|
| **SubTotal** | Seller + Packing + Shipping | ₹500 + ₹30 + ₹50 = ₹580 |
| **Profit** | Seller × Profit% | ₹500 × 20% = ₹100 |
| **GST** | SubTotal × GST% | ₹580 × 18% = ₹104.40 |
| **Raw Price** | SubTotal + Profit + Ads + GST + Delivery | ₹899.40 |
| **Final Price** | Round(Raw Price) | ₹900 |
| **SuperCoins** | Ceil(Raw - Final) + Ceil(Final × Reward%) | 1 + 18 = 19 |

---

## 🎨 Visual Layout

```
┌─────────────────────────────────────────────────────────┐
│  📚 HOW OUR PRICING SYSTEM WORKS                        │
│  ┌─────────────┬─────────────┬─────────────┐           │
│  │ 💰 Example  │ 💸 Settlement│ 📐 Formulas │           │
│  │ ₹500 Product│    Split     │   Reference │           │
│  └─────────────┴─────────────┴─────────────┘           │
│  ┌───────────────────────────────────────────┐         │
│  │ 🎯 💡 🪙 ⚡ Important Notes                │         │
│  └───────────────────────────────────────────┘         │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  💯 Tax & Profit Margin                                 │
│  ├─ Global GST Percentage (%)         [18] %            │
│  ├─ Default Profit Percentage (%)     [20] %            │
│  ├─ Platform Fee Percentage (%)       [5]  %            │
│  ├─ SuperCoin Reward Percentage (%)   [2]  %            │
│  ├─ Maximum Discount Cap (%)          [50] %            │
│  └─ ☑ Enable Global Discount / Offer Toggle            │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  🚚 Logistics & Costs                                   │
│  (Existing fields remain unchanged)                     │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  🧮 PRICING CALCULATOR                                  │
│  (Full calculator with guidelines at bottom)            │
└─────────────────────────────────────────────────────────┘
```

---

## 🚀 How to Use

1. **Navigate** to Admin Dashboard → **Pricing & Settings**
2. **Read** the guidelines section at the top to understand how pricing works
3. **Adjust** percentage fields as needed
4. **Test** using the Pricing Calculator at the bottom
5. **Apply** changes to new products automatically

---

## ⚠️ Important Notes

1. **Profit %** is calculated on **seller price**, not final price
2. **GST %** is applied on **sub total** (seller + costs)
3. **SuperCoins** come from rounding difference + order value reward
4. Changes apply to **new products**. Use "Recalculate" button for existing ones

---

## 📱 Responsive Design

- Guidelines section uses **3-column grid** on desktop
- Each example card has **glassmorphism effect**
- **Purple gradient background** with white text
- All percentage fields have **helper text** below them
- **Min/Max validation** prevents invalid values

---

## 🎯 Benefits

✅ **Clear Understanding** - Visual examples show exactly how pricing works
✅ **Advanced Control** - 5 percentage-based settings for fine-tuning
✅ **Validation** - Min/Max ranges prevent configuration errors
✅ **Helper Text** - Each field explains what it does
✅ **Professional Look** - Beautiful gradient design with glassmorphism
✅ **Complete Guide** - No need for external documentation

---

## 🔗 Related Features

- **Profit Rules** - Override default profit % for specific price ranges
- **SuperCoin Rules** - Override default reward % for specific order amounts
- **Pricing Calculator** - Test all settings in real-time
- **Product Management** - Apply settings when creating products

---

**Last Updated:** 2026-02-03
**Version:** 2.0 (Enhanced)
