import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCheck,
  faChevronDown,
  faChevronUp,
  faStar,
  faHotel
} from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';
import { useCurrency } from '../../hooks/useCurrency';
import Price from '../common/Price';

/**
 * TierSelector Component
 *
 * Affiche les 3 tiers (Standard, Premium, Luxury) sous forme de tabs/cards interactives
 * Permet de changer de tier sans quitter la page
 *
 * @param {Array} tiers - Liste des tiers disponibles
 * @param {Object} selectedTier - Tier actuellement sélectionné
 * @param {Function} onTierChange - Callback appelé lors du changement de tier
 * @param {Boolean} compact - Mode d'affichage compact (optionnel)
 */
const TierSelector = ({ tiers, selectedTier, onTierChange, compact = false }) => {
  const { t } = useTranslation();
  const [expandedDetails, setExpandedDetails] = useState(false);

  // Trier les tiers par prix (Standard -> Premium -> Luxury)
  const sortedTiers = [...tiers].sort((a, b) => a.price - b.price);

  // Déterminer si un tier est populaire
  const isPopular = (tier) => {
    return tier.tier_name === 'Premium' || tier.name === 'Premium';
  };

  // Card de tier individuelle
  const TierCard = ({ tier, isSelected }) => {
    const tierIsPopular = isPopular(tier);

    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => onTierChange(tier)}
        className={`relative cursor-pointer rounded-xl p-6 transition-all duration-300 border-2 ${
          isSelected
            ? 'border-primary bg-primary/5 shadow-lg'
            : tierIsPopular
            ? 'border-primary/50 bg-white'
            : 'border-gray-200 bg-white hover:border-primary/30'
        }`}
      >
        {/* Badge "Most Popular" */}
        {tierIsPopular && (
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
            <span className="bg-gradient-to-r from-primary to-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md flex items-center">
              <FontAwesomeIcon icon={faStar} className="mr-1" />
              {t('tiers.mostPopular')}
            </span>
          </div>
        )}

        {/* Checkmark si sélectionné */}
        {isSelected && (
          <div className="absolute top-4 right-4">
            <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center">
              <FontAwesomeIcon icon={faCheck} className="text-xs" />
            </div>
          </div>
        )}

        {/* Contenu */}
        <div className="text-center">
          {/* Nom du tier */}
          <h3 className={`text-xl font-bold mb-2 ${
            isSelected ? 'text-primary' : 'text-gray-800'
          }`}>
            {tier.tier_name || tier.name}
          </h3>

          {/* Prix */}
          <div className="mb-3">
            <Price
              priceINR={tier.price}
              size="2xl"
              className={isSelected ? 'text-primary' : 'text-gray-800'}
            />
            <span className="text-sm text-gray-500 block mt-1">
              {t('tours.perPerson')}
            </span>
          </div>

          {/* Type d'hôtel */}
          {tier.hotel_type && (
            <div className="flex items-center justify-center text-sm text-gray-600 mb-4">
              <FontAwesomeIcon icon={faHotel} className="mr-2" />
              <span>{tier.hotel_type}</span>
            </div>
          )}

          {/* Bouton de sélection */}
          {!isSelected && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onTierChange(tier);
              }}
              className="w-full py-2 px-4 rounded-lg font-medium transition-colors text-sm bg-gray-100 text-gray-700 hover:bg-primary hover:text-white"
            >
              {t('tiers.selectPackage')}
            </button>
          )}

          {isSelected && (
            <div className="w-full py-2 px-4 rounded-lg font-medium text-sm bg-primary text-white">
              {t('tiers.selected')}
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  // Dropdown mobile
  const TierDropdown = () => {
    const { convertAndFormat } = useCurrency();

    return (
      <div className="md:hidden">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('tiers.selectYourPackage')}
        </label>
        <select
          value={selectedTier?.id || ''}
          onChange={(e) => {
            const tier = tiers.find(t => t.id === parseInt(e.target.value));
            if (tier) onTierChange(tier);
          }}
          className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none"
        >
          {sortedTiers.map(tier => (
            <option key={tier.id} value={tier.id}>
              {tier.tier_name || tier.name} - {convertAndFormat(tier.price)}
              {isPopular(tier) ? ' ⭐' : ''}
            </option>
          ))}
        </select>
      </div>
    );
  };

  // Détails du tier sélectionné
  const TierDetails = () => {
    if (!selectedTier) return null;

    const inclusions = selectedTier.inclusions_summary || [];
    const displayInclusions = Array.isArray(inclusions) ? inclusions : [];

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mt-6 bg-gray-50 rounded-xl p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-bold text-gray-800">
            {t('tiers.packageDetails')}: {selectedTier.tier_name || selectedTier.name}
          </h4>
          <button
            onClick={() => setExpandedDetails(!expandedDetails)}
            className="text-primary hover:text-primary-dark transition-colors"
          >
            <FontAwesomeIcon icon={expandedDetails ? faChevronUp : faChevronDown} />
          </button>
        </div>

        <AnimatePresence>
          {expandedDetails && displayInclusions.length > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="space-y-2 pt-2 border-t border-gray-200">
                {displayInclusions.slice(0, 6).map((inclusion, index) => (
                  <div key={index} className="flex items-start text-sm">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center mr-3 mt-0.5">
                      <FontAwesomeIcon icon={faCheck} className="text-xs" />
                    </div>
                    <span className="text-gray-700">{inclusion}</span>
                  </div>
                ))}
                {displayInclusions.length > 6 && (
                  <p className="text-sm text-gray-500 italic mt-2">
                    + {displayInclusions.length - 6} {t('tiers.moreInclusions')}
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!expandedDetails && displayInclusions.length > 0 && (
          <p className="text-sm text-gray-500 mt-2">
            {displayInclusions.length} {t('tiers.inclusionsIncluded')}
          </p>
        )}
      </motion.div>
    );
  };

  return (
    <div className="tier-selector">
      {/* Desktop: Grid de 3 cards */}
      <div className="hidden md:grid md:grid-cols-3 gap-6 mb-6">
        {sortedTiers.map(tier => (
          <TierCard
            key={tier.id}
            tier={tier}
            isSelected={selectedTier?.id === tier.id}
          />
        ))}
      </div>

      {/* Mobile: Dropdown */}
      <TierDropdown />

      {/* Détails du tier sélectionné */}
      <TierDetails />
    </div>
  );
};

export default TierSelector;
