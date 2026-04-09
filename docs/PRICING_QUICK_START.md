# 🚀 Quick Start: Setting Up Pricing Rules

## 5-Minute Setup Guide

This guide will help you configure profit rules, SuperCoin rules, and logistics costs in 5 minutes.

---

## Step 1: Access Admin Settings (30 seconds)

1. Login to admin dashboard at `http://localhost:5173`
2. Navigate to **Admin Dashboard**
3. Click on **"Pricing & Global Settings"** tab
4. You should see three sections:
   - Rule-Based Auto Profit Generator
   - SuperCoin Loyalty Rules
   - Logistics & Costs

---

## Step 2: Set Up Profit Rules (2 minutes)

### Click "Add Profit Rule" and create these 3 rules:

#### Rule 1: Budget Products (₹0 - ₹500)
```
Seller Price Range:
  Min: 0
  Max: 500

Profit Percentage: 25

Min Profit Amount: 50

Max Profit Cap: 200

Status: ✅ Active
```
**Click "Save"**

#### Rule 2: Mid-Range Products (₹501 - ₹2000)
```
Seller Price Range:
  Min: 501
  Max: 2000

Profit Percentage: 20

Min Profit Amount: 100

Max Profit Cap: 500

Status: ✅ Active
```
**Click "Save"**

#### Rule 3: Premium Products (₹2001 - ₹10000)
```
Seller Price Range:
  Min: 2001
  Max: 10000

Profit Percentage: 15

Min Profit Amount: 200

Max Profit Cap: 1500

Status: ✅ Active
```
**Click "Save"**

### ✅ Verification
You should now see 3 active profit rules in the table.

---

## Step 3: Set Up SuperCoin Rules (1 minute)

### Click "Add Coin Rule" and create these 3 rules:

#### Rule 1: Small Orders (₹0 - ₹499)
```
Order Amount Range:
  Min: 0
  Max: 499

Reward Percentage: 1

Status: ✅ Active
```
**Click "Save"**

#### Rule 2: Medium Orders (₹500 - ₹2000)
```
Order Amount Range:
  Min: 500
  Max: 2000

Reward Percentage: 2

Status: ✅ Active
```
**Click "Save"**

#### Rule 3: Large Orders (₹2001 - ₹999999)
```
Order Amount Range:
  Min: 2001
  Max: 999999

Reward Percentage: 3

Status: ✅ Active
```
**Click "Save"**

### ✅ Verification
You should now see 3 active SuperCoin rules in the table.

---

## Step 4: Configure Logistics & Costs (1 minute)

### Fill in these values:

```
Packing Cost:         30    (₹30 per product)
Shipping Cost:        50    (₹50 per product)
Ads Cost:             70    (₹70 per product)
Delivery Charge Base: 50    (₹50 base delivery)
Fuel Rate:            5     (₹5 per km)
```

### ✅ Verification
All fields should show the values above.

---

## Step 5: Set Rounding Strategy (30 seconds)

```
Price Rounding Strategy: Nearest ₹10 (912 to 910)
```

**Select from dropdown:** "Nearest ₹10 (912 to 910)"

---

## Step 6: Save Everything (10 seconds)

Click the big **"Save All Settings"** button at the bottom.

You should see a success message: ✅ "Settings saved successfully"

---

## Step 7: Test with Pricing Calculator (1 minute)

1. Navigate to **"Pricing Calculator"** tab
2. Enter these test values:
   ```
   Mode: Seller Price → Calculate Total
   Seller Price: 1000
   Distance: 10
   Payment Type: COD
   Quantity: 1
   ```
3. Click **"Calculate"**

### Expected Results:
```
✅ Sub Total:             ₹1080.00
✅ Admin Profit (20%):    ₹200.00
✅ Ads Cost:              ₹70.00
✅ GST (18%):             ₹243.00
✅ Delivery Charge:       ₹45.00
✅ Raw Total Price:       ₹1638.00
✅ Final Website Price:   ₹1640.00

Settlement:
✅ Seller Gets:           ₹1080.00
⚠️ Delivery Man Gets:     ₹-5.00 (negative - see note below)
✅ Admin Gets:            ₹565.00

SuperCoins:
✅ Total:                 35 coins
```

### ⚠️ About Negative Delivery Earnings

If you see **Delivery Man Gets: ₹-5.00**, this is because:
- Fuel cost (₹50) > Delivery charge (₹45)
- Distance is 10 km × ₹5/km = ₹50 fuel cost

**To fix this:**
1. Increase "Delivery Charge Base" to 60
2. OR reduce "Fuel Rate" to 4
3. OR both

---

## 🎉 You're Done!

Your pricing system is now configured and ready to use!

---

## What Happens Next?

### When a Seller Adds a Product:
1. Seller enters their price (e.g., ₹1000)
2. System finds matching profit rule (20% for ₹501-₹2000)
3. Adds logistics costs (₹30 + ₹50)
4. Calculates profit (₹200)
5. Adds ads cost (₹70)
6. Calculates GST (₹243)
7. Adds delivery charge (₹45)
8. Rounds to final price (₹1640)
9. Product is listed at ₹1640

### When a Customer Places an Order:
1. Customer pays ₹1640
2. System finds matching SuperCoin rule (2% for ₹500-₹2000)
3. Calculates coins (33 + 2 = 35 coins)
4. After delivery, credits 35 coins to customer
5. Distributes money:
   - Seller: ₹1080
   - Delivery: ₹-5 (or adjusted if you fixed it)
   - Admin: ₹565

---

## Common Adjustments

### If Prices Are Too High:
```
Option 1: Reduce profit percentages
  25% → 20%
  20% → 15%
  15% → 12%

Option 2: Reduce logistics costs
  Packing: 30 → 20
  Shipping: 50 → 40
  Ads: 70 → 50
```

### If Delivery Earnings Are Negative:
```
Option 1: Increase delivery base
  50 → 60 or 70

Option 2: Reduce fuel rate
  5 → 4 or 3

Option 3: Both
  Delivery base: 50 → 60
  Fuel rate: 5 → 4
```

### If SuperCoins Are Too Generous:
```
Reduce reward percentages:
  3% → 2%
  2% → 1.5%
  1% → 0.5%
```

---

## Testing Checklist

Before going live, test these scenarios:

- [ ] **Low-value product** (₹200)
  - Check profit is at least ₹50 (min profit)
  - Check final price is competitive

- [ ] **Mid-value product** (₹1000)
  - Check profit is 20% (₹200)
  - Check GST is calculated correctly

- [ ] **High-value product** (₹5000)
  - Check profit is 15% (₹750)
  - Check profit doesn't exceed cap

- [ ] **Short distance** (2 km)
  - Check delivery earnings are positive

- [ ] **Long distance** (50 km)
  - Check delivery earnings are positive
  - Check delivery charge is capped at ₹100

- [ ] **Small order** (₹300)
  - Check SuperCoins are 1% (3 coins)

- [ ] **Large order** (₹5000)
  - Check SuperCoins are 3% (150 coins)

---

## Troubleshooting

### "No profit rules defined" message
**Solution:** You haven't created any profit rules yet. Go back to Step 2.

### "No SuperCoin rules defined" message
**Solution:** You haven't created any coin rules yet. Go back to Step 3.

### Delivery man always gets negative earnings
**Solution:** Increase delivery base charge or reduce fuel rate. See "Common Adjustments" above.

### Prices don't match calculator
**Solution:** Click "Recalculate All Products" in Display & Rounding section to update all existing products.

### GST shows as ₹0 or empty
**Solution:** This was a bug that has been fixed. Refresh the page and try again.

---

## Advanced Configuration

### Custom Profit Rules
You can create more granular rules:
```
₹0-100:     30% profit
₹101-300:   28% profit
₹301-500:   25% profit
₹501-1000:  22% profit
₹1001-2000: 20% profit
₹2001-5000: 15% profit
₹5001+:     12% profit
```

### Dynamic SuperCoin Rewards
Create special promotions:
```
₹0-499:     1% (normal)
₹500-999:   2% (normal)
₹1000-1999: 3% (bonus tier)
₹2000-4999: 4% (premium tier)
₹5000+:     5% (VIP tier)
```

### Seasonal Adjustments
During sales/festivals:
```
Reduce profit %:    20% → 15%
Increase rewards:   2% → 3%
Reduce costs:       ₹70 → ₹50 (ads)
```

---

## Need Help?

### Documentation
- **Complete Guide:** `PRICING_RULES_AND_SETTINGS.md`
- **Visual Guide:** `PRICING_VISUAL_GUIDE.md`
- **Breakdown Explained:** `PRICING_BREAKDOWN_EXPLAINED.md`
- **Quick Reference:** `PRICING_QUICK_REFERENCE.md`

### Support
- Check the pricing calculator for real-time testing
- Review settlement previews before going live
- Monitor delivery earnings regularly
- Adjust rules based on market feedback

---

## Summary

You've successfully configured:
- ✅ 3 Profit Rules (25%, 20%, 15%)
- ✅ 3 SuperCoin Rules (1%, 2%, 3%)
- ✅ Logistics Costs (₹30, ₹50, ₹70)
- ✅ Delivery Settings (₹50 base, ₹5/km fuel)
- ✅ Rounding Strategy (Nearest ₹10)

**Total Setup Time:** ~5 minutes

**Your platform is now ready to calculate prices automatically!** 🎉

---

**Created:** 2026-02-03  
**Version:** 1.0.0  
**Author:** H-Hub Development Team
