import React, { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// Country coordinates mapping (top 50 countries for tours)
const COUNTRY_COORDINATES = {
  "India": [20.5937, 78.9629],
  "United States": [37.0902, -95.7129],
  "United Kingdom": [55.3781, -3.4360],
  "France": [46.2276, 2.2137],
  "Germany": [51.1657, 10.4515],
  "Canada": [56.1304, -106.3468],
  "Australia": [-25.2744, 133.7751],
  "Japan": [36.2048, 138.2529],
  "China": [35.8617, 104.1954],
  "Brazil": [-14.2350, -51.9253],
  "Cameroon": [7.3697, 12.3547],
  "Italy": [41.8719, 12.5674],
  "Spain": [40.4637, -3.7492],
  "Mexico": [23.6345, -102.5528],
  "Russia": [61.5240, 105.3188],
  "South Korea": [35.9078, 127.7669],
  "Netherlands": [52.1326, 5.2913],
  "Switzerland": [46.8182, 8.2275],
  "Sweden": [60.1282, 18.6435],
  "Singapore": [1.3521, 103.8198],
  "United Arab Emirates": [23.4241, 53.8478],
  "Saudi Arabia": [23.8859, 45.0792],
  "Thailand": [15.8700, 100.9925],
  "Malaysia": [4.2105, 101.9758],
  "Indonesia": [-0.7893, 113.9213],
  "Philippines": [12.8797, 121.7740],
  "Vietnam": [14.0583, 108.2772],
  "Turkey": [38.9637, 35.2433],
  "Egypt": [26.8206, 30.8025],
  "South Africa": [-30.5595, 22.9375],
  "Argentina": [-38.4161, -63.6167],
  "Default": [20.5937, 78.9629] // Default to India
};

// Component to fit bounds when data changes
const FitBounds = ({ locations }) => {
  const map = useMap();

  useEffect(() => {
    if (locations && locations.length > 0) {
      const bounds = locations
        .filter(loc => COUNTRY_COORDINATES[loc.country])
        .map(loc => COUNTRY_COORDINATES[loc.country]);

      if (bounds.length > 0) {
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 5 });
      }
    }
  }, [locations, map]);

  return null;
};

const GeoMap = ({ locations = [] }) => {
  const mapRef = useRef(null);
  const [mapReady, setMapReady] = useState(false);

  // Filter and enrich locations with coordinates
  const enrichedLocations = locations
    .filter(loc => loc.country && COUNTRY_COORDINATES[loc.country])
    .map(loc => ({
      ...loc,
      coordinates: COUNTRY_COORDINATES[loc.country],
      // Scale circle size based on count (min 10, max 40)
      radius: Math.min(40, Math.max(10, Math.log(loc.count + 1) * 8))
    }))
    .sort((a, b) => b.count - a.count); // Sort by count descending

  const totalCustomers = locations.reduce((sum, loc) => sum + parseInt(loc.count || 0), 0);

  if (!locations || locations.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg h-full flex items-center justify-center">
        <div className="text-center text-gray-500">
          <i className="fas fa-map-marked-alt text-4xl mb-3 text-gray-300"></i>
          <div>No customer location data available</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full rounded-lg overflow-hidden border border-gray-200 relative">
      <MapContainer
        center={[20, 0]}
        zoom={2}
        style={{ height: "100%", width: "100%" }}
        ref={mapRef}
        whenReady={() => setMapReady(true)}
        scrollWheelZoom={false}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {mapReady && <FitBounds locations={enrichedLocations} />}

        {enrichedLocations.map((location, index) => {
          const percentage = ((location.count / totalCustomers) * 100).toFixed(1);

          return (
            <CircleMarker
              key={index}
              center={location.coordinates}
              radius={location.radius}
              pathOptions={{
                fillColor: "#3b82f6",
                fillOpacity: 0.6,
                color: "#1e40af",
                weight: 2,
              }}
            >
              <Popup>
                <div className="text-sm">
                  <div className="font-bold text-base mb-1">{location.country}</div>
                  <div className="text-gray-600">
                    <span className="font-semibold text-primary">{location.count}</span> customers
                  </div>
                  <div className="text-gray-500 text-xs mt-1">
                    {percentage}% of total
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>

      {/* Legend */}
      <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-3 text-xs z-10">
        <div className="font-semibold mb-2 text-gray-700">Customer Distribution</div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-gray-600">{totalCustomers} total customers</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            <span className="text-gray-500">Circle size = customer count</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeoMap;
