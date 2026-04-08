import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faStarHalfAlt } from '@fortawesome/free-solid-svg-icons';
import { faStar as faStarEmpty } from '@fortawesome/free-regular-svg-icons';

/**
 * Composant StarRating pour afficher et gérer les notes avec des étoiles
 */
const StarRating = ({
  rating = 0,
  maxRating = 5,
  size = 'md',
  interactive = false,
  showValue = true,
  showCount = false,
  reviewCount = 0,
  color = 'yellow',
  animate = true,
  className = '',
  onChange,
  ...props
}) => {
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedRating, setSelectedRating] = useState(rating);

  const sizes = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl'
  };

  const colors = {
    yellow: {
      filled: 'text-yellow-400',
      empty: 'text-gray-300',
      hover: 'text-yellow-500'
    },
    orange: {
      filled: 'text-orange-400',
      empty: 'text-gray-300',
      hover: 'text-orange-500'
    },
    red: {
      filled: 'text-red-400',
      empty: 'text-gray-300',
      hover: 'text-red-500'
    },
    blue: {
      filled: 'text-blue-400',
      empty: 'text-gray-300',
      hover: 'text-blue-500'
    }
  };

  const currentRating = interactive ? (hoverRating || selectedRating) : rating;
  const colorScheme = colors[color] || colors.yellow;

  const handleStarClick = (starValue) => {
    if (!interactive) return;
    
    setSelectedRating(starValue);
    onChange?.(starValue);
  };

  const handleStarHover = (starValue) => {
    if (!interactive) return;
    setHoverRating(starValue);
  };

  const handleMouseLeave = () => {
    if (!interactive) return;
    setHoverRating(0);
  };

  const renderStar = (index) => {
    const starValue = index + 1;
    const isFilled = currentRating >= starValue;
    const isHalfFilled = currentRating >= starValue - 0.5 && currentRating < starValue;
    
    let icon = faStarEmpty;
    let colorClass = colorScheme.empty;
    
    if (isFilled) {
      icon = faStar;
      colorClass = interactive && hoverRating >= starValue ? colorScheme.hover : colorScheme.filled;
    } else if (isHalfFilled && !interactive) {
      icon = faStarHalfAlt;
      colorClass = colorScheme.filled;
    }

    const starClasses = `
      ${sizes[size]} 
      ${colorClass} 
      ${interactive ? 'cursor-pointer hover:scale-110 transition-all duration-150' : ''}
    `;

    const animationProps = animate ? {
      initial: { scale: 0, rotate: -180 },
      animate: { scale: 1, rotate: 0 },
      transition: { 
        delay: index * 0.1,
        type: 'spring',
        stiffness: 200,
        damping: 10
      }
    } : {};

    const StarComponent = animate ? motion.span : 'span';

    return (
      <StarComponent
        key={index}
        className={starClasses}
        onClick={() => handleStarClick(starValue)}
        onMouseEnter={() => handleStarHover(starValue)}
        {...(animate ? animationProps : {})}
      >
        <FontAwesomeIcon icon={icon} />
      </StarComponent>
    );
  };

  const formatRating = (value) => {
    return Number(value).toFixed(1);
  };

  return (
    <div 
      className={`flex items-center space-x-1 ${className}`}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {/* Étoiles */}
      <div className="flex items-center space-x-0.5">
        {Array.from({ length: maxRating }, (_, index) => renderStar(index))}
      </div>

      {/* Valeur numérique */}
      {showValue && (
        <span className="text-sm font-medium text-gray-700 ml-2">
          {formatRating(currentRating)}
        </span>
      )}

      {/* Nombre d'avis */}
      {showCount && reviewCount > 0 && (
        <span className="text-sm text-gray-500 ml-1">
          ({reviewCount} {reviewCount === 1 ? 'avis' : 'avis'})
        </span>
      )}
    </div>
  );
};

/**
 * Composant CompactStarRating pour un affichage plus compact
 */
export const CompactStarRating = ({ rating, reviewCount, className = '' }) => (
  <div className={`flex items-center space-x-1 ${className}`}>
    <div className="flex items-center">
      <FontAwesomeIcon icon={faStar} className="text-yellow-400 text-sm" />
      <span className="text-sm font-medium text-gray-700 ml-1">
        {Number(rating).toFixed(1)}
      </span>
    </div>
    {reviewCount > 0 && (
      <span className="text-xs text-gray-500">
        ({reviewCount})
      </span>
    )}
  </div>
);

/**
 * Composant RatingDistribution pour afficher la répartition des notes
 */
export const RatingDistribution = ({ distribution, totalReviews, className = '' }) => {
  if (!distribution || !totalReviews) return null;

  return (
    <div className={`space-y-2 ${className}`}>
      {[5, 4, 3, 2, 1].map((stars) => {
        const count = distribution[stars] || 0;
        const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
        
        return (
          <div key={stars} className="flex items-center space-x-2 text-sm">
            <span className="w-8 text-right">{stars}</span>
            <FontAwesomeIcon icon={faStar} className="text-yellow-400 text-xs" />
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <motion.div
                className="bg-yellow-400 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 0.5, delay: (5 - stars) * 0.1 }}
              />
            </div>
            <span className="w-12 text-right text-gray-600">
              {count}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default StarRating;