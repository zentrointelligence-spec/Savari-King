/**
 * QuoteHeader Component
 * Displays quote header with booking information
 */

import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faClock, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

const QuoteHeader = ({ booking, isExpired, isAccepted }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg shadow-lg p-6 mb-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold mb-2">Travel Quotation</h1>
          <p className="text-blue-100 text-lg">Ebenezer Tours & Travels</p>
        </div>
        <div className="text-right">
          {isAccepted && (
            <div className="inline-flex items-center bg-green-500 text-white px-4 py-2 rounded-full text-sm font-semibold mb-2">
              <FontAwesomeIcon icon={faCheckCircle} className="mr-2" />
              Accepted
            </div>
          )}
          {isExpired && !isAccepted && (
            <div className="inline-flex items-center bg-red-500 text-white px-4 py-2 rounded-full text-sm font-semibold mb-2">
              <FontAwesomeIcon icon={faClock} className="mr-2" />
              Expired
            </div>
          )}
          {!isExpired && !isAccepted && (
            <div className="inline-flex items-center bg-yellow-500 text-white px-4 py-2 rounded-full text-sm font-semibold mb-2">
              <FontAwesomeIcon icon={faExclamationTriangle} className="mr-2" />
              Pending
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white bg-opacity-10 rounded-lg p-4">
          <div className="text-blue-200 text-sm mb-1">Reference Number</div>
          <div className="text-xl font-bold">{booking.booking_reference}</div>
        </div>
        <div className="bg-white bg-opacity-10 rounded-lg p-4">
          <div className="text-blue-200 text-sm mb-1">Tour Name</div>
          <div className="text-xl font-bold">{booking.tour_name}</div>
        </div>
        <div className="bg-white bg-opacity-10 rounded-lg p-4">
          <div className="text-blue-200 text-sm mb-1">Travel Date</div>
          <div className="text-xl font-bold">{formatDate(booking.travel_date)}</div>
        </div>
        <div className="bg-white bg-opacity-10 rounded-lg p-4">
          <div className="text-blue-200 text-sm mb-1">Travelers</div>
          <div className="text-xl font-bold">
            {booking.num_adults} Adults, {booking.num_children} Children
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuoteHeader;
