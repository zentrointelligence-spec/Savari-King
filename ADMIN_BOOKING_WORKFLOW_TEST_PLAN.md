# PLAN DE TESTS - ADMIN BOOKING WORKFLOW
## Ebenezer Tours - Système de Réservation

**Date de création:** 2025-01-08
**Version:** 1.0
**Objectif:** Plan de tests complet pour valider le workflow admin du système de réservation

---

## TABLE DES MATIÈRES

1. [Vue d'ensemble](#vue-densemble)
2. [Tests du Cycle de Vie des Réservations](#tests-du-cycle-de-vie-des-réservations)
3. [Tests des APIs Admin](#tests-des-apis-admin)
4. [Tests du Système d'Emails](#tests-du-système-demails)
5. [Tests des Validations et Règles Métier](#tests-des-validations-et-règles-métier)
6. [Tests de Sécurité et Permissions](#tests-de-sécurité-et-permissions)
7. [Tests de Performance](#tests-de-performance)
8. [Tests d'Intégration](#tests-dintégration)
9. [Matrice de Traçabilité](#matrice-de-traçabilité)

---

## VUE D'ENSEMBLE

### Portée des Tests

Ce plan de tests couvre :
- ✅ Workflow complet de réservation (5 statuts)
- ✅ APIs admin (send-quote, complete, getAllBookings, getBookingStats)
- ✅ Système d'emails automatiques (7 templates)
- ✅ Validations métier (dates, prix, fenêtres temporelles)
- ✅ Sécurité et permissions (authentification admin)
- ✅ Performance et scalabilité

### Environnements de Test

- **Development:** Base de données locale PostgreSQL
- **Staging:** Environnement pré-production
- **Production:** Tests de fumée uniquement

### Outils de Test Recommandés

- **API Testing:** Postman, Jest + Supertest
- **Base de données:** Scripts SQL de test
- **Emails:** Mailtrap.io (environnement de test)
- **Performance:** Artillery, k6

---

## TESTS DU CYCLE DE VIE DES RÉSERVATIONS

### TC-LIFECYCLE-001: Création d'une Réservation (Inquiry Pending)

**Priorité:** HAUTE
**Type:** Fonctionnel

#### Préconditions
- Utilisateur authentifié
- Tour et tier valides existent dans la base de données
- Date de voyage >= aujourd'hui + 5 jours

#### Étapes de Test
1. **Action:** POST `/api/bookings` avec données valides
   ```json
   {
     "tour_id": 1,
     "tier_id": 1,
     "travel_date": "2025-01-15",
     "num_adults": 2,
     "num_children": 1,
     "selected_addons": [
       {"id": 1, "name": "Candlelight Dinner", "price": 2500}
     ],
     "selected_vehicles": [],
     "estimated_price": 45000,
     "contact_name": "John Doe",
     "contact_email": "john@example.com",
     "contact_phone": "+91 9876543210",
     "special_requests": "Vegetarian meals please"
   }
   ```

2. **Vérifications Backend:**
   - [ ] HTTP Status: 201 Created
   - [ ] Réponse contient `booking_reference` (format: EB-YYYY-XXXXXX)
   - [ ] Réponse contient `status: "Inquiry Pending"`
   - [ ] Entrée créée dans la table `bookings`
   - [ ] `booking_reference` est unique
   - [ ] `inquiry_date` est défini à NOW()
   - [ ] `selected_addons` et `selected_vehicles` sont stockés en JSONB

3. **Vérifications Emails:**
   - [ ] Email envoyé à l'utilisateur (template: `inquiry_received`)
   - [ ] Email envoyé à l'admin (template: `new_inquiry_admin`)
   - [ ] Contenu de l'email contient le `booking_reference`

#### Résultat Attendu
- Réservation créée avec statut `Inquiry Pending`
- 2 emails envoyés (client + admin)
- Données correctement stockées

---

### TC-LIFECYCLE-002: Envoi de Devis (Quote Sent)

**Priorité:** HAUTE
**Type:** Fonctionnel

#### Préconditions
- Réservation existe avec statut `Inquiry Pending`
- Utilisateur admin authentifié
- Booking ID = 1

#### Étapes de Test
1. **Action:** PUT `/api/bookings/1/send-quote`
   ```json
   {
     "final_price": 47500,
     "admin_notes": "Prix ajusté pour la haute saison"
   }
   ```

2. **Vérifications Backend:**
   - [ ] HTTP Status: 200 OK
   - [ ] Statut mis à jour: `Quote Sent`
   - [ ] `final_price` = 47500
   - [ ] `quote_sent_date` = NOW()
   - [ ] `quote_expiration_date` = NOW() + 48 heures
   - [ ] `admin_notes` sauvegardé

3. **Vérifications Emails:**
   - [ ] Email envoyé au client (template: `quote_ready`)
   - [ ] Email contient le prix final: 47,500
   - [ ] Email contient la date d'expiration du devis
   - [ ] Lien de paiement inclus dans l'email

4. **Vérifications Frontend (My Bookings):**
   - [ ] Badge affiché: "Devis reçu"
   - [ ] Bouton "Voir le devis & Payer" visible
   - [ ] Compte à rebours de 48h affiché

#### Résultat Attendu
- Statut = `Quote Sent`
- Email de devis envoyé
- Expiration définie à 48h

---

### TC-LIFECYCLE-003: Confirmation de Paiement (Payment Confirmed)

**Priorité:** HAUTE
**Type:** Fonctionnel + Intégration

#### Préconditions
- Réservation existe avec statut `Quote Sent`
- Devis non expiré
- Webhook de paiement configuré

#### Étapes de Test
1. **Action:** Simuler un webhook de paiement réussi
   ```json
   {
     "booking_id": 1,
     "transaction_id": "TXN_123456789",
     "payment_method": "Stripe",
     "amount": 47500,
     "status": "success"
   }
   ```

2. **Vérifications Backend:**
   - [ ] Statut mis à jour: `Payment Confirmed`
   - [ ] `payment_transaction_id` = "TXN_123456789"
   - [ ] `payment_timestamp` = NOW()
   - [ ] `payment_method` = "Stripe"
   - [ ] Calcul de `cancellation_deadline` = payment_timestamp + 24h

3. **Vérifications Emails:**
   - [ ] Email envoyé au client (template: `payment_confirmed`)
   - [ ] Email envoyé à l'admin (template: `payment_alert_admin`)
   - [ ] Email client contient les détails du voyage
   - [ ] Politique d'annulation 24h mentionnée

4. **Vérifications Frontend:**
   - [ ] Statut affiché: "Réservation confirmée"
   - [ ] Bouton "Télécharger PDF" visible
   - [ ] Compte à rebours d'annulation (24h) visible
   - [ ] Bouton "Annuler" actif si < 24h

#### Résultat Attendu
- Paiement enregistré
- Fenêtre d'annulation de 24h activée
- 2 emails envoyés

---

### TC-LIFECYCLE-004: Annulation Avant Paiement

**Priorité:** MOYENNE
**Type:** Fonctionnel

#### Préconditions
- Réservation avec statut `Inquiry Pending` OU `Quote Sent`
- Utilisateur propriétaire de la réservation

#### Étapes de Test
1. **Action:** POST `/api/bookings/1/cancel`

2. **Vérifications Backend:**
   - [ ] HTTP Status: 200 OK
   - [ ] Statut mis à jour: `Cancelled`
   - [ ] `cancellation_date` = NOW()
   - [ ] `refund_status` = "not_applicable"

3. **Vérifications Emails:**
   - [ ] Email envoyé au client (template: `cancellation_confirmed`)
   - [ ] Email mentionne "Aucun remboursement nécessaire"

#### Résultat Attendu
- Annulation réussie sans remboursement
- Email de confirmation envoyé

---

### TC-LIFECYCLE-005: Annulation Dans les 24h Après Paiement

**Priorité:** HAUTE
**Type:** Fonctionnel - Règle Métier

#### Préconditions
- Réservation avec statut `Payment Confirmed`
- `payment_timestamp` < 24 heures

#### Étapes de Test
1. **Setup:** Créer une réservation payée il y a 12 heures
   ```sql
   UPDATE bookings
   SET payment_timestamp = NOW() - INTERVAL '12 hours'
   WHERE id = 1;
   ```

2. **Action:** POST `/api/bookings/1/cancel`

3. **Vérifications Backend:**
   - [ ] HTTP Status: 200 OK
   - [ ] Statut mis à jour: `Cancelled`
   - [ ] `cancellation_date` = NOW()
   - [ ] `refund_status` = "pending"

4. **Vérifications Emails:**
   - [ ] Email envoyé au client
   - [ ] Email mentionne "Remboursement en cours"
   - [ ] Montant du remboursement affiché

5. **Vérifications Admin Dashboard:**
   - [ ] Réservation apparaît dans la liste "Remboursements à traiter"

#### Résultat Attendu
- Annulation acceptée
- Remboursement initié
- Admin notifié

---

### TC-LIFECYCLE-006: Annulation Après 24h - Refus

**Priorité:** HAUTE
**Type:** Fonctionnel - Règle Métier

#### Préconditions
- Réservation avec statut `Payment Confirmed`
- `payment_timestamp` > 24 heures

#### Étapes de Test
1. **Setup:** Créer une réservation payée il y a 36 heures
   ```sql
   UPDATE bookings
   SET payment_timestamp = NOW() - INTERVAL '36 hours'
   WHERE id = 1;
   ```

2. **Action:** POST `/api/bookings/1/cancel`

3. **Vérifications Backend:**
   - [ ] HTTP Status: 400 Bad Request
   - [ ] Message d'erreur: "The 24-hour free cancellation window has expired"
   - [ ] Réponse contient `cancellation_deadline`
   - [ ] Statut RESTE `Payment Confirmed` (pas de changement)

4. **Vérifications Frontend:**
   - [ ] Bouton "Annuler" désactivé ou masqué
   - [ ] Message affiché: "Contactez-nous pour assistance"

#### Résultat Attendu
- Annulation refusée
- Statut inchangé
- Message d'erreur clair

---

### TC-LIFECYCLE-007: Finalisation du Voyage (Trip Completed)

**Priorité:** MOYENNE
**Type:** Fonctionnel - Action Admin

#### Préconditions
- Réservation avec statut `Payment Confirmed`
- Voyage effectué (travel_date passée)
- Utilisateur admin authentifié

#### Étapes de Test
1. **Action:** PUT `/api/bookings/1/complete`
   ```json
   {
     "admin_notes": "Voyage terminé sans incident"
   }
   ```

2. **Vérifications Backend:**
   - [ ] HTTP Status: 200 OK
   - [ ] Statut mis à jour: `Trip Completed`
   - [ ] `completion_date` = NOW()
   - [ ] `admin_notes` sauvegardé

3. **Vérifications Emails:**
   - [ ] Email envoyé au client (template: `trip_review_request`)
   - [ ] Email contient lien vers formulaire d'avis
   - [ ] Email remercie le client

4. **Vérifications Frontend:**
   - [ ] Statut affiché: "Voyage terminé"
   - [ ] Bouton "Laisser un avis" visible
   - [ ] Badge "Laisser un avis" affiché

#### Résultat Attendu
- Voyage marqué comme terminé
- Email de demande d'avis envoyé
- Bouton d'avis activé

---

### TC-LIFECYCLE-008: Tentative de Complétion Sans Paiement - Refus

**Priorité:** MOYENNE
**Type:** Validation Métier

#### Préconditions
- Réservation avec statut `Inquiry Pending` OU `Quote Sent`
- Utilisateur admin authentifié

#### Étapes de Test
1. **Action:** PUT `/api/bookings/1/complete`

2. **Vérifications Backend:**
   - [ ] HTTP Status: 400 Bad Request
   - [ ] Message: "Only confirmed bookings can be marked as completed"
   - [ ] Statut RESTE inchangé

#### Résultat Attendu
- Opération refusée
- Statut inchangé

---

## TESTS DES APIs ADMIN

### TC-API-001: Récupérer Toutes les Réservations (GET /admin/all)

**Priorité:** HAUTE
**Type:** Fonctionnel

#### Préconditions
- Au moins 25 réservations dans la base
- Utilisateur admin authentifié

#### Étapes de Test
1. **Action:** GET `/api/bookings/admin/all?page=1&limit=20`

2. **Vérifications:**
   - [ ] HTTP Status: 200 OK
   - [ ] Réponse contient tableau `data` avec max 20 items
   - [ ] Chaque item contient:
     - `booking_reference`
     - `user_name`, `user_email`
     - `tour_name`, `tier_name`
     - `status`
     - `can_cancel_with_refund`
     - `quote_is_valid`
   - [ ] Objet `pagination` présent:
     ```json
     {
       "page": 1,
       "limit": 20,
       "total": 25,
       "pages": 2
     }
     ```
   - [ ] Réservations triées par `created_at DESC`

#### Résultat Attendu
- Liste paginée retournée
- Données enrichies avec infos user/tour/tier

---

### TC-API-002: Filtrer par Statut

**Priorité:** HAUTE
**Type:** Fonctionnel

#### Préconditions
- Réservations avec différents statuts existent
- Admin authentifié

#### Étapes de Test
1. **Action:** GET `/api/bookings/admin/all?status=Inquiry%20Pending`

2. **Vérifications:**
   - [ ] Toutes les réservations retournées ont `status: "Inquiry Pending"`
   - [ ] Aucune réservation avec un autre statut n'est retournée

3. **Répéter pour chaque statut:**
   - [ ] `Quote Sent`
   - [ ] `Payment Confirmed`
   - [ ] `Cancelled`
   - [ ] `Trip Completed`

#### Résultat Attendu
- Filtre fonctionne correctement pour tous les statuts

---

### TC-API-003: Filtrer par Tour

**Priorité:** MOYENNE
**Type:** Fonctionnel

#### Préconditions
- Réservations pour différents tours existent

#### Étapes de Test
1. **Action:** GET `/api/bookings/admin/all?tour_id=1`

2. **Vérifications:**
   - [ ] Toutes les réservations retournées ont `tour_id: 1`

#### Résultat Attendu
- Filtre par tour fonctionne

---

### TC-API-004: Filtrer par Plage de Dates

**Priorité:** MOYENNE
**Type:** Fonctionnel

#### Étapes de Test
1. **Action:** GET `/api/bookings/admin/all?start_date=2025-01-01&end_date=2025-01-31`

2. **Vérifications:**
   - [ ] Toutes les réservations ont `travel_date` entre 2025-01-01 et 2025-01-31

#### Résultat Attendu
- Filtre par date fonctionne

---

### TC-API-005: Statistiques de Réservations (GET /admin/stats)

**Priorité:** HAUTE
**Type:** Fonctionnel

#### Préconditions
- Base de données avec réservations variées

#### Étapes de Test
1. **Action:** GET `/api/bookings/admin/stats`

2. **Vérifications:**
   - [ ] HTTP Status: 200 OK
   - [ ] Réponse contient:
     ```json
     {
       "success": true,
       "data": {
         "pending_count": 5,
         "quote_sent_count": 3,
         "confirmed_count": 10,
         "cancelled_count": 2,
         "completed_count": 15,
         "total_count": 35,
         "total_revenue": 450000,
         "avg_booking_value": 45000
       }
     }
     ```
   - [ ] `pending_count` + `quote_sent_count` + ... = `total_count`
   - [ ] `total_revenue` calculé uniquement sur `Payment Confirmed`
   - [ ] `avg_booking_value` = total_revenue / confirmed_count

3. **Vérification SQL:**
   ```sql
   SELECT COUNT(*) FROM bookings WHERE status = 'Payment Confirmed';
   -- Devrait correspondre à confirmed_count
   ```

#### Résultat Attendu
- Statistiques précises
- Calculs corrects

---

### TC-API-006: Envoi de Devis avec Prix Invalide - Validation

**Priorité:** HAUTE
**Type:** Validation

#### Étapes de Test
1. **Action:** PUT `/api/bookings/1/send-quote`
   ```json
   {
     "admin_notes": "Test sans prix"
   }
   ```

2. **Vérifications:**
   - [ ] HTTP Status: 400 Bad Request
   - [ ] Message: "Final price is required"
   - [ ] Statut inchangé

#### Résultat Attendu
- Validation du prix fonctionne

---

### TC-API-007: Envoi de Devis sur Réservation Non-Pending - Refus

**Priorité:** HAUTE
**Type:** Règle Métier

#### Préconditions
- Réservation avec statut `Payment Confirmed`

#### Étapes de Test
1. **Action:** PUT `/api/bookings/1/send-quote`
   ```json
   {
     "final_price": 50000
   }
   ```

2. **Vérifications:**
   - [ ] HTTP Status: 400 Bad Request
   - [ ] Message: "Quote can only be sent for pending inquiries"

#### Résultat Attendu
- Opération refusée

---

## TESTS DU SYSTÈME D'EMAILS

### TC-EMAIL-001: Template - Inquiry Received (Client)

**Priorité:** HAUTE
**Type:** Fonctionnel + UI

#### Étapes de Test
1. **Déclencher:** Créer une nouvelle réservation
2. **Vérifications Email:**
   - [ ] Email reçu à `contact_email`
   - [ ] Subject: "Booking Inquiry Received - EB-YYYY-XXXXXX"
   - [ ] Variables remplacées:
     - `{{contact_name}}` → "John Doe"
     - `{{booking_reference}}` → "EB-2025-001234"
     - `{{tour_name}}` → "Kerala Paradise"
     - `{{travel_date}}` → "Monday, January 15, 2025"
   - [ ] Contenu mentionne "Réponse sous 30 minutes"
   - [ ] Lien vers "My Bookings" inclus
   - [ ] Footer avec coordonnées support présent

3. **Vérifications Visuelles:**
   - [ ] Logo Ebenezer Tours affiché
   - [ ] Style responsive (mobile-friendly)
   - [ ] Boutons CTA bien stylés

#### Résultat Attendu
- Email professionnel et clair
- Toutes les variables remplacées

---

### TC-EMAIL-002: Template - New Inquiry (Admin)

**Priorité:** HAUTE
**Type:** Fonctionnel

#### Étapes de Test
1. **Déclencher:** Créer une nouvelle réservation
2. **Vérifications Email:**
   - [ ] Email reçu à `ADMIN_EMAIL`
   - [ ] Subject: "🔔 New Booking Inquiry - EB-2025-001234"
   - [ ] Contient tous les détails:
     - Coordonnées client
     - Détails du voyage
     - Add-ons sélectionnés
     - Véhicules additionnels
     - Demandes spéciales
   - [ ] Lien direct vers admin dashboard
   - [ ] Timestamp de la demande

#### Résultat Attendu
- Admin reçoit toutes les infos nécessaires

---

### TC-EMAIL-003: Template - Quote Ready (Client)

**Priorité:** HAUTE
**Type:** Fonctionnel

#### Étapes de Test
1. **Déclencher:** Admin envoie un devis
2. **Vérifications Email:**
   - [ ] Subject: "Your Custom Quote is Ready - EB-2025-001234"
   - [ ] Prix final affiché clairement
   - [ ] Date d'expiration (48h) visible
   - [ ] Breakdown des coûts:
     - Prix de base
     - Add-ons
     - Véhicules
   - [ ] Bouton "Procéder au paiement" avec lien valide
   - [ ] Notes admin affichées si présentes

#### Résultat Attendu
- Devis clair et complet

---

### TC-EMAIL-004: Template - Payment Confirmed (Client)

**Priorité:** HAUTE
**Type:** Fonctionnel

#### Étapes de Test
1. **Déclencher:** Webhook de paiement réussi
2. **Vérifications Email:**
   - [ ] Subject: "Payment Confirmed - EB-2025-001234"
   - [ ] Confirmation de paiement claire
   - [ ] Détails du voyage récapitulés
   - [ ] Politique d'annulation 24h mentionnée
   - [ ] Compte à rebours visible (heures restantes)
   - [ ] Bouton "Télécharger PDF" présent
   - [ ] Message de préparation pour le voyage

#### Résultat Attendu
- Client rassuré, infos complètes

---

### TC-EMAIL-005: Template - Payment Alert (Admin)

**Priorité:** MOYENNE
**Type:** Fonctionnel

#### Étapes de Test
1. **Déclencher:** Webhook de paiement réussi
2. **Vérifications Email:**
   - [ ] Subject: "💰 Payment Received - EB-2025-001234"
   - [ ] Montant reçu affiché
   - [ ] Transaction ID inclus
   - [ ] Temps entre devis et paiement calculé
   - [ ] Jours avant le voyage affiché
   - [ ] Lien vers la réservation dans admin panel

#### Résultat Attendu
- Admin informé rapidement

---

### TC-EMAIL-006: Template - Cancellation Confirmed (Client)

**Priorité:** HAUTE
**Type:** Fonctionnel

#### Étapes de Test
1. **Déclencher:** Client annule sa réservation
2. **Vérifications Email:**
   - [ ] Subject: "Booking Cancellation Confirmed - EB-2025-001234"
   - [ ] Confirmation d'annulation claire
   - [ ] Si remboursement: montant et délai mentionnés
   - [ ] Si pas de remboursement: mention claire
   - [ ] Invitation à re-réserver

#### Résultat Attendu
- Client informé du statut de remboursement

---

### TC-EMAIL-007: Template - Trip Review Request (Client)

**Priorité:** MOYENNE
**Type:** Fonctionnel

#### Étapes de Test
1. **Déclencher:** Admin marque le voyage comme terminé
2. **Vérifications Email:**
   - [ ] Subject: "How Was Your Trip? Share Your Experience 🌟"
   - [ ] Message de remerciement chaleureux
   - [ ] Lien vers formulaire d'avis
   - [ ] Mention de récompense/incentive (si applicable)
   - [ ] Invitation à partager sur réseaux sociaux

#### Résultat Attendu
- Email engageant pour collecter des avis

---

### TC-EMAIL-008: Email Non Envoyé - Gestion d'Erreur

**Priorité:** HAUTE
**Type:** Gestion d'Erreur

#### Préconditions
- Configuration email incorrecte (SMTP invalide)

#### Étapes de Test
1. **Action:** Créer une réservation avec SMTP désactivé
2. **Vérifications:**
   - [ ] Réservation créée quand même (success: true)
   - [ ] Erreur loggée dans console: "Error sending emails"
   - [ ] HTTP Status reste 201 (opération principale réussie)
   - [ ] Message: "Booking inquiry submitted successfully" retourné

#### Résultat Attendu
- L'échec d'envoi d'email ne fait pas échouer la création de réservation

---

## TESTS DES VALIDATIONS ET RÈGLES MÉTIER

### TC-VALIDATION-001: Date de Voyage < 5 Jours - Refus

**Priorité:** HAUTE
**Type:** Validation Backend

#### Étapes de Test
1. **Action:** POST `/api/bookings` avec `travel_date` = demain
   ```json
   {
     "travel_date": "2025-01-09",
     ...
   }
   ```

2. **Vérifications:**
   - [ ] HTTP Status: 400 Bad Request
   - [ ] Message: "Travel date must be at least 5 days in the future"
   - [ ] Réponse contient `earliestDate` (aujourd'hui + 5 jours)

#### Résultat Attendu
- Validation de la date fonctionne

---

### TC-VALIDATION-002: Format de Date Invalide

**Priorité:** HAUTE
**Type:** Validation

#### Étapes de Test
1. **Action:** POST `/api/bookings` avec `travel_date` = "invalid-date"

2. **Vérifications:**
   - [ ] HTTP Status: 400 Bad Request
   - [ ] Message: "Invalid travel date format. Please use YYYY-MM-DD"

#### Résultat Attendu
- Format validé

---

### TC-VALIDATION-003: Nombre d'Adultes Hors Limites

**Priorité:** HAUTE
**Type:** Validation

#### Étapes de Test
1. **Test 1:** `num_adults: 0`
   - [ ] 400 Bad Request
   - [ ] Message: "Number of adults must be between 1 and 20"

2. **Test 2:** `num_adults: 25`
   - [ ] 400 Bad Request
   - [ ] Même message

3. **Test 3:** `num_adults: 10` (valide)
   - [ ] 201 Created

#### Résultat Attendu
- Limites respectées (1-20)

---

### TC-VALIDATION-004: Nombre d'Enfants Hors Limites

**Priorité:** MOYENNE
**Type:** Validation

#### Étapes de Test
1. **Test 1:** `num_children: -1`
   - [ ] 400 Bad Request

2. **Test 2:** `num_children: 15`
   - [ ] 400 Bad Request
   - [ ] Message: "Number of children must be between 0 and 10"

#### Résultat Attendu
- Limites respectées (0-10)

---

### TC-VALIDATION-005: Tour Inexistant

**Priorité:** HAUTE
**Type:** Validation

#### Étapes de Test
1. **Action:** POST `/api/bookings` avec `tour_id: 99999` (inexistant)

2. **Vérifications:**
   - [ ] HTTP Status: 404 Not Found
   - [ ] Message: "Tour not found"

#### Résultat Attendu
- Vérification de l'existence du tour

---

### TC-VALIDATION-006: Tier Inexistant pour le Tour

**Priorité:** HAUTE
**Type:** Validation

#### Étapes de Test
1. **Action:** POST `/api/bookings` avec `tour_id: 1` et `tier_id: 99` (n'appartient pas à ce tour)

2. **Vérifications:**
   - [ ] HTTP Status: 404 Not Found
   - [ ] Message: "Package tier not found for this tour"

#### Résultat Attendu
- Vérification de la cohérence tour-tier

---

### TC-VALIDATION-007: Champs Requis Manquants

**Priorité:** HAUTE
**Type:** Validation

#### Étapes de Test
1. **Action:** POST `/api/bookings` sans `tour_id`

2. **Vérifications:**
   - [ ] HTTP Status: 400 Bad Request
   - [ ] Message: "Missing required fields: tour_id, tier_id, travel_date, num_adults"

#### Résultat Attendu
- Validation des champs requis

---

### TC-VALIDATION-008: Calcul de la Fenêtre d'Annulation (24h)

**Priorité:** HAUTE
**Type:** Règle Métier

#### Étapes de Test
1. **Setup:** Réservation payée il y a exactement 23h59m
   ```sql
   UPDATE bookings
   SET payment_timestamp = NOW() - INTERVAL '23 hours 59 minutes'
   WHERE id = 1;
   ```

2. **Action:** POST `/api/bookings/1/cancel`

3. **Vérifications:**
   - [ ] HTTP Status: 200 OK (annulation acceptée)

4. **Setup 2:** Réservation payée il y a 24h01m
   ```sql
   UPDATE bookings
   SET payment_timestamp = NOW() - INTERVAL '24 hours 1 minute'
   WHERE id = 1;
   ```

5. **Action:** POST `/api/bookings/1/cancel`

6. **Vérifications:**
   - [ ] HTTP Status: 400 Bad Request (annulation refusée)

#### Résultat Attendu
- Fenêtre de 24h strictement respectée

---

### TC-VALIDATION-009: Expiration du Devis (48h)

**Priorité:** HAUTE
**Type:** Règle Métier + Cron Job

#### Préconditions
- Cron job d'expiration configuré

#### Étapes de Test
1. **Setup:** Créer un devis expiré
   ```sql
   UPDATE bookings
   SET status = 'Quote Sent',
       quote_expiration_date = NOW() - INTERVAL '1 hour'
   WHERE id = 1;
   ```

2. **Action:** Exécuter le cron job manuellement
   ```sql
   UPDATE bookings
   SET status = 'Quote Expired'
   WHERE status = 'Quote Sent'
     AND quote_expiration_date < NOW();
   ```

3. **Vérifications:**
   - [ ] Statut mis à jour: `Quote Expired`

4. **Frontend:**
   - [ ] Badge affiché: "Devis expiré"
   - [ ] Bouton "Payer" désactivé
   - [ ] Message: "Contactez-nous pour un nouveau devis"

#### Résultat Attendu
- Devis expirés automatiquement après 48h

---

### TC-VALIDATION-010: Empêcher l'Annulation d'un Voyage Terminé

**Priorité:** MOYENNE
**Type:** Validation

#### Préconditions
- Réservation avec statut `Trip Completed`

#### Étapes de Test
1. **Action:** POST `/api/bookings/1/cancel`

2. **Vérifications:**
   - [ ] HTTP Status: 400 Bad Request
   - [ ] Message: "Cannot cancel a completed trip"
   - [ ] Statut reste `Trip Completed`

#### Résultat Attendu
- Voyages terminés non annulables

---

### TC-VALIDATION-011: Empêcher la Double Annulation

**Priorité:** MOYENNE
**Type:** Validation

#### Préconditions
- Réservation avec statut `Cancelled`

#### Étapes de Test
1. **Action:** POST `/api/bookings/1/cancel`

2. **Vérifications:**
   - [ ] HTTP Status: 400 Bad Request
   - [ ] Message: "Booking is already cancelled"

#### Résultat Attendu
- Impossible d'annuler 2 fois

---

## TESTS DE SÉCURITÉ ET PERMISSIONS

### TC-SECURITY-001: Accès Admin - Authentification Requise

**Priorité:** CRITIQUE
**Type:** Sécurité

#### Étapes de Test
1. **Action:** GET `/api/bookings/admin/all` SANS token d'authentification

2. **Vérifications:**
   - [ ] HTTP Status: 401 Unauthorized
   - [ ] Message: "Not authorized, token missing"

#### Résultat Attendu
- Accès refusé sans authentification

---

### TC-SECURITY-002: Accès Admin - Rôle Admin Requis

**Priorité:** CRITIQUE
**Type:** Sécurité

#### Préconditions
- Token d'authentification d'un utilisateur NORMAL (non-admin)

#### Étapes de Test
1. **Action:** GET `/api/bookings/admin/all` avec token user normal

2. **Vérifications:**
   - [ ] HTTP Status: 403 Forbidden
   - [ ] Message: "Not authorized as admin"

#### Résultat Attendu
- Seuls les admins peuvent accéder

---

### TC-SECURITY-003: Utilisateur Ne Peut Voir que Ses Réservations

**Priorité:** CRITIQUE
**Type:** Sécurité

#### Préconditions
- User A (id: 1) a une réservation (id: 10)
- User B (id: 2) authentifié

#### Étapes de Test
1. **Action:** User B tente GET `/api/bookings/10` (appartient à User A)

2. **Vérifications:**
   - [ ] HTTP Status: 404 Not Found
   - [ ] Aucune donnée retournée

3. **Vérification SQL:**
   ```sql
   -- Le WHERE b.user_id = $2 doit empêcher l'accès
   SELECT * FROM bookings WHERE id = 10 AND user_id = 2;
   -- Résultat: 0 rows
   ```

#### Résultat Attendu
- Isolation des données utilisateur

---

### TC-SECURITY-004: Utilisateur Ne Peut Annuler que Ses Réservations

**Priorité:** CRITIQUE
**Type:** Sécurité

#### Préconditions
- User A (id: 1) a une réservation (id: 10)
- User B (id: 2) authentifié

#### Étapes de Test
1. **Action:** User B tente POST `/api/bookings/10/cancel`

2. **Vérifications:**
   - [ ] HTTP Status: 404 Not Found
   - [ ] Statut de la réservation 10 INCHANGÉ

#### Résultat Attendu
- Impossible d'annuler les réservations des autres

---

### TC-SECURITY-005: Validation du Token JWT

**Priorité:** CRITIQUE
**Type:** Sécurité

#### Étapes de Test
1. **Test 1:** Token expiré
   - [ ] 401 Unauthorized

2. **Test 2:** Token modifié (signature invalide)
   - [ ] 401 Unauthorized

3. **Test 3:** Token vide
   - [ ] 401 Unauthorized

#### Résultat Attendu
- Tokens validés strictement

---

### TC-SECURITY-006: Protection Contre l'Injection SQL

**Priorité:** CRITIQUE
**Type:** Sécurité

#### Étapes de Test
1. **Action:** POST `/api/bookings` avec `contact_name: "'; DROP TABLE bookings; --"`

2. **Vérifications:**
   - [ ] Réservation créée normalement
   - [ ] `contact_name` stocké comme string littéral
   - [ ] Table `bookings` existe toujours
   - [ ] Aucune commande SQL exécutée

#### Résultat Attendu
- Protection contre SQL injection via parameterized queries

---

## TESTS DE PERFORMANCE

### TC-PERF-001: Temps de Réponse - Création de Réservation

**Priorité:** MOYENNE
**Type:** Performance

#### Métriques Cibles
- P50: < 500ms
- P95: < 1000ms
- P99: < 2000ms

#### Étapes de Test
1. **Action:** Créer 100 réservations séquentiellement
2. **Mesurer:** Temps de réponse de chaque requête

#### Résultat Attendu
- 95% des requêtes < 1 seconde

---

### TC-PERF-002: Charge Concurrente - Admin Dashboard

**Priorité:** MOYENNE
**Type:** Performance

#### Scénario
- 50 requêtes concurrentes à `/api/bookings/admin/all`

#### Métriques Cibles
- Taux de succès: > 99%
- Temps de réponse moyen: < 800ms

#### Résultat Attendu
- Système stable sous charge modérée

---

### TC-PERF-003: Pagination - Grande Volumétrie

**Priorité:** BASSE
**Type:** Performance

#### Préconditions
- 10,000 réservations dans la base

#### Étapes de Test
1. **Action:** GET `/api/bookings/admin/all?page=1&limit=100`

2. **Vérifications:**
   - [ ] Temps de réponse < 1 seconde
   - [ ] Mémoire serveur stable
   - [ ] Pagination fonctionne correctement

#### Résultat Attendu
- Performance stable même avec beaucoup de données

---

## TESTS D'INTÉGRATION

### TC-INTEGRATION-001: Workflow Complet End-to-End

**Priorité:** HAUTE
**Type:** Intégration

#### Scénario
Parcours complet du cycle de vie d'une réservation

#### Étapes
1. **Création:** User crée une réservation
   - [ ] Status: `Inquiry Pending`
   - [ ] 2 emails envoyés

2. **Envoi Devis:** Admin envoie le devis
   - [ ] Status: `Quote Sent`
   - [ ] 1 email envoyé au client

3. **Paiement:** Client paie
   - [ ] Status: `Payment Confirmed`
   - [ ] 2 emails envoyés

4. **Voyage Effectué:** Admin marque comme terminé
   - [ ] Status: `Trip Completed`
   - [ ] 1 email d'avis envoyé

5. **Vérifications Finales:**
   - [ ] Tous les timestamps corrects
   - [ ] Historique d'état cohérent
   - [ ] Total de 6 emails envoyés

#### Résultat Attendu
- Workflow complet fonctionne sans erreur

---

### TC-INTEGRATION-002: Workflow avec Annulation Rapide

**Priorité:** HAUTE
**Type:** Intégration

#### Étapes
1. User crée réservation → `Inquiry Pending`
2. User annule immédiatement → `Cancelled`

**Vérifications:**
- [ ] Aucun paiement traité
- [ ] Aucun remboursement nécessaire
- [ ] Email d'annulation envoyé

---

### TC-INTEGRATION-003: Intégration avec Stripe Webhook

**Priorité:** HAUTE
**Type:** Intégration

#### Préconditions
- Endpoint webhook configuré
- Signature Stripe validée

#### Étapes de Test
1. **Setup:** Créer un devis (status: `Quote Sent`)
2. **Action:** Simuler un webhook Stripe `payment_intent.succeeded`
   ```json
   {
     "type": "payment_intent.succeeded",
     "data": {
       "object": {
         "id": "pi_123456",
         "amount": 4750000,
         "metadata": {
           "booking_id": "1"
         }
       }
     }
   }
   ```

3. **Vérifications:**
   - [ ] Webhook validé (signature Stripe)
   - [ ] Status mis à jour: `Payment Confirmed`
   - [ ] `payment_transaction_id` = "pi_123456"
   - [ ] Emails de confirmation envoyés

#### Résultat Attendu
- Intégration Stripe fonctionnelle

---

## MATRICE DE TRAÇABILITÉ

| ID Test | Fonctionnalité | Priorité | Status | Assigné |
|---------|----------------|----------|--------|---------|
| TC-LIFECYCLE-001 | Création Réservation | HAUTE | ❌ À faire | - |
| TC-LIFECYCLE-002 | Envoi Devis | HAUTE | ❌ À faire | - |
| TC-LIFECYCLE-003 | Paiement | HAUTE | ❌ À faire | - |
| TC-LIFECYCLE-004 | Annulation Avant Paiement | MOYENNE | ❌ À faire | - |
| TC-LIFECYCLE-005 | Annulation 24h | HAUTE | ❌ À faire | - |
| TC-LIFECYCLE-006 | Refus Annulation | HAUTE | ❌ À faire | - |
| TC-LIFECYCLE-007 | Finalisation Voyage | MOYENNE | ❌ À faire | - |
| TC-LIFECYCLE-008 | Refus Complétion | MOYENNE | ❌ À faire | - |
| TC-API-001 | Liste Réservations | HAUTE | ❌ À faire | - |
| TC-API-002 | Filtre Statut | HAUTE | ❌ À faire | - |
| TC-API-003 | Filtre Tour | MOYENNE | ❌ À faire | - |
| TC-API-004 | Filtre Dates | MOYENNE | ❌ À faire | - |
| TC-API-005 | Statistiques | HAUTE | ❌ À faire | - |
| TC-API-006 | Validation Prix | HAUTE | ❌ À faire | - |
| TC-API-007 | Refus Devis | HAUTE | ❌ À faire | - |
| TC-EMAIL-001 | Email Inquiry User | HAUTE | ❌ À faire | - |
| TC-EMAIL-002 | Email Inquiry Admin | HAUTE | ❌ À faire | - |
| TC-EMAIL-003 | Email Quote | HAUTE | ❌ À faire | - |
| TC-EMAIL-004 | Email Payment User | HAUTE | ❌ À faire | - |
| TC-EMAIL-005 | Email Payment Admin | MOYENNE | ❌ À faire | - |
| TC-EMAIL-006 | Email Cancellation | HAUTE | ❌ À faire | - |
| TC-EMAIL-007 | Email Review | MOYENNE | ❌ À faire | - |
| TC-EMAIL-008 | Gestion Erreur Email | HAUTE | ❌ À faire | - |
| TC-VALIDATION-001 | Date < 5 jours | HAUTE | ❌ À faire | - |
| TC-VALIDATION-002 | Format Date | HAUTE | ❌ À faire | - |
| TC-VALIDATION-003 | Limite Adultes | HAUTE | ❌ À faire | - |
| TC-VALIDATION-004 | Limite Enfants | MOYENNE | ❌ À faire | - |
| TC-VALIDATION-005 | Tour Inexistant | HAUTE | ❌ À faire | - |
| TC-VALIDATION-006 | Tier Invalide | HAUTE | ❌ À faire | - |
| TC-VALIDATION-007 | Champs Requis | HAUTE | ❌ À faire | - |
| TC-VALIDATION-008 | Fenêtre 24h | HAUTE | ❌ À faire | - |
| TC-VALIDATION-009 | Expiration Devis | HAUTE | ❌ À faire | - |
| TC-VALIDATION-010 | Annulation Voyage Terminé | MOYENNE | ❌ À faire | - |
| TC-VALIDATION-011 | Double Annulation | MOYENNE | ❌ À faire | - |
| TC-SECURITY-001 | Auth Requise | CRITIQUE | ❌ À faire | - |
| TC-SECURITY-002 | Rôle Admin | CRITIQUE | ❌ À faire | - |
| TC-SECURITY-003 | Isolation User | CRITIQUE | ❌ À faire | - |
| TC-SECURITY-004 | Annulation Sécurisée | CRITIQUE | ❌ À faire | - |
| TC-SECURITY-005 | Validation JWT | CRITIQUE | ❌ À faire | - |
| TC-SECURITY-006 | SQL Injection | CRITIQUE | ❌ À faire | - |
| TC-PERF-001 | Temps Création | MOYENNE | ❌ À faire | - |
| TC-PERF-002 | Charge Concurrente | MOYENNE | ❌ À faire | - |
| TC-PERF-003 | Pagination Volume | BASSE | ❌ À faire | - |
| TC-INTEGRATION-001 | E2E Complet | HAUTE | ❌ À faire | - |
| TC-INTEGRATION-002 | Annulation Rapide | HAUTE | ❌ À faire | - |
| TC-INTEGRATION-003 | Stripe Webhook | HAUTE | ❌ À faire | - |

---

## RÉSUMÉ DES TESTS

### Par Priorité
- **CRITIQUE:** 6 tests
- **HAUTE:** 30 tests
- **MOYENNE:** 10 tests
- **BASSE:** 1 test

### Par Catégorie
- **Cycle de Vie:** 8 tests
- **APIs Admin:** 7 tests
- **Emails:** 8 tests
- **Validations:** 11 tests
- **Sécurité:** 6 tests
- **Performance:** 3 tests
- **Intégration:** 3 tests

**TOTAL:** 46 tests

---

## PROCHAINES ÉTAPES

1. ✅ Révision du plan de tests par l'équipe
2. ⏳ Configuration de l'environnement de test
3. ⏳ Exécution des tests CRITIQUE et HAUTE priorité
4. ⏳ Correction des bugs identifiés
5. ⏳ Exécution des tests MOYENNE et BASSE priorité
6. ⏳ Rapport de tests final

---

**Document maintenu par:** Équipe QA
**Dernière révision:** 2025-01-08
**Version:** 1.0
