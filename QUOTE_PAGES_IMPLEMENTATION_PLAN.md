# Quote Pages Implementation Plan
## Remplacement des PDFs par des Pages Web

### 📋 Vue d'Ensemble

**Objectif:** Remplacer complètement les PDFs de devis par des pages web dynamiques et interactives.

**URLs Structure:** `/my-bookings/:bookingId/quote/detailed` et `/my-bookings/:bookingId/quote/general`

**Authentification:** Requise (utilisateur doit être connecté)

---

## 🎯 Spécifications Fonctionnelles

### 1. États du Devis

| État | Conditions | Badge | Visibilité | Actions Disponibles |
|------|-----------|-------|------------|---------------------|
| **En attente** | < 48h ET non accepté | Orange | Visible | Accepter, Partager |
| **Accepté** | Accepté par client ET < 48h | Vert | Visible | Partager, Procéder au paiement |
| **Expiré** | > 48h | Rouge | Message "Devis expiré" | Aucune |
| **Accepté mais expiré** | Accepté MAIS > 48h | Rouge "Expiré" | Message "Devis expiré" | Aucune |

### 2. Flow Utilisateur

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Client reçoit email avec liens:                          │
│    - Lien vers devis détaillé                               │
│    - Lien vers devis général                                │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. Client clique sur lien → Page de devis                   │
│    - Authentification requise                               │
│    - Affiche version acceptée OU dernière version           │
│    - Compte à rebours d'expiration visible                  │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. Client clique "Accepter le devis"                        │
│    → Confirmation modal                                     │
│    → Email au client (confirmation)                         │
│    → Email à l'admin (notification)                         │
│    → Message succès 3 secondes                              │
│    → Redirection vers page de paiement                      │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. Si Admin modifie le devis après acceptation              │
│    → Avertissement affiché à l'admin                        │
│    → Création version v2                                    │
│    → Client doit accepter à nouveau                         │
└─────────────────────────────────────────────────────────────┘
```

### 3. Logique d'Acceptation

**Quand le client clique "Accepter":**
1. ✅ Vérifier que le devis n'est pas expiré
2. ✅ Vérifier qu'il n'est pas déjà accepté
3. ✅ Mettre à jour `accepted_at` et `accepted_by_user_id`
4. ✅ Le statut du booking reste "Quote Sent"
5. ✅ Envoyer email de confirmation au client
6. ✅ Envoyer email de notification à l'admin
7. ✅ Afficher message de succès 3 secondes
8. ✅ Rediriger vers `/my-bookings/:bookingId/payment`

**Si le client annule après acceptation:**
1. ✅ Le booking passe à statut "Cancelled"
2. ✅ Tout le processus s'arrête

---

## 🗄️ Phase 1: Modifications Base de Données

### A. Ajout de Colonnes

```sql
-- Ajouter colonnes pour l'acceptation
ALTER TABLE booking_quote_revisions
ADD COLUMN accepted_at TIMESTAMP DEFAULT NULL,
ADD COLUMN accepted_by_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL;

-- Ajouter index pour performance
CREATE INDEX idx_quote_revisions_accepted ON booking_quote_revisions(accepted_at);
CREATE INDEX idx_quote_revisions_accepted_by ON booking_quote_revisions(accepted_by_user_id);
```

### B. Migration SQL

**Fichier:** `backend/src/db/migrations/add_quote_acceptance_tracking.sql`

```sql
-- Add quote acceptance tracking
-- Date: 2025-01-12

ALTER TABLE booking_quote_revisions
ADD COLUMN IF NOT EXISTS accepted_at TIMESTAMP DEFAULT NULL,
ADD COLUMN IF NOT EXISTS accepted_by_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL;

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_quote_revisions_accepted
  ON booking_quote_revisions(accepted_at);

CREATE INDEX IF NOT EXISTS idx_quote_revisions_accepted_by
  ON booking_quote_revisions(accepted_by_user_id);

-- Add comment
COMMENT ON COLUMN booking_quote_revisions.accepted_at IS
  'Timestamp when the client accepted this quote revision';

COMMENT ON COLUMN booking_quote_revisions.accepted_by_user_id IS
  'User ID of the client who accepted this quote';
```

---

## 🔧 Phase 2: Backend - Routes et Contrôleurs

### A. Nouvelles Routes

**Fichier:** `backend/src/routes/quoteViewRoutes.js`

```javascript
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const quoteViewController = require('../controllers/quoteViewController');

/**
 * @route   GET /api/my-bookings/:bookingId/quote/detailed
 * @desc    Get detailed quote data for web view
 * @access  Private (client only, own booking)
 */
router.get('/:bookingId/quote/detailed', protect, quoteViewController.getDetailedQuote);

/**
 * @route   GET /api/my-bookings/:bookingId/quote/general
 * @desc    Get general quote data for web view
 * @access  Private (client only, own booking)
 */
router.get('/:bookingId/quote/general', protect, quoteViewController.getGeneralQuote);

/**
 * @route   GET /api/my-bookings/:bookingId/quote/versions
 * @desc    Get all quote versions for a booking
 * @access  Private (client only, own booking)
 */
router.get('/:bookingId/quote/versions', protect, quoteViewController.getQuoteVersions);

/**
 * @route   POST /api/my-bookings/:bookingId/quote/accept
 * @desc    Accept a quote revision
 * @access  Private (client only, own booking)
 */
router.post('/:bookingId/quote/accept', protect, quoteViewController.acceptQuote);

module.exports = router;
```

### B. Contrôleur

**Fichier:** `backend/src/controllers/quoteViewController.js`

```javascript
const db = require('../db');
const { sendQuoteAcceptanceEmailToClient, sendQuoteAcceptanceEmailToAdmin } = require('../services/emailServiceNew');

/**
 * Helper: Check if quote is expired (> 48 hours)
 */
const isQuoteExpired = (quoteSentDate) => {
  if (!quoteSentDate) return true;
  const now = new Date();
  const sentDate = new Date(quoteSentDate);
  const hoursDiff = (now - sentDate) / (1000 * 60 * 60);
  return hoursDiff > 48;
};

/**
 * Helper: Get time remaining until expiration
 */
const getTimeRemaining = (quoteSentDate) => {
  if (!quoteSentDate) return null;
  const now = new Date();
  const sentDate = new Date(quoteSentDate);
  const expirationDate = new Date(sentDate.getTime() + 48 * 60 * 60 * 1000);
  const diff = expirationDate - now;

  if (diff <= 0) return null;

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return { hours, minutes, seconds, milliseconds: diff };
};

/**
 * Helper: Enrich vehicles with database details
 */
const enrichVehicles = async (vehicles, durationDays) => {
  if (!vehicles || !Array.isArray(vehicles)) return [];

  return await Promise.all(
    vehicles.map(async (v) => {
      if (v.vehicle_id) {
        const vehicleResult = await db.query(
          'SELECT id, name, capacity, base_price_inr FROM vehicles WHERE id = $1',
          [v.vehicle_id]
        );

        if (vehicleResult.rows.length > 0) {
          const vehicleData = vehicleResult.rows[0];
          return {
            vehicle_id: v.vehicle_id,
            name: vehicleData.name,
            quantity: v.quantity || 1,
            capacity: vehicleData.capacity,
            pricePerDay: parseFloat(vehicleData.base_price_inr),
            duration: durationDays,
            total: parseFloat(vehicleData.base_price_inr) * durationDays * (v.quantity || 1)
          };
        }
      }
      return v;
    })
  );
};

/**
 * Helper: Enrich addons with database details
 */
const enrichAddons = async (addons, numAdults, numChildren) => {
  if (!addons || !Array.isArray(addons)) return [];

  const totalParticipants = numAdults + numChildren;

  return await Promise.all(
    addons.map(async (a) => {
      if (a.addon_id) {
        const addonResult = await db.query(
          'SELECT id, name, price, price_per_person FROM addons WHERE id = $1',
          [a.addon_id]
        );

        if (addonResult.rows.length > 0) {
          const addonData = addonResult.rows[0];
          const isPerPerson = addonData.price_per_person !== false;
          const quantity = a.quantity || 1;
          const unitPrice = parseFloat(addonData.price);
          const total = isPerPerson ? (unitPrice * totalParticipants) : (unitPrice * quantity);

          return {
            addon_id: a.addon_id,
            name: addonData.name,
            quantity,
            unitPrice,
            pricePerPerson: isPerPerson,
            totalParticipants: isPerPerson ? totalParticipants : null,
            total
          };
        }
      }
      return a;
    })
  );
};

/**
 * Get detailed quote for web view
 */
exports.getDetailedQuote = async (req, res) => {
  const { bookingId } = req.params;
  const userId = req.user.id;
  const { version } = req.query; // Optional: specific version number

  try {
    // Get booking details
    const bookingQuery = `
      SELECT b.*, t.name as tour_name, t.duration_days, t.destinations,
             pt.tier_name, pt.inclusions_summary
      FROM bookings b
      JOIN tours t ON b.tour_id = t.id
      JOIN packagetiers pt ON b.tier_id = pt.id
      WHERE b.id = $1 AND b.user_id = $2
    `;

    const bookingResult = await db.query(bookingQuery, [bookingId, userId]);

    if (bookingResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found or access denied'
      });
    }

    const booking = bookingResult.rows[0];

    // Get quote revision
    let revisionQuery = `
      SELECT * FROM booking_quote_revisions
      WHERE booking_id = $1
    `;

    let params = [bookingId];

    if (version) {
      revisionQuery += ` AND revision_number = $2`;
      params.push(version);
    } else {
      // Get accepted version if exists, otherwise latest
      revisionQuery += ` ORDER BY
        CASE WHEN accepted_at IS NOT NULL THEN 0 ELSE 1 END,
        revision_number DESC
      LIMIT 1`;
    }

    const revisionResult = await db.query(revisionQuery, params);

    if (revisionResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No quote found for this booking'
      });
    }

    const revision = revisionResult.rows[0];

    // Check if expired
    const expired = isQuoteExpired(booking.quote_sent_date);
    const timeRemaining = getTimeRemaining(booking.quote_sent_date);

    // If expired and not the accepted version, return error
    if (expired && !revision.accepted_at) {
      return res.status(410).json({
        success: false,
        error: 'This quote has expired',
        expired: true
      });
    }

    // Enrich vehicles and addons
    const enrichedVehicles = await enrichVehicles(
      revision.vehicles_adjusted || revision.vehicles_original || [],
      booking.duration_days
    );

    const enrichedAddons = await enrichAddons(
      revision.addons_adjusted || revision.addons_original || [],
      booking.num_adults,
      booking.num_children
    );

    // Prepare response
    const quoteData = {
      bookingReference: booking.booking_reference,
      bookingId: booking.id,
      revisionNumber: revision.revision_number,
      quoteNumber: `QUOTE-${booking.booking_reference}-v${revision.revision_number}`,

      // Customer info
      customer: {
        name: booking.contact_name,
        email: booking.contact_email,
        phone: booking.contact_phone,
        country: booking.contact_country
      },

      // Tour info
      tour: {
        name: booking.tour_name,
        destination: booking.destinations,
        travelDate: booking.travel_date,
        duration: booking.duration_days
      },

      // Tier info
      tier: {
        name: booking.tier_name,
        price: parseFloat(revision.base_price),
        inclusions: booking.inclusions_summary
      },

      // Participants
      participants: {
        adults: booking.num_adults,
        children: booking.num_children,
        ages: booking.participant_ages
      },

      // Enriched data
      vehicles: enrichedVehicles,
      addons: enrichedAddons,

      // Pricing
      pricing: {
        tierPrice: parseFloat(revision.base_price),
        vehiclesTotal: parseFloat(revision.vehicles_price),
        addonsTotal: parseFloat(revision.addons_price),
        subtotal: parseFloat(revision.subtotal_price),
        discounts: revision.discounts || [],
        totalDiscounts: parseFloat(revision.total_discounts || 0),
        fees: revision.additional_fees || [],
        totalFees: parseFloat(revision.total_fees || 0),
        finalTotal: parseFloat(revision.final_price)
      },

      // Status
      status: {
        expired,
        accepted: !!revision.accepted_at,
        acceptedAt: revision.accepted_at,
        timeRemaining,
        canAccept: !expired && !revision.accepted_at
      },

      // Dates
      quoteSentDate: booking.quote_sent_date,
      quoteExpirationDate: booking.quote_expiration_date
    };

    res.json({
      success: true,
      data: quoteData
    });
  } catch (error) {
    console.error('Error fetching detailed quote:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch quote details'
    });
  }
};

/**
 * Get general quote for web view (simplified version)
 */
exports.getGeneralQuote = async (req, res) => {
  // Similar to getDetailedQuote but returns less detailed information
  // Implementation similar to above
};

/**
 * Get all quote versions
 */
exports.getQuoteVersions = async (req, res) => {
  const { bookingId } = req.params;
  const userId = req.user.id;

  try {
    // Verify ownership
    const ownerCheck = await db.query(
      'SELECT id FROM bookings WHERE id = $1 AND user_id = $2',
      [bookingId, userId]
    );

    if (ownerCheck.rows.length === 0) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    // Get all versions
    const versionsQuery = `
      SELECT
        id,
        revision_number,
        final_price,
        accepted_at,
        review_status,
        created_at
      FROM booking_quote_revisions
      WHERE booking_id = $1
      ORDER BY revision_number DESC
    `;

    const result = await db.query(versionsQuery, [bookingId]);

    const versions = result.rows.map(v => ({
      revisionNumber: v.revision_number,
      finalPrice: parseFloat(v.final_price),
      accepted: !!v.accepted_at,
      acceptedAt: v.accepted_at,
      createdAt: v.created_at,
      status: v.review_status
    }));

    res.json({
      success: true,
      data: versions
    });
  } catch (error) {
    console.error('Error fetching quote versions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch quote versions'
    });
  }
};

/**
 * Accept a quote
 */
exports.acceptQuote = async (req, res) => {
  const { bookingId } = req.params;
  const userId = req.user.id;
  const { revisionNumber } = req.body;

  try {
    // Get booking and verify ownership
    const bookingQuery = `
      SELECT b.*, t.name as tour_name
      FROM bookings b
      JOIN tours t ON b.tour_id = t.id
      WHERE b.id = $1 AND b.user_id = $2
    `;

    const bookingResult = await db.query(bookingQuery, [bookingId, userId]);

    if (bookingResult.rows.length === 0) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    const booking = bookingResult.rows[0];

    // Check if quote is expired
    if (isQuoteExpired(booking.quote_sent_date)) {
      return res.status(410).json({
        success: false,
        error: 'This quote has expired and cannot be accepted'
      });
    }

    // Get the revision to accept
    const revisionQuery = revisionNumber
      ? 'SELECT * FROM booking_quote_revisions WHERE booking_id = $1 AND revision_number = $2'
      : 'SELECT * FROM booking_quote_revisions WHERE booking_id = $1 ORDER BY revision_number DESC LIMIT 1';

    const params = revisionNumber ? [bookingId, revisionNumber] : [bookingId];
    const revisionResult = await db.query(revisionQuery, params);

    if (revisionResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Quote revision not found'
      });
    }

    const revision = revisionResult.rows[0];

    // Check if already accepted
    if (revision.accepted_at) {
      return res.status(400).json({
        success: false,
        error: 'This quote has already been accepted'
      });
    }

    // Accept the quote
    await db.query(
      `UPDATE booking_quote_revisions
       SET accepted_at = NOW(), accepted_by_user_id = $1
       WHERE id = $2`,
      [userId, revision.id]
    );

    // Send emails
    try {
      await sendQuoteAcceptanceEmailToClient({
        ...booking,
        revision_number: revision.revision_number,
        final_price: revision.final_price
      });

      await sendQuoteAcceptanceEmailToAdmin({
        ...booking,
        revision_number: revision.revision_number,
        final_price: revision.final_price
      });
    } catch (emailError) {
      console.error('Error sending acceptance emails:', emailError);
      // Don't fail the acceptance if emails fail
    }

    res.json({
      success: true,
      message: 'Quote accepted successfully',
      data: {
        revisionNumber: revision.revision_number,
        acceptedAt: new Date()
      }
    });
  } catch (error) {
    console.error('Error accepting quote:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to accept quote'
    });
  }
};
```

---

## 📧 Phase 3: Services Email

### Nouveaux Templates Email

**Fichier:** `backend/src/services/emailServiceNew.js` (ajout de fonctions)

```javascript
/**
 * Send quote acceptance confirmation to client
 */
exports.sendQuoteAcceptanceEmailToClient = async (bookingData) => {
  const subject = `Quote Accepted - ${bookingData.booking_reference}`;

  const html = `
    <h2>Quote Accepted Successfully!</h2>
    <p>Dear ${bookingData.contact_name},</p>
    <p>Thank you for accepting our quote for <strong>${bookingData.tour_name}</strong>.</p>

    <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3>Next Steps:</h3>
      <ol>
        <li>Proceed to payment to confirm your booking</li>
        <li>Once payment is completed, we'll send you a confirmation email</li>
        <li>You'll receive detailed trip information 7 days before departure</li>
      </ol>
    </div>

    <p><strong>Booking Reference:</strong> ${bookingData.booking_reference}</p>
    <p><strong>Quote Version:</strong> v${bookingData.revision_number}</p>
    <p><strong>Total Amount:</strong> ₹${parseFloat(bookingData.final_price).toLocaleString('en-IN')}</p>

    <a href="${process.env.FRONTEND_URL}/my-bookings/${bookingData.id}/payment"
       style="display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0;">
      Proceed to Payment
    </a>

    <p>If you have any questions, please don't hesitate to contact us.</p>
  `;

  await sendEmail(bookingData.contact_email, subject, html);
};

/**
 * Send quote acceptance notification to admin
 */
exports.sendQuoteAcceptanceEmailToAdmin = async (bookingData) => {
  const subject = `Client Accepted Quote - ${bookingData.booking_reference}`;

  const html = `
    <h2>Quote Accepted by Client</h2>
    <p>The client has accepted the quote for booking <strong>${bookingData.booking_reference}</strong>.</p>

    <p><strong>Tour:</strong> ${bookingData.tour_name}</p>
    <p><strong>Client:</strong> ${bookingData.contact_name} (${bookingData.contact_email})</p>
    <p><strong>Quote Version:</strong> v${bookingData.revision_number}</p>
    <p><strong>Amount:</strong> ₹${parseFloat(bookingData.final_price).toLocaleString('en-IN')}</p>
    <p><strong>Travel Date:</strong> ${new Date(bookingData.travel_date).toLocaleDateString('en-IN')}</p>

    <p>The client should proceed to payment shortly.</p>

    <a href="${process.env.ADMIN_URL || process.env.FRONTEND_URL}/admin/bookings/${bookingData.id}"
       style="display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0;">
      View Booking Details
    </a>
  `;

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
  await sendEmail(adminEmail, subject, html);
};
```

### Modification des Emails de Devis

Modifier les emails existants pour inclure les liens vers les pages web au lieu des PDFs:

```javascript
// Dans sendQuoteEmailToUser
const detailedQuoteLink = `${process.env.FRONTEND_URL}/my-bookings/${bookingData.id}/quote/detailed`;
const generalQuoteLink = `${process.env.FRONTEND_URL}/my-bookings/${bookingData.id}/quote/general`;

// Ajouter dans le template email:
<a href="${detailedQuoteLink}">View Detailed Quote</a>
<a href="${generalQuoteLink}">View General Quote</a>
```

---

## 🎨 Phase 4: Frontend - Composants

### Structure des Composants

```
frontend/src/
├── components/
│   └── quotes/
│       ├── QuoteHeader.jsx
│       ├── QuoteCountdown.jsx
│       ├── QuoteVersionSelector.jsx
│       ├── QuoteVehiclesSection.jsx
│       ├── QuoteAddonsSection.jsx
│       ├── QuotePriceBreakdown.jsx
│       ├── QuoteDiscountsSection.jsx
│       ├── QuoteFeesSection.jsx
│       ├── QuoteAcceptButton.jsx
│       ├── QuoteShareButton.jsx
│       └── QuoteStatusBadge.jsx
├── pages/
│   ├── QuoteDetailedPage.jsx
│   └── QuoteGeneralPage.jsx
└── services/
    └── quoteService.js
```

### Exemple: QuoteHeader.jsx

```jsx
import React from 'react';
import { Building2, Calendar, MapPin } from 'lucide-react';
import QuoteStatusBadge from './QuoteStatusBadge';
import QuoteCountdown from './QuoteCountdown';

const QuoteHeader = ({ quoteData }) => {
  return (
    <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {quoteData.tour.name}
          </h1>
          <p className="text-gray-600 mt-1">
            Quote #{quoteData.quoteNumber}
          </p>
        </div>
        <QuoteStatusBadge status={quoteData.status} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          <div>
            <p className="text-sm text-gray-600">Travel Date</p>
            <p className="font-semibold">
              {new Date(quoteData.tour.travelDate).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric'
              })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary" />
          <div>
            <p className="text-sm text-gray-600">Destination</p>
            <p className="font-semibold">{quoteData.tour.destination}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Building2 className="w-5 h-5 text-primary" />
          <div>
            <p className="text-sm text-gray-600">Package</p>
            <p className="font-semibold">{quoteData.tier.name}</p>
          </div>
        </div>
      </div>

      {!quoteData.status.expired && !quoteData.status.accepted && (
        <QuoteCountdown timeRemaining={quoteData.status.timeRemaining} />
      )}
    </div>
  );
};

export default QuoteHeader;
```

---

## 📄 Phase 5: Pages Frontend

### QuoteDetailedPage.jsx

```jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import quoteService from '../services/quoteService';
import QuoteHeader from '../components/quotes/QuoteHeader';
import QuoteVersionSelector from '../components/quotes/QuoteVersionSelector';
import QuoteVehiclesSection from '../components/quotes/QuoteVehiclesSection';
import QuoteAddonsSection from '../components/quotes/QuoteAddonsSection';
import QuotePriceBreakdown from '../components/quotes/QuotePriceBreakdown';
import QuoteAcceptButton from '../components/quotes/QuoteAcceptButton';
import QuoteShareButton from '../components/quotes/QuoteShareButton';

const QuoteDetailedPage = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [quoteData, setQuoteData] = useState(null);
  const [versions, setVersions] = useState([]);
  const [selectedVersion, setSelectedVersion] = useState(null);

  useEffect(() => {
    loadQuoteData();
    loadVersions();
  }, [bookingId]);

  const loadQuoteData = async (version = null) => {
    try {
      setLoading(true);
      const response = await quoteService.getDetailedQuote(bookingId, version);

      if (response.expired) {
        toast.error('This quote has expired');
        return;
      }

      setQuoteData(response.data);
      setSelectedVersion(response.data.revisionNumber);
    } catch (error) {
      toast.error('Failed to load quote');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadVersions = async () => {
    try {
      const response = await quoteService.getQuoteVersions(bookingId);
      setVersions(response.data);
    } catch (error) {
      console.error('Failed to load versions:', error);
    }
  };

  const handleAccept = async () => {
    try {
      await quoteService.acceptQuote(bookingId, selectedVersion);

      toast.success('Quote accepted successfully! Redirecting to payment...');

      setTimeout(() => {
        navigate(`/my-bookings/${bookingId}/payment`);
      }, 3000);
    } catch (error) {
      toast.error(error.message || 'Failed to accept quote');
    }
  };

  const handleVersionChange = (version) => {
    setSelectedVersion(version);
    loadQuoteData(version);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!quoteData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-2xl font-bold text-red-800 mb-2">Quote Not Available</h2>
          <p className="text-red-600">This quote has expired or is no longer available.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        <QuoteHeader quoteData={quoteData} />

        {versions.length > 1 && (
          <QuoteVersionSelector
            versions={versions}
            selectedVersion={selectedVersion}
            onVersionChange={handleVersionChange}
          />
        )}

        <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4">Tour Package</h2>
          <p className="text-gray-700">{quoteData.tier.name}</p>
          <p className="text-2xl font-bold text-primary mt-2">
            ₹{quoteData.pricing.tierPrice.toLocaleString('en-IN')}
          </p>
        </div>

        {quoteData.vehicles && quoteData.vehicles.length > 0 && (
          <QuoteVehiclesSection vehicles={quoteData.vehicles} duration={quoteData.tour.duration} />
        )}

        {quoteData.addons && quoteData.addons.length > 0 && (
          <QuoteAddonsSection addons={quoteData.addons} participants={quoteData.participants} />
        )}

        <QuotePriceBreakdown pricing={quoteData.pricing} duration={quoteData.tour.duration} />

        <div className="flex gap-4 mt-6">
          <QuoteShareButton bookingId={bookingId} />

          {quoteData.status.canAccept && (
            <QuoteAcceptButton onAccept={handleAccept} />
          )}
        </div>
      </div>
    </div>
  );
};

export default QuoteDetailedPage;
```

---

## 🗑️ Phase 6: Suppression des PDFs

### Fichiers à Supprimer

```bash
# Services
backend/src/services/pdfGenerationService.js
backend/src/services/quotePdfService.js

# Templates
backend/src/templates/quoteDetailedTemplate.js
backend/src/templates/quoteGeneralTemplate.js

# Fichiers PDF générés
backend/public/quotes/*.pdf

# Routes (si existantes)
backend/src/routes/quotePdfRoutes.js
```

### Colonnes DB à Supprimer (Optionnel)

```sql
ALTER TABLE bookings
DROP COLUMN IF EXISTS quote_pdf_path_detailed,
DROP COLUMN IF EXISTS quote_pdf_path_general;
```

### Code à Nettoyer

1. Retirer imports de pdfGenerationService
2. Retirer boutons "Download PDF" de l'interface admin
3. Retirer pièces jointes PDF des emails
4. Retirer références aux fichiers PDF dans le code

---

## 🧪 Phase 7: Tests

### Tests à Effectuer

1. **Test d'Acceptation**
   - [ ] Accepter un devis valide
   - [ ] Vérifier email de confirmation
   - [ ] Vérifier redirection vers paiement
   - [ ] Vérifier que le devis est marqué comme accepté

2. **Test d'Expiration**
   - [ ] Créer un devis avec date expirée (modifier DB)
   - [ ] Vérifier affichage "Devis expiré"
   - [ ] Vérifier impossibilité d'accepter

3. **Test de Versions**
   - [ ] Créer plusieurs versions d'un devis
   - [ ] Vérifier dropdown des versions
   - [ ] Accepter v1, modifier pour créer v2
   - [ ] Vérifier que v1 reste acceptée

4. **Test de Partage**
   - [ ] Cliquer sur "Partager le devis"
   - [ ] Vérifier que le lien est copié
   - [ ] Tester le lien copié

5. **Test Responsive**
   - [ ] Mobile
   - [ ] Tablette
   - [ ] Desktop

6. **Test Email**
   - [ ] Email après envoi de devis (liens vers pages)
   - [ ] Email après acceptation (confirmation)

---

## 📊 Estimation de Temps

| Phase | Tâches | Temps Estimé |
|-------|--------|--------------|
| 1 | Modifications DB | 30 min |
| 2 | Backend Routes & Controllers | 3-4 heures |
| 3 | Services Email | 1 heure |
| 4 | Frontend Composants | 4-5 heures |
| 5 | Pages Frontend | 2-3 heures |
| 6 | Suppression PDFs | 1 heure |
| 7 | Tests | 2 heures |
| **TOTAL** | | **13-16 heures** |

---

## ✅ Checklist de Complétion

- [ ] Phase 1: Modifications DB
- [ ] Phase 2: Backend Routes
- [ ] Phase 3: Services Email
- [ ] Phase 4: Composants Frontend
- [ ] Phase 5: Pages Frontend
- [ ] Phase 6: Suppression PDFs
- [ ] Phase 7: Tests

---

## 📝 Notes Importantes

1. **Sécurité:** Toutes les routes sont protégées par authentification
2. **Performance:** Utiliser React.memo pour les composants lourds
3. **SEO:** Ajouter meta tags appropriés
4. **Accessibilité:** Respecter WCAG 2.1 AA
5. **Responsive:** Mobile-first approach

---

**Date de Création:** 2025-01-12
**Status:** Prêt pour implémentation
