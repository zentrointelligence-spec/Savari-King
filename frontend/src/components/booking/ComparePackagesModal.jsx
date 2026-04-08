import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTimes,
  faCheck,
  faStar,
  faHotel
} from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';
import Price from '../common/Price';

/**
 * ComparePackagesModal Component
 *
 * Modal de comparaison côte à côte des 3 tiers (Standard, Premium, Luxury)
 * Affiche les prix, types d'hôtel, inclusions et exclusions
 * Permet de sélectionner un tier depuis la modal
 *
 * @param {Boolean} isOpen - La modal est-elle ouverte?
 * @param {Function} onClose - Callback pour fermer la modal
 * @param {Array} tiers - Liste des 3 tiers triés par prix
 * @param {Object} selectedTier - Tier actuellement sélectionné
 * @param {Function} onSelectTier - Callback: (tier) => void
 */
const ComparePackagesModal = ({ isOpen, onClose, tiers = [], selectedTier, onSelectTier }) => {
  const { t } = useTranslation();

  // Trier les tiers par prix
  const sortedTiers = [...tiers].sort((a, b) => a.price - b.price);

  // Déterminer si un tier est populaire
  const isPopular = (tier) => {
    return tier.tier_name === 'Premium' || tier.name === 'Premium';
  };

  // Sélectionner un tier et fermer la modal
  const handleSelectTier = (tier) => {
    onSelectTier(tier);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          >
            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-primary to-blue-600 text-white p-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">
                    {t('booking.comparePackages')}
                  </h2>
                  <p className="text-sm opacity-90 mt-1">
                    {t('booking.compareDescription')}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                >
                  <FontAwesomeIcon icon={faTimes} className="text-xl" />
                </button>
              </div>

              {/* Content - Scrollable */}
              <div className="overflow-y-auto max-h-[calc(90vh-120px)] p-6">
                {/* Desktop: Grid de 3 colonnes */}
                <div className="hidden md:grid md:grid-cols-3 gap-6">
                  {sortedTiers.map((tier) => {
                    const isSelected = selectedTier?.id === tier.id;
                    const tierIsPopular = isPopular(tier);

                    return (
                      <div
                        key={tier.id}
                        className={`relative rounded-xl border-2 p-6 transition-all ${
                          isSelected
                            ? 'border-primary shadow-lg'
                            : tierIsPopular
                            ? 'border-primary/50'
                            : 'border-gray-200'
                        }`}
                      >
                        {/* Badge Most Popular */}
                        {tierIsPopular && (
                          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                            <span className="bg-gradient-to-r from-primary to-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md flex items-center">
                              <FontAwesomeIcon icon={faStar} className="mr-1" />
                              {t('tiers.mostPopular')}
                            </span>
                          </div>
                        )}

                        {/* Header */}
                        <div className="text-center mb-6 pb-6 border-b border-gray-200">
                          <h3 className="text-2xl font-bold text-gray-800 mb-3">
                            {tier.tier_name || tier.name}
                          </h3>

                          {/* Prix */}
                          <Price
                            priceINR={tier.price}
                            size="2xl"
                            className="text-primary font-bold"
                          />
                          <div className="text-sm text-gray-500 mt-1">
                            {t('tours.perPerson')}
                          </div>

                          {/* Type d'hôtel */}
                          {tier.hotel_type && (
                            <div className="mt-4 flex items-center justify-center text-sm text-gray-600">
                              <FontAwesomeIcon icon={faHotel} className="mr-2" />
                              {tier.hotel_type}
                            </div>
                          )}
                        </div>

                        {/* Inclusions */}
                        <div className="mb-6">
                          <h4 className="font-bold text-sm text-gray-700 mb-3">
                            {t('tiers.whatsIncluded')}
                          </h4>
                          {tier.inclusions_summary && tier.inclusions_summary.length > 0 ? (
                            <ul className="space-y-2">
                              {tier.inclusions_summary.map((inclusion, idx) => (
                                <li key={idx} className="flex items-start text-sm">
                                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center mr-2 mt-0.5">
                                    <FontAwesomeIcon icon={faCheck} className="text-xs" />
                                  </div>
                                  <span className="text-gray-700">{inclusion}</span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-sm text-gray-500 italic">
                              {t('tiers.noInclusionsListed')}
                            </p>
                          )}
                        </div>

                        {/* Bouton de sélection */}
                        <button
                          onClick={() => handleSelectTier(tier)}
                          className={`w-full py-3 px-4 rounded-lg font-bold transition-all ${
                            isSelected
                              ? 'bg-primary text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-primary hover:text-white'
                          }`}
                        >
                          {isSelected ? (
                            <>
                              <FontAwesomeIcon icon={faCheck} className="mr-2" />
                              {t('tiers.selected')}
                            </>
                          ) : (
                            t('tiers.selectPackage')
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Mobile: Accordéon vertical */}
                <div className="md:hidden space-y-4">
                  {sortedTiers.map((tier) => {
                    const isSelected = selectedTier?.id === tier.id;
                    const tierIsPopular = isPopular(tier);

                    return (
                      <div
                        key={tier.id}
                        className={`relative rounded-xl border-2 p-5 ${
                          isSelected
                            ? 'border-primary shadow-lg'
                            : tierIsPopular
                            ? 'border-primary/50'
                            : 'border-gray-200'
                        }`}
                      >
                        {/* Badge Most Popular */}
                        {tierIsPopular && (
                          <div className="absolute -top-3 left-4">
                            <span className="bg-gradient-to-r from-primary to-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                              ⭐ {t('tiers.mostPopular')}
                            </span>
                          </div>
                        )}

                        {/* Header compact */}
                        <div className="mb-4 pb-4 border-b border-gray-200">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="text-xl font-bold text-gray-800">
                                {tier.tier_name || tier.name}
                              </h3>
                              {tier.hotel_type && (
                                <div className="text-xs text-gray-600 mt-1 flex items-center">
                                  <FontAwesomeIcon icon={faHotel} className="mr-1" />
                                  {tier.hotel_type}
                                </div>
                              )}
                            </div>
                            <div className="text-right">
                              <Price
                                priceINR={tier.price}
                                size="lg"
                                className="text-primary font-bold"
                              />
                              <div className="text-xs text-gray-500">
                                {t('tours.perPerson')}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Inclusions limitées */}
                        {tier.inclusions_summary && tier.inclusions_summary.length > 0 && (
                          <div className="mb-4">
                            <h4 className="font-bold text-xs text-gray-700 mb-2 uppercase">
                              {t('tiers.includes')}
                            </h4>
                            <ul className="space-y-1">
                              {tier.inclusions_summary.slice(0, 4).map((inclusion, idx) => (
                                <li key={idx} className="flex items-start text-xs">
                                  <FontAwesomeIcon
                                    icon={faCheck}
                                    className="text-green-600 mr-2 mt-0.5 flex-shrink-0"
                                  />
                                  <span className="text-gray-700">{inclusion}</span>
                                </li>
                              ))}
                              {tier.inclusions_summary.length > 4 && (
                                <li className="text-xs text-gray-500 italic ml-5">
                                  + {tier.inclusions_summary.length - 4} {t('tiers.more')}
                                </li>
                              )}
                            </ul>
                          </div>
                        )}

                        {/* Bouton */}
                        <button
                          onClick={() => handleSelectTier(tier)}
                          className={`w-full py-2 px-4 rounded-lg font-medium text-sm transition-all ${
                            isSelected
                              ? 'bg-primary text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-primary hover:text-white'
                          }`}
                        >
                          {isSelected ? (
                            <>
                              <FontAwesomeIcon icon={faCheck} className="mr-1" />
                              {t('tiers.selected')}
                            </>
                          ) : (
                            t('tiers.select')
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-gray-200 p-4 bg-gray-50 flex justify-end">
                <button
                  onClick={onClose}
                  className="px-6 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 font-medium transition-colors"
                >
                  {t('common.close')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ComparePackagesModal;
