import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus,
  faMinus,
  faCheck,
  faInfoCircle,
  faSpa,
  faUtensils,
  faCamera,
  faGift,
  faUser,
  faCar
} from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';
import Price from '../common/Price';

/**
 * AddonsSelector Component - Updated to support quantities and per-person pricing
 *
 * Affiche la liste des add-ons disponibles pour le tour
 * Permet de sélectionner des quantités pour chaque add-on
 * Respecte les contraintes max_quantity de chaque addon
 * Supporte les prix par personne et les prix fixes
 *
 * @param {Array} addons - Liste des add-ons disponibles depuis l'API
 * @param {Object} selectedAddons - Objet {addonId: quantity}
 * @param {Function} onChange - Callback: (newSelectedAddons) => void
 * @param {Number} numAdults - Nombre d'adultes
 * @param {Number} numChildren - Nombre d'enfants
 */
const AddonsSelector = ({ addons = [], selectedAddons = {}, onChange, numAdults = 0, numChildren = 0 }) => {
  const { t } = useTranslation();
  const [expandedAddon, setExpandedAddon] = useState(null);
  const totalParticipants = numAdults + numChildren;

  // Obtenir la quantité actuelle d'un addon
  const getQuantity = (addonId) => {
    return selectedAddons[addonId] || 0;
  };

  // Mettre à jour la quantité d'un addon
  const updateQuantity = (addonId, newQuantity, maxQuantity) => {
    const newSelectedAddons = { ...selectedAddons };

    // Appliquer les limites
    let finalQuantity = Math.max(0, newQuantity);

    // Respecter max_quantity si défini
    if (maxQuantity !== null && maxQuantity !== undefined) {
      finalQuantity = Math.min(finalQuantity, maxQuantity);
    }

    if (finalQuantity === 0) {
      // Retirer l'addon si quantité = 0
      delete newSelectedAddons[addonId];
    } else {
      newSelectedAddons[addonId] = finalQuantity;
    }

    onChange(newSelectedAddons);
  };

  // Calculer le prix d'un addon (avec ou sans multiplication par participants)
  const calculateAddonPrice = (addon, quantity) => {
    const price = parseFloat(addon.price || 0);
    const pricePerPerson = addon.price_per_person !== false; // Default to true

    if (pricePerPerson && totalParticipants > 0) {
      return price * quantity * totalParticipants;
    } else {
      return price * quantity;
    }
  };

  // Calculer le prix total des addons sélectionnés
  const calculateTotalPrice = () => {
    return addons.reduce((total, addon) => {
      const quantity = getQuantity(addon.id);
      return total + calculateAddonPrice(addon, quantity);
    }, 0);
  };

  // Obtenir le nombre total d'items sélectionnés
  const getTotalItems = () => {
    return Object.values(selectedAddons).reduce((sum, qty) => sum + qty, 0);
  };

  // Obtenir l'icône appropriée pour un addon selon sa catégorie
  const getAddonIcon = (category) => {
    const categoryLower = (category || '').toLowerCase();

    if (categoryLower.includes('spa') || categoryLower.includes('wellness')) {
      return faSpa;
    } else if (categoryLower.includes('food') || categoryLower.includes('dining') || categoryLower.includes('meal')) {
      return faUtensils;
    } else if (categoryLower.includes('photo') || categoryLower.includes('camera')) {
      return faCamera;
    } else if (categoryLower.includes('guide')) {
      return faUser;
    } else if (categoryLower.includes('transport') || categoryLower.includes('transfer')) {
      return faCar;
    } else {
      return faGift;
    }
  };

  // Addon Card individuelle avec contrôles de quantité
  const AddonCard = ({ addon }) => {
    const quantity = getQuantity(addon.id);
    const isExpanded = expandedAddon === addon.id;
    const icon = getAddonIcon(addon.category);
    const maxQuantity = addon.max_quantity;
    const isMaxReached = maxQuantity !== null && maxQuantity !== undefined && quantity >= maxQuantity;

    return (
      <motion.div
        whileHover={{ scale: 1.01 }}
        className={`relative rounded-xl p-4 transition-all duration-300 border-2 ${
          quantity > 0
            ? 'border-primary bg-primary/5 shadow-md'
            : 'border-gray-200 bg-white'
        }`}
      >
        {/* Contenu principal */}
        <div className="flex items-start mb-4">
          {/* Icône */}
          <div
            className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center mr-4 ${
              quantity > 0 ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'
            }`}
          >
            <FontAwesomeIcon icon={icon} className="text-xl" />
          </div>

          {/* Détails */}
          <div className="flex-1">
            <h4 className={`font-bold text-base mb-1 ${quantity > 0 ? 'text-primary' : 'text-gray-800'}`}>
              {addon.name}
            </h4>

            {/* Catégorie */}
            {addon.category && (
              <div className="text-xs text-gray-500 mb-2">
                {addon.category}
              </div>
            )}

            {/* Description courte */}
            {addon.description && (
              <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                {addon.description}
              </p>
            )}

            {/* Prix */}
            <div className="mt-2">
              <Price
                priceINR={addon.price}
                size="sm"
                className={`font-bold ${quantity > 0 ? 'text-primary' : 'text-gray-800'}`}
              />
              <span className="text-xs text-gray-500 ml-1">
                {t('booking.perPerson')}
              </span>
            </div>

            {/* Max quantity info */}
            {maxQuantity !== null && maxQuantity !== undefined && (
              <div className="mt-2 text-xs text-gray-600">
                {t('booking.maxQuantity')}: {maxQuantity}
              </div>
            )}
          </div>
        </div>

        {/* Contrôles de quantité */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => updateQuantity(addon.id, quantity - 1, maxQuantity)}
              disabled={quantity === 0}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                quantity > 0
                  ? 'bg-red-100 text-red-600 hover:bg-red-200'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              <FontAwesomeIcon icon={faMinus} className="w-4 h-4" />
            </button>

            <div className="w-16 h-10 flex items-center justify-center text-lg font-bold bg-primary bg-opacity-10 rounded-lg relative">
              {quantity}
              {quantity > 0 && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                  <FontAwesomeIcon
                    icon={faCheck}
                    className="w-2 h-2 text-white"
                  />
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => updateQuantity(addon.id, quantity + 1, maxQuantity)}
              disabled={isMaxReached}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                isMaxReached
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-green-100 text-green-600 hover:bg-green-200'
              }`}
            >
              <FontAwesomeIcon icon={faPlus} className="w-4 h-4" />
            </button>
          </div>

          {/* Bouton pour voir plus de détails */}
          {addon.details && (
            <button
              onClick={() => setExpandedAddon(isExpanded ? null : addon.id)}
              className="text-xs text-primary hover:text-primary-dark font-medium flex items-center"
            >
              {isExpanded ? (
                <>
                  <FontAwesomeIcon icon={faMinus} className="mr-1" />
                  {t('booking.showLess')}
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faPlus} className="mr-1" />
                  {t('booking.showMore')}
                </>
              )}
            </button>
          )}
        </div>

        {/* Message si max atteint */}
        {isMaxReached && (
          <div className="mt-2 text-xs text-orange-600 font-medium">
            {t('booking.maxQuantityReached')}
          </div>
        )}

        {/* Sous-total pour cet addon si quantité > 0 */}
        {quantity > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                {quantity} × <Price priceINR={addon.price} size="sm" className="inline" />
                {addon.price_per_person !== false && totalParticipants > 0 && (
                  <span className="text-xs text-blue-600 ml-1">× {totalParticipants} {t('booking.participants')}</span>
                )}
              </span>
              <Price
                priceINR={calculateAddonPrice(addon, quantity)}
                size="md"
                className="font-bold text-primary"
              />
            </div>
            {addon.price_per_person !== false && totalParticipants > 0 && (
              <div className="text-xs text-blue-600 mt-1">
                {t('booking.pricePerPerson')}
              </div>
            )}
            {addon.price_per_person === false && (
              <div className="text-xs text-gray-500 mt-1">
                {t('booking.fixedPrice')}
              </div>
            )}
          </div>
        )}

        {/* Détails expandables */}
        <AnimatePresence>
          {isExpanded && addon.details && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="text-sm text-gray-700">{addon.details}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  const totalItems = getTotalItems();
  const totalPrice = calculateTotalPrice();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="bg-white rounded-xl shadow-md p-6 border border-gray-100"
    >
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-800 flex items-center">
          <FontAwesomeIcon icon={faGift} className="mr-3 text-primary" />
          {t('booking.addons')}
        </h3>
        <p className="text-sm text-gray-600 mt-2">
          {t('booking.addonsDescriptionWithQuantity')}
        </p>
      </div>

      {/* Liste des add-ons */}
      {addons.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-400 text-4xl mb-3">
            <FontAwesomeIcon icon={faInfoCircle} />
          </div>
          <p className="text-gray-600">
            {t('booking.noAddonsAvailable')}
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-4 mb-6">
            {addons.map(addon => (
              <AddonCard key={addon.id} addon={addon} />
            ))}
          </div>

          {/* Résumé de la sélection */}
          {totalItems > 0 && (
            <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center text-sm">
                  <FontAwesomeIcon icon={faCheck} className="text-blue-600 mr-2" />
                  <span className="font-medium text-blue-800">
                    {totalItems} {totalItems === 1 ? t('booking.addonSelected') : t('booking.addonsSelected')}
                  </span>
                </div>

                <div className="text-right">
                  <div className="text-xs text-blue-600 mb-1">
                    {t('booking.addonsTotal')}
                  </div>
                  <Price
                    priceINR={totalPrice}
                    size="lg"
                    className="font-bold text-blue-800"
                  />
                </div>
              </div>

              {/* Liste des items sélectionnés */}
              <div className="space-y-2 pt-3 border-t border-blue-200">
                {addons
                  .filter(addon => getQuantity(addon.id) > 0)
                  .map(addon => {
                    const qty = getQuantity(addon.id);
                    return (
                      <div key={addon.id} className="flex items-center justify-between text-sm">
                        <span className="text-blue-900">
                          {qty}× {addon.name}
                          {addon.price_per_person !== false && totalParticipants > 0 && (
                            <span className="text-xs text-blue-600 ml-1">(per person)</span>
                          )}
                        </span>
                        <Price
                          priceINR={calculateAddonPrice(addon, qty)}
                          size="sm"
                          className="font-semibold text-blue-800"
                        />
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* Info badge */}
          <div className="mt-4 flex items-start text-xs text-gray-600">
            <FontAwesomeIcon icon={faInfoCircle} className="mr-2 mt-0.5 flex-shrink-0 text-gray-400" />
            <span>
              {t('booking.addonsOptionalInfo')}
            </span>
          </div>
        </>
      )}
    </motion.div>
  );
};

export default AddonsSelector;
