import React from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCheck,
  faExclamationTriangle,
  faInfoCircle,
  faTimes,
  faSpinner,
  faStar,
  faHeart,
  faFire,
  faCrown,
  faShieldAlt,
  faLeaf,
  faGift,
  faBolt,
  faThumbsUp,
  faEye,
  faUsers,
  faClock,
  faMapMarkerAlt,
  faCalendarAlt,
  faDollarSign,
  faPercentage,
  faTag,
  faMedal,
  faTrophy,
  faRocket,
  faGem
} from '@fortawesome/free-solid-svg-icons';

// Badge Component
export const Badge = ({
  variant = 'default',
  size = 'md',
  children,
  icon,
  pulse = false,
  className = '',
  onClick
}) => {
  const variants = {
    default: 'bg-gray-100 text-gray-800',
    primary: 'bg-primary text-white',
    secondary: 'bg-gray-600 text-white',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
    premium: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white',
    featured: 'bg-gradient-to-r from-orange-400 to-red-500 text-white',
    new: 'bg-gradient-to-r from-green-400 to-blue-500 text-white',
    hot: 'bg-gradient-to-r from-red-500 to-orange-500 text-white',
    bestseller: 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white'
  };

  const sizes = {
    xs: 'px-2 py-1 text-xs',
    sm: 'px-2.5 py-1.5 text-xs',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-2 text-base',
    xl: 'px-5 py-3 text-lg'
  };

  const baseClasses = `
    inline-flex items-center font-medium rounded-full transition-all duration-200
    ${variants[variant]} ${sizes[size]} ${className}
    ${onClick ? 'cursor-pointer hover:scale-105' : ''}
    ${pulse ? 'animate-pulse' : ''}
  `;

  const content = (
    <>
      {icon && (
        <FontAwesomeIcon 
          icon={icon} 
          className={`${size === 'xs' ? 'mr-1' : 'mr-1.5'} ${size === 'xs' ? 'text-xs' : 'text-sm'}`} 
        />
      )}
      {children}
    </>
  );

  if (pulse || onClick) {
    return (
      <motion.span
        className={baseClasses}
        onClick={onClick}
        whileHover={onClick ? { scale: 1.05 } : {}}
        whileTap={onClick ? { scale: 0.95 } : {}}
      >
        {content}
      </motion.span>
    );
  }

  return <span className={baseClasses}>{content}</span>;
};

// Status Indicator Component
export const StatusIndicator = ({
  status,
  size = 'md',
  showText = true,
  className = ''
}) => {
  const statusConfig = {
    online: {
      color: 'bg-green-500',
      text: 'Online',
      icon: faCheck
    },
    offline: {
      color: 'bg-gray-400',
      text: 'Offline',
      icon: faTimes
    },
    busy: {
      color: 'bg-red-500',
      text: 'Busy',
      icon: faExclamationTriangle
    },
    away: {
      color: 'bg-yellow-500',
      text: 'Away',
      icon: faClock
    },
    loading: {
      color: 'bg-blue-500',
      text: 'Loading',
      icon: faSpinner,
      animate: true
    },
    available: {
      color: 'bg-green-500',
      text: 'Available',
      icon: faCheck
    },
    unavailable: {
      color: 'bg-red-500',
      text: 'Unavailable',
      icon: faTimes
    },
    pending: {
      color: 'bg-yellow-500',
      text: 'Pending',
      icon: faClock
    },
    confirmed: {
      color: 'bg-green-500',
      text: 'Confirmed',
      icon: faCheck
    },
    cancelled: {
      color: 'bg-red-500',
      text: 'Cancelled',
      icon: faTimes
    }
  };

  const config = statusConfig[status] || statusConfig.offline;
  
  const sizes = {
    xs: 'w-2 h-2',
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
    xl: 'w-6 h-6'
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className={`${sizes[size]} ${config.color} rounded-full relative`}>
        {config.animate && (
          <div className={`${sizes[size]} ${config.color} rounded-full absolute animate-ping`} />
        )}
      </div>
      {showText && (
        <span className="text-sm text-gray-600 capitalize">
          {config.text}
        </span>
      )}
    </div>
  );
};

// Progress Bar Component
export const ProgressBar = ({
  value,
  max = 100,
  size = 'md',
  variant = 'primary',
  showPercentage = true,
  animated = false,
  className = ''
}) => {
  const percentage = Math.min((value / max) * 100, 100);
  
  const variants = {
    primary: 'bg-primary',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
    gradient: 'bg-gradient-to-r from-primary to-purple-600'
  };

  const sizes = {
    xs: 'h-1',
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4',
    xl: 'h-6'
  };

  return (
    <div className={`w-full ${className}`}>
      <div className={`bg-gray-200 rounded-full overflow-hidden ${sizes[size]}`}>
        <motion.div
          className={`${variants[variant]} ${sizes[size]} rounded-full transition-all duration-500 ${animated ? 'animate-pulse' : ''}`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
      {showPercentage && (
        <div className="flex justify-between mt-1 text-xs text-gray-600">
          <span>{Math.round(percentage)}%</span>
          <span>{value}/{max}</span>
        </div>
      )}
    </div>
  );
};

// Rating Stars Component
export const RatingStars = ({
  rating,
  maxRating = 5,
  size = 'md',
  showValue = true,
  interactive = false,
  onRatingChange,
  className = ''
}) => {
  const sizes = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  };

  const handleStarClick = (starRating) => {
    if (interactive && onRatingChange) {
      onRatingChange(starRating);
    }
  };

  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      <div className="flex">
        {[...Array(maxRating)].map((_, index) => {
          const starRating = index + 1;
          const isFilled = starRating <= rating;
          const isHalfFilled = rating > index && rating < starRating;
          
          return (
            <button
              key={index}
              onClick={() => handleStarClick(starRating)}
              disabled={!interactive}
              className={`
                ${sizes[size]} transition-colors duration-200
                ${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'}
                ${isFilled ? 'text-yellow-400' : isHalfFilled ? 'text-yellow-300' : 'text-gray-300'}
              `}
            >
              <FontAwesomeIcon icon={faStar} />
            </button>
          );
        })}
      </div>
      {showValue && (
        <span className="text-sm text-gray-600 ml-2">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
};

// Tour Badge Component (spécialisé pour les tours)
export const TourBadge = ({ type, className = '' }) => {
  const badgeConfig = {
    bestseller: {
      variant: 'bestseller',
      icon: faTrophy,
      text: 'Bestseller'
    },
    featured: {
      variant: 'featured',
      icon: faStar,
      text: 'Featured'
    },
    new: {
      variant: 'new',
      icon: faRocket,
      text: 'New'
    },
    hot: {
      variant: 'hot',
      icon: faFire,
      text: 'Hot Deal'
    },
    premium: {
      variant: 'premium',
      icon: faCrown,
      text: 'Premium'
    },
    eco: {
      variant: 'success',
      icon: faLeaf,
      text: 'Eco-Friendly'
    },
    luxury: {
      variant: 'premium',
      icon: faGem,
      text: 'Luxury'
    },
    adventure: {
      variant: 'warning',
      icon: faBolt,
      text: 'Adventure'
    },
    family: {
      variant: 'info',
      icon: faUsers,
      text: 'Family-Friendly'
    },
    romantic: {
      variant: 'error',
      icon: faHeart,
      text: 'Romantic'
    },
    cultural: {
      variant: 'secondary',
      icon: faShieldAlt,
      text: 'Cultural'
    },
    discount: {
      variant: 'warning',
      icon: faPercentage,
      text: 'Special Offer'
    }
  };

  const config = badgeConfig[type];
  if (!config) return null;

  return (
    <Badge
      variant={config.variant}
      icon={config.icon}
      size="sm"
      className={className}
    >
      {config.text}
    </Badge>
  );
};

// Notification Dot Component
export const NotificationDot = ({
  count = 0,
  max = 99,
  size = 'md',
  variant = 'error',
  className = ''
}) => {
  if (count === 0) return null;

  const variants = {
    primary: 'bg-primary text-white',
    error: 'bg-red-500 text-white',
    warning: 'bg-yellow-500 text-white',
    success: 'bg-green-500 text-white',
    info: 'bg-blue-500 text-white'
  };

  const sizes = {
    sm: 'min-w-4 h-4 text-xs',
    md: 'min-w-5 h-5 text-xs',
    lg: 'min-w-6 h-6 text-sm'
  };

  const displayCount = count > max ? `${max}+` : count.toString();

  return (
    <span className={`
      ${variants[variant]} ${sizes[size]}
      inline-flex items-center justify-center
      rounded-full font-bold px-1
      ${className}
    `}>
      {displayCount}
    </span>
  );
};

// Loading Dots Component
export const LoadingDots = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: 'w-1 h-1',
    md: 'w-2 h-2',
    lg: 'w-3 h-3'
  };

  return (
    <div className={`flex space-x-1 ${className}`}>
      {[0, 1, 2].map((index) => (
        <motion.div
          key={index}
          className={`${sizes[size]} bg-current rounded-full`}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.7, 1, 0.7]
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: index * 0.2
          }}
        />
      ))}
    </div>
  );
};

// Pulse Indicator Component
export const PulseIndicator = ({
  size = 'md',
  color = 'primary',
  className = ''
}) => {
  const sizes = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  };

  const colors = {
    primary: 'bg-primary',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    error: 'bg-red-500',
    info: 'bg-blue-500'
  };

  return (
    <div className={`relative ${className}`}>
      <div className={`${sizes[size]} ${colors[color]} rounded-full`} />
      <div className={`${sizes[size]} ${colors[color]} rounded-full absolute top-0 left-0 animate-ping opacity-75`} />
    </div>
  );
};

// Availability Indicator Component
export const AvailabilityIndicator = ({
  available,
  total,
  showText = true,
  className = ''
}) => {
  const percentage = (available / total) * 100;
  let variant = 'success';
  let status = 'Available';

  if (percentage < 20) {
    variant = 'error';
    status = 'Limited';
  } else if (percentage < 50) {
    variant = 'warning';
    status = 'Few Left';
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <StatusIndicator status={variant === 'success' ? 'available' : 'busy'} size="sm" showText={false} />
      {showText && (
        <span className="text-sm">
          <span className={`font-medium ${
            variant === 'error' ? 'text-red-600' :
            variant === 'warning' ? 'text-yellow-600' :
            'text-green-600'
          }`}>
            {status}
          </span>
          <span className="text-gray-500 ml-1">({available}/{total})</span>
        </span>
      )}
    </div>
  );
};

export default {
  Badge,
  StatusIndicator,
  ProgressBar,
  RatingStars,
  TourBadge,
  NotificationDot,
  LoadingDots,
  PulseIndicator,
  AvailabilityIndicator
};