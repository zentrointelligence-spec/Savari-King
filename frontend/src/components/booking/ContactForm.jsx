import React, { useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUser,
  faEnvelope,
  faPhone,
  faMapMarkerAlt,
  faCommentDots,
  faInfoCircle
} from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../../contexts/AuthContext';
import PhoneInput from './PhoneInput';
import CountrySelector from './CountrySelector';

/**
 * ContactForm Component
 *
 * Formulaire de contact pour la réservation
 * Pré-remplit automatiquement les données si l'utilisateur est connecté
 *
 * @param {Object} formData - Données du formulaire de contact
 * @param {Function} onChange - Callback: (field, value) => void
 * @param {Object} errors - Objet contenant les erreurs de validation
 */
const ContactForm = ({ formData, onChange, errors = {} }) => {
  const { t } = useTranslation();
  const { user, token } = useContext(AuthContext);
  const isAuthenticated = !!user && !!token;

  // Pré-remplir les données si l'utilisateur est connecté
  useEffect(() => {
    if (isAuthenticated && user) {
      // Pré-remplir seulement si les champs sont vides
      if (!formData.full_name && user.full_name) {
        onChange('full_name', user.full_name);
      }
      if (!formData.email && user.email) {
        onChange('email', user.email);
      }
      if (!formData.phone && user.phone) {
        onChange('phone', user.phone);
      }
      if (!formData.country && user.country) {
        onChange('country', user.country);
      }
    }
  }, [isAuthenticated, user]);

  // Gérer le changement de champ
  const handleChange = (field) => (e) => {
    onChange(field, e.target.value);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="bg-white rounded-xl shadow-md p-6 border border-gray-100"
    >
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-800 flex items-center">
          <FontAwesomeIcon icon={faUser} className="mr-3 text-primary" />
          {t('booking.contactInformation')}
        </h3>
        <p className="text-sm text-gray-600 mt-2">
          {t('booking.contactDescription')}
        </p>

        {/* Info si utilisateur connecté */}
        {isAuthenticated && (
          <div className="mt-3 bg-green-50 border border-green-200 rounded-lg p-3 flex items-start">
            <FontAwesomeIcon icon={faInfoCircle} className="text-green-600 mr-2 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-green-800">
              {t('booking.loggedInInfo')}
            </p>
          </div>
        )}
      </div>

      {/* Formulaire */}
      <div className="space-y-5">
        {/* Nom complet */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <FontAwesomeIcon icon={faUser} className="mr-2 text-primary" />
            {t('booking.fullName')} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.full_name || ''}
            onChange={handleChange('full_name')}
            placeholder={t('booking.fullNamePlaceholder')}
            className={`w-full p-3 border-2 rounded-lg focus:outline-none transition-colors ${
              errors.full_name
                ? 'border-red-500 focus:border-red-600'
                : 'border-gray-200 focus:border-primary'
            }`}
          />
          {errors.full_name && (
            <div className="mt-2 text-sm text-red-600">
              ⚠️ {errors.full_name}
            </div>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <FontAwesomeIcon icon={faEnvelope} className="mr-2 text-primary" />
            {t('booking.email')} <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            value={formData.email || ''}
            onChange={handleChange('email')}
            placeholder={t('booking.emailPlaceholder')}
            className={`w-full p-3 border-2 rounded-lg focus:outline-none transition-colors ${
              errors.email
                ? 'border-red-500 focus:border-red-600'
                : 'border-gray-200 focus:border-primary'
            }`}
          />
          {errors.email && (
            <div className="mt-2 text-sm text-red-600">
              ⚠️ {errors.email}
            </div>
          )}
        </div>

        {/* Téléphone et Pays - Synchronized */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Téléphone avec sélecteur de pays moderne */}
          <div>
            <PhoneInput
              value={formData.phone || ''}
              onChange={(value) => onChange('phone', value)}
              onCountryChange={(countryName) => {
                // Synchronize country field when phone country is selected
                onChange('country', countryName);
              }}
              error={errors.phone}
              placeholder={t('booking.phonePlaceholder')}
              label={t('booking.phone')}
              required
            />
          </div>

          {/* Pays avec sélecteur moderne synchronisé */}
          <div>
            <CountrySelector
              value={formData.country || ''}
              onChange={(value) => onChange('country', value)}
              error={errors.country}
              placeholder={t('booking.countryPlaceholder')}
              label={t('booking.country')}
              required
            />
          </div>
        </div>

        {/* Demandes spéciales */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <FontAwesomeIcon icon={faCommentDots} className="mr-2 text-primary" />
            {t('booking.specialRequests')}
          </label>
          <textarea
            value={formData.special_requests || ''}
            onChange={handleChange('special_requests')}
            placeholder={t('booking.specialRequestsPlaceholder')}
            rows={4}
            className={`w-full p-3 border-2 rounded-lg focus:outline-none transition-colors resize-none ${
              errors.special_requests
                ? 'border-red-500 focus:border-red-600'
                : 'border-gray-200 focus:border-primary'
            }`}
          />
          {errors.special_requests && (
            <div className="mt-2 text-sm text-red-600">
              ⚠️ {errors.special_requests}
            </div>
          )}
          <p className="mt-2 text-xs text-gray-500">
            {t('booking.specialRequestsInfo')}
          </p>
        </div>
      </div>

      {/* Info footer */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start">
        <FontAwesomeIcon icon={faInfoCircle} className="text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
        <div className="text-xs text-blue-800">
          <p className="font-medium mb-1">{t('booking.privacyTitle')}</p>
          <p>{t('booking.privacyInfo')}</p>
        </div>
      </div>
    </motion.div>
  );
};

export default ContactForm;
