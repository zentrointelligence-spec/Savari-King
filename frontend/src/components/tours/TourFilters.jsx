import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFilter,
  faSearch,
  faEye,
  faTimes,
  faChevronDown,
  faChevronUp,
  faStar,
  faEuroSign,
  faClock,
  faSort,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { motion } from "framer-motion";

const TourFilters = ({
  filters,
  onFiltersChange,
  onSearch,
  onShowAll,
  onClear,
  loading,
}) => {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);

  // Mapping des noms de paramètres frontend -> backend
  const paramMapping = {
    minPrice: "min_price",
    maxPrice: "max_price",
    minRating: "min_rating",
    duration: "duration",
    sortBy: "sort_by",
    q: "search",
  };

  // Mapping inverse backend -> frontend
  const reverseParamMapping = {
    min_price: "minPrice",
    max_price: "maxPrice",
    min_rating: "minRating",
    duration: "duration",
    sort_by: "sortBy",
    search: "q",
  };

  const handleInputChange = (key, value) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  // Options pour les filtres
  const durationOptions = [
    { value: "", label: t("tours.filters.all") },
    { value: "1-3", label: t("tours.filters.shortTrip") },
    { value: "4-7", label: t("tours.filters.mediumTrip") },
    { value: "8-14", label: t("tours.filters.longTrip") },
    { value: "15+", label: t("tours.filters.extendedTrip") },
  ];

  const ratingOptions = [
    { value: "", label: t("tours.filters.all") },
    { value: "4.5", label: "4.5+ ⭐⭐⭐⭐⭐" },
    { value: "4.0", label: "4.0+ ⭐⭐⭐⭐" },
    { value: "3.5", label: "3.5+ ⭐⭐⭐" },
    { value: "3.0", label: "3.0+ ⭐⭐" },
  ];

  const sortOptions = [
    { value: "popularity", label: t("tours.filters.popularity") },
    { value: "price_asc", label: t("tours.filters.priceLowToHigh") },
    { value: "price_desc", label: t("tours.filters.priceHighToLow") },
    { value: "rating", label: t("tours.filters.topRated") },
    { value: "newest", label: t("tours.filters.newest") },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-r from-white to-gray-50 rounded-2xl shadow-xl border border-gray-100 mb-8 overflow-hidden"
    >
      {/* Header Section */}
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

      {/* Filters Content */}
      <div className={`p-6 ${isExpanded ? "block" : "hidden lg:block"}`}>
        {/* Main Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <FontAwesomeIcon icon={faSearch} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder={t("tours.filters.searchPlaceholder")}
              className="w-full pl-12 pr-4 py-4 text-lg border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 bg-white shadow-sm"
              value={filters.q || ""}
              onChange={(e) => handleInputChange("q", e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && onSearch()}
            />
            {filters.q && (
              <button
                onClick={() => handleInputChange("q", "")}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            )}
          </div>
        </div>

        {/* Advanced Filters Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {/* Price Range */}
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
                step="100"
              />
              <input
                type="number"
                placeholder={t("tours.filters.max")}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                value={filters.maxPrice || ""}
                onChange={(e) => handleInputChange("maxPrice", e.target.value)}
                min="0"
                step="100"
              />
            </div>
          </div>

          {/* Rating Filter */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <FontAwesomeIcon icon={faStar} className="text-yellow-500" />
              {t("tours.filters.rating")}
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all bg-white"
              value={filters.minRating || ""}
              onChange={(e) => handleInputChange("minRating", e.target.value)}
            >
              {ratingOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Duration Filter */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <FontAwesomeIcon icon={faClock} className="text-primary" />
              {t("tours.filters.duration")}
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all bg-white"
              value={filters.duration || ""}
              onChange={(e) => handleInputChange("duration", e.target.value)}
            >
              {durationOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <FontAwesomeIcon icon={faSort} className="text-primary" />
              {t("tours.filters.sortBy")}
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all bg-white"
              value={filters.sortBy || "popularity"}
              onChange={(e) => handleInputChange("sortBy", e.target.value)}
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Additional Filters (optionnel - peut être développé) */}
        <div className="mb-6">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 text-primary hover:text-primary-dark text-sm font-semibold"
          >
            {isExpanded ? t("common.showLess") : t("common.showMore")}
            <FontAwesomeIcon
              icon={isExpanded ? faChevronUp : faChevronDown}
              className="text-xs"
            />
          </button>
        </div>

        {/* Action Buttons */}
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

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClear}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gray-400 to-gray-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FontAwesomeIcon icon={faTimes} />
            {t("common.clear")}
          </motion.button>
        </div>

        {/* Active Filters Display */}
        {(filters.q ||
          filters.minPrice ||
          filters.maxPrice ||
          filters.minRating ||
          filters.duration) && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="text-sm font-semibold text-blue-800 mb-2">
              {t("tours.filters.activeFilters")}:
            </h4>
            <div className="flex flex-wrap gap-2">
              {filters.q && (
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                  {t("tours.filters.search")}: "{filters.q}"
                </span>
              )}
              {filters.minPrice && (
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                  {t("tours.filters.minPrice")}: ₹{filters.minPrice}
                </span>
              )}
              {filters.maxPrice && (
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                  {t("tours.filters.maxPrice")}: ₹{filters.maxPrice}
                </span>
              )}
              {filters.minRating && (
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                  {t("tours.filters.rating")}: {filters.minRating}+
                </span>
              )}
              {filters.duration && (
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                  {t("tours.filters.duration")}: {filters.duration}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default TourFilters;
