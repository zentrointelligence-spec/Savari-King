import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilter, faSync } from '@fortawesome/free-solid-svg-icons';

export const FilterButton = ({ showFilters, onToggleFilters }) => (
  <button
    onClick={onToggleFilters}
    className="bg-primary text-white px-4 py-2 rounded-lg flex items-center hover:bg-primary-dark transition-colors"
  >
    <FontAwesomeIcon icon={faFilter} className="mr-2" />
    {showFilters ? 'Hide Filters' : 'Show Filters'}
  </button>
);

export const FilterPanel = ({ show, onResetFilters, children }) => {
    if (!show) return null;

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg my-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {children}
            </div>
            <div className="flex justify-end mt-6">
                <button
                onClick={onResetFilters}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors flex items-center"
                >
                <FontAwesomeIcon icon={faSync} className="mr-2" />
                Reset Filters
                </button>
            </div>
        </div>
    )
}
