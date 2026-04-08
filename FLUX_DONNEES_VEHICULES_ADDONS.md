# 📊 Flux de Données : Véhicules et Addons

## 🔄 Comment les noms sont récupérés depuis la base de données

### 1️⃣ Stockage dans la Base de Données

**Table `bookings`** :
```sql
-- Les colonnes JSONB ne contiennent QUE les IDs et quantités
selected_vehicles: [{"quantity": 1, "vehicle_id": 4}]
selected_addons: [{"addon_id": 1, "quantity": 1}, {"addon_id": 5, "quantity": 1}, ...]
```

**Tables de référence** :
```sql
-- Table vehicles
id | name                  | capacity
4  | Luxury 8-Seater Van  | 8

-- Table addons
id | name                              | price
1  | Romantic Candlelight Dinner      | 3500.00
5  | Professional Photography Session | 5500.00
6  | Water Sports Package             | 4500.00
```

### 2️⃣ Enrichissement Backend (AUTO)

**Fichier** : `backend/src/controllers/bookingController.js`
**Fonction** : `exports.getBookingById` (lignes 846-944)

**Ce qui se passe automatiquement** :

#### Pour les Véhicules (lignes 865-897) :
```javascript
// 1. Récupère les IDs depuis bookings.selected_vehicles
booking.selected_vehicles = [{"quantity": 1, "vehicle_id": 4}]

// 2. Pour chaque vehicle_id, fait une requête SQL :
SELECT id, name, capacity, base_price_inr 
FROM vehicles 
WHERE id = 4

// 3. Enrichit l'objet avec les données complètes :
{
  vehicle_id: 4,
  name: "Luxury 8-Seater Van",          // ← Nom depuis la BDD
  vehicle_name: "Luxury 8-Seater Van",  // ← Nom depuis la BDD
  quantity: 1,
  capacity: 8,                           // ← Depuis la BDD
  price: 2500.00                         // ← Depuis la BDD
}
```

#### Pour les Addons (lignes 899-931) :
```javascript
// 1. Récupère les IDs depuis bookings.selected_addons
booking.selected_addons = [{"addon_id": 1, "quantity": 1}, ...]

// 2. Pour chaque addon_id, fait une requête SQL :
SELECT id, name, price 
FROM addons 
WHERE id = 1

// 3. Enrichit l'objet avec les données complètes :
{
  addon_id: 1,
  name: "Romantic Candlelight Dinner",          // ← Nom depuis la BDD
  addon_name: "Romantic Candlelight Dinner",    // ← Nom depuis la BDD
  quantity: 1,
  price: 3500.00                                 // ← Depuis la BDD
}
```

### 3️⃣ Réponse API

**Ce que le backend retourne au frontend** :
```json
{
  "success": true,
  "data": {
    "id": 100,
    "booking_reference": "EB-2025-047974",
    "selected_vehicles": [
      {
        "vehicle_id": 4,
        "name": "Luxury 8-Seater Van",
        "vehicle_name": "Luxury 8-Seater Van",
        "quantity": 1,
        "capacity": 8,
        "price": 2500.00
      }
    ],
    "selected_addons": [
      {
        "addon_id": 1,
        "name": "Romantic Candlelight Dinner",
        "addon_name": "Romantic Candlelight Dinner",
        "quantity": 1,
        "price": 3500.00
      },
      {
        "addon_id": 5,
        "name": "Professional Photography Session",
        "addon_name": "Professional Photography Session",
        "quantity": 1,
        "price": 5500.00
      }
    ]
  }
}
```

### 4️⃣ Affichage Frontend

**Fichier** : `frontend/src/pages/BookingDetailsPage.jsx`

**Code d'affichage** (lignes 492-505) :
```jsx
// Récupère le nom depuis les données enrichies
const vehicleName = vehicle.vehicle_name || vehicle.name || t('bookingDetailsPage.vehicle');

// Affiche :
<p className="text-xs font-medium text-blue-600 uppercase">
  VÉHICULE
</p>
<p className="font-bold text-gray-900 text-lg">
  {vehicleName}  {/* "Luxury 8-Seater Van" */}
</p>
```

## ✅ Résumé

1. **Base de données** : Stocke seulement les IDs (`vehicle_id: 4`, `addon_id: 1`)
2. **Backend (AUTO)** : Enrichit automatiquement avec les noms depuis `vehicles` et `addons`
3. **Frontend** : Affiche les noms enrichis

**Tout fonctionne automatiquement !** Quand l'utilisateur sélectionne un véhicule ou addon lors de la réservation, seul l'ID est stocké. Mais quand on affiche la réservation, le backend récupère automatiquement le nom depuis la table correspondante.

## 🔍 Pour Vérifier que ça Marche

1. Va sur http://localhost:3000/booking/100
2. Tu devrais voir :
   - **VÉHICULE** : Luxury 8-Seater Van
   - **SUPPLÉMENT** : Romantic Candlelight Dinner
   - **SUPPLÉMENT** : Professional Photography Session
   - **SUPPLÉMENT** : Water Sports Package

Si tu vois ces noms au lieu des IDs, c'est que **tout fonctionne correctement** ! Les noms proviennent bien de la base de données.

