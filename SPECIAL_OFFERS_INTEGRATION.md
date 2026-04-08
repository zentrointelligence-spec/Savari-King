# 🎁 INTÉGRATION AUTOMATIQUE DES OFFRES SPÉCIALES DANS LE SYSTÈME DE DEVIS

**Date:** 22 Octobre 2025
**Version:** 1.0
**Projet:** Ebooking App - Ebenezer Tours & Travels

---

## 🎯 OBJECTIF

Intégrer automatiquement les **offres spéciales (special offers)** dans le processus de révision et création de devis par l'administrateur, permettant d'appliquer automatiquement les meilleures réductions disponibles pour optimiser les prix pour les clients.

---

## ✅ FONCTIONNALITÉS IMPLÉMENTÉES

### 1. **Service de Gestion des Offres Spéciales** (`specialOffersService.js`)

#### **Fonctions principales:**

| Fonction | Description |
|----------|-------------|
| `getActiveOffers()` | Récupère toutes les offres actives et valides |
| `findApplicableOffers(bookingData)` | Trouve les offres applicables pour une réservation spécifique |
| `calculateBestOfferStrategy(offers, amount, strategy)` | Calcule la meilleure stratégie (simple ou cumulative) |
| `applyOffersToRevision(bookingId, revisionId, offers)` | Applique les offres sélectionnées à une révision |
| `getOfferRecommendations(bookingData)` | Génère des recommandations d'offres avec plusieurs stratégies |

#### **Types d'offres supportés:**

1. **`percentage`** - Réduction en pourcentage (ex: 25% de réduction)
2. **`fixed_amount`** - Montant fixe de réduction (ex: ₹5000 de réduction)
3. **`early_bird`** - Réservation anticipée (≥30 jours avant le voyage)
4. **`last_minute`** - Dernière minute (5-7 jours avant le voyage)
5. **`seasonal`** - Offres saisonnières (ex: mousson juin-septembre)

#### **Logique d'application:**

```javascript
// Exemple: Early Bird
if (daysBeforeTravel >= 30) {
  discountPercentage = 15%;
  discountAmount = (totalAmount * 15) / 100;
}

// Exemple: Seasonal (Monsoon)
if (travelMonth >= 6 && travelMonth <= 9) {
  discountPercentage = 20%;
  discountAmount = (totalAmount * 20) / 100;
}
```

#### **Stratégies de sélection:**

**1. Best Single (Meilleure offre unique)**
- Sélectionne l'offre avec la plus grande réduction
- Recommandée pour la plupart des cas

**2. Cumulative (Offres cumulatives)**
- Combine jusqu'à 3 offres
- Maximum 40% de réduction cumulée
- Utile pour maximiser les économies

---

### 2. **Contrôleur des Offres Spéciales** (`specialOffersController.js`)

#### **Endpoints API:**

| Méthode | Route | Description |
|---------|-------|-------------|
| `GET` | `/api/bookings/:bookingId/review/:revisionId/applicable-offers` | Récupère les offres applicables |
| `POST` | `/api/bookings/:bookingId/review/:revisionId/apply-offers` | Applique les offres sélectionnées manuellement |
| `POST` | `/api/bookings/:bookingId/review/:revisionId/auto-apply-offers` | Applique automatiquement les meilleures offres |
| `DELETE` | `/api/bookings/:bookingId/review/:revisionId/applied-offers` | Supprime les offres appliquées |

#### **Exemple de réponse - Offres applicables:**

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
        "discountAmount": 3750,
        "discountPercentage": 25,
        "applicableReason": "Early bird - booked 45 days in advance",
        "isFeatured": true
      },
      {
        "offerId": 3,
        "offerTitle": "Monsoon Magic Special",
        "offerType": "seasonal",
        "discountAmount": 3000,
        "discountPercentage": 20,
        "applicableReason": "Seasonal offer - Monsoon season"
      }
    ],
    "strategies": {
      "bestSingle": {
        "selectedOffers": [...],
        "totalDiscount": 3750,
        "finalAmount": 11250,
        "discountPercentage": 25
      },
      "cumulative": {
        "selectedOffers": [...],
        "totalDiscount": 6000,
        "finalAmount": 9000,
        "discountPercentage": 40
      }
    },
    "recommended": "cumulative"
  }
}
```

---

### 3. **Migration Base de Données**

#### **Colonne ajoutée: `applied_offers`**

```sql
-- Table: booking_quote_revisions
ALTER TABLE booking_quote_revisions
ADD COLUMN applied_offers JSONB DEFAULT '[]'::jsonb;

-- Table: bookings
ALTER TABLE bookings
ADD COLUMN applied_offers JSONB DEFAULT '[]'::jsonb;

-- Index GIN pour recherche performante
CREATE INDEX idx_quote_revisions_applied_offers
ON booking_quote_revisions USING gin(applied_offers);
```

#### **Structure JSON de `applied_offers`:**

```json
[
  {
    "offer_id": 1,
    "offer_title": "Early Bird Special - 25% Off",
    "offer_type": "early_bird",
    "discount_amount": 3750,
    "discount_percentage": 25,
    "reason": "Early bird - booked 45 days in advance"
  }
]
```

---

### 4. **Composant Frontend** (`SpecialOffersPanel.jsx`)

#### **Fonctionnalités:**

✅ **Affichage automatique** des offres applicables lors de la révision de devis
✅ **Sélection manuelle** d'offres par l'admin
✅ **Application automatique** de la meilleure stratégie
✅ **Prévisualisation** des prix avec les offres appliquées
✅ **Badges visuels** pour identifier les types d'offres
✅ **Détails des conditions** pour chaque offre

#### **Interface Utilisateur:**

```
┌────────────────────────────────────────────────────┐
│ ✨ Special Offers Available        [3 offers]     │
├────────────────────────────────────────────────────┤
│                                                    │
│ 📉 Recommended: Cumulative Offers                 │
│ Combine multiple offers for optimum savings       │
│                                                    │
│ ₹6,000  (40% off)         [Auto-Apply Best] ───┐  │
│                                                 │  │
├─────────────────────────────────────────────────┤  │
│                                                 │  │
│ Available Offers (3)                            │  │
│                                                 │  │
│ ☑ Early Bird Special - 25% Off        -₹3,750  │  │
│   📊 percentage | ⭐ Featured                   │  │
│   Early bird - booked 45 days in advance       │  │
│                                                 │  │
│ ☑ Monsoon Magic Special              -₹3,000   │  │
│   🌤️ seasonal                                   │  │
│   Seasonal offer - Monsoon season              │  │
│                                                 │  │
│ ☐ Weekend Flash Offer                -₹2,000   │  │
│   💰 fixed_amount                               │  │
│   Weekend special discount                     │  │
│                                                 │  │
├─────────────────────────────────────────────────┤  │
│                                                 │  │
│ ✅ 2 offers selected                            │  │
│ Total discount: ₹6,750                          │  │
│                       [Apply Selected (2)] ────┘  │
│                                                    │
├────────────────────────────────────────────────────┤
│ Current Final Price:              ₹15,000         │
│ Total Discount:                   -₹6,750         │
│ ─────────────────────────────────────────────     │
│ New Final Price:                  ₹8,250          │
└────────────────────────────────────────────────────┘
```

---

## 🔄 WORKFLOW D'UTILISATION

### **Scénario 1: Application Automatique (Recommandé)**

```
1. Admin démarre la révision du devis
   ↓
2. Le panneau "Special Offers" apparaît automatiquement
   ↓
3. Le système affiche les offres applicables
   ↓
4. Admin clique sur "Auto-Apply Best"
   ↓
5. Les meilleures offres sont appliquées automatiquement
   ↓
6. Le prix final est recalculé
   ↓
7. Les offres sont enregistrées dans la révision
```

### **Scénario 2: Sélection Manuelle**

```
1. Admin consulte la liste des offres disponibles
   ↓
2. Admin sélectionne manuellement les offres désirées (clic sur les cases)
   ↓
3. Le système affiche la prévisualisation du prix
   ↓
4. Admin clique sur "Apply Selected (X)"
   ↓
5. Les offres sont appliquées à la révision
   ↓
6. Le prix est mis à jour
```

---

## 📊 CALCULS ET LOGIQUE

### **Exemple de Calcul Complet:**

```javascript
// Données de base
const tourBasePrice = 15000;  // Prix du tier
const vehiclesPrice = 5000;   // Prix des véhicules
const addonsPrice = 3000;     // Prix des addons
const subtotal = 23000;       // Sous-total

// Offres applicables
const earlyBirdOffer = {
  type: 'percentage',
  percentage: 25,
  amount: 23000 * 0.25 = 5750
};

const seasonalOffer = {
  type: 'percentage',
  percentage: 20,
  amount: 23000 * 0.20 = 4600
};

// Stratégie: Best Single
const bestSingleDiscount = 5750;  // Early bird (plus élevé)
const finalPrice = 23000 - 5750 = 17250;

// Stratégie: Cumulative (max 40%)
const cumulativeDiscount = Math.min(5750 + 4600, 23000 * 0.40);
// = Math.min(10350, 9200) = 9200
const finalPriceCumulative = 23000 - 9200 = 13800;

// Recommandation: Cumulative (économie de 9200 > 5750)
```

### **Règles de Validation:**

✅ **Usage Limit** - Vérification du nombre d'utilisations maximum
✅ **User Usage Limit** - Vérification du nombre d'utilisations par utilisateur
✅ **Minimum Booking Amount** - Montant minimum de réservation requis
✅ **Date Validity** - Vérification de la période de validité
✅ **Max Discount Amount** - Plafond de réduction pour les offres en pourcentage

---

## 🎨 INTÉGRATION DANS L'INTERFACE ADMIN

### **Fichier à modifier:** `AdminQuoteReviewPage.jsx`

```jsx
import SpecialOffersPanel from '../components/admin/quoteReview/SpecialOffersPanel';

// Dans le composant AdminQuoteReviewPage
const [revisionData, setRevisionData] = useState(null);

const handleOffersApplied = (appliedData) => {
  // Mettre à jour le prix final
  setRevisionData(prev => ({
    ...prev,
    final_price: appliedData.newFinalPrice,
    applied_offers: appliedData.appliedOffers,
    total_discounts: appliedData.totalDiscount
  }));

  // Rafraîchir les données de la révision
  fetchRevisionData();
};

return (
  <div>
    {/* Autres sections */}

    {/* Panneau des offres spéciales */}
    <SpecialOffersPanel
      bookingId={bookingId}
      revisionId={revisionId}
      currentFinalPrice={revisionData?.final_price || 0}
      onOffersApplied={handleOffersApplied}
    />

    {/* Suite du formulaire */}
  </div>
);
```

---

## 📄 AFFICHAGE DANS LES PDFs

### **Section à ajouter dans les templates PDF:**

```javascript
// Dans quotePdfTemplate.js

// Section des offres spéciales appliquées
if (revision.applied_offers && revision.applied_offers.length > 0) {
  html += `
    <div style="margin-top: 20px; padding: 15px; background-color: #f0f9ff; border-left: 4px solid #3b82f6;">
      <h3 style="color: #1e40af; margin-bottom: 10px;">✨ Special Offers Applied</h3>
      <table style="width: 100%; font-size: 14px;">
        <thead>
          <tr style="border-bottom: 2px solid #bfdbfe;">
            <th style="text-align: left; padding: 8px;">Offer</th>
            <th style="text-align: center; padding: 8px;">Type</th>
            <th style="text-align: right; padding: 8px;">Discount</th>
          </tr>
        </thead>
        <tbody>
  `;

  revision.applied_offers.forEach(offer => {
    html += `
      <tr>
        <td style="padding: 8px;">${offer.offer_title}</td>
        <td style="text-align: center; padding: 8px;">${offer.offer_type}</td>
        <td style="text-align: right; padding: 8px; color: #059669; font-weight: bold;">
          -₹${offer.discount_amount.toLocaleString()} (${offer.discount_percentage}%)
        </td>
      </tr>
      <tr>
        <td colspan="3" style="padding: 4px 8px; font-size: 12px; color: #6b7280;">
          ${offer.reason}
        </td>
      </tr>
    `;
  });

  html += `
        </tbody>
      </table>
    </div>
  `;
}
```

---

## 🧪 TESTS RECOMMANDÉS

### **Test 1: Application Automatique**

```bash
# Créer une réservation avec un voyage dans 45 jours
POST /api/bookings
{
  "travel_date": "2025-12-08",
  "tour_id": 1,
  "number_of_persons": 4
}

# Démarrer la révision
POST /api/bookings/1/review/start

# Récupérer les offres applicables
GET /api/bookings/1/review/1/applicable-offers

# Vérifier que Early Bird apparaît
# Appliquer automatiquement
POST /api/bookings/1/review/1/auto-apply-offers
{
  "strategy": "best_single"
}

# Vérifier le prix final réduit
```

### **Test 2: Offres Saisonnières**

```bash
# Créer réservation pour juillet (mousson)
travel_date: "2025-07-15"

# Vérifier que "Monsoon Magic Special" apparaît dans les offres
```

### **Test 3: Cumul d'Offres**

```bash
# Réservation early bird + seasonal
travel_date: "2025-08-20"  (dans 45+ jours ET saison mousson)

# Vérifier que les 2 offres sont applicables
# Tester stratégie cumulative
POST .../auto-apply-offers
{
  "strategy": "cumulative"
}

# Vérifier que total_discounts = somme des deux offres (max 40%)
```

---

## 📝 NOTES IMPORTANTES

### **Incrémentation du Compteur d'Utilisation**

- Le compteur `usage_count` est incrémenté **uniquement lors de l'application finale**
- Si admin retire les offres puis les réapplique, le compteur est ajusté automatiquement

### **Gestion des Limites**

```sql
-- Exemple: Offre limitée à 100 utilisations
UPDATE special_offers
SET usage_limit = 100
WHERE id = 1;

-- Vérification automatique avant application
WHERE usage_count < usage_limit
```

### **Restrictions Par Utilisateur**

```sql
-- Exemple: 1 utilisation max par utilisateur
UPDATE special_offers
SET usage_limit_per_user = 1
WHERE id = 1;

-- Le système vérifie automatiquement l'historique
```

---

## 🚀 PROCHAINES ÉTAPES

### **Phase 1: Tests** ✅ CURRENT
- [ ] Tester avec différentes combinaisons d'offres
- [ ] Vérifier les calculs de prix
- [ ] Tester les limites d'utilisation

### **Phase 2: PDF Generation** 📄 PENDING
- [ ] Intégrer les offres dans les templates PDF
- [ ] Afficher les détails des offres appliquées
- [ ] Tester la génération de PDFs

### **Phase 3: Notifications** 📧 PENDING
- [ ] Mentionner les offres dans les emails de devis
- [ ] Ajouter un résumé des économies réalisées

### **Phase 4: Analytics** 📊 FUTURE
- [ ] Tracker l'utilisation des offres
- [ ] Rapport sur les offres les plus populaires
- [ ] ROI des campagnes promotionnelles

---

## 📚 RESSOURCES

### **Fichiers Créés:**

1. **Backend:**
   - `/backend/src/services/specialOffersService.js`
   - `/backend/src/controllers/specialOffersController.js`
   - `/backend/src/routes/specialOffersRoutes.js`
   - `/backend/src/db/migrations/add_applied_offers_to_revisions.sql`

2. **Frontend:**
   - `/frontend/src/components/admin/quoteReview/SpecialOffersPanel.jsx`

### **Fichiers Modifiés:**

1. `/backend/src/routes/index.js` - Ajout des routes special offers

### **Documentation:**

1. Ce fichier: `SPECIAL_OFFERS_INTEGRATION.md`

---

**Document créé le:** 22 Octobre 2025
**Dernière mise à jour:** 22 Octobre 2025
**Version:** 1.0
**Auteur:** Claude Code + Sam (Product Owner)
