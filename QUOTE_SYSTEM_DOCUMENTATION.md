# 📋 Documentation Système Quote Review & Payment

## 🎯 Vue d'ensemble

Le système Quote Review & Payment est un système complet de gestion de devis et paiements pour l'application de réservation de tours. Il permet aux administrateurs de créer, réviser et envoyer des devis professionnels avec génération automatique de PDFs, et aux utilisateurs de payer leurs réservations via plusieurs méthodes.

---

## 🏗️ Architecture du Système

### Backend (Node.js + Express + PostgreSQL)

#### 1. **Base de Données**

##### Tables principales:
- `booking_quote_revisions` - Stocke toutes les versions des devis
- `email_logs` - Enregistre tous les emails simulés
- `bookings` - Réservations avec statuts et prix

##### Structure `booking_quote_revisions`:
```sql
- id (PK)
- booking_id (FK -> bookings)
- revision_number (v1, v2, v3...)
- review_status (in_progress, sent, expired, superseded, rejected)
- base_price
- vehicles_price
- addons_price
- final_price
- vehicles_original (JSONB)
- vehicles_adjusted (JSONB)
- addons_original (JSONB)
- addons_adjusted (JSONB)
- detailed_pdf_path
- general_pdf_path
- validation_score
- is_active
- superseded_by
```

##### Structure `email_logs`:
```sql
- id (PK)
- user_id (FK)
- booking_id (FK)
- revision_id (FK)
- email_type (quote_sent, payment_confirmed, etc.)
- recipient_email
- recipient_name
- subject
- body
- attachments (JSONB)
- status (simulated, sent, failed)
- sent_at
```

#### 2. **Services Backend**

##### `quoteRevisionController.js`
- **Endpoint**: POST `/api/bookings/:bookingId/review/initialize`
  - Crée la révision initiale (v1)
  - Status: `in_progress`

- **Endpoint**: GET `/api/bookings/:bookingId/review`
  - Récupère la révision active et détails du booking

- **Endpoint**: PUT `/api/bookings/:bookingId/review/:revisionId/vehicles`
  - Valide et ajuste les véhicules
  - Calcule le prix total des véhicules

- **Endpoint**: PUT `/api/bookings/:bookingId/review/:revisionId/addons`
  - Valide et ajuste les add-ons
  - Calcule le prix total des add-ons

- **Endpoint**: POST `/api/bookings/:bookingId/review/:revisionId/send-quote`
  - Génère les PDFs (detailed + general)
  - Change le statut du booking à "Quote Sent"
  - Définit l'expiration (48h)
  - Envoie l'email simulé
  - Logs l'email

- **Endpoint**: POST `/api/bookings/:bookingId/review/new-revision`
  - Crée une nouvelle révision (v2, v3...)
  - Marque l'ancienne comme `superseded`
  - Copie les données de la révision précédente

##### `pdfGenerationService.js`
- Utilise **Puppeteer** pour générer les PDFs
- Deux types de PDFs:
  - **Detailed Quote**: Inclut tous les détails (véhicules, add-ons, prix détaillés)
  - **General Quote**: Version simplifiée pour le client
- Templates HTML professionnels avec CSS inline
- Enregistrement dans `/public/quotes/`

##### `emailSimulationService.js`
- `sendQuoteEmail()` - Email de devis envoyé
- `sendPaymentConfirmedEmail()` - Email de paiement confirmé
- `sendQuoteExpiredEmail()` - Email d'expiration
- `logEmail()` - Enregistre dans `email_logs`
- Templates HTML avec design moderne

##### `paymentController.js`
- **Endpoint**: POST `/api/bookings/:bookingId/payment/card`
  - Paiement carte (instantané)
  - Vérifie la validité du quote
  - Change statut à "Payment Confirmed"
  - Envoie email de confirmation

- **Endpoint**: POST `/api/bookings/:bookingId/payment/bank-transfer`
  - Virement bancaire (en attente)
  - Status `pending` jusqu'à validation admin

- **Endpoint**: POST `/api/bookings/:bookingId/payment/paypal`
  - Paiement PayPal (instantané)

##### `emailLogsController.js`
- **Endpoint**: GET `/api/admin/email-logs`
  - Liste paginée avec filtres
  - Filtres: type, status, booking_id

- **Endpoint**: GET `/api/admin/email-logs/stats`
  - Statistiques des emails
  - Total, aujourd'hui, par type, par statut

##### `cronJobService.js`
- Vérifie les quotes expirés toutes les heures
- Change le statut à "Quote Expired"
- Envoie email d'expiration

---

### Frontend (React.js + Vite)

#### 3. **Pages Admin**

##### `AdminQuoteReviewPage.jsx`
**Route**: `/admin/bookings/:bookingId/review`

**Fonctionnalités**:
- Vue complète de la révision active
- Sections validables:
  - ✅ Informations du booking (read-only)
  - ✅ Prix de base (éditable)
  - ✅ Véhicules (éditable avec quantités et prix)
  - ✅ Add-ons (éditable avec quantités et prix)
  - ✅ Notes administrateur
- Calcul automatique du prix final
- Score de validation (0-100%)
- Boutons d'action:
  - **Save Changes**: Sauvegarde sans envoyer
  - **Send Quote**: Génère PDFs et envoie email
  - **Create New Revision**: Crée v2, v3...

**États**:
```javascript
{
  booking: {...},           // Données booking
  revision: {...},          // Révision active
  loading: boolean,
  isSaving: boolean,
  validationStatus: {       // Validation par section
    basePrice: boolean,
    vehicles: boolean,
    addons: boolean
  }
}
```

##### `AdminRevisionHistoryPage.jsx`
**Route**: `/admin/bookings/:bookingId/revisions`

**Fonctionnalités**:
- Liste complète des révisions (v1, v2, v3...)
- Pour chaque révision:
  - Numéro de version
  - Status (sent, superseded, expired)
  - Prix détaillés (base, véhicules, add-ons, total)
  - Dates (création, modification)
  - Score de validation
  - Liens vers PDFs générés
  - Notes admin
  - Raison de rejet (si applicable)
- Indicateur "ACTIVE" pour la révision courante
- Relation de supersession affichée

##### `AdminEmailLogsPage.jsx`
**Route**: `/admin/email-logs`

**Fonctionnalités**:
- Liste paginée des emails simulés
- Cartes statistiques:
  - Total emails
  - Emails aujourd'hui
  - Types uniques
  - Emails échoués
- Filtres:
  - Type d'email
  - Statut
  - Nombre par page
- Tableau avec:
  - Date/Heure
  - Type (avec badge)
  - Destinataire
  - Sujet
  - Booking reference
  - Statut
  - Bouton "View"
- Modal de détails complet:
  - Informations email
  - Corps HTML rendu
  - Pièces jointes
  - Messages d'erreur

##### `AdminBookingsPage.jsx`
**Améliorations**:
- Menu dropdown par booking avec:
  - "Review Quote" -> AdminQuoteReviewPage
  - "View Revisions" -> AdminRevisionHistoryPage
  - "Mark as Paid" (si Quote Sent)
  - "Cancel Booking"

---

#### 4. **Pages Utilisateur**

##### `MyBookingsPage.jsx`
**Route**: `/my-bookings`

**Fonctionnalités**:
- Liste des réservations de l'utilisateur
- Composant `BookingStatusCard` pour chaque booking

##### `BookingStatusCard.jsx`
**Component réutilisable**

**Fonctionnalités**:
- Badge de statut coloré avec icône
- Informations du tour (image, nom, tier, durée)
- Grille de détails (date, adultes, enfants, prix)
- **Countdown timer en temps réel** (pour Quote Sent)
  - Affichage HH:MM:SS
  - Change de couleur selon temps restant:
    - Bleu: Plus de 2h
    - Orange: Moins de 2h
    - Rouge: Expiré
- Section PDFs téléchargeables (Quote Sent uniquement)
  - Detailed Quote PDF
  - General Quote PDF
- Boutons d'action:
  - **Pay Now** (si Quote Sent et non payé)
  - **View Details** -> BookingDetailsPage
  - **Cancel Booking** (si autorisé)
  - **Leave Review** (si Trip Completed)

##### `BookingDetailsPage.jsx`
**Route**: `/booking/:id`

**Fonctionnalités complètes**:
- Header avec statut coloré
- **Countdown timer géant** (Quote Sent)
  - Mise à jour chaque seconde
  - Design gradient selon urgence
  - Affichage heures:minutes:secondes
- Section téléchargement PDFs
  - Liens vers detailed et general quotes
- Informations tour complètes:
  - Image et détails
  - Grille de dates/participants/prix
  - Liste véhicules sélectionnés
  - Liste add-ons sélectionnés
- Sidebar avec:
  - Informations de contact
  - Boutons d'action
  - Messages selon statut

##### `PaymentPage.jsx`
**Route**: `/my-bookings/:bookingId/payment`

**Fonctionnalités**:
- Sécurité: Vérifie propriété et status
- 3 méthodes de paiement:
  1. **Carte** (instantané)
     - Numéro de carte formaté
     - Nom du titulaire
     - Date d'expiration (MM/YYYY)
     - CVV
  2. **Virement bancaire** (pending)
     - Nom de banque
     - Numéro de compte
     - Référence transaction
  3. **PayPal** (instantané)
     - Email PayPal
     - Transaction ID
- Sidebar récapitulatif commande
- Validation formulaires
- Redirection vers My Bookings après succès

---

## 📊 Flux de Travail

### Workflow Admin: Création et Envoi de Quote

```
1. CLIENT crée une réservation
   └─> Status: "Inquiry Pending"

2. ADMIN va dans Bookings -> "Review Quote"
   └─> AdminQuoteReviewPage s'ouvre

3. ADMIN initialise la révision (si première fois)
   └─> POST /review/initialize
   └─> Crée revision v1 (status: in_progress)

4. ADMIN valide le prix de base
   └─> PUT /review/:revisionId/base-price

5. ADMIN valide/ajuste les véhicules
   └─> PUT /review/:revisionId/vehicles
   └─> Peut modifier quantités et prix unitaires

6. ADMIN valide/ajuste les add-ons
   └─> PUT /review/:revisionId/addons
   └─> Peut modifier quantités et prix unitaires

7. ADMIN ajoute des notes (optionnel)
   └─> Visible dans révision history

8. ADMIN clique "Send Quote"
   └─> POST /review/:revisionId/send-quote
   └─> Génère Detailed PDF
   └─> Génère General PDF
   └─> Change booking status à "Quote Sent"
   └─> Définit expiration (now + 48h)
   └─> Envoie email avec PDFs
   └─> Log email dans email_logs

9. CLIENT reçoit notification (simulée)
   └─> Email avec liens PDFs et expiration
```

### Workflow Client: Consultation et Paiement

```
1. CLIENT se connecte et va dans My Bookings

2. Voit BookingStatusCard avec:
   └─> Status "Quote Sent"
   └─> Countdown timer actif
   └─> Liens de téléchargement PDFs
   └─> Bouton "Pay Now"

3. CLIENT télécharge et consulte les PDFs

4. CLIENT clique "View Details" (optionnel)
   └─> Voir BookingDetailsPage complet

5. CLIENT clique "Pay Now"
   └─> Redirect vers PaymentPage

6. CLIENT choisit méthode de paiement
   └─> Remplit formulaire

7. CLIENT soumet paiement
   └─> POST /payment/{method}
   └─> Vérifie validité quote
   └─> Change status à "Payment Confirmed"
   └─> Envoie email confirmation
   └─> Redirect My Bookings

8. CLIENT voit status "Payment Confirmed"
```

### Workflow Admin: Nouvelle Révision

```
1. CLIENT demande modification du quote

2. ADMIN va dans AdminQuoteReviewPage

3. ADMIN clique "Create New Revision"
   └─> POST /review/new-revision
   └─> Crée revision v2 (copie données v1)
   └─> Marque v1 comme "superseded"
   └─> v1.superseded_by = v2.id

4. ADMIN modifie prix/véhicules/add-ons

5. ADMIN "Send Quote" à nouveau
   └─> Génère nouveaux PDFs v2
   └─> Change expiration (nouvelles 48h)
   └─> Envoie email "Updated Quote"

6. CLIENT reçoit nouveau quote
```

### Workflow Automatique: Expiration

```
CRON JOB (toutes les heures)
   └─> Cherche bookings avec:
      - status = "Quote Sent"
      - quote_expiration_date < NOW

   └─> Pour chaque booking trouvé:
      - Change status à "Quote Expired"
      - Marque révision active comme "expired"
      - Envoie email d'expiration
      - Log dans email_logs
```

---

## 🎨 Design & UX

### Codes Couleurs des Statuts

#### Bookings:
- 🟡 **Inquiry Pending**: Jaune (en attente)
- 📧 **Quote Sent**: Bleu (devis prêt)
- ⏰ **Quote Expired**: Gris (expiré)
- ✅ **Payment Confirmed**: Vert (confirmé)
- ❌ **Cancelled**: Rouge (annulé)
- 🎉 **Trip Completed**: Violet (terminé)

#### Revisions:
- 🟡 **in_progress**: Jaune (en cours)
- 🟢 **sent**: Vert (envoyé)
- ⚫ **expired**: Gris (expiré)
- 🟣 **superseded**: Violet (remplacé)
- 🔴 **rejected**: Rouge (rejeté)

#### Emails:
- 🟢 **sent/simulated**: Vert
- 🔴 **failed**: Rouge
- 🟡 **pending**: Jaune

---

## 🔒 Sécurité

### Backend:
- ✅ Authentification JWT requise
- ✅ Vérification rôle admin pour review
- ✅ Ownership check pour paiements
- ✅ Validation status avant paiement
- ✅ Transactions SQL pour cohérence

### Frontend:
- ✅ AuthContext pour gestion sessions
- ✅ Redirection si non autorisé
- ✅ Validation formulaires côté client
- ✅ Messages d'erreur explicites
- ✅ Tokens dans headers Authorization

---

## 📦 Dépendances

### Backend:
```json
{
  "puppeteer": "^21.0.0",     // Génération PDFs
  "nodemailer": "^6.9.0",     // (Préparé pour vrais emails)
  "date-fns": "^2.30.0",      // Manipulation dates
  "express": "^4.18.0",
  "pg": "^8.11.0"             // PostgreSQL
}
```

### Frontend:
```json
{
  "react": "^18.2.0",
  "@fortawesome/react-fontawesome": "^0.2.0",
  "@fortawesome/free-solid-svg-icons": "^6.4.0",
  "date-fns": "^2.30.0",
  "axios": "^1.4.0",
  "react-router-dom": "^6.14.0",
  "react-toastify": "^9.1.3"
}
```

---

## 🧪 Tests

### Script de Test Backend:
Fichier: `backend/test-quote-system.js`

**Étapes testées**:
1. ✅ Connexion Admin
2. ✅ Connexion User
3. ✅ Création réservation
4. ✅ Récupération détails
5. ✅ Création révision initiale
6. ✅ Validation véhicules
7. ✅ Validation add-ons
8. ✅ Envoi quote (PDFs + email)
9. ✅ Vérification email logs
10. ✅ Simulation paiement
11. ✅ Récapitulatif final

**Exécution**:
```bash
cd backend
node test-quote-system.js
```

### Tests Manuels Frontend:

#### Test 1: Flow Admin Complet
1. Login admin
2. Aller Bookings
3. Sélectionner un booking "Inquiry Pending"
4. Cliquer "Review Quote"
5. Initialiser révision
6. Ajuster prix base
7. Modifier véhicules (quantités/prix)
8. Modifier add-ons
9. Ajouter notes admin
10. Cliquer "Send Quote"
11. Vérifier PDFs générés
12. Aller Email Logs
13. Vérifier email "quote_sent"

#### Test 2: Flow Utilisateur Complet
1. Login utilisateur
2. Aller My Bookings
3. Voir booking "Quote Sent"
4. Vérifier countdown actif
5. Télécharger PDFs (detailed + general)
6. Cliquer "View Details"
7. Voir page complète avec countdown géant
8. Retour et cliquer "Pay Now"
9. Choisir méthode paiement
10. Remplir formulaire carte
11. Soumettre paiement
12. Vérifier status "Payment Confirmed"

#### Test 3: Révisions Multiples
1. Admin crée révision v1 et envoie
2. Client voit quote
3. Admin crée nouvelle révision (v2)
4. Modifier prix
5. Envoyer nouveau quote
6. Vérifier v1 marqué "superseded"
7. Aller Revision History
8. Voir v1 et v2
9. Vérifier relation superseded_by

#### Test 4: Expiration
1. Modifier manuellement quote_expiration_date dans DB (date passée)
2. Attendre cron job (ou lancer manuellement)
3. Vérifier status change à "Quote Expired"
4. Vérifier email expiration dans logs
5. Frontend affiche "Quote Expired" en rouge

---

## 📝 Notes de Développement

### Améliorations Futures Possibles:

#### Backend:
- [ ] Intégration vrai service SMTP (Nodemailer configuré)
- [ ] Webhooks pour paiements réels (Stripe, PayPal)
- [ ] Notifications push en temps réel
- [ ] Export Excel des email logs
- [ ] API analytics avancées

#### Frontend:
- [ ] Dark mode complet
- [ ] PWA pour notifications push
- [ ] Chat en direct admin-client
- [ ] Prévisualisation PDFs inline
- [ ] Multi-langue (i18n)

### Limitations Actuelles:
- Emails simulés (pas réellement envoyés)
- Paiements simulés (pas de vraie transaction)
- PDFs en USD (conversion monnaie à implémenter)
- Cron job manuel (pas automatique au démarrage)

---

## 🚀 Déploiement

### Checklist Pré-Production:

#### Backend:
1. ✅ Configurer variables d'environnement:
   ```env
   DATABASE_URL=postgresql://...
   JWT_SECRET=...
   FRONTEND_URL=https://...
   SMTP_HOST=...
   SMTP_PORT=...
   SMTP_USER=...
   SMTP_PASS=...
   ```

2. ✅ Migrations base de données:
   ```bash
   psql -U user -d dbname -f migrations/create_booking_quote_revisions.sql
   psql -U user -d dbname -f migrations/create_email_logs_table.sql
   ```

3. ✅ Installer dépendances:
   ```bash
   npm install
   ```

4. ✅ Démarrer serveur:
   ```bash
   npm start
   ```

5. ✅ Configurer cron job:
   ```bash
   # Ajouter à crontab
   0 * * * * curl http://localhost:5000/api/cron/check-expired-quotes
   ```

#### Frontend:
1. ✅ Build production:
   ```bash
   npm run build
   ```

2. ✅ Configurer variables:
   ```env
   VITE_API_URL=https://api.example.com
   ```

3. ✅ Déployer dist/
   - Netlify, Vercel, ou serveur statique

---

## 📞 Support & Contact

Pour toute question ou problème:
- 📧 Email: support@ebenezertours.com
- 📱 Phone: +91 XXX XXX XXXX
- 🌐 Website: https://ebenezertours.com

---

## 📜 Changelog

### Version 1.0.0 (2025-01-19)
- ✅ Système complet Quote Review
- ✅ Génération PDFs professionnels
- ✅ Multi-révisions avec historique
- ✅ Email simulation avec logs
- ✅ Paiements simulés (3 méthodes)
- ✅ Countdown timer temps réel
- ✅ Page Email Logs admin
- ✅ Tests et debugging
- ✅ Documentation complète

---

**Développé avec ❤️ pour Ebenezer Tours & Travels**
