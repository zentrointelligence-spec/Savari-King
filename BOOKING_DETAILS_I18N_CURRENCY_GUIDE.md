# 🌍 Guide: Adding i18n and Currency to BookingDetailsPage

**Date:** 26 octobre 2025
**Status:** ✅ **READY TO IMPLEMENT**

---

## 📝 Résumé

Ce guide montre comment ajouter les traductions i18n et la conversion de devises à la page `BookingDetailsPage.jsx`.

---

## ✅ PRÉPARATIONS COMPLÉTÉES

### 1. Traductions Ajoutées

✅ **Fichiers de langue mis à jour:**
- `frontend/src/i18n/locales/en.json` - Section `bookingDetailsPage` ajoutée
- `frontend/src/i18n/locales/fr.json` - Section `bookingDetailsPage` ajoutée
- `frontend/src/i18n/locales/es.json` - Section `bookingDetailsPage` ajoutée
- `frontend/src/i18n/locales/hi.json` - Section `bookingDetailsPage` ajoutée
- `frontend/src/i18n/locales/it.json` - Section `bookingDetailsPage` ajoutée
- `frontend/src/i18n/locales/ms.json` - Section `bookingDetailsPage` ajoutée
- `frontend/src/i18n/locales/zh.json` - Section `bookingDetailsPage` ajoutée

### 2. Imports Ajoutés

✅ **Les imports suivants ont été ajoutés à `BookingDetailsPage.jsx`:**

```javascript
import { useTranslation } from 'react-i18next';
import { useCurrency } from "../contexts/CurrencyContext";

// Dans le composant:
const { t } = useTranslation();
const { convertAndFormat, currency } = useCurrency();
```

**IMPORTANT:** Utilisez `convertAndFormat()` pour convertir les prix INR vers la devise sélectionnée ET les formater.
- `convertAndFormat(priceINR)` - Convertit INR → devise sélectionnée + formate avec symbole
- Ne pas utiliser `convertAndFormat()` seul car il ne convertit pas!

---

## 🔧 MODIFICATIONS À APPLIQUER

### 1. Remplacer les Textes Hardcodés

#### A. Titre de la Page (ligne ~227)

**AVANT:**
```javascript
<h1 className="text-3xl font-bold text-gray-900">Booking Details</h1>
```

**APRÈS:**
```javascript
<h1 className="text-3xl font-bold text-gray-900">{t('bookingDetailsPage.title')}</h1>
```

---

#### B. Bouton "Back to My Bookings" (ligne ~222-225)

**AVANT:**
```javascript
<button
  onClick={() => navigate("/my-bookings")}
  className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
>
  <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
  Back to My Bookings
</button>
```

**APRÈS:**
```javascript
<button
  onClick={() => navigate("/my-bookings")}
  className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
>
  <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
  {t('bookingDetailsPage.backToBookings')}
</button>
```

---

#### C. Référence de Réservation (ligne ~246-249)

**AVANT:**
```javascript
<p className="text-sm opacity-70">Booking Reference</p>
<p className="text-xl font-mono font-bold">
  {booking.booking_reference}
</p>
```

**APRÈS:**
```javascript
<p className="text-sm opacity-70">{t('bookingDetailsPage.bookingReference')}</p>
<p className="text-xl font-mono font-bold">
  {booking.booking_reference}
</p>
```

---

#### D. Statuts de Réservation (ligne ~103-143)

**AVANT:**
```javascript
const getStatusConfig = (status) => {
  const configs = {
    "Inquiry Pending": {
      color: "bg-yellow-100 text-yellow-800 border-yellow-300",
      icon: faHourglassHalf,
      text: "🟡 Inquiry Pending",
      description: "Our team is reviewing your request",
    },
    "Quote Sent": {
      color: "bg-blue-100 text-blue-800 border-blue-300",
      icon: faFileInvoice,
      text: "📧 Quote Ready",
      description: "Review your quote and proceed to payment",
    },
    // ... etc
  };
  return configs[status] || configs["Inquiry Pending"];
};
```

**APRÈS:**
```javascript
const getStatusConfig = (status) => {
  const configs = {
    "Inquiry Pending": {
      color: "bg-yellow-100 text-yellow-800 border-yellow-300",
      icon: faHourglassHalf,
      text: `🟡 ${t('bookingDetailsPage.statusInquiryPending')}`,
      description: t('bookingDetailsPage.descInquiryPending'),
    },
    "Quote Sent": {
      color: "bg-blue-100 text-blue-800 border-blue-300",
      icon: faFileInvoice,
      text: `📧 ${t('bookingDetailsPage.statusQuoteReady')}`,
      description: t('bookingDetailsPage.descQuoteReady'),
    },
    "Quote Expired": {
      color: "bg-gray-100 text-gray-800 border-gray-300",
      icon: faClock,
      text: `⏰ ${t('bookingDetailsPage.statusQuoteExpired')}`,
      description: t('bookingDetailsPage.descQuoteExpired'),
    },
    "Payment Confirmed": {
      color: "bg-green-100 text-green-800 border-green-300",
      icon: faCheckCircle,
      text: `✅ ${t('bookingDetailsPage.statusConfirmed')}`,
      description: t('bookingDetailsPage.descConfirmed'),
    },
    Cancelled: {
      color: "bg-red-100 text-red-800 border-red-300",
      icon: faTimesCircle,
      text: `❌ ${t('bookingDetailsPage.statusCancelled')}`,
      description: t('bookingDetailsPage.descCancelled'),
    },
    "Trip Completed": {
      color: "bg-purple-100 text-purple-800 border-purple-300",
      icon: faCheckCircle,
      text: `🎉 ${t('bookingDetailsPage.statusTripCompleted')}`,
      description: t('bookingDetailsPage.descTripCompleted'),
    },
  };
  return configs[status] || configs["Inquiry Pending"];
};
```

---

### 2. Ajouter la Conversion de Devises

#### A. Prix Final / Estimation (ligne ~430-437)

**AVANT:**
```javascript
<p className="font-bold text-gray-900">
  ₹
  {(
    booking.final_price ||
    booking.estimated_price ||
    0
  ).toLocaleString()}
</p>
```

**APRÈS:**
```javascript
<p className="font-bold text-gray-900">
  {convertAndFormat(
    booking.final_price ||
    booking.estimated_price ||
    0
  )}
</p>
```

---

#### B. Prix des Véhicules (ligne ~518-520)

**AVANT:**
```javascript
{vehicle.price ? (
  <p className="font-bold text-gray-900 text-lg">
    ₹{parseFloat(vehicle.price).toLocaleString()}
  </p>
) : (
  <p className="text-xs text-gray-500 italic">Price TBD</p>
)}
```

**APRÈS:**
```javascript
{vehicle.price ? (
  <p className="font-bold text-gray-900 text-lg">
    {convertAndFormat(parseFloat(vehicle.price))}
  </p>
) : (
  <p className="text-xs text-gray-500 italic">{t('bookingDetailsPage.priceTBD')}</p>
)}
```

---

#### C. Prix des Add-ons (ligne ~568-574)

**AVANT:**
```javascript
{addon.price !== undefined ? (
  <p className="font-bold text-gray-900 text-lg">
    ₹{parseFloat(addon.price).toLocaleString()}
  </p>
) : (
  <p className="text-xs text-gray-500 italic">Price TBD</p>
)}
```

**APRÈS:**
```javascript
{addon.price !== undefined ? (
  <p className="font-bold text-gray-900 text-lg">
    {convertAndFormat(parseFloat(addon.price))}
  </p>
) : (
  <p className="text-xs text-gray-500 italic">{t('bookingDetailsPage.priceTBD')}</p>
)}
```

---

### 3. Traductions pour les Catégories d'Âge

#### Modification du Code (ligne ~416-420)

**AVANT:**
```javascript
let categoryName = ageGroup.label || ageGroup.id || 'Participant';
if (ageGroup.id === 'adult') categoryName = 'Adults';
else if (ageGroup.id === 'child') categoryName = 'Children';
else if (ageGroup.id === 'teen') categoryName = 'Teenagers';
else if (ageGroup.id === 'senior') categoryName = 'Seniors';
else if (ageGroup.id === 'infant') categoryName = 'Infants';
```

**APRÈS:**
```javascript
let categoryName = ageGroup.label || ageGroup.id || t('booking.participant');
if (ageGroup.id === 'adult') categoryName = t('bookingDetailsPage.adults');
else if (ageGroup.id === 'child') categoryName = t('bookingDetailsPage.children');
else if (ageGroup.id === 'teen') categoryName = t('bookingDetailsPage.teenagers');
else if (ageGroup.id === 'senior') categoryName = t('bookingDetailsPage.seniors');
else if (ageGroup.id === 'infant') categoryName = t('bookingDetailsPage.infants');
```

---

### 4. Sections Complètes à Traduire

#### A. Section "Tour Information" (ligne ~358)

**AVANT:**
```javascript
<h3 className="text-xl font-bold text-gray-900 mb-4">
  Tour Information
</h3>
```

**APRÈS:**
```javascript
<h3 className="text-xl font-bold text-gray-900 mb-4">
  {t('bookingDetailsPage.tourInformation')}
</h3>
```

---

#### B. Package Label (ligne ~380)

**AVANT:**
```javascript
<span>{booking.tier_name || "Standard"} Package</span>
```

**APRÈS:**
```javascript
<span>{booking.tier_name || "Standard"} {t('bookingDetailsPage.package')}</span>
```

---

#### C. Tour Duration (ligne ~384)

**AVANT:**
```javascript
<span>{booking.duration_days || 4} Days Tour</span>
```

**APRÈS:**
```javascript
<span>{t('bookingDetailsPage.daysTour', { count: booking.duration_days || 4 })}</span>
```

---

#### D. Travel Date Label (ligne ~397)

**AVANT:**
```javascript
<span className="text-xs font-medium">Travel Date</span>
```

**APRÈS:**
```javascript
<span className="text-xs font-medium">{t('bookingDetailsPage.travelDate')}</span>
```

---

#### E. Price Label (ligne ~426-428)

**AVANT:**
```javascript
<span className="text-xs font-medium">
  {booking.final_price ? "Final Price" : "Estimate"}
</span>
```

**APRÈS:**
```javascript
<span className="text-xs font-medium">
  {booking.final_price ? t('bookingDetailsPage.finalPrice') : t('bookingDetailsPage.estimate')}
</span>
```

---

#### F. Selected Vehicles Title (ligne ~483-485)

**AVANT:**
```javascript
<h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
  <FontAwesomeIcon icon={faCarSide} className="mr-2" />
  Selected Vehicles
</h3>
```

**APRÈS:**
```javascript
<h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
  <FontAwesomeIcon icon={faCarSide} className="mr-2" />
  {t('bookingDetailsPage.selectedVehicles')}
</h3>
```

---

#### G. Capacity Label (ligne ~502-505)

**AVANT:**
```javascript
<div className="flex items-center text-sm text-gray-600 mb-1">
  <FontAwesomeIcon icon={faUsers} className="mr-2 text-blue-500" />
  <span>Capacity: <strong>{vehicle.capacity}</strong> passengers</span>
</div>
```

**APRÈS:**
```javascript
<div className="flex items-center text-sm text-gray-600 mb-1">
  <FontAwesomeIcon icon={faUsers} className="mr-2 text-blue-500" />
  <span>{t('booking.capacity')}: <strong>{vehicle.capacity}</strong> {t('bookingDetailsPage.passengers')}</span>
</div>
```

---

#### H. Quantity Label (ligne ~514-516)

**AVANT:**
```javascript
<p className="text-sm text-gray-600 mb-1">
  Qty: <strong className="text-blue-600">{vehicle.quantity || 1}</strong>
</p>
```

**APRÈS:**
```javascript
<p className="text-sm text-gray-600 mb-1">
  {t('bookingDetailsPage.qty')}: <strong className="text-blue-600">{vehicle.quantity || 1}</strong>
</p>
```

---

#### I. Vehicle ID Fallback (ligne ~507-510)

**AVANT:**
```javascript
{!hasDetails && (
  <p className="text-xs text-yellow-600 italic">
    Vehicle ID: {vehicle.vehicle_id || 'N/A'}
  </p>
)}
```

**APRÈS:**
```javascript
{!hasDetails && (
  <p className="text-xs text-yellow-600 italic">
    {t('bookingDetailsPage.vehicleID')}: {vehicle.vehicle_id || 'N/A'}
  </p>
)}
```

---

#### J. Selected Add-ons Title (ligne ~535-537)

**AVANT:**
```javascript
<h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
  <FontAwesomeIcon icon={faPlusCircle} className="mr-2" />
  Selected Add-ons
</h3>
```

**APRÈS:**
```javascript
<h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
  <FontAwesomeIcon icon={faPlusCircle} className="mr-2" />
  {t('bookingDetailsPage.selectedAddons')}
</h3>
```

---

#### K. Addon ID Fallback (ligne ~558-562)

**AVANT:**
```javascript
{!hasDetails && (
  <p className="text-xs text-yellow-600 italic">
    Add-on ID: {addon.addon_id || 'N/A'}
  </p>
)}
```

**APRÈS:**
```javascript
{!hasDetails && (
  <p className="text-xs text-yellow-600 italic">
    {t('bookingDetailsPage.addonID')}: {addon.addon_id || 'N/A'}
  </p>
)}
```

---

#### L. Contact Information Section (ligne ~523-564)

**AVANT:**
```javascript
<h3 className="text-xl font-bold text-gray-900 mb-4">
  Contact Information
</h3>
<div className="space-y-3">
  <div className="flex items-start">
    <FontAwesomeIcon icon={faUsers} className="text-gray-600 mr-3 mt-1" />
    <div>
      <p className="text-sm text-gray-600">Contact Name</p>
      <p className="font-semibold text-gray-900">{booking.contact_name}</p>
    </div>
  </div>
  <div className="flex items-start">
    <FontAwesomeIcon icon={faEnvelope} className="text-gray-600 mr-3 mt-1" />
    <div>
      <p className="text-sm text-gray-600">Email</p>
      <p className="font-semibold text-gray-900">{booking.contact_email}</p>
    </div>
  </div>
  <div className="flex items-start">
    <FontAwesomeIcon icon={faPhone} className="text-gray-600 mr-3 mt-1" />
    <div>
      <p className="text-sm text-gray-600">Phone</p>
      <p className="font-semibold text-gray-900">{booking.contact_phone}</p>
    </div>
  </div>
</div>
```

**APRÈS:**
```javascript
<h3 className="text-xl font-bold text-gray-900 mb-4">
  {t('bookingDetailsPage.contactInformation')}
</h3>
<div className="space-y-3">
  <div className="flex items-start">
    <FontAwesomeIcon icon={faUsers} className="text-gray-600 mr-3 mt-1" />
    <div>
      <p className="text-sm text-gray-600">{t('bookingDetailsPage.contactName')}</p>
      <p className="font-semibold text-gray-900">{booking.contact_name}</p>
    </div>
  </div>
  <div className="flex items-start">
    <FontAwesomeIcon icon={faEnvelope} className="text-gray-600 mr-3 mt-1" />
    <div>
      <p className="text-sm text-gray-600">{t('bookingDetailsPage.email')}</p>
      <p className="font-semibold text-gray-900">{booking.contact_email}</p>
    </div>
  </div>
  <div className="flex items-start">
    <FontAwesomeIcon icon={faPhone} className="text-gray-600 mr-3 mt-1" />
    <div>
      <p className="text-sm text-gray-600">{t('bookingDetailsPage.phone')}</p>
      <p className="font-semibold text-gray-900">{booking.contact_phone}</p>
    </div>
  </div>
</div>
```

---

#### M. Actions Section (ligne ~569-604)

**AVANT:**
```javascript
<h3 className="text-xl font-bold text-gray-900 mb-4">Actions</h3>
<div className="space-y-3">
  {booking.status === "Quote Sent" && booking.payment_status !== "paid" && (
    <button onClick={() => navigate(`/my-bookings/${booking.id}/payment`)}>
      <FontAwesomeIcon icon={faCreditCard} className="mr-2" />
      Pay Now
    </button>
  )}

  {canCancel && (
    <button onClick={handleCancelBooking} disabled={cancelling}>
      {cancelling ? "Cancelling..." : "Cancel Booking"}
    </button>
  )}

  {booking.status === "Trip Completed" && (
    <button onClick={() => navigate(`/review/${booking.tour_id}`)}>
      Leave a Review
    </button>
  )}
</div>
```

**APRÈS:**
```javascript
<h3 className="text-xl font-bold text-gray-900 mb-4">{t('bookingDetailsPage.actions')}</h3>
<div className="space-y-3">
  {booking.status === "Quote Sent" && booking.payment_status !== "paid" && (
    <button onClick={() => navigate(`/my-bookings/${booking.id}/payment`)}>
      <FontAwesomeIcon icon={faCreditCard} className="mr-2" />
      {t('bookingDetailsPage.payNow')}
    </button>
  )}

  {canCancel && (
    <button onClick={handleCancelBooking} disabled={cancelling}>
      {cancelling ? t('bookingDetailsPage.cancelling') : t('bookingDetailsPage.cancelBooking')}
    </button>
  )}

  {booking.status === "Trip Completed" && (
    <button onClick={() => navigate(`/review/${booking.tour_id}`)}>
      {t('bookingDetailsPage.leaveReview')}
    </button>
  )}
</div>
```

---

#### N. Loading State (ligne ~179-191)

**AVANT:**
```javascript
if (loading) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <FontAwesomeIcon icon={faSpinner} spin className="text-5xl text-primary mb-4" />
        <p className="text-gray-600">Loading booking details...</p>
      </div>
    </div>
  );
}
```

**APRÈS:**
```javascript
if (loading) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <FontAwesomeIcon icon={faSpinner} spin className="text-5xl text-primary mb-4" />
        <p className="text-gray-600">{t('bookingDetailsPage.loadingBooking')}</p>
      </div>
    </div>
  );
}
```

---

#### O. Booking Not Found (ligne ~194-207)

**AVANT:**
```javascript
if (!booking) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <p className="text-red-600 text-xl mb-4">Booking not found</p>
        <button onClick={() => navigate("/my-bookings")}>
          Back to My Bookings
        </button>
      </div>
    </div>
  );
}
```

**APRÈS:**
```javascript
if (!booking) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <p className="text-red-600 text-xl mb-4">{t('bookingDetailsPage.bookingNotFound')}</p>
        <button onClick={() => navigate("/my-bookings")}>
          {t('bookingDetailsPage.backToBookings')}
        </button>
      </div>
    </div>
  );
}
```

---

#### P. Countdown Timer (ligne ~266-305)

**AVANT:**
```javascript
<h3 className="text-2xl font-bold mb-2">Quote Expired</h3>
<p>This quote has expired. Please contact us to renew.</p>

// ...

<h3 className="text-xl font-bold mb-2">Quote Expires In:</h3>
<div className="text-sm opacity-90">Hours</div>
<div className="text-sm opacity-90">Minutes</div>
<div className="text-sm opacity-90">Seconds</div>
<p className="mt-4 text-sm">Valid until: {format(...)}</p>
```

**APRÈS:**
```javascript
<h3 className="text-2xl font-bold mb-2">{t('bookingDetailsPage.quoteExpired')}</h3>
<p>{t('bookingDetailsPage.quoteExpiredDesc')}</p>

// ...

<h3 className="text-xl font-bold mb-2">{t('bookingDetailsPage.quoteExpiresIn')}</h3>
<div className="text-sm opacity-90">{t('bookingDetailsPage.hours')}</div>
<div className="text-sm opacity-90">{t('bookingDetailsPage.minutes')}</div>
<div className="text-sm opacity-90">{t('bookingDetailsPage.seconds')}</div>
<p className="mt-4 text-sm">{t('bookingDetailsPage.validUntil')} {format(...)}</p>
```

---

#### Q. Download PDFs Section (ligne ~311-349)

**AVANT:**
```javascript
<h3 className="text-xl font-bold text-blue-900">
  Download Your Quotations
</h3>
//...
<FontAwesomeIcon icon={faDownload} className="mr-3 text-lg" />
Detailed Quote PDF
//...
General Quote PDF
//...
<p className="text-sm text-blue-700 mt-4 text-center">
  Download and review your quotations carefully. Contact us if you have any questions.
</p>
```

**APRÈS:**
```javascript
<h3 className="text-xl font-bold text-blue-900">
  {t('bookingDetailsPage.downloadQuotations')}
</h3>
//...
<FontAwesomeIcon icon={faDownload} className="mr-3 text-lg" />
{t('bookingDetailsPage.detailedQuotePDF')}
//...
{t('bookingDetailsPage.generalQuotePDF')}
//...
<p className="text-sm text-blue-700 mt-4 text-center">
  {t('bookingDetailsPage.downloadReviewNote')}
</p>
```

---

#### R. Status Messages (ligne ~609-646)

**AVANT:**
```javascript
{booking.status === "Inquiry Pending" && (
  <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4">
    <div className="flex items-start">
      <FontAwesomeIcon icon={faInfoCircle} className="text-yellow-600 text-xl mt-1 mr-3" />
      <div className="text-sm text-yellow-800">
        <p className="font-semibold mb-1">Response Expected</p>
        <p>Our team will review your request and send you a detailed quote within 30 minutes.</p>
      </div>
    </div>
  </div>
)}

{booking.status === "Payment Confirmed" && booking.can_cancel_with_refund && (
  <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
    <div className="flex items-start">
      <FontAwesomeIcon icon={faInfoCircle} className="text-green-600 text-xl mt-1 mr-3" />
      <div className="text-sm text-green-800">
        <p className="font-semibold mb-1">Free Cancellation Available</p>
        <p>You can cancel within 24 hours of payment for a full refund.</p>
      </div>
    </div>
  </div>
)}
```

**APRÈS:**
```javascript
{booking.status === "Inquiry Pending" && (
  <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4">
    <div className="flex items-start">
      <FontAwesomeIcon icon={faInfoCircle} className="text-yellow-600 text-xl mt-1 mr-3" />
      <div className="text-sm text-yellow-800">
        <p className="font-semibold mb-1">{t('bookingDetailsPage.responseExpected')}</p>
        <p>{t('bookingDetailsPage.responseExpectedDesc')}</p>
      </div>
    </div>
  </div>
)}

{booking.status === "Payment Confirmed" && booking.can_cancel_with_refund && (
  <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
    <div className="flex items-start">
      <FontAwesomeIcon icon={faInfoCircle} className="text-green-600 text-xl mt-1 mr-3" />
      <div className="text-sm text-green-800">
        <p className="font-semibold mb-1">{t('bookingDetailsPage.freeCancellationAvailable')}</p>
        <p>{t('bookingDetailsPage.freeCancellationDesc')}</p>
      </div>
    </div>
  </div>
)}
```

---

#### S. Cancel Confirmation (ligne ~145-152)

**AVANT:**
```javascript
const handleCancelBooking = async () => {
  if (
    !window.confirm(
      `Are you sure you want to cancel booking ${booking.booking_reference}?`
    )
  ) {
    return;
  }
  //...
};
```

**APRÈS:**
```javascript
const handleCancelBooking = async () => {
  if (
    !window.confirm(
      t('bookingDetailsPage.confirmCancelBooking', { reference: booking.booking_reference })
    )
  ) {
    return;
  }
  //...
};
```

---

#### T. Toast Messages (ligne ~162-167, ~93-97)

**AVANT:**
```javascript
toast.success("Booking cancelled successfully");
//...
toast.error(errorMessage);
//...
toast.error("You do not have access to this booking");
//...
toast.error("Failed to load booking details");
```

**APRÈS:**
```javascript
toast.success(t('bookingDetailsPage.bookingCancelledSuccess'));
//...
toast.error(errorMessage || t('bookingDetailsPage.failedToCancelBooking'));
//...
toast.error(t('bookingDetailsPage.noAccessToBooking'));
//...
toast.error(t('bookingDetailsPage.failedToLoadBooking'));
```

---

## 📋 LISTE COMPLÈTE DES MODIFICATIONS

Créer un fichier de remplacement complet serait trop long. Voici un résumé des modifications:

### Remplacements Texte → t() (47 occurrences)

| Ligne | Texte Original | Remplacement |
|-------|----------------|--------------|
| 103-142 | Status text/descriptions | `t('bookingDetailsPage.status*')` |
| 179-191 | "Loading booking details..." | `t('bookingDetailsPage.loadingBooking')` |
| 194-207 | "Booking not found", "Back to My Bookings" | `t('bookingDetailsPage.bookingNotFound')`, `t('bookingDetailsPage.backToBookings')` |
| 222-225 | "Back to My Bookings" | `t('bookingDetailsPage.backToBookings')` |
| 227 | "Booking Details" | `t('bookingDetailsPage.title')` |
| 246 | "Booking Reference" | `t('bookingDetailsPage.bookingReference')` |
| 266-305 | Countdown timer text | `t('bookingDetailsPage.quoteExpires*')` |
| 311-349 | Download PDFs text | `t('bookingDetailsPage.download*')` |
| 358 | "Tour Information" | `t('bookingDetailsPage.tourInformation')` |
| 380 | "Package" | `t('bookingDetailsPage.package')` |
| 384 | "Days Tour" | `t('bookingDetailsPage.daysTour')` |
| 397 | "Travel Date" | `t('bookingDetailsPage.travelDate')` |
| 416-420 | Age categories | `t('bookingDetailsPage.adults/children/...')` |
| 426-428 | "Final Price", "Estimate" | `t('bookingDetailsPage.finalPrice/estimate')` |
| 483-485 | "Selected Vehicles" | `t('bookingDetailsPage.selectedVehicles')` |
| 502-505 | "Capacity:", "passengers" | `t('booking.capacity')`, `t('bookingDetailsPage.passengers')` |
| 507-510 | "Vehicle ID:" | `t('bookingDetailsPage.vehicleID')` |
| 514-516 | "Qty:" | `t('bookingDetailsPage.qty')` |
| 518-523 | "Price TBD" | `t('bookingDetailsPage.priceTBD')` |
| 535-537 | "Selected Add-ons" | `t('bookingDetailsPage.selectedAddons')` |
| 558-562 | "Add-on ID:" | `t('bookingDetailsPage.addonID')` |
| 523-564 | Contact section labels | `t('bookingDetailsPage.contactName/email/phone')` |
| 569 | "Actions" | `t('bookingDetailsPage.actions')` |
| 575-604 | Action button labels | `t('bookingDetailsPage.payNow/cancelBooking/...')` |
| 609-646 | Status messages | `t('bookingDetailsPage.responseExpected/...')` |

### Remplacements Prix → convertAndFormat() (4 occurrences)

| Ligne | Code Original | Remplacement |
|-------|---------------|--------------|
| 430-437 | `₹{(booking.final_price...).toLocaleString()}` | `convertAndFormat(booking.final_price...)` |
| 518-520 | `₹{parseFloat(vehicle.price).toLocaleString()}` | `convertAndFormat(parseFloat(vehicle.price))` |
| 568-574 | `₹{parseFloat(addon.price).toLocaleString()}` | `convertAndFormat(parseFloat(addon.price))` |

---

## ✅ VÉRIFICATION FINALE

Après avoir appliqué toutes les modifications:

- [ ] Tous les textes hardcodés sont remplacés par `t('bookingDetailsPage.*')`
- [ ] Tous les prix utilisent `convertAndFormat()`
- [ ] Les imports `useTranslation` et `useCurrency` sont présents
- [ ] Le composant déclare `const { t } = useTranslation();`
- [ ] Le composant déclare `const { convertAndFormat } = useCurrency();`
- [ ] Aucune erreur de syntaxe
- [ ] Tous les fichiers de traduction ont la section `bookingDetailsPage`

---

## 🧪 TESTS À EFFECTUER

1. **Test des Traductions:**
   - Changer la langue dans le header
   - Vérifier que tous les textes sont traduits correctement
   - Tester toutes les langues: EN, FR, ES, HI, IT, MS, ZH

2. **Test de Conversion de Devises:**
   - Changer la devise dans le header
   - Vérifier que tous les prix sont convertis
   - Vérifier le format: symbole de devise + montant

3. **Test des Fallbacks:**
   - Créer une réservation sans données enrichies (vehicles/addons)
   - Vérifier que les IDs s'affichent avec les traductions correctes
   - Vérifier "Price TBD" traduit

4. **Test des Catégories d'Âge:**
   - Créer une réservation avec toutes les catégories (adults, teens, seniors)
   - Vérifier que chaque catégorie est traduite correctement

---

## 📝 NOTES IMPORTANTES

1. **Ordre d'Application:** Appliquer les modifications de haut en bas du fichier pour éviter les conflits de numéros de ligne

2. **Validation:** Après chaque section modifiée, sauvegarder et vérifier qu'il n'y a pas d'erreurs de syntaxe

3. **Test Progressif:** Tester la page après chaque groupe de modifications (status, prices, sections)

4. **Backend:** Les noms de véhicules et addons sont déjà enrichis par le backend (lignes 864-931 de `bookingController.js`)

---

**Guide créé par:** Claude Code
**Date:** 26 octobre 2025
**Fichier cible:** `frontend/src/pages/BookingDetailsPage.jsx`
**Lignes à modifier:** ~50 emplacements de texte + 4 emplacements de prix
