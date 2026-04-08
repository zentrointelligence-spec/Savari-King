// Export de tous les hooks personnalisés pour la galerie premium

// Hooks d'animation et d'intersection
export {
  useIntersectionAnimation,
  useStaggeredAnimation,
} from "./useIntersectionAnimation";

// Hooks de parallaxe et effets 3D
export { useMouseParallax } from "./useMouseParallax";

// Hooks de layout et filtrage
export { useMasonryLayout, useGalleryFilters } from "./useMasonryLayout";

// Hooks de micro-interactions
export {
  useCustomCursor,
  useAnimatedBadges,
  useAdvancedHover,
  useImagePreloader,
} from "./useMicroInteractions";

// Hooks de micro-interactions pour les tours
export {
  useMicroInteractions as useTourMicroInteractions,
  useScrollAnimation,
  useIntersectionAnimation as useIntersectionAnimationNew,
  useTouchGestures,
  useDeviceDetection,
  usePerformanceMonitor,
} from "./useMicroInteractions";
