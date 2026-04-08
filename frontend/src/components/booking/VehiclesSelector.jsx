import React from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCar,
  faBus,
  faVanShuttle,
  faPlus,
  faMinus,
  faInfoCircle,
  faUsers,
  faCheck
} from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';
import Price from '../common/Price';

/**
 * VehiclesSelector Component
 *
 * Permet de sélectionner des véhicules avec quantité
 * Affiche les véhicules disponibles avec capacité et prix
 * Calcul automatique du prix total
 * Validation de capacité vs nombre de participants
 *
 * @param {Array} vehicles - Liste des véhicules disponibles depuis l'API
 * @param {Array} selectedVehicles - [{vehicle_id, quantity}, ...]
 * @param {Function} onChange - Callback: (newSelectedVehicles) => void
 * @param {Number} numParticipants - Nombre total de participants
 */
const VehiclesSelector = ({ vehicles = [], selectedVehicles = [], onChange, numParticipants = 0 }) => {
  const { t } = useTranslation();

  // Obtenir la quantité actuelle d'un véhicule
  const getVehicleQuantity = (vehicleId) => {
    const vehicle = selectedVehicles.find(v => v.vehicle_id === vehicleId);
    return vehicle ? vehicle.quantity : 0;
  };

  // Mettre à jour la quantité d'un véhicule
  const updateVehicleQuantity = (vehicleId, delta) => {
    const currentQty = getVehicleQuantity(vehicleId);
    const newQty = Math.max(0, currentQty + delta);

    let newSelection;

    if (newQty === 0) {
      // Retirer le véhicule
      newSelection = selectedVehicles.filter(v => v.vehicle_id !== vehicleId);
    } else {
      const existingIndex = selectedVehicles.findIndex(v => v.vehicle_id === vehicleId);

      if (existingIndex >= 0) {
        // Mettre à jour la quantité
        newSelection = [...selectedVehicles];
        newSelection[existingIndex] = { vehicle_id: vehicleId, quantity: newQty };
      } else {
        // Ajouter le véhicule
        newSelection = [...selectedVehicles, { vehicle_id: vehicleId, quantity: newQty }];
      }
    }

    onChange(newSelection);
  };

  // Calculer le prix total des véhicules
  const calculateTotalPrice = () => {
    return selectedVehicles.reduce((total, selectedVehicle) => {
      const vehicle = vehicles.find(v => v.id === selectedVehicle.vehicle_id);
      if (vehicle) {
        // vehicle.totalPrice includes duration calculation (base_price_inr × duration_days)
        return total + (parseFloat(vehicle.totalPrice || 0) * selectedVehicle.quantity);
      }
      return total;
    }, 0);
  };

  // Calculer la capacité totale des véhicules sélectionnés
  const calculateTotalCapacity = () => {
    return selectedVehicles.reduce((total, selectedVehicle) => {
      const vehicle = vehicles.find(v => v.id === selectedVehicle.vehicle_id);
      if (vehicle && vehicle.capacity) {
        return total + (parseInt(vehicle.capacity) * selectedVehicle.quantity);
      }
      return total;
    }, 0);
  };

  // Vérifier si la capacité est suffisante
  const totalCapacity = calculateTotalCapacity();
  const hasInsufficientCapacity = selectedVehicles.length > 0 && numParticipants > 0 && totalCapacity < numParticipants;
  const hasSufficientCapacity = selectedVehicles.length > 0 && numParticipants > 0 && totalCapacity >= numParticipants;

  // Obtenir l'icône appropriée selon le type de véhicule
  const getVehicleIcon = (type) => {
    const typeLower = (type || '').toLowerCase();

    if (typeLower.includes('bus')) {
      return faBus;
    } else if (typeLower.includes('van') || typeLower.includes('shuttle')) {
      return faVanShuttle;
    } else {
      return faCar;
    }
  };

  // Vehicle Card
  const VehicleCard = ({ vehicle }) => {
    const quantity = getVehicleQuantity(vehicle.id);
    const isSelected = quantity > 0;
    const icon = getVehicleIcon(vehicle.type);

    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        className={`rounded-xl p-5 transition-all duration-300 border-2 ${
          isSelected
            ? 'border-primary bg-primary/5 shadow-md'
            : 'border-gray-200 bg-white hover:border-primary/30'
        }`}
      >
        {/* Header avec icône et nom */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start">
            {/* Icône du véhicule */}
            <div
              className={`flex-shrink-0 w-14 h-14 rounded-lg flex items-center justify-center mr-4 ${
                isSelected ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'
              }`}
            >
              <FontAwesomeIcon icon={icon} className="text-2xl" />
            </div>

            {/* Nom et type */}
            <div>
              <h4 className={`font-bold text-base mb-1 ${isSelected ? 'text-primary' : 'text-gray-800'}`}>
                {vehicle.name}
              </h4>
              {vehicle.type && (
                <div className="text-xs text-gray-500 mb-2">
                  {vehicle.type}
                </div>
              )}

              {/* Capacité */}
              {vehicle.capacity && (
                <div className="flex items-center text-sm text-gray-600">
                  <FontAwesomeIcon icon={faUsers} className="mr-1 text-primary" />
                  <span>
                    {t('booking.capacity')}: {vehicle.capacity} {t('booking.people')}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        {vehicle.description && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {vehicle.description}
          </p>
        )}

        {/* Features/amenities */}
        {vehicle.features && vehicle.features.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              {vehicle.features.slice(0, 3).map((feature, index) => (
                <span
                  key={index}
                  className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full"
                >
                  {feature}
                </span>
              ))}
              {vehicle.features.length > 3 && (
                <span className="text-xs text-gray-500">
                  +{vehicle.features.length - 3} {t('booking.more')}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Prix et contrôles de quantité */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          {/* Prix */}
          <div>
            <Price
              priceINR={vehicle.totalPrice}
              size="md"
              className={`font-bold ${isSelected ? 'text-primary' : 'text-gray-800'}`}
            />
            <div className="text-xs text-gray-500">
              {t('vehiclesSection.tourDuration')}
            </div>
          </div>

          {/* Contrôles de quantité */}
          <div className="flex items-center space-x-3">
            {/* Bouton - */}
            <button
              onClick={() => updateVehicleQuantity(vehicle.id, -1)}
              disabled={quantity === 0}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                quantity === 0
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-red-100 text-red-600 hover:bg-red-200'
              }`}
            >
              <FontAwesomeIcon icon={faMinus} className="text-sm" />
            </button>

            {/* Quantité */}
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg ${
                quantity > 0 ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'
              }`}
            >
              {quantity}
            </div>

            {/* Bouton + */}
            <button
              onClick={() => updateVehicleQuantity(vehicle.id, 1)}
              className="w-8 h-8 rounded-lg bg-green-100 text-green-600 hover:bg-green-200 flex items-center justify-center transition-colors"
            >
              <FontAwesomeIcon icon={faPlus} className="text-sm" />
            </button>
          </div>
        </div>

        {/* Sous-total si quantité > 0 */}
        {quantity > 0 && (
          <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-2 flex items-center justify-between">
            <span className="text-xs text-blue-800">
              {quantity} × {vehicle.name}
            </span>
            <Price
              priceINR={vehicle.totalPrice * quantity}
              size="sm"
              className="font-bold text-blue-800"
            />
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="bg-white rounded-xl shadow-md p-6 border border-gray-100"
    >
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-800 flex items-center">
          <FontAwesomeIcon icon={faCar} className="mr-3 text-primary" />
          {t('booking.vehicles')}
        </h3>
        <p className="text-sm text-gray-600 mt-2">
          {t('booking.vehiclesDescription')}
        </p>
      </div>

      {/* Liste des véhicules */}
      {vehicles.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-400 text-4xl mb-3">
            <FontAwesomeIcon icon={faInfoCircle} />
          </div>
          <p className="text-gray-600">
            {t('booking.noVehiclesAvailable')}
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-4 mb-6">
            {vehicles.map(vehicle => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} />
            ))}
          </div>

          {/* Résumé de la sélection */}
          {selectedVehicles.length > 0 && (
            <>
              <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm">
                    <FontAwesomeIcon icon={faCheck} className="text-blue-600 mr-2" />
                    <span className="font-medium text-blue-800">
                      {selectedVehicles.reduce((sum, v) => sum + v.quantity, 0)}{' '}
                      {t('booking.vehiclesSelected')}
                    </span>
                  </div>

                  <div className="text-right">
                    <div className="text-xs text-blue-600 mb-1">
                      {t('booking.vehiclesTotal')}
                    </div>
                    <Price
                      priceINR={calculateTotalPrice()}
                      size="lg"
                      className="font-bold text-blue-800"
                    />
                  </div>
                </div>
              </div>

              {/* Validation de capacité */}
              {numParticipants > 0 && (
                <>
                  {hasInsufficientCapacity && (
                    <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-start">
                        <FontAwesomeIcon icon={faInfoCircle} className="text-red-600 mr-3 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="font-medium text-red-800 mb-1">
                            {t('booking.insufficientCapacity')}
                          </div>
                          <div className="text-sm text-red-700">
                            {t('booking.capacityInfo', {
                              current: totalCapacity,
                              required: numParticipants
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {hasSufficientCapacity && (
                    <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-start">
                        <FontAwesomeIcon icon={faCheck} className="text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="font-medium text-green-800 mb-1">
                            {t('booking.sufficientCapacity')}
                          </div>
                          <div className="text-sm text-green-700">
                            {t('booking.capacityConfirmed', {
                              capacity: totalCapacity,
                              participants: numParticipants
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </>
          )}

          {/* Info badge */}
          <div className="mt-4 flex items-start text-xs text-gray-600">
            <FontAwesomeIcon icon={faInfoCircle} className="mr-2 mt-0.5 flex-shrink-0 text-gray-400" />
            <span>
              {t('booking.vehiclesOptionalInfo')}
            </span>
          </div>
        </>
      )}
    </motion.div>
  );
};

export default VehiclesSelector;
