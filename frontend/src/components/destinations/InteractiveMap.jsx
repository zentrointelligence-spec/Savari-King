import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Link } from 'react-router-dom';
import { MapPin, Navigation, ExternalLink } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icons
const createCustomIcon = (color = 'blue', size = 'large') => {
  const iconSize = size === 'large' ? [32, 45] : [25, 35];
  const iconAnchor = size === 'large' ? [16, 45] : [12, 35];
  const popupAnchor = size === 'large' ? [0, -45] : [0, -35];

  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        width: ${iconSize[0]}px;
        height: ${iconSize[1]}px;
        background: ${color};
        border: 3px solid white;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        box-shadow: 0 3px 10px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          transform: rotate(45deg);
          color: white;
          font-size: ${size === 'large' ? '18px' : '14px'};
          margin-bottom: ${size === 'large' ? '8px' : '6px'};
        ">📍</div>
      </div>
    `,
    iconSize: iconSize,
    iconAnchor: iconAnchor,
    popupAnchor: popupAnchor
  });
};

const mainIcon = createCustomIcon('#DC2626', 'large'); // Red for main destination
const nearbyIcon = createCustomIcon('#2563EB', 'small'); // Blue for nearby
const relatedIcon = createCustomIcon('#059669', 'small'); // Green for related

/**
 * MapController Component
 * Centers the map on the main destination when it changes
 */
const MapController = ({ center, zoom }) => {
  const map = useMap();

  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);

  return null;
};

/**
 * InteractiveMap Component
 * Displays an interactive map with the main destination and related/nearby destinations
 */
const InteractiveMap = ({
  destination,
  nearbyDestinations = [],
  relatedDestinations = [],
  showNearby = true,
  showRelated = true,
  height = '500px',
  zoom = 8,
  className = ''
}) => {
  const mapRef = useRef(null);

  // Extract coordinates
  const mainCoords = destination?.location?.latitude && destination?.location?.longitude
    ? [destination.location.latitude, destination.location.longitude]
    : null;

  // Default center (India center) if no coordinates
  const center = mainCoords || [20.5937, 78.9629];
  const defaultZoom = mainCoords ? zoom : 5;

  if (!destination) {
    return (
      <div className="bg-gray-100 rounded-lg flex items-center justify-center" style={{ height }}>
        <div className="text-center text-gray-500">
          <MapPin size={48} className="mx-auto mb-4 opacity-50" />
          <p>No map data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Map Legend */}
      <div className="absolute top-4 right-4 z-[1000] bg-white rounded-lg shadow-lg p-4 max-w-xs">
        <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
          <Navigation size={16} />
          Map Legend
        </h4>
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-600 rounded-full border-2 border-white shadow"></div>
            <span className="text-gray-700">Main Destination</span>
          </div>
          {showNearby && nearbyDestinations.length > 0 && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-600 rounded-full border-2 border-white shadow"></div>
              <span className="text-gray-700">Nearby Destinations</span>
            </div>
          )}
          {showRelated && relatedDestinations.length > 0 && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-600 rounded-full border-2 border-white shadow"></div>
              <span className="text-gray-700">Similar Destinations</span>
            </div>
          )}
        </div>
      </div>

      {/* Map Container */}
      <MapContainer
        center={center}
        zoom={defaultZoom}
        ref={mapRef}
        style={{ height, width: '100%', borderRadius: '0.5rem' }}
        scrollWheelZoom={true}
        className="z-0"
      >
        <MapController center={center} zoom={defaultZoom} />

        {/* Tile Layer - OpenStreetMap */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Main Destination Marker */}
        {mainCoords && (
          <Marker position={mainCoords} icon={mainIcon}>
            <Popup maxWidth={300}>
              <div className="p-2">
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {destination.name}
                </h3>
                {destination.images?.thumbnail && (
                  <img
                    src={destination.images.thumbnail}
                    alt={destination.name}
                    className="w-full h-32 object-cover rounded mb-3"
                  />
                )}
                <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                  {destination.shortDescription || destination.description}
                </p>

                {/* Stats */}
                {destination.stats && (
                  <div className="flex items-center gap-4 text-xs text-gray-600 mb-3 pb-3 border-b">
                    {destination.stats.avgRating && (
                      <span className="flex items-center gap-1">
                        ⭐ {destination.stats.avgRating.toFixed(1)}
                      </span>
                    )}
                    {destination.stats.tourCount && (
                      <span>{destination.stats.tourCount} tours</span>
                    )}
                  </div>
                )}

                {/* Location */}
                <div className="text-xs text-gray-500 mb-3">
                  📍 {[
                    destination.location?.region,
                    destination.location?.state,
                    destination.location?.country
                  ].filter(Boolean).join(', ')}
                </div>

                {/* Action Button */}
                <Link
                  to={`/destinations/${destination.slug || destination.id}`}
                  className="flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded transition-colors"
                >
                  <span>View Details</span>
                  <ExternalLink size={14} />
                </Link>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Nearby Destinations Markers */}
        {showNearby && nearbyDestinations.map((dest) => {
          if (!dest.location?.latitude || !dest.location?.longitude) return null;

          return (
            <Marker
              key={`nearby-${dest.id}`}
              position={[dest.location.latitude, dest.location.longitude]}
              icon={nearbyIcon}
            >
              <Popup maxWidth={250}>
                <div className="p-2">
                  <div className="inline-block bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-1 rounded-full mb-2">
                    Nearby
                  </div>
                  <h4 className="text-md font-bold text-gray-900 mb-2">{dest.name}</h4>
                  {dest.images?.thumbnail && (
                    <img
                      src={dest.images.thumbnail}
                      alt={dest.name}
                      className="w-full h-24 object-cover rounded mb-2"
                    />
                  )}
                  <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                    {dest.shortDescription}
                  </p>
                  {dest.stats?.avgRating && (
                    <div className="text-xs text-gray-500 mb-2">
                      ⭐ {dest.stats.avgRating.toFixed(1)} • {dest.stats.tourCount || 0} tours
                    </div>
                  )}
                  <Link
                    to={`/destinations/${dest.slug || dest.id}`}
                    className="block text-center bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium py-1.5 px-3 rounded transition-colors"
                  >
                    Explore
                  </Link>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Related Destinations Markers */}
        {showRelated && relatedDestinations.map((dest) => {
          if (!dest.location?.latitude || !dest.location?.longitude) return null;

          return (
            <Marker
              key={`related-${dest.id}`}
              position={[dest.location.latitude, dest.location.longitude]}
              icon={relatedIcon}
            >
              <Popup maxWidth={250}>
                <div className="p-2">
                  <div className="inline-block bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded-full mb-2">
                    Similar
                  </div>
                  <h4 className="text-md font-bold text-gray-900 mb-2">{dest.name}</h4>
                  {dest.images?.thumbnail && (
                    <img
                      src={dest.images.thumbnail}
                      alt={dest.name}
                      className="w-full h-24 object-cover rounded mb-2"
                    />
                  )}
                  <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                    {dest.shortDescription}
                  </p>
                  {dest.stats?.avgRating && (
                    <div className="text-xs text-gray-500 mb-2">
                      ⭐ {dest.stats.avgRating.toFixed(1)} • {dest.stats.tourCount || 0} tours
                    </div>
                  )}
                  <Link
                    to={`/destinations/${dest.slug || dest.id}`}
                    className="block text-center bg-green-600 hover:bg-green-700 text-white text-xs font-medium py-1.5 px-3 rounded transition-colors"
                  >
                    Explore
                  </Link>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Map Controls Info */}
      <div className="mt-2 text-xs text-gray-500 text-center">
        💡 Use scroll wheel to zoom • Click and drag to move • Click markers for details
      </div>
    </div>
  );
};

export default InteractiveMap;
