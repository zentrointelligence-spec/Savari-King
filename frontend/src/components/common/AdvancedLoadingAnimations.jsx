import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSpinner,
  faCircleNotch,
  faSync,
  faHeart,
  faPlane,
  faMapMarkerAlt,
  faCamera,
  faSuitcase,
  faCompass,
  faMountain,
  faUmbrella,
  faSun
} from '@fortawesome/free-solid-svg-icons';

// Composant de base pour les animations de chargement
const LoadingBase = ({ children, className = '' }) => (
  <div className={`flex items-center justify-center ${className}`}>
    {children}
  </div>
);

// Spinner rotatif simple
export const RotatingSpinner = ({ 
  size = 'md', 
  color = 'primary', 
  className = '' 
}) => {
  const sizes = {
    xs: 'w-4 h-4',
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const colors = {
    primary: 'text-primary',
    white: 'text-white',
    gray: 'text-gray-500',
    blue: 'text-blue-500',
    green: 'text-green-500'
  };

  return (
    <LoadingBase className={className}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        className={`${sizes[size]} ${colors[color]}`}
      >
        <FontAwesomeIcon icon={faSpinner} className="w-full h-full" />
      </motion.div>
    </LoadingBase>
  );
};

// Dots pulsants
export const PulsingDots = ({ 
  count = 3, 
  size = 'md', 
  color = 'primary', 
  className = '' 
}) => {
  const sizes = {
    xs: 'w-1 h-1',
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
    xl: 'w-6 h-6'
  };

  const colors = {
    primary: 'bg-primary',
    white: 'bg-white',
    gray: 'bg-gray-500',
    blue: 'bg-blue-500',
    green: 'bg-green-500'
  };

  return (
    <LoadingBase className={className}>
      <div className="flex space-x-1">
        {Array.from({ length: count }).map((_, index) => (
          <motion.div
            key={index}
            className={`${sizes[size]} ${colors[color]} rounded-full`}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.7, 1, 0.7]
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              delay: index * 0.2
            }}
          />
        ))}
      </div>
    </LoadingBase>
  );
};

// Barre de progression ondulante
export const WaveProgress = ({ 
  progress = 0, 
  color = 'primary', 
  className = '' 
}) => {
  const colors = {
    primary: 'bg-primary',
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500'
  };

  return (
    <div className={`w-full ${className}`}>
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <motion.div
          className={`h-full ${colors[color]} relative`}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="absolute inset-0 bg-white opacity-30"
            animate={{
              x: ['-100%', '100%']
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          />
        </motion.div>
      </div>
    </div>
  );
};

// Spinner avec icônes de voyage
export const TravelSpinner = ({ 
  size = 'md', 
  className = '' 
}) => {
  const icons = [
    faPlane,
    faMapMarkerAlt,
    faCamera,
    faSuitcase,
    faCompass,
    faMountain
  ];

  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  return (
    <LoadingBase className={className}>
      <div className={`relative ${sizes[size]}`}>
        {icons.map((icon, index) => {
          const angle = (index * 360) / icons.length;
          return (
            <motion.div
              key={index}
              className="absolute top-1/2 left-1/2 text-primary"
              style={{
                transformOrigin: '0 0'
              }}
              animate={{
                rotate: [angle, angle + 360]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'linear'
              }}
            >
              <div 
                className="flex items-center justify-center w-6 h-6 -ml-3 -mt-3"
                style={{
                  transform: `translate(${Math.cos((angle * Math.PI) / 180) * 20}px, ${Math.sin((angle * Math.PI) / 180) * 20}px)`
                }}
              >
                <FontAwesomeIcon icon={icon} className="text-sm" />
              </div>
            </motion.div>
          );
        })}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="text-primary"
          >
            <FontAwesomeIcon icon={faCompass} className="text-lg" />
          </motion.div>
        </div>
      </div>
    </LoadingBase>
  );
};

// Animation de chargement avec texte
export const LoadingWithText = ({ 
  text = 'Loading...', 
  subtext = '', 
  spinner = 'rotating',
  className = '' 
}) => {
  const renderSpinner = () => {
    switch (spinner) {
      case 'dots':
        return <PulsingDots />;
      case 'travel':
        return <TravelSpinner />;
      default:
        return <RotatingSpinner />;
    }
  };

  return (
    <LoadingBase className={`flex-col space-y-4 ${className}`}>
      {renderSpinner()}
      <div className="text-center">
        <motion.p
          className="text-gray-700 font-medium"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          {text}
        </motion.p>
        {subtext && (
          <p className="text-sm text-gray-500 mt-1">
            {subtext}
          </p>
        )}
      </div>
    </LoadingBase>
  );
};

// Skeleton pour cartes de tours
export const TourCardSkeleton = ({ className = '' }) => {
  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden ${className}`}>
      {/* Image skeleton */}
      <div className="relative">
        <motion.div
          className="w-full h-48 bg-gray-200"
          animate={{ opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
        <div className="absolute top-2 right-2">
          <div className="w-8 h-8 bg-gray-300 rounded-full" />
        </div>
        <div className="absolute bottom-2 left-2">
          <div className="w-16 h-6 bg-gray-300 rounded" />
        </div>
      </div>
      
      {/* Content skeleton */}
      <div className="p-4 space-y-3">
        {/* Title */}
        <motion.div
          className="h-6 bg-gray-200 rounded"
          animate={{ opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.1 }}
        />
        
        {/* Location */}
        <motion.div
          className="h-4 bg-gray-200 rounded w-3/4"
          animate={{ opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
        />
        
        {/* Rating and reviews */}
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-4 h-4 bg-gray-200 rounded" />
            ))}
          </div>
          <motion.div
            className="h-4 bg-gray-200 rounded w-16"
            animate={{ opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
          />
        </div>
        
        {/* Price and duration */}
        <div className="flex justify-between items-center">
          <motion.div
            className="h-6 bg-gray-200 rounded w-20"
            animate={{ opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
          />
          <motion.div
            className="h-4 bg-gray-200 rounded w-16"
            animate={{ opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
          />
        </div>
      </div>
    </div>
  );
};

// Skeleton pour liste de tours
export const TourListSkeleton = ({ count = 6, className = '' }) => {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <TourCardSkeleton key={index} />
      ))}
    </div>
  );
};

// Animation de chargement pleine page
export const FullPageLoader = ({ 
  message = 'Loading your adventure...', 
  subMessage = 'Please wait while we prepare everything for you',
  showProgress = false,
  progress = 0
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-white bg-opacity-95 backdrop-blur-sm z-50 flex items-center justify-center"
    >
      <div className="text-center space-y-6 max-w-md mx-auto px-6">
        <TravelSpinner size="lg" />
        
        <div className="space-y-2">
          <motion.h2
            className="text-xl font-semibold text-gray-800"
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {message}
          </motion.h2>
          
          <p className="text-gray-600 text-sm">
            {subMessage}
          </p>
        </div>
        
        {showProgress && (
          <div className="w-full">
            <WaveProgress progress={progress} />
            <p className="text-xs text-gray-500 mt-2">{progress}% Complete</p>
          </div>
        )}
        
        {/* Icônes flottantes */}
        <div className="relative h-20">
          {[faPlane, faSun, faUmbrella, faMountain].map((icon, index) => (
            <motion.div
              key={index}
              className="absolute text-primary opacity-20"
              style={{
                left: `${20 + index * 20}%`,
                top: `${Math.sin(index) * 20 + 50}%`
              }}
              animate={{
                y: [0, -10, 0],
                opacity: [0.2, 0.4, 0.2]
              }}
              transition={{
                duration: 2 + index * 0.5,
                repeat: Infinity,
                delay: index * 0.3
              }}
            >
              <FontAwesomeIcon icon={icon} className="text-lg" />
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

// Composant de transition entre pages
export const PageTransition = ({ children, className = '' }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Loader pour boutons
export const ButtonLoader = ({ 
  size = 'sm', 
  color = 'white', 
  className = '' 
}) => {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      className={className}
    >
      <RotatingSpinner size={size} color={color} />
    </motion.div>
  );
};

// Export par défaut avec tous les composants
export default {
  RotatingSpinner,
  PulsingDots,
  WaveProgress,
  TravelSpinner,
  LoadingWithText,
  TourCardSkeleton,
  TourListSkeleton,
  FullPageLoader,
  PageTransition,
  ButtonLoader
};