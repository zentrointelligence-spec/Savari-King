# 🚀 Guide de Démarrage Rapide - Système des Addons

**Pour démarrer rapidement avec le système des addons en 15 minutes**

---

## ✅ Prérequis

- ✅ PostgreSQL installé et démarré
- ✅ Node.js installé (v14+)
- ✅ Backend fonctionnel
- ✅ Frontend fonctionnel
- ✅ Base de données `ebookingsam` créée

---

## 📋 Étapes de Configuration (15 min)

### **Étape 1: Base de Données** (3 min)

```bash
cd backend
PGPASSWORD=postgres psql -U postgres -d ebookingsam -f src/db/migrations/addon_automatic_metrics_system.sql
```

✅ **Résultat attendu:**
```
CREATE TABLE
CREATE FUNCTION
CREATE TRIGGER
...
Migration completed successfully!
```

### **Étape 2: Backend** (2 min)

Le backend est déjà configuré ! Les routes sont actives sur:
- `http://localhost:5000/api/addon-reviews/*`

**Vérifier:**
```bash
curl http://localhost:5000/api/addon-reviews/addon/1/stats
```

### **Étape 3: Frontend - Ajouter la Route** (3 min)

**Fichier:** `frontend/src/App.jsx`

```jsx
// 1. Import
import MyAddonReviewsPage from './pages/MyAddonReviewsPage';

// 2. Ajouter la route (dans le <Routes>)
<Route path="/my-addon-reviews" element={<MyAddonReviewsPage />} />
```

### **Étape 4: Ajouter le Lien dans le Menu** (2 min)

**Fichier:** `frontend/src/components/common/Layout.jsx` ou `Header.jsx`

```jsx
// Dans le menu utilisateur (quand connecté)
<Link to="/my-addon-reviews" className="...">
  <FontAwesomeIcon icon={faStar} className="mr-2" />
  Rate Your Experience
</Link>
```

### **Étape 5: Tester** (5 min)

1. **Créer une réservation test avec addon**
```sql
-- Modifier une réservation existante pour la rendre éligible
UPDATE bookings
SET travel_date = CURRENT_DATE - INTERVAL '1 day',
    selected_addons = '[{"id": 1, "quantity": 1}]'::jsonb
WHERE id = 1;
```

2. **Accéder à la page**
```
http://localhost:3000/my-addon-reviews
```

3. **Laisser un avis**
- Cliquer sur "Write Review"
- Noter 5 étoiles
- Ajouter un commentaire
- Soumettre

4. **Vérifier les métriques**
```bash
cd backend
node src/jobs/updateAddonMetrics.js report
```

---

## 🔧 Configuration CRON (Optionnel - 5 min)

### **Windows:**

1. Ouvrir Task Scheduler (`Win + R` → `taskschd.msc`)
2. Créer tâche de base
3. Nom: `Addon Metrics Update`
4. Déclencheur: Quotidien à 2h00
5. Action: `C:\path\to\backend\update_addon_metrics.bat`
6. OK

### **Linux/Mac:**

```bash
crontab -e

# Ajouter:
0 2 * * * cd /path/to/backend && node src/jobs/updateAddonMetrics.js update
```

---

## ✨ C'est Prêt!

Votre système d'addons est maintenant fonctionnel avec:

- ✅ Métriques automatiques
- ✅ Système d'avis
- ✅ Interface utilisateur
- ✅ API complète
- ✅ Mise à jour quotidienne (optionnel)

---

## 🧪 Test Rapide End-to-End

1. **Créer un addon** (si pas déjà fait)
```sql
INSERT INTO addons (name, price, category, description)
VALUES ('Test Addon', 1000, 'test', 'Test description');
```

2. **L'associer à un tour**
```sql
INSERT INTO touraddons (tour_id, addon_id)
VALUES (1, (SELECT id FROM addons WHERE name = 'Test Addon'));
```

3. **Créer une réservation test**
```sql
INSERT INTO bookings (
  user_id, tour_id, package_tier_id, travel_date,
  number_of_persons, selected_addons, status
) VALUES (
  1, 1, 1, CURRENT_DATE - INTERVAL '1 day',
  2, '[{"id": 1, "quantity": 1}]'::jsonb, 'Confirmed'
);
```

4. **Accéder à `/my-addon-reviews`**
5. **Laisser un avis**
6. **Vérifier la mise à jour des métriques**

---

## 📚 Documentation Complète

Pour plus de détails, consultez:

- `COMPLETE_ADDON_SYSTEM_SUMMARY.md` - Vue d'ensemble complète
- `ADDON_METRICS_SYSTEM_README.md` - Documentation métriques
- `ADDON_REVIEWS_COMPLETE_IMPLEMENTATION.md` - Documentation avis
- `CRON_JOB_SETUP_GUIDE.md` - Guide CRON détaillé

---

## 🆘 Problèmes Courants

### **Erreur: "Cannot find module"**
```bash
cd backend
npm install
```

### **Erreur: "Table addon_reviews does not exist"**
```bash
cd backend
PGPASSWORD=postgres psql -U postgres -d ebookingsam -f src/db/migrations/addon_automatic_metrics_system.sql
```

### **Pas de réservations éligibles**
- Vérifier que `travel_date` est dans le passé
- Vérifier que `status` est `Confirmed` ou `Completed`
- Vérifier que `selected_addons` n'est pas null

### **Les métriques ne se mettent pas à jour**
```bash
cd backend
node src/jobs/updateAddonMetrics.js update
```

---

## 💬 Support

En cas de problème:
1. Vérifier les logs console (frontend et backend)
2. Vérifier la base de données
3. Consulter la documentation complète
4. Relire ce guide

---

**Temps total:** ~15-20 minutes
**Difficulté:** ⭐⭐ (Facile)
**Résultat:** Système complet opérationnel 🎉
