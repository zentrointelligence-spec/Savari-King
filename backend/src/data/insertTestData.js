/**
 * Script pour insérer des données de test dans la base de données
 * Ce script permet de tester les filtres de recherche de ToursPage.jsx
 */

const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const connectionString = process.env.DATABASE_URL;

const pool = connectionString
  ? new Pool({
      connectionString,
      ssl:
        process.env.DB_SSL === 'true' || process.env.NODE_ENV === 'production'
          ? { rejectUnauthorized: false }
          : false,
    })
  : new Pool({
      user: process.env.DB_USER || 'postgres',
      host: process.env.DB_HOST || 'localhost',
      database: process.env.DB_DATABASE || 'ebookingsam',
      password: process.env.DB_PASSWORD || 'postgres',
      port: parseInt(process.env.DB_PORT, 10) || 5432,
    });

// Fonction pour insérer des données de test
async function insertTestData() {
  const client = await pool.connect();
  
  try {
    // Commencer une transaction
    await client.query('BEGIN');
    
    console.log('Insertion des données de test...');
    
    // Insérer des catégories de tours si elles n'existent pas déjà
    const categoryIds = {};
    const categories = [
      { name: 'Beach Tours', slug: 'beach-tours', description: 'Relax on pristine beaches and coastal experiences', icon: 'fa-umbrella-beach', color_theme: '#4169E1' },
      { name: 'Cultural Tours', slug: 'cultural-tours', description: 'Explore the rich cultural heritage of South India', icon: 'fa-landmark', color_theme: '#8B4513' },
      { name: 'Wildlife Tours', slug: 'wildlife-tours', description: 'Discover exotic wildlife in natural habitats', icon: 'fa-paw', color_theme: '#32CD32' },
      { name: 'Hill Station Tours', slug: 'hill-station-tours', description: 'Cool retreats in scenic hill stations', icon: 'fa-mountain', color_theme: '#9370DB' },
    ];
    
    for (const category of categories) {
      // Vérifier si la catégorie existe déjà
      const existingCategory = await client.query(
        'SELECT id FROM tour_categories WHERE slug = $1',
        [category.slug]
      );
      
      if (existingCategory.rows.length === 0) {
        // Insérer la nouvelle catégorie
        const result = await client.query(
          `INSERT INTO tour_categories (name, slug, description, icon, color_theme, is_active, is_featured) 
           VALUES ($1, $2, $3, $4, $5, true, true) RETURNING id`,
          [category.name, category.slug, category.description, category.icon, category.color_theme]
        );
        categoryIds[category.slug] = result.rows[0].id;
        console.log(`Catégorie créée: ${category.name} (ID: ${categoryIds[category.slug]})`);
      } else {
        categoryIds[category.slug] = existingCategory.rows[0].id;
        console.log(`Catégorie existante: ${category.name} (ID: ${categoryIds[category.slug]})`);
      }
    }
    
    // Insérer des tours de test avec différentes caractéristiques pour tester les filtres
    const tours = [
      {
        name: 'Goa Beach Paradise',
        slug: 'goa-beach-paradise',
        short_description: 'Enjoy the beautiful beaches of Goa with this amazing tour package',
        category_slug: 'beach-tours',
        original_price: 2500,
        rating: 4.8,
        itinerary: JSON.stringify({
          'Day 1': 'Arrival and check-in',
          'Day 2': 'North Goa beaches tour',
          'Day 3': 'South Goa beaches tour',
          'Day 4': 'Water sports activities',
          'Day 5': 'Departure'
        }),
        is_featured: true,
        is_bestseller: true
      },
      {
        name: 'Kerala Backwaters Cruise',
        slug: 'kerala-backwaters-cruise',
        short_description: 'Experience the serene backwaters of Kerala on a traditional houseboat',
        category_slug: 'beach-tours',
        original_price: 3500,
        rating: 4.9,
        itinerary: JSON.stringify({
          'Day 1': 'Arrival in Kochi',
          'Day 2': 'Transfer to Alleppey',
          'Day 3': 'Houseboat cruise',
          'Day 4': 'Kumarakom bird sanctuary',
          'Day 5': 'Beach day at Marari',
          'Day 6': 'Return to Kochi'
        }),
        is_featured: true,
        is_trending: true
      },
      {
        name: 'Mysore Palace Cultural Tour',
        slug: 'mysore-palace-cultural-tour',
        short_description: 'Discover the rich cultural heritage of Mysore and its magnificent palace',
        category_slug: 'cultural-tours',
        original_price: 1800,
        rating: 4.5,
        itinerary: JSON.stringify({
          'Day 1': 'Arrival in Mysore',
          'Day 2': 'Mysore Palace tour',
          'Day 3': 'Chamundi Hills visit',
          'Day 4': 'Departure'
        }),
        is_featured: false,
        is_bestseller: false
      },
      {
        name: 'Bandipur Wildlife Safari',
        slug: 'bandipur-wildlife-safari',
        short_description: 'Explore the wildlife of Bandipur National Park with guided safaris',
        category_slug: 'wildlife-tours',
        original_price: 4500,
        rating: 4.7,
        itinerary: JSON.stringify({
          'Day 1': 'Arrival at resort',
          'Day 2': 'Morning safari',
          'Day 3': 'Evening safari',
          'Day 4': 'Nature walk',
          'Day 5': 'Departure'
        }),
        is_featured: true,
        is_trending: true
      },
      {
        name: 'Ooty Hill Station Retreat',
        slug: 'ooty-hill-station-retreat',
        short_description: 'Escape to the cool climate of Ooty hill station',
        category_slug: 'hill-station-tours',
        original_price: 3200,
        rating: 4.6,
        itinerary: JSON.stringify({
          'Day 1': 'Arrival in Ooty',
          'Day 2': 'Botanical Gardens',
          'Day 3': 'Doddabetta Peak',
          'Day 4': 'Ooty Lake',
          'Day 5': 'Tea plantation visit',
          'Day 6': 'Coonoor excursion',
          'Day 7': 'Departure'
        }),
        is_featured: true,
        is_bestseller: false
      },
      {
        name: 'Budget Beach Getaway',
        slug: 'budget-beach-getaway',
        short_description: 'Affordable beach vacation for budget travelers',
        category_slug: 'beach-tours',
        original_price: 999,
        rating: 4.2,
        itinerary: JSON.stringify({
          'Day 1': 'Arrival',
          'Day 2': 'Beach day',
          'Day 3': 'Departure'
        }),
        is_featured: false,
        is_bestseller: false
      },
      {
        name: 'Luxury Beachfront Resort Experience',
        slug: 'luxury-beachfront-resort',
        short_description: 'Premium beachfront resort stay with all amenities',
        category_slug: 'beach-tours',
        original_price: 8500,
        rating: 4.9,
        itinerary: JSON.stringify({
          'Day 1': 'VIP check-in',
          'Day 2': 'Private beach access',
          'Day 3': 'Spa treatment',
          'Day 4': 'Gourmet dining',
          'Day 5': 'Water sports',
          'Day 6': 'Island excursion',
          'Day 7': 'Departure'
        }),
        is_featured: true,
        is_bestseller: true
      },
      {
        name: 'Munnar Tea Gardens Tour',
        slug: 'munnar-tea-gardens',
        short_description: 'Explore the beautiful tea gardens of Munnar hill station',
        category_slug: 'hill-station-tours',
        original_price: 2800,
        rating: 4.4,
        itinerary: JSON.stringify({
          'Day 1': 'Arrival in Munnar',
          'Day 2': 'Tea plantation tour',
          'Day 3': 'Eravikulam National Park',
          'Day 4': 'Mattupetty Dam',
          'Day 5': 'Departure'
        }),
        is_featured: false,
        is_trending: true
      }
    ];
    
    // Insérer chaque tour
    for (const tour of tours) {
      // Vérifier si le tour existe déjà
      const existingTour = await client.query(
        'SELECT id FROM tours WHERE slug = $1',
        [tour.slug]
      );
      
      let tourId;
      
      if (existingTour.rows.length === 0) {
        // Insérer le nouveau tour
        const result = await client.query(
          `INSERT INTO tours (
            name, slug, short_description, category_id, original_price, rating, 
            itinerary, is_active, is_featured, is_bestseller, is_trending
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, true, $8, $9, $10) RETURNING id`,
          [
            tour.name, 
            tour.slug, 
            tour.short_description, 
            categoryIds[tour.category_slug], 
            tour.original_price, 
            tour.rating, 
            tour.itinerary, 
            tour.is_featured, 
            tour.is_bestseller, 
            tour.is_trending || false
          ]
        );
        
        tourId = result.rows[0].id;
        console.log(`Tour créé: ${tour.name} (ID: ${tourId})`);
        
        // Ajouter l'association de catégorie
        await client.query(
          'INSERT INTO tour_category_assignments (tour_id, category_id) VALUES ($1, $2)',
          [tourId, categoryIds[tour.category_slug]]
        );
      } else {
        tourId = existingTour.rows[0].id;
        console.log(`Tour existant: ${tour.name} (ID: ${tourId})`);
        
        // Mettre à jour le tour existant
        await client.query(
          `UPDATE tours SET 
            short_description = $1, 
            category_id = $2, 
            original_price = $3, 
            rating = $4, 
            itinerary = $5, 
            is_featured = $6, 
            is_bestseller = $7, 
            is_trending = $8 
          WHERE id = $9`,
          [
            tour.short_description, 
            categoryIds[tour.category_slug], 
            tour.original_price, 
            tour.rating, 
            tour.itinerary, 
            tour.is_featured, 
            tour.is_bestseller, 
            tour.is_trending || false, 
            tourId
          ]
        );
        
        // Vérifier si l'association de catégorie existe déjà
        const existingAssignment = await client.query(
          'SELECT * FROM tour_category_assignments WHERE tour_id = $1 AND category_id = $2',
          [tourId, categoryIds[tour.category_slug]]
        );
        
        if (existingAssignment.rows.length === 0) {
          // Ajouter l'association de catégorie
          await client.query(
            'INSERT INTO tour_category_assignments (tour_id, category_id) VALUES ($1, $2)',
            [tourId, categoryIds[tour.category_slug]]
          );
        }
      }
    }
    
    // Valider la transaction
    await client.query('COMMIT');
    console.log('Données de test insérées avec succès!');
    
  } catch (error) {
    // Annuler la transaction en cas d'erreur
    await client.query('ROLLBACK');
    console.error('Erreur lors de l\'insertion des données de test:', error);
    throw error;
  } finally {
    // Libérer le client
    client.release();
  }
}

// Exécuter la fonction d'insertion
insertTestData()
  .then(() => {
    console.log('Script terminé avec succès');
    process.exit(0);
  })
  .catch(error => {
    console.error('Erreur lors de l\'exécution du script:', error);
    process.exit(1);
  });
