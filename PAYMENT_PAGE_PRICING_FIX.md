# Payment Page Pricing Fix

## Issue
The payment page was not correctly retrieving the final price that includes discounts and additional fees. The `getBookingById` API endpoint was only returning the base `final_price` from the `bookings` table, which doesn't reflect admin adjustments, discounts, or additional fees calculated during the quote review process.

## Root Cause
The application has a comprehensive quote revision system (`booking_quote_revisions` table) where admins:
- Validate tier, vehicles, addons, participants, and dates
- Apply discounts (early bird, group discounts, etc.)
- Add additional fees (peak season surcharges, etc.)
- Calculate the final price with all adjustments

However, the `getBookingById` controller was not fetching this quote revision data, so the payment page showed incomplete pricing information.

## Solution Applied
Modified the `getBookingById` function in `backend/src/controllers/bookingControllerNew.js` to:

1. **Fetch the latest quote revision** for the booking:
```javascript
const revisionResult = await db.query(
  `SELECT * FROM booking_quote_revisions
   WHERE booking_id = $1
   ORDER BY revision_number DESC
   LIMIT 1`,
  [id]
);
```

2. **Override booking prices with revision data** if a revision exists:
```javascript
if (revisionResult.rows.length > 0) {
  const revision = revisionResult.rows[0];

  // Override booking prices with revision data (which includes discounts and fees)
  booking.final_price = revision.final_price;
  booking.base_price = revision.base_price;
  booking.vehicles_price = revision.vehicles_price;
  booking.addons_price = revision.addons_price;
  booking.subtotal_price = revision.subtotal_price;
  booking.total_discounts = revision.total_discounts;
  booking.total_fees = revision.total_fees;
  booking.discounts = revision.discounts;
  booking.additional_fees = revision.additional_fees;

  // Store complete revision data for reference
  booking.quote_revision = revision;
}
```

## Benefits

### 1. **Accurate Pricing Display**
The payment page now shows the correct final price that includes:
- Base tier price
- Vehicle costs (× tour duration)
- Add-on costs (× participants for per-person items)
- **Minus: All discounts applied**
- **Plus: All additional fees**

### 2. **Transparency**
The response now includes:
- `booking.total_discounts` - Total discount amount
- `booking.total_fees` - Total additional fees
- `booking.discounts` - Array of all discount details
- `booking.additional_fees` - Array of all fee details
- `booking.quote_revision` - Complete revision object for reference

### 3. **Multi-Currency Support**
Combined with the previous fix adding currency conversion to the payment page, users now see the accurate final price in their selected currency.

## Price Calculation Flow

```
base_price (tier price)
+ vehicles_price (vehicles × duration)
+ addons_price (addons × participants where applicable)
= subtotal_price

subtotal_price
- total_discounts (from discounts array)
+ total_fees (from additional_fees array)
= final_price
```

## API Response Structure

The `/api/bookings/:id` endpoint now returns:

```json
{
  "success": true,
  "data": {
    "id": 111,
    "booking_reference": "EB-2025-123456",
    "status": "Quote Sent",

    // Basic booking info
    "tour_name": "Golden Triangle Tour",
    "travel_date": "2025-02-15",
    "num_adults": 2,
    "num_children": 0,

    // Pricing from latest quote revision
    "base_price": 45000,
    "vehicles_price": 18000,
    "addons_price": 4000,
    "subtotal_price": 67000,
    "total_discounts": 6700,
    "total_fees": 2000,
    "final_price": 62300,

    // Discount details
    "discounts": [
      {
        "id": "disc_1",
        "type": "early_bird",
        "name": "Early Bird Discount",
        "amount": 5000,
        "percentage": 10,
        "reason": "Booking more than 30 days in advance"
      },
      {
        "id": "disc_2",
        "type": "group",
        "name": "Group Discount",
        "amount": 1700,
        "percentage": null,
        "reason": "Group of 5+ travelers"
      }
    ],

    // Additional fee details
    "additional_fees": [
      {
        "id": "fee_1",
        "type": "peak_season",
        "name": "Peak Season Surcharge",
        "amount": 2000,
        "percentage": null,
        "reason": "Travel during Christmas holidays"
      }
    ],

    // Complete revision for reference
    "quote_revision": { ... }
  }
}
```

## Testing

To test the fix:

1. **Create a booking inquiry** or use an existing booking with ID (e.g., 111)

2. **Admin sends quote** with discounts and fees applied

3. **User accesses payment page**:
   ```
   http://localhost:3000/my-bookings/111/payment
   ```

4. **Verify**:
   - Final price matches the amount from the quote revision
   - Discounts are subtracted from the subtotal
   - Additional fees are added
   - Currency conversion works correctly
   - All amounts display in the user's selected currency

## Files Modified

- **`backend/src/controllers/bookingControllerNew.js`** (Lines 291-317)
  - Added quote revision fetching logic
  - Added price override from revision data

## Related Files

- **`backend/src/db/migrations/create_booking_quote_revisions_table.sql`**
  - Defines the quote revision schema

- **`backend/src/controllers/quoteRevisionController.js`**
  - Contains functions for managing quote revisions

- **`frontend/src/pages/PaymentPage.jsx`**
  - Payment page that displays the final price with currency conversion

## Previous Related Fix

- **PAYMENT_PAGE_CURRENCY_I18N_IMPLEMENTATION.md**
  - Added currency conversion and translations to payment page
  - Combined with this fix, provides complete payment page functionality

## Status
✅ **FIXED** - Payment page now correctly retrieves and displays final price with all discounts and fees included.
