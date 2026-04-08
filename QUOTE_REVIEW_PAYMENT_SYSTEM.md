# 📋 SYSTÈME DE RÉVISION DE DEVIS ET PAIEMENT - EBENEZER TOURS

**Date de création:** 19 Octobre 2025
**Version:** 1.0
**Projet:** Ebooking App - Ebenezer Tours & Travels

---

## 🎯 OBJECTIFS DU SYSTÈME

### Vue d'ensemble
Créer un système complet de gestion des devis permettant à l'administrateur de:
- Réviser et modifier les demandes de réservation avec un contrôle granulaire (prix unitaires, quantités)
- Générer des devis professionnels en PDF avec le logo de l'entreprise
- Gérer l'historique des révisions de devis
- Simuler un processus de paiement complet
- Envoyer des notifications par email (simulées pour le développement)

### Workflow Global

```
1. CLIENT: Soumet une demande de réservation
   ↓
2. ADMIN: Démarre la révision du devis (Start Review)
   ↓
3. ADMIN: Modifie les détails (quantités, prix, véhicules, addons)
   ↓
4. ADMIN: Génère et envoie le devis (PDFs + Email simulé)
   ↓
5. CLIENT: Reçoit le devis (48h de validité)
   ↓
6. CLIENT: Télécharge les PDFs et procède au paiement
   ↓
7. CLIENT: Choix de méthode (Carte / Virement / PayPal - simulation)
   ↓
8. SYSTÈME: Traite le paiement et confirme la réservation
```

---

## 📊 EXIGENCES FONCTIONNELLES

### 1. SYSTÈME DE RÉVISION DE DEVIS (ADMIN)

#### 1.1 Modification des éléments du devis

**TIER (Package)**
- ✅ Modifier le prix de base du tier
- ✅ Ajouter des notes/commentaires
- ✅ Confirmer la disponibilité

**VÉHICULES**
- ✅ Modifier la quantité de véhicules
- ✅ Modifier le prix unitaire de chaque véhicule
- ✅ Choisir/remplacer un véhicule par un autre
- ✅ Ajouter des commentaires sur les modifications
- ⚠️ Calcul automatique du sous-total

**ADD-ONS**
- ✅ Modifier la quantité de chaque addon
- ✅ Modifier le prix unitaire de chaque addon
- ✅ Ajouter des commentaires sur les modifications
- ⚠️ Calcul automatique du sous-total

**PARTICIPANTS**
- ❌ Pas de modification (fixe selon demande client)

**PRIX FINAUX**
- ✅ Appliquer des réductions (discounts) avec raison
- ✅ Ajouter des frais supplémentaires avec raison
- ⚠️ Calcul automatique du total final

#### 1.2 Historique des révisions

**Emplacement:** Page séparée `/admin/bookings/:id/revisions`

**Contenu affiché:**
- Numéro de révision (v1, v2, v3...)
- Date de création
- Nom de l'admin qui l'a créée
- Statut de la révision
- Boutons de téléchargement des PDFs (détaillé + général)
- Bouton "View Details"

**Statuts possibles pour une révision:**
- `draft` - En cours de création
- `in_review` - Admin en train de valider
- `validated` - Validée mais pas encore envoyée
- `sent` - Envoyée au client
- `expired` - Expirée (48h passées)
- `superseded` - Remplacée par une nouvelle révision
- `accepted` - Client a payé (devis accepté)

#### 1.3 Gestion des modifications de devis déjà envoyé

**Comportement:**
1. Admin modifie un devis déjà envoyé
2. Système crée une nouvelle révision (v2, v3...)
3. Ancienne révision:
   - Garde son statut "sent"
   - Mais devient "expired"
   - Champ `superseded_by` pointe vers nouvelle révision
4. Client est notifié par email (simulé)
5. Client ne peut plus accéder à l'ancien devis
6. Seul le nouveau devis est visible et payable

---

### 2. GÉNÉRATION DE PDF

#### 2.1 Configuration technique

**Bibliothèque:** Puppeteer (Node.js backend)
**Format:** PDF A4
**Stockage:** `/public/quotes/`
**Naming:** `quote-{booking_reference}-v{revision_number}-{type}.pdf`

**Exemple:**
- `quote-EB-2025-048736-v1-detailed.pdf`
- `quote-EB-2025-048736-v1-general.pdf`

#### 2.2 Devis Détaillé (Detailed Quote)

**En-tête:**
- ✅ Logo Ebenezer Tours (transparent PNG)
- ✅ Coordonnées de l'entreprise
- ✅ Numéro de devis: QUOTE-{booking_reference}
- ✅ Date d'émission
- ✅ Date d'expiration (48h après envoi)

**Informations client:**
- ✅ Nom complet
- ✅ Email
- ✅ Téléphone
- ✅ Pays d'origine

**Détails du tour:**
- ✅ Nom du tour
- ✅ Destination
- ✅ Date de voyage
- ✅ Durée (X jours)

**Tier sélectionné:**
- ✅ Nom du tier (Comfort, Premium, Luxury)
- ✅ Prix de base
- ✅ Liste des inclusions

**Participants:**
- ✅ Nombre d'adultes
- ✅ Nombre d'enfants avec âges

**Tableau des Véhicules:**
| Véhicule | Quantité | Prix unitaire | Sous-total |
|----------|----------|---------------|------------|
| ...      | ...      | ...           | ...        |

**Tableau des Add-ons:**
| Add-on | Quantité | Prix unitaire | Sous-total |
|--------|----------|---------------|------------|
| ...    | ...      | ...           | ...        |

**Calcul des prix:**
```
Tier Base Price:           ₹ XX,XXX
Vehicles Total:            ₹ XX,XXX
Add-ons Total:             ₹ XX,XXX
----------------------------------------
Subtotal:                  ₹ XX,XXX

Discounts:
  - Seasonal discount:     - ₹ X,XXX (Reason)
  - Group discount:        - ₹ X,XXX (Reason)
Total Discounts:           - ₹ X,XXX

Additional Fees:
  - Service fee:           + ₹ X,XXX (Reason)
  - Processing fee:        + ₹ X,XXX (Reason)
Total Fees:                + ₹ X,XXX
----------------------------------------
TOTAL FINAL:               ₹ XX,XXX
========================================
```

**Pied de page:**
- ✅ Conditions de paiement
- ✅ Politique d'annulation
- ✅ Coordonnées pour contact

#### 2.3 Devis Général (General Quote)

**Différences avec le détaillé:**
- ❌ Pas de prix unitaires
- ❌ Pas de quantités pour les add-ons
- ❌ Pas de tableau détaillé
- ✅ Seulement les sous-totaux et total final

**Structure simplifiée:**
```
Selected Package: Premium      ₹ 15,000
Vehicles:                       ₹ 10,000
Add-ons:                        ₹  5,000
----------------------------------------
TOTAL:                          ₹ 30,000
```

---

### 3. SYSTÈME DE PAIEMENT (SIMULATION)

#### 3.1 Méthodes de paiement disponibles

**1. CARTE BANCAIRE (Simulation)**
- Formulaire avec:
  - Numéro de carte (16 chiffres)
  - Date d'expiration (MM/YY)
  - CVV (3 chiffres)
  - Nom du titulaire
- Validation du format uniquement (pas de vrai traitement)
- Bouton "Pay ₹XX,XXX"
- Succès immédiat → Booking status = "Payment Confirmed"

**2. VIREMENT BANCAIRE (Simulation avec confirmation admin)**
- Affichage de coordonnées bancaires fictives:
  ```
  Bank: Example Bank
  Account Name: Ebenezer Tours & Travels
  Account Number: 1234567890
  IFSC Code: EXMP0001234
  Reference: {booking_reference}
  ```
- Utilisateur clique "J'ai effectué le virement"
- Booking status → "Payment Pending"
- Admin reçoit notification
- Admin doit confirmer manuellement
- Après confirmation → Booking status = "Payment Confirmed"

**3. PAYPAL/RAZORPAY (Simulation)**
- Bouton "Pay with PayPal"
- Simulation de redirection
- Succès immédiat → Booking status = "Payment Confirmed"

**⚠️ Restrictions:**
- ❌ Pas de paiement sur place
- ❌ Pas de paiement partiel (acompte + solde)
- ✅ Paiement complet uniquement

#### 3.2 Workflow de paiement

**Page:** `/payment/:bookingId`

**Étapes:**
1. Vérification que le devis n'est pas expiré
2. Affichage du résumé du devis
3. Sélection de la méthode de paiement
4. Remplissage du formulaire selon la méthode
5. Soumission du paiement (simulé)
6. Confirmation et email (simulé)
7. Redirection vers page de confirmation

---

### 4. EXPIRATION DES DEVIS

#### 4.1 Règles d'expiration

**Durée de validité:** 48 heures (NON MODIFIABLE)

**Calcul:** À partir de `quote_sent_date`

**Comportement à l'expiration:**
1. Statut de la révision → "expired"
2. Statut du booking → "Inquiry Pending"
3. Utilisateur ne peut plus payer
4. Email de notification envoyé (simulé)
5. Utilisateur doit contacter l'admin pour nouveau devis

#### 4.2 Mécanismes de vérification

**1. Cron Job (Proactif)**
- Exécution: Toutes les heures
- Action: Chercher les devis envoyés il y a > 48h
- Mise à jour: Statut révision + statut booking
- Notification: Email simulé

**2. Vérification à la demande (Réactif)**
- Quand: Utilisateur accède à son booking
- Quand: Utilisateur tente de payer
- Action: Vérifier si devis expiré
- Affichage: Message d'expiration si nécessaire

---

### 5. SYSTÈME D'EMAILS (SIMULATION)

#### 5.1 Types d'emails

**1. Quote Sent (Devis envoyé)**
- Quand: Admin envoie le devis initial
- À: Client
- Contenu:
  - Notification de nouveau devis disponible
  - Date d'expiration (48h)
  - Lien vers l'espace client
  - PDFs attachés (simulé)

**2. Quote Updated (Devis modifié)**
- Quand: Admin crée une nouvelle révision
- À: Client
- Contenu:
  - Notification de modification du devis
  - Ancien devis expiré
  - Nouveau devis disponible
  - Nouvelle date d'expiration
  - Lien vers l'espace client

**3. Quote Expired (Devis expiré)**
- Quand: 48h après envoi du devis
- À: Client
- Contenu:
  - Notification d'expiration
  - Invitation à contacter l'équipe
  - Coordonnées de contact

**4. Payment Confirmed (Paiement confirmé)**
- Quand: Paiement réussi (carte/PayPal) ou confirmé par admin (virement)
- À: Client
- Contenu:
  - Confirmation de paiement
  - Numéro de réservation
  - Détails du tour
  - Instructions pré-voyage
  - Coordonnées de contact

**5. Booking Confirmed (Réservation confirmée)**
- Quand: Après payment confirmed
- À: Client
- Contenu:
  - Confirmation complète de la réservation
  - Voucher de réservation (PDF)
  - Informations pratiques
  - Check-list avant départ

#### 5.2 Stockage des emails

**Table:** `email_logs`

**Structure:**
```sql
CREATE TABLE email_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  booking_id INTEGER REFERENCES bookings(id),
  revision_id INTEGER REFERENCES booking_quote_revisions(id),
  email_type VARCHAR(50), -- 'quote_sent', 'quote_updated', etc.
  recipient_email VARCHAR(255),
  recipient_name VARCHAR(255),
  subject VARCHAR(255),
  body TEXT,
  attachments JSONB, -- [{filename: 'quote.pdf', path: '/quotes/...'}]
  metadata JSONB, -- {booking_reference, amount, etc.}
  sent_at TIMESTAMP DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'simulated', -- 'simulated', 'sent', 'failed'
  error_message TEXT
);
```

**Utilisation:**
- Tous les emails sont loggés même en simulation
- Visible par l'admin dans `/admin/email-logs`
- Filtrable par type, date, booking
- Prêt pour production (changement de status 'simulated' → 'sent')

---

### 6. NOTIFICATIONS ADMIN

#### 6.1 Toast Notifications

**Bibliothèque:** react-toastify

**Quand afficher un toast:**
1. Devis envoyé avec succès
   - Message: "✅ Quote sent to {customer_email}"
2. Devis modifié et renvoyé
   - Message: "✅ Updated quote sent to {customer_email}"
3. Paiement reçu (virement en attente)
   - Message: "💰 Payment pending confirmation for Booking #{id}"
4. Paiement confirmé
   - Message: "✅ Payment confirmed for Booking #{id}"

**Position:** Top-right de l'écran admin

#### 6.2 Logs d'activité admin

**Table:** `admin_activity_logs`

**Structure:**
```sql
CREATE TABLE admin_activity_logs (
  id SERIAL PRIMARY KEY,
  admin_id INTEGER REFERENCES users(id),
  activity_type VARCHAR(50),
  description TEXT,
  related_booking_id INTEGER REFERENCES bookings(id),
  related_revision_id INTEGER REFERENCES booking_quote_revisions(id),
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Utilisation:**
- Log de toutes les actions importantes
- Visible dans un panneau dédié (optionnel)
- Traçabilité complète des actions admin

---

## 🗄️ STRUCTURE DE LA BASE DE DONNÉES

### Nouvelles Tables

#### 1. `email_logs`
```sql
CREATE TABLE email_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  booking_id INTEGER REFERENCES bookings(id) ON DELETE CASCADE,
  revision_id INTEGER REFERENCES booking_quote_revisions(id) ON DELETE SET NULL,
  email_type VARCHAR(50) NOT NULL,
  recipient_email VARCHAR(255) NOT NULL,
  recipient_name VARCHAR(255),
  subject VARCHAR(500) NOT NULL,
  body TEXT NOT NULL,
  attachments JSONB DEFAULT '[]'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  sent_at TIMESTAMP DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'simulated',
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_email_logs_user ON email_logs(user_id);
CREATE INDEX idx_email_logs_booking ON email_logs(booking_id);
CREATE INDEX idx_email_logs_type ON email_logs(email_type);
CREATE INDEX idx_email_logs_sent_at ON email_logs(sent_at DESC);
```

#### 2. `admin_activity_logs`
```sql
CREATE TABLE admin_activity_logs (
  id SERIAL PRIMARY KEY,
  admin_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  activity_type VARCHAR(50) NOT NULL,
  description TEXT NOT NULL,
  related_booking_id INTEGER REFERENCES bookings(id) ON DELETE CASCADE,
  related_revision_id INTEGER REFERENCES booking_quote_revisions(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_admin_activity_admin ON admin_activity_logs(admin_id);
CREATE INDEX idx_admin_activity_created ON admin_activity_logs(created_at DESC);
```

### Modifications des Tables Existantes

#### 1. `booking_quote_revisions`
```sql
-- Colonnes pour PDFs
ALTER TABLE booking_quote_revisions
ADD COLUMN IF NOT EXISTS quote_detailed_pdf VARCHAR(500),
ADD COLUMN IF NOT EXISTS quote_general_pdf VARCHAR(500);

-- Colonnes pour gestion des révisions
ALTER TABLE booking_quote_revisions
ADD COLUMN IF NOT EXISTS is_current_version BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS superseded_by INTEGER REFERENCES booking_quote_revisions(id),
ADD COLUMN IF NOT EXISTS superseded_at TIMESTAMP;

-- Colonnes pour commentaires admin
ALTER TABLE booking_quote_revisions
ADD COLUMN IF NOT EXISTS admin_comments TEXT,
ADD COLUMN IF NOT EXISTS vehicle_modifications_notes TEXT,
ADD COLUMN IF NOT EXISTS addon_modifications_notes TEXT;
```

#### 2. Structure JSON pour véhicules et addons

**Dans `booking_quote_revisions`:**

```javascript
// vehicles_original
[
  {
    "vehicle_id": 3,
    "name": "Van 12 places",
    "price": 5000,
    "quantity": 2
  }
]

// vehicles_adjusted (modifié par admin)
[
  {
    "vehicle_id": 3, // Peut changer si admin choisit autre véhicule
    "name": "Van 12 places",
    "original_price": 5000,
    "adjusted_price": 4500,
    "original_quantity": 2,
    "adjusted_quantity": 3,
    "modification_reason": "Increased capacity needed"
  }
]

// addons_original
[
  {
    "addon_id": 5,
    "name": "Visite guidée",
    "price": 500,
    "quantity": 2
  }
]

// addons_adjusted (modifié par admin)
[
  {
    "addon_id": 5,
    "name": "Visite guidée",
    "original_price": 500,
    "adjusted_price": 450,
    "original_quantity": 2,
    "adjusted_quantity": 3,
    "modification_reason": "Special group rate applied"
  }
]
```

---

## 🔧 ARCHITECTURE BACKEND

### Services

#### 1. `emailSimulationService.js`
**Responsabilités:**
- Logger tous les emails dans la table `email_logs`
- Créer le contenu HTML des emails
- Simuler l'envoi (status = 'simulated')
- Prêt pour production (juste changer le status)

**Fonctions principales:**
- `logEmail(emailData)` - Enregistrer un email
- `sendQuoteEmail(userId, bookingId, revisionId)` - Email de devis
- `sendQuoteUpdatedEmail(...)` - Email de modification
- `sendQuoteExpiredEmail(...)` - Email d'expiration
- `sendPaymentConfirmedEmail(...)` - Email de confirmation paiement
- `sendBookingConfirmedEmail(...)` - Email de confirmation réservation

#### 2. `pdfGenerationService.js`
**Responsabilités:**
- Générer les PDFs professionnels avec Puppeteer
- Utiliser les templates HTML
- Inclure le logo Ebenezer Tours
- Sauvegarder dans `/public/quotes/`
- Retourner les chemins des fichiers

**Fonctions principales:**
- `generateDetailedQuotePDF(revisionId)` - PDF détaillé
- `generateGeneralQuotePDF(revisionId)` - PDF général
- `getRevisionData(revisionId)` - Récupérer données pour PDF

#### 3. `quoteExpirationService.js`
**Responsabilités:**
- Vérifier l'expiration des devis
- Mettre à jour les statuts
- Envoyer notifications d'expiration

**Fonctions principales:**
- `checkAndExpireQuotes()` - Cron job principal
- `isQuoteExpired(quoteSentDate)` - Vérification à la demande
- `expireQuote(revisionId, bookingId)` - Expirer un devis spécifique

#### 4. `adminNotificationService.js`
**Responsabilités:**
- Logger les activités admin
- Fournir les données pour les toast notifications

**Fonctions principales:**
- `logAdminActivity(adminId, activityType, description, bookingId, metadata)`
- `getRecentAdminActivities(adminId, limit)`

### Controllers

#### 1. `quoteRevisionController.js` (Modifications)
**Nouvelles fonctions:**
- `createNewRevision()` - Créer révision v2, v3...
- `updateVehicles()` - Modifier véhicules avec détails
- `updateAddons()` - Modifier addons avec détails
- `sendQuoteToCustomer()` - Générer PDFs + envoyer email
- `getRevisionHistory()` - Historique des révisions

#### 2. `paymentController.js` (Nouveau)
**Fonctions:**
- `getPaymentPage()` - Données pour page de paiement
- `processCardPayment()` - Simulation paiement carte
- `processBankTransfer()` - Marquer paiement en attente
- `confirmBankTransfer()` - Admin confirme le virement
- `processPayPalPayment()` - Simulation PayPal

#### 3. `emailLogsController.js` (Nouveau)
**Fonctions:**
- `getEmailLogs()` - Liste tous les emails (admin)
- `getEmailLogsByBooking()` - Emails pour un booking spécifique

### Routes

#### 1. Quote Revision Routes (ajouts)
```javascript
// Nouvelle révision
POST /api/bookings/:bookingId/review/new-revision

// Mise à jour détaillée des véhicules
PATCH /api/bookings/:bookingId/review/:revisionId/vehicles-detailed

// Mise à jour détaillée des addons
PATCH /api/bookings/:bookingId/review/:revisionId/addons-detailed

// Générer et envoyer le devis
POST /api/bookings/:bookingId/review/:revisionId/send-quote

// Historique des révisions
GET /api/bookings/:bookingId/revisions/history
```

#### 2. Payment Routes (nouveau)
```javascript
// Page de paiement
GET /api/payments/:bookingId

// Paiement carte
POST /api/payments/:bookingId/card

// Paiement virement
POST /api/payments/:bookingId/bank-transfer

// Confirmation virement (admin)
POST /api/payments/:bookingId/bank-transfer/confirm

// Paiement PayPal
POST /api/payments/:bookingId/paypal
```

#### 3. Email Logs Routes (nouveau)
```javascript
// Tous les logs
GET /api/email-logs

// Logs par booking
GET /api/email-logs/booking/:bookingId
```

### Cron Job

**Fichier:** `jobs/quoteExpirationJob.js`

**Configuration:**
- Fréquence: Toutes les heures (`0 * * * *`)
- Action: Appeler `quoteExpirationService.checkAndExpireQuotes()`
- Logging: Console avec timestamp

---

## 🎨 ARCHITECTURE FRONTEND

### Nouvelles Pages

#### 1. `/admin/bookings/:bookingId/revisions` - Revision History
**Composants:**
- `RevisionHistoryPage.jsx` - Page principale
- `RevisionRow.jsx` - Ligne du tableau
- `RevisionDetailsModal.jsx` - Modal de détails

**Fonctionnalités:**
- Affichage tableau des révisions
- Tri et filtrage
- Téléchargement des PDFs
- Visualisation des détails

#### 2. `/payment/:bookingId` - Payment Page
**Composants:**
- `PaymentPage.jsx` - Page principale
- `QuoteSummary.jsx` - Résumé du devis
- `PaymentMethodSelector.jsx` - Choix de méthode
- `CardPaymentForm.jsx` - Formulaire carte
- `BankTransferInfo.jsx` - Infos virement
- `PayPalButton.jsx` - Bouton PayPal

**Fonctionnalités:**
- Vérification expiration
- Sélection méthode de paiement
- Validation des formulaires
- Soumission du paiement
- Redirection après succès

#### 3. `/admin/email-logs` - Email Logs (Admin)
**Composants:**
- `EmailLogsPage.jsx` - Page principale
- `EmailLogFilters.jsx` - Filtres
- `EmailLogTable.jsx` - Tableau
- `EmailViewModal.jsx` - Vue détaillée email

**Fonctionnalités:**
- Filtrage par type, date, booking
- Recherche
- Visualisation du contenu
- Export (optionnel)

### Modifications de Pages Existantes

#### 1. `AdminQuoteReviewPage.jsx`
**Nouveaux composants intégrés:**
- `VehiclesDetailedEditor.jsx` - Éditeur véhicules
- `AddonsDetailedEditor.jsx` - Éditeur addons

**Nouvelles fonctionnalités:**
- Bouton "Create New Revision" (si déjà envoyé)
- Modification détaillée véhicules/addons
- Bouton "Generate & Send Quote"
- Toast notification après envoi

#### 2. `BookingStatusCard.jsx`
**Nouveaux éléments:**
- Bouton "Proceed to Payment" (status = Quote Sent)
- Affichage des PDFs téléchargeables
- Gestion visuelle de l'expiration
- Message "Payment Pending" (virement)

### Nouveaux Composants

#### 1. Éditeurs détaillés

**`VehiclesDetailedEditor.jsx`**
```jsx
Features:
- Sélection de véhicule (dropdown)
- Input quantité
- Input prix unitaire
- Textarea notes/raison
- Calcul sous-total automatique
- Bouton ajouter/supprimer véhicule
```

**`AddonsDetailedEditor.jsx`**
```jsx
Features:
- Nom de l'addon (readonly)
- Input quantité
- Input prix unitaire
- Textarea notes/raison
- Calcul sous-total automatique
```

#### 2. Toast Notification System

**`AdminNotificationToast.jsx`**
```jsx
Features:
- Positionnement top-right
- Affichage automatique des activités
- Auto-dismiss après 5 secondes
- Click pour fermer
```

---

## ⏱️ PLAN D'IMPLÉMENTATION

### PHASE 1: Base de données (1-2h)
- [ ] Créer table `email_logs`
- [ ] Créer table `admin_activity_logs`
- [ ] Modifier table `booking_quote_revisions`
- [ ] Ajouter statut "Payment Pending"
- [ ] Tester les migrations

### PHASE 2: Services Backend (3-4h)
- [ ] `emailSimulationService.js`
- [ ] `pdfGenerationService.js`
- [ ] `quoteExpirationService.js`
- [ ] `adminNotificationService.js`
- [ ] Tests unitaires des services

### PHASE 3: Controllers et Routes (4-5h)
- [ ] Modifier `quoteRevisionController.js`
- [ ] Créer `paymentController.js`
- [ ] Créer `emailLogsController.js`
- [ ] Ajouter routes quote revision
- [ ] Créer `paymentRoutes.js`
- [ ] Créer `emailLogsRoutes.js`
- [ ] Monter routes dans `index.js`

### PHASE 4: Cron Job (1h)
- [ ] Créer `jobs/quoteExpirationJob.js`
- [ ] Intégrer dans `index.js`
- [ ] Tester l'exécution

### PHASE 5: Templates PDF (2-3h)
- [ ] Créer `quoteDetailedTemplate.js`
- [ ] Créer `quoteGeneralTemplate.js`
- [ ] Installer Puppeteer
- [ ] Configurer génération PDF
- [ ] Tester avec données réelles

### PHASE 6: Frontend Admin - Quote Review (4-5h)
- [ ] Créer `VehiclesDetailedEditor.jsx`
- [ ] Créer `AddonsDetailedEditor.jsx`
- [ ] Modifier `AdminQuoteReviewPage.jsx`
- [ ] Ajouter bouton "Generate & Send Quote"
- [ ] Intégrer toast notifications
- [ ] Tests d'intégration

### PHASE 7: Frontend - Revision History (2-3h)
- [ ] Créer `RevisionHistoryPage.jsx`
- [ ] Créer composants associés
- [ ] Ajouter route dans router
- [ ] Tester navigation et affichage

### PHASE 8: Frontend - Payment Page (4-5h)
- [ ] Créer `PaymentPage.jsx`
- [ ] Créer `CardPaymentForm.jsx`
- [ ] Créer `BankTransferInfo.jsx`
- [ ] Créer `PayPalButton.jsx`
- [ ] Ajouter route dans router
- [ ] Tester tous les flux de paiement

### PHASE 9: Frontend - User Bookings (2h)
- [ ] Modifier `BookingStatusCard.jsx`
- [ ] Ajouter bouton "Proceed to Payment"
- [ ] Afficher PDFs de devis
- [ ] Gérer expiration visuelle
- [ ] Tester tous les statuts

### PHASE 10: Frontend - Admin Email Logs (2h)
- [ ] Créer `EmailLogsPage.jsx`
- [ ] Créer composants de filtrage
- [ ] Ajouter route admin
- [ ] Tester affichage et filtres

### PHASE 11: Tests et Debug (3-4h)
- [ ] Tester workflow complet admin → client
- [ ] Vérifier génération PDFs
- [ ] Tester expiration automatique
- [ ] Vérifier logs d'emails
- [ ] Tester chaque méthode de paiement
- [ ] Corriger bugs identifiés

### PHASE 12: Polish et Optimisations (2h)
- [ ] Améliorer styles CSS
- [ ] Ajouter animations
- [ ] Optimiser performances
- [ ] Documentation du code
- [ ] Créer guide d'utilisation

---

## 📈 ESTIMATION TOTALE

**Durée totale:** 30-38 heures

**Répartition:**
- Backend: 12-15h
- Frontend: 14-17h
- Tests: 3-4h
- Polish: 2h

---

## 🚀 LIVRABLES

### Backend
1. ✅ 2 nouvelles tables en base de données
2. ✅ 4 services fonctionnels
3. ✅ 3 controllers (1 modifié, 2 nouveaux)
4. ✅ 15+ nouveaux endpoints API
5. ✅ 1 cron job pour expiration
6. ✅ Templates PDF professionnels
7. ✅ Système de logging complet

### Frontend
1. ✅ 3 nouvelles pages complètes
2. ✅ 8+ nouveaux composants réutilisables
3. ✅ Modification de 2 pages existantes
4. ✅ Système de notifications toast
5. ✅ Interface de paiement complète
6. ✅ Gestion des PDFs
7. ✅ Responsive design

### Documentation
1. ✅ Ce document récapitulatif
2. ✅ Documentation API (à générer)
3. ✅ Guide utilisateur admin (à créer)
4. ✅ Guide utilisateur client (à créer)

---

## 🔐 SÉCURITÉ ET VALIDATIONS

### Backend
- ✅ Authentification JWT sur toutes les routes
- ✅ Vérification des rôles (admin vs user)
- ✅ Validation des données d'entrée
- ✅ Sanitization des inputs
- ✅ Protection CSRF
- ✅ Rate limiting sur paiements

### Frontend
- ✅ Validation des formulaires
- ✅ Gestion des erreurs
- ✅ Loading states
- ✅ Confirmation des actions critiques
- ✅ Protection des routes

---

## 📝 NOTES IMPORTANTES

### Pour la Production Future

**Emails:**
- Remplacer le service de simulation par un vrai service SMTP
- Configurer les variables d'environnement (SMTP_HOST, etc.)
- Changer status 'simulated' → 'sent' dans les logs
- Implémenter retry logic en cas d'échec

**Paiements:**
- Intégrer Stripe/Razorpay/autre gateway réel
- Configurer les clés API
- Implémenter webhooks pour confirmations
- Ajouter gestion des remboursements
- Implémenter 3D Secure

**PDFs:**
- Optimiser la génération (mise en cache?)
- Configurer CDN pour servir les PDFs
- Implémenter signature numérique (optionnel)

**Monitoring:**
- Ajouter logs d'erreurs (Sentry?)
- Monitoring des cron jobs
- Alertes en cas d'échecs critiques

---

## 📞 CONTACTS ET RESSOURCES

**Logo Ebenezer Tours:**
- Emplacement: `frontend/src/assets/images/EbenezerTourTransparentLogo.png`
- Format: PNG transparent
- Utilisation: En-tête des PDFs

**Documentation Puppeteer:**
- https://pptr.dev/

**Documentation react-toastify:**
- https://fkhadra.github.io/react-toastify/

**Base de données:**
- PostgreSQL
- Database: `ebookingsam`
- User: `postgres`

---

## ✅ CHECKLIST DE VALIDATION

Avant de considérer le projet terminé:

### Fonctionnalités Admin
- [ ] L'admin peut démarrer une révision de devis
- [ ] L'admin peut modifier quantités et prix des addons
- [ ] L'admin peut modifier quantités, prix et sélection des véhicules
- [ ] L'admin peut ajouter des commentaires sur les modifications
- [ ] L'admin peut générer les 2 PDFs (détaillé + général)
- [ ] L'admin peut envoyer le devis au client
- [ ] L'admin reçoit un toast de confirmation
- [ ] L'admin peut créer une nouvelle révision (v2, v3...)
- [ ] L'admin peut voir l'historique complet des révisions
- [ ] L'admin peut voir tous les emails simulés
- [ ] L'admin peut confirmer les virements bancaires

### Fonctionnalités Client
- [ ] Le client voit "Quote Ready" quand devis envoyé
- [ ] Le client peut télécharger le PDF détaillé
- [ ] Le client peut télécharger le PDF général
- [ ] Le client voit le bouton "Proceed to Payment"
- [ ] Le client peut choisir sa méthode de paiement
- [ ] Le client peut payer par carte (simulation)
- [ ] Le client peut payer par virement (attente confirmation)
- [ ] Le client peut payer par PayPal (simulation)
- [ ] Le client voit "Payment Confirmed" après paiement
- [ ] Le client ne peut plus payer si devis expiré

### Système
- [ ] Les devis expirent automatiquement après 48h
- [ ] Les emails sont loggés dans la base de données
- [ ] Les PDFs contiennent le logo Ebenezer
- [ ] Les PDFs sont formatés professionnellement
- [ ] Les révisions sont numérotées correctement (v1, v2...)
- [ ] Les anciennes révisions sont marquées "expired"
- [ ] Les calculs de prix sont corrects
- [ ] Les notifications fonctionnent

---

**Document créé le:** 19 Octobre 2025
**Dernière mise à jour:** 19 Octobre 2025
**Version:** 1.0
**Auteur:** Claude Code + Sam (Product Owner)
