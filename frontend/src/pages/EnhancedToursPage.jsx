import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faFilter,
  faGrid,
  faList,
  faMapMarkerAlt,
  faExclamationTriangle,
  faRefresh,
  faHeart,
  faBookmark,
  faEye,
  faChevronDown,
  faChevronUp,
} from "@fortawesome/free-solid-svg-icons";
import EnhancedTourCard from "../components/tours/EnhancedTourCard";
import FilterControls from "../components/tours/FilterControls";

const EnhancedToursPage = () => {
  // États principaux
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({});
  
  // Configuration de l'URL du backend
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

  // États UI
  const [viewMode, setViewMode] = useState("grid"); // 'grid' ou 'list'
  const [sortBy, setSortBy] = useState("popularity"); // 'popularity', 'price', 'rating', 'name'
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [favorites, setFavorites] = useState(new Set());
  const [bookmarks, setBookmarks] = useState(new Set());

  // États d'animation
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);

  // Fetch tours avec gestion d'erreur améliorée
  const fetchTours = async (activeFilters = {}, showLoading = true) => {
    if (showLoading) setLoading(true);
    setError(null);

    try {
      const response = await axios.get(`${API_BASE_URL}/api/tours`, {
        params: { ...activeFilters, search: searchTerm },
        headers: {
          "Content-Type": "application/json",
          // Ajout du token d'authentification si nécessaire
          ...(localStorage.getItem("token") ? {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          } : {})
        },
        timeout: 10000 // 10 secondes de timeout
      });
      setTours(response.data);
      setAnimationKey((prev) => prev + 1);
    } catch (error) {
      console.error("Error fetching tours:", error);
      if (!error.response) {
        // Erreur réseau - pas de réponse du serveur
        const errorMessage = "Network error. Please check your connection.";
        setError(errorMessage);
        toast.error(errorMessage);
      } else {
        // Erreur avec réponse du serveur
        const errorMessage =
          error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          "Could not fetch tour packages. Please try again.";
        setError(errorMessage);
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  // Effet pour fetch initial et changements de filtres
  useEffect(() => {
    const debounceTimer = setTimeout(
      () => {
        fetchTours(filters);
      },
      searchTerm ? 500 : 0
    ); // Debounce pour la recherche

    return () => clearTimeout(debounceTimer);
  }, [filters, searchTerm]);

  // Tours filtrés et triés
  const processedTours = useMemo(() => {
    let filtered = [...tours];

    // Tri
    switch (sortBy) {
      case "price":
        filtered.sort((a, b) => {
          const priceA = a.tiers?.[0]?.price || a.price || 0;
          const priceB = b.tiers?.[0]?.price || b.price || 0;
          return priceA - priceB;
        });
        break;
      case "rating":
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case "name":
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "popularity":
      default:
        filtered.sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));
        break;
    }

    return filtered;
  }, [tours, sortBy]);

  // Gestion du refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchTours(filters, false);
  };

  // Gestion des favoris et bookmarks
  const toggleFavorite = (tourId) => {
    setFavorites((prev) => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(tourId)) {
        newFavorites.delete(tourId);
        toast.info("Removed from favorites");
      } else {
        newFavorites.add(tourId);
        toast.success("Added to favorites");
      }
      return newFavorites;
    });
  };

  const toggleBookmark = (tourId) => {
    setBookmarks((prev) => {
      const newBookmarks = new Set(prev);
      if (newBookmarks.has(tourId)) {
        newBookmarks.delete(tourId);
        toast.info("Bookmark removed");
      } else {
        newBookmarks.add(tourId);
        toast.success("Bookmarked for later");
      }
      return newBookmarks;
    });
  };

  // Animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const headerVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  const statsVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  // Composant de statistiques
  const StatsBar = () => (
    <motion.div
      variants={statsVariants}
      className="bg-white rounded-xl shadow-sm p-4 mb-6 border border-gray-100"
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <FontAwesomeIcon icon={faEye} className="text-primary" />
            <span className="text-sm text-gray-600">
              <span className="font-semibold text-gray-800">
                {tours.length}
              </span>{" "}
              tours available
            </span>
          </div>
          <div className="flex items-center gap-2">
            <FontAwesomeIcon icon={faHeart} className="text-red-500" />
            <span className="text-sm text-gray-600">
              <span className="font-semibold text-gray-800">
                {favorites.size}
              </span>{" "}
              favorites
            </span>
          </div>
          <div className="flex items-center gap-2">
            <FontAwesomeIcon icon={faBookmark} className="text-blue-500" />
            <span className="text-sm text-gray-600">
              <span className="font-semibold text-gray-800">
                {bookmarks.size}
              </span>{" "}
              bookmarked
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Bouton refresh */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            <FontAwesomeIcon
              icon={faRefresh}
              className={`text-gray-600 ${isRefreshing ? "animate-spin" : ""}`}
            />
          </motion.button>

          {/* Toggle view mode */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-md transition-colors ${
                viewMode === "grid"
                  ? "bg-white shadow-sm text-primary"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              <FontAwesomeIcon icon={faGrid} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-md transition-colors ${
                viewMode === "list"
                  ? "bg-white shadow-sm text-primary"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              <FontAwesomeIcon icon={faList} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );

  // Composant de contrôles de recherche et tri
  const SearchAndSort = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-100"
    >
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Barre de recherche */}
        <div className="flex-1 relative">
          <FontAwesomeIcon
            icon={faSearch}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search tours by name, destination, or activity..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          />
        </div>

        {/* Contrôles de tri */}
        <div className="flex gap-3">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
          >
            <option value="popularity">Most Popular</option>
            <option value="price">Price: Low to High</option>
            <option value="rating">Highest Rated</option>
            <option value="name">Name: A to Z</option>
          </select>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-3 rounded-lg border transition-all flex items-center gap-2 ${
              showFilters
                ? "bg-primary text-white border-primary"
                : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
            }`}
          >
            <FontAwesomeIcon icon={faFilter} />
            <span>Filters</span>
            <FontAwesomeIcon
              icon={showFilters ? faChevronUp : faChevronDown}
              className="text-sm"
            />
          </button>
        </div>
      </div>

      {/* Filtres avancés */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="pt-6 border-t border-gray-100 mt-6">
              <FilterControls onFilterChange={setFilters} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );

  // Composant de chargement amélioré
  const LoadingState = () => (
    <div className="flex flex-col items-center justify-center py-20">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full mb-4"
      />
      <p className="text-gray-600 text-lg">Loading amazing tours...</p>
    </div>
  );

  // Composant d'erreur amélioré
  const ErrorState = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-20"
    >
      <div className="bg-red-50 rounded-2xl p-8 max-w-md mx-auto">
        <FontAwesomeIcon
          icon={faExclamationTriangle}
          className="text-red-500 text-4xl mb-4"
        />
        <h3 className="text-xl font-bold text-gray-800 mb-2">
          Oops! Something went wrong
        </h3>
        <p className="text-gray-600 mb-6">{error}</p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => fetchTours(filters)}
          className="bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors"
        >
          Try Again
        </motion.button>
      </div>
    </motion.div>
  );

  // État vide amélioré
  const EmptyState = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-20"
    >
      <div className="bg-gray-50 rounded-2xl p-8 max-w-md mx-auto">
        <FontAwesomeIcon
          icon={faMapMarkerAlt}
          className="text-gray-400 text-4xl mb-4"
        />
        <h3 className="text-xl font-bold text-gray-800 mb-2">No tours found</h3>
        <p className="text-gray-600 mb-6">
          {searchTerm
            ? `No tours match your search for "${searchTerm}"`
            : "Try adjusting your filters to see more results"}
        </p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            setSearchTerm("");
            setFilters({});
            setShowFilters(false);
          }}
          className="bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors"
        >
          Clear All Filters
        </motion.button>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="container mx-auto px-6 py-12"
      >
        {/* En-tête avec animation */}
        <motion.div variants={headerVariants} className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-4">
            Discover Your Next
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600 ml-3">
              Adventure
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Explore our curated collection of extraordinary travel experiences
            designed to create lasting memories
          </p>
        </motion.div>

        {/* Barre de statistiques */}
        <StatsBar />

        {/* Contrôles de recherche et tri */}
        <SearchAndSort />

        {/* Contenu principal */}
        <AnimatePresence mode="wait">
          {loading ? (
            <LoadingState key="loading" />
          ) : error ? (
            <ErrorState key="error" />
          ) : processedTours.length === 0 ? (
            <EmptyState key="empty" />
          ) : (
            <motion.div
              key={`tours-${animationKey}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div
                className={`grid gap-8 ${
                  viewMode === "grid"
                    ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                    : "grid-cols-1"
                }`}
              >
                {processedTours.map((tour, index) => (
                  <EnhancedTourCard
                    key={tour.id}
                    tour={tour}
                    index={index}
                    isFavorite={favorites.has(tour.id)}
                    isBookmarked={bookmarks.has(tour.id)}
                    onToggleFavorite={() => toggleFavorite(tour.id)}
                    onToggleBookmark={() => toggleBookmark(tour.id)}
                    viewMode={viewMode}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default EnhancedToursPage;
