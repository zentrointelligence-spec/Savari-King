# Quote PDF Pricing Multiplication Fix

## Problème Identifié

Les PDFs de devis générés ne calculaient pas correctement les prix des véhicules et des add-ons:

1. **Véhicules:** Le prix n'était PAS multiplié par le nombre de jours (durée du tour)
2. **Add-ons:** Le calcul était correct, mais pour être sûr, nous l'avons vérifié

## Analyse du Code

### Fichier Problématique
**`backend/src/services/quotePricingService.js`** - Fonction `calculateVehiclesPrice`

### Code Incorrect (Lignes 75-104)

```javascript
for (const vehicle of vehicles) {
  const vehicleData = vehicleResult.rows[0];
  const quantity = parseInt(vehicle.quantity || 1);
  // base_price_inr is the total price for the vehicle, not per day ❌ COMMENTAIRE INCORRECT
  const basePrice = parseFloat(vehicleData.base_price_inr || 0);
  const vehicleTotal = basePrice * quantity; // ❌ MANQUE LA MULTIPLICATION PAR LA DURÉE

  totalPrice += vehicleTotal;

  breakdown.push({
    id: vehicleData.id,
    name: vehicleData.name,
    quantity,
    base_price: basePrice,
    total: vehicleTotal
  });
}
```

**Problème:**
- Le paramètre `durationDays` était passé à la fonction mais jamais utilisé
- Le calcul ne multipliait que `basePrice × quantity`
- Il manquait la multiplication par `durationDays`

### Code Corrigé (Lignes 75-104)

```javascript
for (const vehicle of vehicles) {
  const vehicleData = vehicleResult.rows[0];
  const quantity = parseInt(vehicle.quantity || 1);
  // base_price_inr is the price per day for the vehicle ✅ COMMENTAIRE CORRIGÉ
  const pricePerDay = parseFloat(vehicleData.base_price_inr || 0);
  const duration = parseInt(durationDays || 1);
  // IMPORTANT: Vehicle price = pricePerDay × duration × quantity ✅ CALCUL COMPLET
  const vehicleTotal = pricePerDay * duration * quantity;

  totalPrice += vehicleTotal;

  breakdown.push({
    id: vehicleData.id,
    name: vehicleData.name,
    quantity,
    price_per_day: pricePerDay,
    duration_days: duration,
    base_price: pricePerDay,
    total: vehicleTotal
  });
}
```

**Correction:**
- ✅ Le prix est maintenant appelé `pricePerDay` pour plus de clarté
- ✅ La durée est extraite du paramètre `durationDays`
- ✅ Le calcul complet: `pricePerDay × duration × quantity`
- ✅ Les détails sont ajoutés au breakdown pour le debugging

## Formules de Calcul Correctes

### Véhicules
```
Prix Total Véhicule = Prix par Jour × Durée du Tour (jours) × Quantité

Exemple:
- Prix par jour: ₹3,000
- Durée du tour: 5 jours
- Quantité: 2 véhicules
- Total: ₹3,000 × 5 × 2 = ₹30,000
```

### Add-ons (Déjà Correct)

#### Add-ons "Per Person"
```
Prix Total Add-on = Prix Unitaire × Nombre de Participants × Quantité

Exemple:
- Prix unitaire: ₹2,000
- Participants: 4 personnes
- Quantité: 1
- Total: ₹2,000 × 4 × 1 = ₹8,000
```

#### Add-ons "Fixed Price"
```
Prix Total Add-on = Prix Unitaire × Quantité

Exemple:
- Prix unitaire: ₹5,000
- Quantité: 2
- Total: ₹5,000 × 2 = ₹10,000
```

## Flux de Calcul Complet

### 1. Fonction `calculateQuotePrice` (quotePricingService.js:448)
```javascript
async function calculateQuotePrice(bookingId) {
  // 1. Récupère la réservation et la durée du tour
  const booking = bookingResult.rows[0];
  const durationDays = booking.itinerary ? booking.itinerary.length : booking.duration_days;

  // 2. Calcule le prix de base (tier × participants)
  const baseCalc = await calculateBasePrice(
    booking.tier_id,
    booking.num_adults,
    booking.num_children
  );

  // 3. Calcule le prix des véhicules (prix/jour × durée × quantité) ✅ CORRIGÉ
  const vehiclesCalc = await calculateVehiclesPrice(
    booking.selected_vehicles || [],
    durationDays
  );

  // 4. Calcule le prix des add-ons (avec multiplication par participants si applicable) ✅ DÉJÀ CORRECT
  const addonsCalc = await calculateAddonsPrice(
    booking.selected_addons || [],
    booking.num_adults,
    booking.num_children
  );

  // 5. Calcule le sous-total
  const subtotal = baseCalc.base_price + vehiclesCalc.vehicles_price + addonsCalc.addons_price;

  // 6. Applique les réductions et frais
  const finalPrice = subtotal - totalDiscounts + totalFees;

  return { pricing, breakdown };
}
```

### 2. Template PDF (quoteDetailedTemplate.js)

Le template affichait déjà correctement les calculs individuels:

**Pour les véhicules (ligne 498):**
```javascript
const subtotal = pricePerDay * duration * quantity;
```

**Pour les add-ons (ligne 543):**
```javascript
const subtotal = isPerPerson ? (unitPrice * totalParticipants) : (unitPrice * quantity);
```

**Le problème était que le total utilisé dans le résumé (`pricing.vehiclesTotal`) était incorrect car calculé sans la durée.**

## Impact de la Correction

### Avant la Correction
```
Exemple: Tour de 5 jours avec 2 véhicules à ₹3,000/jour

❌ Calcul Incorrect:
Prix Véhicules = ₹3,000 × 2 = ₹6,000

Total Devis: ₹56,000
├─ Tier: ₹40,000
├─ Véhicules: ₹6,000 (SOUS-ÉVALUÉ)
└─ Add-ons: ₹10,000
```

### Après la Correction
```
Exemple: Tour de 5 jours avec 2 véhicules à ₹3,000/jour

✅ Calcul Correct:
Prix Véhicules = ₹3,000 × 5 jours × 2 véhicules = ₹30,000

Total Devis: ₹80,000
├─ Tier: ₹40,000
├─ Véhicules: ₹30,000 (CORRECT)
└─ Add-ons: ₹10,000
```

**Différence: ₹24,000** (prix des véhicules sous-évalué de 400%)

## Fichiers Modifiés

1. **`backend/src/services/quotePricingService.js`** (Lignes 85-103)
   - Ajout de la multiplication par `durationDays`
   - Renommage de `basePrice` en `pricePerDay` pour clarté
   - Ajout de `price_per_day` et `duration_days` dans le breakdown

## Fichiers Analysés (Pas de Modification Nécessaire)

1. **`backend/src/services/pdfGenerationService.js`**
   - Le template recevait les bonnes données
   - Le formatage était correct

2. **`backend/src/templates/quoteDetailedTemplate.js`**
   - Les calculs individuels étaient déjà corrects
   - L'affichage détaillé des formules était bon
   - Le problème était dans les totaux fournis par le service

## Tests à Effectuer

### Test 1: Devis avec Véhicules
1. Créer une réservation pour un tour de 5 jours
2. Ajouter 2 véhicules à ₹3,000/jour
3. Générer le devis PDF
4. Vérifier que le total véhicules = ₹30,000 (₹3,000 × 5 × 2)

### Test 2: Devis avec Add-ons Per Person
1. Créer une réservation pour 4 participants
2. Ajouter un add-on "per person" à ₹2,000
3. Générer le devis PDF
4. Vérifier que le total add-on = ₹8,000 (₹2,000 × 4)

### Test 3: Devis Complet
1. Créer une réservation complète avec:
   - Tour de 7 jours
   - 5 participants (4 adultes + 1 enfant)
   - 3 véhicules à ₹2,500/jour
   - 2 add-ons per person à ₹1,500
   - 1 add-on fixed à ₹5,000
2. Générer le devis PDF
3. Vérifier tous les calculs:
   - Véhicules: ₹2,500 × 7 × 3 = ₹52,500
   - Add-on per person: ₹1,500 × 5 × 2 = ₹15,000
   - Add-on fixed: ₹5,000 × 1 = ₹5,000
   - Total add-ons: ₹20,000

## Commande de Test SQL

```sql
-- Vérifier un devis existant
SELECT
  b.booking_reference,
  t.name as tour_name,
  t.duration_days,
  b.num_adults + b.num_children as total_participants,
  bqr.vehicles_price,
  bqr.addons_price,
  bqr.final_price
FROM booking_quote_revisions bqr
JOIN bookings b ON bqr.booking_id = b.id
JOIN tours t ON b.tour_id = t.id
WHERE bqr.id = <revision_id>;
```

## Régénération des Devis Existants

⚠️ **IMPORTANT:** Les devis qui ont déjà été générés avec l'ancien calcul auront des prix incorrects. Il faudra:

1. **Option 1 - Régénération Automatique:**
   - Créer un script de migration pour recalculer tous les devis existants
   - Mettre à jour la table `booking_quote_revisions`

2. **Option 2 - Régénération Manuelle:**
   - L'admin doit ouvrir chaque devis dans l'interface de review
   - Cliquer sur "Recalculate Prices" pour appliquer le nouveau calcul
   - Renvoyer le devis au client

3. **Option 3 - Notification:**
   - Ajouter un warning dans l'interface admin pour les devis créés avant cette date
   - Proposer un bouton "Recalculate with Fixed Formula"

## Statut
✅ **CORRIGÉ** - Les véhicules sont maintenant multipliés par la durée du tour et les add-ons par le nombre de participants (si applicable).

## Date de Correction
2025-01-12
