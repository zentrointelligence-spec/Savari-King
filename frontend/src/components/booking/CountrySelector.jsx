import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGlobe, faChevronDown, faSearch } from '@fortawesome/free-solid-svg-icons';
import { COUNTRIES } from '../../data/countries';

/**
 * CountrySelector Component - Ultra Modern Country Selector
 *
 * Features:
 * - Country selector with flags
 * - Search functionality
 * - Modern animations
 * - Fully responsive
 * - Synchronized with PhoneInput
 */

const CountrySelector = ({ value = '', onChange, error, placeholder = 'Select your country', label, required = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(null);
  const dropdownRef = useRef(null);

  // Parse existing value on mount or when value changes
  useEffect(() => {
    if (value) {
      // Find matching country by name or code
      const matchedCountry = COUNTRIES.find(
        c => c.name.toLowerCase() === value.toLowerCase() || c.code === value
      );
      if (matchedCountry) {
        setSelectedCountry(matchedCountry);
      }
    }
  }, [value]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearch('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter countries based on search
  const filteredCountries = COUNTRIES.filter(country =>
    country.name.toLowerCase().includes(search.toLowerCase()) ||
    country.code.toLowerCase().includes(search.toLowerCase())
  );

  // Handle country selection
  const handleCountrySelect = (country) => {
    setSelectedCountry(country);
    setIsOpen(false);
    setSearch('');
    onChange(country.name);
  };

  return (
    <div className="relative">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <FontAwesomeIcon icon={faGlobe} className="mr-2 text-primary" />
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        {/* Country Selector Button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full px-4 py-3 flex items-center justify-between border-2 rounded-lg transition-all hover:bg-gray-50 ${
            error
              ? 'border-red-500 focus:border-red-600 focus:ring-2 focus:ring-red-100'
              : 'border-gray-200 focus:border-primary focus:ring-2 focus:ring-blue-100'
          } ${isOpen ? 'border-primary ring-2 ring-blue-100' : ''}`}
        >
          <div className="flex items-center gap-3">
            {selectedCountry ? (
              <>
                <span className="text-2xl">{selectedCountry.flag}</span>
                <div className="text-left">
                  <div className="text-sm font-medium text-gray-800">{selectedCountry.name}</div>
                  <div className="text-xs text-gray-500">{selectedCountry.code}</div>
                </div>
              </>
            ) : (
              <span className="text-gray-500 text-sm">{placeholder}</span>
            )}
          </div>
          <FontAwesomeIcon
            icon={faChevronDown}
            className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {/* Country Dropdown */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              ref={dropdownRef}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute z-50 mt-2 w-full bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden"
            >
              {/* Search Input */}
              <div className="p-3 border-b border-gray-200 bg-gray-50">
                <div className="relative">
                  <FontAwesomeIcon
                    icon={faSearch}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search country..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary text-sm"
                    autoFocus
                  />
                </div>
              </div>

              {/* Countries List */}
              <div className="max-h-64 overflow-y-auto custom-scrollbar">
                {filteredCountries.length > 0 ? (
                  filteredCountries.map((country) => (
                    <button
                      key={country.code}
                      type="button"
                      onClick={() => handleCountrySelect(country)}
                      className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-blue-50 transition-colors ${
                        selectedCountry?.code === country.code ? 'bg-blue-50 border-l-4 border-primary' : ''
                      }`}
                    >
                      <span className="text-2xl">{country.flag}</span>
                      <div className="flex-1 text-left">
                        <div className="text-sm font-medium text-gray-800">{country.name}</div>
                        <div className="text-xs text-gray-500">{country.code}</div>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-8 text-center text-gray-500 text-sm">
                    No countries found
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 text-sm text-red-600 flex items-center gap-1"
        >
          <span>⚠️</span>
          <span>{error}</span>
        </motion.div>
      )}

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
};

export default CountrySelector;
