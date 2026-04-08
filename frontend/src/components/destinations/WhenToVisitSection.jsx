import React from 'react';
import { Calendar, Sun, Cloud, CloudRain, Thermometer, Wind, Droplets } from 'lucide-react';
import { SeasonIndicator, FestivalBadge } from './index';

/**
 * WhenToVisitSection Component - Phase 4
 * Displays detailed season, weather, and festival information
 */
const WhenToVisitSection = ({ timing, climate }) => {
  if (!timing && !climate) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Calendar size={48} className="mx-auto mb-4 opacity-50" />
        <p>Weather information is not available for this destination.</p>
      </div>
    );
  }

  const getSeasonIcon = (seasonName) => {
    const lowerSeason = seasonName?.toLowerCase() || '';
    if (lowerSeason.includes('summer')) return <Sun className="text-yellow-500" size={24} />;
    if (lowerSeason.includes('monsoon') || lowerSeason.includes('rainy')) {
      return <CloudRain className="text-blue-500" size={24} />;
    }
    if (lowerSeason.includes('winter')) return <Cloud className="text-gray-500" size={24} />;
    return <Sun className="text-orange-500" size={24} />;
  };

  const getSeasonColor = (seasonName) => {
    const lowerSeason = seasonName?.toLowerCase() || '';
    if (lowerSeason.includes('summer')) return 'from-yellow-50 to-orange-50 border-yellow-200';
    if (lowerSeason.includes('monsoon') || lowerSeason.includes('rainy')) {
      return 'from-blue-50 to-cyan-50 border-blue-200';
    }
    if (lowerSeason.includes('winter')) return 'from-gray-50 to-slate-50 border-gray-200';
    return 'from-orange-50 to-amber-50 border-orange-200';
  };

  // Parse weather data if available
  const weatherData = climate?.weatherData || {};
  const seasons = ['summer', 'monsoon', 'winter'];

  return (
    <div className="space-y-8">
      {/* Season Indicator */}
      {timing && (
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Best Time to Visit</h3>
          <SeasonIndicator
            bestTimeToVisit={timing.bestTimeToVisit}
            peakSeason={timing.peakSeason}
            offSeason={timing.offSeason}
            compact={false}
          />
        </div>
      )}

      {/* Weather by Season */}
      {Object.keys(weatherData).length > 0 && (
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Weather by Season</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {seasons.map((season) => {
              const seasonData = weatherData[season];
              if (!seasonData) return null;

              return (
                <div
                  key={season}
                  className={`bg-gradient-to-br ${getSeasonColor(season)} border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow`}
                >
                  {/* Season Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      {getSeasonIcon(season)}
                      <h4 className="text-lg font-bold text-gray-900 capitalize">
                        {season}
                      </h4>
                    </div>
                    {seasonData.months && (
                      <span className="text-xs font-medium text-gray-600 bg-white px-2 py-1 rounded-full">
                        {seasonData.months}
                      </span>
                    )}
                  </div>

                  {/* Temperature */}
                  {seasonData.temperature && (
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Thermometer size={18} className="text-gray-600" />
                        <span className="text-sm font-semibold text-gray-700">
                          Temperature
                        </span>
                      </div>
                      <div className="text-2xl font-bold text-gray-900">
                        {seasonData.temperature.min}°C - {seasonData.temperature.max}°C
                      </div>
                      {seasonData.temperature.avg && (
                        <div className="text-sm text-gray-600">
                          Avg: {seasonData.temperature.avg}°C
                        </div>
                      )}
                    </div>
                  )}

                  {/* Rainfall */}
                  {seasonData.rainfall && (
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Droplets size={18} className="text-blue-500" />
                        <span className="text-sm font-semibold text-gray-700">
                          Rainfall
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">{seasonData.rainfall}</div>
                    </div>
                  )}

                  {/* Humidity */}
                  {seasonData.humidity && (
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Wind size={18} className="text-gray-500" />
                        <span className="text-sm font-semibold text-gray-700">
                          Humidity
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">{seasonData.humidity}</div>
                    </div>
                  )}

                  {/* Description */}
                  {seasonData.description && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {seasonData.description}
                      </p>
                    </div>
                  )}

                  {/* Activities for this season */}
                  {seasonData.activities && seasonData.activities.length > 0 && (
                    <div className="mt-4">
                      <div className="text-xs font-semibold text-gray-700 mb-2">
                        Best For:
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {seasonData.activities.map((activity, idx) => (
                          <span
                            key={idx}
                            className="text-xs bg-white text-gray-700 px-2 py-1 rounded-full"
                          >
                            {activity}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Climate Info */}
      {climate?.info && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <Sun className="text-blue-600 flex-shrink-0 mt-1" size={24} />
            <div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">Climate Overview</h4>
              <p className="text-gray-700 leading-relaxed">{climate.info}</p>
            </div>
          </div>
        </div>
      )}

      {/* Festivals & Events */}
      {timing?.upcomingFestivals && timing.upcomingFestivals.length > 0 && (
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-6">
            Upcoming Festivals & Events
          </h3>
          <FestivalBadge
            festivals={timing.upcomingFestivals}
            maxDisplay={5}
            showAll={true}
            compact={false}
          />
        </div>
      )}

      {/* All Festivals (if available in timing) */}
      {timing?.allFestivals && timing.allFestivals.length > 0 && (
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Annual Festivals Calendar
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {timing.allFestivals.map((festival, idx) => (
              <div
                key={idx}
                className="flex items-start gap-4 p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-lg flex flex-col items-center justify-center">
                    <span className="text-xs font-bold">
                      {new Date(festival.date).toLocaleDateString('en-US', { month: 'short' })}
                    </span>
                    <span className="text-2xl font-bold">
                      {new Date(festival.date).getDate()}
                    </span>
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900 mb-1">{festival.name}</h4>
                  <p className="text-sm text-gray-600 mb-2">{festival.description}</p>
                  {festival.type && (
                    <span className="inline-block text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                      {festival.type}
                    </span>
                  )}
                  {festival.significance && (
                    <p className="text-xs text-gray-500 mt-2 italic">
                      {festival.significance}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {timing?.recommendations && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <Calendar className="text-green-600 flex-shrink-0 mt-1" size={24} />
            <div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">
                Travel Recommendations
              </h4>
              <ul className="space-y-2 text-gray-700">
                {Array.isArray(timing.recommendations) ? (
                  timing.recommendations.map((rec, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-green-600 mt-1">✓</span>
                      <span>{rec}</span>
                    </li>
                  ))
                ) : (
                  <li>{timing.recommendations}</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WhenToVisitSection;
