# Payment Page - Translation Keys

## All Translation Keys Needed for PaymentPage.jsx

```json
"payment": {
  "loading": "Loading payment details...",
  "bookingNotFound": "Booking not found",
  "backToBookings": "Back to My Bookings",
  "title": "Complete Payment",
  "bookingReference": "Booking Reference",
  "quoteExpiredRedirecting": "Quote has expired! Redirecting to My Bookings...",
  "selectMethod": "Select Payment Method",
  "processing": "Processing...",
  "submitting": "Submitting...",
  "payAmount": "Pay {{amount}}",
  "submitBankDetails": "Submit Bank Transfer Details",
  "confirmPaypal": "Confirm PayPal Payment",

  "methods": {
    "card": {
      "title": "Credit/Debit Card",
      "subtitle": "Instant confirmation"
    },
    "bank": {
      "title": "Bank Transfer",
      "subtitle": "Awaits verification"
    },
    "paypal": {
      "title": "PayPal",
      "subtitle": "Instant confirmation"
    }
  },

  "forms": {
    "secure": {
      "title": "Secure Payment",
      "description": "Your card information is encrypted and secure"
    },
    "card": {
      "cardNumber": "Card Number",
      "cardholderName": "Cardholder Name",
      "namePlaceholder": "John Doe",
      "expiryMonth": "Expiry Month",
      "expiryYear": "Expiry Year",
      "cvv": "CVV"
    },
    "bank": {
      "awaitingTitle": "Awaiting Confirmation",
      "awaitingDescription": "Your payment will be verified by our team within 24-48 hours",
      "bankName": "Bank Name",
      "bankNamePlaceholder": "Enter your bank name",
      "accountNumber": "Account Number",
      "accountNumberPlaceholder": "Enter your account number",
      "transactionReference": "Transaction Reference",
      "transactionReferencePlaceholder": "Enter transaction reference number"
    },
    "paypal": {
      "title": "PayPal Payment",
      "description": "Complete your PayPal transaction and enter the details below",
      "email": "PayPal Email",
      "emailPlaceholder": "your.email@example.com",
      "transactionId": "PayPal Transaction ID",
      "transactionIdPlaceholder": "Enter PayPal transaction ID"
    }
  },

  "summary": {
    "title": "Order Summary",
    "tour": "Tour",
    "travelDate": "Travel Date",
    "participants": "Participants",
    "adult": "Adult",
    "adult_plural": "Adults",
    "child": "Child",
    "child_plural": "Children",
    "packageTier": "Package Tier",
    "subtotal": "Subtotal",
    "totalAmount": "Total Amount",
    "pdfAvailable": "Your quote PDFs are available in My Bookings"
  },

  "errors": {
    "noAccess": "You do not have access to this booking",
    "alreadyPaid": "This booking has already been paid",
    "quoteNotSent": "Payment is not available yet. Please wait for the quote.",
    "quoteExpired": "This quote has expired. Please request a new quote from your bookings page.",
    "loadFailed": "Failed to load booking details",
    "paymentFailed": "Failed to process payment",
    "bankTransferFailed": "Failed to submit bank transfer",
    "paypalFailed": "Failed to process PayPal payment"
  },

  "warnings": {
    "quoteExpiringSoon": "⏰ This quote expires in {{minutes}} minutes!"
  },

  "validation": {
    "fillAllCardDetails": "Please fill in all card details",
    "invalidCardNumber": "Invalid card number",
    "invalidCVV": "Invalid CVV",
    "fillAllBankDetails": "Please fill in all bank transfer details",
    "fillAllPayPalDetails": "Please fill in all PayPal details",
    "invalidPayPalEmail": "Invalid PayPal email address"
  },

  "success": {
    "paymentConfirmed": "Payment confirmed successfully!",
    "bankTransferSubmitted": "Bank transfer details submitted! Awaiting admin confirmation.",
    "paypalConfirmed": "PayPal payment confirmed successfully!"
  }
}
```

## Notes:
- All keys use the `payment.*` namespace
- Pluralization is handled with `_plural` suffix for adult/child
- Currency amounts are dynamically converted using `convertAndFormat()`
- All prices display in user's selected currency
