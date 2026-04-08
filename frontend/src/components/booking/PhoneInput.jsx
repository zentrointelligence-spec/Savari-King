import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPhone, faChevronDown, faSearch } from '@fortawesome/free-solid-svg-icons';
import { COUNTRIES } from '../../data/countries';

/**
 * PhoneInput Component - Ultra Modern Phone Input with Country Selector
 *
 * Features:
 * - Country selector with flags (195 countries)
 * - Search functionality
 * - Auto-formatting
 * - Modern animations
 * - Fully responsive
 * - Synchronized with CountrySelector
 */

const PhoneInput = ({ value = '', onChange, error, placeholder = 'Enter phone number', label, required = false, onCountryChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]);
  const [phoneNumber, setPhoneNumber] = useState('');
  const dropdownRef = useRef(null);

  // Parse existing value on mount
  useEffect(() => {
    if (value && value.startsWith('+')) {
      // Find matching country by dial code
      const matchedCountry = COUNTRIES.find(c => value.startsWith(c.dial));
      if (matchedCountry) {
        setSelectedCountry(matchedCountry);
        setPhoneNumber(value.substring(matchedCountry.dial.length).trim());
      } else {
        setPhoneNumber(value);
      }
    } else {
      setPhoneNumber(value);
    }
  }, []);

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
    country.dial.includes(search) ||
    country.code.toLowerCase().includes(search.toLowerCase())
  );

  // Handle country selection
  const handleCountrySelect = (country) => {
    setSelectedCountry(country);
    setIsOpen(false);
    setSearch('');

    // Only update phone number if user has already entered a number
    // Don't trigger onChange just for country selection without a number
    if (phoneNumber && phoneNumber.trim() !== '') {
      const fullNumber = `${country.dial} ${phoneNumber}`.trim();
      onChange(fullNumber);
    }

    // Notify parent component about country change for synchronization
    if (onCountryChange) {
      onCountryChange(country.name);
    }
  };

  // Handle phone number change
  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/[^\d\s-]/g, ''); // Only numbers, spaces, and dashes
    setPhoneNumber(value);
    // Update full phone number (dial code + space + number)
    // Only send the value if user has entered something, otherwise send empty string
    const fullNumber = value && value.trim() !== '' ? `${selectedCountry.dial} ${value}` : '';
    onChange(fullNumber);
  };

  return (
    <div className="relative">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <FontAwesomeIcon icon={faPhone} className="mr-2 text-primary" />
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        {/* Country Selector Button */}
        <div className="absolute left-0 top-0 bottom-0 flex items-center">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className={`h-full px-3 flex items-center gap-2 border-r-2 rounded-l-lg transition-all hover:bg-gray-50 ${
              error ? 'border-red-500' : 'border-gray-200'
            }`}
          >
            <span className="text-2xl">{selectedCountry.flag}</span>
            <span className="text-sm font-medium text-gray-700">{selectedCountry.dial}</span>
            <FontAwesomeIcon
              icon={faChevronDown}
              className={`text-gray-400 text-xs transition-transform ${isOpen ? 'rotate-180' : ''}`}
            />
          </button>
        </div>

        {/* Phone Number Input */}
        <input
          type="tel"
          value={phoneNumber}
          onChange={handlePhoneChange}
          placeholder={selectedCountry.placeholder || placeholder}
          className={`w-full pl-32 pr-4 py-3 border-2 rounded-lg focus:outline-none transition-all ${
            error
              ? 'border-red-500 focus:border-red-600 focus:ring-2 focus:ring-red-100'
              : 'border-gray-200 focus:border-primary focus:ring-2 focus:ring-blue-100'
          }`}
        />

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
                        selectedCountry.code === country.code ? 'bg-blue-50 border-l-4 border-primary' : ''
                      }`}
                    >
                      <span className="text-2xl">{country.flag}</span>
                      <div className="flex-1 text-left">
                        <div className="text-sm font-medium text-gray-800">{country.name}</div>
                        <div className="text-xs text-gray-500">{country.code}</div>
                      </div>
                      <span className="text-sm font-medium text-gray-600">{country.dial}</span>
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

export default PhoneInput;
