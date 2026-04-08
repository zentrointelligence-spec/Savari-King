import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSearch,
  faTimes,
  faSpinner,
  faMapMarkerAlt,
  faCalendarAlt,
  faUsers,
  faDollarSign,
  faFilter,
  faHistory,
  faStar,
  faClock,
} from '@fortawesome/free-solid-svg-icons';
import { useDebounce } from '../../hooks/useDebounce';
import { apiUtils } from '../../utils/apiUtils';

// Hook personnalisé pour le debounce
const useDebounceHook = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Composant de suggestion de recherche
const SearchSuggestion = ({ suggestion, onSelect, isHighlighted }) => {
  const getIcon = () => {
    switch (suggestion.type) {
      case 'tour':
        return faMapMarkerAlt;
      case 'destination':
        return faMapMarkerAlt;
      case 'category':
        return faFilter;
      case 'recent':
        return faHistory;
      default:
        return faSearch;
    }
  };

  const getTypeLabel = () => {
    switch (suggestion.type) {
      case 'tour':
        return 'Tour';
      case 'destination':
        return 'Destination';
      case 'category':
        return 'Category';
      case 'recent':
        return 'Recent';
      default:
        return '';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`
        px-4 py-3 cursor-pointer transition-colors duration-200
        ${isHighlighted ? 'bg-primary/10 border-l-4 border-primary' : 'hover:bg-gray-50'}
      `}
      onClick={() => onSelect(suggestion)}
    >
      <div className="flex items-center space-x-3">
        <div className={`
          w-8 h-8 rounded-full flex items-center justify-center
          ${isHighlighted ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500'}
        `}>
          <FontAwesomeIcon icon={getIcon()} className="text-sm" />
        </div>
        
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <span className="text-gray-900 font-medium">{suggestion.title}</span>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              {getTypeLabel()}
            </span>
          </div>
          
          {suggestion.description && (
            <p className="text-sm text-gray-600 mt-1 truncate">
              {suggestion.description}
            </p>
          )}
          
          {suggestion.metadata && (
            <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
              {suggestion.metadata.price && (
                <span className="flex items-center space-x-1">
                  <FontAwesomeIcon icon={faDollarSign} />
                  <span>From ${suggestion.metadata.price}</span>
                </span>
              )}
              {suggestion.metadata.duration && (
                <span className="flex items-center space-x-1">
                  <FontAwesomeIcon icon={faClock} />
                  <span>{suggestion.metadata.duration}</span>
                </span>
              )}
              {suggestion.metadata.rating && (
                <span className="flex items-center space-x-1">
                  <FontAwesomeIcon icon={faStar} className="text-yellow-500" />
                  <span>{suggestion.metadata.rating}</span>
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// Composant principal de recherche avancée
const AdvancedSearch = ({
  placeholder = "Search tours, destinations, or experiences...",
  onSearch,
  onSelect,
  showFilters = true,
  showRecentSearches = true,
  className = "",
  size = "medium"
}) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [filters, setFilters] = useState({
    priceRange: [0, 5000],
    duration: '',
    category: '',
    rating: 0,
    availability: ''
  });
  
  const searchRef = useRef(null);
  const suggestionsRef = useRef(null);
  const debouncedQuery = useDebounceHook(query, 300);

  // Charger les recherches récentes au montage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // Effectuer la recherche avec debounce
  useEffect(() => {
    if (debouncedQuery.trim().length >= 2) {
      performSearch(debouncedQuery);
    } else {
      setSuggestions([]);
      setIsLoading(false);
    }
  }, [debouncedQuery]);

  // Fermer les suggestions en cliquant à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const performSearch = useCallback(async (searchQuery) => {
    setIsLoading(true);
    try {
      // Recherche dans les tours
      const toursResponse = await apiUtils.searchTours(searchQuery);
      const tours = toursResponse.data.map(tour => ({
        id: tour.id,
        type: 'tour',
        title: tour.name,
        description: tour.description,
        metadata: {
          price: tour.price_per_person,
          duration: tour.duration,
          rating: tour.average_rating
        }
      }));

      // Recherche dans les destinations (simulée)
      const destinations = [
        { id: 1, name: 'Kerala Backwaters', type: 'destination' },
        { id: 2, name: 'Goa Beaches', type: 'destination' },
        { id: 3, name: 'Rajasthan Palaces', type: 'destination' }
      ].filter(dest => 
        dest.name.toLowerCase().includes(searchQuery.toLowerCase())
      ).map(dest => ({
        id: dest.id,
        type: 'destination',
        title: dest.name,
        description: `Explore ${dest.name}`
      }));

      // Recherche dans les catégories
      const categories = [
        'Adventure Tours',
        'Cultural Tours',
        'Beach Tours',
        'Wildlife Tours',
        'Spiritual Tours'
      ].filter(cat => 
        cat.toLowerCase().includes(searchQuery.toLowerCase())
      ).map((cat, index) => ({
        id: `cat-${index}`,
        type: 'category',
        title: cat,
        description: `Browse ${cat.toLowerCase()}`
      }));

      setSuggestions([...tours, ...destinations, ...categories]);
    } catch (error) {
      console.error('Search error:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    setIsOpen(true);
    setHighlightedIndex(-1);
    
    if (value.trim().length >= 2) {
      setIsLoading(true);
    }
  };

  const handleKeyDown = (e) => {
    if (!isOpen) return;

    const totalSuggestions = suggestions.length + (showRecentSearches ? recentSearches.length : 0);

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < totalSuggestions - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : totalSuggestions - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0) {
          const allSuggestions = [...suggestions, ...recentSearches];
          handleSelect(allSuggestions[highlightedIndex]);
        } else if (query.trim()) {
          handleSearch();
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setHighlightedIndex(-1);
        break;
    }
  };

  const handleSelect = (suggestion) => {
    setQuery(suggestion.title);
    setIsOpen(false);
    setHighlightedIndex(-1);
    
    // Ajouter aux recherches récentes
    const newRecentSearches = [
      suggestion,
      ...recentSearches.filter(item => item.id !== suggestion.id)
    ].slice(0, 5);
    
    setRecentSearches(newRecentSearches);
    localStorage.setItem('recentSearches', JSON.stringify(newRecentSearches));
    
    if (onSelect) {
      onSelect(suggestion);
    }
  };

  const handleSearch = () => {
    if (query.trim() && onSearch) {
      onSearch(query, filters);
      setIsOpen(false);
    }
  };

  const clearQuery = () => {
    setQuery('');
    setSuggestions([]);
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'h-10 text-sm';
      case 'large':
        return 'h-14 text-lg';
      default:
        return 'h-12 text-base';
    }
  };

  const allSuggestions = [...suggestions, ...recentSearches];
  const showSuggestions = isOpen && (suggestions.length > 0 || (showRecentSearches && recentSearches.length > 0));

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      {/* Champ de recherche */}
      <div className="relative">
        <div className={`
          flex items-center bg-white border-2 border-gray-200 rounded-xl
          focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10
          transition-all duration-200 ${getSizeClasses()}
        `}>
          <div className="pl-4 text-gray-400">
            <FontAwesomeIcon icon={faSearch} />
          </div>
          
          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsOpen(true)}
            placeholder={placeholder}
            className="flex-1 px-4 py-0 bg-transparent border-none outline-none text-gray-900 placeholder-gray-500"
          />
          
          {isLoading && (
            <div className="pr-4 text-gray-400">
              <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
            </div>
          )}
          
          {query && !isLoading && (
            <button
              onClick={clearQuery}
              className="pr-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          )}
        </div>
      </div>

      {/* Suggestions dropdown */}
      <AnimatePresence>
        {showSuggestions && (
          <motion.div
            ref={suggestionsRef}
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-50 max-h-96 overflow-y-auto"
          >
            {/* Recherches récentes */}
            {showRecentSearches && recentSearches.length > 0 && (
              <div>
                <div className="px-4 py-2 border-b border-gray-100">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Recent Searches
                  </span>
                </div>
                {recentSearches.map((item, index) => (
                  <SearchSuggestion
                    key={`recent-${item.id}`}
                    suggestion={{ ...item, type: 'recent' }}
                    onSelect={handleSelect}
                    isHighlighted={index === highlightedIndex}
                  />
                ))}
              </div>
            )}
            
            {/* Suggestions de recherche */}
            {suggestions.length > 0 && (
              <div>
                {showRecentSearches && recentSearches.length > 0 && (
                  <div className="px-4 py-2 border-b border-gray-100">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Search Results
                    </span>
                  </div>
                )}
                {suggestions.map((suggestion, index) => {
                  const adjustedIndex = showRecentSearches ? index + recentSearches.length : index;
                  return (
                    <SearchSuggestion
                      key={suggestion.id}
                      suggestion={suggestion}
                      onSelect={handleSelect}
                      isHighlighted={adjustedIndex === highlightedIndex}
                    />
                  );
                })}
              </div>
            )}
            
            {/* Message si aucun résultat */}
            {suggestions.length === 0 && query.trim().length >= 2 && !isLoading && (
              <div className="px-4 py-8 text-center text-gray-500">
                <FontAwesomeIcon icon={faSearch} className="text-2xl mb-2" />
                <p>No results found for "{query}"</p>
                <p className="text-sm mt-1">Try different keywords or check spelling</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdvancedSearch;