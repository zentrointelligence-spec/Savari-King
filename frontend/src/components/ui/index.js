// Export de tous les composants UI réutilisables

// Composants de base
export { default as Card, CardHeader, CardBody, CardFooter, CardImage } from './Card';
export { default as Button, ButtonGroup } from './Button';
export { default as Badge, RankingBadge, StatusBadge, PriceBadge } from './Badge';
export { default as StarRating, CompactStarRating, RatingDistribution } from './StarRating';

// Types et constantes pour TypeScript (si nécessaire)
export const UI_VARIANTS = {
  CARD: {
    DEFAULT: 'default',
    ELEVATED: 'elevated',
    OUTLINED: 'outlined',
    FILLED: 'filled',
    GRADIENT: 'gradient'
  },
  BUTTON: {
    PRIMARY: 'primary',
    SECONDARY: 'secondary',
    SUCCESS: 'success',
    DANGER: 'danger',
    WARNING: 'warning',
    OUTLINE: 'outline',
    GHOST: 'ghost',
    LINK: 'link'
  },
  BADGE: {
    DEFAULT: 'default',
    PRIMARY: 'primary',
    SECONDARY: 'secondary',
    SUCCESS: 'success',
    DANGER: 'danger',
    WARNING: 'warning',
    INFO: 'info',
    BESTSELLER: 'bestseller',
    NEW: 'new',
    FEATURED: 'featured',
    RANKING: 'ranking'
  },
  SIZE: {
    XS: 'xs',
    SM: 'sm',
    MD: 'md',
    LG: 'lg',
    XL: 'xl'
  }
};

// Utilitaires pour les composants UI
export const UI_UTILS = {
  // Fonction pour combiner les classes CSS
  combineClasses: (...classes) => {
    return classes.filter(Boolean).join(' ');
  },
  
  // Fonction pour générer des couleurs aléatoires pour les avatars
  generateAvatarColor: (name) => {
    const colors = [
      'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500',
      'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-gray-500'
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  },
  
  // Fonction pour formater les prix
  formatPrice: (price, currency = '€') => {
    return `${price.toLocaleString()}${currency}`;
  },
  
  // Fonction pour formater les notes
  formatRating: (rating, decimals = 1) => {
    return Number(rating).toFixed(decimals);
  }
};