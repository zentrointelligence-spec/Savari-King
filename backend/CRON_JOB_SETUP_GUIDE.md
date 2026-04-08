# 📅 Guide de Configuration du CRON Job - Mise à Jour Automatique des Métriques

Ce guide explique comment configurer l'exécution automatique quotidienne du script de mise à jour des métriques d'addons.

---

## 🪟 **Windows - Task Scheduler**

### **Étape 1: Ouvrir le Planificateur de Tâches**

1. Appuyez sur `Win + R`
2. Tapez `taskschd.msc` et appuyez sur Entrée
3. Ou recherchez "Planificateur de tâches" dans le menu Démarrer

### **Étape 2: Créer une Nouvelle Tâche**

1. Dans le panneau de droite, cliquez sur **"Créer une tâche de base..."**
2. Nommez la tâche: `Addon Metrics Update - Daily`
3. Description: `Updates addon popularity and rating metrics based on bookings and reviews`
4. Cliquez sur **Suivant**

### **Étape 3: Configurer le Déclencheur**

1. Sélectionnez **"Quotidien"**
2. Cliquez sur **Suivant**
3. **Heure de démarrage:** `02:00:00` (2h du matin)
4. **Répéter tous les:** `1 jours`
5. Cliquez sur **Suivant**

### **Étape 4: Configurer l'Action**

1. Sélectionnez **"Démarrer un programme"**
2. Cliquez sur **Suivant**
3. **Programme/script:**
   ```
   C:\Users\Administrator\Desktop\Sam\Booking Website\ebooking-app\backend\update_addon_metrics.bat
   ```
   OU directement Node.js:
   ```
   C:\Program Files\nodejs\node.exe
   ```

4. **Arguments (si Node.js direct):**
   ```
   src\jobs\updateAddonMetrics.js update
   ```

5. **Commencer dans (obligatoire):**
   ```
   C:\Users\Administrator\Desktop\Sam\Booking Website\ebooking-app\backend
   ```

6. Cliquez sur **Suivant**

### **Étape 5: Finaliser**

1. Cochez **"Ouvrir la boîte de dialogue Propriétés..."**
2. Cliquez sur **Terminer**

### **Étape 6: Paramètres Avancés**

Dans la fenêtre Propriétés:

1. Onglet **Général:**
   - ☑ **Exécuter même si l'utilisateur n'est pas connecté**
   - ☑ **Exécuter avec les autorisations maximales**

2. Onglet **Déclencheurs:**
   - Vérifier que l'heure est correcte (02:00)

3. Onglet **Actions:**
   - Vérifier le chemin du programme

4. Onglet **Conditions:**
   - ☐ Décocher "Démarrer la tâche uniquement si l'ordinateur est branché sur secteur"
   - ☑ **Réveiller l'ordinateur pour exécuter cette tâche** (optionnel)

5. Onglet **Paramètres:**
   - ☑ **Autoriser l'exécution de la tâche à la demande**
   - ☑ **Si la tâche échoue, redémarrer toutes les:** `10 minutes`
   - **Tentatives de redémarrage:** `3`

6. Cliquez sur **OK**

### **Étape 7: Tester la Tâche**

1. Trouvez votre tâche dans la liste
2. Clic droit → **Exécuter**
3. Vérifiez les logs dans l'onglet **Historique**

---

## 🐧 **Linux/Mac - Crontab**

### **Étape 1: Rendre le Script Exécutable**

```bash
cd /path/to/ebooking-app/backend
chmod +x update_addon_metrics.sh
```

### **Étape 2: Ouvrir Crontab**

```bash
crontab -e
```

Si c'est la première fois, choisissez votre éditeur préféré (nano, vim, etc.)

### **Étape 3: Ajouter l'Entrée Cron**

Ajoutez la ligne suivante à la fin du fichier:

```cron
# Addon Metrics Update - Daily at 2 AM
0 2 * * * cd /path/to/ebooking-app/backend && /usr/bin/node src/jobs/updateAddonMetrics.js update >> /path/to/logs/addon-metrics-update.log 2>&1
```

**Explication:**
- `0 2 * * *` : Tous les jours à 2h00
- `cd /path/to/...` : Se déplacer dans le répertoire backend
- `&& /usr/bin/node ...` : Exécuter le script
- `>> /path/to/logs/...` : Rediriger la sortie vers un fichier log
- `2>&1` : Rediriger les erreurs aussi

### **Étape 4: Trouver le Chemin de Node**

```bash
which node
# Exemple de sortie: /usr/bin/node
```

Utilisez ce chemin dans votre commande cron.

### **Étape 5: Sauvegarder et Quitter**

- **Nano:** `Ctrl + X`, puis `Y`, puis `Entrée`
- **Vim:** `Esc`, puis `:wq`, puis `Entrée`

### **Étape 6: Vérifier la Configuration**

```bash
crontab -l
```

Vous devriez voir votre nouvelle entrée.

### **Étape 7: Vérifier les Logs**

```bash
# Créer le dossier de logs
mkdir -p /path/to/logs

# Voir les logs en temps réel
tail -f /path/to/logs/addon-metrics-update.log
```

---

## 📋 **Syntaxe Cron Expliquée**

```
* * * * *
│ │ │ │ │
│ │ │ │ └─── Jour de la semaine (0-7, 0 et 7 = Dimanche)
│ │ │ └───── Mois (1-12)
│ │ └─────── Jour du mois (1-31)
│ └───────── Heure (0-23)
└─────────── Minute (0-59)
```

### **Exemples d'horaires:**

```cron
# Tous les jours à 2h00
0 2 * * *

# Tous les jours à 2h30
30 2 * * *

# Toutes les heures
0 * * * *

# Tous les dimanches à 3h00
0 3 * * 0

# Le 1er de chaque mois à 2h00
0 2 1 * *

# Tous les 6 heures
0 */6 * * *

# Du lundi au vendredi à 2h00
0 2 * * 1-5
```

---

## 🧪 **Tester Manuellement**

### **Windows:**

```cmd
cd C:\Users\Administrator\Desktop\Sam\Booking Website\ebooking-app\backend
update_addon_metrics.bat
```

OU

```cmd
cd C:\Users\Administrator\Desktop\Sam\Booking Website\ebooking-app\backend
node src\jobs\updateAddonMetrics.js update
```

### **Linux/Mac:**

```bash
cd /path/to/ebooking-app/backend
./update_addon_metrics.sh
```

OU

```bash
cd /path/to/ebooking-app/backend
node src/jobs/updateAddonMetrics.js update
```

---

## 📊 **Vérifier que ça Fonctionne**

### **Méthode 1: Voir les Logs**

Le script affiche un résumé complet:

```
🚀 Starting addon metrics update...
📅 Date: 2025-10-02T09:02:33.526Z
────────────────────────────────────────────────────────────
✅ Successfully updated 8 addons

📊 Updated Metrics Summary:
────────────────────────────────────────────────────────────
ID  | Popularity | Rating
────────────────────────────────────────────────────────────
1   | 92%        | 4.90/5
2   | 78%        | 4.70/5
...
```

### **Méthode 2: Vérifier en Base de Données**

```sql
-- Voir la dernière mise à jour
SELECT id, name, popularity, rating, updated_at
FROM addons
WHERE is_active = true
ORDER BY updated_at DESC;

-- Générer un rapport
SELECT * FROM get_addon_metrics_report();
```

### **Méthode 3: Voir les Logs Windows**

1. Ouvrir le Planificateur de Tâches
2. Sélectionner votre tâche
3. Onglet **Historique** (activer l'historique si nécessaire)
4. Vérifier les exécutions récentes

---

## 🔧 **Dépannage**

### **Problème: La tâche ne s'exécute pas**

**Windows:**
- Vérifier que le chemin du script est correct
- Vérifier que "Commencer dans" est défini
- Regarder l'historique de la tâche
- Tester manuellement le batch

**Linux/Mac:**
- Vérifier la syntaxe cron: `crontab -l`
- Vérifier les permissions: `ls -l update_addon_metrics.sh`
- Vérifier les logs: `tail -f /path/to/logs/addon-metrics-update.log`
- Tester le script manuellement

### **Problème: Erreur "Cannot find module"**

- Vérifier que vous êtes dans le bon répertoire
- Vérifier que `node_modules` est installé
- Exécuter `npm install` dans le dossier backend

### **Problème: Erreur de connexion à la base de données**

- Vérifier que PostgreSQL est démarré
- Vérifier les variables d'environnement
- Vérifier le fichier `.env` dans backend/

---

## 📧 **Notifications (Optionnel)**

Pour recevoir des notifications par email en cas d'erreur:

### **Linux/Mac avec `mail`:**

```cron
0 2 * * * cd /path/to/backend && node src/jobs/updateAddonMetrics.js update || echo "Addon metrics update failed!" | mail -s "CRON Job Error" your@email.com
```

### **Avec un service comme SendGrid/Mailgun:**

Modifier le script Node.js pour envoyer un email en cas d'erreur.

---

## ✅ **Checklist de Vérification**

- [ ] Script `update_addon_metrics.bat` créé (Windows)
- [ ] Script `update_addon_metrics.sh` créé et exécutable (Linux/Mac)
- [ ] Tâche planifiée créée dans Task Scheduler (Windows)
- [ ] Entrée cron ajoutée dans crontab (Linux/Mac)
- [ ] Test manuel réussi
- [ ] Logs configurés
- [ ] Première exécution automatique vérifiée
- [ ] Métriques mises à jour confirmées en BDD

---

## 🎯 **Recommandations**

1. **Horaire:** 2h du matin (faible trafic)
2. **Fréquence:** Quotidienne (suffisant pour la plupart des cas)
3. **Logs:** Conserver les 30 derniers jours
4. **Monitoring:** Vérifier hebdomadairement que ça fonctionne
5. **Backup:** Faire un backup de la BDD avant chaque exécution (optionnel)

---

## 📚 **Ressources**

- **Crontab Guru:** https://crontab.guru/ (générateur d'expressions cron)
- **Windows Task Scheduler Docs:** https://docs.microsoft.com/en-us/windows/win32/taskschd/
- **Node.js Process Management:** PM2, Forever, etc.

---

**Configuration créée le:** 2 Octobre 2025
**Testé sur:** Windows 11, Ubuntu 22.04, macOS
**Statut:** ✅ Ready for Production
