import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCalendarAlt,
  faUsers,
  faInfoCircle,
  faCheck,
  faPlus,
  faMinus
} from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Age categories based on database analysis
 * min_age values in DB: 0, 14, 16, 18
 */
const AGE_CATEGORIES = [
  { id: 'infant', label: '0-2 years', min: 0, max: 2, minAge: 0 },
  { id: 'child', label: '3-7 years', min: 3, max: 7, minAge: 0 },
  { id: 'preteen', label: '8-13 years', min: 8, max: 13, minAge: 0 },
  { id: 'teen', label: '14-17 years', min: 14, max: 17, minAge: 14 },
  { id: 'adult', label: '18-59 years', min: 18, max: 59, minAge: 18 },
  { id: 'senior', label: '60+ years', min: 60, max: 100, minAge: 18 }
];

/**
 * TravelDetailsForm Component
 *
 * Allows progressive age entry:
 * 1. Select number of participants (limited by max_group_size)
 * 2. Enter age for each participant one by one
 * 3. Display summary of all ages
 *
 * @param {Object} formData - Form data including travel_date and participant_ages array
 * @param {Function} onChange - Callback: (field, value) => void
 * @param {Object} errors - Validation errors
 * @param {Object} tour - Tour object with min_age and max_group_size
 */
const TravelDetailsForm = ({ formData, onChange, errors = {}, tour = null }) => {
  const { t } = useTranslation();
  const [dateError, setDateError] = useState('');
  const [currentParticipantIndex, setCurrentParticipantIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const minAge = tour?.min_age || 0;
  const maxGroupSize = tour?.max_group_size || 20;

  // Get available age categories based on min_age
  // A category is available if it contains ages >= tour's min_age
  // i.e., the category's maximum age must be >= tour's min_age
  const availableCategories = AGE_CATEGORIES.filter(cat => cat.max >= minAge);

  // Initialize participant_ages array when num_participants changes
  useEffect(() => {
    if (formData.num_participants && !formData.participant_ages) {
      onChange('participant_ages', []);
      setCurrentParticipantIndex(0);
    }
  }, [formData.num_participants]);

  // Calculate date constraints
  const getMinDate = () => {
    const today = new Date();
    today.setDate(today.getDate() + 5);
    return today;
  };

  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setFullYear(maxDate.getFullYear() + 1);
    return maxDate;
  };

  // Handle date change
  const handleDateChange = (date) => {
    const minDate = getMinDate();
    if (date < minDate) {
      setDateError(t('booking.dateMinimumError', { days: 5 }));
      return;
    }
    setDateError('');
    onChange('travel_date', date);
  };

  // Handle number of participants change with +/- buttons
  const handleNumParticipantsChange = (newNum) => {
    if (newNum < 0 || newNum > maxGroupSize) return;
    onChange('num_participants', newNum);
    onChange('participant_ages', []); // Reset ages when number changes
    setCurrentParticipantIndex(0);
    setSelectedCategory(null);
  };

  // Increment participants
  const incrementParticipants = () => {
    const currentNum = formData.num_participants || 0;
    if (currentNum < maxGroupSize) {
      handleNumParticipantsChange(currentNum + 1);
    }
  };

  // Decrement participants
  const decrementParticipants = () => {
    const currentNum = formData.num_participants || 0;
    if (currentNum > 0) {
      handleNumParticipantsChange(currentNum - 1);
    }
  };

  // Handle age category selection and validation
  const handleAddAge = () => {
    if (!selectedCategory) return;

    const participantAges = formData.participant_ages || [];
    const updatedAges = [...participantAges, selectedCategory];
    onChange('participant_ages', updatedAges);

    // Move to next participant or finish
    if (updatedAges.length < formData.num_participants) {
      setCurrentParticipantIndex(updatedAges.length);
      setSelectedCategory(null);
    } else {
      setCurrentParticipantIndex(-1); // All ages entered
    }
  };

  // Remove an age
  const handleRemoveAge = (index) => {
    const participantAges = formData.participant_ages || [];
    const updatedAges = participantAges.filter((_, i) => i !== index);
    onChange('participant_ages', updatedAges);
    setCurrentParticipantIndex(updatedAges.length);
  };

  // Calculate summary by category
  const getAgeSummary = () => {
    const participantAges = formData.participant_ages || [];
    const summary = {};

    participantAges.forEach(category => {
      if (!summary[category.id]) {
        summary[category.id] = { count: 0, label: category.label };
      }
      summary[category.id].count++;
    });

    return Object.values(summary);
  };

  const ageSummary = getAgeSummary();
  const participantAges = formData.participant_ages || [];
  const allAgesEntered = participantAges.length === formData.num_participants && formData.num_participants > 0;

  // Count adults (18+) and children (<18)
  const numAdults = participantAges.filter(age => age.min >= 18).length;
  const numChildren = participantAges.filter(age => age.min < 18).length;
  const hasAtLeastOneAdult = numAdults > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white rounded-xl shadow-md p-6 border border-gray-100"
    >
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-800 flex items-center">
          <FontAwesomeIcon icon={faCalendarAlt} className="mr-3 text-primary" />
          {t('booking.travelDetails')}
        </h3>
        <p className="text-sm text-gray-600 mt-2">
          {t('booking.travelDetailsDescription')}
        </p>
      </div>

      {/* Travel Date */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('booking.travelDate')} <span className="text-red-500">*</span>
        </label>

        <div className="relative">
          <DatePicker
            selected={formData.travel_date}
            onChange={handleDateChange}
            minDate={getMinDate()}
            maxDate={getMaxDate()}
            dateFormat="dd/MM/yyyy"
            placeholderText={t('booking.selectTravelDate')}
            className={`w-full p-3 pl-10 border-2 rounded-lg focus:outline-none transition-colors ${
              errors.travel_date || dateError
                ? 'border-red-500 focus:border-red-600'
                : 'border-gray-200 focus:border-primary'
            }`}
            calendarClassName="booking-calendar"
            wrapperClassName="w-full"
          />
          <FontAwesomeIcon
            icon={faCalendarAlt}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          />
        </div>

        {/* Info about minimum booking notice */}
        <div className="mt-2 flex items-start text-xs text-blue-600">
          <FontAwesomeIcon icon={faInfoCircle} className="mr-1 mt-0.5 flex-shrink-0" />
          <span>{t('booking.minimumBookingNotice', { days: 5 })}</span>
        </div>

        {/* Error messages */}
        {(errors.travel_date || dateError) && (
          <div className="mt-2 text-sm text-red-600 flex items-start">
            <span>⚠️ {errors.travel_date || dateError}</span>
          </div>
        )}
      </div>

      {/* Number of Participants */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <FontAwesomeIcon icon={faUsers} className="mr-2 text-primary" />
          {t('booking.numParticipants')} <span className="text-red-500">*</span>
        </label>

        {/* Counter with +/- buttons */}
        <div className="flex items-center space-x-4">
          {/* Decrement button */}
          <button
            type="button"
            onClick={decrementParticipants}
            disabled={(formData.num_participants || 0) === 0}
            className={`w-12 h-12 rounded-lg border-2 flex items-center justify-center transition-all duration-200 ${
              (formData.num_participants || 0) === 0
                ? 'border-gray-200 bg-gray-50 text-gray-300 cursor-not-allowed'
                : 'border-primary bg-white text-primary hover:bg-primary hover:text-white active:scale-95'
            }`}
          >
            <FontAwesomeIcon icon={faMinus} className="text-lg" />
          </button>

          {/* Number display */}
          <div className={`flex-1 flex items-center justify-center h-12 rounded-lg border-2 transition-colors ${
            errors.num_participants
              ? 'border-red-500 bg-red-50'
              : formData.num_participants >= maxGroupSize
              ? 'border-amber-500 bg-amber-50'
              : 'border-gray-200 bg-white'
          }`}>
            <span className={`text-2xl font-bold ${
              errors.num_participants
                ? 'text-red-600'
                : formData.num_participants >= maxGroupSize
                ? 'text-amber-600'
                : 'text-gray-800'
            }`}>
              {formData.num_participants || 0}
            </span>
            <span className="ml-2 text-sm text-gray-500">
              {(formData.num_participants || 0) === 1 ? t('common.person') : t('common.people')}
            </span>
          </div>

          {/* Increment button */}
          <button
            type="button"
            onClick={incrementParticipants}
            disabled={formData.num_participants >= maxGroupSize}
            className={`w-12 h-12 rounded-lg border-2 flex items-center justify-center transition-all duration-200 ${
              formData.num_participants >= maxGroupSize
                ? 'border-gray-200 bg-gray-50 text-gray-300 cursor-not-allowed'
                : 'border-primary bg-white text-primary hover:bg-primary hover:text-white active:scale-95'
            }`}
          >
            <FontAwesomeIcon icon={faPlus} className="text-lg" />
          </button>
        </div>

        {/* Info about max group size */}
        <div className="mt-2 flex items-start text-xs text-blue-600">
          <FontAwesomeIcon icon={faInfoCircle} className="mr-1 mt-0.5 flex-shrink-0" />
          <span>{t('booking.maxCapacityInfo', { max: maxGroupSize })}</span>
        </div>

        {/* Warning when at max capacity */}
        {formData.num_participants >= maxGroupSize && (
          <div className="mt-2 flex items-start text-xs text-amber-600">
            <FontAwesomeIcon icon={faInfoCircle} className="mr-1 mt-0.5 flex-shrink-0" />
            <span>{t('booking.exceededMaxCapacity', { max: maxGroupSize })}</span>
          </div>
        )}

        {errors.num_participants && (
          <div className="mt-2 text-sm text-red-600">
            ⚠️ {errors.num_participants}
          </div>
        )}
      </div>

      {/* Age Entry Section */}
      {formData.num_participants > 0 && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6"
          >
            {/* IMPORTANT: At least one adult required */}
            <div className="mb-4 bg-blue-50 border-2 border-blue-300 rounded-lg p-4">
              <div className="flex items-start text-sm text-blue-900">
                <FontAwesomeIcon icon={faInfoCircle} className="mr-2 mt-0.5 flex-shrink-0 text-blue-600" />
                <div className="flex-1">
                  <span className="font-bold">{t('booking.adultRequired') || 'Important: At least one adult (18+) is required'}</span>
                  <p className="mt-1 text-xs text-blue-700">
                    {t('booking.adultRequiredDescription') || 'For legal and safety reasons, every booking must include at least one adult (18 years or older).'}
                  </p>
                </div>
              </div>
            </div>

            {/* Age restriction warning (for tours with min_age) */}
            {minAge > 0 && (
              <div className="mb-4 bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start text-sm text-amber-800">
                  <FontAwesomeIcon icon={faInfoCircle} className="mr-2 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-medium">{t('booking.ageRestriction')}</span>
                    <p className="mt-1 text-xs text-amber-700">
                      {t('booking.minAgeRequirement', { minAge })}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Progressive Age Entry */}
            {!allAgesEntered && (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 border-2 border-blue-200">
                <label className="block text-sm font-medium text-gray-800 mb-3">
                  {t('booking.ageOfParticipant', { number: currentParticipantIndex + 1 })}
                  <span className="text-red-500 ml-1">*</span>
                </label>

                {/* Age Category Selection */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
                  {availableCategories.map(category => (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => setSelectedCategory(category)}
                      className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                        selectedCategory?.id === category.id
                          ? 'border-primary bg-primary/10 shadow-md'
                          : 'border-gray-200 bg-white hover:border-primary/50 hover:shadow-sm'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-800">
                            {t(`booking.ageCategories.${category.id}`)}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {category.label}
                          </div>
                        </div>
                        {selectedCategory?.id === category.id && (
                          <FontAwesomeIcon icon={faCheck} className="text-primary text-lg" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>

                {/* Add Age Button */}
                <button
                  type="button"
                  onClick={handleAddAge}
                  disabled={!selectedCategory}
                  className={`w-full py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center ${
                    selectedCategory
                      ? 'bg-primary text-white hover:bg-primary-dark shadow-md hover:shadow-lg'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <FontAwesomeIcon icon={faPlus} className="mr-2" />
                  {t('booking.confirmAge')}
                </button>
              </div>
            )}

            {/* Display entered ages */}
            {participantAges.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3">
                  {t('booking.enteredAges')} ({participantAges.length}/{formData.num_participants})
                </h4>
                <div className="space-y-2">
                  {participantAges.map((category, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center justify-between bg-white rounded-lg p-3 border border-gray-200"
                    >
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-600 mr-3">
                          {t('booking.participant')} {index + 1}:
                        </span>
                        <span className="text-sm text-gray-800">
                          {t(`booking.ageCategories.${category.id}`)} ({category.label})
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveAge(index)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        ✕
                      </button>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Adults vs Children Counter */}
            {participantAges.length > 0 && (
              <div className="mt-4 grid grid-cols-2 gap-3">
                {/* Adults Count */}
                <div className={`rounded-lg p-4 border-2 transition-all ${
                  numAdults > 0
                    ? 'bg-green-50 border-green-300'
                    : 'bg-red-50 border-red-300'
                }`}>
                  <div className="text-xs text-gray-600 mb-1">
                    {t('booking.adults') || 'Adults (18+)'}
                  </div>
                  <div className={`text-2xl font-bold ${
                    numAdults > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {numAdults}
                  </div>
                  {numAdults === 0 && (
                    <div className="text-xs text-red-600 mt-1 font-medium">
                      ⚠️ {t('booking.requiredAdult') || 'Required'}
                    </div>
                  )}
                </div>

                {/* Children Count */}
                <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                  <div className="text-xs text-gray-600 mb-1">
                    {t('booking.children') || 'Children (<18)'}
                  </div>
                  <div className="text-2xl font-bold text-blue-600">
                    {numChildren}
                  </div>
                </div>
              </div>
            )}

            {/* WARNING: No adults selected */}
            {allAgesEntered && !hasAtLeastOneAdult && (
              <div className="mt-4 bg-red-50 border-2 border-red-300 rounded-lg p-4 animate-pulse">
                <div className="flex items-start text-sm text-red-800">
                  <span className="text-xl mr-2">⚠️</span>
                  <div className="flex-1">
                    <span className="font-bold">
                      {t('booking.noAdultWarning') || 'No Adult Detected!'}
                    </span>
                    <p className="mt-1 text-xs text-red-700">
                      {t('booking.noAdultWarningDescription') || 'You must include at least one adult (18 years or older) to proceed with this booking. Please add an adult participant.'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* SUCCESS: Age Summary with adults */}
            {allAgesEntered && hasAtLeastOneAdult && ageSummary.length > 0 && (
              <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start text-sm">
                  <FontAwesomeIcon icon={faCheck} className="text-green-600 mr-2 mt-0.5" />
                  <div className="flex-1">
                    <span className="font-medium text-green-800">
                      {t('booking.totalParticipants')}: {formData.num_participants}
                    </span>
                    <div className="text-green-700 mt-1">
                      {ageSummary.map((cat, idx) => (
                        <span key={idx}>
                          {cat.count} {t(`booking.ageCategories.${AGE_CATEGORIES.find(c => c.label === cat.label)?.id || 'adult'}`).toLowerCase()}
                          {idx < ageSummary.length - 1 ? ', ' : ''}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      )}
    </motion.div>
  );
};

export default TravelDetailsForm;
