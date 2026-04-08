/**
 * CountdownTimer Component
 * Displays countdown timer for quote expiration
 */

import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock } from '@fortawesome/free-solid-svg-icons';

const CountdownTimer = ({ expirationDate, onExpire }) => {
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (!expirationDate) {
      setIsExpired(true);
      return;
    }

    const calculateTimeRemaining = () => {
      const now = new Date();
      const expiration = new Date(expirationDate);
      const diff = expiration - now;

      if (diff <= 0) {
        setIsExpired(true);
        setTimeRemaining(null);
        if (onExpire) onExpire();
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeRemaining({ hours, minutes, seconds });
    };

    // Calculate immediately
    calculateTimeRemaining();

    // Update every second
    const interval = setInterval(calculateTimeRemaining, 1000);

    return () => clearInterval(interval);
  }, [expirationDate, onExpire]);

  if (isExpired) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
        <div className="flex items-center">
          <FontAwesomeIcon icon={faClock} className="text-red-600 mr-3 text-xl" />
          <div>
            <h3 className="text-red-800 font-semibold text-lg">Ce devis a expiré</h3>
            <p className="text-red-700 text-sm mt-1">
              This quote is no longer valid. Please contact us for an updated quotation.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!timeRemaining) {
    return null;
  }

  // Determine urgency level
  const totalHours = timeRemaining.hours;
  let urgencyClass = 'bg-green-50 border-green-500 text-green-800';
  let iconColor = 'text-green-600';

  if (totalHours < 6) {
    urgencyClass = 'bg-red-50 border-red-500 text-red-800';
    iconColor = 'text-red-600';
  } else if (totalHours < 12) {
    urgencyClass = 'bg-orange-50 border-orange-500 text-orange-800';
    iconColor = 'text-orange-600';
  } else if (totalHours < 24) {
    urgencyClass = 'bg-yellow-50 border-yellow-500 text-yellow-800';
    iconColor = 'text-yellow-600';
  }

  return (
    <div className={`border-l-4 p-4 rounded-lg ${urgencyClass}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <FontAwesomeIcon icon={faClock} className={`${iconColor} mr-3 text-xl`} />
          <div>
            <h3 className="font-semibold text-lg">Quote Valid For:</h3>
            <p className="text-sm mt-1 opacity-80">
              This quote will expire after 48 hours from when it was sent
            </p>
          </div>
        </div>
        <div className="text-right ml-4">
          <div className="text-3xl font-bold font-mono">
            {String(timeRemaining.hours).padStart(2, '0')}:
            {String(timeRemaining.minutes).padStart(2, '0')}:
            {String(timeRemaining.seconds).padStart(2, '0')}
          </div>
          <div className="text-xs opacity-80 mt-1">hours : minutes : seconds</div>
        </div>
      </div>
    </div>
  );
};

export default CountdownTimer;
