#!/bin/bash

# ======================================================================
# SCRIPT DE SCAFFOLDING POUR LE PROJET FRONTEND "Ebenezer Tours"
# Version optimisée pour une utilisation avec React + Tailwind CSS.
# ======================================================================

# Message de début
echo "Création de la structure professionnelle du projet frontend (avec Tailwind CSS)..."

# --- Création de la structure de base ---
mkdir -p frontend/public
mkdir -p frontend/src

# --- Dossier `public` ---
# Pour les fichiers statiques comme Font Awesome
mkdir -p frontend/public/css
mkdir -p frontend/public/webfonts
touch frontend/public/index.html

# --- Dossier `src` ---
mkdir -p frontend/src/assets/images
mkdir -p frontend/src/components/common
mkdir -p frontend/src/components/home
mkdir -p frontend/src/components/tours
mkdir -p frontend/src/components/admin
mkdir -p frontend/src/contexts
mkdir -p frontend/src/hooks
mkdir -p frontend/src/pages/admin
mkdir -p frontend/src/services

# --- Création des fichiers ---

echo "Création des fichiers principaux de l'application..."
touch frontend/src/App.jsx
touch frontend/src/main.jsx
touch frontend/src/index.css # Ce fichier est maintenant utilisé pour les directives Tailwind

echo "Création des pages publiques..."
touch frontend/src/pages/HomePage.jsx
touch frontend/src/pages/ToursPage.jsx
touch frontend/src/pages/TourDetailPage.jsx
touch frontend/src/pages/AboutUsPage.jsx
touch frontend/src/pages/ContactPage.jsx
touch frontend/src/pages/TermsPage.jsx
touch frontend/src/pages/NotFoundPage.jsx

echo "Création des pages d'authentification et client..."
touch frontend/src/pages/RegisterPage.jsx
touch frontend/src/pages/LoginPage.jsx
touch frontend/src/pages/VerifyEmailPage.jsx
touch frontend/src/pages/ForgotPasswordPage.jsx
touch frontend/src/pages/ResetPasswordPage.jsx
touch frontend/src/pages/MyBookingsPage.jsx

echo "Création des pages d'administration..."
touch frontend/src/pages/admin/AdminDashboardPage.jsx
touch frontend/src/pages/admin/AdminToursPage.jsx
touch frontend/src/pages/admin/AdminBookingsPage.jsx
touch frontend/src/pages/admin/AdminCatalogPage.jsx
touch frontend/src/pages/admin/AdminUsersPage.jsx
touch frontend/src/pages/admin/AdminReviewsPage.jsx

echo "Création des composants réutilisables..."
touch frontend/src/components/common/Navbar.jsx
touch frontend/src/components/common/Footer.jsx
touch frontend/src/components/common/FloatingWhatsApp.jsx
touch frontend/src/components/home/Hero.jsx
touch frontend/src/components/home/TourSection.jsx
touch frontend/src/components/tours/TourCard.jsx
touch frontend/src/components/admin/AdminLayout.jsx

echo "Création des fichiers de logique (contexte, services, hooks)..."
touch frontend/src/contexts/AuthContext.jsx
touch frontend/src/services/api.js
touch frontend/src/services/authService.js
touch frontend/src/services/tourService.js
touch frontend/src/services/bookingService.js
touch frontend/src/hooks/useAuth.js

echo "Création des fichiers de configuration à la racine..."
touch frontend/.gitignore
touch frontend/package.json
touch frontend/vite.config.js
touch frontend/tailwind.config.js # NOUVEAU
touch frontend/postcss.config.js  # NOUVEAU

# Message de confirmation
echo "------------------------------------------------------"
echo "La structure du projet frontend a été créée avec succès !"
echo "------------------------------------------------------"

