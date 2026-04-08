# Système de Métriques Automatiques pour les Addons

## 📋 Vue d'ensemble

Ce système permet de mettre à jour automatiquement les métriques des addons (popularité et rating) basé sur les données réelles d'utilisation et les avis des utilisateurs.

## 🗄️ Structure de la base de données

### Table `addon_reviews`

Stocke les avis et notes des utilisateurs sur les addons.

| Colonne | Type | Description |
|---------|------|-------------|
| id | INTEGER | Identifiant unique |
| addon_id | INTEGER | Référence vers l'addon |
| booking_id | INTEGER | Référence vers la réservation |
| user_id | INTEGER | Référence vers l'utilisateur |
| rating | INTEGER | Note de 1 à 5 étoiles |
| comment | TEXT | Commentaire optionnel |
| created_at | TIMESTAMP | Date de création |
| updated_at | TIMESTAMP | Date de modification |

**Contraintes:**
- Un utilisateur ne peut laisser qu'un seul avis par addon par réservation
- Le rating doit être entre 1 et 5

### Vue `addon_statistics`

Vue récapitulative des statistiques de tous les addons actifs.

```sql
SELECT * FROM addon_statistics;
```

Retourne:
- ID et nom de l'addon
- Catégorie et prix
- Popularité et rating actuels
- Nombre d'avis et de réservations
- Rating moyen des avis

## ⚙️ Fonctions SQL

### 1. `calculate_addon_popularity(addon_id)`

Calcule la popularité d'un addon en pourcentage.

**Formule:**
```
popularity = (réservations avec cet addon / réservations totales du tour) × 100
```

**Exemple:**
```sql
SELECT calculate_addon_popularity(1);
-- Retourne: 92 (pour 92%)
```

### 2. `calculate_addon_rating(addon_id)`

Calcule la note moyenne d'un addon basé sur les avis.

**Formule:**
```
rating = MOYENNE(notes des avis)
```

**Exemple:**
```sql
SELECT calculate_addon_rating(1);
-- Retourne: 4.75
```

### 3. `update_addon_metrics(addon_id)`

Met à jour les métriques d'un addon spécifique.

**Exemple:**
```sql
SELECT update_addon_metrics(1);
```

### 4. `update_all_addon_metrics()`

Met à jour les métriques de tous les addons actifs.

**Exemple:**
```sql
SELECT * FROM update_all_addon_metrics();
```

### 5. `get_addon_metrics_report()`

Génère un rapport comparatif entre les métriques actuelles et calculées.

**Exemple:**
```sql
SELECT * FROM get_addon_metrics_report();
```

## 🔄 Triggers automatiques

### 1. `trigger_booking_addon_metrics`

**Déclenchement:** Après INSERT ou UPDATE sur `bookings`

**Action:** Met à jour les métriques des addons concernés quand une réservation est confirmée ou complétée.

### 2. `trigger_addon_review_rating`

**Déclenchement:** Après INSERT ou UPDATE sur `addon_reviews`

**Action:** Recalcule le rating de l'addon quand un avis est ajouté ou modifié.

### 3. `trigger_update_addon_review_timestamp`

**Déclenchement:** Avant UPDATE sur `addon_reviews`

**Action:** Met à jour automatiquement le champ `updated_at`.

## 🚀 Utilisation via Node.js

### Installation

Le script est déjà créé dans `backend/src/jobs/updateAddonMetrics.js`.

### Commandes disponibles

#### Mettre à jour tous les addons
```bash
node src/jobs/updateAddonMetrics.js update
```

#### Mettre à jour un addon spécifique
```bash
node src/jobs/updateAddonMetrics.js update 1
```

#### Générer un rapport
```bash
node src/jobs/updateAddonMetrics.js report
```

#### Aide
```bash
node src/jobs/updateAddonMetrics.js help
```

### Configuration CRON

Pour exécuter automatiquement chaque jour à 2h du matin:

**Linux/Mac:**
```bash
crontab -e
```

Ajouter:
```
0 2 * * * cd /path/to/backend && node src/jobs/updateAddonMetrics.js update
```

**Windows (Task Scheduler):**
1. Ouvrir le Planificateur de tâches
2. Créer une tâche de base
3. Déclencheur: Quotidien à 2h00
4. Action: Démarrer un programme
   - Programme: `node`
   - Arguments: `src/jobs/updateAddonMetrics.js update`
   - Démarrer dans: `C:\path\to\backend`

## 📊 Métriques calculées

### Popularité (Popularity)

**Valeur:** 0-100 (pourcentage)

**Calcul:**
- Basé sur le nombre de fois où l'addon est sélectionné dans les réservations confirmées/complétées
- Comparé au nombre total de réservations pour les tours qui proposent cet addon

**Badges affichés:**
- `🔥 Hot` si popularité > 75%

### Rating (Note)

**Valeur:** 1.00-5.00

**Calcul:**
- Moyenne des notes laissées par les utilisateurs dans `addon_reviews`
- Valeur par défaut: 4.5 si aucun avis

**Affichage:**
- Étoiles dans l'interface (1 à 5)
- Note numérique (ex: 4.75/5)

## 🎯 Cas d'usage

### 1. Ajouter un avis sur un addon

```javascript
// API Route: POST /api/addon-reviews
const response = await fetch('/api/addon-reviews', {
  method: 'POST',
  body: JSON.stringify({
    addon_id: 1,
    booking_id: 123,
    rating: 5,
    comment: "Excellent service!"
  })
});
```

**SQL:**
```sql
INSERT INTO addon_reviews (addon_id, booking_id, user_id, rating, comment)
VALUES (1, 123, 456, 5, 'Excellent service!');

-- Le trigger met automatiquement à jour le rating de l'addon
```

### 2. Vérifier les métriques d'un addon

```sql
SELECT
  id,
  name,
  popularity,
  rating,
  (SELECT COUNT(*) FROM addon_reviews WHERE addon_id = addons.id) as review_count
FROM addons
WHERE id = 1;
```

### 3. Obtenir les addons les plus populaires

```sql
SELECT name, popularity, rating
FROM addons
WHERE is_active = true
ORDER BY popularity DESC, rating DESC
LIMIT 5;
```

### 4. Trouver les addons nécessitant attention

```sql
SELECT name, popularity, rating
FROM addons
WHERE is_active = true
  AND (popularity < 30 OR rating < 3.5)
ORDER BY popularity ASC, rating ASC;
```

## 🔧 Maintenance

### Recalculer toutes les métriques manuellement

```sql
SELECT * FROM update_all_addon_metrics();
```

### Vérifier l'état des triggers

```sql
SELECT tgname, tgrelid::regclass, tgenabled
FROM pg_trigger
WHERE tgname LIKE '%addon%';
```

### Voir les statistiques globales

```sql
SELECT
  COUNT(*) as total_addons,
  AVG(popularity)::NUMERIC(10,2) as avg_popularity,
  AVG(rating)::NUMERIC(10,2) as avg_rating
FROM addons
WHERE is_active = true;
```

## 📝 Notes importantes

1. **Performance:** Les triggers sont optimisés pour ne mettre à jour que les addons concernés
2. **Valeurs par défaut:** Si aucune donnée n'est disponible, les valeurs actuelles sont conservées
3. **Atomicité:** Les mises à jour sont transactionnelles
4. **Logging:** Les fonctions utilisent `RAISE NOTICE` pour le debugging

## 🐛 Debugging

### Activer les logs détaillés

Les fonctions SQL génèrent automatiquement des logs avec `RAISE NOTICE`.

Pour les voir dans psql:
```bash
SET client_min_messages TO NOTICE;
SELECT update_addon_metrics(1);
```

### Vérifier les données JSONB dans bookings

```sql
SELECT
  id,
  jsonb_pretty(selected_addons) as addons
FROM bookings
WHERE selected_addons IS NOT NULL
LIMIT 5;
```

### Comparer les métriques actuelles vs calculées

```sql
SELECT * FROM get_addon_metrics_report();
```

## 📚 Ressources

- **Migration SQL:** `addon_automatic_metrics_system.sql`
- **Script Node.js:** `src/jobs/updateAddonMetrics.js`
- **Table principale:** `addons`
- **Table des avis:** `addon_reviews`
- **Vue statistiques:** `addon_statistics`

## ✅ Checklist de vérification

- [x] Table `addon_reviews` créée
- [x] Fonctions de calcul créées
- [x] Triggers automatiques actifs
- [x] Vue `addon_statistics` fonctionnelle
- [x] Script Node.js opérationnel
- [x] Tests effectués avec succès

## 🔮 Évolutions futures possibles

1. **Pondération temporelle:** Donner plus de poids aux avis récents
2. **Badges dynamiques:** "Nouveau", "En tendance", "Choix du mois"
3. **Recommandations personnalisées:** Basées sur l'historique utilisateur
4. **Analytics avancés:** Dashboard admin pour visualiser les tendances
5. **A/B Testing:** Tester différents algorithmes de calcul
6. **Machine Learning:** Prédire la popularité future d'un addon
