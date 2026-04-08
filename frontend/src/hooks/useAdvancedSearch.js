import { useState, useEffect, useCallback, useRef } from 'react';
import { useDebounce } from './useDebounce';
import apiUtils from '../utils/apiUtils';

// Hook pour la recherche avec debounce
export const useDebounceSearch = (initialQuery = '', delay = 300) => {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const debouncedQuery = useDebounce(query, delay);
  const abortControllerRef = useRef(null);

  // Fonction de recherche
  const performSearch = useCallback(async (searchQuery) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    // Annuler la requête précédente si elle existe
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Créer un nouveau contrôleur d'annulation
    abortControllerRef.current = new AbortController();

    setIsLoading(true);
    setError(null);

    try {
      const response = await apiUtils.searchTours(searchQuery, {
        signal: abortControllerRef.current.signal
      });
      
      setResults(response.data || []);
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err.message || 'Search failed');
        setResults([]);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Effectuer la recherche quand la query debounced change
  useEffect(() => {
    performSearch(debouncedQuery);
  }, [debouncedQuery, performSearch]);

  // Nettoyer lors du démontage
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const clearSearch = useCallback(() => {
    setQuery('');
    setResults([]);
    setError(null);
  }, []);

  return {
    query,
    setQuery,
    results,
    isLoading,
    error,
    clearSearch
  };
};

// Hook pour la recherche avancée avec filtres
export const useAdvancedSearch = (initialFilters = {}) => {
  const [filters, setFilters] = useState({
    query: '',
    category: [],
    priceRange: [0, 5000],
    duration: '',
    rating: 0,
    location: [],
    startDate: '',
    endDate: '',
    groupSize: [1, 20],
    features: [],
    sortBy: 'relevance',
    sortOrder: 'desc',
    ...initialFilters
  });

  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  
  const debouncedFilters = useDebounce(filters, 500);
  const abortControllerRef = useRef(null);

  // Fonction de recherche avec filtres
  const performAdvancedSearch = useCallback(async (searchFilters, page = 1, append = false) => {
    // Annuler la requête précédente
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    setIsLoading(true);
    setError(null);

    try {
      const searchParams = {
        ...searchFilters,
        page,
        limit: 12,
        signal: abortControllerRef.current.signal
      };

      const response = await apiUtils.searchToursAdvanced(searchParams);
      const { data, total, hasMore: moreResults } = response;

      if (append) {
        setResults(prev => [...prev, ...data]);
      } else {
        setResults(data);
      }
      
      setTotalResults(total);
      setHasMore(moreResults);
      setCurrentPage(page);
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err.message || 'Search failed');
        if (!append) {
          setResults([]);
          setTotalResults(0);
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Effectuer la recherche quand les filtres changent
  useEffect(() => {
    performAdvancedSearch(debouncedFilters, 1, false);
  }, [debouncedFilters, performAdvancedSearch]);

  // Fonction pour mettre à jour un filtre
  const updateFilter = useCallback((key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  // Fonction pour mettre à jour plusieurs filtres
  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters
    }));
  }, []);

  // Fonction pour réinitialiser les filtres
  const resetFilters = useCallback(() => {
    setFilters({
      query: '',
      category: [],
      priceRange: [0, 5000],
      duration: '',
      rating: 0,
      location: [],
      startDate: '',
      endDate: '',
      groupSize: [1, 20],
      features: [],
      sortBy: 'relevance',
      sortOrder: 'desc'
    });
  }, []);

  // Fonction pour charger plus de résultats
  const loadMore = useCallback(() => {
    if (hasMore && !isLoading) {
      performAdvancedSearch(filters, currentPage + 1, true);
    }
  }, [hasMore, isLoading, filters, currentPage, performAdvancedSearch]);

  // Fonction pour changer le tri
  const updateSort = useCallback((sortBy, sortOrder = 'desc') => {
    updateFilters({ sortBy, sortOrder });
  }, [updateFilters]);

  // Nettoyer lors du démontage
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    filters,
    updateFilter,
    updateFilters,
    resetFilters,
    results,
    isLoading,
    error,
    totalResults,
    currentPage,
    hasMore,
    loadMore,
    updateSort
  };
};

// Hook pour les suggestions de recherche
export const useSearchSuggestions = (query, delay = 200) => {
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const debouncedQuery = useDebounce(query, delay);
  const abortControllerRef = useRef(null);

  const fetchSuggestions = useCallback(async (searchQuery) => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    setIsLoading(true);

    try {
      const response = await apiUtils.getSearchSuggestions(searchQuery, {
        signal: abortControllerRef.current.signal
      });
      
      setSuggestions(response.data || []);
    } catch (err) {
      if (err.name !== 'AbortError') {
        setSuggestions([]);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSuggestions(debouncedQuery);
  }, [debouncedQuery, fetchSuggestions]);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    suggestions,
    isLoading
  };
};

// Hook pour l'historique de recherche
export const useSearchHistory = (maxItems = 10) => {
  const [history, setHistory] = useState([]);

  // Charger l'historique depuis localStorage au montage
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem('searchHistory');
      if (savedHistory) {
        setHistory(JSON.parse(savedHistory));
      }
    } catch (error) {
      console.error('Error loading search history:', error);
    }
  }, []);

  // Sauvegarder l'historique dans localStorage
  useEffect(() => {
    try {
      localStorage.setItem('searchHistory', JSON.stringify(history));
    } catch (error) {
      console.error('Error saving search history:', error);
    }
  }, [history]);

  const addToHistory = useCallback((searchTerm) => {
    if (!searchTerm.trim()) return;

    setHistory(prev => {
      // Supprimer le terme s'il existe déjà
      const filtered = prev.filter(item => 
        item.query.toLowerCase() !== searchTerm.toLowerCase()
      );
      
      // Ajouter le nouveau terme au début
      const newHistory = [{
        query: searchTerm,
        timestamp: Date.now()
      }, ...filtered];
      
      // Limiter le nombre d'éléments
      return newHistory.slice(0, maxItems);
    });
  }, [maxItems]);

  const removeFromHistory = useCallback((query) => {
    setHistory(prev => prev.filter(item => item.query !== query));
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  return {
    history,
    addToHistory,
    removeFromHistory,
    clearHistory
  };
};

// Hook pour les filtres populaires
export const usePopularFilters = () => {
  const [popularFilters, setPopularFilters] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchPopularFilters = async () => {
      setIsLoading(true);
      try {
        const response = await apiUtils.getPopularFilters();
        setPopularFilters(response.data || []);
      } catch (error) {
        console.error('Error fetching popular filters:', error);
        // Filtres par défaut en cas d'erreur
        setPopularFilters([
          { label: 'Beach Tours', filter: { category: ['beach'] } },
          { label: 'Adventure Tours', filter: { category: ['adventure'] } },
          { label: 'Under $500', filter: { priceRange: [0, 500] } },
          { label: 'Weekend Trips', filter: { duration: '1-3' } },
          { label: 'Kerala Tours', filter: { location: ['kerala'] } }
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPopularFilters();
  }, []);

  return {
    popularFilters,
    isLoading
  };
};

export default {
  useDebounceSearch,
  useAdvancedSearch,
  useSearchSuggestions,
  useSearchHistory,
  usePopularFilters
};