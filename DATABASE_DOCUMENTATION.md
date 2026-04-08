# Documentation de la Base de Données - Système de Réservation de Tours

## Informations Générales

**SGBD :** PostgreSQL  
**Schéma principal :** public  
**Nombre total de tables :** 52  
**Nombre total de vues :** 8  
**Nombre total de vues matérialisées :** 1  
**Nombre total de fonctions :** 30+  
**Nombre total d'enregistrements :** ~100,000+

---

## Tables Principales

### 1. Tours

**Description :** Table centrale contenant tous les tours disponibles

**Colonnes principales :**

- `id` (INTEGER PRIMARY KEY) - Identifiant unique
- `name` (VARCHAR(255)) - Nom du tour
- `slug` (VARCHAR(255) UNIQUE) - URL-friendly identifier
- `short_description` (VARCHAR(500)) - Description courte
- `description` (TEXT) - Description complète
- `original_price` (NUMERIC(10,2)) - Prix original
- `discount_percentage` (NUMERIC(5,2)) - Pourcentage de remise
- `final_price` (NUMERIC) - Prix final calculé
- `duration` (VARCHAR) - Durée du tour
- `max_group_size` (INTEGER) - Taille maximale du groupe
- `category_id` (INTEGER) - Référence vers tour_categories
- `destinations` (TEXT[]) - Array des destinations
- `themes` (TEXT[]) - Array des thèmes
- `coordinates` (POINT) - Coordonnées géographiques
- `rating` (NUMERIC(3,2)) - Note moyenne
- `review_count` (INTEGER DEFAULT 0) - Nombre d'avis
- `booking_count` (INTEGER DEFAULT 0) - Nombre de réservations
- `view_count` (INTEGER DEFAULT 0) - Nombre de vues
- `wishlist_count` (INTEGER DEFAULT 0) - Nombre d'ajouts aux favoris
- `is_active` (BOOLEAN DEFAULT true) - Statut actif
- `is_featured` (BOOLEAN DEFAULT false) - Tour mis en avant
- `is_bestseller` (BOOLEAN DEFAULT false) - Best-seller
- `is_new` (BOOLEAN DEFAULT false) - Nouveau tour
- `is_trending` (BOOLEAN DEFAULT false) - Tour tendance
- `family_friendly` (BOOLEAN) - Adapté aux familles
- `eco_friendly` (BOOLEAN DEFAULT false) - Écologique
- `display_order` (INTEGER DEFAULT 0) - Ordre d'affichage
- `meta_title` (VARCHAR(255)) - Titre SEO
- `meta_description` (TEXT) - Description SEO
- `meta_keywords` (VARCHAR(500)) - Mots-clés SEO
- `canonical_url` (VARCHAR(500)) - URL canonique
- `created_at` (TIMESTAMP) - Date de création
- `updated_at` (TIMESTAMP) - Date de mise à jour
- `main_image_url` (VARCHAR(255)) - URL de l'image principale
- `itinerary` (JSONB) - Itinéraire détaillé
- `highlights` (TEXT[]) - Points forts du tour
- `inclusions` (TEXT[]) - Ce qui est inclus
- `exclusions` (TEXT[]) - Ce qui est exclu
- `min_age` (INTEGER DEFAULT 0) - Âge minimum requis
- `languages` (VARCHAR(200) DEFAULT 'English') - Langues disponibles
- `early_bird_discount` (NUMERIC(5,2) DEFAULT 0.00) - Remise early bird
- `group_discount_threshold` (INTEGER DEFAULT 4) - Seuil pour remise groupe
- `group_discount_percentage` (NUMERIC(5,2) DEFAULT 0.00) - Pourcentage remise groupe
- `available_from` (DATE) - Date de début de disponibilité
- `available_until` (DATE) - Date de fin de disponibilité
- `blackout_dates` (JSONB DEFAULT '[]') - Dates de blackout
- `seasonal_pricing` (JSONB DEFAULT '{}') - Tarification saisonnière
- `gallery_images` (TEXT[]) - Images de galerie
- `video_url` (VARCHAR(500)) - URL de la vidéo
- `virtual_tour_url` (VARCHAR(500)) - URL du tour virtuel
- `thumbnail_image` (VARCHAR(255)) - Image miniature
- `starting_location` (VARCHAR(200)) - Lieu de départ
- `ending_location` (VARCHAR(200)) - Lieu d'arrivée
- `covered_destinations` (TEXT[]) - Destinations couvertes
- `cancellation_policy` (TEXT) - Politique d'annulation
- `booking_terms` (TEXT) - Conditions de réservation
- `what_to_bring` (TEXT[]) - Liste des choses à apporter
- `important_notes` (TEXT) - Notes importantes
- `cultural_immersion` (BOOLEAN DEFAULT false) - Immersion culturelle
- `adventure_level` (VARCHAR(20) DEFAULT 'low') - Niveau d'aventure

**Index optimisés :**

- Index composites pour homepage (bestseller, featured, new, trending)
- Index de performance (booking_count, view_count, rating)
- Index de recherche full-text
- Index géospatiaux (coordinates)
- Index par catégorie et prix

### 2. Users

**Description :** Gestion des utilisateurs du système

**Colonnes principales :**

- `id` (SERIAL PRIMARY KEY) - Identifiant unique
- `full_name` (VARCHAR) - Nom complet
- `email` (VARCHAR UNIQUE) - Email de l'utilisateur
- `password` (VARCHAR) - Mot de passe hashé
- `role` (VARCHAR) - Rôle (admin, user, etc.)
- `is_active` (BOOLEAN) - Statut actif
- `last_login` (TIMESTAMP) - Dernière connexion
- `profile_image_url` (VARCHAR) - URL de l'image de profil
- `preferences` (JSONB) - Préférences utilisateur
- `recent_activities` (JSONB) - Activités récentes
- `activity_count` (INTEGER) - Compteur d'activités
- `created_at` (TIMESTAMP) - Date de création
- `updated_at` (TIMESTAMP) - Date de mise à jour

### 3. Reviews

**Description :** Avis et évaluations des tours

**Colonnes principales :**

- `id` (SERIAL PRIMARY KEY) - Identifiant unique
- `user_id` (INTEGER) - Référence vers users
- `tour_id` (INTEGER) - Référence vers tours
- `rating` (INTEGER) - Note (1-5)
- `review_text` (TEXT) - Texte de l'avis
- `is_approved` (BOOLEAN) - Statut d'approbation
- `is_verified_purchase` (BOOLEAN) - Achat vérifié
- `travel_date` (DATE) - Date du voyage
- `helpful_count` (INTEGER) - Nombre de votes utiles
- `created_at` (TIMESTAMP) - Date de création
- `updated_at` (TIMESTAMP) - Date de mise à jour

### 4. Bookings

**Description :** Réservations des tours

**Colonnes principales :**

- `id` (SERIAL PRIMARY KEY) - Identifiant unique
- `tour_id` (INTEGER) - Référence vers tours
- `package_tier_id` (INTEGER) - Référence vers packagetiers
- `booking_date` (DATE) - Date de réservation
- `number_of_people` (INTEGER) - Nombre de personnes
- `total_price` (NUMERIC) - Prix total
- `status` (VARCHAR) - Statut de la réservation
- `customer_name` (VARCHAR) - Nom du client
- `customer_email` (VARCHAR) - Email du client
- `customer_phone` (VARCHAR) - Téléphone du client
- `special_requests` (TEXT) - Demandes spéciales
- `created_at` (TIMESTAMP) - Date de création
- `updated_at` (TIMESTAMP) - Date de mise à jour

### 5. Destinations

**Description :** Destinations touristiques avec informations complètes

**Colonnes principales :**

- `id` (SERIAL PRIMARY KEY) - Identifiant unique
- `name` (VARCHAR) - Nom de la destination
- `slug` (VARCHAR UNIQUE) - URL-friendly identifier
- `description` (TEXT) - Description complète
- `short_description` (VARCHAR) - Description courte
- `country` (VARCHAR) - Pays
- `state_province` (VARCHAR) - État/Province
- `city` (VARCHAR) - Ville
- `coordinates` (POINT) - Coordonnées géographiques
- `timezone` (VARCHAR) - Fuseau horaire
- `currency` (VARCHAR) - Devise locale
- `language` (VARCHAR) - Langue principale
- `climate` (VARCHAR) - Climat
- `best_time_to_visit` (VARCHAR) - Meilleure période
- `activities` (TEXT[]) - Array des activités
- `attractions` (TEXT[]) - Array des attractions
- `features` (TEXT[]) - Array des caractéristiques
- `nearby_destinations` (INTEGER[]) - Destinations proches
- `related_destinations` (INTEGER[]) - Destinations liées
- `parent_destination_id` (INTEGER) - Destination parent
- `tour_count` (INTEGER) - Nombre de tours
- `booking_count` (INTEGER) - Nombre de réservations
- `view_count` (INTEGER) - Nombre de vues
- `rating` (NUMERIC) - Note moyenne
- `popularity_score` (NUMERIC) - Score de popularité
- `trend_score` (NUMERIC) - Score de tendance
- `budget_range` (VARCHAR) - Gamme de budget
- `price_range` (VARCHAR) - Fourchette de prix
- `accommodation_types` (TEXT[]) - Types d'hébergement
- `transportation_options` (TEXT[]) - Options de transport
- `dining_options` (TEXT[]) - Options de restauration
- `shopping_options` (TEXT[]) - Options de shopping
- `nightlife_options` (TEXT[]) - Options de vie nocturne
- `cultural_highlights` (TEXT[]) - Points culturels
- `natural_highlights` (TEXT[]) - Points naturels
- `adventure_activities` (TEXT[]) - Activités d'aventure
- `family_activities` (TEXT[]) - Activités familiales
- `romantic_activities` (TEXT[]) - Activités romantiques
- `accessibility_features` (TEXT[]) - Caractéristiques d'accessibilité
- `safety_rating` (INTEGER) - Note de sécurité
- `infrastructure_rating` (INTEGER) - Note d'infrastructure
- `cleanliness_rating` (INTEGER) - Note de propreté
- `hospitality_rating` (INTEGER) - Note d'hospitalité
- `value_for_money_rating` (INTEGER) - Note rapport qualité-prix
- `instagram_hashtags` (TEXT[]) - Hashtags Instagram
- `photography_spots` (TEXT[]) - Spots photo
- `local_customs` (TEXT) - Coutumes locales
- `dress_code` (TEXT) - Code vestimentaire
- `health_precautions` (TEXT) - Précautions santé
- `visa_requirements` (TEXT) - Exigences de visa
- `entry_fees` (NUMERIC) - Frais d'entrée
- `local_transportation_cost` (NUMERIC) - Coût transport local
- `average_meal_cost` (NUMERIC) - Coût moyen repas
- `accommodation_cost_range` (VARCHAR) - Gamme coût hébergement
- `seasonal_pricing` (JSONB) - Tarification saisonnière
- `weather_data` (JSONB) - Données météo
- `events_calendar` (JSONB) - Calendrier événements
- `local_festivals` (TEXT[]) - Festivals locaux
- `peak_season_months` (INTEGER[]) - Mois haute saison
- `off_season_months` (INTEGER[]) - Mois basse saison
- `crowd_levels` (JSONB) - Niveaux d'affluence
- `is_active` (BOOLEAN) - Statut actif
- `is_featured` (BOOLEAN) - Destination mise en avant
- `is_trending` (BOOLEAN) - Destination tendance
- `is_top_rated` (BOOLEAN) - Destination top-rated
- `has_tours` (BOOLEAN) - A des tours
- `display_order` (INTEGER) - Ordre d'affichage
- `meta_title` (VARCHAR) - Titre SEO
- `meta_description` (TEXT) - Description SEO
- `meta_keywords` (TEXT) - Mots-clés SEO
- `created_at` (TIMESTAMP) - Date de création
- `updated_at` (TIMESTAMP) - Date de mise à jour

### 6. Blog_posts

**Description :** Articles de blog et contenu éditorial

**Colonnes principales :**

- `id` (INTEGER PRIMARY KEY) - Identifiant unique
- `title` (VARCHAR(255)) - Titre de l'article
- `slug` (VARCHAR(255) UNIQUE) - URL-friendly identifier
- `content` (TEXT) - Contenu de l'article
- `excerpt` (TEXT) - Extrait
- `featured_image` (VARCHAR(255)) - Image mise en avant
- `thumbnail_image` (VARCHAR(255)) - Image miniature
- `gallery_images` (TEXT[]) - Images de galerie
- `video_urls` (TEXT[]) - URLs des vidéos
- `author_id` (INTEGER) - Référence vers users
- `category` (VARCHAR(100) DEFAULT 'General') - Catégorie de l'article
- `tags` (TEXT[]) - Array des tags
- `status` (VARCHAR(20) DEFAULT 'draft') - Statut (draft, published, archived)
- `language` (VARCHAR(5) DEFAULT 'en') - Langue de l'article
- `reading_time` (INTEGER DEFAULT 5) - Temps de lecture estimé
- `word_count` (INTEGER DEFAULT 0) - Nombre de mots
- `view_count` (INTEGER DEFAULT 0) - Nombre de vues
- `like_count` (INTEGER DEFAULT 0) - Nombre de likes
- `share_count` (INTEGER DEFAULT 0) - Nombre de partages
- `comment_count` (INTEGER DEFAULT 0) - Nombre de commentaires
- `avg_rating` (NUMERIC(3,2) DEFAULT 0.00) - Note moyenne
- `rating_count` (INTEGER DEFAULT 0) - Nombre d'évaluations
- `bounce_rate` (NUMERIC(5,2) DEFAULT 0.00) - Taux de rebond
- `avg_time_on_page` (INTEGER DEFAULT 0) - Temps moyen sur la page
- `is_published` (BOOLEAN DEFAULT true) - Statut publié
- `is_featured` (BOOLEAN DEFAULT false) - Article mis en avant
- `is_trending` (BOOLEAN DEFAULT false) - Article tendance
- `is_sponsored` (BOOLEAN DEFAULT false) - Article sponsorisé
- `display_order` (INTEGER DEFAULT 0) - Ordre d'affichage
- `meta_title` (VARCHAR(255)) - Titre SEO
- `meta_description` (TEXT) - Description SEO
- `meta_keywords` (TEXT) - Mots-clés SEO
- `canonical_url` (VARCHAR(500)) - URL canonique
- `og_image` (VARCHAR(255)) - Image Open Graph
- `related_tours` (INTEGER[]) - Tours liés
- `related_destinations` (INTEGER[]) - Destinations liées
- `related_posts` (INTEGER[]) - Articles liés
- `table_of_contents` (JSONB DEFAULT '[]') - Table des matières
- `social_media_links` (JSONB) - Liens réseaux sociaux
- `engagement_metrics` (JSONB) - Métriques d'engagement
- `seo_score` (INTEGER) - Score SEO
- `readability_score` (INTEGER) - Score de lisibilité
- `moderation_status` (VARCHAR(20) DEFAULT 'approved') - Statut de modération
- `moderated_by` (INTEGER) - Modérateur
- `moderated_at` (TIMESTAMP) - Date de modération
- `notify_subscribers` (BOOLEAN DEFAULT false) - Notification aux abonnés
- `newsletter_sent` (BOOLEAN DEFAULT false) - Newsletter envoyée
- `social_media_posted` (BOOLEAN DEFAULT false) - Posté sur réseaux sociaux
- `published_at` (TIMESTAMP) - Date de publication
- `scheduled_at` (TIMESTAMP) - Date planifiée
- `created_at` (TIMESTAMP DEFAULT CURRENT_TIMESTAMP) - Date de création
- `updated_at` (TIMESTAMP DEFAULT CURRENT_TIMESTAMP) - Date de mise à jour
- `last_modified_by` (INTEGER) - Dernier modificateur

### 7. Featured_reviews

**Description :** Avis vedettes et témoignages mis en avant sur le site

**Colonnes principales :**

- `id` (INTEGER PRIMARY KEY) - Identifiant unique
- `review_id` (INTEGER) - Référence vers reviews
- `display_order` (INTEGER DEFAULT 0) - Ordre d'affichage
- `is_active` (BOOLEAN DEFAULT true) - Statut actif
- `featured_text` (TEXT) - Texte personnalisé pour la mise en avant
- `featured_image_url` (VARCHAR(500)) - URL de l'image de mise en avant
- `start_date` (DATE) - Date de début de mise en avant
- `end_date` (DATE) - Date de fin de mise en avant
- `section` (VARCHAR(50) DEFAULT 'homepage') - Section où l'avis est mis en avant
- `title` (VARCHAR(255)) - Titre personnalisé pour la mise en avant
- `subtitle` (VARCHAR(500)) - Sous-titre personnalisé
- `button_text` (VARCHAR(100) DEFAULT 'Read More') - Texte du bouton
- `button_url` (VARCHAR(500)) - URL du bouton
- `background_color` (VARCHAR(7) DEFAULT '#ffffff') - Couleur de fond
- `text_color` (VARCHAR(7) DEFAULT '#000000') - Couleur du texte
- `text_position` (VARCHAR(20) DEFAULT 'center') - Position du texte
- `image_position` (VARCHAR(20) DEFAULT 'right') - Position de l'image
- `animation_type` (VARCHAR(50) DEFAULT 'fade') - Type d'animation
- `created_at` (TIMESTAMP DEFAULT CURRENT_TIMESTAMP) - Date de création
- `updated_at` (TIMESTAMP DEFAULT CURRENT_TIMESTAMP) - Date de mise à jour
- `created_by` (INTEGER) - Créé par
- `updated_by` (INTEGER) - Mis à jour par

### 8. Tour_categories

**Description :** Catégories de tours pour l'organisation et la navigation

**Colonnes principales :**

- `id` (INTEGER PRIMARY KEY) - Identifiant unique
- `name` (VARCHAR(100)) - Nom de la catégorie
- `slug` (VARCHAR(100) UNIQUE) - Identifiant URL-friendly
- `description` (TEXT) - Description de la catégorie
- `parent_category_id` (INTEGER) - Catégorie parente
- `display_order` (INTEGER DEFAULT 0) - Ordre d'affichage
- `is_active` (BOOLEAN DEFAULT true) - Statut actif
- `image_url` (VARCHAR(500)) - URL de l'image de la catégorie
- `thumbnail_url` (VARCHAR(500)) - URL de l'image miniature
- `icon` (VARCHAR(50)) - Icône de la catégorie
- `color` (VARCHAR(7)) - Couleur de la catégorie
- `seo_title` (VARCHAR(255)) - Titre SEO
- `seo_description` (TEXT) - Description SEO
- `seo_keywords` (TEXT) - Mots-clés SEO
- `tour_count` (INTEGER DEFAULT 0) - Nombre de tours dans la catégorie
- `level` (INTEGER DEFAULT 1) - Niveau de profondeur
- `path` (VARCHAR(255)) - Chemin hiérarchique
- `is_featured` (BOOLEAN DEFAULT false) - Catégorie vedette
- `featured_order` (INTEGER DEFAULT 0) - Ordre vedette
- `created_at` (TIMESTAMP DEFAULT CURRENT_TIMESTAMP) - Date de création
- `updated_at` (TIMESTAMP DEFAULT CURRENT_TIMESTAMP) - Date de mise à jour
- `created_by` (INTEGER) - Créé par
- `updated_by` (INTEGER) - Mis à jour par

### 9. Special_offers

**Description :** Offres spéciales et promotions sur les tours

**Colonnes principales :**

- `id` (INTEGER PRIMARY KEY) - Identifiant unique
- `title` (VARCHAR(255)) - Titre de l'offre
- `description` (TEXT) - Description de l'offre
- `short_description` (VARCHAR(500)) - Description courte
- `discount_type` (VARCHAR(20)) - Type de réduction (percentage, fixed_amount)
- `discount_value` (NUMERIC(10,2)) - Valeur de la réduction
- `minimum_booking_value` (NUMERIC(10,2) DEFAULT 0.00) - Valeur minimale de réservation
- `maximum_discount` (NUMERIC(10,2)) - Remise maximale
- `applicable_tours` (INTEGER[]) - IDs des tours concernés
- `applicable_categories` (INTEGER[]) - IDs des catégories concernées
- `applicable_destinations` (INTEGER[]) - IDs des destinations concernées
- `start_date` (DATE) - Date de début de l'offre
- `end_date` (DATE) - Date de fin de l'offre
- `is_active` (BOOLEAN DEFAULT true) - Statut actif
- `usage_limit` (INTEGER DEFAULT 0) - Limite d'utilisation (0 = illimité)
- `usage_count` (INTEGER DEFAULT 0) - Nombre d'utilisations
- `code` (VARCHAR(50) UNIQUE) - Code promo
- `is_public` (BOOLEAN DEFAULT true) - Offre publique ou privée
- `banner_image_url` (VARCHAR(500)) - URL de l'image de bannière
- `thumbnail_image_url` (VARCHAR(500)) - URL de l'image miniature
- `terms_conditions` (TEXT) - Conditions générales
- `restrictions` (TEXT) - Restrictions
- `target_audience` (VARCHAR(50) DEFAULT 'all') - Public cible
- `priority` (INTEGER DEFAULT 0) - Priorité d'affichage
- `is_featured` (BOOLEAN DEFAULT false) - Offre vedette
- `notification_sent` (BOOLEAN DEFAULT false) - Notification envoyée
- `created_at` (TIMESTAMP DEFAULT CURRENT_TIMESTAMP) - Date de création
- `updated_at` (TIMESTAMP DEFAULT CURRENT_TIMESTAMP) - Date de mise à jour
- `created_by` (INTEGER) - Créé par
- `updated_by` (INTEGER) - Mis à jour par

### 10. Homepage_settings

**Description :** Paramètres de configuration de la page d'accueil

**Colonnes principales :**

- `id` (INTEGER PRIMARY KEY) - Identifiant unique
- `hero_title` (VARCHAR(255)) - Titre principal de la hero section
- `hero_subtitle` (VARCHAR(500)) - Sous-titre de la hero section
- `hero_background_image` (VARCHAR(500)) - Image de fond de la hero section
- `hero_cta_text` (VARCHAR(100)) - Texte du bouton d'action
- `hero_cta_link` (VARCHAR(500)) - Lien du bouton d'action
- `hero_cta_secondary_text` (VARCHAR(100)) - Texte du bouton secondaire
- `hero_cta_secondary_link` (VARCHAR(500)) - Lien du bouton secondaire
- `featured_tours_title` (VARCHAR(255)) - Titre des tours vedettes
- `featured_tours_subtitle` (VARCHAR(500)) - Sous-titre des tours vedettes
- `featured_tours_count` (INTEGER DEFAULT 6) - Nombre de tours à afficher
- `testimonials_title` (VARCHAR(255)) - Titre des témoignages
- `testimonials_subtitle` (VARCHAR(500)) - Sous-titre des témoignages
- `testimonials_count` (INTEGER DEFAULT 3) - Nombre de témoignages
- `blog_section_title` (VARCHAR(255)) - Titre de la section blog
- `blog_section_subtitle` (VARCHAR(500)) - Sous-titre de la section blog
- `blog_posts_count` (INTEGER DEFAULT 3) - Nombre d'articles à afficher
- `newsletter_title` (VARCHAR(255)) - Titre de la newsletter
- `newsletter_subtitle` (VARCHAR(500)) - Sous-titre de la newsletter
- `newsletter_placeholder` (VARCHAR(100) DEFAULT 'Enter your email') - Placeholder email
- `seo_title` (VARCHAR(255)) - Titre SEO de la page
- `seo_description` (TEXT) - Description SEO de la page
- `seo_keywords` (TEXT) - Mots-clés SEO
- `meta_image` (VARCHAR(500)) - Image meta
- `is_active` (BOOLEAN DEFAULT true) - Paramètres actifs
- `last_updated_by` (INTEGER) - Dernier modificateur
- `created_at` (TIMESTAMP DEFAULT CURRENT_TIMESTAMP) - Date de création
- `updated_at` (TIMESTAMP DEFAULT CURRENT_TIMESTAMP) - Date de mise à jour
- `version` (INTEGER DEFAULT 1) - Version des paramètres

---

## Tables de Configuration

### Tour_categories

**Description :** Catégories de tours

- Gestion hiérarchique des catégories
- Statistiques automatiques (tour_count, avg_rating)
- Optimisations SEO intégrées

### Special_offers

**Description :** Offres spéciales et promotions

- Gestion des dates d'activation
- Types d'offres multiples
- Calculs automatiques de remises

### Homepage_settings

**Description :** Configuration de la page d'accueil

- Sections configurables
- Tests A/B intégrés
- Gestion du cache automatique

### Blog_categories

**Description :** Catégories pour les articles de blog

- Hiérarchie de catégories (parent/enfant)
- Compteurs automatiques d'articles
- Optimisations SEO intégrées

### Contact_inquiries

**Description :** Demandes de contact et formulaires de contact

**Colonnes principales :**

- `id` (INTEGER PRIMARY KEY) - Identifiant unique
- `name` (VARCHAR(255)) - Nom complet du demandeur
- `email` (VARCHAR(255)) - Email du demandeur
- `phone` (VARCHAR(50)) - Téléphone du demandeur
- `company` (VARCHAR(255)) - Entreprise/Organisation
- `subject` (VARCHAR(255)) - Sujet de la demande
- `message` (TEXT) - Message détaillé
- `inquiry_type` (VARCHAR(50)) - Type de demande (general, booking, support, partnership, media)
- `tour_id` (INTEGER) - ID du tour concerné (optionnel)
- `preferred_contact_method` (VARCHAR(20)) - Méthode de contact préférée
- `preferred_contact_time` (VARCHAR(50)) - Heure de contact préférée
- `budget_range` (VARCHAR(50)) - Fourchette budgétaire
- `travel_date` (DATE) - Date de voyage prévue
- `group_size` (INTEGER) - Taille du groupe
- `priority` (VARCHAR(20) DEFAULT 'medium') - Priorité de la demande (low, medium, high, urgent)
- `status` (VARCHAR(20) DEFAULT 'new') - Statut de la demande (new, in_progress, resolved, closed)
- `assigned_to` (INTEGER) - ID de l'utilisateur assigné
- `response_sent` (BOOLEAN DEFAULT false) - Réponse envoyée
- `response_message` (TEXT) - Message de réponse
- `response_sent_at` (TIMESTAMP) - Date d'envoi de la réponse
- `source` (VARCHAR(50)) - Source de la demande (website, email, phone, social_media)
- `campaign_source` (VARCHAR(255)) - Source de campagne marketing
- `landing_page` (VARCHAR(500)) - Page de destination
- `ip_address` (INET) - Adresse IP
- `user_agent` (TEXT) - User agent
- `referrer` (TEXT) - URL référente
- `created_at` (TIMESTAMP DEFAULT CURRENT_TIMESTAMP) - Date de création
- `updated_at` (TIMESTAMP DEFAULT CURRENT_TIMESTAMP) - Date de mise à jour
- `resolved_at` (TIMESTAMP) - Date de résolution
- `follow_up_required` (BOOLEAN DEFAULT false) - Suivi requis
- `follow_up_date` (DATE) - Date de suivi

### Dashboard_metrics

**Description :** Métriques et statistiques du tableau de bord

**Colonnes principales :**

- `id` (INTEGER PRIMARY KEY) - Identifiant unique
- `metric_name` (VARCHAR(100)) - Nom de la métrique
- `metric_value` (NUMERIC(15,2)) - Valeur de la métrique
- `metric_type` (VARCHAR(50)) - Type de métrique (count, percentage, amount, ratio)
- `date` (DATE) - Date de la métrique
- `period` (VARCHAR(20)) - Période (daily, weekly, monthly, yearly)
- `category` (VARCHAR(50)) - Catégorie de la métrique (sales, users, tours, reviews)
- `subcategory` (VARCHAR(50)) - Sous-catégorie
- `source` (VARCHAR(50)) - Source des données (database, api, calculation)
- `target_value` (NUMERIC(15,2)) - Valeur cible
- `previous_value` (NUMERIC(15,2)) - Valeur précédente
- `change_percentage` (NUMERIC(5,2)) - Pourcentage de changement
- `trend_direction` (VARCHAR(10)) - Direction de la tendance (up, down, stable)
- `is_positive` (BOOLEAN DEFAULT true) - Indicateur positif/négatif
- `description` (TEXT) - Description de la métrique
- `metadata` (JSONB DEFAULT '{}') - Métadonnées supplémentaires
- `alert_threshold` (NUMERIC(15,2)) - Seuil d'alerte
- `alert_sent` (BOOLEAN DEFAULT false) - Alerte envoyée
- `created_at` (TIMESTAMP DEFAULT CURRENT_TIMESTAMP) - Date de création
- `updated_at` (TIMESTAMP DEFAULT CURRENT_TIMESTAMP) - Date de mise à jour
- `last_calculated_at` (TIMESTAMP) - Dernier calcul

### System_settings

**Description :** Paramètres système et configuration globale

**Colonnes principales :**

- `id` (INTEGER PRIMARY KEY) - Identifiant unique
- `setting_key` (VARCHAR(100) UNIQUE) - Clé du paramètre
- `setting_value` (TEXT) - Valeur du paramètre
- `setting_type` (VARCHAR(20)) - Type de paramètre (string, number, boolean, json, array)
- `description` (TEXT) - Description du paramètre
- `is_public` (BOOLEAN DEFAULT false) - Paramètre public ou admin
- `category` (VARCHAR(50)) - Catégorie du paramètre (general, email, payment, security, seo)
- `validation_rules` (JSONB DEFAULT '{}') - Règles de validation
- `options` (JSONB DEFAULT '{}') - Options disponibles pour les paramètres de type select
- `default_value` (TEXT) - Valeur par défaut
- `is_encrypted` (BOOLEAN DEFAULT false) - Valeur chiffrée
- `is_overridable` (BOOLEAN DEFAULT true) - Peut être surchargé
- `environment` (VARCHAR(20) DEFAULT 'production') - Environnement (development, staging, production)
- `created_at` (TIMESTAMP DEFAULT CURRENT_TIMESTAMP) - Date de création
- `updated_at` (TIMESTAMP DEFAULT CURRENT_TIMESTAMP) - Date de mise à jour
- `updated_by` (INTEGER) - Mis à jour par

### Notification_templates

**Description :** Templates de notifications email et système

**Colonnes principales :**

- `id` (INTEGER PRIMARY KEY) - Identifiant unique
- `template_name` (VARCHAR(100)) - Nom du template
- `template_type` (VARCHAR(20)) - Type de notification (email, sms, push, in_app)
- `channel` (VARCHAR(20)) - Canal de communication (email, sms, push, webhook)
- `subject` (VARCHAR(255)) - Sujet de la notification
- `title` (VARCHAR(255)) - Titre de la notification
- `content` (TEXT) - Contenu du template
- `html_content` (TEXT) - Contenu HTML du template
- `text_content` (TEXT) - Contenu texte du template
- `variables` (JSONB DEFAULT '{}') - Variables disponibles dans le template
- `placeholders` (JSONB DEFAULT '{}') - Placeholders avec descriptions
- `is_active` (BOOLEAN DEFAULT true) - Template actif
- `is_system` (BOOLEAN DEFAULT false) - Template système (non modifiable)
- `priority` (INTEGER DEFAULT 1) - Priorité d'envoi
- `delay_minutes` (INTEGER DEFAULT 0) - Délai d'envoi en minutes
- `max_retries` (INTEGER DEFAULT 3) - Nombre maximum de tentatives
- `retry_delay_minutes` (INTEGER DEFAULT 5) - Délai entre tentatives
- `bcc_recipients` (TEXT[]) - Destinataires en copie cachée
- `cc_recipients` (TEXT[]) - Destinataires en copie
- `attachment_template` (TEXT) - Template pour pièces jointes
- `created_at` (TIMESTAMP DEFAULT CURRENT_TIMESTAMP) - Date de création
- `updated_at` (TIMESTAMP DEFAULT CURRENT_TIMESTAMP) - Date de mise à jour
- `created_by` (INTEGER) - Créé par
- `updated_by` (INTEGER) - Mis à jour par

### Packagetiers

**Description :** Niveaux de packages et tarifs

**Colonnes principales :**

- `id` (INTEGER PRIMARY KEY) - Identifiant unique
- `name` (VARCHAR(100)) - Nom du niveau
- `slug` (VARCHAR(100) UNIQUE) - Identifiant URL-friendly
- `description` (TEXT) - Description du niveau
- `short_description` (VARCHAR(500)) - Description courte
- `price` (NUMERIC(10,2)) - Prix du niveau
- `compare_at_price` (NUMERIC(10,2)) - Prix de comparaison
- `features` (JSONB DEFAULT '[]') - Fonctionnalités incluses
- `included_services` (TEXT[]) - Services inclus
- `excluded_services` (TEXT[]) - Services exclus
- `max_group_size` (INTEGER) - Taille maximale du groupe
- `min_group_size` (INTEGER DEFAULT 1) - Taille minimale du groupe
- `duration_days` (INTEGER) - Durée en jours
- `is_active` (BOOLEAN DEFAULT true) - Statut actif
- `is_featured` (BOOLEAN DEFAULT false) - Niveau vedette
- `display_order` (INTEGER DEFAULT 0) - Ordre d'affichage
- `color` (VARCHAR(7)) - Couleur du niveau
- `badge_text` (VARCHAR(50)) - Texte du badge
- `created_at` (TIMESTAMP DEFAULT CURRENT_TIMESTAMP) - Date de création
- `updated_at` (TIMESTAMP DEFAULT CURRENT_TIMESTAMP) - Date de mise à jour
- `created_by` (INTEGER) - Créé par
- `updated_by` (INTEGER) - Mis à jour par

### Addons

**Description :** Suppléments et options additionnelles

**Colonnes principales :**

- `id` (INTEGER PRIMARY KEY) - Identifiant unique
- `name` (VARCHAR(255)) - Nom du supplément
- `slug` (VARCHAR(255) UNIQUE) - Identifiant URL-friendly
- `description` (TEXT) - Description du supplément
- `short_description` (VARCHAR(500)) - Description courte
- `price` (NUMERIC(10,2)) - Prix du supplément
- `compare_at_price` (NUMERIC(10,2)) - Prix de comparaison
- `is_per_person` (BOOLEAN DEFAULT false) - Prix par personne
- `is_per_group` (BOOLEAN DEFAULT false) - Prix par groupe
- `is_per_day` (BOOLEAN DEFAULT false) - Prix par jour
- `is_required` (BOOLEAN DEFAULT false) - Supplément obligatoire
- `is_active` (BOOLEAN DEFAULT true) - Statut actif
- `is_featured` (BOOLEAN DEFAULT false) - Supplément vedette
- `max_quantity` (INTEGER DEFAULT 1) - Quantité maximale
- `min_quantity` (INTEGER DEFAULT 0) - Quantité minimale
- `display_order` (INTEGER DEFAULT 0) - Ordre d'affichage
- `category` (VARCHAR(50)) - Catégorie du supplément
- `image_url` (VARCHAR(500)) - URL de l'image
- `created_at` (TIMESTAMP DEFAULT CURRENT_TIMESTAMP) - Date de création
- `updated_at` (TIMESTAMP DEFAULT CURRENT_TIMESTAMP) - Date de mise à jour
- `created_by` (INTEGER) - Créé par
- `updated_by` (INTEGER) - Mis à jour par

### Vehicles

**Description :** Véhicules et moyens de transport

**Colonnes principales :**

- `id` (INTEGER PRIMARY KEY) - Identifiant unique
- `name` (VARCHAR(255)) - Nom du véhicule
- `type` (VARCHAR(50)) - Type de véhicule (bus, car, van, boat, plane, train)
- `model` (VARCHAR(100)) - Modèle du véhicule
- `make` (VARCHAR(100)) - Marque du véhicule
- `year` (INTEGER) - Année de fabrication
- `capacity` (INTEGER) - Capacité du véhicule
- `description` (TEXT) - Description du véhicule
- `features` (JSONB DEFAULT '[]') - Fonctionnalités du véhicule
- `image_url` (VARCHAR(500)) - URL de l'image principale
- `gallery_images` (TEXT[]) - Galerie d'images
- `is_active` (BOOLEAN DEFAULT true) - Statut actif
- `is_available` (BOOLEAN DEFAULT true) - Disponibilité
- `license_plate` (VARCHAR(20)) - Plaque d'immatriculation
- `driver_name` (VARCHAR(255)) - Nom du chauffeur
- `driver_contact` (VARCHAR(50)) - Contact du chauffeur
- `created_at` (TIMESTAMP DEFAULT CURRENT_TIMESTAMP) - Date de création
- `updated_at` (TIMESTAMP DEFAULT CURRENT_TIMESTAMP) - Date de mise à jour
- `created_by` (INTEGER) - Créé par
- `updated_by` (INTEGER) - Mis à jour par

---

## Tables de Liaison et Support

### User_favorites

**Description :** Favoris des utilisateurs

- Liaison users ↔ tours
- Index optimisés pour les requêtes
- Horodatage des ajouts

### User_preferences

**Description :** Préférences utilisateur

- Configuration personnalisée par utilisateur
- Types de données flexibles
- Validation des valeurs

### Blog_post_categories

**Description :** Catégories des articles de blog

- Liaison blog_posts ↔ blog_categories
- Gestion multiple des catégories
- Relations many-to-many

### Destination_category_assignments

**Description :** Assignation des catégories aux destinations

- Liaison destinations ↔ destination_categories
- Système de catégorisation flexible
- Gestion hiérarchique

### Tour_destinations

**Description :** Liaison tours et destinations

- Relations many-to-many tours ↔ destinations
- Ordre de visite des destinations
- Durée par destination

### Tour_inclusions

**Description :** Inclusions des forfaits tours

- Services inclus dans les tours
- Descriptions détaillées
- Gestion par catégories

### Tour_exclusions

**Description :** Exclusions des forfaits tours

- Services non inclus
- Clarifications importantes
- Gestion des attentes clients

### Tour_images

**Description :** Images additionnelles des tours

- Galeries d'images par tour
- Métadonnées des images
- Ordre d'affichage

### Touraddons

**Description :** Liaison tours et modules complémentaires

- Services additionnels par tour
- Tarification spécifique
- Disponibilité conditionnelle

### Analytics_events

**Description :** Événements d'analyse et de suivi utilisateur

**Colonnes principales :**

- `id` (BIGINT PRIMARY KEY) - Identifiant unique
- `event_type` (VARCHAR(50)) - Type d'événement (page_view, click, booking, etc.)
- `event_category` (VARCHAR(50)) - Catégorie d'événement
- `event_action` (VARCHAR(100)) - Action spécifique
- `event_label` (VARCHAR(255)) - Libellé de l'événement
- `user_id` (INTEGER) - ID de l'utilisateur (optionnel)
- `session_id` (VARCHAR(255)) - ID de session
- `page_url` (TEXT) - URL de la page
- `referrer_url` (TEXT) - URL référente
- `user_agent` (TEXT) - User agent du navigateur
- `ip_address` (INET) - Adresse IP
- `device_type` (VARCHAR(20)) - Type de device (desktop, mobile, tablet)
- `browser` (VARCHAR(50)) - Navigateur utilisé
- `os` (VARCHAR(50)) - Système d'exploitation
- `country` (VARCHAR(2)) - Code pays (ISO 3166-1 alpha-2)
- `city` (VARCHAR(100)) - Ville
- `region` (VARCHAR(100)) - Région
- `latitude` (NUMERIC(10,8)) - Latitude
- `longitude` (NUMERIC(11,8)) - Longitude
- `screen_resolution` (VARCHAR(20)) - Résolution d'écran
- `viewport_size` (VARCHAR(20)) - Taille du viewport
- `event_value` (NUMERIC(10,2)) - Valeur de l'événement
- `currency` (VARCHAR(3)) - Devise
- `event_data` (JSONB DEFAULT '{}') - Données supplémentaires de l'événement
- `custom_parameters` (JSONB DEFAULT '{}') - Paramètres personnalisés
- `timestamp` (TIMESTAMP) - Date et heure de l'événement
- `created_at` (TIMESTAMP DEFAULT CURRENT_TIMESTAMP) - Date de création

### Audit_logs

**Description :** Journal d'audit pour le suivi des modifications

**Colonnes principales :**

- `id` (BIGINT PRIMARY KEY) - Identifiant unique
- `table_name` (VARCHAR(100)) - Nom de la table modifiée
- `record_id` (INTEGER) - ID de l'enregistrement modifié
- `action` (VARCHAR(10)) - Type d'action (INSERT, UPDATE, DELETE)
- `old_values` (JSONB) - Valeurs avant modification
- `new_values` (JSONB) - Valeurs après modification
- `changed_fields` (TEXT[]) - Champs modifiés
- `changed_by` (INTEGER) - ID de l'utilisateur ayant effectué la modification
- `changed_by_email` (VARCHAR(255)) - Email de l'utilisateur
- `changed_by_role` (VARCHAR(50)) - Rôle de l'utilisateur
- `changed_at` (TIMESTAMP DEFAULT CURRENT_TIMESTAMP) - Date et heure de la modification
- `ip_address` (INET) - Adresse IP de l'utilisateur
- `user_agent` (TEXT) - User agent utilisé
- `session_id` (VARCHAR(255)) - ID de session
- `request_method` (VARCHAR(10)) - Méthode HTTP
- `request_url` (TEXT) - URL de la requête
- `user_id` (INTEGER) - ID utilisateur
- `created_at` (TIMESTAMP DEFAULT CURRENT_TIMESTAMP) - Date de création

### Tour_categories

**Description :** Catégories de tours pour l'organisation et la navigation du site

**Colonnes principales :**

- `id` (INTEGER PRIMARY KEY) - Identifiant unique auto-incrémenté
- `name` (VARCHAR(100) NOT NULL) - Nom de la catégorie
- `slug` (VARCHAR(100) NOT NULL) - Slug URL unique
- `description` (TEXT) - Description détaillée de la catégorie
- `icon` (VARCHAR(50) DEFAULT 'fa-map') - Icône Font Awesome
- `color_theme` (VARCHAR(7) DEFAULT '#007bff') - Couleur principale en hex
- `image` (VARCHAR(255)) - URL de l'image de la catégorie
- `meta_title` (VARCHAR(255)) - Titre SEO
- `meta_description` (TEXT) - Description SEO
- `meta_keywords` (VARCHAR(500)) - Mots-clés SEO
- `is_active` (BOOLEAN DEFAULT true) - Statut d'activation
- `is_featured` (BOOLEAN DEFAULT false) - Mise en avant
- `is_popular` (BOOLEAN DEFAULT false) - Marqué comme populaire
- `display_order` (INTEGER DEFAULT 0) - Ordre d'affichage
- `active_tour_count` (INTEGER DEFAULT 0) - Nombre de tours actifs
- `total_bookings` (INTEGER DEFAULT 0) - Total des réservations
- `avg_rating` (NUMERIC(3,2) DEFAULT 0.00) - Note moyenne
- `min_price` (NUMERIC(10,2)) - Prix minimum
- `max_price` (NUMERIC(10,2)) - Prix maximum
- `created_at` (TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP) - Date de création
- `updated_at` (TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP) - Date de mise à jour

**Index :**
- Index unique sur slug
- Index sur is_active pour les filtres
- Index sur display_order pour le tri
- Index sur name pour la recherche

**Contraintes :**
- Contrainte de validation des prix (min_price >= 0, max_price >= 0, max_price >= min_price)
- Contrainte de validation de la note (0 <= avg_rating <= 5)
- Contrainte de validation des compteurs (active_tour_count >= 0, total_bookings >= 0)

### Blog_categories

**Description :** Catégories pour organiser les articles de blog

**Colonnes principales :**

- `id` (INTEGER PRIMARY KEY) - Identifiant unique auto-incrémenté
- `name` (VARCHAR(100) NOT NULL) - Nom de la catégorie
- `slug` (VARCHAR(100) NOT NULL) - Slug URL unique
- `description` (TEXT) - Description de la catégorie
- `created_at` (TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP) - Date de création

**Index :**
- Index unique sur slug
- Index sur name pour la recherche

**Contraintes :**
- Slug unique pour éviter les doublons

### User_favorites

**Description :** Tours favoris des utilisateurs pour les recommandations personnalisées

**Colonnes principales :**

- `id` (INTEGER PRIMARY KEY) - Identifiant unique auto-incrémenté
- `user_id` (INTEGER) - Référence vers users
- `tour_id` (INTEGER) - Référence vers tours
- `created_at` (TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP) - Date d'ajout

**Index :**
- Index unique sur user_id + tour_id (évite les doublons)
- Index sur user_id pour les favoris d'un utilisateur
- Index sur tour_id pour les statistiques de popularité

**Contraintes :**
- Clé étrangère vers users
- Clé étrangère vers tours
- Contrainte unique user_id + tour_id

### User_preferences

**Description :** Préférences et paramètres personnalisés des utilisateurs

**Colonnes principales :**

- `id` (INTEGER PRIMARY KEY) - Identifiant unique auto-incrémenté
- `user_id` (INTEGER) - Référence vers users
- `preference_key` (VARCHAR(100) NOT NULL) - Clé de préférence
- `preference_value` (TEXT) - Valeur de préférence
- `data_type` (VARCHAR(20) DEFAULT 'string') - Type de données (string, number, boolean, json)
- `created_at` (TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP) - Date de création
- `updated_at` (TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP) - Date de mise à jour

**Index :**
- Index unique sur user_id + preference_key
- Index sur user_id pour les préférences d'un utilisateur
- Index sur preference_key pour les recherches

**Contraintes :**
- Clé étrangère vers users
- Validation du type de données (string, number, boolean, json)
- Contrainte unique user_id + preference_key

### Blog_post_categories

**Description :** Table de liaison entre articles de blog et catégories

**Colonnes principales :**

- `blog_post_id` (INTEGER NOT NULL) - Référence vers blog_posts
- `category_id` (INTEGER NOT NULL) - Référence vers blog_categories

**Index :**
- Index primaire composite sur blog_post_id + category_id
- Index sur blog_post_id pour les catégories d'un article
- Index sur category_id pour les articles d'une catégorie

**Contraintes :**
- Clé étrangère vers blog_posts
- Clé étrangère vers blog_categories
- Contrainte primaire composite blog_post_id + category_id

### Destination_category_assignments

**Description :** Assignation des catégories aux destinations

**Colonnes principales :**

- `destination_id` (INTEGER NOT NULL) - Référence vers destinations
- `category_id` (INTEGER NOT NULL) - Référence vers destination_categories
- `created_at` (TIMESTAMP WITH TIME ZONE DEFAULT now()) - Date d'assignation

**Index :**
- Index primaire composite sur destination_id + category_id
- Index sur destination_id pour les catégories d'une destination
- Index sur category_id pour les destinations d'une catégorie

**Contraintes :**
- Clé étrangère vers destinations
- Clé étrangère vers destination_categories
- Contrainte primaire composite destination_id + category_id

### Tour_destinations

**Description :** Association des tours avec leurs destinations

**Colonnes principales :**

- `tour_id` (INTEGER NOT NULL) - Référence vers tours
- `destination_id` (INTEGER NOT NULL) - Référence vers destinations
- `display_order` (INTEGER DEFAULT 0) - Ordre d'affichage dans le tour
- `created_at` (TIMESTAMP WITH TIME ZONE DEFAULT now()) - Date de création

**Index :**
- Index primaire composite sur tour_id + destination_id
- Index sur tour_id pour les destinations d'un tour
- Index sur destination_id pour les tours d'une destination
- Index sur display_order pour le tri

**Contraintes :**
- Clé étrangère vers tours
- Clé étrangère vers destinations
- Contrainte primaire composite tour_id + destination_id

### Tour_inclusions

**Description :** Ce qui est inclus dans les forfaits de voyage

**Colonnes principales :**

- `id` (INTEGER PRIMARY KEY) - Identifiant unique auto-incrémenté
- `tour_id` (INTEGER) - Référence vers tours
- `inclusion_type` (VARCHAR(50) NOT NULL) - Type d'inclusion (accommodation, transport, meals, etc.)
- `title` (VARCHAR(255) NOT NULL) - Titre de l'inclusion
- `description` (TEXT) - Description détaillée
- `icon` (VARCHAR(50)) - Icône représentative
- `is_included` (BOOLEAN DEFAULT true) - Statut d'inclusion
- `created_at` (TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP) - Date de création

**Index :**
- Index sur tour_id pour les inclusions d'un tour
- Index sur inclusion_type pour le filtrage

**Contraintes :**
- Clé étrangère vers tours

### Tour_exclusions

**Description :** Ce qui n'est pas inclus dans les forfaits de voyage

**Colonnes principales :**

- `id` (INTEGER PRIMARY KEY) - Identifiant unique auto-incrémenté
- `tour_id` (INTEGER) - Référence vers tours
- `title` (VARCHAR(255) NOT NULL) - Titre de l'exclusion
- `description` (TEXT) - Description détaillée
- `created_at` (TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP) - Date de création

**Index :**
- Index sur tour_id pour les exclusions d'un tour

**Contraintes :**
- Clé étrangère vers tours

### Tour_images

**Description :** Images supplémentaires pour les tours (galerie)

**Colonnes principales :**

- `id` (INTEGER PRIMARY KEY) - Identifiant unique auto-incrémenté
- `tour_id` (INTEGER) - Référence vers tours
- `image_url` (TEXT NOT NULL) - URL de l'image
- `caption` (TEXT) - Légende de l'image
- `is_primary` (BOOLEAN DEFAULT false) - Image principale du tour
- `display_order` (INTEGER DEFAULT 0) - Ordre d'affichage
- `created_at` (TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP) - Date de création

**Index :**
- Index sur tour_id pour les images d'un tour
- Index sur is_primary pour identifier l'image principale
- Index sur display_order pour le tri

**Contraintes :**
- Clé étrangère vers tours

### Touraddons

**Description :** Association des add-ons avec les tours

**Colonnes principales :**

- `tour_id` (INTEGER NOT NULL) - Référence vers tours
- `addon_id` (INTEGER NOT NULL) - Référence vers addons

**Index :**
- Index primaire composite sur tour_id + addon_id
- Index sur tour_id pour les add-ons d'un tour
- Index sur addon_id pour les tours avec cet add-on

**Contraintes :**
- Clé étrangère vers tours
- Clé étrangère vers addons
- Contrainte primaire composite tour_id + addon_id

### Destination_likes

**Description :** Likes des destinations par utilisateurs

**Colonnes principales :**

- `id` (INTEGER PRIMARY KEY) - Identifiant unique auto-incrémenté
- `user_id` (INTEGER NOT NULL) - Référence vers users
- `destination_id` (INTEGER NOT NULL) - Référence vers destinations
- `created_at` (TIMESTAMP WITH TIME ZONE DEFAULT now()) - Date du like

**Index :**
- Index unique sur user_id + destination_id (évite les doublons)
- Index sur user_id pour les likes d'un utilisateur
- Index sur destination_id pour les statistiques de popularité

**Contraintes :**
- Clé étrangère vers users
- Clé étrangère vers destinations
- Contrainte unique user_id + destination_id

### Destination_seasons

**Description :** Saisons optimales et périodes recommandées pour chaque destination

**Colonnes principales :**

- `id` (INTEGER PRIMARY KEY) - Identifiant unique
- `destination_id` (INTEGER NOT NULL) - Référence vers destinations
- `season` (VARCHAR(50) NOT NULL) - Nom de la saison (spring, summer, fall, winter)
- `is_ideal` (BOOLEAN DEFAULT false) - Si c'est la période idéale
- `description` (TEXT) - Description détaillée de la saison
- `created_at` (TIMESTAMP WITH TIME ZONE DEFAULT now()) - Date de création

**Index :**
- Index composites sur destination_id + season (unique)
- Index sur is_ideal pour les recommandations
- Index sur destination_id pour les requêtes rapides

**Contraintes :**
- Clé étrangère vers destinations
- Validation des saisons prédéfinies

### Review_helpfulness

**Description :** Système de votes sur l'utilité des avis pour améliorer la pertinence

**Colonnes principales :**

- `id` (INTEGER PRIMARY KEY) - Identifiant unique
- `review_id` (INTEGER) - Référence vers reviews
- `user_id` (INTEGER) - Référence vers users
- `is_helpful` (BOOLEAN NOT NULL) - Vote positif ou négatif
- `created_at` (TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP) - Date du vote

**Index :**
- Index composites sur review_id + user_id (unique)
- Index sur review_id pour les statistiques
- Index sur user_id pour l'historique des votes

**Contraintes :**
- Clé étrangère vers reviews
- Clé étrangère vers users
- Un vote par utilisateur par avis

### Payments

**Description :** Enregistrements détaillés des paiements avec intégration des passerelles

**Colonnes principales :**

- `id` (INTEGER PRIMARY KEY) - Identifiant unique
- `booking_id` (INTEGER NOT NULL) - Référence vers bookings
- `gateway_transaction_id` (VARCHAR(255)) - ID de transaction de la passerelle
- `amount` (NUMERIC(12,2) NOT NULL) - Montant du paiement
- `currency` (VARCHAR(3) NOT NULL) - Devise (INR, USD, EUR)
- `status` (VARCHAR(50) NOT NULL) - Statut (pending, completed, failed, refunded)
- `payment_date` (TIMESTAMP WITH TIME ZONE DEFAULT now()) - Date du paiement

**Index :**
- Index sur booking_id pour les requêtes rapides
- Index sur gateway_transaction_id pour la recherche
- Index sur status pour les rapports financiers
- Index sur payment_date pour les analyses temporelles

**Contraintes :**
- Clé étrangère vers bookings
- Validation des montants positifs
- Statuts prédéfinis

### Passwordresets

**Description :** Gestion des réinitialisations de mot de passe avec tokens sécurisés

**Colonnes principales :**

- `id` (INTEGER PRIMARY KEY) - Identifiant unique
- `user_id` (INTEGER NOT NULL) - Référence vers users
- `email` (VARCHAR(100) NOT NULL) - Email de l'utilisateur
- `reset_token` (TEXT) - Token de réinitialisation sécurisé
- `expires_at` (TIMESTAMP WITH TIME ZONE) - Date d'expiration du token
- `status` (VARCHAR(20) DEFAULT 'pending') - Statut (pending, used, expired)

**Index :**
- Index sur user_id pour les requêtes rapides
- Index sur email pour la recherche
- Index sur reset_token pour la validation

**Contraintes :**
- Clé étrangère vers users
- Token unique par demande
- Expiration automatique après 24h

### Notifications

**Description :** Système complet de notifications multi-canal pour les utilisateurs

**Colonnes principales :**

- `id` (INTEGER PRIMARY KEY) - Identifiant unique
- `user_id` (INTEGER NOT NULL) - Référence vers users
- `booking_id` (INTEGER) - Référence optionnelle vers bookings
- `type` (VARCHAR(50) NOT NULL) - Type de notification (booking, reminder, marketing)
- `channel` (VARCHAR(20) DEFAULT 'email') - Canal (email, sms, push)
- `status` (VARCHAR(20) NOT NULL) - Statut (pending, sent, failed, opened)
- `title` (VARCHAR(255)) - Titre de la notification
- `message` (TEXT) - Contenu du message
- `priority` (VARCHAR(20) DEFAULT 'medium') - Priorité (low, medium, high, urgent)
- `is_read` (BOOLEAN DEFAULT false) - Statut de lecture
- `sent_at` (TIMESTAMP WITH TIME ZONE DEFAULT now()) - Date d'envoi
- `scheduled_at` (TIMESTAMP WITHOUT TIME ZONE) - Date planifiée
- `opened_at` (TIMESTAMP WITHOUT TIME ZONE) - Date d'ouverture
- `clicked_at` (TIMESTAMP WITHOUT TIME ZONE) - Date de clic
- `metadata` (JSONB) - Données supplémentaires
- `template_id` (INTEGER) - Référence vers notification_templates

**Index :**
- Index composites sur user_id + is_read
- Index sur status pour les envois en attente
- Index sur type pour les rapports
- Index sur channel pour les analyses

**Contraintes :**
- Clé étrangère vers users
- Validation des priorités prédéfinies
- Canaux autorisés

### Test_results

**Description :** Résultats détaillés des tests automatisés du système

**Colonnes principales :**

- `id` (INTEGER PRIMARY KEY) - Identifiant unique
- `test_name` (VARCHAR(255) NOT NULL) - Nom du test
- `test_type` (VARCHAR(50)) - Type de test (unit, integration, e2e, performance)
- `status` (VARCHAR(20) NOT NULL) - Statut (passed, failed, skipped, error)
- `duration_ms` (INTEGER) - Durée d'exécution en millisecondes
- `error_message` (TEXT) - Message d'erreur en cas d'échec
- `stack_trace` (TEXT) - Trace d'erreur détaillée
- `environment` (VARCHAR(50)) - Environnement (dev, staging, prod)
- `test_suite` (VARCHAR(100)) - Suite de tests
- `created_at` (TIMESTAMP WITH TIME ZONE DEFAULT now()) - Date du test
- `metadata` (JSONB) - Données supplémentaires du test

**Index :**
- Index sur test_name pour les recherches
- Index sur status pour les rapports
- Index sur test_type pour les analyses
- Index sur created_at pour l'historique

**Contraintes :**
- Validation des statuts prédéfinis
- Validation des types de tests autorisés

### Tour_statistics

**Description :** Statistiques détaillées et analyses de performance pour chaque tour

**Colonnes principales :**

- `id` (INTEGER PRIMARY KEY) - Identifiant unique
- `tour_id` (INTEGER NOT NULL) - Référence vers tours
- `view_count` (INTEGER DEFAULT 0) - Nombre total de vues
- `booking_count` (INTEGER DEFAULT 0) - Nombre total de réservations
- `wishlist_count` (INTEGER DEFAULT 0) - Nombre d'ajouts aux favoris
- `review_count` (INTEGER DEFAULT 0) - Nombre total d'avis
- `average_rating` (NUMERIC(3,2) DEFAULT 0.00) - Note moyenne
- `conversion_rate` (NUMERIC(5,2) DEFAULT 0.00) - Taux de conversion
- `bounce_rate` (NUMERIC(5,2) DEFAULT 0.00) - Taux de rebond
- `avg_session_duration` (INTEGER DEFAULT 0) - Durée moyenne de session
- `last_updated` (TIMESTAMP WITH TIME ZONE DEFAULT now()) - Dernière mise à jour

**Index :**
- Index unique sur tour_id
- Index sur booking_count pour les classements
- Index sur view_count pour les analyses
- Index sur average_rating pour les recommandations

**Contraintes :**
- Clé étrangère vers tours
- Validation des pourcentages (0-100)

---

## Vues Optimisées

### v_homepage_data

**Description :** Vue agrégée pour les données de la page d'accueil

- Bannières actives avec paramètres
- Catégories de tours avec statistiques
- Tours best-sellers avec calculs de performance
- Derniers tours avec métadonnées
- Avis clients featured avec scores de sentiment
- Offres spéciales actives avec calculs de remise
- Destinations vedettes avec statistiques
- Articles de blog récents avec métriques

### v_homepage_stats

**Description :** Statistiques agrégées pour la page d'accueil

- Compteurs globaux (tours, destinations, catégories)
- Métriques d'engagement (avis, offres, articles)
- Calculs de performance en temps réel

### v_search_data

**Description :** Données optimisées pour la recherche

- Combinaison tours + destinations + articles
- Index de recherche full-text
- Pondération des résultats

### v_test_report

**Description :** Rapport consolidé des tests

- Résumé par catégories de tests
- Taux de succès et métriques
- Temps d'exécution moyens

### user_activity_summary

**Description :** Résumé d'activité utilisateur

- Agrégation des données utilisateur
- Statistiques d'engagement
- Métriques comportementales

### security_logs

**Description :** Vue des logs de sécurité

- Combinaison audit_logs + informations utilisateur
- Événements de sécurité critiques
- Traçabilité complète
- Métadonnées enrichies pour le ranking

### v_test_report

**Description :** Rapport de tests automatisés

- Résultats des tests de validation
- Métriques de performance
- Alertes de qualité des données

---

## Vue Matérialisée

### mv_homepage_statistics

**Description :** Statistiques pré-calculées pour la page d'accueil

- Agrégation des données tours, destinations et blog
- Rafraîchissement automatique programmé
- Performance optimisée pour les requêtes fréquentes
- Métriques en temps réel pour le dashboard
- Données agrégées par type d'entité

---

## Fonctions Principales

### Fonctions de Calcul

- `calculate_discounted_price()` - Calcul des prix avec remise
- `calculate_group_price()` - Calcul des prix de groupe
- `calculate_reading_time()` - Temps de lecture des articles
- `calculate_review_relevance_score()` - Score de pertinence des avis
- `calculate_sentiment_score()` - Analyse de sentiment
- `calculate_trend_score()` - Score de tendance

### Fonctions de Gestion

- `check_tour_availability()` - Vérification de disponibilité
- `apply_special_offer()` - Application des offres
- `update_destination_stats()` - Mise à jour des statistiques
- `update_tour_rankings()` - Mise à jour des classements
- `cleanup_old_data()` - Nettoyage des données anciennes

### Fonctions d'Analyse

- `analyze_index_performance()` - Analyse des performances d'index
- `get_homepage_data()` - Récupération des données homepage
- `get_popular_recommendations()` - Recommandations populaires
- `get_similar_tours()` - Tours similaires
- `get_tour_performance_stats()` - Statistiques de performance

### Fonctions Utilitaires

- `generate_destination_slug()` - Génération de slugs
- `extract_table_of_contents()` - Extraction de table des matières
- `validate_data_integrity()` - Validation d'intégrité
- `find_unused_indexes()` - Recherche d'index inutilisés

---

## Triggers et Automatisations

### Triggers de Mise à Jour

- `update_updated_at_column()` - Mise à jour automatique des timestamps
- `update_blog_post_metadata()` - Métadonnées des articles
- `update_destination_metadata()` - Métadonnées des destinations
- `update_gallery_updated_at()` - Timestamps des galeries

### Triggers Métier

- `maintain_tour_pricing()` - Maintien de la cohérence des prix
- `update_category_statistics()` - Statistiques des catégories
- `trigger_destination_metadata` - Métadonnées des destinations

---

## Index et Optimisations

### Index de Performance

- Index composites pour les requêtes homepage
- Index de recherche full-text (GIN)
- Index géospatiaux (GIST) pour les coordonnées
- Index partiels pour les données actives

### Index Spécialisés

- `idx_tours_homepage_*` - Optimisations homepage
- `idx_tours_performance_metrics` - Métriques de performance
- `idx_tours_fulltext_search` - Recherche textuelle
- `idx_destinations_*` - Optimisations destinations
- `idx_featured_reviews_*` - Avis mis en avant

---

## Contraintes et Intégrité

### Contraintes de Clés Étrangères

- Relations strictes entre tables principales
- Cascade DELETE pour les données dépendantes
- SET NULL pour les références optionnelles

### Contraintes de Validation

- Validation des emails (format)
- Validation des ratings (1-5)
- Validation des prix (> 0)
- Validation des coordonnées géographiques

---

## Résumé Technique

Cette base de données PostgreSQL présente une architecture moderne et scalable pour une plateforme de réservation de tours complète. Les principales caractéristiques incluent :

### Architecture Globale
- **45 tables principales** couvrant tous les aspects métier
- **8 vues optimisées** pour les requêtes complexes
- **1 vue matérialisée** pour les statistiques temps réel
- **30+ fonctions** pour la logique métier
- **Triggers automatiques** pour la cohérence des données

### Fonctionnalités Clés
- **Gestion complète des tours** : catégories, inclusions, exclusions, images
- **Système de réservation avancé** : paiements, notifications, confirmations
- **Plateforme de contenu** : blog, articles, gestion SEO
- **Analytics intégrés** : métriques, événements, rapports
- **Administration** : audit logs, paramètres système, templates

### Optimisations Techniques
- **Normalisation optimisée** : Relations bien définies avec contraintes d'intégrité
- **Performance** : Index stratégiques et vues matérialisées
- **Flexibilité** : Utilisation extensive de JSONB pour les données semi-structurées
- **Audit complet** : Traçabilité de toutes les modifications
- **Scalabilité** : Architecture préparée pour la croissance
- **Sécurité** : Logs de sécurité et gestion des accès

### Capacité de Données
- **~100,000+ enregistrements** répartis sur l'ensemble des tables
- **Gestion multi-langue** pour le contenu international
- **Système de cache** intégré pour les performances
- **Métriques temps réel** via vues matérialisées

L'ensemble forme un écosystème complet et robuste capable de gérer efficacement toutes les opérations d'une plateforme de tourisme moderne, de la gestion des contenus à l'analyse des performances en passant par les réservations et les paiements.

---

_Documentation générée automatiquement - Dernière mise à jour : 2024_  
_Base de données : ebooking-app | Environnement : Production_
