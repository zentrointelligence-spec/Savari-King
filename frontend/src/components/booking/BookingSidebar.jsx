import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCalendarAlt,
  faUsers,
  faInfoCircle,
  faArrowRight
} from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';
import Price from '../common/Price';
import { motion } from 'framer-motion';

/**
 * BookingSidebar Component
 *
 * Sidebar sticky qui affiche le résumé de la réservation en temps réel
 * Calcule et affiche le prix total automatiquement
 * Contient le bouton de soumission principal
 *
 * @param {Object} tour - Données du tour
 * @param {Object} selectedTier - Tier sélectionné
 * @param {Object} formData - Données du formulaire
 * @param {Object} calculatedPrice - Prix calculé en temps réel {base, addons, vehicles, total}
 * @param {Function} onSubmit - Callback de soumission
 * @param {Boolean} isFormValid - Le formulaire est-il valide?
 * @param {Function} onCompare - Callback pour ouvrir la modal de comparaison
 */
const BookingSidebar = ({
  tour,
  selectedTier,
  formData,
  calculatedPrice,
  onSubmit,
  isFormValid,
  onCompare
}) => {
  const { t } = useTranslation();

  // Formater une date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto lg:overflow-x-hidden custom-scrollbar">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-blue-600 text-white p-6">
          <h3 className="text-xl font-bold flex items-center">
            <span className="mr-2">📦</span>
            {t('booking.yourReservation')}
          </h3>
        </div>

        {/* Tour Info */}
        <div className="p-6 border-b border-gray-100">
          {tour?.main_image_url && (
            <img
              src={tour.main_image_url}
              alt={tour.name}
              className="w-full h-32 object-cover rounded-lg mb-4"
            />
          )}
          <h4 className="font-bold text-lg text-gray-800 line-clamp-2">
            {tour?.name}
          </h4>
        </div>

        {/* Selected Package */}
        {selectedTier && (
          <div className="p-6 border-b border-gray-100">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-xs text-gray-600 uppercase tracking-wide mb-1">
                {t('booking.selectedPackage')}
              </div>
              <div className="font-bold text-lg text-primary">
                {selectedTier.tier_name || selectedTier.name}
              </div>
              {selectedTier.hotel_type && (
                <div className="text-sm text-gray-600 mt-1">
                  {selectedTier.hotel_type}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Travel Details Summary */}
        <div className="p-6 border-b border-gray-100 space-y-3">
          {formData.travel_date && (
            <div className="flex items-center text-sm">
              <FontAwesomeIcon icon={faCalendarAlt} className="text-primary mr-3 w-5" />
              <div>
                <div className="text-xs text-gray-500">{t('booking.travelDate')}</div>
                <div className="font-medium text-gray-800">{formatDate(formData.travel_date)}</div>
              </div>
            </div>
          )}

          {formData.num_participants > 0 && (
            <div className="flex items-center text-sm">
              <FontAwesomeIcon icon={faUsers} className="text-primary mr-3 w-5" />
              <div className="flex-1">
                <div className="text-xs text-gray-500">{t('booking.participants')}</div>
                <div className="font-medium text-gray-800">
                  {formData.num_participants} {formData.num_participants === 1 ? t('common.person') : t('common.people')}
                  {formData.participant_ages && formData.participant_ages.length > 0 && (
                    <div className="text-xs text-gray-600 mt-1.5 space-y-0.5">
                      {(() => {
                        // Group participants by age category
                        const categoryCounts = {};
                        formData.participant_ages.forEach(ageCategory => {
                          const categoryId = ageCategory.id;
                          categoryCounts[categoryId] = (categoryCounts[categoryId] || 0) + 1;
                        });

                        // Age category emojis
                        const categoryEmojis = {
                          infant: '👶',
                          child: '🧒',
                          preteen: '👦',
                          teen: '👨‍🎓',
                          adult: '👨',
                          senior: '👴'
                        };

                        // Build display array
                        return Object.entries(categoryCounts).map(([categoryId, count], index) => (
                          <span key={categoryId} className="inline-block">
                            <span className="mr-1">{categoryEmojis[categoryId] || '👤'}</span>
                            <span className="font-medium">{count}</span>
                            <span className="ml-0.5">{t(`booking.ageCategories.${categoryId}`).toLowerCase()}</span>
                            {index < Object.entries(categoryCounts).length - 1 && (
                              <span className="mx-1.5 text-gray-400">•</span>
                            )}
                          </span>
                        ));
                      })()}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Price Breakdown */}
        <div className="p-6 bg-gray-50">
          <h4 className="font-bold text-gray-800 mb-4">{t('booking.priceBreakdown')}</h4>

          <div className="space-y-3">
            {/* Base Price */}
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">
                {t('booking.packagePrice')} ({selectedTier?.tier_name})
              </span>
              <Price
                priceINR={calculatedPrice.base || 0}
                size="sm"
                className="font-medium"
              />
            </div>

            {/* Add-ons */}
            {calculatedPrice.addons > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">
                  {t('booking.addons')} ({Object.keys(formData.selected_addons || {}).length})
                </span>
                <Price
                  priceINR={calculatedPrice.addons}
                  size="sm"
                  className="font-medium text-green-600"
                />
              </div>
            )}

            {/* Vehicles */}
            {calculatedPrice.vehicles > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">
                  {t('booking.vehicles')} ({formData.selected_vehicles?.length || 0})
                </span>
                <Price
                  priceINR={calculatedPrice.vehicles}
                  size="sm"
                  className="font-medium text-green-600"
                />
              </div>
            )}

            {/* Divider */}
            <div className="border-t-2 border-gray-200 my-3"></div>

            {/* Total */}
            <div className="flex justify-between items-center">
              <span className="font-bold text-gray-800">{t('booking.estimatedTotal')}</span>
              <Price
                priceINR={calculatedPrice.total || 0}
                size="xl"
                className="font-bold text-primary"
              />
            </div>
          </div>

          {/* Info Badge */}
          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start">
            <FontAwesomeIcon icon={faInfoCircle} className="text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-blue-800 leading-relaxed">
              {t('booking.priceEstimateInfo')}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-6 space-y-3">
          {/* Submit Button */}
          <button
            onClick={onSubmit}
            disabled={!isFormValid}
            className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 flex items-center justify-center ${
              isFormValid
                ? 'bg-gradient-to-r from-primary to-blue-600 text-white hover:shadow-lg hover:scale-105 active:scale-95'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {t('booking.submitInquiry')}
            <FontAwesomeIcon icon={faArrowRight} className="ml-2" />
          </button>

          {/* Compare Button */}
          {onCompare && (
            <button
              onClick={onCompare}
              className="w-full py-2 px-4 rounded-lg font-medium text-sm border-2 border-primary text-primary hover:bg-primary hover:text-white transition-colors"
            >
              {t('booking.comparePackages')}
            </button>
          )}

          {/* Validation Messages */}
          {!isFormValid && (
            <div className="text-xs text-red-600 text-center">
              {t('booking.pleaseFillAllRequiredFields')}
            </div>
          )}
        </div>
      </motion.div>

      {/* Mobile Bottom Bar (Hidden on Desktop) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 shadow-2xl p-4 z-50">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-gray-500">{t('booking.total')}</div>
            <Price
              priceINR={calculatedPrice.total || 0}
              size="lg"
              className="font-bold text-primary"
            />
          </div>
          <button
            onClick={onSubmit}
            disabled={!isFormValid}
            className={`py-3 px-6 rounded-lg font-bold transition-all ${
              isFormValid
                ? 'bg-gradient-to-r from-primary to-blue-600 text-white active:scale-95'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {t('booking.reserve')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingSidebar;
