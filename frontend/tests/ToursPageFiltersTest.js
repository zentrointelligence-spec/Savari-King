/**
 * Tests pour vérifier le fonctionnement des filtres de recherche de ToursPage.jsx
 * Ce script utilise les données insérées par insertTestData.js
 */

import axios from 'axios';

// Configuration
const API_URL = 'http://localhost:3000/api';

// Fonction utilitaire pour convertir les filtres frontend en paramètres backend
function convertFiltersToParams(filters) {
  const params = {};
  
  // Paramètres de recherche textuelle
  if (filters.searchQuery) {
    params.search = filters.searchQuery;
  }
  
  // Paramètres de prix
  if (filters.priceRange) {
    if (filters.priceRange.min !== undefined) {
      params.min_price = filters.priceRange.min;
    }
    if (filters.priceRange.max !== undefined) {
      params.max_price = filters.priceRange.max;
    }
  }
  
  // Paramètre de notation
  if (filters.rating) {
    params.min_rating = filters.rating;
  }
  
  // Paramètres de durée
  if (filters.duration) {
    if (filters.duration.min !== undefined) {
      params.min_duration = filters.duration.min;
    }
    if (filters.duration.max !== undefined) {
      params.max_duration = filters.duration.max;
    }
  }
  
  // Paramètre de tri
  if (filters.sortBy) {
    params.sort_by = filters.sortBy;
  }
  
  // Paramètres de pagination
  params.page = filters.page || 1;
  params.limit = filters.limit || 10;
  
  return params;
}

// Fonction pour récupérer les tours avec des filtres
async function fetchTours(filters = {}) {
  try {
    const params = convertFiltersToParams(filters);
    console.log('Paramètres de requête:', params);
    const response = await axios.get(`${API_URL}/tours`, { params });
    console.log('Structure de la réponse:', JSON.stringify(response.data, null, 2).substring(0, 200) + '...');
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des tours:', error);
    throw error;
  }
}

// Tests des filtres
async function runTests() {
  console.log('Démarrage des tests des filtres de recherche...');
  
  try {
    // Test 1: Recherche textuelle
    console.log('\n--- Test 1: Recherche textuelle ---');
    const textSearchResults = await fetchTours({ searchQuery: 'Beach' });
    
    // Vérifier la structure de la réponse
    const tours = textSearchResults.tours || textSearchResults.data || [];
    console.log(`Résultats trouvés: ${tours.length}`);
    console.log('Tours trouvés:');
    tours.forEach(tour => {
      const shortDesc = tour.short_description || '';
      console.log(`- ${tour.name} (contient 'Beach': ${tour.name.includes('Beach') || shortDesc.includes('Beach')})`);
    });
    
    // Test 2: Filtre de prix
    console.log('\n--- Test 2: Filtre de prix ---');
    const priceFilterResults = await fetchTours({ 
      priceRange: { min: 1000, max: 3000 } 
    });
    
    // Vérifier la structure de la réponse
    const priceTours = priceFilterResults.tours || priceFilterResults.data || [];
    console.log(`Résultats trouvés: ${priceTours.length}`);
    console.log('Tours trouvés:');
    priceTours.forEach(tour => {
      console.log(`- ${tour.name} (Prix: ${tour.original_price}, Dans la plage: ${tour.original_price >= 1000 && tour.original_price <= 3000})`);
    });
    
    // Test 3: Filtre de notation
    console.log('\n--- Test 3: Filtre de notation ---');
    const ratingFilterResults = await fetchTours({ rating: 4.5 });
    const ratingTours = ratingFilterResults.tours || ratingFilterResults.data || [];
    console.log(`Résultats trouvés: ${ratingTours.length}`);
    console.log('Tours trouvés:');
    ratingTours.forEach(tour => {
      console.log(`- ${tour.name} (Notation: ${tour.rating}, Supérieur à 4.5: ${tour.rating >= 4.5})`);
    });
    
    // Test 4: Filtre de durée (basé sur le nombre de jours dans l'itinéraire)
    console.log('\n--- Test 4: Filtre de durée ---');
    const durationFilterResults = await fetchTours({ 
      duration: { min: 5, max: 7 } 
    });
    const durationTours = durationFilterResults.tours || durationFilterResults.data || [];
    console.log(`Résultats trouvés: ${durationTours.length}`);
    console.log('Tours trouvés:');
    durationTours.forEach(tour => {
      const itinerary = JSON.parse(tour.itinerary);
      const duration = Object.keys(itinerary).length;
      console.log(`- ${tour.name} (Durée: ${duration} jours, Dans la plage: ${duration >= 5 && duration <= 7})`);
    });
    
    // Test 5: Options de tri (par prix croissant)
    console.log('\n--- Test 5: Tri par prix croissant ---');
    const sortByPriceResults = await fetchTours({ sortBy: 'price_asc' });
    const sortPriceTours = sortByPriceResults.tours || sortByPriceResults.data || [];
    console.log('Tours triés par prix croissant:');
    sortPriceTours.forEach((tour, index) => {
      console.log(`${index + 1}. ${tour.name} (Prix: ${tour.original_price})`);
    });
    
    // Test 6: Options de tri (par notation décroissante)
    console.log('\n--- Test 6: Tri par notation décroissante ---');
    const sortByRatingResults = await fetchTours({ sortBy: 'rating_desc' });
    const sortRatingTours = sortByRatingResults.tours || sortByRatingResults.data || [];
    console.log('Tours triés par notation décroissante:');
    sortRatingTours.forEach((tour, index) => {
      console.log(`${index + 1}. ${tour.name} (Notation: ${tour.rating})`);
    });
    
    // Test 7: Combinaison de filtres
    console.log('\n--- Test 7: Combinaison de filtres ---');
    const combinedFilterResults = await fetchTours({ 
      searchQuery: 'Beach', 
      priceRange: { min: 2000, max: 5000 },
      rating: 4.5,
      sortBy: 'price_desc'
    });
    const combinedTours = combinedFilterResults.tours || combinedFilterResults.data || [];
    console.log(`Résultats trouvés: ${combinedTours.length}`);
    console.log('Tours trouvés:');
    combinedTours.forEach(tour => {
      console.log(`- ${tour.name}`);
      console.log(`  Prix: ${tour.original_price} (Entre 2000 et 5000: ${tour.original_price >= 2000 && tour.original_price <= 5000})`);
      console.log(`  Notation: ${tour.rating} (Supérieur à 4.5: ${tour.rating >= 4.5})`);
      console.log(`  Contient 'Beach': ${tour.name.includes('Beach') || tour.short_description.includes('Beach')}`);
    });
    
    console.log('\nTous les tests ont été exécutés avec succès!');
    
  } catch (error) {
    console.error('Erreur lors de l\'exécution des tests:', error);
  }
}

// Exécuter les tests
runTests();