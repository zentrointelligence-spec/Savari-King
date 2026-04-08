import React from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

/**
 * Composant Badge réutilisable pour les statuts, rankings, etc.
 */
const Badge = ({
  children,
  variant = 'default',
  size = 'md',
  icon,
  animate = true,
  className = '',
  ...props
}) => {
  const baseClasses = 'inline-flex items-center font-medium rounded-full';
  
  const variants = {
    default: 'bg-gray-100 text-gray-800',
    primary: 'bg-blue-100 text-blue-800',
    secondary: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    danger: 'bg-red-100 text-red-800',
    warning: 'bg-yellow-100 text-yellow-800',
    info: 'bg-blue-100 text-blue-800',
    bestseller: 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg',
    new: 'bg-gradient-to-r from-green-400 to-blue-500 text-white shadow-lg',
    featured: 'bg-gradient-to-r from-purple-400 to-pink-500 text-white shadow-lg',
    ranking: 'bg-gradient-to-r from-amber-400 to-yellow-500 text-white shadow-lg font-bold'
  };

  const sizes = {
    xs: 'px-2 py-0.5 text-xs',
    sm: 'px-2.5 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
    xl: 'px-5 py-2 text-lg'
  };
  
  const badgeClasses = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`;

  const animationProps = animate ? {
    initial: { scale: 0.8, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    transition: { duration: 0.2 }
  } : {};

  const content = (
    <>
      {icon && (
        <FontAwesomeIcon 
          icon={icon} 
          className="mr-1" 
          size="xs"
        />
      )}
      {children}
    </>
  );

  if (animate) {
    return (
      <motion.span
        className={badgeClasses}
        {...animationProps}
        {...props}
      >
        {content}
      </motion.span>
    );
  }

  return (
    <span className={badgeClasses} {...props}>
      {content}
    </span>
  );
};

/**
 * Composant RankingBadge spécialisé pour les classements
 */
export const RankingBadge = ({ rank, className = '' }) => {
  const getRankingStyle = (rank) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white shadow-lg';
      case 2:
        return 'bg-gradient-to-r from-gray-300 to-gray-500 text-white shadow-lg';
      case 3:
        return 'bg-gradient-to-r from-amber-600 to-amber-800 text-white shadow-lg';
      default:
        return 'bg-gradient-to-r from-blue-400 to-blue-600 text-white shadow-lg';
    }
  };

  const getRankingIcon = (rank) => {
    switch (rank) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return `#${rank}`;
    }
  };

  return (
    <Badge
      variant="ranking"
      size="md"
      className={`${getRankingStyle(rank)} ${className}`}
      animate={true}
    >
      {getRankingIcon(rank)}
    </Badge>
  );
};

/**
 * Composant StatusBadge pour les statuts
 */
export const StatusBadge = ({ status, className = '' }) => {
  const statusConfig = {
    active: { variant: 'success', text: 'Actif' },
    inactive: { variant: 'danger', text: 'Inactif' },
    pending: { variant: 'warning', text: 'En attente' },
    draft: { variant: 'secondary', text: 'Brouillon' },
    published: { variant: 'success', text: 'Publié' },
    featured: { variant: 'featured', text: 'À la une' },
    new: { variant: 'new', text: 'Nouveau' },
    bestseller: { variant: 'bestseller', text: 'Bestseller' }
  };

  const config = statusConfig[status] || { variant: 'default', text: status };

  return (
    <Badge
      variant={config.variant}
      className={className}
      animate={true}
    >
      {config.text}
    </Badge>
  );
};

/**
 * Composant PriceBadge pour les prix et réductions
 */
export const PriceBadge = ({ 
  originalPrice, 
  discountedPrice, 
  currency = '€', 
  className = '' 
}) => {
  const hasDiscount = originalPrice && discountedPrice && originalPrice > discountedPrice;
  const discountPercentage = hasDiscount 
    ? Math.round(((originalPrice - discountedPrice) / originalPrice) * 100)
    : 0;

  if (hasDiscount) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <Badge variant="danger" size="sm">
          -{discountPercentage}%
        </Badge>
        <div className="flex items-center space-x-1">
          <span className="text-lg font-bold text-green-600">
            {discountedPrice}{currency}
          </span>
          <span className="text-sm text-gray-500 line-through">
            {originalPrice}{currency}
          </span>
        </div>
      </div>
    );
  }

  return (
    <span className={`text-lg font-bold text-gray-900 ${className}`}>
      {discountedPrice || originalPrice}{currency}
    </span>
  );
};

export default Badge;