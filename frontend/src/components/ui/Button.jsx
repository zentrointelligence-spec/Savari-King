import React from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

/**
 * Composant Button réutilisable avec variants, tailles et états
 */
const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  animate = true,
  className = '',
  onClick,
  type = 'button',
  as: Component = 'button',
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 shadow-md hover:shadow-lg',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500 shadow-md hover:shadow-lg',
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 shadow-md hover:shadow-lg',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-md hover:shadow-lg',
    warning: 'bg-yellow-600 text-white hover:bg-yellow-700 focus:ring-yellow-500 shadow-md hover:shadow-lg',
    outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white focus:ring-blue-500',
    ghost: 'text-blue-600 hover:bg-blue-50 focus:ring-blue-500',
    link: 'text-blue-600 hover:text-blue-800 underline-offset-4 hover:underline'
  };

  const sizes = {
    xs: 'px-2.5 py-1.5 text-xs',
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
    xl: 'px-8 py-4 text-lg'
  };

  const disabledClasses = disabled || loading ? 'opacity-50 cursor-not-allowed' : '';
  
  const buttonClasses = `${baseClasses} ${variants[variant]} ${sizes[size]} ${disabledClasses} ${className}`;

  const handleClick = (e) => {
    if (disabled || loading) {
      e.preventDefault();
      return;
    }
    onClick?.(e);
  };

  const renderIcon = (position) => {
    if (loading && position === 'left') {
      return (
        <FontAwesomeIcon 
          icon={faSpinner} 
          className="animate-spin mr-2" 
          size="sm"
        />
      );
    }
    
    if (icon && iconPosition === position) {
      const iconClasses = position === 'left' ? 'mr-2' : 'ml-2';
      return (
        <FontAwesomeIcon 
          icon={icon} 
          className={iconClasses} 
          size="sm"
        />
      );
    }
    
    return null;
  };

  const buttonContent = (
    <>
      {renderIcon('left')}
      {children}
      {renderIcon('right')}
    </>
  );

  const animationProps = animate ? {
    whileHover: disabled || loading ? {} : { scale: 1.02 },
    whileTap: disabled || loading ? {} : { scale: 0.98 },
    transition: { duration: 0.1 }
  } : {};

  if (animate) {
    if (Component === 'button') {
      return (
        <motion.button
          className={buttonClasses}
          onClick={handleClick}
          disabled={disabled || loading}
          type={type}
          {...animationProps}
          {...props}
        >
          {buttonContent}
        </motion.button>
      );
    }

    // Pour les composants custom (Link, a, etc.), utiliser motion()
    const MotionComponent = motion(Component);
    return (
      <MotionComponent
        className={buttonClasses}
        onClick={handleClick}
        {...animationProps}
        {...props}
      >
        {buttonContent}
      </MotionComponent>
    );
  }

  return Component === 'button' ? (
    <button
      className={buttonClasses}
      onClick={handleClick}
      disabled={disabled || loading}
      type={type}
      {...props}
    >
      {buttonContent}
    </button>
  ) : (
    <Component
      className={buttonClasses}
      onClick={handleClick}
      {...props}
    >
      {buttonContent}
    </Component>
  );
};

/**
 * Composant ButtonGroup pour grouper plusieurs boutons
 */
export const ButtonGroup = ({ children, className = '' }) => (
  <div className={`inline-flex rounded-lg shadow-sm ${className}`} role="group">
    {React.Children.map(children, (child, index) => {
      if (React.isValidElement(child)) {
        const isFirst = index === 0;
        const isLast = index === React.Children.count(children) - 1;
        
        let roundedClasses = '';
        if (isFirst && isLast) {
          roundedClasses = 'rounded-lg';
        } else if (isFirst) {
          roundedClasses = 'rounded-l-lg rounded-r-none';
        } else if (isLast) {
          roundedClasses = 'rounded-r-lg rounded-l-none';
        } else {
          roundedClasses = 'rounded-none';
        }
        
        return React.cloneElement(child, {
          className: `${child.props.className || ''} ${roundedClasses} ${!isFirst ? '-ml-px' : ''}`.trim()
        });
      }
      return child;
    })}
  </div>
);

export default Button;