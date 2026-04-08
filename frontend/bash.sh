#!/bin/bash

# ======================================================================
# SCAFFOLDING SCRIPT FOR THE "Ebenezer Tours" FRONTEND PROJECT
# Optimized for use with React + Tailwind CSS.
# This script is idempotent: it only creates files and directories
# that do not already exist.
# ======================================================================

# --- Utility Functions ---
create_dir_if_not_exists() {
    if [ ! -d "$1" ]; then
        mkdir -p "$1"
        echo "  [CREATED] Directory: $1"
    else
        echo "  [EXISTS] Directory: $1"
    fi
}

create_file_if_not_exists() {
    if [ ! -f "$1" ]; then
        touch "$1"
        echo "  [CREATED] File: $1"
    else
        echo "  [EXISTS] File: $1"
    fi
}

# Start message
echo "Checking and creating the frontend project structure (with Tailwind CSS)..."

# --- Create base structure ---
echo "-> Base structure..."
create_dir_if_not_exists "public"
create_dir_if_not_exists "src"

# --- `public` directory ---
# For static files like Font Awesome
echo "-> 'public' directory..."
create_dir_if_not_exists "public/css"
create_dir_if_not_exists "public/webfonts"
create_file_if_not_exists "public/index.html"

# --- `src` directory ---
echo "-> 'src' directory..."
create_dir_if_not_exists "src/assets/images"
create_dir_if_not_exists "src/components/common"
create_dir_if_not_exists "src/components/home"
create_dir_if_not_exists "src/components/tours"
create_dir_if_not_exists "src/components/admin"
create_dir_if_not_exists "src/contexts"
create_dir_if_not_exists "src/hooks"
create_dir_if_not_exists "src/pages/admin"
create_dir_if_not_exists "src/services"

# --- File creation ---

echo "-> Main application files..."
create_file_if_not_exists "src/App.jsx"
create_file_if_not_exists "src/main.jsx"
create_file_if_not_exists "src/index.css" # This file is now used for Tailwind directives

echo "-> Public pages..."
create_file_if_not_exists "src/pages/HomePage.jsx"
create_file_if_not_exists "src/pages/ToursPage.jsx"
create_file_if_not_exists "src/pages/TourDetailPage.jsx"
create_file_if_not_exists "src/pages/AboutUsPage.jsx"
create_file_if_not_exists "src/pages/ContactPage.jsx"
create_file_if_not_exists "src/pages/TermsPage.jsx"
create_file_if_not_exists "src/pages/NotFoundPage.jsx"

echo "-> Authentication and client pages..."
create_file_if_not_exists "src/pages/RegisterPage.jsx"
create_file_if_not_exists "src/pages/LoginPage.jsx"
create_file_if_not_exists "src/pages/VerifyEmailPage.jsx"
create_file_if_not_exists "src/pages/ForgotPasswordPage.jsx"
create_file_if_not_exists "src/pages/ResetPasswordPage.jsx"
create_file_if_not_exists "src/pages/MyBookingsPage.jsx"

echo "-> Administration pages..."
create_file_if_not_exists "src/pages/admin/AdminDashboardPage.jsx"
create_file_if_not_exists "src/pages/admin/AdminToursPage.jsx"
create_file_if_not_exists "src/pages/admin/AdminBookingsPage.jsx"
create_file_if_not_exists "src/pages/admin/AdminCatalogPage.jsx"
create_file_if_not_exists "src/pages/admin/AdminUsersPage.jsx"
create_file_if_not_exists "src/pages/admin/AdminReviewsPage.jsx"

echo "-> Reusable components..."
create_file_if_not_exists "src/components/common/Navbar.jsx"
create_file_if_not_exists "src/components/common/Footer.jsx"
create_file_if_not_exists "src/components/common/FloatingWhatsApp.jsx"
create_file_if_not_exists "src/components/home/Hero.jsx"
create_file_if_not_exists "src/components/home/TourSection.jsx"
create_file_if_not_exists "src/components/tours/TourCard.jsx"
create_file_if_not_exists "src/components/admin/AdminLayout.jsx"

echo "-> Logic files (context, services, hooks)..."
create_file_if_not_exists "src/contexts/AuthContext.jsx"
create_file_if_not_exists "src/services/api.js"
create_file_if_not_exists "src/services/authService.js"
create_file_if_not_exists "src/services/tourService.js"
create_file_if_not_exists "src/services/bookingService.js"
create_file_if_not_exists "src/hooks/useAuth.js"

echo "-> Root configuration files..."
create_file_if_not_exists ".gitignore"
create_file_if_not_exists "package.json"
create_file_if_not_exists "vite.config.js"
create_file_if_not_exists "tailwind.config.js" # NEW
create_file_if_not_exists "postcss.config.js"  # NEW

# Confirmation message
echo "------------------------------------------------------"
echo "The frontend project structure has been successfully checked/created!"
echo "------------------------------------------------------"
