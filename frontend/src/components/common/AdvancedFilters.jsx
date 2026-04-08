import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faFilter,
  faChevronDown,
  faChevronUp,
  faTimes,
  faCalendarAlt,
  faUsers,
  faDollarSign,
  faStar,
  faMapMarkerAlt,
  faClock,
  faTag,
  faReset,
  faCheck,
} from '@fortawesome/free-solid-svg-icons';

// Composant Range Slider personnalisé
const RangeSlider = ({ min, max, value, onChange, step = 1, prefix = '', suffix = '' }) => {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (index, newValue) => {
    const updatedValue = [...localValue];
    updatedValue[index] = parseInt(newValue);
    
    // Assurer que min <= max
    if (index === 0 && updatedValue[0] > updatedValue[1]) {
      updatedValue[1] = updatedValue[0];
    } else if (index === 1 && updatedValue[1] < updatedValue[0]) {
      updatedValue[0] = updatedValue[1];
    }
    
    setLocalValue(updatedValue);
    onChange(updatedValue);
  };

  const percentage = (val) => ((val - min) / (max - min)) * 100;

  return (
    <div className="space-y-4">
      <div className="relative">
        {/* Track */}
        <div className="h-2 bg-gray-200 rounded-full relative">
          {/* Active range */}
          <div 
            className="absolute h-2 bg-primary rounded-full"
            style={{
              left: `${percentage(localValue[0])}%`,
              width: `${percentage(localValue[1]) - percentage(localValue[0])}%`
            }}
          />
          
          {/* Min thumb */}
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={localValue[0]}
            onChange={(e) => handleChange(0, e.target.value)}
            className="absolute w-full h-2 bg-transparent appearance-none cursor-pointer slider-thumb"
          />
          
          {/* Max thumb */}
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={localValue[1]}
            onChange={(e) => handleChange(1, e.target.value)}
            className="absolute w-full h-2 bg-transparent appearance-none cursor-pointer slider-thumb"
          />
        </div>
      </div>
      
      {/* Values display */}
      <div className="flex justify-between text-sm text-gray-600">
        <span>{prefix}{localValue[0]}{suffix}</span>
        <span>{prefix}{localValue[1]}{suffix}</span>
      </div>
    </div>
  );
};

// Composant Checkbox personnalisé
const CustomCheckbox = ({ checked, onChange, label, count }) => (
  <label className="flex items-center justify-between cursor-pointer group hover:bg-gray-50 p-2 rounded-lg transition-colors">
    <div className="flex items-center space-x-3">
      <div className="relative">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="sr-only"
        />
        <div className={`
          w-5 h-5 rounded border-2 transition-all duration-200
          ${checked 
            ? 'bg-primary border-primary' 
            : 'border-gray-300 group-hover:border-primary'
          }
        `}>
          {checked && (
            <FontAwesomeIcon 
              icon={faCheck} 
              className="text-white text-xs absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" 
            />
          )}
        </div>
      </div>
      <span className="text-gray-700">{label}</span>
    </div>
    {count !== undefined && (
      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
        {count}
      </span>
    )}
  </label>
);

// Composant Radio personnalisé
const CustomRadio = ({ checked, onChange, label, value }) => (
  <label className="flex items-center cursor-pointer group hover:bg-gray-50 p-2 rounded-lg transition-colors">
    <div className="relative mr-3">
      <input
        type="radio"
        checked={checked}
        onChange={() => onChange(value)}
        className="sr-only"
      />
      <div className={`
        w-5 h-5 rounded-full border-2 transition-all duration-200
        ${checked 
          ? 'border-primary' 
          : 'border-gray-300 group-hover:border-primary'
        }
      `}>
        {checked && (
          <div className="w-3 h-3 bg-primary rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
        )}
      </div>
    </div>
    <span className="text-gray-700">{label}</span>
  </label>
);

// Composant Section de filtre
const FilterSection = ({ title, icon, children, isOpen, onToggle, count }) => (
  <div className="border-b border-gray-200 last:border-b-0">
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
    >
      <div className="flex items-center space-x-3">
        <FontAwesomeIcon icon={icon} className="text-gray-500" />
        <span className="font-medium text-gray-900">{title}</span>
        {count > 0 && (
          <span className="bg-primary text-white text-xs px-2 py-1 rounded-full">
            {count}
          </span>
        )}
      </div>
      <FontAwesomeIcon 
        icon={isOpen ? faChevronUp : faChevronDown} 
        className="text-gray-400 transition-transform duration-200"
      />
    </button>
    
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="overflow-hidden"
        >
          <div className="px-4 pb-4">
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

// Composant principal AdvancedFilters
const AdvancedFilters = ({
  filters,
  onFiltersChange,
  onApply,
  onReset,
  isOpen,
  onToggle,
  className = '',
  showApplyButton = true,
  tourData = null // Données pour générer les options dynamiquement
}) => {
  const [localFilters, setLocalFilters] = useState(filters);
  const [openSections, setOpenSections] = useState({
    price: true,
    duration: false,
    category: false,
    rating: false,
    location: false,
    dates: false,
    group: false,
    features: false
  });

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const updateFilter = (key, value) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    if (!showApplyButton) {
      onFiltersChange(newFilters);
    }
  };

  const toggleSection = (section) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleApply = () => {
    onFiltersChange(localFilters);
    if (onApply) onApply(localFilters);
  };

  const handleReset = () => {
    const resetFilters = {
      priceRange: [0, 5000],
      duration: '',
      category: [],
      rating: 0,
      location: [],
      startDate: '',
      endDate: '',
      groupSize: [1, 20],
      features: []
    };
    setLocalFilters(resetFilters);
    onFiltersChange(resetFilters);
    if (onReset) onReset();
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (localFilters.priceRange[0] > 0 || localFilters.priceRange[1] < 5000) count++;
    if (localFilters.duration) count++;
    if (localFilters.category?.length > 0) count++;
    if (localFilters.rating > 0) count++;
    if (localFilters.location?.length > 0) count++;
    if (localFilters.startDate || localFilters.endDate) count++;
    if (localFilters.groupSize[0] > 1 || localFilters.groupSize[1] < 20) count++;
    if (localFilters.features?.length > 0) count++;
    return count;
  };

  const categories = [
    { id: 'adventure', label: 'Adventure Tours', count: 12 },
    { id: 'cultural', label: 'Cultural Tours', count: 8 },
    { id: 'beach', label: 'Beach Tours', count: 15 },
    { id: 'wildlife', label: 'Wildlife Tours', count: 6 },
    { id: 'spiritual', label: 'Spiritual Tours', count: 4 },
    { id: 'luxury', label: 'Luxury Tours', count: 3 }
  ];

  const locations = [
    { id: 'kerala', label: 'Kerala', count: 18 },
    { id: 'goa', label: 'Goa', count: 12 },
    { id: 'rajasthan', label: 'Rajasthan', count: 15 },
    { id: 'himachal', label: 'Himachal Pradesh', count: 9 },
    { id: 'karnataka', label: 'Karnataka', count: 7 },
    { id: 'tamil-nadu', label: 'Tamil Nadu', count: 11 }
  ];

  const features = [
    { id: 'meals', label: 'Meals Included', count: 25 },
    { id: 'transport', label: 'Transportation', count: 30 },
    { id: 'guide', label: 'Tour Guide', count: 22 },
    { id: 'accommodation', label: 'Accommodation', count: 18 },
    { id: 'activities', label: 'Activities Included', count: 20 },
    { id: 'photography', label: 'Photography Service', count: 8 }
  ];

  return (
    <div className={className}>
      {/* Header avec toggle */}
      <div className="flex items-center justify-between p-4 bg-gray-50 border-b">
        <div className="flex items-center space-x-3">
          <FontAwesomeIcon icon={faFilter} className="text-gray-600" />
          <h3 className="font-semibold text-gray-900">Filters</h3>
          {getActiveFiltersCount() > 0 && (
            <span className="bg-primary text-white text-xs px-2 py-1 rounded-full">
              {getActiveFiltersCount()}
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={handleReset}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            <FontAwesomeIcon icon={faReset} className="mr-1" />
            Reset
          </button>
          
          {onToggle && (
            <button
              onClick={onToggle}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          )}
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {/* Price Range */}
        <FilterSection
          title="Price Range"
          icon={faDollarSign}
          isOpen={openSections.price}
          onToggle={() => toggleSection('price')}
          count={localFilters.priceRange[0] > 0 || localFilters.priceRange[1] < 5000 ? 1 : 0}
        >
          <RangeSlider
            min={0}
            max={5000}
            value={localFilters.priceRange}
            onChange={(value) => updateFilter('priceRange', value)}
            step={50}
            prefix="$"
          />
        </FilterSection>

        {/* Duration */}
        <FilterSection
          title="Duration"
          icon={faClock}
          isOpen={openSections.duration}
          onToggle={() => toggleSection('duration')}
          count={localFilters.duration ? 1 : 0}
        >
          <div className="space-y-2">
            {[
              { value: '', label: 'Any Duration' },
              { value: '1-3', label: '1-3 Days' },
              { value: '4-7', label: '4-7 Days' },
              { value: '8-14', label: '1-2 Weeks' },
              { value: '15+', label: '2+ Weeks' }
            ].map(option => (
              <CustomRadio
                key={option.value}
                checked={localFilters.duration === option.value}
                onChange={(value) => updateFilter('duration', value)}
                label={option.label}
                value={option.value}
              />
            ))}
          </div>
        </FilterSection>

        {/* Categories */}
        <FilterSection
          title="Categories"
          icon={faTag}
          isOpen={openSections.category}
          onToggle={() => toggleSection('category')}
          count={localFilters.category?.length || 0}
        >
          <div className="space-y-1">
            {categories.map(category => (
              <CustomCheckbox
                key={category.id}
                checked={localFilters.category?.includes(category.id) || false}
                onChange={(e) => {
                  const current = localFilters.category || [];
                  const updated = e.target.checked
                    ? [...current, category.id]
                    : current.filter(id => id !== category.id);
                  updateFilter('category', updated);
                }}
                label={category.label}
                count={category.count}
              />
            ))}
          </div>
        </FilterSection>

        {/* Rating */}
        <FilterSection
          title="Minimum Rating"
          icon={faStar}
          isOpen={openSections.rating}
          onToggle={() => toggleSection('rating')}
          count={localFilters.rating > 0 ? 1 : 0}
        >
          <div className="space-y-2">
            {[0, 3, 4, 4.5].map(rating => (
              <CustomRadio
                key={rating}
                checked={localFilters.rating === rating}
                onChange={(value) => updateFilter('rating', value)}
                label={
                  rating === 0 ? 'Any Rating' : (
                    <div className="flex items-center space-x-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <FontAwesomeIcon
                            key={i}
                            icon={faStar}
                            className={`text-sm ${
                              i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span>{rating}+ Stars</span>
                    </div>
                  )
                }
                value={rating}
              />
            ))}
          </div>
        </FilterSection>

        {/* Locations */}
        <FilterSection
          title="Destinations"
          icon={faMapMarkerAlt}
          isOpen={openSections.location}
          onToggle={() => toggleSection('location')}
          count={localFilters.location?.length || 0}
        >
          <div className="space-y-1">
            {locations.map(location => (
              <CustomCheckbox
                key={location.id}
                checked={localFilters.location?.includes(location.id) || false}
                onChange={(e) => {
                  const current = localFilters.location || [];
                  const updated = e.target.checked
                    ? [...current, location.id]
                    : current.filter(id => id !== location.id);
                  updateFilter('location', updated);
                }}
                label={location.label}
                count={location.count}
              />
            ))}
          </div>
        </FilterSection>

        {/* Group Size */}
        <FilterSection
          title="Group Size"
          icon={faUsers}
          isOpen={openSections.group}
          onToggle={() => toggleSection('group')}
          count={localFilters.groupSize[0] > 1 || localFilters.groupSize[1] < 20 ? 1 : 0}
        >
          <RangeSlider
            min={1}
            max={20}
            value={localFilters.groupSize}
            onChange={(value) => updateFilter('groupSize', value)}
            step={1}
            suffix=" people"
          />
        </FilterSection>

        {/* Features */}
        <FilterSection
          title="Included Features"
          icon={faCheck}
          isOpen={openSections.features}
          onToggle={() => toggleSection('features')}
          count={localFilters.features?.length || 0}
        >
          <div className="space-y-1">
            {features.map(feature => (
              <CustomCheckbox
                key={feature.id}
                checked={localFilters.features?.includes(feature.id) || false}
                onChange={(e) => {
                  const current = localFilters.features || [];
                  const updated = e.target.checked
                    ? [...current, feature.id]
                    : current.filter(id => id !== feature.id);
                  updateFilter('features', updated);
                }}
                label={feature.label}
                count={feature.count}
              />
            ))}
          </div>
        </FilterSection>
      </div>

      {/* Apply Button */}
      {showApplyButton && (
        <div className="p-4 border-t bg-gray-50">
          <button
            onClick={handleApply}
            className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary-dark transition-colors"
          >
            Apply Filters ({getActiveFiltersCount()})
          </button>
        </div>
      )}
    </div>
  );
};

export default AdvancedFilters;