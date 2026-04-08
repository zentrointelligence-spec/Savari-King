import { useState, useEffect, useCallback } from "react";

/**
 * Hook pour gérer le layout Masonry dynamique
 * @param {Array} items - Liste des éléments à afficher
 * @param {object} breakpoints - Points de rupture pour le responsive
 * @returns {object} - Configuration et utilitaires pour Masonry
 */
export const useMasonryLayout = (items = [], breakpoints = {}) => {
  const defaultBreakpoints = {
    default: 4,
    1100: 3,
    700: 2,
    500: 1,
    ...breakpoints,
  };

  const [columnCount, setColumnCount] = useState(defaultBreakpoints.default);
  const [isLoading, setIsLoading] = useState(false);

  // Calculer le nombre de colonnes basé sur la largeur de l'écran
  const updateColumnCount = useCallback(() => {
    const width = window.innerWidth;
    let newColumnCount = defaultBreakpoints.default;

    Object.keys(defaultBreakpoints)
      .filter((key) => key !== "default")
      .sort((a, b) => parseInt(b) - parseInt(a))
      .forEach((breakpoint) => {
        if (width <= parseInt(breakpoint)) {
          newColumnCount = defaultBreakpoints[breakpoint];
        }
      });

    setColumnCount(newColumnCount);
  }, [defaultBreakpoints]);

  useEffect(() => {
    updateColumnCount();
    window.addEventListener("resize", updateColumnCount);
    return () => window.removeEventListener("resize", updateColumnCount);
  }, [updateColumnCount]);

  // Calculer la hauteur estimée pour chaque élément (pour optimiser le layout)
  const getEstimatedHeight = useCallback((item) => {
    if (item.aspect_ratio) {
      return 300 / item.aspect_ratio; // Base width de 300px
    }
    return 250 + Math.random() * 100; // Hauteur aléatoire par défaut
  }, []);

  // Organiser les éléments en colonnes pour un layout optimal
  const organizeIntoColumns = useCallback(
    (itemsToOrganize) => {
      const columns = Array.from({ length: columnCount }, () => []);
      const columnHeights = Array(columnCount).fill(0);

      itemsToOrganize.forEach((item, index) => {
        const shortestColumnIndex = columnHeights.indexOf(
          Math.min(...columnHeights)
        );
        const estimatedHeight = getEstimatedHeight(item);

        columns[shortestColumnIndex].push({
          ...item,
          columnIndex: shortestColumnIndex,
          estimatedHeight,
          originalIndex: index,
        });

        columnHeights[shortestColumnIndex] += estimatedHeight + 24; // 24px gap
      });

      return columns;
    },
    [columnCount, getEstimatedHeight]
  );

  return {
    breakpointCols: defaultBreakpoints,
    columnCount,
    isLoading,
    setIsLoading,
    organizeIntoColumns,
    getEstimatedHeight,
  };
};

/**
 * Hook pour gérer les filtres avancés de la galerie
 * @param {Array} initialItems - Liste initiale des éléments
 * @returns {object} - État et fonctions de filtrage
 */
export const useGalleryFilters = (initialItems = []) => {
  const [items, setItems] = useState(initialItems);
  const [filteredItems, setFilteredItems] = useState(initialItems);
  const [filters, setFilters] = useState({
    category: "",
    tags: [],
    search: "",
    sort: "date",
    featured: false,
  });
  const [isFiltering, setIsFiltering] = useState(false);

  // Appliquer les filtres
  const applyFilters = useCallback(() => {
    setIsFiltering(true);

    let filtered = [...items];

    // Filtrer par catégorie
    if (filters.category) {
      filtered = filtered.filter((item) => item.category === filters.category);
    }

    // Filtrer par tags
    if (filters.tags.length > 0) {
      filtered = filtered.filter(
        (item) =>
          item.tags && filters.tags.some((tag) => item.tags.includes(tag))
      );
    }

    // Filtrer par recherche textuelle
    if (filters.search.trim()) {
      const searchTerm = filters.search.toLowerCase().trim();
      filtered = filtered.filter(
        (item) =>
          item.title?.toLowerCase().includes(searchTerm) ||
          item.location?.toLowerCase().includes(searchTerm) ||
          item.description?.toLowerCase().includes(searchTerm) ||
          (item.tags &&
            item.tags.some((tag) => tag.toLowerCase().includes(searchTerm)))
      );
    }

    // Filtrer par featured
    if (filters.featured) {
      filtered = filtered.filter((item) => item.is_featured);
    }

    // Trier les résultats
    switch (filters.sort) {
      case "popularity":
        filtered.sort((a, b) => (b.views || 0) - (a.views || 0));
        break;
      case "featured":
        filtered.sort((a, b) => {
          if (a.is_featured && !b.is_featured) return -1;
          if (!a.is_featured && b.is_featured) return 1;
          return (b.views || 0) - (a.views || 0);
        });
        break;
      case "date":
      default:
        filtered.sort(
          (a, b) =>
            new Date(b.created_at || b.date) - new Date(a.created_at || a.date)
        );
        break;
    }

    // Simuler un délai pour l'animation de transition
    setTimeout(() => {
      setFilteredItems(filtered);
      setIsFiltering(false);
    }, 300);
  }, [items, filters]);

  // Mettre à jour les filtres
  const updateFilter = useCallback((key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  // Réinitialiser les filtres
  const resetFilters = useCallback(() => {
    setFilters({
      category: "",
      tags: [],
      search: "",
      sort: "date",
      featured: false,
    });
  }, []);

  // Obtenir les tags uniques disponibles
  const getAvailableTags = useCallback(() => {
    const allTags = items.reduce((acc, item) => {
      if (item.tags) {
        acc.push(...item.tags);
      }
      return acc;
    }, []);
    return [...new Set(allTags)].sort();
  }, [items]);

  // Obtenir les catégories uniques disponibles
  const getAvailableCategories = useCallback(() => {
    const categories = items.map((item) => item.category).filter(Boolean);
    return [...new Set(categories)].sort();
  }, [items]);

  useEffect(() => {
    setItems(initialItems);
    setFilteredItems(initialItems);
  }, [initialItems]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  return {
    items,
    filteredItems,
    filters,
    isFiltering,
    updateFilter,
    resetFilters,
    getAvailableTags,
    getAvailableCategories,
    hasActiveFilters: Object.values(filters).some((value) =>
      Array.isArray(value)
        ? value.length > 0
        : Boolean(value) && value !== "date"
    ),
  };
};
