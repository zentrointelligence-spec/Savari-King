# 📚 SYSTÈME DE REVIEW D'ADDONS - GUIDE COMPLET

**Date:** 4 Octobre 2025
**Version:** 1.0
**Auteur:** Claude Code
**Statut:** Backend complet ✅ | Frontend en cours 🚧

---

## 📋 TABLE DES MATIÈRES

1. [Vue d'ensemble](#vue-densemble)
2. [Architecture du système](#architecture-du-système)
3. [Ce qui a été implémenté](#ce-qui-a-été-implémenté)
4. [Structure de la base de données](#structure-de-la-base-de-données)
5. [Backend - Services et API](#backend---services-et-api)
6. [Instructions de test](#instructions-de-test)
7. [Prochaines étapes (Frontend)](#prochaines-étapes-frontend)
8. [Dépannage](#dépannage)

---

## 🎯 VUE D'ENSEMBLE

### Objectif
Permettre aux utilisateurs de laisser des avis (ratings + commentaires) sur les **addons** d'un tour **uniquement après avoir complété le voyage**.

### Principe clé
**Un utilisateur ne peut reviewer un addon que si :**
- ✅ Il a réservé un tour avec cet addon
- ✅ Le tour a le status `'Completed'` OU `'Payment Confirmed'` avec `travel_date` dans le passé
- ✅ Il n'a pas déjà reviewé cet addon pour cette réservation

### Flux utilisateur
```
Réservation → Paiement → Voyage → Admin marque "Completed"
    ↓
Email automatique "Laissez un avis"
    ↓
Utilisateur accède à "Mes Avis"
    ↓
Sélectionne un addon → Note (1-5 étoiles) + Commentaire
    ↓
Soumission → ✅ Trigger automatique met à jour le rating de l'addon
```

---

## 🏗️ ARCHITECTURE DU SYSTÈME

### Composants principaux

```
┌─────────────────────────────────────────────────────────────┐
│                     BASE DE DONNÉES                          │
├─────────────────────────────────────────────────────────────┤
│  • bookings (status: Completed)                              │
│  • addons (rating, popularity)                               │
│  • addon_reviews (user_id, addon_id, booking_id, rating)     │
│  • booking_completion_events (queue d'invitations)           │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    TRIGGERS AUTOMATIQUES                     │
├─────────────────────────────────────────────────────────────┤
│  1. trigger_update_addon_rating_on_review()                  │
│     → Met à jour rating quand un avis est créé               │
│                                                              │
│  2. trigger_update_addon_metrics_on_booking()                │
│     → Met à jour popularity quand booking confirmé           │
│                                                              │
│  3. trigger_notify_booking_completed()                       │
│     → Crée événement d'invitation quand status = Completed   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND SERVICES                          │
├─────────────────────────────────────────────────────────────┤
│  • addonReviewService.js → CRUD des avis                     │
│  • reviewInvitationService.js → Envoi emails                 │
│  • processReviewInvitations.js (Job) → Traite la queue       │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (À VENIR)                        │
├─────────────────────────────────────────────────────────────┤
│  • AddonReviewModal.jsx → Soumettre un avis                  │
│  • MyAddonReviewsPage.jsx → Gérer ses avis                   │
│  • AddonReviewsSection.jsx → Afficher les avis (existe déjà) │
└─────────────────────────────────────────────────────────────┘
```

---

## ✅ CE QUI A ÉTÉ IMPLÉMENTÉ

### PHASE 1 : Base de données ✅

#### 1.1 - Correction des statuses
**Fichier:** `backend/src/db/migrations/fix_booking_statuses.sql`

**Changements:**
- ✅ Statuses alignés avec le PDF "Booking Flow"
- ✅ Nouveau statuses: `'Inquiry Pending'`, `'Quote Sent'`, `'Payment Confirmed'`, `'Cancelled'`, `'Completed'`
- ✅ Champ `completed_at` ajouté pour tracker la date de complétion
- ✅ Trigger `trigger_booking_completed_at()` pour auto-remplir `completed_at`

**Résultat:**
```sql
SELECT status, COUNT(*) FROM bookings GROUP BY status;

-- Résultat:
-- Payment Confirmed: 32
-- Completed: 1
-- Quote Sent: 1
-- Inquiry Pending: 1
```

#### 1.2 - Données de test
**Fichier:** `backend/src/db/migrations/seed_test_data_for_addon_reviews.sql`

**Données créées:**
- ✅ 1 booking **Completed** (voyage il y a 15 jours) avec 3 addons
  - 2 addons déjà reviewés (5★ et 4★)
  - 1 addon en attente de review
- ✅ 2 bookings **Payment Confirmed** avec `travel_date` passée (éligibles pour reviews)
- ✅ 1 booking **Quote Sent** (pas encore payé)
- ✅ 1 booking **Inquiry Pending** (simple demande)

**Résultat:**
```sql
SELECT 'ELIGIBLE FOR REVIEWS' as info, COUNT(*) FROM bookings
WHERE status IN ('Payment Confirmed', 'Completed')
  AND travel_date < CURRENT_DATE;

-- Résultat: 3 bookings éligibles
```

#### 1.3 - Triggers de mise à jour automatique
**Fichier:** `backend/src/db/migrations/fix_addon_metrics_trigger.sql`

**Fonctions créées:**
- ✅ `calculate_addon_popularity(addon_id)` - Calcule le % de sélection
- ✅ `calculate_addon_rating(addon_id)` - Moyenne des avis
- ✅ `update_addon_metrics(addon_id)` - Met à jour les deux
- ✅ `trigger_update_addon_rating_on_review()` - S'exécute après INSERT/UPDATE sur `addon_reviews`
- ✅ `trigger_update_addon_metrics_on_booking()` - S'exécute après INSERT/UPDATE sur `bookings`

**Test:**
```sql
-- Vérifier les métriques actuelles
SELECT
    name,
    rating,
    popularity,
    (SELECT COUNT(*) FROM addon_reviews WHERE addon_id = addons.id) as review_count
FROM addons
WHERE name IN ('Romantic Candlelight Dinner', 'Expert Local Guide');

-- Résultat:
-- Romantic Candlelight Dinner | 5.00 | 92 | 1 review
-- Expert Local Guide | 4.00 | 100 | 1 review
```

---

### PHASE 2 : Backend Services ✅

#### 2.1 - Service d'invitation aux avis
**Fichier:** `backend/src/services/reviewInvitationService.js`

**Fonctionnalités:**
- ✅ `sendReviewInvitation(bookingId)` - Envoie email pour un booking
- ✅ `sendBatchReviewInvitations(daysBack)` - Traite plusieurs bookings
- ✅ Vérifie quels addons n'ont pas encore été reviewés
- ✅ Logs détaillés si le service d'email n'est pas configuré

**Utilisation:**
```javascript
const reviewInvitationService = require('./services/reviewInvitationService');

// Envoyer pour un booking spécifique
await reviewInvitationService.sendReviewInvitation(33);

// Traiter tous les bookings complétés dans les 7 derniers jours
await reviewInvitationService.sendBatchReviewInvitations(7);
```

#### 2.2 - Système d'événements
**Fichier:** `backend/src/db/migrations/add_review_invitation_trigger.sql`

**Composants:**
- ✅ Table `booking_completion_events` - Queue des invitations à traiter
- ✅ Trigger `trigger_notify_booking_completed()` - Crée un événement quand status = 'Completed'
- ✅ Fonction `get_pending_completion_events()` - Récupère les événements en attente
- ✅ Fonction `mark_completion_event_processed()` - Marque un événement comme traité

**Test:**
```sql
-- Voir les événements en attente
SELECT * FROM get_pending_completion_events();

-- Résultat:
-- event_id: 1
-- booking_id: 33
-- user_email: user1@test.com
-- tour_name: Munnar Tea Plantation Trek
```

#### 2.3 - Job de traitement
**Fichier:** `backend/src/jobs/processReviewInvitations.js`

**Fonctionnalités:**
- ✅ Récupère les événements en attente
- ✅ Envoie les invitations par email
- ✅ Marque les événements comme traités
- ✅ Gère les erreurs et les logs

**Exécution manuelle:**
```bash
cd backend
node src/jobs/processReviewInvitations.js
```

**Exécution via cron (à configurer):**
```bash
# Toutes les heures
0 * * * * cd /path/to/backend && node src/jobs/processReviewInvitations.js
```

---

## 🗄️ STRUCTURE DE LA BASE DE DONNÉES

### Tables principales

#### `bookings`
```sql
CREATE TABLE bookings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    tour_id INTEGER NOT NULL,
    package_tier_id INTEGER NOT NULL,
    travel_date DATE NOT NULL,
    selected_addons JSONB,  -- [{"id": 1, "name": "...", "quantity": 1}]
    status VARCHAR(50) DEFAULT 'Inquiry Pending',
    payment_timestamp TIMESTAMP,
    confirmed_at TIMESTAMP,
    completed_at TIMESTAMP,  -- ✅ NOUVEAU
    CONSTRAINT bookings_status_check
        CHECK (status IN ('Inquiry Pending', 'Quote Sent', 'Payment Confirmed', 'Cancelled', 'Completed'))
);
```

#### `addons`
```sql
CREATE TABLE addons (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price NUMERIC(10,2) NOT NULL,
    rating NUMERIC(3,2) DEFAULT 4.5,      -- ✅ Mis à jour automatiquement
    popularity INTEGER DEFAULT 50,         -- ✅ Mis à jour automatiquement
    is_active BOOLEAN DEFAULT true
);
```

#### `addon_reviews`
```sql
CREATE TABLE addon_reviews (
    id SERIAL PRIMARY KEY,
    addon_id INTEGER NOT NULL REFERENCES addons(id),
    booking_id INTEGER NOT NULL REFERENCES bookings(id),
    user_id INTEGER NOT NULL REFERENCES users(id),
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(booking_id, addon_id)  -- Un seul avis par addon par booking
);
```

#### `booking_completion_events`
```sql
CREATE TABLE booking_completion_events (
    id SERIAL PRIMARY KEY,
    booking_id INTEGER NOT NULL REFERENCES bookings(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed BOOLEAN DEFAULT FALSE,
    processed_at TIMESTAMP,
    email_sent BOOLEAN DEFAULT FALSE,
    error_message TEXT
);
```

---

## 🔌 BACKEND - SERVICES ET API

### API Endpoints (existants)

#### Récupérer les bookings éligibles pour reviews
```http
GET /api/addon-reviews/eligible
Authorization: Bearer <token>

Response:
[
  {
    "booking_id": 33,
    "tour_name": "Munnar Tea Plantation Trek",
    "travel_date": "2025-09-19",
    "addons": [
      {
        "addon_id": 1,
        "addon_name": "Romantic Candlelight Dinner",
        "already_reviewed": true
      },
      {
        "addon_id": 3,
        "addon_name": "Premium Spa Retreat",
        "already_reviewed": false  // ✅ Peut reviewer
      }
    ]
  }
]
```

#### Créer un avis
```http
POST /api/addon-reviews
Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "addon_id": 3,
  "booking_id": 33,
  "rating": 5,
  "comment": "Amazing spa experience! Highly recommend."
}

Response:
{
  "success": true,
  "message": "Addon review created successfully",
  "data": {
    "id": 3,
    "addon_id": 3,
    "booking_id": 33,
    "user_id": 1,
    "rating": 5,
    "comment": "Amazing spa experience!",
    "created_at": "2025-10-04T17:45:00.000Z"
  }
}
```

#### Récupérer les avis d'un addon
```http
GET /api/addon-reviews/addon/1?page=1&limit=10&sortBy=newest

Response:
{
  "success": true,
  "reviews": [
    {
      "id": 1,
      "rating": 5,
      "comment": "Absolutely magical experience!",
      "firstname": "John",
      "lastname": "Doe",
      "tour_name": "Munnar Tea Plantation Trek",
      "created_at": "2025-10-03T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1,
    "hasMore": false
  }
}
```

#### Récupérer les statistiques d'un addon
```http
GET /api/addon-reviews/addon/1/stats

Response:
{
  "success": true,
  "data": {
    "addon_id": 1,
    "name": "Romantic Candlelight Dinner",
    "current_rating": 5.00,
    "popularity": 92,
    "total_reviews": 1,
    "average_rating": 5.00,
    "rating_distribution": {
      "5": { "count": 1, "percentage": 100 },
      "4": { "count": 0, "percentage": 0 },
      "3": { "count": 0, "percentage": 0 },
      "2": { "count": 0, "percentage": 0 },
      "1": { "count": 0, "percentage": 0 }
    }
  }
}
```

#### Mettre à jour un avis
```http
PUT /api/addon-reviews/1
Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "rating": 4,
  "comment": "Updated comment"
}
```

#### Supprimer un avis
```http
DELETE /api/addon-reviews/1
Authorization: Bearer <token>
```

#### Récupérer mes avis
```http
GET /api/addon-reviews/my-reviews
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": [
    {
      "id": 1,
      "addon_name": "Romantic Candlelight Dinner",
      "rating": 5,
      "comment": "Amazing!",
      "tour_name": "Munnar Trek",
      "travel_date": "2025-09-19",
      "created_at": "2025-10-03T00:00:00.000Z"
    }
  ],
  "count": 1
}
```

---

## 🧪 INSTRUCTIONS DE TEST

### Test 1 : Vérifier les données de test

```bash
# Se connecter à la base de données
export PGPASSWORD=postgres
psql -U postgres -d ebookingsam

# Vérifier les bookings
SELECT id, status, travel_date,
       jsonb_array_length(selected_addons) as addon_count
FROM bookings
WHERE selected_addons IS NOT NULL
ORDER BY id DESC
LIMIT 5;

# Vérifier les avis existants
SELECT
    ar.id,
    a.name as addon_name,
    ar.rating,
    u.email as reviewer_email,
    ar.created_at
FROM addon_reviews ar
INNER JOIN addons a ON ar.addon_id = a.id
INNER JOIN users u ON ar.user_id = u.id;

# Vérifier les métriques des addons
SELECT
    name,
    rating as current_rating,
    popularity,
    (SELECT COUNT(*) FROM addon_reviews WHERE addon_id = addons.id) as review_count,
    (SELECT ROUND(AVG(rating)::NUMERIC, 2) FROM addon_reviews WHERE addon_id = addons.id) as calculated_rating
FROM addons
WHERE id IN (1, 2, 3)
ORDER BY name;
```

### Test 2 : Créer un avis via SQL

```sql
-- Vérifier les bookings éligibles pour l'utilisateur 1
SELECT
    b.id as booking_id,
    b.status,
    b.travel_date,
    a.id as addon_id,
    a.name as addon_name,
    EXISTS (
        SELECT 1 FROM addon_reviews ar
        WHERE ar.booking_id = b.id AND ar.addon_id = a.id
    ) as already_reviewed
FROM bookings b
CROSS JOIN LATERAL (
    SELECT (elem->>'id')::INTEGER as addon_id
    FROM jsonb_array_elements(b.selected_addons) AS elem
) booking_addons
INNER JOIN addons a ON a.id = booking_addons.addon_id
WHERE b.user_id = 1
  AND b.status IN ('Payment Confirmed', 'Completed')
  AND b.travel_date < CURRENT_DATE;

-- Créer un nouvel avis (remplacer les valeurs selon votre résultat)
INSERT INTO addon_reviews (addon_id, booking_id, user_id, rating, comment)
VALUES (3, 33, 1, 5, 'Test review - Amazing addon!')
RETURNING *;

-- Vérifier que le rating de l'addon a été mis à jour automatiquement
SELECT name, rating, popularity FROM addons WHERE id = 3;
```

### Test 3 : Tester le système d'invitation

```sql
-- Marquer un booking comme Completed pour déclencher l'invitation
UPDATE bookings
SET status = 'Completed',
    completed_at = CURRENT_TIMESTAMP
WHERE id = 34;

-- Vérifier qu'un événement a été créé
SELECT * FROM booking_completion_events WHERE booking_id = 34;

-- Récupérer les événements en attente
SELECT * FROM get_pending_completion_events();
```

### Test 4 : Tester les API endpoints

**Prérequis:** Avoir un token d'authentification

```bash
# 1. S'authentifier (obtenir un token)
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user1@test.com", "password": "your_password"}'

# Copier le token de la réponse

# 2. Récupérer les bookings éligibles
curl -X GET http://localhost:5000/api/addon-reviews/eligible \
  -H "Authorization: Bearer YOUR_TOKEN"

# 3. Créer un avis
curl -X POST http://localhost:5000/api/addon-reviews \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "addon_id": 3,
    "booking_id": 33,
    "rating": 5,
    "comment": "Excellent addon, highly recommend!"
  }'

# 4. Récupérer les avis d'un addon
curl -X GET "http://localhost:5000/api/addon-reviews/addon/1?page=1&limit=5"

# 5. Récupérer les statistiques
curl -X GET "http://localhost:5000/api/addon-reviews/addon/1/stats"

# 6. Récupérer mes avis
curl -X GET http://localhost:5000/api/addon-reviews/my-reviews \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test 5 : Vérifier les triggers automatiques

```sql
-- Test 1: Créer un avis et vérifier la mise à jour du rating
BEGIN;

-- Noter le rating actuel
SELECT name, rating FROM addons WHERE id = 1;

-- Créer un avis avec une note de 3
INSERT INTO addon_reviews (addon_id, booking_id, user_id, rating, comment)
VALUES (1, 34, 2, 3, 'Average experience')
RETURNING *;

-- Vérifier que le rating a été recalculé
SELECT name, rating,
       (SELECT ROUND(AVG(rating)::NUMERIC, 2) FROM addon_reviews WHERE addon_id = 1) as calculated_rating
FROM addons WHERE id = 1;

-- Si tout est bon, valider. Sinon, annuler.
-- COMMIT; ou ROLLBACK;
ROLLBACK;
```

```sql
-- Test 2: Créer un booking et vérifier la mise à jour de la popularité
BEGIN;

-- Noter la popularité actuelle de l'addon 1
SELECT name, popularity FROM addons WHERE id = 1;

-- Créer un booking confirmé avec cet addon
INSERT INTO bookings (
    user_id, tour_id, package_tier_id, travel_date, number_of_persons,
    selected_addons, status, total_price, selected_currency
) VALUES (
    1, 3, 7,
    CURRENT_DATE + INTERVAL '10 days',
    2,
    '[{"id": 1, "name": "Romantic Candlelight Dinner", "quantity": 1}]'::jsonb,
    'Payment Confirmed',
    50000,
    'INR'
);

-- Vérifier que la popularité a été recalculée
SELECT name, popularity FROM addons WHERE id = 1;

ROLLBACK;
```

---

## 🚧 PROCHAINES ÉTAPES (FRONTEND)

### Composants à créer

#### 1. AddonReviewModal.jsx
**Emplacement:** `frontend/src/components/modals/AddonReviewModal.jsx`

**Fonctionnalités:**
- Sélection interactive d'étoiles (1-5)
- Champ textarea pour le commentaire
- Validation en temps réel
- Affichage du nom de l'addon et du tour
- Messages de succès/erreur
- Animation d'ouverture/fermeture

**Utilisation:**
```jsx
<AddonReviewModal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  addon={{ id: 1, name: "Romantic Dinner" }}
  booking={{ id: 33, tourName: "Munnar Trek" }}
  onSubmitSuccess={handleReviewSubmitted}
/>
```

#### 2. MyAddonReviewsPage.jsx
**Emplacement:** `frontend/src/pages/MyAddonReviewsPage.jsx`

**Fonctionnalités:**
- **Section 1:** Addons en attente de review
  - Liste des bookings complétés
  - Bouton "Write Review" pour chaque addon non reviewé
  - Badge "New" pour les nouvelles opportunités

- **Section 2:** Mes avis soumis
  - Liste de tous les avis de l'utilisateur
  - Possibilité d'éditer/supprimer
  - Affichage du tour associé
  - Date de soumission

**Layout:**
```
┌──────────────────────────────────────────┐
│ My Addon Reviews                         │
├──────────────────────────────────────────┤
│ ✍️ Pending Reviews (3)                   │
│ ┌────────────────────────────────────┐   │
│ │ Munnar Trek | Sep 19, 2025         │   │
│ │ • Premium Spa [Write Review]  NEW  │   │
│ │ • Yoga Session [Write Review]      │   │
│ └────────────────────────────────────┘   │
│                                          │
│ ⭐ My Reviews (2)                        │
│ ┌────────────────────────────────────┐   │
│ │ Romantic Dinner | ⭐⭐⭐⭐⭐          │   │
│ │ "Amazing experience!"               │   │
│ │ [Edit] [Delete]                     │   │
│ └────────────────────────────────────┘   │
└──────────────────────────────────────────┘
```

#### 3. Intégration dans EnhancedAddonsSection
**Modifications:** `frontend/src/components/tours/EnhancedAddonsSection.jsx`

**Ajouts:**
- Importer `AddonReviewsSection` (déjà existant)
- Afficher les avis sous chaque carte d'addon
- Bouton "See Reviews" qui toggle l'affichage

**Exemple:**
```jsx
{formattedAddons.map((addon) => (
  <div key={addon.id}>
    <EnhancedAddonCard addon={addon} ... />

    {/* Nouvelle section */}
    <AddonReviewsSection
      addonId={addon.id}
      addonName={addon.name}
    />
  </div>
))}
```

#### 4. Navigation dans le Layout
**Modifications:** `frontend/src/components/common/Layout.jsx`

**Ajout dans le menu utilisateur:**
```jsx
// Dans le dropdown menu utilisateur
<MenuItem onClick={() => navigate('/my-addon-reviews')}>
  <FontAwesomeIcon icon={faStar} className="mr-2" />
  My Reviews
  {pendingReviewsCount > 0 && (
    <Badge variant="danger">{pendingReviewsCount}</Badge>
  )}
</MenuItem>
```

---

## 🔧 DÉPANNAGE

### Problème : Les métriques ne se mettent pas à jour

**Solution 1 : Vérifier les triggers**
```sql
-- Lister tous les triggers sur les tables
SELECT
    trigger_name,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE event_object_schema = 'public'
  AND event_object_table IN ('addon_reviews', 'bookings');

-- Si manquant, ré-exécuter les migrations
\i backend/src/db/migrations/fix_addon_metrics_trigger.sql
```

**Solution 2 : Forcer la mise à jour manuelle**
```sql
-- Mettre à jour tous les addons
SELECT update_all_addon_metrics();

-- Ou un addon spécifique
SELECT update_addon_metrics(1);
```

### Problème : Impossible de créer un avis

**Vérification 1 : Eligibilité**
```sql
-- Vérifier si l'utilisateur peut reviewer
SELECT * FROM bookings
WHERE id = <booking_id>
  AND user_id = <user_id>
  AND status IN ('Payment Confirmed', 'Completed')
  AND travel_date < CURRENT_DATE;
```

**Vérification 2 : Doublons**
```sql
-- Vérifier si l'avis existe déjà
SELECT * FROM addon_reviews
WHERE booking_id = <booking_id>
  AND addon_id = <addon_id>;
```

### Problème : Les événements d'invitation ne sont pas traités

**Solution 1 : Vérifier la queue**
```sql
SELECT * FROM booking_completion_events WHERE processed = FALSE;
```

**Solution 2 : Traiter manuellement**
```bash
cd backend
node src/jobs/processReviewInvitations.js
```

**Solution 3 : Configurer un cron job**
```bash
crontab -e

# Ajouter:
0 * * * * cd /path/to/backend && node src/jobs/processReviewInvitations.js >> /var/log/review-invitations.log 2>&1
```

---

## 📊 MÉTRIQUES ET MONITORING

### Requêtes utiles pour le monitoring

```sql
-- Nombre total d'avis par addon
SELECT
    a.name,
    COUNT(ar.id) as total_reviews,
    ROUND(AVG(ar.rating)::NUMERIC, 2) as avg_rating,
    a.rating as stored_rating,
    CASE
        WHEN a.rating = ROUND(AVG(ar.rating)::NUMERIC, 2) THEN '✅ Synced'
        ELSE '⚠️ Out of sync'
    END as sync_status
FROM addons a
LEFT JOIN addon_reviews ar ON a.id = ar.addon_id
WHERE a.is_active = true
GROUP BY a.id, a.name, a.rating
ORDER BY total_reviews DESC;

-- Bookings en attente de reviews
SELECT
    b.id,
    u.email,
    t.name as tour_name,
    b.travel_date,
    b.status,
    jsonb_array_length(b.selected_addons) as addon_count,
    (
        SELECT COUNT(*)
        FROM addon_reviews ar
        WHERE ar.booking_id = b.id
    ) as reviews_submitted
FROM bookings b
INNER JOIN users u ON b.user_id = u.id
INNER JOIN tours t ON b.tour_id = t.id
WHERE b.status IN ('Payment Confirmed', 'Completed')
  AND b.travel_date < CURRENT_DATE
  AND b.selected_addons IS NOT NULL;

-- Événements d'invitation (statistiques)
SELECT
    processed,
    email_sent,
    COUNT(*) as count,
    MIN(created_at) as oldest,
    MAX(created_at) as newest
FROM booking_completion_events
GROUP BY processed, email_sent;
```

---

## 📝 NOTES IMPORTANTES

### Sécurité
- ✅ Validation côté serveur : Un utilisateur ne peut reviewer que ses propres bookings
- ✅ Contrainte unique : `(booking_id, addon_id)` empêche les doublons
- ✅ Check constraint : `rating BETWEEN 1 AND 5`

### Performance
- ✅ Index sur `addon_reviews(addon_id)` pour les requêtes de statistiques
- ✅ Index sur `booking_completion_events(processed)` pour la queue
- ✅ Les triggers s'exécutent uniquement quand nécessaire

### Évolutivité
- ✅ Système de queue pour les invitations (évite la surcharge)
- ✅ Pagination sur les endpoints API
- ✅ Possibilité d'ajouter un système de modération des avis

---

## 🎓 RESSOURCES

### Fichiers de migration
1. `backend/src/db/migrations/fix_booking_statuses.sql` - Correction des statuses
2. `backend/src/db/migrations/seed_test_data_for_addon_reviews.sql` - Données de test
3. `backend/src/db/migrations/fix_addon_metrics_trigger.sql` - Triggers de métriques
4. `backend/src/db/migrations/add_review_invitation_trigger.sql` - Système d'invitation

### Services backend
1. `backend/src/services/addonReviewService.js` - CRUD des avis
2. `backend/src/services/reviewInvitationService.js` - Envoi d'invitations
3. `backend/src/jobs/processReviewInvitations.js` - Job de traitement

### Controllers
1. `backend/src/controllers/addonReviewController.js` - Endpoints API

### Routes
1. `backend/src/routes/addonReviewRoutes.js` - Configuration des routes

---

## ✅ CHECKLIST DE VALIDATION

Avant de passer au frontend, vérifier :

- [ ] Les statuses de bookings sont corrects
- [ ] Les données de test existent (35 bookings, 2 avis)
- [ ] Les triggers se déclenchent automatiquement
- [ ] Les métriques (rating, popularity) se mettent à jour
- [ ] Les événements d'invitation sont créés quand status = 'Completed'
- [ ] Les API endpoints fonctionnent (tester avec Postman ou curl)
- [ ] La fonction `get_pending_completion_events()` retourne des résultats

---

**FIN DU GUIDE - Prêt pour la Phase Frontend !** 🚀
