import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaSearch, FaTimes, FaFilter, FaStar, FaTag } from "react-icons/fa";

const FilterInterface = ({
  filters,
  onFilterChange,
  onResetFilters,
  availableCategories = [],
  availableTags = [],
  hasActiveFilters = false,
  isFiltering = false,
}) => {
  const handleSearchChange = (e) => {
    onFilterChange("search", e.target.value);
  };

  const handleCategoryChange = (category) => {
    onFilterChange("category", filters.category === category ? "" : category);
  };

  const handleTagToggle = (tag) => {
    const currentTags = filters.tags || [];
    const newTags = currentTags.includes(tag)
      ? currentTags.filter((t) => t !== tag)
      : [...currentTags, tag];
    onFilterChange("tags", newTags);
  };

  const handleSortChange = (sort) => {
    onFilterChange("sort", sort);
  };

  const handleFeaturedToggle = () => {
    onFilterChange("featured", !filters.featured);
  };

  const sortOptions = [
    { value: "date", label: "Plus récentes", icon: "📅" },
    { value: "popularity", label: "Populaires", icon: "🔥" },
    { value: "featured", label: "Vedettes", icon: "⭐" },
  ];

  const categoryIcons = {
    plage: "🏖️",
    montagne: "🏔️",
    ville: "🏙️",
    nature: "🌿",
    culture: "🏛️",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-8 space-y-6"
    >
      {/* Barre de recherche */}
      <div className="relative max-w-md mx-auto">
        <div className="relative">
          <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 z-10" />
          <input
            type="text"
            placeholder="Rechercher par titre, lieu ou tag..."
            value={filters.search || ""}
            onChange={handleSearchChange}
            className="w-full pl-12 pr-12 py-4 violet-backdrop border border-primary/30 rounded-2xl shadow-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-300"
          />
          {filters.search && (
            <button
              onClick={() => onFilterChange("search", "")}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FaTimes />
            </button>
          )}
        </div>
      </div>

      {/* Filtres principaux */}
      <div className="flex flex-wrap justify-center gap-4">
        {/* Bouton Featured */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleFeaturedToggle}
          className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${
            filters.featured
              ? "bg-gradient-to-r from-primary to-secondary text-white shadow-lg"
              : "bg-white/80 backdrop-blur-sm text-gray-700 border border-gray-200 hover:bg-gray-50"
          }`}
        >
          <i className="fas fa-star"></i>
          <span>Vedettes</span>
        </motion.button>

        {/* Bouton Reset */}
        <AnimatePresence>
          {hasActiveFilters && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onResetFilters}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all duration-300 shadow-lg"
            >
              <i className="fas fa-times"></i>
              <span>Réinitialiser</span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Tri horizontal */}
      <div className="flex justify-center">
        <div className="flex bg-white/80 backdrop-blur-sm rounded-2xl p-2 shadow-lg border border-gray-200">
          {sortOptions.map((option) => (
            <motion.button
              key={option.value}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleSortChange(option.value)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 ${
                filters.sort === option.value
                  ? "bg-gradient-to-r from-primary to-secondary text-white shadow-md"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <span>{option.icon}</span>
              <span className="hidden sm:inline">{option.label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Catégories */}
      {availableCategories.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-center gap-2 text-gray-600">
            <i className="fas fa-filter text-primary"></i>
            <span className="font-medium">Catégories</span>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {availableCategories.map((category) => (
              <motion.button
                key={category}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleCategoryChange(category)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${
                  filters.category === category
                    ? "bg-gradient-to-r from-primary to-secondary text-white shadow-lg"
                    : "bg-white/80 backdrop-blur-sm text-gray-700 border border-gray-200 hover:bg-gray-50"
                }`}
              >
                <span>{categoryIcons[category] || "📷"}</span>
                <span className="capitalize">{category}</span>
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Tags populaires */}
      {availableTags.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-center gap-2 text-gray-600">
            <i className="fas fa-tags text-primary"></i>
            <span className="font-medium">Tags populaires</span>
          </div>
          <div className="flex flex-wrap justify-center gap-2 max-w-4xl mx-auto">
            {availableTags.slice(0, 12).map((tag) => (
              <motion.button
                key={tag}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleTagToggle(tag)}
                className={`px-3 py-1 text-sm rounded-full transition-all duration-300 ${
                  filters.tags?.includes(tag)
                    ? "bg-gradient-to-r from-primary to-secondary text-white shadow-md"
                    : "bg-white/60 backdrop-blur-sm text-gray-600 border border-gray-200 hover:bg-gray-50"
                }`}
              >
                #{tag}
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Indicateur de filtrage */}
      <AnimatePresence>
        {isFiltering && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex justify-center"
          >
            <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent"></div>
              <span>Filtering...</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default FilterInterface;
