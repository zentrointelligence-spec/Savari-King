import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import API_CONFIG, { buildApiUrl } from '../config/api';
import { useDebounce } from './useDebounce';

/**
 * Hook personnalisé pour gérer les données de la page d'accueil
 * Inclut la gestion du cache, des erreurs et du loading
 */
export const useHomepageData = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastFetch, setLastFetch] = useState(null);

  // Cache des données pendant 5 minutes
  const CACHE_DURATION = 5 * 60 * 1000;

  const fetchData = useCallback(async (forceRefresh = false) => {
    // Vérifier si les données sont encore valides dans le cache
    if (!forceRefresh && lastFetch && Date.now() - lastFetch < CACHE_DURATION && data) {
      return data;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(buildApiUrl(API_CONFIG.ENDPOINTS.HOMEPAGE_DATA));
      
      setData(response.data);
      setLastFetch(Date.now());
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Erreur lors du chargement des données';
      setError(errorMessage);
      console.error('Erreur useHomepageData:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [data, lastFetch]);

  // Charger les données au montage du composant
  useEffect(() => {
    fetchData();
  }, []);

  const refresh = useCallback(() => {
    return fetchData(true);
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refresh,
    isStale: lastFetch && Date.now() - lastFetch > CACHE_DURATION
  };
};

/**
 * Hook pour gérer les données des tours (bestsellers, latest, etc.)
 */
export const useTours = () => {
  const [bestsellers, setBestsellers] = useState([]);
  const [latestTours, setLatestTours] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchBestsellers = useCallback(async (limit = 3) => {
    try {
      setLoading(true);
      const response = await axios.get(buildApiUrl(`/api/tours/bestsellers?limit=${limit}`));
      setBestsellers(response.data);
      return response.data;
    } catch (err) {
      setError('Erreur lors du chargement des bestsellers');
      console.error('Erreur fetchBestsellers:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchLatestTours = useCallback(async (limit = 6) => {
    try {
      setLoading(true);
      const response = await axios.get(buildApiUrl(`/api/tours/latest?limit=${limit}`));
      setLatestTours(response.data);
      return response.data;
    } catch (err) {
      setError('Erreur lors du chargement des derniers tours');
      console.error('Erreur fetchLatestTours:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    bestsellers,
    latestTours,
    loading,
    error,
    fetchBestsellers,
    fetchLatestTours
  };
};

/**
 * Hook pour gérer les catégories de tours
 */
export const useCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(buildApiUrl('/api/tours/categories'));
      setCategories(response.data);
      return response.data;
    } catch (err) {
      setError('Erreur lors du chargement des catégories');
      console.error('Erreur fetchCategories:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return {
    categories,
    loading,
    error,
    refresh: fetchCategories
  };
};

/**
 * Hook pour gérer les avis clients
 */
export const useReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchFeaturedReviews = useCallback(async (limit = 6) => {
    try {
      setLoading(true);
      const response = await axios.get(buildApiUrl(`/api/reviews/featured?limit=${limit}`));
      setReviews(response.data);
      return response.data;
    } catch (err) {
      setError('Erreur lors du chargement des avis');
      console.error('Erreur fetchFeaturedReviews:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    reviews,
    loading,
    error,
    fetchFeaturedReviews
  };
};

/**
 * Hook pour gérer les offres spéciales
 */
export const useSpecialOffers = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchActiveOffers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(buildApiUrl('/api/offers/active'));
      setOffers(response.data);
      return response.data;
    } catch (err) {
      setError('Erreur lors du chargement des offres');
      console.error('Erreur fetchActiveOffers:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    offers,
    loading,
    error,
    fetchActiveOffers
  };
};

/**
 * Hook pour gérer les destinations
 */
export const useDestinations = () => {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchFeaturedDestinations = useCallback(async (limit = 4) => {
    try {
      setLoading(true);
      const response = await axios.get(buildApiUrl(`/api/destinations/featured?limit=${limit}`));
      setDestinations(response.data);
      return response.data;
    } catch (err) {
      setError('Erreur lors du chargement des destinations');
      console.error('Erreur fetchFeaturedDestinations:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    destinations,
    loading,
    error,
    fetchFeaturedDestinations
  };
};

/**
 * Hook pour gérer les articles de blog
 */
export const useBlogPosts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTravelGuidePosts = useCallback(async (limit = 3) => {
    try {
      setLoading(true);
      const response = await axios.get(buildApiUrl(`/api/blog/travel-guide?limit=${limit}`));
      setPosts(response.data);
      return response.data;
    } catch (err) {
      setError('Erreur lors du chargement des articles');
      console.error('Erreur fetchTravelGuidePosts:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    posts,
    loading,
    error,
    fetchTravelGuidePosts
  };
};