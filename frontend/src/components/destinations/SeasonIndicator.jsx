import React from 'react';

/**
 * SeasonIndicator Component
 * Displays visual indicator for the best time to visit a destination
 */
const SeasonIndicator = ({
  bestTimeToVisit,
  peakSeason,
  offSeason,
  compact = false
}) => {
  // Determine current season status based on current month
  const getCurrentSeasonStatus = () => {
    const month = new Date().getMonth() + 1; // 1-12

    // Helper to check if current month is in season range
    const isInSeasonRange = (seasonText) => {
      if (!seasonText) return false;

      const monthNames = {
        january: 1, february: 2, march: 3, april: 4, may: 5, june: 6,
        july: 7, august: 8, september: 9, october: 10, november: 11, december: 12
      };

      const lowerText = seasonText.toLowerCase();
      const matches = lowerText.match(/january|february|march|april|may|june|july|august|september|october|november|december/g);

      if (matches && matches.length >= 2) {
        const startMonth = monthNames[matches[0]];
        const endMonth = monthNames[matches[matches.length - 1]];

        // Handle wrap-around (e.g., October to February)
        if (startMonth <= endMonth) {
          return month >= startMonth && month <= endMonth;
        } else {
          return month >= startMonth || month <= endMonth;
        }
      }

      return false;
    };

    // Check which season we're in
    const isPeak = isInSeasonRange(peakSeason);
    const isBest = isInSeasonRange(bestTimeToVisit);
    const isOff = isInSeasonRange(offSeason);

    if (isPeak) {
      return {
        status: 'peak',
        color: 'bg-green-500',
        textColor: 'text-green-700',
        bgColor: 'bg-green-100',
        icon: '🌟',
        text: 'Peak Season',
        description: 'Best time to visit now!'
      };
    } else if (isBest && !isPeak) {
      return {
        status: 'good',
        color: 'bg-blue-500',
        textColor: 'text-blue-700',
        bgColor: 'bg-blue-100',
        icon: '☀️',
        text: 'Good Season',
        description: 'Pleasant weather'
      };
    } else if (isOff) {
      return {
        status: 'off',
        color: 'bg-orange-500',
        textColor: 'text-orange-700',
        bgColor: 'bg-orange-100',
        icon: '🍂',
        text: 'Off Season',
        description: 'Fewer crowds, lower prices'
      };
    }

    // Default
    return {
      status: 'neutral',
      color: 'bg-gray-400',
      textColor: 'text-gray-700',
      bgColor: 'bg-gray-100',
      icon: '📅',
      text: 'All Year',
      description: 'Visit anytime'
    };
  };

  if (!bestTimeToVisit && !peakSeason && !offSeason) {
    return null;
  }

  const seasonInfo = getCurrentSeasonStatus();

  // Compact version (small badge)
  if (compact) {
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${seasonInfo.bgColor} ${seasonInfo.textColor}`}>
        <span>{seasonInfo.icon}</span>
        <span>{seasonInfo.text}</span>
      </span>
    );
  }

  // Full version with details
  return (
    <div className={`flex items-center gap-2 p-3 rounded-lg ${seasonInfo.bgColor}`}>
      <div className={`w-3 h-3 rounded-full ${seasonInfo.color} animate-pulse`}></div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="text-lg">{seasonInfo.icon}</span>
          <span className={`font-semibold text-sm ${seasonInfo.textColor}`}>
            {seasonInfo.text}
          </span>
        </div>
        <p className="text-xs text-gray-600 mt-0.5">{seasonInfo.description}</p>
        {bestTimeToVisit && (
          <p className="text-xs text-gray-500 mt-1">
            Best time: {bestTimeToVisit.split('-')[0].trim()}
          </p>
        )}
      </div>
    </div>
  );
};

export default SeasonIndicator;
