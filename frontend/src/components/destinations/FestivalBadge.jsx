import React from 'react';

/**
 * FestivalBadge Component
 * Displays upcoming festivals for a destination
 */
const FestivalBadge = ({
  festivals = [],
  maxDisplay = 1,
  compact = false,
  showAll = false
}) => {
  if (!festivals || festivals.length === 0) return null;

  // Calculate days until festival
  const getDaysUntil = (festivalDate) => {
    const today = new Date();
    const festival = new Date(festivalDate);
    const diffTime = festival - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Filter upcoming festivals (next 90 days)
  const upcomingFestivals = festivals
    .map(festival => ({
      ...festival,
      daysUntil: getDaysUntil(festival.date)
    }))
    .filter(festival => festival.daysUntil >= 0 && festival.daysUntil <= 90)
    .sort((a, b) => a.daysUntil - b.daysUntil);

  if (upcomingFestivals.length === 0) return null;

  const festivalsToShow = showAll ? upcomingFestivals : upcomingFestivals.slice(0, maxDisplay);

  // Compact version (small badge)
  if (compact) {
    const nextFestival = festivalsToShow[0];
    return (
      <div className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
        <span>🎉</span>
        <span className="font-semibold">{nextFestival.name}</span>
        <span className="text-purple-600">
          in {nextFestival.daysUntil} {nextFestival.daysUntil === 1 ? 'day' : 'days'}
        </span>
      </div>
    );
  }

  // Full version with multiple festivals
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
        <span>🎉</span>
        <span>Upcoming Festivals</span>
      </div>
      <div className="space-y-2">
        {festivalsToShow.map((festival, index) => (
          <div
            key={index}
            className="flex items-start gap-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200"
          >
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-purple-500 text-white rounded-lg flex flex-col items-center justify-center">
                <span className="text-xs font-bold">
                  {new Date(festival.date).toLocaleDateString('en-US', { month: 'short' })}
                </span>
                <span className="text-lg font-bold">
                  {new Date(festival.date).getDate()}
                </span>
              </div>
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-purple-900">{festival.name}</h4>
              <p className="text-xs text-gray-600 mt-0.5">{festival.description}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs font-medium text-purple-700 bg-purple-100 px-2 py-0.5 rounded">
                  {festival.daysUntil} days away
                </span>
                {festival.type && (
                  <span className="text-xs text-gray-500">
                    {festival.type}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      {!showAll && upcomingFestivals.length > maxDisplay && (
        <p className="text-xs text-center text-gray-500">
          +{upcomingFestivals.length - maxDisplay} more festival{upcomingFestivals.length - maxDisplay > 1 ? 's' : ''} coming soon
        </p>
      )}
    </div>
  );
};

export default FestivalBadge;
