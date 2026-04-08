import React, { useState, useEffect, useCallback } from "react";

const FilterControls = ({ onFilterChange, initialFilters = {} }) => {
  // États avec valeurs par défaut
  const [filters, setFilters] = useState({
    destination: initialFilters.destination || "",
    duration: initialFilters.duration || 14,
    themes: initialFilters.themes || [],
  });

  // Données dynamiques (à remplacer par appel API)
  const destinations = ["Kanyakumari", "Kerala", "Cochin", "Trivandrum"];
  const themes = ["Adventure", "Cultural", "Gastronomy", "Ecotourism"];

  // Optimisation des rerenders avec useCallback
  const handleFilterChange = useCallback(() => {
    onFilterChange(filters);
  }, [filters, onFilterChange]);

  // Déclenchement intelligent après 300ms sans changement
  useEffect(() => {
    const debounceTimer = setTimeout(handleFilterChange, 30000000);
    return () => clearTimeout(debounceTimer);
  }, [filters, handleFilterChange]);

  // Gestionnaires d'événements
  const handleDestinationChange = (e) => {
    setFilters((prev) => ({ ...prev, destination: e.target.value }));
  };

  const handleDurationChange = (e) => {
    setFilters((prev) => ({ ...prev, duration: parseInt(e.target.value) }));
  };

  const handleThemeToggle = (theme) => {
    setFilters((prev) => ({
      ...prev,
      themes: prev.themes.includes(theme)
        ? prev.themes.filter((t) => t !== theme)
        : [...prev.themes, theme],
    }));
  };

  const resetFilters = () => {
    setFilters({ destination: "", duration: 14, themes: [] });
  };

  return (
    <div className="app-surface p-6 rounded-xl shadow-primary mb-8 sticky top-24 z-10 violet-backdrop">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Filter Tours</h2>
        <button
          onClick={resetFilters}
          className="text-sm text-primary hover:text-primary-dark transition-colors"
          aria-label="Reset all filters"
        >
          Reset Filters
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Destination Select */}
        <div>
          <label
            htmlFor="destination"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Destination
          </label>
          <div className="relative">
            <select
              id="destination"
              value={filters.destination}
              onChange={handleDestinationChange}
              className="w-full pl-3 pr-10 py-2.5 text-base border border-primary/30 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary appearance-none cursor-pointer bg-white/90 dark:bg-dark-light/90"
              aria-label="Filter by destination"
            >
              <option value="">All Destinations</option>
              {destinations.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <svg
                className="h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Duration Slider */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label
              htmlFor="duration"
              className="block text-sm font-medium text-gray-700"
            >
              Duration:{" "}
              <span className="font-semibold">{filters.duration} days</span>
            </label>
            <span className="text-xs text-gray-500">Max 14 days</span>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-500">1</span>
            <input
              type="range"
              id="duration"
              min="1"
              max="14"
              value={filters.duration}
              onChange={handleDurationChange}
              className="w-full h-1.5 bg-primary/20 rounded-lg appearance-none cursor-pointer accent-primary"
              aria-valuetext={`${filters.duration} days`}
            />
            <span className="text-sm text-gray-500">14</span>
          </div>
        </div>

        {/* Theme Chips */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Themes
          </label>
          <div
            className="flex flex-wrap gap-2"
            role="group"
            aria-label="Tour themes"
          >
            {themes.map((theme) => (
              <button
                key={theme}
                onClick={() => handleThemeToggle(theme)}
                className={`px-3 py-1.5 text-sm rounded-full transition-all ${
                  filters.themes.includes(theme)
                    ? "bg-primary text-white shadow-sm"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
                aria-pressed={filters.themes.includes(theme)}
              >
                {theme}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Active Filters Indicator */}
      {filters.destination ||
      filters.duration < 14 ||
      filters.themes.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {filters.destination && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
              {filters.destination}
              <button
                onClick={() =>
                  setFilters((prev) => ({ ...prev, destination: "" }))
                }
                className="ml-1.5 rounded-full hover:bg-primary/20"
                aria-label={`Remove ${filters.destination} filter`}
              >
                &times;
              </button>
            </span>
          )}

          {filters.duration < 14 && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              ≤ {filters.duration} days
              <button
                onClick={() =>
                  setFilters((prev) => ({ ...prev, duration: 14 }))
                }
                className="ml-1.5 rounded-full hover:bg-blue-200"
                aria-label="Remove duration filter"
              >
                &times;
              </button>
            </span>
          )}

          {filters.themes.map((theme) => (
            <span
              key={theme}
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
            >
              {theme}
              <button
                onClick={() => handleThemeToggle(theme)}
                className="ml-1.5 rounded-full hover:bg-green-200"
                aria-label={`Remove ${theme} theme filter`}
              >
                &times;
              </button>
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
};

export default React.memo(FilterControls);
