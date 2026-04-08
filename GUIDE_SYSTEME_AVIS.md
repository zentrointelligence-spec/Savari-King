# Guide du Système d'Avis Complet

## 📋 Vue d'ensemble

Le système d'avis permet aux utilisateurs de laisser des évaluations complètes après avoir terminé une réservation. Les avis peuvent porter sur :

1. **Le Tour** - L'expérience globale du voyage
2. **La Destination** - L'avis sur le lieu visité
3. **Les Addons** - L'évaluation des services additionnels (véhicules, guides, etc.)

## 🗄️ Structure de la base de données

### Tables créées

#### 1. `destination_reviews`
```sql
- id: Identifiant unique
- destination_id: Référence à la destination
- booking_id: Référence à la réservation
- user_id: Référence à l'utilisateur
- rating: Note de 1 à 5 étoiles
- comment: Commentaire de l'utilisateur
- created_at: Date de création
- updated_at: Date de mise à jour
```

#### 2. `reviews` (existante, pour les tours)
- Contient les avis sur les tours
- Comprend un champ `verified_purchase` qui est automatiquement mis à `true`

#### 3. `addon_reviews` (existante, pour les addons)
- Contient les avis sur les addons
- Lié à une réservation spécifique

## 🎯 Fonctionnalités

### Pour les utilisateurs

1. **Bouton "Leave Review"**
   - Visible uniquement pour les réservations avec le statut `Trip Completed`
   - Se trouve dans la carte de réservation sur la page "My Bookings"

2. **Modal d'avis complet**
   - Formulaire structuré avec 3 sections principales
   - Interface intuitive avec notation par étoiles
   - Validation automatique des champs requis

3. **Prévention des doublons**
   - Le système vérifie si un avis a déjà été laissé
   - Affiche un message pour les éléments déjà évalués
   - Permet de compléter les avis manquants

### Sections du formulaire

#### 1. Avis sur le Tour (obligatoire)
- Note de 1 à 5 étoiles (obligatoire)
- Commentaire texte (optionnel)
- Case à cocher "Je recommande ce tour"

#### 2. Avis sur la Destination (optionnel)
- Note de 1 à 5 étoiles
- Commentaire texte
- Uniquement si la destination est associée au tour

#### 3. Avis sur les Addons (optionnel)
- Une section par addon sélectionné dans la réservation
- Note de 1 à 5 étoiles par addon
- Commentaire optionnel pour chaque addon

## 🚀 API Endpoints

### 1. Récupérer les détails d'une réservation pour les avis
```
GET /api/booking-reviews/:bookingId/details
Headers: Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": {
    "booking": {
      "id": 123,
      "reference": "BK-2025-0001",
      "travel_date": "2025-03-15",
      "tour": { ... },
      "destination": { ... },
      "addons": [ ... ]
    },
    "existingReviews": {
      "tourReviewed": false,
      "destinationReviewed": false,
      "addonReviews": []
    }
  }
}
```

### 2. Soumettre les avis
```
POST /api/booking-reviews/:bookingId/submit
Headers: Authorization: Bearer {token}

Body:
{
  "tourReview": {
    "rating": 5,
    "comment": "Excellent tour!",
    "would_recommend": true
  },
  "destinationReview": {
    "rating": 5,
    "comment": "Magnifique destination!"
  },
  "addonReviews": [
    {
      "addon_id": 1,
      "rating": 4,
      "comment": "Très bon service"
    }
  ]
}

Response:
{
  "success": true,
  "message": "Reviews submitted successfully",
  "data": {
    "tourReview": { ... },
    "destinationReview": { ... },
    "addonReviews": [ ... ]
  }
}
```

### 3. Vérifier l'éligibilité pour laisser un avis
```
GET /api/booking-reviews/:bookingId/can-review
Headers: Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": {
    "id": 123,
    "status": "Trip Completed",
    "can_review": true
  }
}
```

## 🧪 Tests

### Test automatique

Un script de test complet est fourni : `test-review-system.js`

```bash
node test-review-system.js
```

### Configuration du test

Modifiez les identifiants dans le fichier :
```javascript
const TEST_CONFIG = {
  email: 'test@example.com',
  password: 'test123',
};
```

### Test manuel

1. **Créer une réservation de test**
```sql
-- Trouver un tour existant
SELECT id, name FROM tours LIMIT 1;

-- Mettre à jour une réservation existante pour la compléter
UPDATE bookings
SET status = 'Trip Completed',
    completion_date = NOW()
WHERE id = [votre_booking_id];
```

2. **Se connecter à l'application**
   - Aller sur `/my-bookings`
   - Trouver la réservation complétée
   - Cliquer sur "Leave Review"

3. **Remplir le formulaire**
   - Noter le tour (obligatoire)
   - Noter la destination (si applicable)
   - Noter les addons (si applicable)
   - Soumettre

4. **Vérifier dans la base de données**
```sql
-- Vérifier les avis du tour
SELECT * FROM reviews WHERE user_id = [votre_user_id] ORDER BY submission_date DESC;

-- Vérifier les avis de destination
SELECT * FROM destination_reviews WHERE user_id = [votre_user_id] ORDER BY created_at DESC;

-- Vérifier les avis des addons
SELECT * FROM addon_reviews WHERE user_id = [votre_user_id] ORDER BY created_at DESC;
```

## 📊 Statistiques et mises à jour automatiques

### Triggers automatiques

1. **Tour Rating Update**
   - La table `tours` est automatiquement mise à jour
   - Les champs `rating` et `review_count` sont recalculés

2. **Destination Rating Update**
   - La table `destinations` met à jour `avg_rating` et `review_count`
   - Trigger sur INSERT, UPDATE, DELETE

3. **Addon Rating Update**
   - Les addons calculent automatiquement leur note moyenne

## 🔒 Sécurité et validations

### Backend
- Authentification requise pour tous les endpoints
- Vérification que la réservation appartient à l'utilisateur
- Vérification du statut "Trip Completed"
- Prévention des doublons
- Validation des notes (1-5 étoiles)

### Frontend
- Validation en temps réel
- Désactivation du bouton de soumission si incomplet
- Messages d'erreur clairs
- Feedback visuel pour les actions

## 📁 Fichiers créés/modifiés

### Backend
1. **Migrations**
   - `backend/src/db/migrations/create_destination_reviews_table.sql`

2. **Contrôleurs**
   - `backend/src/controllers/bookingReviewController.js`

3. **Routes**
   - `backend/src/routes/bookingReviewRoutes.js`
   - `backend/src/routes/index.js` (modifié)

### Frontend
1. **Composants**
   - `frontend/src/components/booking/BookingReviewModal.jsx`
   - `frontend/src/components/booking/BookingStatusCard.jsx` (modifié)

### Tests
1. **Scripts de test**
   - `test-review-system.js`

## 🎨 Interface utilisateur

### Bouton "Leave Review"
- Couleur : Violet (#8B5CF6)
- Position : Dans la carte de réservation
- Visible uniquement pour : Status = "Trip Completed"

### Modal d'avis
- Design : Modal plein écran avec défilement
- Responsive : Adapté aux mobiles et tablettes
- Couleurs : Dégradé primary (violet)
- Feedback : Toast notifications pour les succès/erreurs

## 🐛 Dépannage

### Problème : Le bouton n'apparaît pas

**Solution :**
1. Vérifier le statut de la réservation :
```sql
SELECT id, booking_reference, status FROM bookings WHERE id = [booking_id];
```
2. Le statut doit être exactement `'Trip Completed'`

### Problème : Erreur 404 lors de la soumission

**Solution :**
1. Vérifier que le serveur backend est démarré
2. Vérifier que les routes sont bien chargées dans `index.js`
3. Vérifier les logs du serveur

### Problème : Avis non enregistré

**Solution :**
1. Vérifier les logs du backend
2. Vérifier que la transaction n'a pas échoué
3. Vérifier les contraintes de la base de données

## 📈 Améliorations futures possibles

1. **Photos dans les avis**
   - Permettre aux utilisateurs d'ajouter des photos

2. **Modération des avis**
   - Interface admin pour approuver/rejeter les avis

3. **Réponses aux avis**
   - Permettre aux administrateurs de répondre

4. **Avis utiles**
   - Système de votes "Cet avis vous a-t-il été utile ?"

5. **Statistiques détaillées**
   - Dashboard avec analytics des avis

## 💡 Conseils d'utilisation

1. **Encouragez les avis**
   - Envoyez un email de rappel après la complétion du tour
   - Offrez un petit bonus pour les avis détaillés

2. **Répondez aux avis**
   - Remerciez les clients pour leurs retours
   - Adressez les problèmes mentionnés

3. **Utilisez les avis**
   - Affichez les meilleurs avis sur la page d'accueil
   - Utilisez les retours pour améliorer les services

## 📞 Support

Pour toute question ou problème :
1. Vérifiez ce guide
2. Consultez les logs du serveur
3. Vérifiez la console du navigateur
4. Testez avec le script de test automatique

---

**Version:** 1.0.0
**Date:** 2025-01-27
**Auteur:** Claude Code Assistant
