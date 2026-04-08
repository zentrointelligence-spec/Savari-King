# 🚀 Guide d'Installation - Système Quote Review & Payment

## 📋 Prérequis

### Logiciels Requis:
- **Node.js**: v18.x ou supérieur
- **PostgreSQL**: v14.x ou supérieur
- **npm**: v9.x ou supérieur
- **Git**: Pour cloner le repository

### Vérification des versions:
```bash
node --version    # v18.x+
npm --version     # v9.x+
psql --version    # PostgreSQL 14.x+
```

---

## 📦 Installation Backend

### Étape 1: Cloner et Installer les Dépendances

```bash
cd backend
npm install
```

### Étape 2: Configuration de la Base de Données

#### 2.1 Créer la base de données:
```bash
psql -U postgres
CREATE DATABASE ebookingsam;
\q
```

#### 2.2 Exécuter les migrations:
```bash
# Table booking_quote_revisions
PGPASSWORD=postgres psql -U postgres -d ebookingsam -f src/db/migrations/create_booking_quote_revisions.sql

# Table email_logs
PGPASSWORD=postgres psql -U postgres -d ebookingsam -f src/db/migrations/create_email_logs_table.sql
```

#### 2.3 Vérifier les tables:
```bash
PGPASSWORD=postgres psql -U postgres -d ebookingsam -c "\dt"
```

Vous devriez voir:
- `booking_quote_revisions`
- `email_logs`
- `bookings`
- `tours`
- `users`
- (autres tables existantes)

### Étape 3: Configuration des Variables d'Environnement

Créer/éditer `backend/.env`:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ebookingsam
DB_USER=postgres
DB_PASSWORD=postgres

# JWT
JWT_SECRET=votre_secret_jwt_tres_securise_ici

# Server
PORT=5000
NODE_ENV=development

# Frontend URL (pour emails)
FRONTEND_URL=http://localhost:3000

# Email (pour production)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./public/uploads
```

### Étape 4: Créer les Dossiers Nécessaires

```bash
cd backend
mkdir -p public/quotes
mkdir -p public/uploads
mkdir -p logs
```

### Étape 5: Démarrer le Serveur

#### Mode Développement (avec auto-reload):
```bash
npm run dev
```

#### Mode Production:
```bash
npm start
```

#### Vérification:
```
✅ Server running on http://localhost:5000
✅ Database connected successfully
✅ Routes loaded
```

Tester: `curl http://localhost:5000/api/health`

---

## 🎨 Installation Frontend

### Étape 1: Installer les Dépendances

```bash
cd frontend
npm install
```

### Étape 2: Configuration

Créer/éditer `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000
```

### Étape 3: Démarrer le Dev Server

```bash
npm run dev
```

Le frontend sera disponible sur: `http://localhost:3000`

### Étape 4: Build Production

```bash
npm run build
```

Les fichiers seront générés dans `frontend/dist/`

---

## 🧪 Test de l'Installation

### Test 1: Backend API

```bash
# Health check
curl http://localhost:5000/api/health

# Devrait retourner:
{
  "status": "OK",
  "timestamp": "2025-01-19T...",
  "uptime": 123.45
}
```

### Test 2: Connexion Base de Données

```bash
PGPASSWORD=postgres psql -U postgres -d ebookingsam -c "SELECT COUNT(*) FROM booking_quote_revisions;"
```

### Test 3: Script de Test Automatique

```bash
cd backend
node test-quote-system.js
```

Ce script teste:
1. Connexion admin/user
2. Création réservation
3. Création révision
4. Validation véhicules/add-ons
5. Envoi quote
6. Email logs
7. Paiement simulé

---

## 🔧 Configuration Post-Installation

### 1. Créer un Utilisateur Admin

#### Option A: Via SQL
```sql
INSERT INTO users (full_name, email, password, role, is_verified)
VALUES (
  'Admin User',
  'admin@example.com',
  '$2b$10$YourHashedPasswordHere',
  'admin',
  true
);
```

#### Option B: Via API (Register puis upgrade)
```bash
# 1. Register normal user
curl -X POST http://localhost:5000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Admin User",
    "email": "admin@example.com",
    "password": "admin123",
    "phone": "+1234567890"
  }'

# 2. Upgrade to admin in DB
psql -U postgres -d ebookingsam -c "UPDATE users SET role='admin', is_verified=true WHERE email='admin@example.com';"
```

### 2. Créer des Tours de Test

```sql
-- Tour exemple
INSERT INTO tours (name, description, duration_days, base_price, is_active)
VALUES (
  'Kerala Backwaters Tour',
  'Explore the beautiful backwaters of Kerala',
  4,
  15000,
  true
);
```

### 3. Configurer le Cron Job pour Expiration

#### Linux/Mac (crontab):
```bash
crontab -e

# Ajouter cette ligne (vérifie chaque heure):
0 * * * * curl -X POST http://localhost:5000/api/cron/check-expired-quotes
```

#### Windows (Task Scheduler):
1. Ouvrir Task Scheduler
2. Créer une nouvelle tâche
3. Déclencheur: Chaque heure
4. Action: Démarrer un programme
   - Programme: `curl`
   - Arguments: `-X POST http://localhost:5000/api/cron/check-expired-quotes`

#### Alternative: Node Script en Background
```bash
# Créer un script qui vérifie en boucle
node backend/scripts/cron-daemon.js &
```

---

## 🐛 Troubleshooting

### Problème 1: "EADDRINUSE: port 5000 already in use"

**Solution**:
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :5000
kill -9 <PID>
```

### Problème 2: "Connection refused" à PostgreSQL

**Vérifications**:
```bash
# Vérifier que PostgreSQL est démarré
# Windows:
sc query postgresql-x64-14

# Linux:
sudo systemctl status postgresql

# Tester connexion:
psql -U postgres -d ebookingsam -c "SELECT 1;"
```

### Problème 3: PDFs ne se génèrent pas

**Solutions**:
1. Vérifier que Puppeteer est installé:
   ```bash
   npm list puppeteer
   ```

2. Réinstaller si nécessaire:
   ```bash
   npm install puppeteer --save
   ```

3. Vérifier permissions dossier:
   ```bash
   chmod 755 backend/public/quotes
   ```

4. Vérifier logs:
   ```bash
   tail -f backend/logs/app.log
   ```

### Problème 4: Frontend ne se connecte pas au Backend

**Vérifications**:
1. Backend est démarré sur port 5000
2. `.env` frontend a `VITE_API_URL=http://localhost:5000`
3. CORS est configuré dans backend:
   ```javascript
   // backend/src/index.js
   app.use(cors({
     origin: 'http://localhost:3000',
     credentials: true
   }));
   ```

### Problème 5: "faPaypal is not exported"

**Solution**: Déjà corrigée! Utilisé `faMoneyCheckAlt` à la place.

---

## 📊 Vérification de l'Installation Complète

### Checklist Finale:

#### Backend:
- [ ] Serveur démarre sans erreurs
- [ ] `/api/health` répond
- [ ] Tables DB créées
- [ ] Dossiers `public/quotes` et `public/uploads` existent
- [ ] User admin créé
- [ ] Tours de test créés

#### Frontend:
- [ ] Dev server démarre
- [ ] Page login accessible
- [ ] Connexion admin fonctionne
- [ ] Page My Bookings accessible
- [ ] Page Admin accessible

#### Fonctionnalités:
- [ ] Créer une réservation (user)
- [ ] Review quote (admin)
- [ ] Envoyer quote (admin)
- [ ] PDFs générés
- [ ] Email loggé
- [ ] Countdown timer fonctionne
- [ ] Paiement simulé fonctionne
- [ ] Email logs visibles

---

## 🚀 Mise en Production

### Checklist Production:

#### Backend:
1. **Variables d'environnement**:
   - [ ] `NODE_ENV=production`
   - [ ] `JWT_SECRET` fort et unique
   - [ ] Credentials DB sécurisés
   - [ ] SMTP réel configuré

2. **Sécurité**:
   - [ ] Rate limiting activé
   - [ ] Helmet.js configuré
   - [ ] HTTPS activé
   - [ ] Secrets dans variables d'env (pas hardcodés)

3. **Performance**:
   - [ ] Compression activée
   - [ ] Logs en fichiers (pas console)
   - [ ] PM2 ou équivalent pour process management

4. **Base de données**:
   - [ ] Backups automatiques
   - [ ] Connection pooling optimisé
   - [ ] Index sur colonnes fréquemment queryées

#### Frontend:
1. **Build**:
   - [ ] `npm run build` sans erreurs
   - [ ] Variables d'env production configurées
   - [ ] Assets optimisés

2. **Déploiement**:
   - [ ] CDN pour assets statiques
   - [ ] HTTPS activé
   - [ ] Compression gzip/brotli

---

## 📞 Support

Si vous rencontrez des problèmes:

1. **Vérifier les logs**:
   ```bash
   # Backend
   tail -f backend/logs/app.log

   # Frontend (console navigateur)
   F12 -> Console
   ```

2. **Vérifier la documentation**:
   - `QUOTE_SYSTEM_DOCUMENTATION.md`
   - `README.md`

3. **Tester les endpoints**:
   ```bash
   # Collection Postman fournie
   backend/postman/Quote-System.postman_collection.json
   ```

---

## ✅ Installation Réussie!

Si tous les tests passent, votre système Quote Review & Payment est opérationnel! 🎉

**Prochaines étapes**:
1. Personnaliser les templates d'emails
2. Ajouter vos propres tours
3. Configurer SMTP réel
4. Déployer en production
5. Former les administrateurs

**Bon travail!** 🚀
