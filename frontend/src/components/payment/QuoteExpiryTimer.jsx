import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

/**
 * QuoteExpiryTimer Component
 * Affiche un countdown timer avec barre de progression pour l'expiration du quote
 *
 * @param {Date|String} expirationDate - Date d'expiration du quote
 * @param {Function} onExpired - Callback appelé quand le quote expire
 */
const QuoteExpiryTimer = ({ expirationDate, onExpired }) => {
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const expiry = new Date(expirationDate);
      const diff = expiry - now;

      if (diff <= 0) {
        setIsExpired(true);
        setTimeRemaining({ hours: 0, minutes: 0, seconds: 0 });
        if (onExpired && !isExpired) {
          onExpired();
        }
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeRemaining({ hours, minutes, seconds });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [expirationDate, onExpired, isExpired]);

  if (!timeRemaining) return null;

  const isUrgent = timeRemaining.hours < 2;

  // Calcul du pourcentage de progression (sur base de 48h)
  const totalMinutes = timeRemaining.hours * 60 + timeRemaining.minutes;
  const progressPercentage = Math.max(0, Math.min(100, (totalMinutes / (48 * 60)) * 100));

  return (
    <div
      className={`rounded-xl p-6 mb-6 shadow-lg border-2 transition-all duration-300 ${
        isExpired
          ? 'bg-gradient-to-r from-red-50 to-red-100 border-red-500 animate-pulse'
          : isUrgent
          ? 'bg-gradient-to-r from-orange-50 to-orange-100 border-orange-500'
          : 'bg-gradient-to-r from-blue-50 to-blue-100 border-blue-300'
      }`}
    >
      <div className="flex items-start">
        <div
          className={`flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center mr-4 ${
            isExpired
              ? 'bg-red-500'
              : isUrgent
              ? 'bg-orange-500'
              : 'bg-blue-500'
          }`}
        >
          <FontAwesomeIcon
            icon={isExpired || isUrgent ? faExclamationTriangle : faClock}
            className="text-white text-2xl"
          />
        </div>

        <div className="flex-1">
          <h3
            className={`font-bold text-xl mb-2 ${
              isExpired
                ? 'text-red-900'
                : isUrgent
                ? 'text-orange-900'
                : 'text-blue-900'
            }`}
          >
            {isExpired ? '⏰ Quote Expired!' : isUrgent ? '⚠️ Quote Expiring Soon!' : '✅ Quote Valid'}
          </h3>

          {isExpired ? (
            <div className="space-y-2">
              <p className="text-sm text-red-800 font-medium">
                This quote has expired. You cannot complete payment with an expired quote.
              </p>
              <p className="text-xs text-red-700">
                Please return to <span className="font-bold">My Bookings</span> and request a new quote to
                proceed with payment.
              </p>
            </div>
          ) : (
            <>
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Time remaining:</p>
                <div className="flex items-center space-x-1">
                  <div
                    className={`flex flex-col items-center justify-center bg-white rounded-lg p-3 shadow-md min-w-[80px] ${
                      isUrgent ? 'border-2 border-orange-400' : 'border border-gray-200'
                    }`}
                  >
                    <span
                      className={`text-3xl font-mono font-bold ${
                        isUrgent ? 'text-orange-600' : 'text-blue-600'
                      }`}
                    >
                      {String(timeRemaining.hours).padStart(2, '0')}
                    </span>
                    <span className="text-xs text-gray-500 font-semibold mt-1">HOURS</span>
                  </div>
                  <span className="text-2xl font-bold text-gray-400">:</span>
                  <div
                    className={`flex flex-col items-center justify-center bg-white rounded-lg p-3 shadow-md min-w-[80px] ${
                      isUrgent ? 'border-2 border-orange-400' : 'border border-gray-200'
                    }`}
                  >
                    <span
                      className={`text-3xl font-mono font-bold ${
                        isUrgent ? 'text-orange-600' : 'text-blue-600'
                      }`}
                    >
                      {String(timeRemaining.minutes).padStart(2, '0')}
                    </span>
                    <span className="text-xs text-gray-500 font-semibold mt-1">MINUTES</span>
                  </div>
                  <span className="text-2xl font-bold text-gray-400">:</span>
                  <div
                    className={`flex flex-col items-center justify-center bg-white rounded-lg p-3 shadow-md min-w-[80px] ${
                      isUrgent ? 'border-2 border-orange-400' : 'border border-gray-200'
                    }`}
                  >
                    <span
                      className={`text-3xl font-mono font-bold ${
                        isUrgent ? 'text-orange-600' : 'text-blue-600'
                      }`}
                    >
                      {String(timeRemaining.seconds).padStart(2, '0')}
                    </span>
                    <span className="text-xs text-gray-500 font-semibold mt-1">SECONDS</span>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-3">
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>Expired</span>
                  <span>Full Duration (48h)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
                  <div
                    className={`h-full transition-all duration-1000 rounded-full ${
                      isUrgent
                        ? 'bg-gradient-to-r from-orange-400 to-orange-600'
                        : 'bg-gradient-to-r from-blue-400 to-blue-600'
                    }`}
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>

              {isUrgent && (
                <div className="mt-3 bg-orange-200 border border-orange-400 rounded-lg p-3 flex items-start">
                  <FontAwesomeIcon
                    icon={faExclamationTriangle}
                    className="text-orange-600 mt-0.5 mr-2"
                  />
                  <p className="text-xs text-orange-900 font-medium">
                    <strong>Hurry!</strong> Complete your payment before the quote expires. After expiration,
                    you'll need to request a new quote.
                  </p>
                </div>
              )}

              {!isUrgent && (
                <p className="text-xs text-gray-600 mt-2">
                  💡 Your quote is valid until{' '}
                  {new Date(expirationDate).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuoteExpiryTimer;
