# GUIDE DE TEST DES API DE RÉSERVATION

**Date :** 2025-01-08
**Base URL :** `http://localhost:5000`

---

## 🔐 PRÉPARATION : Obtenir un Token

### 1. Créer un utilisateur de test (si nécessaire)

```bash
curl -X POST http://localhost:5000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Test User",
    "email": "test@example.com",
    "password": "Test123456"
  }'
```

### 2. Vérifier l'email manuellement en base de données

```sql
-- Via psql ou pgAdmin
UPDATE users SET is_verified = true WHERE email = 'test@example.com';
```

### 3. Se connecter et récupérer le token

```bash
curl -X POST http://localhost:5000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123456"
  }'
```

**Réponse :**
```json
{
  "message": "Login successful!",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "test@example.com",
    "full_name": "Test User",
    "role": "customer"
  }
}
```

**⚠️ Copier le `token` pour les tests suivants**

---

## 📝 TEST 1 : Créer une Réservation (Inquiry Pending)

### Endpoint
```
POST /api/bookings
```

### Headers
```
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json
```

### Body
```json
{
  "tour_id": 77,
  "tier_id": 231,
  "travel_date": "2025-02-15",
  "num_adults": 2,
  "num_children": 1,
  "selected_addons": [
    {
      "id": 1,
      "name": "Candlelight Dinner",
      "price": 2500
    }
  ],
  "selected_vehicles": [
    {
      "id": 1,
      "name": "7 Seater SUV",
      "quantity": 1,
      "price_per_day": 3000
    }
  ],
  "estimated_price": 52500,
  "contact_name": "John Doe",
  "contact_email": "john@example.com",
  "contact_phone": "+91 9876543210",
  "special_requests": "Vegetarian meals please"
}
```

### Commande cURL
```bash
curl -X POST http://localhost:5000/api/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "tour_id": 77,
    "tier_id": 231,
    "travel_date": "2025-02-15",
    "num_adults": 2,
    "num_children": 1,
    "selected_addons": [],
    "selected_vehicles": [],
    "estimated_price": 45000,
    "contact_name": "John Doe",
    "contact_email": "john@example.com",
    "contact_phone": "+91 9876543210",
    "special_requests": "Vegetarian meals please"
  }'
```

### Réponse Attendue (201 Created)
```json
{
  "success": true,
  "message": "Booking inquiry submitted successfully! Our team will respond within 30 minutes.",
  "data": {
    "id": 1,
    "booking_reference": "EB-2025-001234",
    "status": "Inquiry Pending",
    "travel_date": "2025-02-15",
    "estimated_price": "45000.00"
  }
}
```

### Vérification en Base de Données
```sql
SELECT * FROM bookings WHERE booking_reference = 'EB-2025-001234';
```

---

## 📋 TEST 2 : Récupérer les Réservations de l'Utilisateur

### Endpoint
```
GET /api/bookings/user
```

### Headers
```
Authorization: Bearer YOUR_TOKEN_HERE
```

### Commande cURL
```bash
curl -X GET http://localhost:5000/api/bookings/user \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Réponse Attendue (200 OK)
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "booking_reference": "EB-2025-001234",
      "status": "Inquiry Pending",
      "travel_date": "2025-02-15T00:00:00.000Z",
      "num_adults": 2,
      "num_children": 1,
      "estimated_price": "45000.00",
      "tour_name": "Kerala Backwaters & Spice Gardens - 4 Days",
      "tier_name": "Standard",
      "can_cancel_with_refund": false,
      "created_at": "2025-01-08T10:00:00.000Z"
    }
  ]
}
```

---

## 🔍 TEST 3 : Récupérer les Détails d'une Réservation

### Endpoint
```
GET /api/bookings/:id
```

### Headers
```
Authorization: Bearer YOUR_TOKEN_HERE
```

### Commande cURL
```bash
curl -X GET http://localhost:5000/api/bookings/1 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Réponse Attendue (200 OK)
```json
{
  "success": true,
  "data": {
    "id": 1,
    "booking_reference": "EB-2025-001234",
    "status": "Inquiry Pending",
    "travel_date": "2025-02-15T00:00:00.000Z",
    "num_adults": 2,
    "num_children": 1,
    "selected_addons": [],
    "selected_vehicles": [],
    "estimated_price": "45000.00",
    "final_price": null,
    "contact_name": "John Doe",
    "contact_email": "john@example.com",
    "contact_phone": "+91 9876543210",
    "special_requests": "Vegetarian meals please",
    "tour_name": "Kerala Backwaters & Spice Gardens - 4 Days",
    "tier_name": "Standard",
    "tier_price": "45000.00",
    "hotel_type": "3-star hotel",
    "can_cancel_with_refund": false,
    "created_at": "2025-01-08T10:00:00.000Z"
  }
}
```

---

## ❌ TEST 4 : Tests de Validation (Doivent Échouer)

### 4.1 Date trop proche (moins de 5 jours)

```bash
curl -X POST http://localhost:5000/api/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "tour_id": 77,
    "tier_id": 231,
    "travel_date": "2025-01-10",
    "num_adults": 2,
    "num_children": 0,
    "estimated_price": 45000,
    "contact_name": "John Doe",
    "contact_email": "john@example.com",
    "contact_phone": "+91 9876543210"
  }'
```

**Réponse Attendue (400 Bad Request) :**
```json
{
  "success": false,
  "error": "Travel date must be at least 5 days in the future.",
  "earliestDate": "2025-01-13"
}
```

### 4.2 Champs manquants

```bash
curl -X POST http://localhost:5000/api/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "tour_id": 77
  }'
```

**Réponse Attendue (400 Bad Request) :**
```json
{
  "success": false,
  "error": "Missing required fields: tour_id, tier_id, travel_date, num_adults"
}
```

### 4.3 Tour inexistant

```bash
curl -X POST http://localhost:5000/api/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "tour_id": 99999,
    "tier_id": 231,
    "travel_date": "2025-02-15",
    "num_adults": 2,
    "estimated_price": 45000,
    "contact_name": "John Doe",
    "contact_email": "john@example.com",
    "contact_phone": "+91 9876543210"
  }'
```

**Réponse Attendue (404 Not Found) :**
```json
{
  "success": false,
  "error": "Tour not found."
}
```

---

## 🔴 TEST 5 : Annuler une Réservation (Avant Paiement)

### Endpoint
```
POST /api/bookings/:id/cancel
```

### Headers
```
Authorization: Bearer YOUR_TOKEN_HERE
```

### Commande cURL
```bash
curl -X POST http://localhost:5000/api/bookings/1/cancel \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Réponse Attendue (200 OK)
```json
{
  "success": true,
  "message": "Booking cancelled successfully.",
  "refund_status": "not_applicable"
}
```

### Vérification en Base de Données
```sql
SELECT status, cancellation_date FROM bookings WHERE id = 1;
-- status devrait être 'Cancelled'
-- cancellation_date devrait être remplie
```

---

## 👨‍💼 TEST 6 : Admin - Envoyer un Devis

### Endpoint
```
PUT /api/bookings/:id/send-quote
```

### Headers
```
Authorization: Bearer ADMIN_TOKEN_HERE
Content-Type: application/json
```

### Body
```json
{
  "final_price": 48000,
  "admin_notes": "Prix ajusté en fonction de la saison haute"
}
```

### Commande cURL
```bash
curl -X PUT http://localhost:5000/api/bookings/1/send-quote \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE" \
  -d '{
    "final_price": 48000,
    "admin_notes": "Prix ajusté en fonction de la saison haute"
  }'
```

### Réponse Attendue (200 OK)
```json
{
  "success": true,
  "message": "Quote sent successfully to customer.",
  "data": {
    "quote_expiration": "2025-01-10T10:00:00.000Z",
    "final_price": 48000
  }
}
```

### Vérification en Base de Données
```sql
SELECT status, final_price, quote_sent_date, quote_expiration_date
FROM bookings WHERE id = 1;
-- status devrait être 'Quote Sent'
-- final_price devrait être 48000.00
-- quote_expiration_date devrait être NOW() + 48 heures
```

---

## 👨‍💼 TEST 7 : Admin - Liste de Toutes les Réservations

### Endpoint
```
GET /api/bookings/admin/all
```

### Headers
```
Authorization: Bearer ADMIN_TOKEN_HERE
```

### Query Parameters (optionnels)
- `status` - Filtrer par statut (ex: "Inquiry Pending")
- `tour_id` - Filtrer par tour
- `start_date` - Date de voyage minimum
- `end_date` - Date de voyage maximum
- `page` - Numéro de page (défaut: 1)
- `limit` - Nombre par page (défaut: 20)

### Commande cURL
```bash
# Sans filtres
curl -X GET "http://localhost:5000/api/bookings/admin/all" \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE"

# Avec filtres
curl -X GET "http://localhost:5000/api/bookings/admin/all?status=Inquiry%20Pending&page=1&limit=10" \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE"
```

### Réponse Attendue (200 OK)
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "booking_reference": "EB-2025-001234",
      "status": "Inquiry Pending",
      "user_name": "Test User",
      "user_email": "test@example.com",
      "tour_name": "Kerala Backwaters & Spice Gardens - 4 Days",
      "tier_name": "Standard",
      "travel_date": "2025-02-15T00:00:00.000Z",
      "estimated_price": "45000.00",
      "can_cancel_with_refund": false,
      "quote_is_valid": null,
      "created_at": "2025-01-08T10:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "pages": 1
  }
}
```

---

## 📊 TEST 8 : Admin - Statistiques des Réservations

### Endpoint
```
GET /api/bookings/admin/stats
```

### Headers
```
Authorization: Bearer ADMIN_TOKEN_HERE
```

### Commande cURL
```bash
curl -X GET http://localhost:5000/api/bookings/admin/stats \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE"
```

### Réponse Attendue (200 OK)
```json
{
  "success": true,
  "data": {
    "pending_count": "12",
    "quote_sent_count": "8",
    "confirmed_count": "45",
    "cancelled_count": "3",
    "completed_count": "230",
    "total_count": "298",
    "total_revenue": "12500000.00",
    "avg_booking_value": "277777.78"
  }
}
```

---

## 👨‍💼 TEST 9 : Admin - Marquer comme Complété

### Endpoint
```
PUT /api/bookings/:id/complete
```

### Headers
```
Authorization: Bearer ADMIN_TOKEN_HERE
Content-Type: application/json
```

### Body (optionnel)
```json
{
  "admin_notes": "Trip completed successfully. Customer was very satisfied."
}
```

### Commande cURL
```bash
curl -X PUT http://localhost:5000/api/bookings/1/complete \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE" \
  -d '{
    "admin_notes": "Trip completed successfully."
  }'
```

### Réponse Attendue (200 OK)
```json
{
  "success": true,
  "message": "Booking marked as completed. Review request email sent to customer."
}
```

---

## 🧪 SCÉNARIO COMPLET DE TEST

### Scénario 1 : Cycle de vie réussi

1. ✅ Utilisateur crée une réservation → Status: `Inquiry Pending`
2. ✅ Admin envoie le devis → Status: `Quote Sent`
3. ⏳ Paiement effectué (via webhook) → Status: `Payment Confirmed`
4. ✅ Admin marque comme complété → Status: `Trip Completed`

### Scénario 2 : Annulation avant paiement

1. ✅ Utilisateur crée une réservation → Status: `Inquiry Pending`
2. ✅ Utilisateur annule → Status: `Cancelled`

### Scénario 3 : Annulation après paiement (dans les 24h)

1. ✅ Réservation payée → Status: `Payment Confirmed`
2. ✅ Utilisateur annule dans les 24h → Status: `Cancelled` (remboursement)

### Scénario 4 : Tentative d'annulation tardive

1. ✅ Réservation payée il y a >24h → Status: `Payment Confirmed`
2. ❌ Utilisateur essaie d'annuler → Erreur 400 "fenêtre expirée"

---

## 📝 CHECKLIST DE TESTS

- [ ] Créer une réservation avec succès
- [ ] Vérifier génération automatique de `booking_reference`
- [ ] Vérifier validation de date (>= +5 jours)
- [ ] Tester avec date invalide (doit échouer)
- [ ] Tester avec champs manquants (doit échouer)
- [ ] Récupérer liste des réservations utilisateur
- [ ] Récupérer détails d'une réservation
- [ ] Annuler une réservation (avant paiement)
- [ ] Admin: Envoyer un devis
- [ ] Admin: Récupérer toutes les réservations
- [ ] Admin: Récupérer les statistiques
- [ ] Admin: Marquer comme complété
- [ ] Vérifier les timestamps dans la base de données

---

## 🔄 POUR UTILISER LA NOUVELLE API

Dans le code frontend, remplacer l'ancienne route `/api/bookings` par notre nouvelle implémentation.

### Option 1 : Dans `backend/src/index.js`

```javascript
// Remplacer ligne 8:
const bookingRoutes = require("./routes/bookingRoutesNew");
```

### Option 2 : Tester avec un préfixe différent

```javascript
// Ajouter après ligne 64:
const bookingRoutesNew = require("./routes/bookingRoutesNew");
app.use("/api/bookings-v2", bookingRoutesNew);
```

Puis tester avec `/api/bookings-v2` dans les endpoints ci-dessus.

---

**✅ Tests validés = API prête pour la production !**
