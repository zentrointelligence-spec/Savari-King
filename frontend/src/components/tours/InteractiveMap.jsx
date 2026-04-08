import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  ZoomControl,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import { useTranslation } from "react-i18next";

// Leaflet CSS imports
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import "leaflet-fullscreen/dist/leaflet.fullscreen.css";

// Leaflet plugins
import "leaflet.markercluster";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlane,
  faHotel,
  faUtensils,
  faLandmark,
  faMapMarkerAlt,
  faMountain,
  faWater,
  faInfoCircle,
  faExpand,
} from "@fortawesome/free-solid-svg-icons";

// Utility function to calculate distance between two coordinates (Haversine formula)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Custom hook for animated route drawing
const AnimatedPolyline = ({ positions, color, weight }) => {
  const map = useMap();
  const polylineRef = useRef(null);

  useEffect(() => {
    if (!polylineRef.current || !positions || positions.length === 0) return;

    const polyline = polylineRef.current;
    const latlngs = polyline.getLatLngs();

    // Reset and animate the polyline
    polyline.setLatLngs([]);
    let i = 0;

    const interval = setInterval(() => {
      if (i < latlngs.length) {
        polyline.setLatLngs(latlngs.slice(0, i + 1));
        i++;
      } else {
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [positions]);

  if (!positions || positions.length === 0) return null;

  return (
    <Polyline
      ref={polylineRef}
      pathOptions={{ color, weight }}
      positions={positions}
    />
  );
};

// Custom icons with FontAwesome
const createCustomIcon = (iconHtml, color) => {
  return L.divIcon({
    html: `
      <div class="relative">
        <div class="absolute inset-0 bg-white rounded-full shadow-lg animate-pulse"></div>
        <div class="relative z-10 w-10 h-10 flex items-center justify-center rounded-full text-white text-lg"
             style="background-color: ${color}">
          ${iconHtml}
        </div>
      </div>
    `,
    className: "bg-transparent border-none",
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
  });
};

// Location types configuration
const getLocationTypeConfig = (type, t) => {
  const configs = {
    airport: {
      icon: '<i class="fas fa-plane"></i>',
      color: "#3B82F6",
      name: t("interactiveMap.locationTypes.airport"),
    },
    hotel: {
      icon: '<i class="fas fa-hotel"></i>',
      color: "#10B981",
      name: t("interactiveMap.locationTypes.hotel"),
    },
    restaurant: {
      icon: '<i class="fas fa-utensils"></i>',
      color: "#EF4444",
      name: t("interactiveMap.locationTypes.restaurant"),
    },
    cultural: {
      icon: '<i class="fas fa-landmark"></i>',
      color: "#8B5CF6",
      name: t("interactiveMap.locationTypes.cultural"),
    },
    viewpoint: {
      icon: '<i class="fas fa-mountain"></i>',
      color: "#F59E0B",
      name: t("interactiveMap.locationTypes.viewpoint"),
    },
    beach: {
      icon: '<i class="fas fa-water"></i>',
      color: "#0EA5E9",
      name: t("interactiveMap.locationTypes.beach"),
    },
    attraction: {
      icon: '<i class="fas fa-map-marker-alt"></i>',
      color: "#EC4899",
      name: t("interactiveMap.locationTypes.attraction"),
    },
  };

  return (
    configs[type?.toLowerCase()] || {
      icon: '<i class="fas fa-map-marker-alt"></i>',
      color: "#6B7280",
      name: t("interactiveMap.locationTypes.default"),
    }
  );
};

// Parse destinations from tour data
const parseDestinations = (tour, t) => {
  if (!tour) return [];

  const locations = [];

  // Method 1: From covered_destinations (array of strings)
  if (tour.covered_destinations && Array.isArray(tour.covered_destinations)) {
    tour.covered_destinations.forEach((dest, index) => {
      locations.push({
        name: dest,
        type: index === 0 ? "airport" : "attraction",
        description: `${t('interactiveMap.visit')} ${dest}`,
        duration: `${t('interactiveMap.day')} ${index + 1}`,
      });
    });
  }

  // Method 2: From destinations (array of strings)
  if (locations.length === 0 && tour.destinations && Array.isArray(tour.destinations)) {
    tour.destinations.forEach((dest, index) => {
      locations.push({
        name: dest,
        type: index === 0 ? "airport" : "attraction",
        description: `${t('interactiveMap.explore')} ${dest}`,
        duration: `${t('interactiveMap.day')} ${index + 1}`,
      });
    });
  }

  // Method 3: From itinerary (object with day numbers as keys)
  if (locations.length === 0 && tour.itinerary) {
    const itineraryArray = Array.isArray(tour.itinerary)
      ? tour.itinerary
      : Object.values(tour.itinerary || {});

    itineraryArray.forEach((day) => {
      if (day.title) {
        locations.push({
          name: day.title,
          type: day.day === 1 ? "airport" : "attraction",
          description: day.details || day.description || `${t('interactiveMap.day')} ${day.day} ${t('interactiveMap.dayActivities')}`,
          duration: `${t('interactiveMap.day')} ${day.day}`,
        });
      }
    });
  }

  // Fallback: create a basic location from tour data
  if (locations.length === 0 && tour.starting_location) {
    locations.push({
      name: tour.starting_location,
      type: "airport",
      description: t('interactiveMap.tourStartingPoint'),
      duration: `${t('interactiveMap.day')} 1`,
    });
  }

  return locations;
};

// Custom control for location filtering
const LocationFilterControl = ({ locationTypes, onFilterChange, t }) => {
  const [activeFilters, setActiveFilters] = useState(
    Object.keys(locationTypes)
  );

  const toggleFilter = (type) => {
    const newFilters = activeFilters.includes(type)
      ? activeFilters.filter((t) => t !== type)
      : [...activeFilters, type];

    setActiveFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <div className="leaflet-bar leaflet-control bg-white rounded-lg shadow-lg p-3">
      <div className="font-bold text-gray-700 mb-2 text-sm">
        {t("interactiveMap.filterLocations")}
      </div>
      <div className="space-y-2">
        {Object.entries(locationTypes).map(([type, { icon, color, name }]) => (
          <div
            key={type}
            onClick={() => toggleFilter(type)}
            className={`flex items-center cursor-pointer p-2 rounded-md transition-all ${
              activeFilters.includes(type)
                ? "bg-gray-100"
                : "opacity-50 hover:opacity-75"
            }`}
          >
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center mr-2 text-white text-xs"
              style={{ backgroundColor: color }}
              dangerouslySetInnerHTML={{ __html: icon }}
            />
            <span className="text-sm text-gray-700">{name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const InteractiveMap = ({ tour }) => {
  const { t } = useTranslation();
  const mapRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activePopup, setActivePopup] = useState(null);

  // Parse locations from tour data
  const parsedLocations = useMemo(() => parseDestinations(tour, t), [tour, t]);

  // Add geocoding coordinates (in a real app, these would come from a geocoding API)
  // For now, we'll use approximate coordinates for South India destinations
  const locationsWithCoords = useMemo(() => {
    const coordsMap = {
      // Kerala
      "Trivandrum": [8.5241, 76.9366],
      "Thiruvananthapuram": [8.5241, 76.9366],
      "Kanyakumari": [8.0883, 77.5385],
      "Kovalam": [8.4023, 76.9784],
      "Cochin": [9.9312, 76.2673],
      "Kochi": [9.9312, 76.2673],
      "Munnar": [10.0889, 77.0595],
      "Alleppey": [9.4981, 76.3388],
      "Alappuzha": [9.4981, 76.3388],
      "Thekkady": [9.5989, 77.1604],
      "Periyar": [9.5989, 77.1604],
      "Varkala": [8.7333, 76.7167],

      // Karnataka
      "Mysore": [12.2958, 76.6394],
      "Bangalore": [12.9716, 77.5946],
      "Coorg": [12.4244, 75.7382],
      "Hampi": [15.3350, 76.4600],
      "Gokarna": [14.5479, 74.3188],

      // Tamil Nadu
      "Chennai": [13.0827, 80.2707],
      "Madurai": [9.9252, 78.1198],
      "Ooty": [11.4102, 76.6950],
      "Kodaikanal": [10.2381, 77.4892],
      "Pondicherry": [11.9139, 79.8145],
      "Rameswaram": [9.2876, 79.3129],
      "Mahabalipuram": [12.6208, 80.1989],

      // Goa
      "Goa": [15.2993, 74.1240],
      "Panaji": [15.4909, 73.8278],
      "Panjim": [15.4909, 73.8278],

      // Andhra Pradesh
      "Hyderabad": [17.3850, 78.4867],
      "Tirupati": [13.6288, 79.4192],
      "Visakhapatnam": [17.6868, 83.2185],
    };

    return parsedLocations.map((loc, index) => {
      // Try to match location name with coordinates
      const coords = Object.keys(coordsMap).find(key =>
        loc.name.toLowerCase().includes(key.toLowerCase())
      );

      return {
        ...loc,
        lat: coords ? coordsMap[coords][0] : 10.0 + (index * 0.5),
        lng: coords ? coordsMap[coords][1] : 76.0 + (index * 0.5),
      };
    });
  }, [parsedLocations]);

  const [filteredLocations, setFilteredLocations] = useState(locationsWithCoords);

  // Get unique location types from parsed locations
  const locationTypes = useMemo(() => {
    const types = {};
    const uniqueTypes = [...new Set(locationsWithCoords.map(loc => loc.type))];

    uniqueTypes.forEach(type => {
      types[type] = getLocationTypeConfig(type, t);
    });

    return types;
  }, [locationsWithCoords, t]);

  // Create route coordinates
  const routeCoordinates = useMemo(() => {
    return locationsWithCoords.map((loc) => [loc.lat, loc.lng]);
  }, [locationsWithCoords]);

  // Calculate total distance
  const totalDistance = useMemo(() => {
    if (locationsWithCoords.length < 2) return 0;

    let total = 0;
    for (let i = 0; i < locationsWithCoords.length - 1; i++) {
      const loc1 = locationsWithCoords[i];
      const loc2 = locationsWithCoords[i + 1];
      total += calculateDistance(loc1.lat, loc1.lng, loc2.lat, loc2.lng);
    }
    return Math.round(total);
  }, [locationsWithCoords]);

  // Handle filter changes
  const handleFilterChange = (filters) => {
    const filtered = locationsWithCoords.filter((loc) =>
      filters.includes(loc.type)
    );
    setFilteredLocations(filtered);
  };

  // Calculate map center
  const mapCenter = useMemo(() => {
    if (locationsWithCoords.length === 0) return [10.0, 77.0]; // Default South India center

    const avgLat = locationsWithCoords.reduce((sum, loc) => sum + loc.lat, 0) / locationsWithCoords.length;
    const avgLng = locationsWithCoords.reduce((sum, loc) => sum + loc.lng, 0) / locationsWithCoords.length;

    return [avgLat, avgLng];
  }, [locationsWithCoords]);

  // Auto-open first popup on map load
  useEffect(() => {
    const timer = setTimeout(() => {
      if (filteredLocations.length > 0) {
        setActivePopup(0);
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [filteredLocations]);

  // Get trip duration
  const tripDuration = tour?.duration_days || (tour?.itinerary ? Object.keys(tour.itinerary).length : 0) || "N/A";

  if (!tour || locationsWithCoords.length === 0) {
    return null; // Don't render map if no locations
  }

  return (
    <div className="mt-16 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            {t("interactiveMap.title")}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t("interactiveMap.subtitle")}
          </p>
        </div>

        <div
          className={`rounded-3xl overflow-hidden shadow-2xl relative ${
            isFullscreen ? "fixed inset-0 z-50" : ""
          }`}
        >
          <div className="h-[600px] w-full relative">
            <MapContainer
              center={mapCenter}
              zoom={8}
              scrollWheelZoom={true}
              style={{ height: "100%", width: "100%" }}
              zoomControl={false}
              ref={mapRef}
            >
              {/* OpenStreetMap tile layer */}
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {/* Animated route */}
              {routeCoordinates.length > 1 && (
                <AnimatedPolyline
                  positions={routeCoordinates}
                  color="#8B5CF6"
                  weight={4}
                />
              )}

              {/* Custom markers */}
              {filteredLocations.map((loc, index) => {
                const config = getLocationTypeConfig(loc.type, t);
                return (
                  <Marker
                    key={index}
                    position={[loc.lat, loc.lng]}
                    icon={createCustomIcon(config.icon, config.color)}
                    eventHandlers={{
                      click: () => {
                        setActivePopup(index);
                      },
                    }}
                  >
                    <Popup onOpen={() => setActivePopup(index)}>
                      <div className="w-64">
                        <h3 className="font-bold text-lg text-gray-800">
                          {loc.name}
                        </h3>
                        <div className="flex items-center gap-2 my-2">
                          <div
                            className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs"
                            style={{ backgroundColor: config.color }}
                            dangerouslySetInnerHTML={{ __html: config.icon }}
                          />
                          <span className="text-sm text-gray-600">{config.name}</span>
                        </div>
                        <p className="text-gray-700 text-sm mb-3">
                          {loc.description}
                        </p>
                        <div className="bg-gray-100 p-2 rounded-md text-sm">
                          <FontAwesomeIcon
                            icon={faInfoCircle}
                            className="text-gray-500 mr-2"
                          />
                          <span>{loc.duration}</span>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}

              {/* Custom controls */}
              <ZoomControl position="bottomright" />

              {/* Filter control */}
              {Object.keys(locationTypes).length > 1 && (
                <div className="leaflet-top leaflet-left">
                  <LocationFilterControl
                    locationTypes={locationTypes}
                    onFilterChange={handleFilterChange}
                    t={t}
                  />
                </div>
              )}
            </MapContainer>
          </div>

          {/* Map controls overlay */}
          <div className="absolute bottom-6 left-6 z-[1000]">
            <div className="flex gap-3">
              <button
                className="bg-white rounded-full w-10 h-10 flex items-center justify-center shadow-lg hover:bg-gray-100 transition-colors"
                onClick={() => {
                  const firstLocation = filteredLocations[0];
                  if (firstLocation && mapRef.current) {
                    mapRef.current.flyTo(
                      [firstLocation.lat, firstLocation.lng],
                      12,
                      { duration: 1.5 }
                    );
                  }
                }}
                aria-label={t("interactiveMap.resetView")}
                title={t("interactiveMap.resetView")}
              >
                <FontAwesomeIcon icon={faMapMarkerAlt} />
              </button>

              <button
                className="bg-white rounded-full w-10 h-10 flex items-center justify-center shadow-lg hover:bg-gray-100 transition-colors"
                onClick={() => {
                  if (mapRef.current && filteredLocations.length > 0) {
                    mapRef.current.fitBounds(
                      filteredLocations.map((loc) => [loc.lat, loc.lng]),
                      { padding: [50, 50] }
                    );
                  }
                }}
                aria-label={t("interactiveMap.fitAllLocations")}
                title={t("interactiveMap.fitAllLocations")}
              >
                <FontAwesomeIcon icon={faExpand} />
              </button>
            </div>
          </div>
        </div>

        {/* Location cards for mobile */}
        <div className="mt-8 md:hidden">
          <div className="grid grid-cols-1 gap-4">
            {filteredLocations.map((loc, index) => {
              const config = getLocationTypeConfig(loc.type, t);
              return (
                <div
                  key={index}
                  className={`bg-white rounded-xl p-4 shadow-md border-l-4 ${
                    activePopup === index ? "ring-2 ring-primary" : ""
                  }`}
                  style={{ borderLeftColor: config.color }}
                  onClick={() => {
                    setActivePopup(index);
                    if (mapRef.current) {
                      mapRef.current.flyTo([loc.lat, loc.lng], 14, {
                        duration: 1,
                      });
                    }
                  }}
                >
                  <div className="flex items-start">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white mr-3 flex-shrink-0"
                      style={{ backgroundColor: config.color }}
                      dangerouslySetInnerHTML={{ __html: config.icon }}
                    />
                    <div>
                      <h3 className="font-bold text-gray-800">{loc.name}</h3>
                      <p className="text-gray-600 text-sm">{loc.description}</p>
                      <div className="text-xs text-gray-500 mt-2 flex items-center">
                        <FontAwesomeIcon icon={faInfoCircle} className="mr-1" />
                        <span>{loc.duration}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tour summary - Dynamic Statistics */}
        <div className="mt-10 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 shadow-lg border border-gray-100">
          <h3 className="text-2xl font-bold text-gray-800 mb-6">
            {t("interactiveMap.journeyOverview")}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-white rounded-xl shadow-sm">
              <div className="text-4xl font-bold text-primary mb-2">
                {locationsWithCoords.length}
              </div>
              <div className="text-gray-700">{t("interactiveMap.keyLocations")}</div>
            </div>

            <div className="text-center p-6 bg-white rounded-xl shadow-sm">
              <div className="text-4xl font-bold text-primary mb-2">
                {totalDistance > 0 ? `${totalDistance} km` : "N/A"}
              </div>
              <div className="text-gray-700">{t("interactiveMap.totalDistance")}</div>
            </div>

            <div className="text-center p-6 bg-white rounded-xl shadow-sm">
              <div className="text-4xl font-bold text-primary mb-2">
                {typeof tripDuration === "number" ? t("tours.days", { count: tripDuration }) : tripDuration}
              </div>
              <div className="text-gray-700">{t("interactiveMap.tripDuration")}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InteractiveMap;
