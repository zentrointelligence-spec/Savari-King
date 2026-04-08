# 📖 GUIDE COMPLET: Comment Faire une Réservation sur Ebenezer Tours

**Version:** 1.0
**Date:** 2025-10-09
**Pour:** Utilisateurs finaux de l'application

---

## 🎯 FLUX UTILISATEUR SIMPLIFIÉ

```
1. TourDetailPage → 2. BookingPage → 3. Confirmation → 4. Devis → 5. Paiement → 6. Voyage
   (Choisir tier)    (Remplir form)    (En attente)   (Recevoir)   (Confirmer)   (Profiter!)
```

---

## 📋 ÉTAPE PAR ÉTAPE

### **ÉTAPE 1: Choisir le Tour et le Package** 🎫

**Page:** Tour Detail Page (`/tours/:id`)

**Actions utilisateur:**
1. Parcourir les détails du tour
2. Voir les 3 options de packages:
   - **Standard** (₹19,500) - 3-Star Hotel
   - **Premium** (₹30,000) - 4-Star Resort ⭐ POPULAIRE
   - **Luxury** (₹45,000) - 5-Star Resort
3. Cliquer sur **"Sélectionner le forfait"** sur le tier choisi

**Redirection:** → `/book/:tourId?tier=:tierId`

---

### **ÉTAPE 2: Remplir le Formulaire de Réservation** 📝

**Page:** Booking Page (`/book/:tourId`)

#### **Section 1: Détails du Voyage**
```
📅 Date de voyage: [Sélectionner] (minimum: aujourd'hui + 5 jours)
👥 Adultes: [1-20] (dropdown)
👶 Enfants: [0-10] (dropdown)
```

**Règle importante:** La date doit être au minimum **5 jours dans le futur**

#### **Section 2: Véhicules Additionnels** 🚗 (Optionnel)
```
□ 7 Seater SUV (+₹3,000/jour) Quantité: [1]
□ Luxury Sedan (+₹5,000/jour) Quantité: [1]
```

#### **Section 3: Add-ons** ✨ (Optionnel)
```
□ Candlelight Dinner (+₹2,500)
□ Ayurvedic Spa Session (+₹3,000)
□ Private Photography (+₹5,000)
```

#### **Section 4: Informations de Contact** 📞

Si **connecté:**
- Les champs sont pré-remplis avec vos informations
- Vous pouvez les modifier

Si **non connecté:**
```
Nom complet: [__________] *requis
Email: [__________] *requis
Téléphone: [__________] *requis
Demandes spéciales: [___________] (optionnel)

☑ J'accepte les conditions générales
```

#### **Section 5: Résumé des Coûts** 💰
```
Prix du forfait:           ₹30,000
Véhicules additionnels:     ₹3,000
Add-ons:                    ₹5,500
───────────────────────────────────
Prix estimé total:         ₹38,500

💡 Ceci est une estimation. Le prix final
   sera confirmé sous 30 minutes.
```

**Action finale:** Cliquer sur **"Soumettre la demande de réservation"**

---

### **ÉTAPE 3: Demande Envoyée** 🟡

**Statut:** `Inquiry Pending`

#### **Ce qui se passe automatiquement:**

**Backend:**
- Création de la réservation dans la base de données
- Génération d'une référence unique: **EB-2025-001234**
- Statut: `Inquiry Pending`

**Emails automatiques:**
- ✉️ **Vous recevez:** "Demande reçue - Réponse sous 30 minutes"
- ✉️ **Admin reçoit:** Alerte de nouvelle demande

#### **Votre vue (My Bookings):**
```
┌──────────────────────────────────────────┐
│ 🟡 Demande envoyée                       │
│ Référence: EB-2025-001234                │
│ Notre équipe examine votre demande       │
│ Réponse attendue: sous 30 minutes        │
│                                           │
│ [Annuler la demande]                     │
└──────────────────────────────────────────┘
```

**Vous pouvez:** Annuler gratuitement à tout moment (aucun paiement effectué)

---

### **ÉTAPE 4: Réception du Devis** 📧

**Statut:** `Quote Sent`

#### **Ce que fait l'admin:**
- Vérifie la disponibilité des hôtels/véhicules
- Ajuste le prix si nécessaire
- Envoie le devis personnalisé

#### **Vous recevez:**
- ✉️ Email: "Votre devis est prêt ! Valable 48h"
- Devis détaillé avec le **prix final**

#### **Votre vue (My Bookings):**
```
┌──────────────────────────────────────────┐
│ 📧 Devis reçu                            │
│ Référence: EB-2025-001234                │
│ Prix final: ₹45,000                      │
│ Valable jusqu'au: 15 Jan 2025, 14:30    │
│                                           │
│ [Voir le devis & Payer]                  │
│ [Annuler la demande]                     │
└──────────────────────────────────────────┘
```

**⏰ Important:** Le devis expire après **48 heures**. Vous devez payer avant ce délai.

#### **Vous pouvez:**
- Voir le détail complet du devis
- Procéder au paiement
- Annuler la demande (toujours gratuit)

---

### **ÉTAPE 5: Paiement** 💳

**Statut:** `Payment Confirmed`

#### **Action:** Cliquer sur "Procéder au paiement"

**Méthodes de paiement:**
- Stripe (cartes internationales)
- Razorpay (méthodes indiennes: UPI, cartes, etc.)

#### **Après paiement réussi:**

**Backend automatique:**
- Statut → `Payment Confirmed`
- Enregistre le transaction ID
- Calcule la deadline d'annulation (24h après paiement)

**Emails automatiques:**
- ✉️ **Vous recevez:** "Réservation confirmée ! Préparez-vous pour le voyage"
  - PDF de confirmation en pièce jointe
  - Détails complets du voyage
- ✉️ **Admin reçoit:** Notification de paiement

#### **Votre vue (My Bookings):**
```
┌──────────────────────────────────────────┐
│ ✅ Réservation confirmée                 │
│ Référence: EB-2025-001234                │
│ Date du voyage: 20 Jan 2025              │
│ Montant payé: ₹45,000                    │
│                                           │
│ 📄 [Télécharger la confirmation PDF]    │
│ 🗺️  [Voir l'itinéraire complet]        │
│                                           │
│ ⚠️ Annulation gratuite jusqu'au:        │
│    14 Jan 2025, 16:45 (24h restantes)   │
│ [Annuler la réservation]                 │
└──────────────────────────────────────────┘
```

**🔐 Politique d'annulation:**
- **Avant 24h après paiement:** Annulation GRATUITE avec remboursement complet
- **Après 24h:** Plus d'annulation possible (contacter le support)

---

### **ÉTAPE 6: Annulation (Optionnel)** ❌

**Statut:** `Cancelled`

#### **Deux cas possibles:**

##### **Cas A: Avant Paiement**
- **Statuts:** `Inquiry Pending` ou `Quote Sent`
- **Action:** Cliquer sur "Annuler la demande"
- **Résultat:** Annulation immédiate, aucun frais

##### **Cas B: Après Paiement**
- **Statut:** `Payment Confirmed`
- **Condition:** Moins de 24h depuis le paiement
- **Action:** Cliquer sur "Annuler la réservation"
- **Vérification système:**
  - ✅ **Si < 24h:** Annulation acceptée → Remboursement sous 5-7 jours
  - ❌ **Si > 24h:** Annulation refusée → "Contactez-nous pour assistance"

---

### **ÉTAPE 7: Profiter du Voyage!** 🎉

**Statut:** `Trip Completed`

#### **Le jour du voyage:**
- Suivez l'itinéraire envoyé
- Profitez de votre expérience
- Les guides vous contactent directement

#### **Après le voyage:**

**L'admin marque:** Statut → `Trip Completed`

**Vous recevez:** ✉️ "Merci pour votre voyage ! Laissez-nous un avis"

#### **Votre vue (My Bookings):**
```
┌──────────────────────────────────────────┐
│ 🎉 Voyage terminé                        │
│ Référence: EB-2025-001234                │
│                                           │
│ Comment s'est passé votre voyage?        │
│ [Laisser un avis ⭐⭐⭐⭐⭐]            │
│                                           │
│ [Télécharger le reçu]                    │
└──────────────────────────────────────────┘
```

---

## 📊 RÉSUMÉ DES 5 STATUTS DE RÉSERVATION

| Statut | Emoji | Que faire? | Délai |
|--------|-------|------------|-------|
| **Inquiry Pending** | 🟡 | Attendre le devis | 30 min |
| **Quote Sent** | 📧 | Payer avant expiration | 48 heures |
| **Payment Confirmed** | ✅ | Préparer le voyage | Jusqu'à la date |
| **Cancelled** | ❌ | Réservation annulée | - |
| **Trip Completed** | 🎉 | Laisser un avis | - |

---

## ⚠️ RÈGLES IMPORTANTES

### 1. **Date de Voyage**
- ❌ Impossible de réserver pour moins de **5 jours** dans le futur
- ✅ Exemple: Aujourd'hui = 9 Jan → Date minimum = 14 Jan

### 2. **Expiration du Devis**
- ⏰ Valable **48 heures** après envoi
- ❌ Après expiration → Statut: `Quote Expired` → Refaire une demande

### 3. **Fenêtre d'Annulation**
- ✅ Annulation GRATUITE: **Moins de 24h après paiement**
- ❌ Après 24h: Plus d'annulation possible

### 4. **Prix Estimé vs Prix Final**
- 💰 **Estimé:** Calculé automatiquement sur la page booking
- 💵 **Final:** Confirmé par l'admin dans le devis (peut varier légèrement)

---

## 🔗 PAGES CLÉS DE L'APPLICATION

| Page | URL | Rôle |
|------|-----|------|
| **Tour Details** | `/tours/:id` | Choisir le package |
| **Booking Form** | `/book/:tourId?tier=X` | Remplir les infos |
| **My Bookings** | `/my-bookings` | Suivre les réservations |
| **Quote Details** | `/bookings/:id` | Voir le devis |
| **Payment** | Integration externe | Payer (Stripe/Razorpay) |

---

## 📧 EMAILS QUE VOUS RECEVREZ

1. **Demande reçue** → Immédiatement après soumission
2. **Devis prêt** → Sous 30 minutes (valable 48h)
3. **Paiement confirmé** → Immédiatement après paiement (avec PDF)
4. **Annulation confirmée** → Si vous annulez (avec info remboursement)
5. **Voyage terminé** → Après le voyage (demande d'avis)

---

## 💡 CONSEILS PRATIQUES

### ✅ À FAIRE:
- Réserver au moins 5 jours à l'avance
- Payer dans les 48h après réception du devis
- Vérifier vos emails régulièrement
- Télécharger le PDF de confirmation

### ❌ À ÉVITER:
- Attendre trop longtemps (devis expire après 48h)
- Annuler après 24h du paiement
- Oublier de spécifier vos demandes spéciales

---

## 🎯 DIAGRAMME DU FLUX COMPLET

```
┌─────────────────────────────────────────────────────────────────┐
│                    FLUX DE RÉSERVATION                          │
└─────────────────────────────────────────────────────────────────┘

1. Tour Detail Page
   ↓ [Clic "Sélectionner forfait"]

2. Booking Page (/book/:tourId?tier=X)
   ↓ [Remplir formulaire + Soumettre]

3. Status: Inquiry Pending 🟡
   ├─→ Email: Demande reçue (Utilisateur)
   ├─→ Email: Nouvelle demande (Admin)
   └─→ Délai: 30 minutes

4. Status: Quote Sent 📧
   ├─→ Email: Devis prêt (Utilisateur)
   ├─→ Validité: 48 heures
   └─→ Action: Payer ou Annuler

5. Status: Payment Confirmed ✅
   ├─→ Email: Confirmation + PDF (Utilisateur)
   ├─→ Email: Paiement reçu (Admin)
   ├─→ Fenêtre annulation: 24 heures
   └─→ Attendre le jour du voyage

6. [Voyage effectué]
   ↓

7. Status: Trip Completed 🎉
   ├─→ Email: Demande d'avis (Utilisateur)
   └─→ Action: Laisser un avis
```

---

## 🛡️ SÉCURITÉ & GARANTIES

### Protection des Paiements
- ✅ Paiements sécurisés via Stripe/Razorpay
- ✅ Cryptage SSL/TLS pour toutes les transactions
- ✅ Aucune carte de crédit stockée sur nos serveurs

### Politique de Remboursement
- ✅ Remboursement complet si annulation < 24h après paiement
- ✅ Traitement du remboursement: 5-7 jours ouvrables
- ✅ Remboursement sur le même mode de paiement utilisé

### Protection des Données
- ✅ Conformité RGPD
- ✅ Données personnelles cryptées
- ✅ Aucun partage avec des tiers

---

## 🔧 DÉPANNAGE

### Problème: Le devis a expiré
**Solution:** Refaire une nouvelle demande de réservation depuis la page du tour

### Problème: Je ne peux pas annuler (> 24h)
**Solution:** Contacter le support client: support@ebenezer-tours.com

### Problème: Je n'ai pas reçu l'email de confirmation
**Solution:**
1. Vérifier vos spams/courrier indésirable
2. Vérifier l'adresse email saisie dans "My Bookings"
3. Contacter le support si toujours non reçu

### Problème: La date minimum est trop loin
**Explication:** La date doit être au minimum 5 jours dans le futur (règle de l'entreprise)

---

## 📞 SUPPORT CLIENT

**Besoin d'aide?** Contactez-nous:

- 📧 **Email:** support@ebenezer-tours.com
- 📱 **Téléphone:** +91 XXX-XXX-XXXX
- 💬 **Chat en direct:** Disponible sur le site (9h-21h IST)
- 🕐 **Heures d'ouverture:** Lundi-Dimanche, 9h-21h IST

---

## 📚 DOCUMENTS CONNEXES

- **[BOOKING_LOGIC_COMPLETE.md](./BOOKING_LOGIC_COMPLETE.md)** - Documentation technique complète
- **[STANDARD_TIERS_IMPLEMENTATION.md](./STANDARD_TIERS_IMPLEMENTATION.md)** - Détails des packages Standard
- **Conditions Générales** - Disponible sur le site
- **Politique d'Annulation** - Disponible dans le devis

---

## 📝 GLOSSAIRE

| Terme | Définition |
|-------|------------|
| **Tier** | Niveau de package (Standard/Premium/Luxury) |
| **Add-on** | Service supplémentaire optionnel (spa, dîner, etc.) |
| **Quote** | Devis personnalisé envoyé par l'admin |
| **Booking Reference** | Numéro unique de réservation (ex: EB-2025-001234) |
| **Inquiry** | Demande initiale de réservation |
| **Cancellation Window** | Période de 24h après paiement pour annuler gratuitement |

---

## ✨ EXEMPLE CONCRET

### Scénario: Réservation pour Kanyakumari

**9 Janvier 2025, 10:00**
- Sarah visite le site et choisit le tour "Kanyakumari Beach Paradise"
- Elle sélectionne le package **Premium** (₹30,000)

**9 Janvier 2025, 10:15**
- Sarah remplit le formulaire:
  - Date: 20 Janvier 2025
  - 2 adultes, 1 enfant
  - Ajoute: Candlelight Dinner (+₹2,500)
  - Prix estimé: ₹32,500
- Elle soumet la demande → **Statut: Inquiry Pending** 🟡

**9 Janvier 2025, 10:30**
- Sarah reçoit un email: "Demande reçue"
- Admin examine la demande

**9 Janvier 2025, 10:45**
- Admin envoie le devis: ₹33,000 (ajusté pour haute saison)
- **Statut: Quote Sent** 📧
- Valable jusqu'au: **11 Janvier 2025, 10:45**

**9 Janvier 2025, 14:00**
- Sarah clique sur "Procéder au paiement"
- Paie ₹33,000 via Razorpay (UPI)
- **Statut: Payment Confirmed** ✅
- Fenêtre d'annulation: jusqu'au **10 Janvier 2025, 14:00**

**20 Janvier 2025**
- Sarah profite de son voyage à Kanyakumari 🎉

**23 Janvier 2025**
- Admin marque: **Statut: Trip Completed**
- Sarah reçoit un email pour laisser un avis

**24 Janvier 2025**
- Sarah laisse un avis 5 étoiles ⭐⭐⭐⭐⭐

---

**Document créé le:** 2025-10-09
**Version:** 1.0
**Auteur:** Claude Code pour Ebenezer Tours

---

**🎉 Bon voyage avec Ebenezer Tours!**
