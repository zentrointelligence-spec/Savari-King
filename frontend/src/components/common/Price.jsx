import React from 'react';
import { useCurrency } from '../../hooks/useCurrency';

/**
 * Price component - Displays a price in the selected currency
 * @param {number} priceINR - Price in Indian Rupees (from database)
 * @param {string} className - Additional CSS classes
 * @param {boolean} showOriginal - Show original INR price (for comparison)
 * @param {string} size - Size variant: 'sm', 'md', 'lg', 'xl'
 * @param {boolean} showSymbol - Whether to show currency symbol
 */
const Price = ({
  priceINR,
  className = '',
  showOriginal = false,
  size = 'md',
  showSymbol = true,
}) => {
  const { convertAndFormat, selectedCurrency, convertPrice, formatPrice } = useCurrency();

  if (!priceINR || isNaN(priceINR)) {
    return <span className={className}>-</span>;
  }

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg font-semibold',
    xl: 'text-2xl font-bold',
  };

  const convertedPrice = convertAndFormat(priceINR);

  return (
    <div className={`inline-flex items-baseline space-x-2 ${className}`}>
      <span className={sizeClasses[size] || sizeClasses.md}>
        {convertedPrice}
      </span>
      {showOriginal && selectedCurrency !== 'INR' && (
        <span className="text-xs text-gray-500 line-through">
          ₹{parseFloat(priceINR).toLocaleString('en-US')}
        </span>
      )}
    </div>
  );
};

/**
 * PriceRange component - Displays a price range
 */
export const PriceRange = ({
  minPriceINR,
  maxPriceINR,
  className = '',
  size = 'md',
}) => {
  const { convertAndFormat } = useCurrency();

  if (!minPriceINR || !maxPriceINR) {
    return <span className={className}>-</span>;
  }

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg font-semibold',
    xl: 'text-2xl font-bold',
  };

  return (
    <span className={`${sizeClasses[size] || sizeClasses.md} ${className}`}>
      {convertAndFormat(minPriceINR)} - {convertAndFormat(maxPriceINR)}
    </span>
  );
};

/**
 * DiscountPrice component - Displays original and discounted price
 */
export const DiscountPrice = ({
  originalPriceINR,
  discountedPriceINR,
  className = '',
  size = 'md',
  showPercentage = true,
}) => {
  const { convertAndFormat } = useCurrency();

  if (!originalPriceINR || !discountedPriceINR) {
    return <span className={className}>-</span>;
  }

  const discountPercentage = Math.round(
    ((originalPriceINR - discountedPriceINR) / originalPriceINR) * 100
  );

  const sizeClasses = {
    sm: { main: 'text-sm', original: 'text-xs' },
    md: { main: 'text-base', original: 'text-sm' },
    lg: { main: 'text-lg font-semibold', original: 'text-base' },
    xl: { main: 'text-2xl font-bold', original: 'text-lg' },
  };

  const sizes = sizeClasses[size] || sizeClasses.md;

  return (
    <div className={`inline-flex items-center space-x-2 ${className}`}>
      <span className={`text-red-600 dark:text-red-400 ${sizes.main}`}>
        {convertAndFormat(discountedPriceINR)}
      </span>
      <span className={`text-gray-500 line-through ${sizes.original}`}>
        {convertAndFormat(originalPriceINR)}
      </span>
      {showPercentage && discountPercentage > 0 && (
        <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-semibold rounded">
          {discountPercentage}% OFF
        </span>
      )}
    </div>
  );
};

export default Price;
