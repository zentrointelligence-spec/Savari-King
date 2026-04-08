# 🧪 GUIDE DE TEST - SYSTÈME D'OFFRES SPÉCIALES

## 🎯 Tests à Effectuer

### ✅ **TEST 1: Vérifier les Offres Actives**

```bash
# Connexion à PostgreSQL
PGPASSWORD=postgres psql -U postgres -d ebookingsam

# Vérifier les offres actives
SELECT
  id,
  title,
  offer_type,
  discount_percentage,
  discount_amount,
  valid_from,
  valid_until,
  is_active,
  usage_count,
  usage_limit
FROM special_offers
WHERE is_active = true
  AND NOW() BETWEEN valid_from AND valid_until
ORDER BY display_order;
```

**Résultat attendu:** Liste des 5 offres actives

---

### ✅ **TEST 2: Tester l'Endpoint des Offres Applicables**

#### **Prérequis:**
- Créer une réservation de test
- Démarrer une révision de devis

#### **Requête:**

```bash
# Via API REST (Postman/Thunder Client)
GET http://localhost:5000/api/bookings/1/review/1/applicable-offers
Headers:
  Authorization: Bearer {admin_token}
```

#### **Réponse attendue:**

```json
{
  "success": true,
  "data": {
    "hasOffers": true,
    "applicableOffers": [
      {
        "offerId": 1,
        "offerTitle": "Early Bird Special - 25% Off",
        "offerType": "early_bird",
        "discountAmount": 3750.00,
        "discountPercentage": 25.00,
        "applicableReason": "Early bird - booked 45 days in advance",
        "isFeatured": true,
        "termsConditions": "...",
        "priority": 0
      }
    ],
    "strategies": {
      "bestSingle": {
        "selectedOffers": [...],
        "totalDiscount": 3750.00,
        "finalAmount": 11250.00,
        "discountPercentage": 25.00
      },
      "cumulative": {
        "selectedOffers": [...],
        "totalDiscount": 6750.00,
        "finalAmount": 8250.00,
        "discountPercentage": 45.00
      }
    },
    "recommended": "cumulative"
  }
}
```

---

### ✅ **TEST 3: Application Automatique**

```bash
POST http://localhost:5000/api/bookings/1/review/1/auto-apply-offers
Headers:
  Authorization: Bearer {admin_token}
Body:
{
  "strategy": "best_single"
}
```

#### **Vérifications:**

```sql
-- Vérifier que les offres ont été appliquées
SELECT
  id,
  booking_id,
  applied_offers,
  total_discounts,
  final_price
FROM booking_quote_revisions
WHERE id = 1;
```

**Résultat attendu:**
- `applied_offers` contient un tableau JSON avec les offres
- `total_discounts` est mis à jour
- `final_price` est recalculé

---

### ✅ **TEST 4: Application Manuelle**

```bash
POST http://localhost:5000/api/bookings/1/review/1/apply-offers
Headers:
  Authorization: Bearer {admin_token}
Body:
{
  "selectedOffers": [
    {
      "offerId": 1,
      "offerTitle": "Early Bird Special",
      "offerType": "early_bird",
      "discountAmount": 3750,
      "discountPercentage": 25,
      "applicableReason": "Early bird - booked 45 days in advance"
    },
    {
      "offerId": 3,
      "offerTitle": "Monsoon Magic",
      "offerType": "seasonal",
      "discountAmount": 3000,
      "discountPercentage": 20,
      "applicableReason": "Seasonal offer - Monsoon season"
    }
  ],
  "strategy": "manual"
}
```

---

### ✅ **TEST 5: Vérifier l'Incrémentation du Compteur**

```sql
-- Avant application
SELECT id, title, usage_count FROM special_offers WHERE id = 1;
-- Résultat: usage_count = 0

-- Après application (via API)
-- POST .../auto-apply-offers

-- Vérification
SELECT id, title, usage_count FROM special_offers WHERE id = 1;
-- Résultat attendu: usage_count = 1
```

---

### ✅ **TEST 6: Test des Limites d'Utilisation**

```sql
-- Créer une offre avec limite
INSERT INTO special_offers (
  title,
  slug,
  offer_type,
  discount_percentage,
  valid_from,
  valid_until,
  usage_limit,
  usage_count
) VALUES (
  'Limited Test Offer',
  'limited-test-offer',
  'percentage',
  10,
  NOW(),
  NOW() + INTERVAL '30 days',
  2,  -- Limite de 2 utilisations
  1   -- Déjà utilisée 1 fois
);

-- Tester l'application
-- Devrait fonctionner car usage_count (1) < usage_limit (2)

-- Appliquer une 2ème fois
-- usage_count devient 2

-- Tenter une 3ème fois
-- Devrait être rejetée car usage_count (2) >= usage_limit (2)
```

---

### ✅ **TEST 7: Test Early Bird**

#### **Scénario:**
- Date actuelle: 22 Oct 2025
- Date de voyage: 10 Dec 2025 (49 jours d'avance)
- Offre Early Bird active (≥30 jours requis)

```sql
-- Créer une réservation test
INSERT INTO bookings (
  user_id,
  tour_id,
  tier_id,
  travel_date,
  num_adults,
  estimated_price,
  currency,
  contact_name,
  contact_email,
  contact_phone,
  booking_reference
) VALUES (
  1,
  1,
  1,
  '2025-12-10',  -- 49 jours d'avance
  2,
  15000,
  'INR',
  'Test User',
  'test@example.com',
  '+1234567890',
  'TEST-EB-001'
) RETURNING id;

-- Démarrer la révision
SELECT * FROM start_booking_review({booking_id}, {admin_id});

-- Récupérer les offres applicables
-- L'offre Early Bird devrait apparaître
```

---

### ✅ **TEST 8: Test Last Minute**

#### **Scénario:**
- Date actuelle: 22 Oct 2025
- Date de voyage: 28 Oct 2025 (6 jours d'avance)
- Offre Last Minute active (5-7 jours)

```sql
INSERT INTO bookings (
  ...
  travel_date,
  ...
) VALUES (
  ...
  '2025-10-28',  -- 6 jours d'avance
  ...
);

-- Vérifier que Last Minute Offer apparaît
```

---

### ✅ **TEST 9: Test Seasonal (Mousson)**

#### **Scénario:**
- Date de voyage: Juillet 2025 (mois de mousson)
- Offre Seasonal active

```sql
INSERT INTO bookings (
  ...
  travel_date,
  ...
) VALUES (
  ...
  '2025-07-15',  -- Juillet = mousson
  ...
);

-- Vérifier que Monsoon Magic Offer apparaît
```

---

### ✅ **TEST 10: Suppression des Offres**

```bash
DELETE http://localhost:5000/api/bookings/1/review/1/applied-offers
Headers:
  Authorization: Bearer {admin_token}
```

#### **Vérifications:**

```sql
-- Vérifier que applied_offers est vide
SELECT applied_offers FROM booking_quote_revisions WHERE id = 1;
-- Résultat attendu: []

-- Vérifier que usage_count a été décrémenté
SELECT usage_count FROM special_offers WHERE id = 1;
-- Devrait être réduit de 1
```

---

## 🎨 **TEST FRONTEND (Interface Admin)**

### **Test Manuel:**

1. **Accéder à la page de révision de devis:**
   ```
   http://localhost:3000/admin/bookings/{bookingId}/review
   ```

2. **Vérifier l'affichage du panneau "Special Offers":**
   - Le panneau doit apparaître automatiquement
   - Les offres applicables doivent être listées
   - Le badge "X offers" doit afficher le bon nombre

3. **Tester la sélection manuelle:**
   - Cliquer sur une offre pour la sélectionner
   - Vérifier que la case à cocher change d'état
   - Vérifier que le "Total discount" se met à jour
   - Vérifier que le "New Final Price" est correct

4. **Tester l'auto-application:**
   - Cliquer sur "Auto-Apply Best"
   - Vérifier qu'une alerte de succès apparaît
   - Vérifier que les offres sont marquées comme appliquées
   - Vérifier que le prix final est mis à jour

5. **Tester les badges:**
   - Vérifier les couleurs des badges par type:
     - `percentage` → Bleu
     - `fixed_amount` → Vert
     - `early_bird` → Violet
     - `last_minute` → Orange
     - `seasonal` → Teal

---

## 📊 **CHECKLIST COMPLÈTE**

- [ ] Les offres actives sont bien récupérées
- [ ] L'endpoint `/applicable-offers` fonctionne
- [ ] Le calcul des réductions est correct
- [ ] Les stratégies `best_single` et `cumulative` fonctionnent
- [ ] L'auto-application fonctionne
- [ ] L'application manuelle fonctionne
- [ ] Le compteur `usage_count` s'incrémente
- [ ] Les limites d'utilisation sont respectées
- [ ] Early Bird fonctionne (≥30 jours)
- [ ] Last Minute fonctionne (5-7 jours)
- [ ] Seasonal (Mousson) fonctionne (juin-septembre)
- [ ] La suppression des offres fonctionne
- [ ] Le compteur se décrémente à la suppression
- [ ] Le composant frontend s'affiche correctement
- [ ] Les offres sont sélectionnables
- [ ] La prévisualisation des prix est exacte
- [ ] Les badges de type sont corrects
- [ ] Le message de succès apparaît

---

## 🐛 **DÉBOGAGE**

### **Problème: Aucune offre n'apparaît**

```sql
-- Vérifier que les offres sont bien actives
SELECT * FROM special_offers WHERE is_active = true;

-- Vérifier les dates de validité
SELECT
  title,
  valid_from,
  valid_until,
  NOW() BETWEEN valid_from AND valid_until as is_valid
FROM special_offers;

-- Vérifier les limites
SELECT
  title,
  usage_count,
  usage_limit,
  CASE
    WHEN usage_limit IS NULL THEN true
    WHEN usage_count < usage_limit THEN true
    ELSE false
  END as can_be_used
FROM special_offers;
```

### **Problème: Calcul de réduction incorrect**

```javascript
// Vérifier dans la console du navigateur
console.log('Subtotal:', subtotal);
console.log('Discount Percentage:', discountPercentage);
console.log('Calculated Discount:', (subtotal * discountPercentage) / 100);
console.log('Final Price:', subtotal - discount);
```

### **Problème: L'endpoint retourne une erreur 500**

```bash
# Vérifier les logs du serveur
# Chercher les erreurs dans la console

# Vérifier que le service est bien importé
# backend/src/services/specialOffersService.js

# Vérifier que les routes sont montées
# backend/src/routes/index.js
```

---

## ✅ **VALIDATION FINALE**

Avant de considérer le système prêt pour la production:

1. ✅ Tous les tests passent
2. ✅ Les calculs sont vérifiés manuellement
3. ✅ L'interface est testée sur plusieurs navigateurs
4. ✅ Les performances sont acceptables (< 500ms pour récupérer les offres)
5. ✅ Les logs ne montrent aucune erreur
6. ✅ La documentation est à jour
7. ✅ Les admin peuvent utiliser le système sans formation

---

**Document créé le:** 22 Octobre 2025
**Auteur:** Claude Code
