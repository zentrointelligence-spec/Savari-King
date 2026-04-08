import React from 'react';

/**
 * Loader Component
 *
 * Affiche un spinner de chargement animé
 *
 * @param {string} size - Taille du loader: 'sm', 'md', 'lg', 'xl' (default: 'md')
 * @param {string} color - Couleur du loader (default: 'primary')
 * @param {string} text - Texte optionnel à afficher sous le loader
 */
const Loader = ({ size = 'md', color = 'primary', text = '' }) => {
  // Tailles du spinner
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
    xl: 'h-24 w-24'
  };

  // Couleurs
  const colorClasses = {
    primary: 'border-primary',
    white: 'border-white',
    blue: 'border-blue-500',
    gray: 'border-gray-500'
  };

  const spinnerSize = sizeClasses[size] || sizeClasses.md;
  const spinnerColor = colorClasses[color] || colorClasses.primary;

  return (
    <div className="flex flex-col items-center justify-center">
      <div
        className={`${spinnerSize} ${spinnerColor} border-4 border-t-transparent rounded-full animate-spin`}
      ></div>
      {text && (
        <p className="mt-4 text-gray-600 font-medium">{text}</p>
      )}
    </div>
  );
};

export default Loader;
