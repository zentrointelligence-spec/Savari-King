# Quote System Implementation - Complete Documentation

**Date:** 2025-10-16
**Version:** 1.0
**Status:** ✅ Fully Implemented

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [System Architecture](#system-architecture)
3. [Database Schema](#database-schema)
4. [Backend Implementation](#backend-implementation)
5. [Frontend Implementation](#frontend-implementation)
6. [PDF Generation](#pdf-generation)
7. [Email Service](#email-service)
8. [Notification System](#notification-system)
9. [User Flow](#user-flow)
10. [Testing Guide](#testing-guide)
11. [Configuration](#configuration)
12. [Troubleshooting](#troubleshooting)

---

## Overview

### Purpose
The Quote System allows administrators to send professional, itemized quotations to customers who have submitted booking inquiries. The system generates two types of PDF quotes (detailed and general), sends them via email, and makes them downloadable from the customer's account.

### Key Features
- ✅ Automatic price calculation based on tier, addons, and vehicles
- ✅ Read-only price display in admin interface (no manual modifications)
- ✅ Dual PDF generation (detailed and general quotes)
- ✅ Email delivery with PDF attachments
- ✅ In-app notifications for customers
- ✅ Downloadable quotes from customer dashboard
- ✅ 48-hour quote validity period
- ✅ Professional PDF design with company branding

---

## System Architecture

```
┌─────────────────┐
│  Admin Panel    │
│  (Send Quote)   │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────┐
│  Backend API                    │
│  POST /api/admin/bookings/:id/  │
│       send-quote                │
└────────┬────────────────────────┘
         │
         ├──────────────┬──────────────┬────────────────┐
         ▼              ▼              ▼                ▼
┌──────────────┐ ┌──────────────┐ ┌────────────┐ ┌──────────────┐
│ PDF Service  │ │ Email Service│ │ Notification│ │   Database   │
│ Generate PDFs│ │ Send Email   │ │   Service   │ │ Update Status│
└──────────────┘ └──────────────┘ └────────────┘ └──────────────┘
         │              │              │                │
         └──────────────┴──────────────┴────────────────┘
                        │
                        ▼
              ┌───────────────────┐
              │  Customer Account │
              │  - View PDFs      │
              │  - Download       │
              └───────────────────┘
```

---

## Database Schema

### Modified `bookings` Table

```sql
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS quote_detailed_pdf VARCHAR(500),
ADD COLUMN IF NOT EXISTS quote_general_pdf VARCHAR(500),
ADD COLUMN IF NOT EXISTS quote_status VARCHAR(50) DEFAULT 'pending';

CREATE INDEX IF NOT EXISTS idx_bookings_quote_status ON bookings(quote_status);
```

**New Columns:**
- `quote_detailed_pdf`: Path to detailed quote PDF
- `quote_general_pdf`: Path to general quote PDF
- `quote_status`: Status of quote (pending, sent, accepted, rejected, expired)

### New `notifications` Table

```sql
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  booking_id INTEGER REFERENCES bookings(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  read_at TIMESTAMP,
  metadata JSONB DEFAULT '{}'::jsonb
);
```

---

## Backend Implementation

### 1. Quote PDF Service

**File:** `backend/src/services/quotePdfService.js`

**Key Features:**
- Generates detailed and general quotes
- Uses `pdfkit` library for PDF creation
- Calculates price breakdown automatically
- Stores PDFs in `backend/public/quotes/`

**API:**
```javascript
const quotePdfService = require('./services/quotePdfService');

// Generate both quotes
const { detailed, general } = await quotePdfService.generateBothQuotes(bookingData);

// Returns:
// {
//   detailed: { fileName, filePath, relativePath },
//   general: { fileName, filePath, relativePath }
// }
```

### 2. Email Service

**File:** `backend/src/services/quoteEmailService.js`

**Features:**
- Professional HTML email template
- Dual PDF attachments
- Personalized content
- Link to customer account

**Usage:**
```javascript
const quoteEmailService = require('./services/quoteEmailService');

await quoteEmailService.sendQuoteEmail(bookingData, pdfPaths, totalAmount);
```

### 3. Notification Service

**File:** `backend/src/services/notificationService.js`

**Features:**
- Creates in-app notifications
- Stores PDF links in metadata
- Tracks read/unread status

**Usage:**
```javascript
const notificationService = require('./services/notificationService');

await notificationService.createQuoteReceivedNotification(bookingData, pdfPaths);
```

### 4. API Endpoint

**Route:** `POST /api/admin/bookings/:bookingId/send-quote`

**Request Body:**
```json
{
  "finalPrice": 75000.00
}
```

**Response:**
```json
{
  "success": true,
  "message": "Quote sent successfully to customer",
  "quote_sent_date": "2025-10-16T10:30:00.000Z",
  "quote_expiration_date": "2025-10-18T10:30:00.000Z",
  "pdfs": {
    "detailed": "/quotes/quote-detailed-BK123456.pdf",
    "general": "/quotes/quote-general-BK123456.pdf"
  }
}
```

---

## Frontend Implementation

### 1. SendQuoteModal

**File:** `frontend/src/components/admin/SendQuoteModal.jsx`

**Changes:**
- ✅ Price displayed in read-only format
- ✅ Detailed breakdown showing:
  - Package tier × participants
  - Add-ons with quantities
  - Vehicles with quantities
  - Total amount (locked)
- ✅ Removed price input field
- ✅ Removed comment field

**Price Calculation:**
```javascript
const priceBreakdown = useMemo(() => {
  const totalParticipants = num_adults + num_children;

  // Base price
  const tierPrice = booking.tier_price * totalParticipants;

  // Addons total
  const addonsTotal = selectedAddons.reduce((sum, addon) =>
    sum + (addon.price * totalParticipants), 0);

  // Vehicles total
  const vehiclesTotal = selectedVehicles.reduce((sum, vehicle) =>
    sum + (vehicle.price * vehicle.quantity), 0);

  return {
    tierPrice,
    addonsTotal,
    vehiclesTotal,
    totalPrice: tierPrice + addonsTotal + vehiclesTotal
  };
}, [booking]);
```

### 2. MyBookingsPage Updates

**File:** `frontend/src/components/booking/BookingStatusCard.jsx`

**New Features:**
- Download buttons for both PDFs
- Styled quote download section
- Valid until date display
- Responsive design

**UI Components:**
```jsx
{booking.status === "Quote Sent" && (
  <div className="download-quotes-section">
    <a href={`${API_URL}${booking.quote_detailed_pdf}`} download>
      📥 Download Detailed Quote
    </a>
    <a href={`${API_URL}${booking.quote_general_pdf}`} download>
      📥 Download General Quote
    </a>
  </div>
)}
```

### 3. AdminBookingsPage Updates

**File:** `frontend/src/pages/admin/AdminBookingsPage.jsx`

**Updated Function:**
```javascript
const handleSendQuote = async (bookingId, finalPrice) => {
  const response = await axios.post(
    `/api/admin/bookings/${bookingId}/send-quote`,
    { finalPrice },
    { headers: getAuthHeaders(token) }
  );

  if (response.data.success) {
    toast.success("Quote sent! PDFs generated and email sent.");
    fetchBookings(currentPage);
  }
};
```

---

## PDF Generation

### Detailed Quote PDF

**Includes:**
1. Company header with branding
2. Booking reference and customer info
3. Tour details and travel date
4. Package/Tier breakdown (price × participants)
5. Add-ons list with individual prices
6. Vehicles list with quantities
7. Total price with full breakdown
8. Special requests (if any)
9. Terms & conditions
10. Valid until date

**File naming:** `quote-detailed-BK123456.pdf`

### General Quote PDF

**Includes:**
1. Company header
2. Booking reference
3. Customer name
4. Tour name
5. Travel date
6. Number of travelers
7. Package type
8. **Total amount only** (no breakdown)
9. Valid until date
10. Call to action

**File naming:** `quote-general-BK123456.pdf`

---

## Email Service

### Configuration

**Environment Variables:**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FRONTEND_URL=http://localhost:5173
```

### Email Template Features

1. **Professional Design:**
   - Gradient header
   - Company branding
   - Responsive layout
   - Clear call-to-action

2. **Content Sections:**
   - Personalized greeting
   - Booking summary
   - Total amount display
   - Attachments notice
   - Validity period
   - Link to customer account

3. **Attachments:**
   - Detailed quote PDF
   - General quote PDF

---

## Notification System

### Notification Types

**Quote Received:**
```javascript
{
  type: 'quote_received',
  title: 'Quote Received for Your Booking',
  message: 'Your quote for {tour_name} has been prepared...',
  metadata: {
    booking_reference: 'BK123456',
    detailed_pdf: '/quotes/quote-detailed-BK123456.pdf',
    general_pdf: '/quotes/quote-general-BK123456.pdf',
    valid_until: '2025-10-18T10:30:00.000Z'
  }
}
```

### User Interface

- Bell icon with badge count
- Dropdown notification center
- Mark as read functionality
- Click to view booking details

---

## User Flow

### Admin Flow

1. **View Booking:**
   - Admin sees "Inquiry Pending" booking
   - Clicks "Send Quote" from dropdown menu

2. **Review Quote:**
   - Modal opens showing:
     - Customer details
     - Package breakdown
     - Add-ons list
     - Vehicles list
     - **Locked total price**

3. **Send Quote:**
   - Admin clicks "Send Quote to Customer"
   - System generates PDFs
   - Email sent automatically
   - Notification created
   - Status updated to "Quote Sent"

### Customer Flow

1. **Receive Notification:**
   - Email with PDF attachments
   - In-app notification badge

2. **View Quote:**
   - Navigate to "My Bookings"
   - See "Quote Ready" status
   - View download buttons

3. **Download PDFs:**
   - Click "Detailed Quote" button
   - Click "General Quote" button
   - PDFs downloaded to device

4. **Take Action:**
   - Review quotes
   - Accept or reject
   - Contact for modifications

---

## Testing Guide

### Prerequisites

1. **Database:**
   ```bash
   psql -U postgres -d ebookingsam -f backend/src/db/migrations/add_quote_pdf_paths_to_bookings.sql
   psql -U postgres -d ebookingsam -f backend/src/db/migrations/create_notifications_table.sql
   ```

2. **Dependencies:**
   ```bash
   cd backend
   npm install pdfkit
   ```

3. **Environment:**
   - Configure SMTP settings in `.env`
   - Ensure `backend/public/quotes` directory exists

### Test Scenarios

#### Test 1: Send Quote Flow

1. Create a test booking in "Inquiry Pending" status
2. Login as admin
3. Navigate to Admin > Bookings
4. Click dropdown on booking → "Send Quote"
5. Verify modal shows correct price breakdown
6. Click "Send Quote to Customer"
7. Verify success toast message

**Expected Results:**
- ✅ Status changes to "Quote Sent"
- ✅ PDFs created in `backend/public/quotes/`
- ✅ Email sent with attachments
- ✅ Notification created for user
- ✅ Database updated with PDF paths

#### Test 2: Customer View Quote

1. Login as the customer
2. Navigate to "My Bookings"
3. Find booking with "Quote Sent" status
4. Verify download buttons appear
5. Click "Detailed Quote" button
6. Click "General Quote" button

**Expected Results:**
- ✅ Both PDF buttons visible
- ✅ PDFs download correctly
- ✅ PDFs contain correct data
- ✅ Valid until date displayed

#### Test 3: PDF Content Verification

1. Open detailed quote PDF
2. Verify all sections present:
   - Company header
   - Booking reference
   - Customer info
   - Package breakdown
   - Add-ons list
   - Vehicles list
   - Total amount
   - Terms & conditions

3. Open general quote PDF
4. Verify summary format:
   - Customer name
   - Tour name
   - Travel date
   - Total amount only

**Expected Results:**
- ✅ All information accurate
- ✅ Prices match booking data
- ✅ Professional formatting
- ✅ No errors or missing data

---

## Configuration

### Backend Configuration

**File:** `backend/src/services/quotePdfService.js`

```javascript
// Customize PDF styling
this.quotesDir = path.join(__dirname, '../../public/quotes');

// Adjust validity period (currently 48 hours)
validUntil.setHours(validUntil.getHours() + 48);
```

### Frontend Configuration

**File:** `frontend/src/config/api.js`

```javascript
export const API_CONFIG = {
  BASE_URL: 'http://localhost:5000',
  ENDPOINTS: {
    ADMIN: {
      BOOKINGS_ALL: '/api/admin/bookings'
    }
  }
};
```

---

## Troubleshooting

### Issue: PDFs not generating

**Symptoms:**
- Error "Failed to generate quotes"
- No PDFs in quotes folder

**Solutions:**
1. Check directory permissions:
   ```bash
   mkdir -p backend/public/quotes
   chmod 755 backend/public/quotes
   ```

2. Verify pdfkit installation:
   ```bash
   npm list pdfkit
   ```

3. Check server logs for detailed error

### Issue: Email not sending

**Symptoms:**
- Quote sent but no email received
- SMTP connection error

**Solutions:**
1. Verify SMTP configuration in `.env`
2. Check SMTP credentials
3. Enable "Less secure apps" (Gmail)
4. Use app-specific password
5. Test connection:
   ```javascript
   await quoteEmailService.verifyConnection();
   ```

### Issue: PDFs not downloadable

**Symptoms:**
- 404 error when clicking download
- Broken PDF links

**Solutions:**
1. Verify static file serving in `backend/src/index.js`:
   ```javascript
   app.use("/quotes", express.static("public/quotes"));
   ```

2. Check file paths in database
3. Verify PDF files exist on server

### Issue: Price calculations incorrect

**Symptoms:**
- Wrong total in PDF
- Mismatched prices

**Solutions:**
1. Verify booking data includes:
   - `tier_price`
   - `selected_addons` (with prices)
   - `selected_vehicles` (with prices and quantities)

2. Check price calculation logic in:
   - `SendQuoteModal.jsx` (frontend)
   - `quotePdfService.js` (backend)

---

## Summary

### ✅ Implementation Complete

- [x] Database schema updated
- [x] PDF generation service
- [x] Email service with attachments
- [x] Notification system
- [x] Admin interface updates
- [x] Customer interface updates
- [x] API endpoints
- [x] Frontend integration
- [x] Documentation

### 🎯 Key Benefits

1. **Professional:** High-quality PDF quotes
2. **Automated:** No manual price entry
3. **Transparent:** Detailed breakdown for customers
4. **Convenient:** Downloadable from account
5. **Traceable:** Full audit trail
6. **Secure:** Read-only pricing
7. **Flexible:** Two quote formats

### 📊 Technical Stack

- **Backend:** Node.js, Express
- **Database:** PostgreSQL
- **PDF Generation:** pdfkit
- **Email:** nodemailer
- **Frontend:** React
- **Styling:** Tailwind CSS

---

**For support or questions, please contact the development team.**

**Last Updated:** 2025-10-16
**Version:** 1.0.0
**Status:** Production Ready ✅
