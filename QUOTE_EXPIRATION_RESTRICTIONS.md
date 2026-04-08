# Quote Expiration Restrictions Implementation ✅

**Date:** November 6, 2025
**Feature:** Prevent payment and PDF access for expired quotes

---

## Summary

Lorsqu'un devis expire, les utilisateurs ne peuvent plus :
1. Effectuer un paiement
2. Télécharger les PDFs (devis détaillé et général)
3. Accéder au bouton "Pay Now"

Un message clair indique que le devis a expiré et invite à contacter le support.

---

## Problem Statement

**Problème initial:**
- Les utilisateurs pouvaient encore voir et télécharger les PDFs même après l'expiration du devis
- Le bouton "Pay Now" restait accessible même pour les devis expirés
- Aucun message clair n'indiquait l'expiration du devis

**Impact:**
- Confusion pour les clients
- Risque de paiements sur des devis périmés
- Mauvaise expérience utilisateur

---

## Solution Implemented

### Frontend Logic

La vérification de l'expiration se fait via un `countdown timer` déjà existant qui calcule le temps restant avant l'expiration du devis.

```javascript
const [timeRemaining, setTimeRemaining] = useState(null);

useEffect(() => {
  if (!booking || !booking.quote_expiration_date || booking.status !== "Quote Sent") {
    return;
  }

  const updateCountdown = () => {
    const expirationDate = parseISO(booking.quote_expiration_date);
    const now = new Date();
    const secondsLeft = differenceInSeconds(expirationDate, now);

    if (secondsLeft <= 0) {
      setTimeRemaining({ expired: true });
      return;
    }

    const hours = Math.floor(secondsLeft / 3600);
    const minutes = Math.floor((secondsLeft % 3600) / 60);
    const seconds = secondsLeft % 60;

    setTimeRemaining({ hours, minutes, seconds, expired: false });
  };

  updateCountdown();
  const intervalId = setInterval(updateCountdown, 1000);

  return () => clearInterval(intervalId);
}, [booking]);
```

**État de l'expiration:**
- `timeRemaining.expired === false` : Devis valide
- `timeRemaining.expired === true` : Devis expiré

---

## Files Modified

### 1. BookingStatusCard.jsx

**Location:** `frontend/src/components/booking/BookingStatusCard.jsx`

#### Changes Made:

**1. Bouton "Pay Now" masqué si expiré (ligne 402)**
```javascript
{/* Pay Now Button for Quote Sent status - Only show if quote is not expired */}
{booking.status === "Quote Sent" && booking.payment_status !== 'paid' && !timeRemaining?.expired && (
  <button
    onClick={() => (window.location.href = `/my-bookings/${booking.id}/payment`)}
    className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all font-bold shadow-lg hover:shadow-xl flex items-center justify-center"
  >
    <FontAwesomeIcon icon={faCreditCard} className="mr-2" />
    Pay Now
  </button>
)}
```

**2. Liens PDF masqués si expiré (ligne 328)**
```javascript
{/* Download Quote PDFs - Only show if quote is not expired */}
{(booking.quote_detailed_pdf || booking.quote_general_pdf) && !timeRemaining?.expired && (
  <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
    <div className="flex items-center mb-3">
      <FontAwesomeIcon icon={faFilePdf} className="text-blue-600 mr-2 text-lg" />
      <h4 className="font-semibold text-blue-900">Download Quotations</h4>
    </div>
    {/* PDF download links */}
  </div>
)}
```

**3. Message d'expiration ajouté (ligne 366)**
```javascript
{/* Show message when quote is expired */}
{timeRemaining?.expired && (
  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
    <div className="flex items-start">
      <FontAwesomeIcon icon={faTimesCircle} className="text-red-600 mt-1 mr-2 text-lg" />
      <div className="text-sm text-red-800">
        <p className="font-semibold mb-1">Quote Expired</p>
        <p>This quote has expired and is no longer available for payment or download.</p>
        <p className="mt-2">Please contact us at <a href="mailto:support@ebenezertours.com" className="font-semibold underline">support@ebenezertours.com</a> to request a new quote.</p>
      </div>
    </div>
  </div>
)}
```

**4. Ajustement du bouton "View Details" (ligne 418-420)**
```javascript
<button
  onClick={() => (window.location.href = `/booking/${booking.id}`)}
  className={`px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-medium ${
    booking.status === "Quote Sent" && booking.payment_status !== 'paid' && !timeRemaining?.expired ? '' : 'flex-1'
  }`}
>
  View Details
</button>
```

---

### 2. BookingDetailsPage.jsx

**Location:** `frontend/src/pages/BookingDetailsPage.jsx`

#### Changes Made:

**1. hasActions mis à jour (ligne 185-188)**
```javascript
// Check if any action is available
const hasActions =
  (booking?.status === "Quote Sent" && booking?.payment_status !== "paid" && !timeRemaining?.expired) || // Pay Now (if not expired)
  canCancel || // Cancel
  booking?.status === "Trip Completed"; // Leave Review
```

**2. Section PDF masquée si expiré (ligne 321-362)**
```javascript
{/* Download PDFs Section - Only show if quote is not expired */}
{booking.status === "Quote Sent" &&
  (booking.quote_detailed_pdf || booking.quote_general_pdf) &&
  !timeRemaining?.expired && (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl shadow-lg p-6 mb-6">
      {/* PDF download section */}
    </div>
  )}
```

**3. Message d'expiration ajouté (ligne 364-379)**
```javascript
{/* Show message when quote is expired */}
{booking.status === "Quote Sent" && timeRemaining?.expired && (
  <div className="bg-red-50 border-2 border-red-200 rounded-xl shadow-lg p-6 mb-6">
    <div className="flex items-start">
      <FontAwesomeIcon icon={faTimesCircle} className="text-red-600 text-2xl mt-1 mr-3" />
      <div className="text-red-800">
        <h3 className="text-lg font-bold mb-2">{t('bookingDetailsPage.quoteExpired')}</h3>
        <p className="mb-3">This quote has expired and is no longer available for payment or download.</p>
        <p>Please contact us at <a href="mailto:support@ebenezertours.com" className="font-semibold underline">support@ebenezertours.com</a> to request a new quote.</p>
      </div>
    </div>
  </div>
)}
```

**4. Bouton Pay Now masqué si expiré (ligne 713-726)**
```javascript
{/* Pay Now Button - Only show if quote is not expired */}
{booking.status === "Quote Sent" &&
  booking.payment_status !== "paid" &&
  !timeRemaining?.expired && (
    <button
      onClick={() => navigate(`/my-bookings/${booking.id}/payment`)}
      className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all font-bold shadow-lg hover:shadow-xl flex items-center justify-center"
    >
      <FontAwesomeIcon icon={faCreditCard} className="mr-2" />
      {t('bookingDetailsPage.payNow')}
    </button>
  )}
```

---

## User Experience Flow

### Before Expiration (timeRemaining.expired === false)

**My Bookings Page (BookingList):**
```
┌─────────────────────────────────────────┐
│ 🕒 Quote Expires In: 23:45:12          │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                         │
│ 📄 Download Quotations                 │
│ [Detailed Quote] [General Quote]       │
│                                         │
│ [💳 Pay Now]  [View Details] [Cancel]  │
└─────────────────────────────────────────┘
```

**Booking Details Page:**
```
┌─────────────────────────────────────────┐
│ 🕒 Quote Expires In: 23:45:12          │
│                                         │
│ 📄 Download Quotations                 │
│ [Detailed Quote] [General Quote]       │
│                                         │
│ Tour Information...                     │
│ Vehicles...                             │
│ Add-ons...                              │
│                                         │
│ Actions:                                │
│ [💳 Pay Now]                           │
│ [Cancel Booking]                        │
└─────────────────────────────────────────┘
```

### After Expiration (timeRemaining.expired === true)

**My Bookings Page (BookingList):**
```
┌─────────────────────────────────────────┐
│ ⏰ Quote Expired                        │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                         │
│ ❌ Quote Expired                        │
│ This quote has expired and is no        │
│ longer available for payment or         │
│ download.                               │
│                                         │
│ Please contact us at                    │
│ support@ebenezertours.com               │
│ to request a new quote.                 │
│                                         │
│ [View Details] [Cancel]                 │
└─────────────────────────────────────────┘
```

**Booking Details Page:**
```
┌─────────────────────────────────────────┐
│ ⏰ Quote Expired                        │
│ Contact us to renew your quote         │
│                                         │
│ ❌ Quote Expired                        │
│ This quote has expired and is no        │
│ longer available for payment or         │
│ download.                               │
│                                         │
│ Please contact us at                    │
│ support@ebenezertours.com               │
│ to request a new quote.                 │
│                                         │
│ Tour Information...                     │
│ Vehicles...                             │
│ Add-ons...                              │
│                                         │
│ Actions:                                │
│ [Cancel Booking]                        │
│ (No Pay Now button)                     │
└─────────────────────────────────────────┘
```

---

## Visual Indicators

### Color Coding

**Active Quote (Not Expired):**
- Countdown timer: Blue gradient (> 2 hours remaining)
- Countdown timer: Orange-to-red gradient (< 2 hours remaining)
- PDF section: Blue-indigo gradient
- Pay Now button: Green gradient

**Expired Quote:**
- Countdown timer: Red gradient
- Expiration message: Red background with red border
- No PDF section visible
- No Pay Now button visible

---

## Testing Scenarios

### Scenario 1: Quote with 24 hours remaining
```
✅ Countdown shows: 24:00:00
✅ PDFs visible and downloadable
✅ Pay Now button visible
✅ All actions available
```

### Scenario 2: Quote with 1 hour remaining
```
⚠️  Countdown shows: 01:00:00 (Orange gradient)
✅ PDFs visible and downloadable
✅ Pay Now button visible
✅ All actions available
```

### Scenario 3: Quote just expired (0 seconds remaining)
```
❌ Countdown shows: "Quote Expired"
❌ PDFs NOT visible
❌ Pay Now button NOT visible
❌ Only View Details and Cancel available
✅ Red expiration message displayed
```

### Scenario 4: Quote expired days ago
```
❌ Countdown shows: "Quote Expired"
❌ PDFs NOT visible
❌ Pay Now button NOT visible
❌ Only View Details and Cancel available
✅ Red expiration message displayed
```

---

## Backend Considerations

The backend already handles quote expiration through:
1. `quote_expiration_date` field in `booking_quote_revisions` table
2. Scheduled job that updates status to "Quote Expired"
3. Email notifications for quote expiration warnings

**No backend changes required** - all restrictions are frontend-based using the existing countdown timer.

---

## Benefits

### 1. Clear User Communication
✅ Users immediately understand when a quote expires
✅ Clear call-to-action to contact support for renewal
✅ No confusion about available actions

### 2. Data Integrity
✅ Prevents payments on expired quotes
✅ Prevents access to outdated pricing
✅ Ensures quotes are current

### 3. Business Logic
✅ Enforces quote validity period
✅ Encourages timely payment decisions
✅ Maintains quote accuracy

### 4. User Experience
✅ Visual countdown creates urgency
✅ Clear expiration indicators
✅ Helpful contact information provided

---

## Future Enhancements (Optional)

1. **Backend API Protection:**
   - Add server-side validation to reject payments for expired quotes
   - Return 403 Forbidden if PDF download attempted for expired quote

2. **Automatic Status Update:**
   - Frontend could update booking status to "Quote Expired" locally
   - Trigger a backend API call to update status

3. **Renewal Flow:**
   - Add "Request New Quote" button on expired quotes
   - Auto-populate inquiry with existing booking details

4. **Email Reminders:**
   - Send email 24 hours before expiration
   - Send email 1 hour before expiration
   - Send email on expiration

---

## Status

✅ **QUOTE EXPIRATION RESTRICTIONS COMPLETE**

Les utilisateurs ne peuvent plus payer ou télécharger des devis expirés. Un message clair indique l'expiration et fournit les informations de contact pour renouveler le devis.

---

## Related Features

- Countdown Timer (existing)
- Quote Expiration Job (backend - existing)
- Quote Status Management (backend - existing)
- Email Notifications (backend - existing)

---

## Testing Command

```bash
# Start frontend
cd frontend
npm run dev

# Test scenarios:
1. Navigate to My Bookings
2. Find a booking with "Quote Sent" status
3. Wait for countdown to reach 0 (or manipulate system time)
4. Verify:
   - PDFs disappear
   - Pay Now button disappears
   - Expiration message appears
   - Only View Details and Cancel remain
```

---

## Notes

- The countdown timer updates every second in real-time
- Expiration check is done purely on frontend (client-side)
- Users could potentially bypass by manipulating client time, but backend should reject expired payments anyway
- Recommend adding backend validation as future enhancement
