import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUsers, FaCar, FaBus, FaShuttleVan, FaCarSide, FaCheck, FaStar, FaInfoCircle, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import API_CONFIG from '../../config/api';
import Price from '../common/Price';

const VehiclesSection = ({ tourId, selectedTier }) => {
  const { t } = useTranslation();
  const [vehiclesData, setVehiclesData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_CONFIG.BASE_URL}/api/tours/${tourId}/vehicles`);

        if (!response.ok) {
          throw new Error('Failed to fetch vehicles');
        }

        const data = await response.json();
        setVehiclesData(data);
      } catch (err) {
        console.error('Error fetching vehicles:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (tourId) {
      fetchVehicles();
    }
  }, [tourId]);

  const getVehicleIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'car':
        return FaCar;
      case 'suv':
        return FaCarSide;
      case 'van':
        return FaShuttleVan;
      case 'bus':
        return FaBus;
      default:
        return FaCar;
    }
  };

  const getComfortLevelColor = (comfortLevel) => {
    switch (comfortLevel?.toLowerCase()) {
      case 'standard':
        return 'text-blue-600 bg-blue-100';
      case 'comfort':
        return 'text-purple-600 bg-purple-100';
      case 'premium':
        return 'text-amber-600 bg-amber-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-3">
            <div className="h-24 bg-gray-200 rounded"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <p className="text-red-600">{t('vehiclesSection.errorLoading')}</p>
      </div>
    );
  }

  if (!vehiclesData) {
    return null;
  }

  const currentTierVehicle = selectedTier
    ? vehiclesData.defaultVehiclesByTier[selectedTier]
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl p-6 md:p-8 mb-8"
    >
      {/* Section Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-3 bg-blue-100 rounded-xl">
            <FaBus className="text-2xl text-blue-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800">
            {t('vehiclesSection.title')}
          </h2>
        </div>
        <p className="text-gray-600 ml-14">
          {t('vehiclesSection.description')}
        </p>
      </div>

      {/* Tour Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <FaInfoCircle className="text-blue-600 text-xl" />
          <span className="text-sm text-gray-700">
            <strong>{t('vehiclesSection.tourDuration')}:</strong> {vehiclesData.durationDays} {t('vehiclesSection.days')}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <FaUsers className="text-blue-600 text-xl" />
          <span className="text-sm text-gray-700">
            <strong>{t('vehiclesSection.maxCapacity')}:</strong> {vehiclesData.maxGroupSize} {t('vehiclesSection.people')}
          </span>
        </div>
      </div>

      {/* Default Vehicle for Selected Tier */}
      {currentTierVehicle && (
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FaCheck className="text-green-600" />
            {t('vehiclesSection.includedVehicle')} ({currentTierVehicle.tierName})
          </h3>

          <VehicleCard
            vehicle={currentTierVehicle.vehicle}
            durationDays={vehiclesData.durationDays}
            getVehicleIcon={getVehicleIcon}
            getComfortLevelColor={getComfortLevelColor}
            isIncluded={true}
            t={t}
          />
        </div>
      )}

      {/* All Default Vehicles by Tier */}
      {!selectedTier && Object.keys(vehiclesData.defaultVehiclesByTier).length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            {t('vehiclesSection.vehiclesByPackage')}
          </h3>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {Object.values(vehiclesData.defaultVehiclesByTier).map((tierData) => (
              <div key={tierData.tierId} className="border-2 border-green-200 rounded-xl overflow-hidden">
                <div className="bg-green-50 px-4 py-2 border-b border-green-200">
                  <span className="font-semibold text-green-800">
                    {tierData.tierName} {t('vehiclesSection.package')}
                  </span>
                  <span className="text-sm text-gray-600 ml-2">
                    ({t('vehiclesSection.includedInPrice')})
                  </span>
                </div>
                <div className="p-4">
                  <VehicleCard
                    vehicle={tierData.vehicle}
                    durationDays={vehiclesData.durationDays}
                    getVehicleIcon={getVehicleIcon}
                    getComfortLevelColor={getComfortLevelColor}
                    isIncluded={true}
                    compact={true}
                    t={t}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Optional Vehicles */}
      {vehiclesData.optionalVehicles && vehiclesData.optionalVehicles.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            {t('vehiclesSection.optionalVehicles')}
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            {t('vehiclesSection.optionalDescription')}
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {vehiclesData.optionalVehicles.map((vehicle) => (
              <VehicleCard
                key={vehicle.id}
                vehicle={vehicle}
                durationDays={vehiclesData.durationDays}
                getVehicleIcon={getVehicleIcon}
                getComfortLevelColor={getComfortLevelColor}
                isIncluded={false}
                t={t}
              />
            ))}
          </div>
        </div>
      )}

      {/* Capacity Info */}
      <div className="mt-8 bg-amber-50 border border-amber-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <FaInfoCircle className="text-amber-600 text-xl mt-1 flex-shrink-0" />
          <div className="text-sm text-gray-700">
            <strong>{t('vehiclesSection.importantNote')}:</strong> {t('vehiclesSection.capacityNote')}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Vehicle Card Component with Image Carousel
const VehicleCard = ({ vehicle, durationDays, getVehicleIcon, getComfortLevelColor, isIncluded, compact, t }) => {
  const IconComponent = getVehicleIcon(vehicle.type);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Use the images array if available, otherwise fall back to single imageUrl
  const images = vehicle.images && vehicle.images.length > 0 ? vehicle.images : [vehicle.imageUrl];
  const hasMultipleImages = images.length > 1;

  const nextImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <motion.div
      whileHover={{ scale: compact ? 1 : 1.02 }}
      className={`bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 ${
        isIncluded ? 'border-2 border-green-400' : 'border border-gray-200 hover:border-blue-400'
      }`}
    >
      {/* Vehicle Image Carousel */}
      {images[0] && !compact && (
        <div className="relative h-64 overflow-hidden group">
          <AnimatePresence mode="wait">
            <motion.img
              key={currentImageIndex}
              src={images[currentImageIndex]}
              alt={`${vehicle.name} - Image ${currentImageIndex + 1}`}
              className="w-full h-full object-cover"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            />
          </AnimatePresence>

          {/* Carousel Controls */}
          {hasMultipleImages && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
                aria-label="Previous image"
              >
                <FaChevronLeft />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
                aria-label="Next image"
              >
                <FaChevronRight />
              </button>

              {/* Dots Indicator */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentImageIndex(index);
                    }}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentImageIndex
                        ? 'bg-white w-4'
                        : 'bg-white/50 hover:bg-white/75'
                    }`}
                    aria-label={`Go to image ${index + 1}`}
                  />
                ))}
              </div>
            </>
          )}

          {/* Badges */}
          {isIncluded && (
            <div className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1 shadow-lg">
              <FaCheck /> {t('vehiclesSection.included')}
            </div>
          )}
          {vehicle.comfortLevel && (
            <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-sm font-semibold shadow-lg ${getComfortLevelColor(vehicle.comfortLevel)}`}>
              {vehicle.comfortLevel}
            </div>
          )}
        </div>
      )}

      {/* Vehicle Details */}
      <div className={compact ? 'p-3' : 'p-5'}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`p-2 bg-blue-100 rounded-lg ${compact ? 'text-xl' : 'text-2xl'}`}>
              <IconComponent className="text-blue-600" />
            </div>
            <div>
              <h4 className={`font-bold text-gray-800 ${compact ? 'text-base' : 'text-lg'}`}>
                {vehicle.name}
              </h4>
              <div className="flex items-center gap-2 mt-1">
                <FaUsers className="text-gray-500 text-sm" />
                <span className="text-sm text-gray-600">
                  {t('vehiclesSection.capacity')}: {vehicle.capacity} {t('vehiclesSection.people')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        {vehicle.description && !compact && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {vehicle.description}
          </p>
        )}

        {/* Features */}
        {vehicle.features && vehicle.features.length > 0 && (
          <div className="mb-3">
            <div className={`flex flex-wrap gap-2 ${compact ? 'text-xs' : 'text-sm'}`}>
              {vehicle.features.slice(0, compact ? 3 : 4).map((feature, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full flex items-center gap-1"
                >
                  <FaCheck className="text-green-600 text-xs" />
                  {feature}
                </span>
              ))}
              {vehicle.features.length > (compact ? 3 : 4) && (
                <span className="px-2 py-1 text-gray-500">
                  +{vehicle.features.length - (compact ? 3 : 4)} {t('vehiclesSection.more')}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Pricing with Currency Conversion */}
        <div className={`pt-3 border-t border-gray-200 ${compact ? 'text-sm' : ''}`}>
          {isIncluded ? (
            <div className="text-center">
              <span className="text-green-600 font-bold text-lg flex items-center justify-center gap-2">
                <FaCheck /> {t('vehiclesSection.includedInPackage')}
              </span>
              <span className="text-xs text-gray-500 block mt-1">
                {t('vehiclesSection.noAdditionalCost')}
              </span>
            </div>
          ) : (
            <div className="text-center">
              <div className="text-xs text-gray-500 mb-1">
                <Price priceINR={vehicle.basePriceINR} className="inline" /> × {durationDays} {t('vehiclesSection.days')}
              </div>
              <div className="text-lg font-bold text-blue-600">
                <Price priceINR={vehicle.totalPrice} size="lg" />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {t('vehiclesSection.selectOnBookingPage')}
              </p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default VehiclesSection;
