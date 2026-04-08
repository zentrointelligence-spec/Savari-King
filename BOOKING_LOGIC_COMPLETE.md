# LOGIQUE COMPLÈTE DE RÉSERVATION - EBENEZER TOURS

**Version:** 2.0
**Dernière mise à jour:** 2025-10-09
**Changements:** Nouvelle UX avec sticky sidebar et sélecteur de tier intégré

---

## 📍 Point de départ : TourDetailPage.jsx

### **NOUVEAU FLOW (Version 2.0)**

Au lieu de rediriger vers `/book/${tier.tour_id}?tier=${tier.id}`, le bouton principal redirige simplement vers `/book/${tour.id}` sans paramètre tier.

**Changement TourDetailPage:**
```jsx
// AVANT (v1.0):
<Link to={`/book/${tier.tour_id}?tier=${tier.id}`}>
  Sélectionner le forfait
</Link>

// APRÈS (v2.0):
<Link to={`/book/${tour.id}`} className="primary-button">
  Réserver Maintenant
</Link>
```

**Avantages:**
- ✅ Un seul bouton d'action principal sur TourDetailPage
- ✅ Sélection de tier directement dans BookingPage
- ✅ Changement de tier sans quitter la page
- ✅ UX plus fluide et moderne

---

## PHASE 1 : PAGE DE RÉSERVATION (/book/:tourId)

### A. Structure de la page (NOUVEAU DESIGN)

**Layout Desktop (Grid 2/3 - 1/3):**

```
┌──────────────────────────────────────────────────────────────────────────┐
│                    RÉSERVATION - Kerala Beach Paradise                   │
├─────────────────────────────────────────┬────────────────────────────────┤
│ FORMULAIRE PRINCIPAL (Scroll)           │ SIDEBAR STICKY (Toujours      │
│ (2/3 width)                              │ visible) (1/3 width)          │
│                                          │                                │
│ ┌─────────────────────────────────────┐ │ ┌──────────────────────────┐ │
│ │ SECTION 1: CHOISIR VOTRE PACKAGE   │ │ │ 📦 VOTRE RÉSERVATION     │ │
│ │                                     │ │ │                          │ │
│ │ [Tabs/Cards interactives]          │ │ │ [Tour Image]             │ │
│ │ ┌────────┐ ┌────────┐ ┌────────┐  │ │ │ Kerala Beach Paradise    │ │
│ │ │ STD    │ │ PRM ⭐ │ │ LUX    │  │ │ │                          │ │
│ │ │ ₹19.5k │ │ ₹30k   │ │ ₹45k   │  │ │ │ Package: Premium         │ │
│ │ │ 3-Star │ │ 4-Star │ │ 5-Star │  │ │ │ 4-Star Resort            │ │
│ │ └────────┘ └────────┘ └────────┘  │ │ │ Private guide            │ │
│ │     ○          ●          ○        │ │ │                          │ │
│ │   Click      Selected    Click    │ │ │ ────────────────────     │ │
│ │                                     │ │ │                          │ │
│ │ [Détails du package sélectionné]   │ │ │ 📅 15 Jan 2025          │ │
│ │ • 4-Star Resort                    │ │ │ 👥 2 adultes, 1 enfant  │ │
│ │ • Private AC vehicle               │ │ │                          │ │
│ │ • All meals included               │ │ │ 💰 PRIX                 │ │
│ │ • English-speaking guide           │ │ │ Package: ₹30,000         │ │
│ └─────────────────────────────────────┘ │ │ Add-ons: ₹3,000          │ │
│                                          │ │ ───────────────          │ │
│ ┌─────────────────────────────────────┐ │ │ TOTAL: ₹33,000           │ │
│ │ SECTION 2: DATE & PARTICIPANTS     │ │ │                          │ │
│ │                                     │ │ │ 💡 Prix estimé          │ │
│ │ 📅 Date de voyage                  │ │ │ Final confirmé sous      │ │
│ │ [Calendar Picker] (min: +5 jours)  │ │ │ 30 minutes               │ │
│ │                                     │ │ │                          │ │
│ │ 👥 Participants                    │ │ │ [SOUMETTRE DEMANDE]      │ │
│ │ Adultes: [2 ▼] Enfants: [1 ▼]     │ │ │                          │ │
│ └─────────────────────────────────────┘ │ │ [Comparer packages]      │ │
│                                          │ └──────────────────────────┘ │
│ ┌─────────────────────────────────────┐ │                              │
│ │ SECTION 3: ADD-ONS (Optionnel)     │ │                              │
│ │                                     │ │                              │
│ │ ☑ Candlelight Dinner (+₹2,500)    │ │                              │
│ │ ☑ Ayurvedic Spa (+₹3,000)         │ │                              │
│ │ ☐ Private Photography (+₹5,000)    │ │                              │
│ │ ☐ Sunset Cruise (+₹4,000)         │ │                              │
│ └─────────────────────────────────────┘ │                              │
│                                          │                              │
│ ┌─────────────────────────────────────┐ │                              │
│ │ SECTION 4: VÉHICULES (Optionnel)   │ │                              │
│ │                                     │ │                              │
│ │ ☐ 7 Seater SUV (+₹3,000/jour)     │ │                              │
│ │   Quantité: [1 ▼]                  │ │                              │
│ │ ☐ Luxury Sedan (+₹5,000/jour)     │ │                              │
│ │   Quantité: [1 ▼]                  │ │                              │
│ └─────────────────────────────────────┘ │                              │
│                                          │                              │
│ ┌─────────────────────────────────────┐ │                              │
│ │ SECTION 5: INFORMATIONS CONTACT    │ │                              │
│ │                                     │ │                              │
│ │ Si connecté: pré-rempli            │ │                              │
│ │ Si non connecté:                   │ │                              │
│ │                                     │ │                              │
│ │ Nom complet: [____________] *      │ │                              │
│ │ Email: [____________] *            │ │                              │
│ │ Téléphone: [____________] *        │ │                              │
│ │ Demandes spéciales: [_______]      │ │                              │
│ │                                     │ │                              │
│ │ ☑ J'accepte les conditions         │ │                              │
│ └─────────────────────────────────────┘ │                              │
│                                          │                              │
└─────────────────────────────────────────┴────────────────────────────────┘
```

**Layout Mobile (Stack + Bottom Bar):**

```
┌──────────────────────────┐
│  RÉSERVATION             │
├──────────────────────────┤
│ SECTION 1: PACKAGE       │
│                          │
│ [Swipeable Cards]        │
│ ┌────────────────────┐   │
│ │ ← PREMIUM ⭐ →     │   │
│ │                    │   │
│ │ ₹30,000            │   │
│ │ 4-Star Resort      │   │
│ │ Private guide      │   │
│ │ All meals          │   │
│ │                    │   │
│ │ [Détails complets] │   │
│ └────────────────────┘   │
│  • • ●  (pagination)     │
│                          │
│ ─────────────────────    │
│                          │
│ SECTION 2: DATE          │
│ 📅 [15 Jan 2025]         │
│ 👥 2 adultes, 1 enfant   │
│                          │
│ SECTION 3: ADD-ONS       │
│ ☑ Spa (+₹3,000)         │
│ ☐ Photo (+₹5,000)       │
│                          │
│ SECTION 4: CONTACT       │
│ [Formulaire...]          │
│                          │
│ [Bottom Padding]         │
│                          │
│ ▼ Scroll jusqu'en bas   │
└──────────────────────────┘
│ BOTTOM STICKY BAR        │
│ ₹33,000 [RÉSERVER]       │
└──────────────────────────┘
```

---

### B. Fonctionnalités Clés de la Sidebar

**1. Mise à jour en temps réel:**
```javascript
// Recalcul automatique du prix à chaque changement
useEffect(() => {
  const newPrice = calculateTotalPrice({
    tier: selectedTier,
    addons: selectedAddons,
    vehicles: selectedVehicles,
    numAdults: formData.num_adults,
    numChildren: formData.num_children,
    duration: tour.duration_days
  });

  setCalculatedPrice(newPrice);
}, [selectedTier, selectedAddons, selectedVehicles, formData]);
```

**2. Changement de tier instantané:**
- Clic sur un tier → Sidebar se met à jour
- Prix recalculé automatiquement
- Détails du tier affichés
- Aucun rechargement de page

**3. Validation avant soumission:**
- Date de voyage renseignée ✓
- Minimum 1 adulte ✓
- Contact rempli ✓
- Conditions acceptées ✓
- Bouton activé seulement si tout est valide

---

### C. Composants React à Créer

#### **1. TierSelector Component**

**Fichier:** `frontend/src/components/booking/TierSelector.jsx`

**Props:**
- `tiers`: Array des tiers disponibles
- `selectedTier`: Tier actuellement sélectionné
- `onTierChange`: Callback de changement
- `compact`: Mode d'affichage (true = cards compactes)

**Fonctionnalités:**
- Affichage en tabs/cards pour desktop
- Dropdown pour mobile
- Badge "⭐ Le Plus Populaire" sur Premium
- Animation de transition lors du changement
- Détails expandables pour chaque tier

---

#### **2. BookingSidebar Component**

**Fichier:** `frontend/src/components/booking/BookingSidebar.jsx`

**Props:**
- `tour`: Données du tour
- `selectedTier`: Tier sélectionné
- `formData`: Données du formulaire
- `calculatedPrice`: Prix calculé en temps réel
- `onSubmit`: Callback de soumission
- `isFormValid`: Boolean de validation

**Fonctionnalités:**
- Position `sticky top-24` (reste visible au scroll)
- Image et nom du tour
- Détails du package sélectionné
- Résumé des sélections (date, participants)
- Breakdown du prix en temps réel
- Bouton de soumission (désactivé si invalide)
- Lien "Comparer les packages" (modal)

---

#### **3. TravelDetailsForm Component**

**Fichier:** `frontend/src/components/booking/TravelDetailsForm.jsx`

**Champs:**
- Date Picker (react-datepicker) avec validation min +5 jours
- Nombre d'adultes (1-20)
- Nombre d'enfants (0-10)

---

#### **4. AddonsSelector Component**

**Fichier:** `frontend/src/components/booking/AddonsSelector.jsx`

**Fonctionnalités:**
- Cards pour chaque addon
- Checkbox de sélection
- Prix affiché
- Description/features
- Icons pour chaque type d'addon

---

#### **5. VehiclesSelector Component**

**Fichier:** `frontend/src/components/booking/VehiclesSelector.jsx`

**Fonctionnalités:**
- Liste des véhicules disponibles
- Checkbox + sélecteur de quantité
- Calcul automatique (prix/jour × durée × quantité)

---

#### **6. ContactForm Component**

**Fichier:** `frontend/src/components/booking/ContactForm.jsx`

**Champs:**
- Nom complet (required)
- Email (required, validation format)
- Téléphone (required, validation format)
- Demandes spéciales (textarea, optionnel)
- Checkbox acceptation conditions (required)

---

#### **7. ComparePackagesModal Component**

**Fichier:** `frontend/src/components/booking/ComparePackagesModal.jsx`

**Fonctionnalités:**
- Modal full-screen ou large
- Tableau de comparaison côte-à-côte
- Standard | Premium | Luxury
- Prix, hôtel, inclusions, etc.
- Bouton "Sélectionner" pour chaque tier

---

### D. Page BookingPage Complète

**Fichier:** `frontend/src/pages/BookingPage.jsx`

**Structure:**
```jsx
const BookingPage = () => {
  // State management
  const [tour, setTour] = useState(null);
  const [selectedTier, setSelectedTier] = useState(null);
  const [formData, setFormData] = useState(initialFormData);
  const [calculatedPrice, setCalculatedPrice] = useState({ total: 0, breakdown: {} });
  const [compareModalOpen, setCompareModalOpen] = useState(false);

  // Fetch tour data
  useEffect(() => {
    fetchTourWithTiers(tourId).then(data => {
      setTour(data);
      // Définir Premium comme défaut (ou le premier tier)
      const defaultTier = data.tiers.find(t => t.tier_name === 'Premium') || data.tiers[0];
      setSelectedTier(defaultTier);
    });
  }, [tourId]);

  // Price calculation in real-time
  useEffect(() => {
    const price = calculateTotalPrice({...});
    setCalculatedPrice(price);
  }, [selectedTier, formData]);

  // Form submission
  const handleSubmit = async () => {
    if (!validateForm(formData)) return;

    try {
      const bookingData = {
        tour_id: tour.id,
        tier_id: selectedTier.id,
        travel_date: formData.travel_date,
        num_adults: formData.num_adults,
        num_children: formData.num_children,
        selected_addons: formData.selected_addons,
        selected_vehicles: formData.selected_vehicles,
        estimated_price: calculatedPrice.total,
        contact_name: formData.contact_name,
        contact_email: formData.contact_email,
        contact_phone: formData.contact_phone,
        special_requests: formData.special_requests
      };

      const response = await axios.post('/api/bookings', bookingData);

      // Redirect to My Bookings
      navigate(`/my-bookings?new=${response.data.booking_reference}`);
      toast.success('Demande de réservation envoyée avec succès!');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erreur lors de la soumission');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">
        Réserver: {tour?.name}
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Form - 2/3 width */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section 1: Tier Selection */}
          <section className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4">1. Choisissez Votre Package</h2>
            <TierSelector
              tiers={tour?.tiers || []}
              selectedTier={selectedTier}
              onTierChange={setSelectedTier}
            />
          </section>

          {/* Section 2: Travel Details */}
          <section className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4">2. Détails du Voyage</h2>
            <TravelDetailsForm
              formData={formData}
              onChange={(updates) => setFormData({ ...formData, ...updates })}
            />
          </section>

          {/* Section 3: Add-ons */}
          <section className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4">3. Add-ons Optionnels</h2>
            <AddonsSelector
              addons={tour?.addons || []}
              selected={formData.selected_addons}
              onChange={(addons) => setFormData({ ...formData, selected_addons: addons })}
            />
          </section>

          {/* Section 4: Vehicles */}
          <section className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4">4. Véhicules Additionnels</h2>
            <VehiclesSelector
              vehicles={tour?.vehicles || []}
              selected={formData.selected_vehicles}
              duration={tour?.duration_days}
              onChange={(vehicles) => setFormData({ ...formData, selected_vehicles: vehicles })}
            />
          </section>

          {/* Section 5: Contact */}
          <section className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4">5. Informations de Contact</h2>
            <ContactForm
              formData={formData}
              onChange={(updates) => setFormData({ ...formData, ...updates })}
              user={user} // Pre-fill if logged in
            />
          </section>
        </div>

        {/* Sidebar - 1/3 width - STICKY */}
        <div className="lg:col-span-1">
          <BookingSidebar
            tour={tour}
            selectedTier={selectedTier}
            formData={formData}
            calculatedPrice={calculatedPrice}
            onSubmit={handleSubmit}
            isFormValid={validateForm(formData)}
            onCompare={() => setCompareModalOpen(true)}
          />
        </div>
      </div>

      {/* Compare Modal */}
      <ComparePackagesModal
        isOpen={compareModalOpen}
        onClose={() => setCompareModalOpen(false)}
        tiers={tour?.tiers || []}
        selectedTier={selectedTier}
        onSelect={(tier) => {
          setSelectedTier(tier);
          setCompareModalOpen(false);
        }}
      />
    </div>
  );
};
```

---

## PHASE 2 : CYCLE DE VIE DE LA RÉSERVATION

### Statut 1 : Inquiry Pending 🟡

**Déclencheur :** Utilisateur clique sur "Soumettre la demande" dans la sidebar

**Actions système :**

#### Frontend :
1. Validation complète du formulaire
2. Vérification que `travel_date >= today + 5 days`
3. Affichage d'un loader pendant la soumission
4. Envoi POST `/api/bookings` avec toutes les données

#### Backend :
1. Double validation de `travel_date >= today + 5 days`
2. Validation de l'existence de `tour_id` et `tier_id`
3. Création d'une entrée dans `bookings` :
   ```sql
   INSERT INTO bookings (
     user_id, tour_id, tier_id, travel_date,
     num_adults, num_children,
     selected_addons, selected_vehicles,
     estimated_price, currency,
     status, inquiry_date,
     contact_name, contact_email, contact_phone, special_requests
   ) VALUES (...)
   ```
4. Statut : `Inquiry Pending`
5. Génération d'un `booking_reference` unique (ex: EB-2025-001234)

**Emails automatiques :**
- ✉️ **À l'utilisateur :** "Demande reçue - Réponse sous 30 minutes"
- ✉️ **À l'admin :** "Nouvelle demande de réservation à traiter"

**Vue utilisateur (My Bookings) :**
```
┌──────────────────────────────────────────┐
│ 🟡 Demande envoyée                       │
│ Référence : EB-2025-001234               │
│ Notre équipe examine votre demande       │
│ Réponse attendue : sous 30 minutes       │
│                                           │
│ [Bouton] Annuler la demande              │
└──────────────────────────────────────────┘
```

---

### Statut 2 : Quote Sent 📧

**Déclencheur :** Admin valide et envoie le devis depuis le dashboard

**Actions admin (Dashboard) :**
1. Vérifier la disponibilité des hôtels/véhicules
2. Ajuster le prix si nécessaire (saisonnalité, demandes spéciales)
3. Saisir le prix final
4. Cliquer sur **"Finaliser & Envoyer le devis"**

**Actions système (Backend) :**
1. Mise à jour du statut : `Quote Sent`
2. Enregistrement du `final_price`
3. Génération de `quote_expiration_date = NOW() + 48 heures`
4. Envoi automatique de l'email de devis

**Emails automatiques :**
- ✉️ **À l'utilisateur :** "Votre devis est prêt ! Valable 48h"

**Vue utilisateur (My Bookings) :**
```
┌──────────────────────────────────────────┐
│ 📧 Devis reçu                            │
│ Référence : EB-2025-001234               │
│ Prix final : ₹45,000                     │
│ Valable jusqu'au : 15 Jan 2025, 14:30   │
│                                           │
│ [Bouton] Voir le devis & Payer           │
│ [Bouton] Annuler la demande              │
└──────────────────────────────────────────┘
```

**Page de détail du devis :**
- Breakdown complet des coûts
- Conditions du tour
- Politique d'annulation
- Bouton **"Procéder au paiement"**

---

### Statut 3 : Payment Confirmed ✅

**Déclencheur :** Paiement réussi via Stripe/Razorpay

**Actions système (Backend - Webhook) :**
1. Mise à jour du statut : `Payment Confirmed`
2. Enregistrement de `payment_transaction_id`
3. Enregistrement de `payment_timestamp = NOW()`
4. Calcul de `cancellation_deadline = payment_timestamp + 24 heures`

**Emails automatiques :**
- ✉️ **À l'utilisateur :** "Réservation confirmée ! Préparez-vous pour le voyage"
- ✉️ **À l'admin :** "Paiement reçu pour la réservation EB-2025-001234"

**Vue utilisateur (My Bookings) :**
```
┌──────────────────────────────────────────┐
│ ✅ Réservation confirmée                 │
│ Référence : EB-2025-001234               │
│ Date du voyage : 20 Jan 2025             │
│ Montant payé : ₹45,000                   │
│                                           │
│ 📄 [Télécharger la confirmation PDF]    │
│ 🗺️  [Voir l'itinéraire complet]        │
│                                           │
│ ⚠️ Annulation gratuite jusqu'au :       │
│    14 Jan 2025, 16:45                    │
│ [Bouton] Annuler la réservation          │
│ (actif si < 24h depuis le paiement)      │
└──────────────────────────────────────────┘
```

---

### Statut 4 : Cancelled ❌

**Cas A : Annulation AVANT paiement**
- Déclencheur : Utilisateur clique "Annuler la demande" (statut `Inquiry Pending` ou `Quote Sent`)
- Action : Mise à jour du statut à `Cancelled`
- Aucun remboursement nécessaire

**Cas B : Annulation APRÈS paiement**
- Déclencheur : Utilisateur clique "Annuler la réservation" (statut `Payment Confirmed`)
- Vérification : `NOW() < payment_timestamp + 24 heures` ?
  - ✅ **Si OUI :** Annulation acceptée
    - Statut → `Cancelled`
    - Initialiser le processus de remboursement
    - Email : "Annulation confirmée - Remboursement en cours"
  - ❌ **Si NON :** Annulation refusée
    - Message : "La période d'annulation gratuite (24h) est expirée. Contactez-nous pour assistance."

**Actions admin (pour remboursement) :**
- Dashboard affiche les réservations annulées nécessitant un remboursement
- Admin initie le remboursement via Stripe/Razorpay
- Marque le remboursement comme "Complété"

---

### Statut 5 : Trip Completed 🎉

**Déclencheur :** Admin marque manuellement comme complété après le voyage

**Actions système :**
1. Mise à jour du statut : `Trip Completed`
2. Email automatique : "Merci pour votre voyage ! Laissez-nous un avis"

**Vue utilisateur :**
```
┌──────────────────────────────────────────┐
│ 🎉 Voyage terminé                        │
│ Référence : EB-2025-001234               │
│                                           │
│ Comment s'est passé votre voyage ?       │
│ [Bouton] Laisser un avis ⭐⭐⭐⭐⭐      │
│                                           │
│ [Télécharger le reçu]                    │
└──────────────────────────────────────────┘
```

---

## PHASE 3 : VALIDATIONS & RÈGLES MÉTIER

### Validation des dates
```javascript
// Frontend (React)
const minDate = new Date();
minDate.setDate(minDate.getDate() + 5);

<DatePicker
  minDate={minDate}
  selected={travelDate}
  onChange={setTravelDate}
  disabled={pastDates}
/>

// Backend (Node.js)
const travelDate = new Date(req.body.travel_date);
const minDate = new Date();
minDate.setDate(minDate.getDate() + 5);

if (travelDate < minDate) {
  return res.status(400).json({
    error: "La date de voyage doit être au minimum 5 jours dans le futur"
  });
}
```

### Calcul du prix estimé (temps réel)
```javascript
// Frontend - useMemo hook pour performance
const calculatedPrice = useMemo(() => {
  let breakdown = {
    base: selectedTier?.price || 0,
    addons: 0,
    vehicles: 0,
    total: 0
  };

  // Base price
  breakdown.total = breakdown.base;

  // Add vehicles
  formData.selected_vehicles.forEach(vehicle => {
    const vehicleCost = vehicle.price_per_day * tour.duration_days * vehicle.quantity;
    breakdown.vehicles += vehicleCost;
    breakdown.total += vehicleCost;
  });

  // Add addons
  formData.selected_addons.forEach(addon => {
    breakdown.addons += addon.price;
    breakdown.total += addon.price;
  });

  return breakdown;
}, [selectedTier, formData.selected_addons, formData.selected_vehicles, tour.duration_days]);
```

### Expiration du devis (Backend - Cron Job)
```javascript
// Cron job qui tourne toutes les heures
// Marque les devis expirés
const cron = require('node-cron');

cron.schedule('0 * * * *', async () => {
  try {
    const result = await db.query(`
      UPDATE bookings
      SET status = 'Quote Expired'
      WHERE status = 'Quote Sent'
        AND quote_expiration_date < NOW()
      RETURNING id, booking_reference
    `);

    console.log(`${result.rowCount} devis expirés marqués`);

    // Optionnel: Envoyer un email "Votre devis a expiré"
    result.rows.forEach(booking => {
      sendQuoteExpiredEmail(booking);
    });
  } catch (error) {
    console.error('Erreur cron expiration devis:', error);
  }
});
```

### Vérification de la fenêtre d'annulation
```javascript
// Backend
const canCancelBooking = (booking) => {
  if (booking.status !== 'Payment Confirmed') return false;

  const now = new Date();
  const paymentTime = new Date(booking.payment_timestamp);
  const hoursSincePayment = (now - paymentTime) / (1000 * 60 * 60);

  return hoursSincePayment < 24;
};

// API endpoint
router.post('/bookings/:id/cancel', protect, async (req, res) => {
  try {
    const booking = await getBookingById(req.params.id);

    // Vérifier que c'est bien la réservation de l'utilisateur
    if (booking.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Non autorisé' });
    }

    if (!canCancelBooking(booking)) {
      return res.status(400).json({
        error: 'La fenêtre d\'annulation (24h) est expirée',
        canRefund: false
      });
    }

    // Annuler la réservation
    await db.query(`
      UPDATE bookings
      SET status = 'Cancelled', cancellation_date = NOW()
      WHERE id = $1
    `, [booking.id]);

    // Envoyer les emails
    await sendCancellationEmails(booking);

    res.json({
      message: 'Réservation annulée avec succès',
      refundStatus: 'pending',
      refundAmount: booking.final_price
    });
  } catch (error) {
    console.error('Erreur annulation:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});
```

---

## PHASE 4 : BASE DE DONNÉES

### Table `bookings` (schéma complet)
```sql
CREATE TABLE bookings (
  id SERIAL PRIMARY KEY,
  booking_reference VARCHAR(20) UNIQUE NOT NULL, -- EB-2025-001234
  user_id INTEGER REFERENCES users(id),
  tour_id INTEGER REFERENCES tours(id),
  tier_id INTEGER REFERENCES packagetiers(id),

  -- Détails du voyage
  travel_date DATE NOT NULL,
  num_adults INTEGER NOT NULL DEFAULT 1,
  num_children INTEGER DEFAULT 0,

  -- Sélections
  selected_addons JSONB, -- [{id: 1, name: "...", price: 2500}, ...]
  selected_vehicles JSONB, -- [{id: 1, name: "...", quantity: 2, price_per_day: 3000}, ...]

  -- Prix
  estimated_price DECIMAL(10,2),
  final_price DECIMAL(10,2),
  currency VARCHAR(3) DEFAULT 'INR',

  -- Statuts et dates
  status VARCHAR(50) DEFAULT 'Inquiry Pending',
  -- Statuts possibles:
  -- 'Inquiry Pending', 'Quote Sent', 'Quote Expired',
  -- 'Payment Confirmed', 'Cancelled', 'Trip Completed'

  inquiry_date TIMESTAMP DEFAULT NOW(),
  quote_sent_date TIMESTAMP,
  quote_expiration_date TIMESTAMP,
  payment_timestamp TIMESTAMP,
  cancellation_date TIMESTAMP,
  completion_date TIMESTAMP,

  -- Paiement
  payment_transaction_id VARCHAR(255),
  payment_method VARCHAR(50),

  -- Coordonnées de contact
  contact_name VARCHAR(255),
  contact_email VARCHAR(255),
  contact_phone VARCHAR(20),
  special_requests TEXT,

  -- Admin notes
  admin_notes TEXT,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Indexes recommandés
```sql
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_travel_date ON bookings(travel_date);
CREATE INDEX idx_bookings_reference ON bookings(booking_reference);
CREATE INDEX idx_bookings_quote_expiration ON bookings(quote_expiration_date) WHERE status = 'Quote Sent';
```

### Fonction pour générer booking_reference
```sql
CREATE OR REPLACE FUNCTION generate_booking_reference()
RETURNS TEXT AS $$
DECLARE
  ref TEXT;
  year TEXT;
  random_num TEXT;
BEGIN
  year := TO_CHAR(NOW(), 'YYYY');
  random_num := LPAD(FLOOR(RANDOM() * 999999 + 1)::TEXT, 6, '0');
  ref := 'EB-' || year || '-' || random_num;

  -- Vérifier l'unicité
  WHILE EXISTS (SELECT 1 FROM bookings WHERE booking_reference = ref) LOOP
    random_num := LPAD(FLOOR(RANDOM() * 999999 + 1)::TEXT, 6, '0');
    ref := 'EB-' || year || '-' || random_num;
  END LOOP;

  RETURN ref;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour auto-générer la référence
CREATE TRIGGER trg_generate_booking_ref
BEFORE INSERT ON bookings
FOR EACH ROW
WHEN (NEW.booking_reference IS NULL)
EXECUTE FUNCTION set_booking_reference();

CREATE OR REPLACE FUNCTION set_booking_reference()
RETURNS TRIGGER AS $$
BEGIN
  NEW.booking_reference := generate_booking_reference();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

---

## PHASE 5 : EMAILS AUTOMATIQUES

### Templates d'emails nécessaires

1. **Email_Inquiry_Received.html** (À l'utilisateur)
   - Confirmation de réception
   - Référence de réservation
   - Délai de réponse promis (30 min)

2. **Email_Inquiry_Alert.html** (À l'admin)
   - Notification de nouvelle demande
   - Détails de la demande
   - Lien direct vers le dashboard

3. **Email_Quote_Ready.html** (À l'utilisateur)
   - Devis détaillé
   - Date d'expiration (48h)
   - Lien vers la page de paiement

4. **Email_Payment_Confirmed.html** (À l'utilisateur)
   - Confirmation de paiement
   - Détails du voyage
   - PDF de confirmation en pièce jointe
   - Politique d'annulation (24h)

5. **Email_Payment_Alert.html** (À l'admin)
   - Notification de paiement reçu
   - Référence de transaction
   - Détails de la réservation

6. **Email_Cancellation_Confirmed.html**
   - Confirmation d'annulation
   - Statut du remboursement
   - Délai de remboursement

7. **Email_Trip_Review_Request.html**
   - Remerciement pour le voyage
   - Invitation à laisser un avis
   - Lien direct vers le formulaire d'avis

---

## PHASE 6 : DASHBOARD ADMIN

### Vue des réservations

**Filtres disponibles :**
- Par statut (Inquiry Pending, Quote Sent, Payment Confirmed, etc.)
- Par date de voyage
- Par date de demande
- Par tour
- Par montant

**Actions rapides :**
- Envoyer le devis
- Voir les détails
- Annuler la réservation
- Marquer comme complété
- Exporter en PDF/Excel

**Tableau de bord :**
```
┌─────────────────────────────────────────────────────┐
│ STATISTIQUES                                        │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐  │
│ │ En cours│ │ Confirmé│ │ Complété│ │ Annulé  │  │
│ │   12    │ │   45    │ │   230   │ │    8    │  │
│ └─────────┘ └─────────┘ └─────────┘ └─────────┘  │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ RÉSERVATIONS RÉCENTES                               │
│ [Filtrer: Tous ▼] [Recherche: _________] [Export] │
├─────────────────────────────────────────────────────┤
│ Réf.          │ Client      │ Tour    │ Statut    │
│ EB-2025-001234│ John Doe    │ Kerala  │🟡 Pending │
│ EB-2025-001233│ Jane Smith  │ Goa     │✅ Paid    │
│ EB-2025-001232│ Bob Johnson │ Mysore  │📧 Quote   │
└─────────────────────────────────────────────────────┘
```

---

## RÉCAPITULATIF DU FLUX UTILISATEUR (VERSION 2.0)

```
TourDetailPage
    ↓ (Clic "Réserver Maintenant")
BookingPage (/book/:tourId)
    ↓ (Choisir tier + Remplir formulaire)
    ↓ (Changement de tier possible à tout moment)
    ↓ (Prix calculé en temps réel dans sidebar)
    ↓ (Soumettre depuis sidebar sticky)
Status: Inquiry Pending
    ↓ (Admin envoie devis - sous 30 min)
Status: Quote Sent (valable 48h)
    ↓ (Utilisateur paie)
Status: Payment Confirmed
    ↓ (Option : Annulation sous 24h)
[Voyage effectué]
    ↓ (Admin marque comme terminé)
Status: Trip Completed
    ↓ (Email automatique)
Utilisateur laisse un avis
```

---

## CHECKLIST D'IMPLÉMENTATION

### Frontend
- [ ] **Créer TierSelector.jsx** (avec tabs desktop + dropdown mobile)
- [ ] **Créer BookingSidebar.jsx** (sticky, calcul temps réel)
- [ ] **Créer TravelDetailsForm.jsx** (date picker + participants)
- [ ] **Créer AddonsSelector.jsx** (cards avec checkboxes)
- [ ] **Créer VehiclesSelector.jsx** (avec quantité)
- [ ] **Créer ContactForm.jsx** (pré-rempli si connecté)
- [ ] **Créer ComparePackagesModal.jsx** (comparaison côte-à-côte)
- [ ] **Mettre à jour BookingPage.jsx** (layout grid 2/3 - 1/3)
- [ ] **Modifier TourDetailPage.jsx** (bouton simple "Réserver")
- [ ] Implémenter la validation des dates (min +5 jours)
- [ ] Créer le calcul de prix en temps réel (useMemo)
- [ ] Ajouter animations de transition (framer-motion)
- [ ] Créer la page "My Bookings" pour suivre les réservations
- [ ] Implémenter l'annulation avec vérification de la fenêtre 24h
- [ ] Créer la page de détail du devis
- [ ] Intégration Stripe/Razorpay
- [ ] **Bottom sticky bar pour mobile**
- [ ] **Sauvegarde auto dans localStorage**

### Backend
- [ ] Créer l'API `POST /api/bookings` pour créer une réservation
- [ ] Créer l'API `GET /api/bookings/user/:userId` pour récupérer les réservations
- [ ] Créer l'API `PUT /api/bookings/:id/send-quote` (Admin)
- [ ] Créer l'API `POST /api/bookings/:id/cancel` avec validation 24h
- [ ] Créer l'API `PUT /api/bookings/:id/complete` (Admin)
- [ ] Implémenter le webhook de paiement
- [ ] Créer le système de génération de `booking_reference`
- [ ] Implémenter le cron job pour expiration des devis
- [ ] Créer le système d'envoi d'emails automatiques
- [ ] **Créer fonction SQL generate_booking_reference()**
- [ ] **Créer trigger auto-génération référence**

### Base de données
- [ ] Créer/modifier la table `bookings` avec tous les champs
- [ ] Créer les indexes nécessaires
- [ ] Créer la fonction `generate_booking_reference()`
- [ ] Créer le trigger de génération auto
- [ ] Créer une vue `booking_history_enriched` pour l'admin

### Admin Dashboard
- [ ] Créer la page de liste des réservations
- [ ] Créer la page de détail d'une réservation
- [ ] Implémenter les filtres et la recherche
- [ ] Créer le formulaire d'envoi de devis
- [ ] Créer les statistiques du dashboard
- [ ] Implémenter l'export PDF/Excel

### Emails
- [ ] Créer les 7 templates d'emails
- [ ] Configurer le service d'envoi (Nodemailer/SendGrid)
- [ ] Tester tous les scénarios d'envoi

---

## NOTES IMPORTANTES

1. **Sécurité :**
   - Toujours valider les dates côté backend
   - Vérifier l'authentification pour les actions sensibles
   - Protéger les webhooks de paiement avec signature
   - Valider que tier_id appartient bien au tour_id

2. **Performance :**
   - Indexer les colonnes fréquemment recherchées
   - Utiliser des transactions pour les opérations critiques
   - Mettre en cache les données de tours/tiers
   - useMemo pour calcul prix (éviter re-renders)
   - Débounce sur les inputs si nécessaire

3. **UX :**
   - Feedback visuel à chaque étape
   - Messages d'erreur clairs et multilingues
   - Indicateurs de progression
   - Animations smooth lors du changement de tier
   - Sauvegarde automatique du brouillon
   - Confirmation avant annulation

4. **Tests :**
   - Tester tous les scénarios de statut
   - Tester la fenêtre d'annulation 24h
   - Tester l'expiration des devis 48h
   - Tester les webhooks de paiement
   - Tester le changement de tier en temps réel
   - Tester le calcul de prix pour tous les cas

5. **Mobile :**
   - Bottom sticky bar avec prix + bouton
   - Swipeable cards pour les tiers
   - Dropdown pour sélection rapide
   - Touch-friendly (boutons 44px min)

---

## AMÉLIORATIONS FUTURES

### Phase 1.5 (Court terme)
- [ ] Système de favoris de packages
- [ ] Partage de devis par lien
- [ ] Chat en direct avec support
- [ ] Notifications push (PWA)

### Phase 2.0 (Moyen terme)
- [ ] Réservation groupée (plusieurs tours)
- [ ] Programme de fidélité / points
- [ ] Recommandations personnalisées
- [ ] Historique des recherches

### Phase 3.0 (Long terme)
- [ ] IA pour suggestion de dates optimales
- [ ] Dynamic pricing basé sur la demande
- [ ] Réalité virtuelle des tours
- [ ] Application mobile native

---

**Document créé le :** 2025-01-08
**Dernière mise à jour :** 2025-10-09
**Version :** 2.0
**Changements majeurs v2.0:**
- ✅ Nouveau flow: TourDetailPage → BookingPage (sans tier pré-sélectionné)
- ✅ Sticky sidebar avec calcul temps réel
- ✅ Sélection de tier intégrée dans BookingPage
- ✅ Changement de tier sans quitter la page
- ✅ Composants React modulaires
- ✅ UX optimisée desktop + mobile
- ✅ Sauvegarde automatique brouillon
