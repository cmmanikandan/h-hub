# ℹ️ Info Icons Guide - Pricing Calculator

## Overview
The Pricing Calculator now includes helpful info icons (ℹ️) throughout the interface. Click any info icon to see detailed guidelines and explanations.

---

## 📍 Info Icon Locations

### 1. **Input Mode** Section
**Location:** Top of left column, next to "Input Mode" heading

**Click to see:**
- **Mode A (Forward):** Enter seller price to calculate final customer price.
- **Mode B (Reverse):** Enter target market price to find required seller price.
- **💡 Tip:** Use Mode A for normal pricing, Mode B for competitive pricing strategy.

---

### 2. **Input Fields** Section
**Location:** Next to "Mode A: Seller Price Input" or "Mode B: Final Price Input" heading

**For Mode A (Seller Price Input):**
- **Seller Price:** The base price set by the seller.
- **Distance:** Delivery distance in kilometers (affects delivery charge).
- **Payment Type:** COD or Online (may affect charges).
- **Quantity:** Number of units (multiplies costs).

**For Mode B (Final Price Input):**
- **Final Website Price:** Target price you want customers to see.
- System will reverse-calculate the required seller price.
- **⚠️ Note:** Reverse calculation is approximate.

---

### 3. **Applied System Rules** Section
**Location:** Next to "Applied System Rules" heading

**Click to see:**
- **Profit Rule:** Percentage profit based on seller price range.
- **Rounding Strategy:** How final price is rounded (Nearest ₹10 or Psychological ₹99).
- **Fuel Rate:** Cost per kilometer for delivery.
- **SuperCoin Reward:** Percentage of order value given as loyalty coins.
- **✅ These are live rules from your settings.**

---

### 4. **Price Breakdown** Section
**Location:** Next to "💰 PRICE BREAKDOWN" heading (right column)

**Click to see:**
- **Sub Total:** Seller Price + Packing + Shipping
- **Admin Profit:** Calculated using profit rules (% of seller price)
- **GST:** 18% on (Sub Total + Profit + Ads)
- **Delivery Charge:** Based on distance and order value
- **Raw Price:** Total before rounding
- **Final Price:** Rounded price shown to customers

---

### 5. **Settlement Preview** Section
**Location:** Next to "💸 SETTLEMENT PREVIEW" heading (right column)

**Click to see:**
- **Seller Gets:** Seller Price + Packing + Shipping
- **Delivery Man Gets:** Delivery Charge - Fuel Cost
- **Admin Gets:** Profit + Ads + GST + Fuel + Rounding
- **⚠️ If delivery earnings are negative, increase delivery base charge or reduce fuel rate.**

---

### 6. **SuperCoins Earned** Section
**Location:** Next to "🪙 SUPERCOINS EARNED" heading (right column)

**Click to see:**
- **From Rounding:** Difference when final price > raw price
- **From Order Value:** Percentage based on SuperCoin rules (1-3%)
- **Value:** 1 SuperCoin = ₹1 for future purchases
- **✅ Credited after delivery completion**

---

## 🎨 Visual Design

### Info Icon Appearance
```
┌──────────────────────────────────────┐
│  Input Mode                    ℹ️    │
│                                      │
│  [Mode selector options]             │
└──────────────────────────────────────┘
```

### Icon Features
- **Color:** Purple gradient (matches theme)
- **Size:** 24px × 24px
- **Shape:** Circular button
- **Icon:** Info symbol (ℹ️)
- **Hover:** Slight scale effect
- **Click:** Opens tooltip modal

### Tooltip Appearance
```
┌─────────────────────────────────────────┐
│ Input Mode                          ✕   │ ← Purple header
├─────────────────────────────────────────┤
│                                         │
│ Mode A (Forward): Enter seller price    │
│ to calculate final customer price.      │
│                                         │
│ Mode B (Reverse): Enter target market   │
│ price to find required seller price.    │
│                                         │
│ 💡 Tip: Use Mode A for normal pricing,  │
│ Mode B for competitive pricing strategy.│
│                                         │
└─────────────────────────────────────────┘
```

### Tooltip Features
- **Header:** Purple gradient with title and close button
- **Content:** White background with formatted text
- **Animation:** Smooth slide-in effect
- **Backdrop:** Semi-transparent overlay (click to close)
- **Position:** Right side (or left for right column items)
- **Max Width:** 450px
- **Max Height:** 400px (scrollable if needed)

---

## 🎯 Usage Instructions

### For Users
1. **Look for the ℹ️ icon** next to section headings
2. **Click the icon** to open the help tooltip
3. **Read the guidelines** and tips
4. **Click the X button** or backdrop to close
5. **Use the information** to understand the feature

### For Developers
```javascript
import InfoTooltip from './InfoTooltip';

// Basic usage
<InfoTooltip 
    title="Section Title"
    content="Simple text explanation"
/>

// Advanced usage with JSX content
<InfoTooltip 
    title="Section Title"
    content={
        <div>
            <p><strong>Point 1:</strong> Explanation</p>
            <p style={{ marginTop: '8px' }}><strong>Point 2:</strong> More info</p>
            <p style={{ marginTop: '8px', color: '#f59e0b' }}>💡 Tip: Helpful tip</p>
        </div>
    }
    position="left" // or "right" (default)
/>
```

---

## 📝 Content Guidelines

### Structure
Each tooltip should include:
1. **Main explanation** - What this section does
2. **Key points** - Important details
3. **Tips/Warnings** - Helpful advice or cautions

### Formatting
- Use `<strong>` for labels
- Use emojis for visual cues (💡, ⚠️, ✅)
- Use colors for emphasis:
  - `#f59e0b` (amber) for tips
  - `#ef4444` (red) for warnings
  - `#10b981` (green) for success/confirmation

### Example
```jsx
<div>
    <p><strong>Label:</strong> Explanation of the feature.</p>
    <p style={{ marginTop: '8px' }}><strong>Another Point:</strong> More details.</p>
    <p style={{ marginTop: '8px', color: '#f59e0b' }}>💡 Tip: Helpful suggestion.</p>
    <p style={{ marginTop: '8px', color: '#ef4444' }}>⚠️ Warning: Important caution.</p>
    <p style={{ marginTop: '8px', color: '#10b981' }}>✅ Note: Confirmation or success message.</p>
</div>
```

---

## 🔧 Technical Details

### Component Props
```typescript
interface InfoTooltipProps {
    title: string;              // Tooltip header title
    content: string | JSX.Element;  // Tooltip content (text or JSX)
    position?: 'left' | 'right';    // Tooltip position (default: 'right')
}
```

### Styling
- **Icon Button:** Purple gradient, circular, 24px
- **Overlay:** Semi-transparent black with blur
- **Tooltip:** White background, purple border, rounded corners
- **Header:** Purple gradient, white text
- **Content:** Scrollable, max 400px height

### Animation
- **Slide-in:** 0.2s ease-out
- **Scale:** From 0.95 to 1.0
- **Opacity:** From 0 to 1

---

## 🎓 Best Practices

### When to Use Info Icons
✅ **DO use for:**
- Complex features that need explanation
- Technical terms or jargon
- Multi-step processes
- Important warnings or tips
- Configuration options

❌ **DON'T use for:**
- Obvious or self-explanatory features
- Every single element (avoid clutter)
- Long documentation (link to docs instead)
- Redundant information

### Content Writing
✅ **DO:**
- Keep it concise and scannable
- Use bullet points or short paragraphs
- Include actionable tips
- Use consistent formatting
- Test on mobile devices

❌ **DON'T:**
- Write long paragraphs
- Use technical jargon without explanation
- Repeat information from the UI
- Forget to proofread

---

## 📱 Responsive Behavior

### Desktop
- Tooltip appears to the right (or left)
- Full width (320-450px)
- Smooth animations

### Tablet
- Tooltip adjusts position if near edge
- Slightly smaller max width
- Touch-friendly close button

### Mobile
- Tooltip centers on screen
- Full-width with padding
- Larger close button
- Backdrop tap to close

---

## 🚀 Future Enhancements

### Planned Features
- [ ] Keyboard navigation (Esc to close)
- [ ] Accessibility improvements (ARIA labels)
- [ ] Animation preferences (respect prefers-reduced-motion)
- [ ] Multi-language support
- [ ] Video/GIF support in tooltips
- [ ] Link to full documentation
- [ ] Search within tooltips
- [ ] Bookmark favorite tips

---

## 📊 Analytics (Future)

Track info icon usage to improve documentation:
- Most clicked icons
- Average time spent reading
- Tooltips that lead to actions
- User feedback on helpfulness

---

## 🎨 Customization

### Theme Colors
```javascript
// Current theme
primary: '#6366f1'    // Indigo
secondary: '#8b5cf6'  // Purple
success: '#10b981'    // Green
warning: '#f59e0b'    // Amber
error: '#ef4444'      // Red
```

### Size Variants (Future)
```javascript
// Small (16px icon)
<InfoTooltip size="sm" ... />

// Medium (24px icon) - default
<InfoTooltip size="md" ... />

// Large (32px icon)
<InfoTooltip size="lg" ... />
```

---

## 📚 Related Documentation

- [PRICING_CALCULATOR.md](PRICING_CALCULATOR.md) - Full calculator documentation
- [PRICING_QUICK_START.md](PRICING_QUICK_START.md) - Setup guide
- [PRICING_BREAKDOWN_EXPLAINED.md](PRICING_BREAKDOWN_EXPLAINED.md) - Detailed calculations
- [PRICING_VISUAL_GUIDE.md](PRICING_VISUAL_GUIDE.md) - Visual diagrams

---

## 🐛 Troubleshooting

### Info icon not appearing
- Check if InfoTooltip component is imported
- Verify icon is inside a flex container
- Check z-index conflicts

### Tooltip not opening
- Check browser console for errors
- Verify onClick handler is working
- Check if overlay is blocking clicks

### Tooltip position wrong
- Adjust `position` prop ('left' or 'right')
- Check parent container positioning
- Verify viewport has enough space

### Animation not smooth
- Check browser performance
- Verify CSS animation is injected
- Test in different browsers

---

**Last Updated:** 2026-02-03  
**Version:** 1.0.0  
**Component:** InfoTooltip.jsx  
**Author:** H-Hub Development Team
