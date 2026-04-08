import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MapPin, Star, TrendingUp, Award, Compass, Calendar } from 'lucide-react';
import SeasonIndicator from './SeasonIndicator';
import FestivalBadge from './FestivalBadge';

/**
 * EnrichedDestinationCard Component
 * Displays a destination card with all enriched data from Phase 2
 */
const EnrichedDestinationCard = ({
  destination,
  onLike,
  isLiked = false,
  showFullDetails = false,
  className = ''
}) => {
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const {
    id,
    name,
    slug,
    description,
    shortDescription,
    location,
    images,
    timing,
    attractions,
    stats,
    pricing,
    flags,
  } = destination;

  // Handle image error
  const handleImageError = () => {
    setImageError(true);
  };

  // Get image URL with fallback
  const getImageUrl = () => {
    if (imageError) return '/images/placeholder-destination.jpg';
    return images?.main || images?.featured || images?.thumbnail || '/images/placeholder-destination.jpg';
  };

  // Format location string
  const formatLocation = () => {
    const parts = [location?.region, location?.state, location?.country].filter(Boolean);
    return parts.join(', ') || 'Location unavailable';
  };

  return (
    <div
      className={`bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Section */}
      <div className="relative h-56 overflow-hidden">
        <img
          src={getImageUrl()}
          alt={name}
          onError={handleImageError}
          className={`w-full h-full object-cover transition-transform duration-500 ${
            isHovered ? 'scale-110' : 'scale-100'
          }`}
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          {flags?.isFeatured && (
            <span className="inline-flex items-center gap-1 bg-yellow-500 text-white px-2.5 py-1 rounded-full text-xs font-bold shadow-lg">
              <Award size={12} />
              Featured
            </span>
          )}
          {flags?.isTrending && (
            <span className="inline-flex items-center gap-1 bg-red-500 text-white px-2.5 py-1 rounded-full text-xs font-bold shadow-lg">
              <TrendingUp size={12} />
              Trending
            </span>
          )}
          {flags?.isUNESCO && (
            <span className="bg-blue-600 text-white px-2.5 py-1 rounded-full text-xs font-medium shadow-lg">
              UNESCO
            </span>
          )}
          {flags?.isWildlifeSanctuary && (
            <span className="bg-green-600 text-white px-2.5 py-1 rounded-full text-xs font-medium shadow-lg">
              🦁 Wildlife
            </span>
          )}
          {flags?.ecoFriendly && (
            <span className="bg-emerald-600 text-white px-2.5 py-1 rounded-full text-xs font-medium shadow-lg">
              🌿 Eco
            </span>
          )}
        </div>

        {/* Like Button */}
        <button
          onClick={() => onLike && onLike(id)}
          className="absolute top-3 right-3 p-2.5 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white hover:scale-110 transition-all duration-200"
          aria-label={isLiked ? 'Unlike destination' : 'Like destination'}
        >
          <Heart
            size={18}
            className={`transition-colors ${
              isLiked ? 'fill-red-500 text-red-500' : 'text-gray-600 hover:text-red-500'
            }`}
          />
        </button>

        {/* Bottom Info on Image */}
        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="text-white font-bold text-xl mb-1 drop-shadow-lg">
            {name}
          </h3>
          <div className="flex items-center text-white/90 text-sm drop-shadow">
            <MapPin size={14} className="mr-1" />
            <span>{formatLocation()}</span>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4">
        {/* Stats Row */}
        <div className="flex items-center gap-4 mb-3 pb-3 border-b border-gray-200">
          <div className="flex items-center gap-1">
            <Star size={16} className="text-yellow-500 fill-yellow-500" />
            <span className="font-semibold text-gray-900">
              {stats?.avgRating ? stats.avgRating.toFixed(1) : 'N/A'}
            </span>
            <span className="text-xs text-gray-500">
              ({stats?.reviewCount || 0})
            </span>
          </div>

          <div className="flex items-center gap-1 text-gray-600">
            <Compass size={16} />
            <span className="text-sm font-medium">{stats?.tourCount || 0} tours</span>
          </div>

          {stats?.popularityScore && (
            <div className="ml-auto">
              <div className="flex items-center gap-1 px-2 py-1 bg-blue-50 rounded-full">
                <TrendingUp size={12} className="text-blue-600" />
                <span className="text-xs font-semibold text-blue-600">
                  {stats.popularityScore.toFixed(0)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Description */}
        {!showFullDetails && shortDescription && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {shortDescription}
          </p>
        )}

        {/* Season Indicator */}
        {timing?.bestTimeToVisit && (
          <div className="mb-3">
            <SeasonIndicator
              bestTimeToVisit={timing.bestTimeToVisit}
              peakSeason={timing.peakSeason}
              offSeason={timing.offSeason}
              compact
            />
          </div>
        )}

        {/* Festival Badge */}
        {timing?.upcomingFestivals && timing.upcomingFestivals.length > 0 && (
          <div className="mb-3">
            <FestivalBadge festivals={timing.upcomingFestivals} compact />
          </div>
        )}

        {/* Recommended Duration */}
        {timing?.recommendedDuration && (
          <div className="flex items-center gap-1.5 text-xs text-gray-600 mb-3">
            <Calendar size={14} />
            <span>Recommended: {timing.recommendedDuration}</span>
          </div>
        )}

        {/* Top Attractions Preview */}
        {attractions?.top && attractions.top.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-semibold text-gray-700 mb-2">Top Attractions:</p>
            <div className="flex flex-wrap gap-1.5">
              {attractions.top.slice(0, 3).map((attraction, index) => (
                <span
                  key={index}
                  className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2.5 py-1 rounded-full transition-colors"
                >
                  {attraction}
                </span>
              ))}
              {attractions.top.length > 3 && (
                <span className="text-xs text-gray-500 bg-gray-50 px-2.5 py-1 rounded-full">
                  +{attractions.top.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Activities Preview (if showFullDetails) */}
        {showFullDetails && attractions?.activities && attractions.activities.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-semibold text-gray-700 mb-2">Activities:</p>
            <div className="flex flex-wrap gap-1.5">
              {attractions.activities.slice(0, 5).map((activity, index) => (
                <span
                  key={index}
                  className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full"
                >
                  {activity}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Price Range */}
        {pricing && (
          <div className="mb-4 text-sm">
            {pricing.min > 0 && pricing.max > 0 ? (
              <div className="flex items-center justify-between">
                <span className="text-gray-600">From</span>
                <span className="font-bold text-gray-900">
                  ₹{pricing.min.toLocaleString()}
                </span>
              </div>
            ) : (
              <div className="text-gray-600">
                <span className="font-medium capitalize">{pricing.budgetCategory || 'Moderate'}</span> budget
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Link
            to={`/destinations/${slug || id}`}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-center py-2.5 rounded-lg transition-colors font-medium text-sm shadow-sm hover:shadow-md"
          >
            Explore
          </Link>
          <Link
            to={`/tours?destination=${id}`}
            className="flex-1 border-2 border-blue-600 text-blue-600 hover:bg-blue-50 text-center py-2.5 rounded-lg transition-colors font-medium text-sm"
          >
            View Tours
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EnrichedDestinationCard;
