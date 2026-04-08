/**
 * ======================================================================
 * SEASON SERVICE
 * ======================================================================
 * Handles season-related logic for destinations
 * - Determines current season
 * - Checks if it's a good time to visit
 * - Manages festivals and events
 * - Provides weather recommendations
 * ======================================================================
 */

/**
 * Get the current month (1-12)
 * @param {Date} date - The date to check (defaults to now)
 * @returns {number} Month number (1-12)
 */
function getCurrentMonth(date = new Date()) {
  return date.getMonth() + 1; // JavaScript months are 0-indexed
}

/**
 * Determine if a date falls within a given season
 * @param {string} seasonMonths - Season months description (e.g., "October to February")
 * @param {Date} date - The date to check
 * @returns {boolean} True if date is in the season
 */
function isInSeason(seasonMonths, date = new Date()) {
  if (!seasonMonths) return false;

  const month = getCurrentMonth(date);
  const monthNames = {
    january: 1, february: 2, march: 3, april: 4, may: 5, june: 6,
    july: 7, august: 8, september: 9, october: 10, november: 11, december: 12
  };

  // Try to parse season months (e.g., "October to February" or "June-September")
  const seasonText = seasonMonths.toLowerCase();
  const monthPattern = /(january|february|march|april|may|june|july|august|september|october|november|december)/g;
  const matches = seasonText.match(monthPattern);

  if (matches && matches.length >= 2) {
    const startMonth = monthNames[matches[0]];
    const endMonth = monthNames[matches[matches.length - 1]];

    // Handle wrap-around seasons (e.g., October to February)
    if (startMonth <= endMonth) {
      return month >= startMonth && month <= endMonth;
    } else {
      return month >= startMonth || month <= endMonth;
    }
  }

  return false;
}

/**
 * Check if it's the best time to visit a destination
 * @param {Object} destination - Destination object with timing info
 * @param {Date} date - The date to check (defaults to now)
 * @returns {Object} Object with isBestTime flag and details
 */
function isBestTimeToVisit(destination, date = new Date()) {
  const { best_time_to_visit, peak_season, off_season } = destination;

  const isBestTime = isInSeason(best_time_to_visit, date);
  const isPeakSeason = isInSeason(peak_season, date);
  const isOffSeason = isInSeason(off_season, date);

  let recommendation = 'good';
  let message = 'Good time to visit';

  if (isPeakSeason) {
    recommendation = 'peak';
    message = 'Peak season - Best time to visit! Book in advance.';
  } else if (isBestTime) {
    recommendation = 'best';
    message = 'Great time to visit with pleasant weather';
  } else if (isOffSeason) {
    recommendation = 'off';
    message = 'Off-season - Expect rain and fewer crowds. Lower prices.';
  }

  return {
    isBestTime,
    isPeakSeason,
    isOffSeason,
    recommendation,
    message,
    currentMonth: date.toLocaleString('default', { month: 'long' }),
  };
}

/**
 * Get the current season information for a destination
 * @param {Object} destination - Destination object
 * @param {Date} date - The date to check
 * @returns {Object} Current season info
 */
function getCurrentSeason(destination, date = new Date()) {
  const { weather_data } = destination;

  if (!weather_data) {
    return null;
  }

  const month = getCurrentMonth(date);

  // Determine season based on month
  let currentSeason = 'summer';
  if (month >= 6 && month <= 9) {
    currentSeason = 'monsoon';
  } else if (month >= 10 || month <= 2) {
    currentSeason = 'winter';
  } else if (month >= 3 && month <= 5) {
    currentSeason = 'summer';
  }

  const seasonData = weather_data[currentSeason];

  if (!seasonData) {
    return null;
  }

  return {
    season: currentSeason,
    months: seasonData.months || '',
    temperature: {
      min: seasonData.temp_min,
      max: seasonData.temp_max,
      unit: 'C',
    },
    description: seasonData.description || '',
    humidity: seasonData.humidity || '',
    rainfall: seasonData.rainfall || '',
  };
}

/**
 * Get upcoming festivals for a destination
 * @param {Object} destination - Destination object
 * @param {number} monthsAhead - Number of months to look ahead (default: 3)
 * @param {Date} fromDate - Starting date (defaults to now)
 * @returns {Array} Array of upcoming festivals
 */
function getUpcomingFestivals(destination, monthsAhead = 3, fromDate = new Date()) {
  const { festivals_events } = destination;

  if (!festivals_events || !Array.isArray(festivals_events)) {
    return [];
  }

  const currentDate = new Date(fromDate);
  const futureDate = new Date(currentDate);
  futureDate.setMonth(futureDate.getMonth() + monthsAhead);

  const upcomingFestivals = festivals_events.filter(festival => {
    if (!festival.date) return false;

    const festivalDate = new Date(festival.date);
    return festivalDate >= currentDate && festivalDate <= futureDate;
  });

  // Sort by date
  upcomingFestivals.sort((a, b) => new Date(a.date) - new Date(b.date));

  return upcomingFestivals.map(festival => ({
    ...festival,
    daysUntil: Math.ceil((new Date(festival.date) - currentDate) / (1000 * 60 * 60 * 24)),
    formattedDate: new Date(festival.date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
  }));
}

/**
 * Get weather recommendations based on current season
 * @param {Object} destination - Destination object
 * @param {Date} date - The date to check
 * @returns {Object} Weather recommendations
 */
function getWeatherRecommendations(destination, date = new Date()) {
  const season = getCurrentSeason(destination, date);
  const timing = isBestTimeToVisit(destination, date);

  if (!season) {
    return {
      packing: destination.packing_suggestions || [],
      tips: [destination.travel_tips || 'Check weather before traveling'],
    };
  }

  const recommendations = {
    season: season.season,
    temperature: season.temperature,
    description: season.description,
    bestTime: timing,
    packing: destination.packing_suggestions || [],
    tips: [],
  };

  // Add season-specific tips
  if (season.season === 'monsoon') {
    recommendations.tips.push(
      'Carry rain gear and waterproof bags',
      'Roads may be slippery, drive carefully',
      'Some outdoor activities may be limited',
      'Enjoy the lush green landscapes'
    );
  } else if (season.season === 'summer') {
    recommendations.tips.push(
      'Stay hydrated, carry water bottle',
      'Use high SPF sunscreen',
      'Wear light, breathable clothing',
      'Avoid outdoor activities during peak afternoon heat'
    );
  } else if (season.season === 'winter') {
    recommendations.tips.push(
      'Pleasant weather, ideal for sightseeing',
      'Carry light jacket for evenings',
      'Perfect time for outdoor activities',
      'Book accommodations early as it\'s peak season'
    );
  }

  // Add general travel tips
  if (destination.travel_tips) {
    recommendations.tips.push(destination.travel_tips);
  }

  return recommendations;
}

/**
 * Get activities suitable for current season
 * @param {Object} destination - Destination object
 * @param {Date} date - The date to check
 * @returns {Array} Recommended activities
 */
function getSeasonalActivities(destination, date = new Date()) {
  const season = getCurrentSeason(destination, date);
  const activities = destination.activities || [];

  if (!season) {
    return activities;
  }

  // Activities to avoid during monsoon
  const monsoonAvoid = [
    'beach activities',
    'water sports',
    'trekking',
    'camping',
    'outdoor sports',
  ];

  // Activities perfect for monsoon
  const monsoonRecommended = [
    'waterfall visits',
    'ayurvedic treatments',
    'spa',
    'indoor activities',
    'cultural performances',
    'museum visits',
    'temple visits',
  ];

  if (season.season === 'monsoon') {
    return {
      allActivities: activities,
      recommended: activities.filter(activity =>
        monsoonRecommended.some(rec =>
          activity.toLowerCase().includes(rec.toLowerCase())
        )
      ),
      notRecommended: activities.filter(activity =>
        monsoonAvoid.some(avoid =>
          activity.toLowerCase().includes(avoid.toLowerCase())
        )
      ),
      seasonNote: 'Some outdoor activities may be limited due to rainfall',
    };
  }

  return {
    allActivities: activities,
    recommended: activities,
    notRecommended: [],
    seasonNote: 'Great time for all activities',
  };
}

/**
 * Get comprehensive season and timing information
 * @param {Object} destination - Destination object
 * @param {Date} date - The date to check
 * @returns {Object} Complete timing information
 */
function getCompleteTiming(destination, date = new Date()) {
  return {
    currentSeason: getCurrentSeason(destination, date),
    visitingTime: isBestTimeToVisit(destination, date),
    upcomingFestivals: getUpcomingFestivals(destination, 3, date),
    weatherRecommendations: getWeatherRecommendations(destination, date),
    seasonalActivities: getSeasonalActivities(destination, date),
    bestTimeToVisit: destination.best_time_to_visit,
    peakSeason: destination.peak_season,
    offSeason: destination.off_season,
  };
}

/**
 * Check if a specific festival is happening soon
 * @param {Object} destination - Destination object
 * @param {string} festivalName - Name of the festival
 * @param {number} daysAhead - Number of days to look ahead
 * @returns {Object|null} Festival info if happening soon
 */
function isFestivalSoon(destination, festivalName, daysAhead = 30) {
  const { festivals_events } = destination;

  if (!festivals_events || !Array.isArray(festivals_events)) {
    return null;
  }

  const currentDate = new Date();
  const futureDate = new Date(currentDate);
  futureDate.setDate(futureDate.getDate() + daysAhead);

  const festival = festivals_events.find(
    f =>
      f.name.toLowerCase().includes(festivalName.toLowerCase()) &&
      new Date(f.date) >= currentDate &&
      new Date(f.date) <= futureDate
  );

  if (festival) {
    return {
      ...festival,
      daysUntil: Math.ceil((new Date(festival.date) - currentDate) / (1000 * 60 * 60 * 24)),
      isHappening: true,
    };
  }

  return null;
}

/**
 * Get best months to visit (as an array)
 * @param {string} bestTimeToVisit - Best time description
 * @returns {Array} Array of month numbers
 */
function getBestMonthsArray(bestTimeToVisit) {
  if (!bestTimeToVisit) return [];

  const monthNames = {
    january: 1, february: 2, march: 3, april: 4, may: 5, june: 6,
    july: 7, august: 8, september: 9, october: 10, november: 11, december: 12
  };

  const seasonText = bestTimeToVisit.toLowerCase();
  const monthPattern = /(january|february|march|april|may|june|july|august|september|october|november|december)/g;
  const matches = seasonText.match(monthPattern);

  if (matches && matches.length >= 2) {
    const startMonth = monthNames[matches[0]];
    const endMonth = monthNames[matches[matches.length - 1]];

    const months = [];
    if (startMonth <= endMonth) {
      for (let i = startMonth; i <= endMonth; i++) {
        months.push(i);
      }
    } else {
      // Handle wrap-around
      for (let i = startMonth; i <= 12; i++) {
        months.push(i);
      }
      for (let i = 1; i <= endMonth; i++) {
        months.push(i);
      }
    }

    return months;
  }

  return [];
}

module.exports = {
  getCurrentMonth,
  isInSeason,
  isBestTimeToVisit,
  getCurrentSeason,
  getUpcomingFestivals,
  getWeatherRecommendations,
  getSeasonalActivities,
  getCompleteTiming,
  isFestivalSoon,
  getBestMonthsArray,
};
