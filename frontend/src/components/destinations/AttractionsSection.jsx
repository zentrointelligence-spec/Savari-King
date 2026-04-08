import React, { useState } from 'react';
import { MapPin, Star, Camera, Info, ExternalLink, ChevronRight } from 'lucide-react';

/**
 * AttractionsSection Component - Phase 4
 * Displays top attractions and points of interest
 */
const AttractionsSection = ({ attractions }) => {
  const [selectedAttraction, setSelectedAttraction] = useState(null);

  if (!attractions || (!attractions.top && !attractions.pointsOfInterest)) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Camera size={48} className="mx-auto mb-4 opacity-50" />
        <p>Attraction information is not available for this destination.</p>
      </div>
    );
  }

  const topAttractions = attractions.top || [];
  const pointsOfInterest = attractions.pointsOfInterest || [];
  const culturalHighlights = attractions.culturalHighlights || [];
  const historicalSites = attractions.historicalSites || [];

  return (
    <div className="space-y-10">
      {/* Top Attractions Grid */}
      {topAttractions.length > 0 && (
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-6">
            Must-See Attractions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topAttractions.map((attraction, idx) => (
              <div
                key={idx}
                className="group bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer"
                onClick={() => setSelectedAttraction(attraction)}
              >
                {/* Attraction Image Placeholder */}
                <div className="relative h-48 bg-gradient-to-br from-blue-400 to-purple-500 overflow-hidden">
                  {/* If attraction has image URL, use it */}
                  {attraction.image ? (
                    <img
                      src={attraction.image}
                      alt={typeof attraction === 'string' ? attraction : attraction.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Camera className="text-white opacity-50" size={48} />
                    </div>
                  )}

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="flex items-center gap-2 text-white text-sm">
                        <Info size={16} />
                        <span>Click for details</span>
                      </div>
                    </div>
                  </div>

                  {/* Badge if featured */}
                  {attraction.isFeatured && (
                    <div className="absolute top-3 right-3">
                      <span className="bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                        Featured
                      </span>
                    </div>
                  )}
                </div>

                {/* Attraction Info */}
                <div className="p-5">
                  <h4 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1">
                    {typeof attraction === 'string' ? attraction : attraction.name}
                  </h4>

                  {attraction.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {attraction.description}
                    </p>
                  )}

                  {/* Attraction Meta */}
                  <div className="flex items-center justify-between text-sm">
                    {attraction.distance && (
                      <div className="flex items-center gap-1 text-gray-500">
                        <MapPin size={14} />
                        <span>{attraction.distance}</span>
                      </div>
                    )}

                    {attraction.rating && (
                      <div className="flex items-center gap-1 text-yellow-600">
                        <Star size={14} className="fill-yellow-600" />
                        <span className="font-semibold">{attraction.rating}</span>
                      </div>
                    )}
                  </div>

                  {/* Tags */}
                  {attraction.tags && attraction.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {attraction.tags.slice(0, 3).map((tag, tagIdx) => (
                        <span
                          key={tagIdx}
                          className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cultural Highlights */}
      {culturalHighlights.length > 0 && (
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-6">
            Cultural Highlights
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {culturalHighlights.map((highlight, idx) => (
              <div
                key={idx}
                className="flex items-start gap-4 p-5 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex-shrink-0 w-12 h-12 bg-purple-500 text-white rounded-lg flex items-center justify-center font-bold text-xl">
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900 mb-1">
                    {typeof highlight === 'string' ? highlight : highlight.name}
                  </h4>
                  {highlight.description && (
                    <p className="text-sm text-gray-700">{highlight.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Historical Sites */}
      {historicalSites.length > 0 && (
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-6">
            Historical Sites
          </h3>
          <div className="space-y-4">
            {historicalSites.map((site, idx) => (
              <div
                key={idx}
                className="flex items-start gap-4 p-5 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all"
              >
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center">
                    <span className="text-white text-2xl">🏛️</span>
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-bold text-gray-900 mb-1">
                    {typeof site === 'string' ? site : site.name}
                  </h4>
                  {site.description && (
                    <p className="text-sm text-gray-600 mb-2">{site.description}</p>
                  )}
                  {site.yearBuilt && (
                    <div className="text-xs text-gray-500">
                      Built: {site.yearBuilt}
                    </div>
                  )}
                  {site.significance && (
                    <div className="text-xs text-gray-500 italic mt-1">
                      {site.significance}
                    </div>
                  )}
                </div>
                {site.website && (
                  <a
                    href={site.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-shrink-0 p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink size={20} />
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Points of Interest */}
      {pointsOfInterest.length > 0 && (
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-6">
            Other Points of Interest
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {pointsOfInterest.map((poi, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 p-4 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex-shrink-0 w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                  <MapPin size={20} />
                </div>
                <div className="flex-1">
                  <h5 className="font-semibold text-gray-900">
                    {typeof poi === 'string' ? poi : poi.name}
                  </h5>
                  {poi.category && (
                    <span className="text-xs text-gray-500">{poi.category}</span>
                  )}
                </div>
                <ChevronRight className="text-gray-400" size={20} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Attraction Details Modal */}
      {selectedAttraction && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedAttraction(null)}
        >
          <div
            className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
              <h3 className="text-xl font-bold text-gray-900">
                {typeof selectedAttraction === 'string'
                  ? selectedAttraction
                  : selectedAttraction.name}
              </h3>
              <button
                onClick={() => setSelectedAttraction(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <span className="text-2xl">&times;</span>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {selectedAttraction.image && (
                <img
                  src={selectedAttraction.image}
                  alt={selectedAttraction.name}
                  className="w-full h-64 object-cover rounded-lg mb-6"
                />
              )}

              {selectedAttraction.description && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
                  <p className="text-gray-700 leading-relaxed">
                    {selectedAttraction.description}
                  </p>
                </div>
              )}

              {selectedAttraction.highlights && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Highlights</h4>
                  <ul className="space-y-2">
                    {selectedAttraction.highlights.map((highlight, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-gray-700">
                        <span className="text-blue-600 mt-1">•</span>
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {(selectedAttraction.distance ||
                selectedAttraction.rating ||
                selectedAttraction.entryFee) && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                  {selectedAttraction.distance && (
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Distance</div>
                      <div className="font-semibold text-gray-900">
                        {selectedAttraction.distance}
                      </div>
                    </div>
                  )}
                  {selectedAttraction.rating && (
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Rating</div>
                      <div className="flex items-center gap-1">
                        <Star size={16} className="fill-yellow-600 text-yellow-600" />
                        <span className="font-semibold text-gray-900">
                          {selectedAttraction.rating}
                        </span>
                      </div>
                    </div>
                  )}
                  {selectedAttraction.entryFee && (
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Entry Fee</div>
                      <div className="font-semibold text-gray-900">
                        {selectedAttraction.entryFee}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttractionsSection;
