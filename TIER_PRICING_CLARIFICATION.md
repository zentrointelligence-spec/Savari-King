# 🎯 Tier Pricing System Clarification

**Date:** October 23, 2025
**Issue:** Confusion about tier pricing model

---

## ⚠️ CRITICAL DISCOVERY

### Pricing Model in Database:

**Table:** `packagetiers`
**Price Column:** `price` (NUMERIC(10,2))

**The `price` field is the TOTAL PRICE for the entire package tier, NOT per person!**

### Example:

```sql
SELECT id, tier_name, price FROM packagetiers WHERE tour_id = 1;
```

| ID | tier_name | price |
|----|-----------|-------|
| 1  | Standard  | ₹80,000  |
| 2  | Deluxe    | ₹120,000 |
| 3  | Luxury    | ₹180,000 |

**These prices are for the ENTIRE package**, which includes:
- Accommodation
- Meals
- Included vehicle
- Activities
- Guide services

### Participant Count IS Flexible:

The booking system allows:
- `num_adults`: Variable
- `num_children`: Variable
- `num_teens`: Variable (via `participant_ages`)
- `num_seniors`: Variable (via `participant_ages`)

**But the tier price remains FIXED regardless of group size!**

---

## 🔄 Correct Pricing Logic:

### When Customer Books:

```javascript
estimated_price = tier.price + vehicles_additional + addons
```

**NOT:**
```javascript
// ❌ WRONG
estimated_price = tier.price_per_person × total_participants
```

### When Admin Modifies Tier:

```javascript
new_base_price = new_tier.price
// NOT multiplied by participants!
```

---

## 🛠️ Required Fixes:

1. **Remove `price_per_person` calculation** from TierValidationSection
2. **Do NOT multiply tier price** by number of participants
3. **Tier price is the base price** for the package
4. **Additional costs come from:**
   - Extra vehicles (if group size exceeds included vehicle capacity)
   - Add-ons
   - Fees

---

## ✅ Correct Implementation:

```javascript
// When tier changes
const handleTierChange = (tierId) => {
  const tier = availableTiers.find(t => t.id === parseInt(tierId));
  if (tier) {
    // Use tier.price directly as base price
    const newBasePrice = parseFloat(tier.price);
    setFormData({
      ...formData,
      new_tier_id: tier.id,
      tier_adjusted_price: newBasePrice  // NOT multiplied!
    });
  }
};
```

**Backend:**
```javascript
// Get tier price
const tierResult = await db.query(
  'SELECT price FROM packagetiers WHERE id = $1',
  [tierid]
);

// Use as-is
const newBasePrice = parseFloat(tierResult.rows[0].price);
// Do NOT multiply by num_adults + num_children!
```

---

## 📊 Pricing Breakdown Example:

**Tour:** Rajasthan Heritage Tour
**Tier:** Standard (₹80,000 for package)
**Group:** 4 adults

```
Base Price (Tier):        ₹80,000   ← Fixed tier price
Additional Vehicle:       ₹15,000   ← If needed for capacity
Add-ons:                  ₹5,000
────────────────────────────────
Subtotal:                 ₹100,000
Discount (early bird):    -₹10,000
────────────────────────────────
FINAL PRICE:              ₹90,000
```

**Per Person Cost:** ₹90,000 ÷ 4 = ₹22,500/person (calculated for display only)

---

## 🔍 Why This Model Makes Sense:

1. **Fixed Accommodation Costs:**
   - Hotel rooms cost the same whether 2 or 4 people
   - Tour operator books specific room types per tier

2. **Fixed Transport:**
   - Each tier includes a specific vehicle
   - Vehicle cost doesn't change with passenger count (within capacity)

3. **Fixed Guide/Service:**
   - Guide fees are per group, not per person

4. **Scalable Add-ons:**
   - Meals, activities, entrance fees ARE per person
   - These are separate add-ons, not in base tier price

---

## ⚡ Action Items:

- [ ] Remove `price_per_person` logic from TierValidationSection
- [ ] Update tier dropdown to show total price
- [ ] Remove multiplication by participants
- [ ] Update backend to use `tier.price` directly
- [ ] Fix packagetiers table references (not tourtiers)
- [ ] Update documentation

