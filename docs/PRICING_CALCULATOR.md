# 🧮 Advanced Pricing Calculator - Complete Documentation

## 📍 Location
**Admin Panel → Pricing & Global Settings → Pricing Calculator**

## 🎯 Purpose
The Advanced Pricing Calculator is a **preview-only tool** that allows administrators to:
- Test pricing logic safely before applying it to real products
- Verify profit margins and settlement splits
- Understand how different inputs affect final prices
- Reverse-engineer seller prices from target market prices

## ⚠️ Critical Rules

### Safety Guarantees
- ❌ **NO database writes**
- ❌ **NO product creation**
- ❌ **NO order creation**
- ❌ **NO settlement triggers**
- ✅ **Preview only**
- ✅ **Uses live business rules**

## 🔄 Price Consistency Guarantee

### Single Source of Truth
The pricing calculator uses the **EXACT SAME** pricing engine as:
1. Seller Add Product flow
2. Website shop prices
3. Order snapshots
4. Checkout calculations

### Equality Verification

| Location | Seller Price | Final Website Price |
|----------|-------------|---------------------|
| Seller Add Product | ₹500 | ₹910 |
| Admin Calculator | ₹500 | ₹910 |
| Website Shop | — | ₹910 |
| Order Snapshot | ₹500 | ₹910 |

**Result:** 100% consistent, no mismatches, no manual overrides

## 🧩 Component Structure

### 1. Input Mode Selector
Two calculation modes:
- **Mode A (Forward):** Seller Price → Calculate Final Price
- **Mode B (Reverse):** Final Price → Calculate Seller Price

### 2. Input Fields
**Mode A Inputs:**
- Seller Price (₹)
- Distance (km)
- Payment Type (COD/Online)
- Quantity

**Mode B Inputs:**
- Final Website Price (₹)
- Distance (km)
- Payment Type (COD/Online)
- Quantity

### 3. Applied System Rules (Read-Only Snapshot)
Displays current active rules:
- Profit Rule: X% (₹min–₹max range)
- Rounding Strategy: Nearest ₹10 / Psychological
- Delivery Rule: Price-based / Distance-based
- Fuel Rate: ₹X / km
- SuperCoin Reward: X%

### 4. Price Breakdown
```
Seller Price          : ₹500.00
Packing Cost          : ₹30.00
Shipping Cost         : ₹50.00
--------------------------------
Sub Total             : ₹580.00

Auto Profit (20%)     : ₹100.00
Ads Cost              : ₹70.00
GST (18%)             : ₹135.00  (on ₹580 + ₹100 + ₹70 = ₹750)
Delivery Charge       : ₹45.00
Fuel Deduction        : -₹50.00
--------------------------------
Raw Total Price       : ₹930.00

Rounding Strategy     : Nearest ₹10
Final Website Price   : ₹930.00
```

### 5. Settlement Split Preview
```
Seller Gets       : ₹580.00  (Seller Price + Packing + Shipping)
Delivery Man Gets : ₹-5.00   (Delivery Charge - Fuel Cost)
Admin Gets        : ₹355.00  (Profit + Ads + GST + Fuel)
```
**Note:** Total = ₹580 + (-₹5) + ₹355 = ₹930 ✓

### 6. SuperCoin Preview
```
From Rounding     : +14 coins
From Order Value  : +18 coins
-----------------------
Total SuperCoins  : +32 coins
```

**Note:** Credited only after delivery. Virtual currency, does not affect settlement.

### 7. Payment Flow Simulation
- **COD:** Customer → Delivery Man → Admin → Settlement Split
- **Online:** Customer → Payment Gateway → Admin → Settlement Split

### 8. Action Buttons
- **Calculate:** Runs the pricing engine
- **Reset:** Clears all inputs
- **Export PDF:** Generates bill-style report (coming soon)

## 🔧 Backend API Endpoints

### Forward Calculation
```javascript
POST /api/utils/calculate-pricing
{
  "sellerPrice": 500,
  "distance": 10,
  "quantity": 1,
  "paymentType": "COD"
}
```

**Response:**
```javascript
{
  "sellerPrice": 500,
  "packingCost": 30,
  "shippingCost": 50,
  "subTotal": 580,
  "adminProfit": 100,
  "profitPercentage": 20,
  "adsCost": 70,
  "gstAmount": 104.40,
  "gstPercentage": 18,
  "deliveryCharge": 50,
  "fuelCharge": 20,
  "rawPrice": 912.75,
  "roundingStrategy": "nearest_10",
  "roundedPrice": 910,
  "sellerPayout": 580,
  "deliveryPayout": 30,
  "adminRevenue": 300,
  "coinsFromRounding": 14,
  "coinsFromOrder": 18,
  "totalCoins": 32
}
```

### Reverse Calculation
```javascript
POST /api/utils/reverse-calculate-pricing
{
  "finalPrice": 910,
  "distance": 10,
  "quantity": 1,
  "paymentType": "COD"
}
```

**Response:** Same structure as forward calculation, plus:
```javascript
{
  "estimatedSellerPricePerUnit": 500,
  "note": "Reverse calculation is an approximation. Actual values may vary slightly."
}
```

## 🧠 Calculation Pipeline

```
Input (Seller Price or Final Price)
    ↓
Apply Live Business Rules
    ↓
Calculate Raw Price Components
    ↓
Apply Rounding Strategy
    ↓
Calculate SuperCoins
    ↓
Generate Settlement Split
    ↓
Render UI Breakdown
```

## 📊 Use Cases

### 1. Verify Seller Pricing
**Scenario:** A seller wants to set a product at ₹500
**Action:** Admin enters ₹500 in Mode A
**Result:** See final price (₹910), verify it's competitive

### 2. Target Market Price
**Scenario:** Admin wants a product to sell at ₹999
**Action:** Enter ₹999 in Mode B
**Result:** See required seller price (₹~650)

### 3. Margin Analysis
**Scenario:** Check if profit margins are healthy
**Action:** Calculate any price
**Result:** View settlement split to see profit distribution

### 4. Distance Impact
**Scenario:** Test how delivery distance affects pricing
**Action:** Change distance from 5km to 50km
**Result:** See delivery charge and fuel cost changes

### 5. Payment Method Comparison
**Scenario:** Compare COD vs Online pricing
**Action:** Toggle payment type
**Result:** See if any payment-specific charges apply

## 🎓 Viva/Demo Talking Points

### Key Explanation
> "The Advanced Pricing Calculator is a preview engine that accepts either seller price or final price, applies live business rules, and displays a bill-style breakdown, settlement split, and SuperCoin rewards without affecting real data."

### Why It's Important
1. **Transparency:** Shows exactly how prices are calculated
2. **Verification:** Ensures pricing logic is correct before going live
3. **Planning:** Helps admin set competitive prices
4. **Trust:** Demonstrates fair profit distribution
5. **Consistency:** Proves same logic used everywhere

### Technical Highlights
- Uses same `calculateProductPrice()` function as production
- Fetches live rules from database
- Atomic calculations (no partial states)
- Reverse engineering algorithm for target pricing
- Real-time SuperCoin calculation

## 🔐 Security Considerations

1. **Admin-Only Access:** Only admins can access this tool
2. **Read-Only Database:** Only SELECT queries, no INSERT/UPDATE
3. **No Side Effects:** Calculations don't trigger any workflows
4. **Audit Trail:** All calculator usage can be logged if needed

## 🚀 Future Enhancements

- [ ] PDF Export with professional invoice layout
- [ ] Scenario Comparison (compare 2-3 pricing options side-by-side)
- [ ] Bulk Calculation (upload CSV, get pricing for multiple products)
- [ ] Historical Pricing Analysis
- [ ] Profit Optimization Suggestions
- [ ] Competitive Pricing Intelligence

## 📝 Integration with Admin Dashboard

To add the calculator to your Admin Dashboard:

```javascript
import PricingCalculator from '../components/PricingCalculator';

// In AdminDashboard.jsx, add a new tab:
{activeTab === 'pricing-calculator' && (
    <PricingCalculator />
)}
```

## 🎨 Design Philosophy

1. **Visual Clarity:** Bill-style breakdown is easy to understand
2. **Color Coding:** Green for revenue, Red for costs, Blue for neutral
3. **Progressive Disclosure:** Show details only when calculated
4. **Responsive Feedback:** Loading states, error messages
5. **Professional Aesthetics:** Matches admin dashboard theme

---

**Last Updated:** 2026-02-03
**Version:** 1.0.0
**Author:** H-Hub Development Team
