# 🧪 Guide de Test Auto-Validate End-to-End

Ce guide explique comment utiliser le test automatisé pour vérifier le bon fonctionnement du bouton "Auto-Validate" de l'AdminQuoteReviewPage.

---

## 📋 Prérequis

1. **Base de données PostgreSQL** configurée et en cours d'exécution
2. **Backend Node.js** démarré sur le port 5000
3. **Node.js** installé (pour exécuter le script de test)
4. **Un utilisateur admin** dans la base de données

---

## ✅ Informations Admin Configurées

Le script utilise les informations suivantes (trouvées dans la base de données):

- **Email:** `admin@test.com`
- **Mot de passe:** `admin123` *(à confirmer ou modifier dans le script)*

Si le mot de passe est différent, modifiez la ligne 17 du fichier `test-auto-validate-e2e.js`:

```javascript
const ADMIN_PASSWORD = 'votre_mot_de_passe'; // Remplacer ici
```

---

## 🚀 Exécution du Test

### Méthode 1: Exécution Simple

```bash
# Depuis la racine du projet
node test-auto-validate-e2e.js
```

### Méthode 2: Avec npm (si configuré)

```bash
npm run test:auto-validate
```

---

## 📊 Étapes du Test

Le test effectue automatiquement les étapes suivantes:

### 1️⃣ Connexion Admin
- Se connecte avec `admin@test.com`
- Récupère un token JWT
- Vérifie les droits admin

### 2️⃣ Recherche d'un Booking
- Cherche un booking avec statut "Inquiry Pending" ou "Under Review"
- Si aucun trouvé, utilise le premier booking disponible
- Affiche les détails du booking sélectionné

### 3️⃣ Vérification/Création de Révision
- Vérifie s'il existe une révision active pour le booking
- Si non, crée une nouvelle révision
- Affiche les détails de la révision

### 4️⃣ Exécution de l'Auto-Validation
- Appelle l'endpoint `POST /api/bookings/:bookingId/review/:revisionId/auto-validate`
- Vérifie la réponse
- Affiche les résultats détaillés

---

## ✅ Résultat Attendu

Si tout fonctionne correctement, vous verrez:

```
╔═══════════════════════════════════════════════════════════╗
║   ✅ TEST RÉUSSI - AUTO-VALIDATE FONCTIONNE!             ║
╚═══════════════════════════════════════════════════════════╝

✅ Le bouton auto-validate fonctionne correctement! 🎉
```

Avec les détails suivants:

### 📊 Résultats de la Révision
- Score de validation (0-100%)
- Toutes sections validées (Oui/Non)
- Prix de base
- Prix véhicules
- Prix addons
- Prix final

### 🔍 Détails de la Validation
- Tier disponible
- Véhicules validés
- Capacité totale véhicules
- Addons validés
- Participants validés
- Date validée

### 💰 Détails du Pricing
- Prix de base
- Sous-total
- Remises appliquées
- Frais ajoutés
- Prix final

---

## ❌ Erreurs Possibles

### Erreur: "Impossible de se connecter"

**Cause:** Email ou mot de passe incorrect

**Solution:**
1. Vérifier les identifiants dans la base de données:
   ```sql
   SELECT id, full_name, email, role FROM users WHERE role = 'admin';
   ```
2. Modifier le script si nécessaire

---

### Erreur: "Aucune réponse du serveur"

**Cause:** Backend non démarré

**Solution:**
```bash
cd backend
npm start
```

Vérifier que le serveur affiche:
```
🚀 Server running on port 5000
```

---

### Erreur: "Cet utilisateur n'est pas admin"

**Cause:** L'utilisateur n'a pas le rôle admin

**Solution:**
```sql
UPDATE users SET role = 'admin' WHERE email = 'admin@test.com';
```

---

### Erreur 401 (Unauthorized)

**Cause:** Token invalide ou expiré

**Solution:** Relancer le test (il se reconnecte automatiquement)

---

### Erreur 404 (Not Found)

**Cause:** Route non enregistrée ou serveur backend mal configuré

**Solution:**
1. Vérifier que le backend est démarré
2. Vérifier les logs du serveur backend
3. Vérifier que les routes dans `backend/src/routes/index.js` incluent:
   ```javascript
   router.use("/bookings", quoteRevisionRoutes);
   ```

---

### Erreur 500 (Internal Server Error)

**Cause:** Bug dans le code backend

**Solution:**
1. Regarder les logs du serveur backend
2. Vérifier les erreurs dans:
   - `backend/src/controllers/quoteRevisionController.js`
   - `backend/src/services/quoteValidationService.js`
   - `backend/src/services/quotePricingService.js`

---

## 🔍 Debugging Avancé

### Activer les Logs Détaillés

Le script affiche déjà beaucoup de détails, mais pour plus d'informations:

1. **Dans le backend**, ajouter des logs dans:
   - `quoteRevisionController.js` ligne 1039 (fonction `runAutoValidationAndSave`)

2. **Dans le frontend**, ouvrir la console du navigateur lors du clic sur "Auto-Validate"

### Tester Manuellement avec curl

```bash
# 1. Se connecter
TOKEN=$(curl -X POST http://localhost:5000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"admin123"}' \
  | jq -r '.token')

# 2. Tester auto-validate
curl -X POST http://localhost:5000/api/bookings/97/review/3/auto-validate \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}' | jq
```

---

## 📝 Modifier le Test

### Changer le Booking Testé

Modifier la fonction `findTestBooking()` ligne ~102:

```javascript
// Forcer un booking spécifique
testBooking = allBookings.find(b => b.id === 97);
```

### Changer l'URL du Backend

Modifier ligne 16:

```javascript
const BASE_URL = 'http://localhost:VOTRE_PORT/api';
```

---

## 📞 Support

Si le test échoue systématiquement:

1. **Vérifier la base de données:**
   ```sql
   -- Vérifier les bookings
   SELECT id, status FROM bookings WHERE status IN ('Inquiry Pending', 'Under Review');

   -- Vérifier les révisions
   SELECT id, booking_id, review_status FROM booking_quote_revisions;
   ```

2. **Vérifier le backend:**
   - Logs dans le terminal du backend
   - Fichiers de services et contrôleurs

3. **Partager les logs:**
   - Copier la sortie complète du test
   - Copier les logs du backend
   - Partager pour diagnostic

---

**Dernière mise à jour:** 24 octobre 2025
**Version:** 1.0.0
