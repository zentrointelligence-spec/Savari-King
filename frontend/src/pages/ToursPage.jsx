import React, { useState, useEffect, useRef } from "react";
import Select from "react-select";
import { Link, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Price from "../components/common/Price";
import { useCurrency } from "../hooks/useCurrency";
import {
  faStar,
  faFilter,
  faSearch,
  faEye,
  faTimes,
  faMountain,
  faUsers,
  faUser,
  faTags,
  faEuroSign,
  faClock,
  faSort,
  faSpinner,
  faChevronLeft,
  faChevronRight,
  faChevronDown,
  faChevronUp,
} from "@fortawesome/free-solid-svg-icons";
import {
  faStar as faStarSolid,
  faStarHalfAlt,
} from "@fortawesome/free-solid-svg-icons";
import { faStar as faStarRegular } from "@fortawesome/free-regular-svg-icons";
import axios from "axios";

// Mapping des noms de paramètres frontend -> backend
const paramMapping = {
  searchText: "q",
  category: "category",
  destination: "destination",
  minPrice: "minPrice",
  maxPrice: "maxPrice",
  minRating: "minRating",
  maxRating: "maxRating",
  minAge: "minAge",
  minGroupSize: "minGroupSize",
  maxGroupSize: "maxGroupSize",
  adventureLevel: "adventureLevel",
  ecoFriendly: "isEcoFriendly",
  familyFriendly: "isFamilyFriendly",
  culturalImmersion: "isCulturalImmersion",
  themes: "themes",
  inclusions: "inclusions",
  duration: "duration",
  availabilityFrom: "availabilityFrom",
  availabilityUntil: "availabilityUntil",
  sortBy: "sortBy",
  page: "page", // Important: le paramètre page doit être mappé correctement
};

// Composant ActiveFilters
const ActiveFilters = ({ filters, onRemoveFilter, onClearAll, availableCategories }) => {
  const { t } = useTranslation();

  const getActiveFilters = () => {
    const activeFilters = [];

    // Recherche texte
    if (filters.searchText) {
      activeFilters.push({
        key: 'searchText',
        label: filters.searchText,
        icon: faSearch,
      });
    }

    // Catégorie
    if (filters.category) {
      const category = availableCategories.find(cat => cat.value === filters.category);
      activeFilters.push({
        key: 'category',
        label: `${t('tours.filters.category')}: ${category?.label || filters.category}`,
        icon: faTags,
      });
    }

    // Prix
    if (filters.minPrice || filters.maxPrice) {
      const priceLabel = filters.minPrice && filters.maxPrice
        ? `${t('tours.filters.priceRange')}: ${filters.minPrice}€ - ${filters.maxPrice}€`
        : filters.minPrice
        ? `${t('tours.filters.min')}: ${filters.minPrice}€`
        : `${t('tours.filters.max')}: ${filters.maxPrice}€`;
      activeFilters.push({
        key: 'price',
        label: priceLabel,
        icon: faEuroSign,
        removeKeys: ['minPrice', 'maxPrice'],
      });
    }

    // Rating
    if (filters.minRating) {
      activeFilters.push({
        key: 'minRating',
        label: `${t('tours.filters.rating')}: ${filters.minRating}+`,
        icon: faStar,
      });
    }

    // Adventure Level
    if (filters.adventureLevel) {
      activeFilters.push({
        key: 'adventureLevel',
        label: `${t('tours.filters.adventureLevel')}: ${filters.adventureLevel}`,
        icon: faMountain,
      });
    }

    // Age
    if (filters.minAge) {
      activeFilters.push({
        key: 'minAge',
        label: `${t('tours.filters.minAge')}: ${filters.minAge}+`,
        icon: faUser,
      });
    }

    // Group Size
    if (filters.groupSizeRange) {
      const groupSizeLabel = filters.groupSizeRange.includes('-')
        ? filters.groupSizeRange.split('-').join('-')
        : filters.groupSizeRange;
      activeFilters.push({
        key: 'groupSize',
        label: groupSizeLabel,
        icon: faUsers,
        removeKeys: ['groupSizeRange', 'minGroupSize', 'maxGroupSize'],
      });
    }

    // Duration
    if (filters.duration) {
      activeFilters.push({
        key: 'duration',
        label: `${t('tours.filters.duration')}: ${filters.duration} ${t('tours.filters.days') || 'jours'}`,
        icon: faClock,
      });
    }

    // Features
    if (filters.ecoFriendly) {
      activeFilters.push({
        key: 'ecoFriendly',
        label: '🌱 Eco',
        color: 'green',
      });
    }
    if (filters.familyFriendly) {
      activeFilters.push({
        key: 'familyFriendly',
        label: '👨‍👩‍👧‍👦 Family',
        color: 'blue',
      });
    }
    if (filters.culturalImmersion) {
      activeFilters.push({
        key: 'culturalImmersion',
        label: '🏛️ Culture',
        color: 'purple',
      });
    }

    return activeFilters;
  };

  const activeFilters = getActiveFilters();

  if (activeFilters.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700">
          {t('tours.activeFilters') || 'Filtres actifs'} ({activeFilters.length})
        </h3>
        <button
          onClick={onClearAll}
          className="text-xs text-primary hover:text-primary-dark font-semibold transition-colors"
        >
          {t('tours.clearAllFilters') || 'Effacer tout'}
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {activeFilters.map((filter, index) => (
          <motion.div
            key={`${filter.key}-${index}`}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
              filter.color === 'green'
                ? 'bg-green-50 text-green-800 border-green-200'
                : filter.color === 'blue'
                ? 'bg-blue-50 text-blue-800 border-blue-200'
                : filter.color === 'purple'
                ? 'bg-purple-50 text-purple-800 border-purple-200'
                : 'bg-white text-gray-700 border-gray-300'
            }`}
          >
            {filter.icon && <FontAwesomeIcon icon={filter.icon} className="text-xs" />}
            <span>{filter.label}</span>
            <button
              onClick={() => onRemoveFilter(filter.removeKeys || [filter.key])}
              className="ml-1 hover:text-red-600 transition-colors"
              aria-label="Remove filter"
            >
              <FontAwesomeIcon icon={faTimes} className="text-xs" />
            </button>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

// Composant Pagination
const Pagination = ({ pagination, onPageChange, loading }) => {
  const { t } = useTranslation();

  if (pagination.totalPages <= 1) return null;

  const generatePageNumbers = () => {
    const pages = [];
    const current = pagination.currentPage;
    const total = pagination.totalPages;
    const delta = 2;

    // Ajouter les pages autour de la page courante
    for (
      let i = Math.max(2, current - delta);
      i <= Math.min(total - 1, current + delta);
      i++
    ) {
      pages.push(i);
    }

    // Ajouter les ellipses si nécessaire
    if (current - delta > 2) pages.unshift("...");
    if (current + delta < total - 1) pages.push("...");

    // Toujours ajouter la première et dernière page
    pages.unshift(1);
    if (total > 1) pages.push(total);

    return pages;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col md:flex-row justify-center items-center mt-12 space-y-4 md:space-y-0 md:space-x-4"
    >
      {/* Informations de pagination */}
      <div className="text-sm text-gray-600">
        {t("tours.pagination.showing")}{" "}
        {Math.min(
          (pagination.currentPage - 1) * pagination.itemsPerPage + 1,
          pagination.totalCount
        )}
        -
        {Math.min(
          pagination.currentPage * pagination.itemsPerPage,
          pagination.totalCount
        )}{" "}
        {t("tours.pagination.of")} {pagination.totalCount}
        {t("tours.pagination.results")}
      </div>

      <div className="flex items-center space-x-2">
        {/* Bouton Précédent */}
        <button
          onClick={() => onPageChange(pagination.currentPage - 1)}
          disabled={!pagination.hasPrevPage || loading}
          className="flex items-center px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
        >
          <FontAwesomeIcon icon={faChevronLeft} className="mr-2" />
          {t("common.previous")}
        </button>

        {/* Numéros de page */}
        <div className="flex space-x-1">
          {generatePageNumbers().map((page, index) => (
            <button
              key={index}
              onClick={() =>
                typeof page === "number" ? onPageChange(page) : null
              }
              disabled={page === "..." || loading}
              className={`min-w-10 h-10 flex items-center justify-center border rounded-lg transition-colors ${
                page === pagination.currentPage
                  ? "bg-primary text-white border-primary"
                  : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
              } ${
                page === "..." ? "cursor-default" : ""
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {page === "..." ? "..." : page}
            </button>
          ))}
        </div>

        {/* Bouton Suivant */}
        <button
          onClick={() => onPageChange(pagination.currentPage + 1)}
          disabled={!pagination.hasNextPage || loading}
          className="flex items-center px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
        >
          {t("common.next")}
          <FontAwesomeIcon icon={faChevronRight} className="ml-2" />
        </button>
      </div>
    </motion.div>
  );
};

// Composant TourFilters (identique à précédemment)
const TourFilters = ({
  filters,
  onFiltersChange,
  onSearch,
  onShowAll,
  onClear,
  loading,
  availableCategories,
  onAutoSearch,
}) => {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const handleInputChange = (key, value) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const handleSelectChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    onFiltersChange(newFilters);
    // Déclencher la recherche automatique après changement de Select
    if (onAutoSearch) {
      onAutoSearch(newFilters);
    }
  };

  const handleGroupSizeChange = (selectedOption) => {
    let newFilters;
    if (!selectedOption || !selectedOption.min) {
      // Clear group size filters
      newFilters = { ...filters };
      delete newFilters.minGroupSize;
      delete newFilters.maxGroupSize;
      delete newFilters.groupSizeRange;
      onFiltersChange(newFilters);
    } else {
      // Set group size range
      newFilters = {
        ...filters,
        groupSizeRange: selectedOption.value,
        minGroupSize: selectedOption.min,
        maxGroupSize: selectedOption.max,
      };
      onFiltersChange(newFilters);
    }
    // Déclencher la recherche automatique
    if (onAutoSearch) {
      onAutoSearch(newFilters);
    }
  };

  const adventureLevelOptions = [
    { value: "", label: t("tours.filters.all") },
    { value: "Very Low", label: "Very Low" },
    { value: "Low", label: "Low" },
    { value: "Moderate", label: "Moderate" },
    { value: "High", label: "High" },
    { value: "Extreme", label: "Extreme" },
  ];

  const groupSizeOptions = [
    { value: "", label: t("tours.filters.all"), min: null, max: null },
    { value: "1-2", label: "Solo / Couple (1-2)", min: 1, max: 2 },
    { value: "3-8", label: "Small Group (3-8)", min: 3, max: 8 },
    { value: "9-15", label: "Medium Group (9-15)", min: 9, max: 15 },
    { value: "16-50", label: "Large Group (16+)", min: 16, max: 50 },
  ];

  const ageOptions = [
    { value: "", label: t("tours.filters.all") },
    { value: "6", label: "6+" },
    { value: "12", label: "12+" },
    { value: "16", label: "16+" },
    { value: "18", label: "18+" },
  ];

  function renderStars(rating) {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (rating >= i) {
        stars.push(<FontAwesomeIcon key={i} icon={faStarSolid} />);
      } else if (rating + 0.5 === i) {
        stars.push(<FontAwesomeIcon key={i} icon={faStarHalfAlt} />);
      } else {
        stars.push(<FontAwesomeIcon key={i} icon={faStarRegular} />);
      }
    }
    return <span style={{ marginLeft: "0.5rem" }}>{stars}</span>;
  }

  const ratingOptions = [
    { value: "", label: "All" },
    { value: "4.5", label: <>4.5+ {renderStars(4.5)}</> },
    { value: "4.0", label: <>4.0+ {renderStars(4.0)}</> },
    { value: "3.5", label: <>3.5+ {renderStars(3.5)}</> },
    { value: "3.0", label: <>3.0+ {renderStars(3.0)}</> },
  ];

  const sortOptions = [
    { value: "popularity", label: t("tours.filters.popularity") },
    { value: "price_asc", label: t("tours.filters.priceLowToHigh") },
    { value: "price_desc", label: t("tours.filters.priceHighToLow") },
    { value: "rating", label: t("tours.filters.topRated") },
    { value: "newest", label: t("tours.filters.newest") },
    { value: "featured", label: t("tours.filters.featured") },
  ];

  // Styles personnalisés pour react-select avec hauteur max et scroll
  const customSelectStyles = {
    menuList: (provided) => ({
      ...provided,
      maxHeight: '200px',
      overflowY: 'auto',
    }),
  };

  const handleBooleanFilter = (key, value) => {
    const newFilters = {
      ...filters,
      [key]: value === filters[key] ? false : value,
    };
    onFiltersChange(newFilters);
    // Déclencher la recherche automatique
    if (onAutoSearch) {
      onAutoSearch(newFilters);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-r from-white to-gray-50 rounded-2xl shadow-xl border border-gray-100 mb-8"
    >
      <div className="bg-gradient-to-r from-primary to-primary-dark p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-3 rounded-full">
              <FontAwesomeIcon icon={faFilter} className="text-white text-lg" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                {t("tours.filters.title")}
              </h2>
              <p className="text-white/80 text-sm">
                {t("tours.filters.subtitle")}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="lg:hidden bg-white/20 text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-colors"
          >
            {isExpanded ? t("common.collapse") : t("common.expand")}
          </button>
        </div>
      </div>

      <div className={`p-6 ${isExpanded ? "block" : "hidden lg:block"}`}>
        {/* Barre de recherche principale */}
        <div className="mb-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <FontAwesomeIcon icon={faSearch} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder={t("tours.filters.searchPlaceholder")}
              className="w-full pl-12 pr-4 py-4 text-lg border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 bg-white shadow-sm"
              value={filters.searchText || ""}
              onChange={(e) => handleInputChange("searchText", e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && onSearch()}
            />
            {filters.searchText && (
              <button
                onClick={() => handleInputChange("searchText", "")}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            )}
          </div>
        </div>

        {/* Filtres principaux (toujours visibles) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <FontAwesomeIcon icon={faTags} className="text-indigo-500" />
              {t("tours.filters.category")}
            </label>
            <Select
              className="w-full border-0 rounded-lg focus:ring-2 focus:ring-primary"
              options={availableCategories}
              styles={customSelectStyles}
              value={
                availableCategories.find(
                  (option) => option.value === (filters.category || "")
                ) || null
              }
              onChange={(selectedOption) =>
                handleSelectChange(
                  "category",
                  selectedOption ? selectedOption.value : ""
                )
              }
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <FontAwesomeIcon icon={faEuroSign} className="text-purple-500" />
              {t("tours.filters.priceRange")}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                placeholder={t("tours.filters.min")}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                value={filters.minPrice || ""}
                onChange={(e) => handleInputChange("minPrice", e.target.value)}
                min="0"
                step="10"
              />
              <input
                type="number"
                placeholder={t("tours.filters.max")}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                value={filters.maxPrice || ""}
                onChange={(e) => handleInputChange("maxPrice", e.target.value)}
                min="0"
                step="10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <FontAwesomeIcon icon={faStar} className="text-yellow-500" />
              {t("tours.filters.rating")}
            </label>
            <Select
              className="w-full border-0 rounded-lg focus:ring-2 focus:ring-primary"
              options={ratingOptions}
              styles={customSelectStyles}
              value={
                ratingOptions.find(
                  (option) => option.value === (filters.minRating || "")
                ) || null
              }
              onChange={(selectedOption) =>
                handleSelectChange(
                  "minRating",
                  selectedOption ? selectedOption.value : ""
                )
              }
            />
          </div>
        </div>

        {/* Bouton pour afficher les filtres avancés */}
        <div className="mb-6">
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="flex items-center gap-2 text-primary hover:text-primary-dark font-semibold transition-colors duration-200"
          >
            <FontAwesomeIcon
              icon={showAdvancedFilters ? faChevronUp : faChevronDown}
              className="text-sm"
            />
            <span>
              {showAdvancedFilters
                ? t("tours.filters.hideAdvancedFilters")
                : t("tours.filters.showAdvancedFilters")}
            </span>
          </button>
        </div>

        {/* Filtres avancés (affichés conditionnellement) */}
        {showAdvancedFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Niveau d'aventure + Âge + Taille groupe + Durée */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <FontAwesomeIcon icon={faMountain} className="text-green-500" />
              {t("tours.filters.adventureLevel")}
            </label>
            <Select
              className="w-full border-0 rounded-lg focus:ring-2 focus:ring-primary"
              options={adventureLevelOptions}
              styles={customSelectStyles}
              value={
                adventureLevelOptions.find(
                  (option) => option.value === (filters.adventureLevel || "")
                ) || null
              }
              onChange={(selectedOption) =>
                handleSelectChange(
                  "adventureLevel",
                  selectedOption ? selectedOption.value : ""
                )
              }
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <FontAwesomeIcon icon={faUser} className="text-blue-500" />
              {t("tours.filters.minAge")}
            </label>
            <Select
              className="w-full border-0 rounded-lg focus:ring-2 focus:ring-primary"
              options={ageOptions}
              styles={customSelectStyles}
              value={
                ageOptions.find(
                  (option) => option.value === (filters.minAge || "")
                ) || null
              }
              onChange={(selectedOption) =>
                handleSelectChange(
                  "minAge",
                  selectedOption ? selectedOption.value : ""
                )
              }
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <FontAwesomeIcon icon={faUsers} className="text-orange-500" />
              {t("tours.filters.groupSize")}
            </label>
            <Select
              className="w-full border-0 rounded-lg focus:ring-2 focus:ring-primary"
              options={groupSizeOptions}
              styles={customSelectStyles}
              value={
                groupSizeOptions.find(
                  (option) => option.value === (filters.groupSizeRange || "")
                ) || null
              }
              onChange={handleGroupSizeChange}
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <FontAwesomeIcon icon={faClock} className="text-primary" />
              {t("tours.filters.duration")} (jours)
            </label>
            <input
              type="number"
              placeholder={t("tours.filters.durationPlaceholder")}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all"
              value={filters.duration || ""}
              onChange={(e) => handleInputChange("duration", e.target.value)}
              min="1"
            />
          </div>
        </div>

        {/* Features + Tri */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <FontAwesomeIcon icon={faTags} className="text-red-500" />
              {t("tours.filters.features")}
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleBooleanFilter("ecoFriendly", true)}
                className={`px-3 py-1 rounded-full text-sm transition-all ${
                  filters.ecoFriendly
                    ? "bg-green-100 text-green-800 border border-green-300"
                    : "bg-gray-100 text-gray-600 border border-gray-300"
                }`}
              >
                🌱 Eco
              </button>
              <button
                onClick={() => handleBooleanFilter("familyFriendly", true)}
                className={`px-3 py-1 rounded-full text-sm transition-all ${
                  filters.familyFriendly
                    ? "bg-blue-100 text-blue-800 border border-blue-300"
                    : "bg-gray-100 text-gray-600 border border-gray-300"
                }`}
              >
                👨‍👩‍👧‍👦 Family
              </button>
              <button
                onClick={() => handleBooleanFilter("culturalImmersion", true)}
                className={`px-3 py-1 rounded-full text-sm transition-all ${
                  filters.culturalImmersion
                    ? "bg-purple-100 text-purple-800 border border-purple-300"
                    : "bg-gray-100 text-gray-600 border border-gray-300"
                }`}
              >
                🏛️ Culture
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <FontAwesomeIcon icon={faSort} className="text-primary" />
              {t("tours.filters.sortBy")}
            </label>
            <Select
              className="w-full border-0 rounded-lg focus:ring-2 focus:ring-primary"
              options={sortOptions}
              styles={customSelectStyles}
              value={
                sortOptions.find(
                  (option) => option.value === (filters.sortBy || "popularity")
                ) || null
              }
              onChange={(selectedOption) =>
                handleSelectChange(
                  "sortBy",
                  selectedOption ? selectedOption.value : "popularity"
                )
              }
            />
          </div>
        </div>
          </motion.div>
        )}

        {/* Boutons d'action */}
        <div className="flex flex-wrap gap-3 justify-center lg:justify-end">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onSearch}
            disabled={loading}
            className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-primary to-primary-dark text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
            ) : (
              <FontAwesomeIcon icon={faSearch} />
            )}
            {t("common.search")}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onShowAll}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FontAwesomeIcon icon={faEye} />
            {t("tours.showAllTours")}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

// Composant principal ToursPage
const ToursPage = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [availableCategories, setAvailableCategories] = useState([]);

  // État de pagination synchronisé avec l'URL
  const [pagination, setPagination] = useState({
    currentPage: parseInt(searchParams.get("page")) || 1,
    totalPages: 0,
    totalCount: 0,
    itemsPerPage: 9,
    hasNextPage: false,
    hasPrevPage: false,
  });

  // Refs pour le debounce
  const debounceTimerRef = useRef(null);

  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

  // Fonction pour extraire les filtres de l'URL
  const getFiltersFromSearchParams = () => {
    const filters = {};
    for (const [key, value] of searchParams.entries()) {
      if (key === "page") continue; // Ignorer le paramètre page

      // Trouver la clé frontend correspondante
      const frontendKey =
        Object.keys(paramMapping).find((k) => paramMapping[k] === key) || key;

      filters[frontendKey] = value;
    }
    return filters;
  };

  const [filters, setFilters] = useState(getFiltersFromSearchParams);

  // Fonction pour mettre à jour l'URL avec les filtres et la page
  const updateSearchParams = (newFilters, newPage = 1) => {
    const params = new URLSearchParams();

    // Ajouter la page
    params.set("page", newPage.toString());

    // Ajouter les filtres
    Object.keys(newFilters).forEach((key) => {
      if (
        newFilters[key] &&
        newFilters[key] !== "" &&
        newFilters[key] !== false
      ) {
        const backendKey = paramMapping[key] || key;
        let value = newFilters[key];

        if (typeof value === "boolean") {
          value = value.toString();
        }

        params.set(backendKey, value);
      }
    });

    setSearchParams(params, { replace: true });
  };

  // Fonction pour récupérer les tours
  const fetchTours = async (isInitialLoad = false) => {
    try {
      // Pour le chargement initial, on utilise loading, sinon searchLoading
      if (isInitialLoad) {
        setLoading(true);
      } else {
        setSearchLoading(true);
      }
      console.log("1");

      // Construire les paramètres URL
      const params = new URLSearchParams();

      console.log("2");
      // Ajouter tous les paramètres de l'URL actuelle
      for (const [key, value] of searchParams.entries()) {
        params.append(key, value);
      }

      console.log("3");
      console.log("Fetching tours with params:", params.toString());

      console.log(
        `${API_BASE_URL}/api/tours/advanced-search?${params.toString()}`
      );

      const response = await axios.get(
        `${API_BASE_URL}/api/tours/advanced-search?${params.toString()}`
      );
      console.log("4");

      if (response.data && response.data.success !== false) {
        let toursData = [];
        let paginationData = {};

        // Gestion des différents formats de réponse
        if (response.data.tours && Array.isArray(response.data.tours)) {
          toursData = response.data.tours;
          paginationData = response.data.pagination || {};
        } else if (Array.isArray(response.data)) {
          toursData = response.data;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          toursData = response.data.data;
          paginationData = response.data.pagination || {};
        }

        setTours(toursData);

        // Mettre à jour la pagination
        if (paginationData.currentPage) {
          setPagination({
            currentPage: paginationData.currentPage,
            totalPages: paginationData.totalPages || 0,
            totalCount: paginationData.totalCount || toursData.length,
            itemsPerPage: paginationData.itemsPerPage || 9,
            hasNextPage: paginationData.hasNextPage || false,
            hasPrevPage: paginationData.hasPrevPage || false,
          });
        }

        // Mettre à jour les catégories disponibles
        if (response.data.availableFilters?.categories) {
          const formattedCategories = [
            { value: "", label: t("tours.filters.all") || "All" },
            ...response.data.availableFilters.categories.map((cat) => ({
              value: cat.slug,
              label: cat.name,
              icon: cat.icon,
              color: cat.color,
            })),
          ];
          setAvailableCategories(formattedCategories);
        }
      }
      console.log("5");
    } catch (error) {
      console.error("Error fetching tours:", error);
      if (error.response?.status === 404) {
        setTours([]);
        setPagination((prev) => ({ ...prev, totalCount: 0, totalPages: 0 }));
      } else {
        toast.error(error.response?.data?.error || t("common.error"));
      }
    } finally {
      setLoading(false);
      setSearchLoading(false);
    }
  };

  // Effet pour charger les tours quand les searchParams changent
  useEffect(() => {
    // Mettre à jour les filtres depuis l'URL
    setFilters(getFiltersFromSearchParams());

    // Mettre à jour la page depuis l'URL
    const pageFromUrl = parseInt(searchParams.get("page")) || 1;
    setPagination((prev) => ({ ...prev, currentPage: pageFromUrl }));

    // Charger les données - chargement initial seulement si loading est true
    fetchTours(loading);
  }, [searchParams]);

  // Gestionnaires d'événements
  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);

    // Débounce pour searchText, prix et duration
    const needsDebounce =
      (newFilters.searchText !== filters.searchText) ||
      (newFilters.minPrice !== filters.minPrice) ||
      (newFilters.maxPrice !== filters.maxPrice) ||
      (newFilters.duration !== filters.duration);

    if (needsDebounce) {
      // Annuler le timer précédent
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Créer un nouveau timer
      debounceTimerRef.current = setTimeout(() => {
        updateSearchParams(newFilters, 1);
      }, 1500); // 1.5 secondes
    }
  };

  const handleAutoSearch = (newFilters) => {
    // Recherche immédiate pour les Select et features
    // Utiliser les nouveaux filtres passés en paramètre
    updateSearchParams(newFilters || filters, 1);
  };

  const handleSearch = () => {
    // Annuler le debounce si l'utilisateur clique sur Search
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    updateSearchParams(filters, 1); // Toujours revenir à la page 1 pour une nouvelle recherche
  };

  const handleShowAll = () => {
    setFilters({});
    setSearchParams({ page: "1" }, { replace: true });
  };

  const handleClear = () => {
    setFilters({});
    setSearchParams({ page: "1" }, { replace: true });
  };

  const handleRemoveFilter = (keysToRemove) => {
    const newFilters = { ...filters };
    keysToRemove.forEach(key => {
      delete newFilters[key];
    });
    setFilters(newFilters);
    updateSearchParams(newFilters, 1); // Retour à la page 1 après suppression de filtre
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;

    // Mettre à jour l'URL avec la nouvelle page
    updateSearchParams(filters, newPage);

    // Scroll vers le haut
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-xl text-gray-600">{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            {t("tours.title")}
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t("tours.subtitle")}
          </p>
        </div>

        {/* Filters */}
        <TourFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onSearch={handleSearch}
          onShowAll={handleShowAll}
          onClear={handleClear}
          loading={searchLoading}
          availableCategories={availableCategories}
          onAutoSearch={handleAutoSearch}
        />

        {/* Active Filters */}
        <ActiveFilters
          filters={filters}
          onRemoveFilter={handleRemoveFilter}
          onClearAll={handleClear}
          availableCategories={availableCategories}
        />

        {/* Content */}
        {/* Loading State for Search */}
        {searchLoading ? (
          <div className="flex items-center justify-center py-20 min-h-[400px]">
            <div className="text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"
              />
              <p className="text-xl text-gray-600">{t("common.loading")}</p>
            </div>
          </div>
        ) : (
          <div className="min-h-[400px]">
            {/* Results Summary */}
            {tours.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center mb-8"
              >
                <p className="text-lg text-gray-700">
                  {t("tours.pagination.showing")}{" "}
                  <span className="font-semibold text-primary">
                    {Math.min(
                      (pagination.currentPage - 1) * pagination.itemsPerPage + 1,
                      pagination.totalCount
                    )}
                    -
                    {Math.min(
                      pagination.currentPage * pagination.itemsPerPage,
                      pagination.totalCount
                    )}
                  </span>{" "}
                  {t("tours.pagination.of")}{" "}
                  <span className="font-semibold text-primary">
                    {pagination.totalCount}
                  </span>{" "}
                  {t("tours.pagination.results")}
                </p>
              </motion.div>
            )}

            {/* Tours Grid */}
            {tours.length > 0 ? (
              <>
                <motion.div
                  key={`tours-${pagination.currentPage}-${tours.length}`}
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
                >
                  {tours.map((tour) => (
                    <motion.div
                      key={tour.id}
                      variants={cardVariants}
                      className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
                    >
                        <div className="relative">
                          <img
                            src={
                              tour.main_image_url ||
                              "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400"
                            }
                            alt={tour.name}
                            className="w-full h-48 object-cover"
                          />
                          <div className="absolute top-4 right-4 bg-primary text-white px-3 py-1 rounded-full text-sm font-semibold">
                            {tour.final_price ? (
                              <Price priceINR={tour.final_price} size="sm" showLabel={false} />
                            ) : (
                              t("tours.contactForPrice")
                            )}
                          </div>
                          {tour.is_featured && (
                            <div className="absolute top-4 left-4 bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                              {t("tours.featured")}
                            </div>
                          )}
                          {tour.category_name && (
                            <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm text-gray-800 px-3 py-1 rounded-full text-xs font-semibold shadow-md">
                              {tour.category_name}
                            </div>
                          )}
                        </div>

                        <div className="p-6">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="text-xl font-bold text-gray-800 flex-1">
                              {tour.name}
                            </h3>
                            {tour.adventure_level && (
                              <span className={`ml-2 px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                                tour.adventure_level === 'Very Low' ? 'bg-green-100 text-green-800' :
                                tour.adventure_level === 'Low' ? 'bg-blue-100 text-blue-800' :
                                tour.adventure_level === 'Moderate' ? 'bg-yellow-100 text-yellow-800' :
                                tour.adventure_level === 'High' ? 'bg-orange-100 text-orange-800' :
                                tour.adventure_level === 'Extreme' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {tour.adventure_level}
                              </span>
                            )}
                          </div>

                          <p className="text-gray-600 mb-4 line-clamp-2">
                            {tour.short_description ||
                              t("tours.defaultDescription")}
                          </p>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center text-yellow-500">
                              <FontAwesomeIcon icon={faStar} className="mr-1" />
                              <span className="text-gray-700 font-medium">
                                {tour.avg_rating || "4.8"} (
                                {tour.review_count || "0"} {t("tours.reviews")})
                              </span>
                            </div>
                            <Link
                              to={`/tours/${tour.id}`}
                              className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg transition-colors duration-200"
                            >
                              {t("tours.viewDetails")}
                            </Link>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>

                {/* Pagination */}
                <Pagination
                  pagination={pagination}
                  onPageChange={handlePageChange}
                  loading={searchLoading}
                />
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="text-center py-16"
              >
                <div className="max-w-md mx-auto">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">
                    {t("tours.noResults")}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {t("tours.tryDifferentFilters")}
                  </p>
                  <button
                    onClick={handleShowAll}
                    className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200"
                  >
                    {t("tours.showAllTours")}
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ToursPage;
