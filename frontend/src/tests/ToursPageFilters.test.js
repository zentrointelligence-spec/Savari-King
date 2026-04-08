import axios from 'axios';
import { describe, test, expect, beforeAll, afterAll, jest } from '@jest/globals';

// Configuration de l'URL du backend
const API_BASE_URL = process.env.VITE_API_BASE_URL || 'http://localhost:5000';

// Mapping des noms de paramètres frontend -> backend
const paramMapping = {
  minPrice: "min_price",
  maxPrice: "max_price",
  minRating: "min_rating",
  duration: "duration",
  sortBy: "sort_by",
  q: "search",
};

// Fonction utilitaire pour convertir les filtres frontend en paramètres backend
const convertFiltersToParams = (filters) => {
  const params = new URLSearchParams();
  
  // Ajouter les paramètres de pagination
  params.append("limit", 12);
  params.append("offset", 0);
  
  // Ajouter les filtres avec conversion frontend -> backend
  Object.keys(filters).forEach((key) => {
    if (filters[key]) {
      const backendParam = paramMapping[key] || key;
      params.append(backendParam, filters[key]);
      console.log(`Adding filter ${backendParam}=${filters[key]}`);
    }
  });
  
  return params;
};

// Fonction pour faire une requête API avec les filtres donnés
const fetchToursWithFilters = async (filters) => {
  const params = convertFiltersToParams(filters);
  const apiUrl = `${API_BASE_URL}/api/tours?${params.toString()}`;
  console.log(`Making API request to ${apiUrl}`);
  
  try {
    const response = await axios.get(apiUrl);
    return response.data;
  } catch (error) {
    console.error('Error fetching tours:', error);
    throw error;
  }
};

describe('Tests des filtres de recherche de ToursPage', () => {
  // Test du filtre de recherche textuelle
  test('Le filtre de recherche textuelle fonctionne correctement', async () => {
    const filters = { q: 'beach' };
    const result = await fetchToursWithFilters(filters);
    
    // Vérifier que les résultats contiennent le terme de recherche dans le nom ou la description
    expect(result).toBeDefined();
    
    // Vérifier si nous avons un tableau de tours ou un objet avec un tableau de tours
    const tours = Array.isArray(result) ? result : 
                 (result.tours ? result.tours : 
                 (result.data ? result.data : []));
    
    expect(tours.length).toBeGreaterThan(0);
    
    // Vérifier que chaque tour contient le terme de recherche dans son nom ou sa description
    tours.forEach(tour => {
      const tourText = `${tour.name} ${tour.short_description || ''}`;
      expect(tourText.toLowerCase()).toContain('beach');
    });
  });
  
  // Test du filtre de prix
  test('Le filtre de prix fonctionne correctement', async () => {
    const filters = { minPrice: 1000, maxPrice: 5000 };
    const result = await fetchToursWithFilters(filters);
    
    const tours = Array.isArray(result) ? result : 
                 (result.tours ? result.tours : 
                 (result.data ? result.data : []));
    
    expect(tours.length).toBeGreaterThan(0);
    
    // Vérifier que chaque tour a un prix dans la fourchette spécifiée
    tours.forEach(tour => {
      const price = parseFloat(tour.original_price);
      expect(price).toBeGreaterThanOrEqual(1000);
      expect(price).toBeLessThanOrEqual(5000);
    });
  });
  
  // Test du filtre de notation
  test('Le filtre de notation fonctionne correctement', async () => {
    const filters = { minRating: 4.5 };
    const result = await fetchToursWithFilters(filters);
    
    const tours = Array.isArray(result) ? result : 
                 (result.tours ? result.tours : 
                 (result.data ? result.data : []));
    
    expect(tours.length).toBeGreaterThan(0);
    
    // Vérifier que chaque tour a une notation supérieure ou égale à la notation minimale
    tours.forEach(tour => {
      const rating = parseFloat(tour.rating || tour.avg_rating);
      expect(rating).toBeGreaterThanOrEqual(4.5);
    });
  });
  
  // Test du filtre de durée
  test('Le filtre de durée fonctionne correctement', async () => {
    const filters = { duration: '4-7' };
    const result = await fetchToursWithFilters(filters);
    
    const tours = Array.isArray(result) ? result : 
                 (result.tours ? result.tours : 
                 (result.data ? result.data : []));
    
    expect(tours.length).toBeGreaterThan(0);
    
    // Vérifier que chaque tour a une durée dans la fourchette spécifiée
    tours.forEach(tour => {
      // La durée est déterminée par le nombre de jours dans l'itinéraire
      const duration = Object.keys(tour.itinerary || {}).length;
      expect(duration).toBeGreaterThanOrEqual(4);
      expect(duration).toBeLessThanOrEqual(7);
    });
  });
  
  // Test des options de tri
  test('Le tri par prix croissant fonctionne correctement', async () => {
    const filters = { sortBy: 'price_asc' };
    const result = await fetchToursWithFilters(filters);
    
    const tours = Array.isArray(result) ? result : 
                 (result.tours ? result.tours : 
                 (result.data ? result.data : []));
    
    expect(tours.length).toBeGreaterThan(0);
    
    // Vérifier que les tours sont triés par prix croissant
    for (let i = 1; i < tours.length; i++) {
      const prevPrice = parseFloat(tours[i-1].original_price);
      const currentPrice = parseFloat(tours[i].original_price);
      expect(currentPrice).toBeGreaterThanOrEqual(prevPrice);
    }
  });
  
  // Test de la combinaison de plusieurs filtres
  test('La combinaison de plusieurs filtres fonctionne correctement', async () => {
    const filters = { 
      q: 'beach', 
      minPrice: 1000, 
      maxPrice: 5000, 
      minRating: 4.0,
      sortBy: 'rating'
    };
    const result = await fetchToursWithFilters(filters);
    
    const tours = Array.isArray(result) ? result : 
                 (result.tours ? result.tours : 
                 (result.data ? result.data : []));
    
    expect(tours.length).toBeGreaterThan(0);
    
    // Vérifier que chaque tour répond à tous les critères
    tours.forEach(tour => {
      // Vérifier le terme de recherche
      const tourText = `${tour.name} ${tour.short_description || ''}`;
      expect(tourText.toLowerCase()).toContain('beach');
      
      // Vérifier le prix
      const price = parseFloat(tour.original_price);
      expect(price).toBeGreaterThanOrEqual(1000);
      expect(price).toBeLessThanOrEqual(5000);
      
      // Vérifier la notation
      const rating = parseFloat(tour.rating || tour.avg_rating);
      expect(rating).toBeGreaterThanOrEqual(4.0);
    });
    
    // Vérifier le tri par notation
    for (let i = 1; i < tours.length; i++) {
      const prevRating = parseFloat(tours[i-1].rating || tours[i-1].avg_rating);
      const currentRating = parseFloat(tours[i].rating || tours[i].avg_rating);
      expect(currentRating).toBeLessThanOrEqual(prevRating);
    }
  });
});