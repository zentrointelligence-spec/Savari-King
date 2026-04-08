# Plan d'implémentation: PDF de Confirmation de Réservation

## 📋 Vue d'ensemble
Lorsqu'un client effectue un paiement, générer automatiquement un PDF de confirmation de réservation et l'envoyer par email.

---

## 🎯 Objectif
Après paiement réussi, le client doit recevoir un email contenant:
- Confirmation de paiement
- PDF de confirmation de réservation attaché
- Détails complets de la réservation

---

## 📊 Analyse du flux actuel

### Frontend: PaymentPage.jsx
**Endpoint appelé après paiement:**
```javascript
POST /api/bookings/${bookingId}/payment/card
POST /api/bookings/${bookingId}/payment/bank-transfer
POST /api/bookings/${bookingId}/payment/paypal
```

### Backend: paymentController.js
**Flux actuel (ligne 160-161):**
```javascript
await sendPaymentConfirmedEmail(userId, bookingId);
await sendBookingConfirmedEmail(userId, bookingId);
```

**Status après paiement:**
- Status booking: `'Payment Confirmed'`
- Email envoyé: Oui (sans PDF)
- PDF généré: ❌ NON

---

## 🏗️ Architecture proposée

### 1. Structure des fichiers
```
backend/
├── src/
│   ├── services/
│   │   ├── bookingPdfService.js          [NOUVEAU]
│   │   ├── emailSimulationService.js     [MODIFIER]
│   │   └── pdfGenerationService.js       [EXISTE? À VÉRIFIER]
│   ├── templates/
│   │   └── booking-confirmation.html     [NOUVEAU]
│   └── public/
│       └── booking-confirmations/        [NOUVEAU - Dossier PDF]
```

### 2. Service: bookingPdfService.js
**Responsabilités:**
- Générer PDF de confirmation de réservation
- Inclure toutes les informations du booking
- Sauvegarder le PDF dans `public/booking-confirmations/`
- Retourner le chemin du fichier PDF

**Format du nom de fichier:**
```
booking-confirmation-{bookingReference}-{timestamp}.pdf
```

**Contenu du PDF:**
```
┌─────────────────────────────────────────────────┐
│  EBENEZER TOURS - Booking Confirmation         │
├─────────────────────────────────────────────────┤
│                                                 │
│  Booking Reference: EB-2025-123456             │
│  Booking Date: 15 Jan 2025                     │
│  Status: Payment Confirmed ✅                   │
│                                                 │
├─ CUSTOMER INFORMATION ─────────────────────────┤
│  Name: John Doe                                │
│  Email: john@example.com                       │
│  Phone: +91 1234567890                         │
│  Country: India                                │
│                                                 │
├─ TOUR DETAILS ─────────────────────────────────┤
│  Tour: Goa Beach Paradise                      │
│  Package Tier: Premium                         │
│  Duration: 5 days                              │
│  Travel Date: 15 Feb 2025                      │
│  Destinations: Panaji, Calangute, Baga         │
│                                                 │
├─ PARTICIPANTS ─────────────────────────────────┤
│  Adults: 2                                     │
│  Children: 1                                   │
│  Total: 3 participants                         │
│                                                 │
├─ VEHICLES ────────────────────────────────────┤
│  ✓ Toyota Innova (7 seats) × 1                │
│    ₹2,500/day × 5 days = ₹12,500              │
│                                                 │
├─ ADD-ONS ─────────────────────────────────────┤
│  ✓ Airport Pickup/Drop                        │
│    ₹1,500 × 3 persons = ₹4,500                │
│  ✓ Professional Guide                         │
│    ₹2,000/day × 5 days = ₹10,000              │
│                                                 │
├─ PRICING BREAKDOWN ───────────────────────────┤
│  Base Package Price:       ₹25,000            │
│  Vehicles Total:           ₹12,500            │
│  Add-ons Total:           ₹14,500            │
│  ──────────────────────────────────            │
│  Subtotal:                ₹52,000            │
│  Early Bird Discount:     -₹5,000            │
│  Service Fee:             +₹1,000            │
│  ──────────────────────────────────            │
│  TOTAL PAID:              ₹48,000 ✅          │
│                                                 │
├─ PAYMENT DETAILS ─────────────────────────────┤
│  Method: Credit Card                           │
│  Transaction ID: CARD-1736894400000            │
│  Payment Date: 15 Jan 2025, 10:30 AM          │
│                                                 │
├─ IMPORTANT INFORMATION ───────────────────────┤
│  • Please arrive 15 minutes before departure   │
│  • Bring valid ID proof                        │
│  • Contact us for any changes                  │
│  • Cancellation policy applies                 │
│                                                 │
└─────────────────────────────────────────────────┘
  Thank you for choosing Ebenezer Tours!
  Contact: info@ebenezertours.com | +91 XXX XXX
```

### 3. Modifications: emailSimulationService.js
**Fonction à modifier:**
```javascript
async sendPaymentConfirmedEmail(userId, bookingId) {
  // 1. Générer le PDF de confirmation
  const pdfPath = await bookingPdfService.generateBookingConfirmationPdf(bookingId);

  // 2. Récupérer les détails du booking
  const booking = await getBookingDetails(bookingId);

  // 3. Envoyer l'email avec le PDF en pièce jointe
  await sendEmailWithAttachment({
    to: booking.contact_email,
    subject: `Booking Confirmation - ${booking.booking_reference}`,
    template: 'booking-confirmation',
    data: booking,
    attachments: [{
      filename: `booking-confirmation-${booking.booking_reference}.pdf`,
      path: pdfPath
    }]
  });
}
```

### 4. Intégration dans paymentController.js
**Aucune modification requise** - Le PDF sera généré automatiquement lors de l'appel à `sendPaymentConfirmedEmail()`

---

## 📦 Dépendances NPM requises

```json
{
  "pdfkit": "^0.13.0",           // Génération PDF
  "nodemailer": "^6.9.7",        // Envoi email (déjà installé?)
  "handlebars": "^4.7.8"         // Templates HTML (déjà installé?)
}
```

---

## 🔧 Étapes d'implémentation

### Phase 1: Service de génération PDF
1. ✅ Analyser le flux actuel (FAIT)
2. ⏳ Créer `backend/src/services/bookingPdfService.js`
3. ⏳ Implémenter `generateBookingConfirmationPdf(bookingId)`
4. ⏳ Créer le template HTML pour le PDF
5. ⏳ Tester la génération PDF avec un booking existant

### Phase 2: Intégration email
1. ⏳ Modifier `emailSimulationService.js` pour attacher le PDF
2. ⏳ Mettre à jour la configuration Nodemailer si nécessaire
3. ⏳ Tester l'envoi d'email avec PDF attaché

### Phase 3: Tests complets
1. ⏳ Test end-to-end avec paiement carte
2. ⏳ Test avec paiement transfert bancaire
3. ⏳ Test avec paiement PayPal
4. ⏳ Vérifier que le PDF est bien reçu par email
5. ⏳ Vérifier le format et contenu du PDF

---

## 🎨 Design du PDF

### Couleurs
- **Primary:** #3B82F6 (Blue)
- **Success:** #10B981 (Green)
- **Text:** #1F2937 (Dark Gray)
- **Border:** #E5E7EB (Light Gray)

### Police
- **Heading:** Helvetica-Bold, 18pt
- **Subheading:** Helvetica-Bold, 14pt
- **Body:** Helvetica, 11pt
- **Small:** Helvetica, 9pt

### Layout
- **Marges:** 50pt top/bottom, 40pt left/right
- **En-tête:** Logo + titre
- **Sections:** Espacées avec bordures
- **Pied de page:** Contact info + thank you

---

## 🔒 Sécurité

1. **Stockage PDF:**
   - Dossier: `backend/public/booking-confirmations/`
   - Permissions: 755 (lecture publique)
   - Cleanup: Supprimer PDFs après 30 jours

2. **Accès:**
   - PDF accessible uniquement via lien direct
   - Nom de fichier contient hash/timestamp (non-guessable)

3. **Données sensibles:**
   - Masquer numéro de carte (si applicable)
   - Inclure seulement données publiques du booking

---

## 📝 Questions à résoudre

1. ✅ Quel service de génération PDF utiliser? → PDFKit
2. ⏳ Où stocker les PDFs générés? → `backend/public/booking-confirmations/`
3. ⏳ Quelle est la configuration actuelle de Nodemailer?
4. ⏳ Y a-t-il déjà des templates d'email HTML?
5. ⏳ Doit-on aussi générer PDF pour bank transfer (paiement en attente)?

---

## 🚀 Prochaines étapes

1. Vérifier si `pdfkit` est déjà installé
2. Créer le service `bookingPdfService.js`
3. Implémenter la génération de PDF
4. Intégrer avec l'envoi d'email
5. Tester le flux complet

---

## 📅 Timeline estimé

- **Phase 1 (PDF Service):** 2-3 heures
- **Phase 2 (Email Integration):** 1-2 heures
- **Phase 3 (Tests):** 1 heure
- **TOTAL:** 4-6 heures de développement

---

*Document créé le: 15 Janvier 2025*
*Dernière mise à jour: 15 Janvier 2025*
