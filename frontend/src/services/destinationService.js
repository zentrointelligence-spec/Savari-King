import { api } from '../config/api';
import API_CONFIG from '../config/api';

/**
 * ======================================================================
 * DESTINATION SERVICE - REFACTORED FOR PHASE 3
 * ======================================================================
 * Service pour gérer les appels API liés aux destinations
 * Utilise les nouveaux endpoints enrichis de Phase 1 & 2
 * ======================================================================
 */
class DestinationService {
  /**
   * Récupère les destinations populaires (nouveau endpoint principal)
   * @param {number} limit - Nombre de destinations à récupérer (default: 6)
   * @param {string} criteria - Critère de tri: 'popularity', 'rating', 'trending', 'featured'
   * @returns {Promise} Promesse contenant les données enrichies des destinations
   */
  async getPopularDestinations(limit = 6, criteria = 'popularity') {
    try {
      const response = await api.get(`/api/destinations/popular?limit=${limit}&criteria=${criteria}`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des destinations populaires:', error);
      throw error;
    }
  }

  /**
   * Récupère les top destinations (legacy - pour compatibilité)
   * @returns {Promise} Promesse contenant les données des destinations
   */
  async getTopDestinations() {
    try {
      const response = await api.get(API_CONFIG.ENDPOINTS.TOP_DESTINATIONS);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des top destinations:', error);
      throw error;
    }
  }

  /**
   * Récupère toutes les destinations avec filtres
   * @param {Object} filters - Filtres à appliquer
   * @returns {Promise} Promesse contenant les destinations filtrées
   */
  async getDestinations(filters = {}) {
    try {
      const params = new URLSearchParams();

      // Ajouter les filtres aux paramètres
      if (filters.regions) params.append('regions', filters.regions);
      if (filters.budgetCategories) params.append('budgetCategories', filters.budgetCategories);
      if (filters.adventureLevels) params.append('adventureLevels', filters.adventureLevels);
      if (filters.minRating) params.append('minRating', filters.minRating);
      if (filters.limit) params.append('limit', filters.limit);
      if (filters.offset) params.append('offset', filters.offset);

      const response = await api.get(`/api/destinations?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des destinations:', error);
      throw error;
    }
  }

  /**
   * Récupère les destinations en vedette
   * @param {number} limit - Nombre de destinations
   * @returns {Promise} Destinations en vedette
   */
  async getFeaturedDestinations(limit = 6) {
    try {
      const response = await api.get(`/api/destinations/featured?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des destinations en vedette:', error);
      throw error;
    }
  }

  /**
   * Récupère les destinations tendances
   * @param {number} limit - Nombre de destinations
   * @returns {Promise} Destinations tendances
   */
  async getTrendingDestinations(limit = 6) {
    try {
      const response = await api.get(`/api/destinations/trending?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des destinations tendances:', error);
      throw error;
    }
  }

  /**
   * Recherche avancée de destinations
   * @param {Object} searchParams - Paramètres de recherche
   * @returns {Promise} Résultats de recherche
   */
  async searchDestinations(searchParams) {
    try {
      const response = await api.post('/api/destinations/search', searchParams);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la recherche de destinations:', error);
      throw error;
    }
  }

  /**
   * Récupère les détails complets d'une destination
   * @param {number} id - ID de la destination
   * @returns {Promise} Détails complets de la destination
   */
  async getDestinationById(id) {
    try {
      const response = await api.get(`/api/destinations/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération de la destination ${id}:`, error);
      throw error;
    }
  }

  /**
   * Récupère les destinations similaires
   * @param {number} id - ID de la destination source
   * @param {number} limit - Nombre de destinations similaires
   * @returns {Promise} Destinations similaires
   */
  async getRelatedDestinations(id, limit = 4) {
    try {
      const response = await api.get(`/api/destinations/${id}/related?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération des destinations similaires pour ${id}:`, error);
      throw error;
    }
  }

  /**
   * Récupère les destinations à proximité
   * @param {number} id - ID de la destination source
   * @param {number} limit - Nombre de destinations
   * @param {number} radius - Rayon en km (default: 500)
   * @returns {Promise} Destinations à proximité
   */
  async getNearbyDestinations(id, limit = 4, radius = 500) {
    try {
      const response = await api.get(`/api/destinations/${id}/nearby?limit=${limit}&radius=${radius}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération des destinations à proximité pour ${id}:`, error);
      throw error;
    }
  }

  /**
   * Récupère les statistiques d'une destination
   * @param {number} id - ID de la destination
   * @returns {Promise} Statistiques de la destination
   */
  async getDestinationStats(id) {
    try {
      const response = await api.get(`/api/destinations/${id}/stats`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération des stats pour la destination ${id}:`, error);
      throw error;
    }
  }

  /**
   * Toggle le like d'une destination
   * @param {number} destinationId - ID de la destination
   * @returns {Promise} Promesse contenant la réponse du serveur
   */
  async toggleDestinationLike(destinationId) {
    try {
      const response = await api.post(API_CONFIG.ENDPOINTS.DESTINATION_LIKE(destinationId));
      return response.data;
    } catch (error) {
      console.error(`Erreur lors du toggle like pour la destination ${destinationId}:`, error);
      throw error;
    }
  }

  /**
   * Récupère les destinations likées par l'utilisateur
   * @returns {Promise} Liste des destinations likées
   */
  async getUserLikedDestinations() {
    try {
      const response = await api.get('/api/destinations/liked');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des destinations likées:', error);
      throw error;
    }
  }

  /**
   * Synchronise les likes locaux avec le serveur (lors de la connexion)
   * @param {Array} localLikes - Array d'IDs de destinations likées localement
   * @returns {Promise} Résultat de la synchronisation
   */
  async syncLocalLikes(localLikes = []) {
    try {
      const response = await api.post('/api/destinations/sync-likes', { localLikes });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la synchronisation des likes:', error);
      throw error;
    }
  }

  /**
   * Vérifie si une destination est likée par l'utilisateur actuel
   * @param {number} destinationId - ID de la destination
   * @returns {Promise<boolean>} True si la destination est likée
   */
  async isDestinationLiked(destinationId) {
    try {
      const likedDestinations = await this.getUserLikedDestinations();
      return likedDestinations.data.some(d => d.id === destinationId);
    } catch (error) {
      console.error(`Erreur lors de la vérification du like pour la destination ${destinationId}:`, error);
      return false;
    }
  }

  /**
   * Helpers pour filtrer les destinations côté client
   */

  /**
   * Filtre les destinations par saison actuelle
   * @param {Array} destinations - Liste de destinations
   * @returns {Array} Destinations avec bonne saison actuellement
   */
  filterByCurrentSeason(destinations) {
    const currentMonth = new Date().getMonth() + 1;
    return destinations.filter(dest => {
      if (!dest.timing?.bestTimeToVisit) return true;
      // Simple check - can be enhanced with seasonService logic
      return true; // Pour l'instant, retourner toutes
    });
  }

  /**
   * Filtre les destinations avec festivals à venir
   * @param {Array} destinations - Liste de destinations
   * @param {number} monthsAhead - Nombre de mois à regarder
   * @returns {Array} Destinations avec festivals
   */
  filterByUpcomingFestivals(destinations, monthsAhead = 3) {
    const now = new Date();
    const futureDate = new Date();
    futureDate.setMonth(futureDate.getMonth() + monthsAhead);

    return destinations.filter(dest => {
      if (!dest.timing?.upcomingFestivals?.length) return false;
      return dest.timing.upcomingFestivals.some(festival => {
        const festivalDate = new Date(festival.date);
        return festivalDate >= now && festivalDate <= futureDate;
      });
    });
  }

  /**
   * Trie les destinations par score de popularité
   * @param {Array} destinations - Liste de destinations
   * @param {boolean} descending - Ordre descendant (default: true)
   * @returns {Array} Destinations triées
   */
  sortByPopularity(destinations, descending = true) {
    return [...destinations].sort((a, b) => {
      const scoreA = a.stats?.popularityScore || 0;
      const scoreB = b.stats?.popularityScore || 0;
      return descending ? scoreB - scoreA : scoreA - scoreB;
    });
  }

  /**
   * Trie les destinations par note moyenne
   * @param {Array} destinations - Liste de destinations
   * @param {boolean} descending - Ordre descendant (default: true)
   * @returns {Array} Destinations triées
   */
  sortByRating(destinations, descending = true) {
    return [...destinations].sort((a, b) => {
      const ratingA = a.stats?.avgRating || 0;
      const ratingB = b.stats?.avgRating || 0;
      return descending ? ratingB - ratingA : ratingA - ratingB;
    });
  }

  /**
   * Récupère une destination par son slug
   * @param {string} slug - Le slug de la destination
   * @returns {Promise} Promesse contenant les données de la destination
   */
  async getDestinationBySlug(slug) {
    try {
      const response = await api.get(`/api/destinations/slug/${slug}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération de la destination avec slug ${slug}:`, error);
      throw error;
    }
  }

  /**
   * Récupère les tours disponibles pour une destination
   * @param {number} destinationId - ID de la destination
   * @returns {Promise} Promesse contenant les tours
   */
  async getDestinationTours(destinationId) {
    try {
      const response = await api.get(`/api/tours?destination=${destinationId}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération des tours pour la destination ${destinationId}:`, error);
      // Return empty array on error instead of throwing
      return { data: [] };
    }
  }
}

// Exporter une instance unique du service
const destinationService = new DestinationService();
export default destinationService;

// Exporter aussi la classe pour les tests ou l'instanciation personnalisée
export { DestinationService };