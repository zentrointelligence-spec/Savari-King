import React from 'react';
import { motion } from 'framer-motion';

/**
 * Composant Card réutilisable avec animations et variants
 */
const Card = ({
  children,
  className = '',
  variant = 'default',
  hover = true,
  animate = true,
  onClick,
  ...props
}) => {
  const baseClasses = 'rounded-lg overflow-hidden transition-all duration-300';
  
  const variants = {
    default: 'bg-white shadow-md border border-gray-200',
    elevated: 'bg-white shadow-lg border border-gray-100',
    outlined: 'bg-white border-2 border-gray-300',
    filled: 'bg-gray-50 border border-gray-200',
    gradient: 'bg-gradient-to-br from-blue-50 to-indigo-100 border border-blue-200'
  };

  const hoverClasses = hover ? 'hover:shadow-xl hover:-translate-y-1 cursor-pointer' : '';
  
  const cardClasses = `${baseClasses} ${variants[variant]} ${hoverClasses} ${className}`;

  const animationProps = animate ? {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3 }
  } : {};

  if (animate) {
    return (
      <motion.div
        className={cardClasses}
        onClick={onClick}
        {...animationProps}
        {...props}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div className={cardClasses} onClick={onClick} {...props}>
      {children}
    </div>
  );
};

/**
 * Composant CardHeader
 */
export const CardHeader = ({ children, className = '' }) => (
  <div className={`p-6 pb-4 ${className}`}>
    {children}
  </div>
);

/**
 * Composant CardBody
 */
export const CardBody = ({ children, className = '' }) => (
  <div className={`px-6 pb-4 ${className}`}>
    {children}
  </div>
);

/**
 * Composant CardFooter
 */
export const CardFooter = ({ children, className = '' }) => (
  <div className={`px-6 py-4 bg-gray-50 border-t border-gray-200 ${className}`}>
    {children}
  </div>
);

/**
 * Composant CardImage
 */
export const CardImage = ({ src, alt, className = '', aspectRatio = 'aspect-video' }) => (
  <div className={`${aspectRatio} overflow-hidden ${className}`}>
    <img 
      src={src} 
      alt={alt} 
      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
      loading="lazy"
    />
  </div>
);

export default Card;