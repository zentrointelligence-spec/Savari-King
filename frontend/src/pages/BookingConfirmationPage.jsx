import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCheckCircle,
  faCalendarAlt,
  faUsers,
  faMapMarkerAlt,
  faEnvelope,
  faPhone,
  faFileAlt,
  faHome,
  faClipboard
} from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';
import { api as API } from '../config/api';
import Loader from '../components/common/Loader';
import Price from '../components/common/Price';

/**
 * BookingConfirmationPage Component
 *
 * Displays booking confirmation after successful inquiry submission
 * Shows booking details, reference number, and next steps
 */
const BookingConfirmationPage = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(null);
  const [error, setError] = useState(null);

  // Fetch booking details
  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        setLoading(true);
        const response = await API.get(`/api/bookings/${bookingId}`);

        if (response.data.success) {
          setBooking(response.data.data);
        } else {
          setError('Booking not found');
        }
      } catch (err) {
        console.error('Error fetching booking:', err);
        setError(err.response?.data?.error || 'Failed to load booking details');
      } finally {
        setLoading(false);
      }
    };

    if (bookingId) {
      fetchBookingDetails();
    }
  }, [bookingId]);

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Copy booking reference to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // Could add a toast notification here
  };

  if (loading) {
    return <Loader />;
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            {t('bookingConfirmation.notFound')}
          </h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            {t('common.backToHome')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Success Header */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
            <FontAwesomeIcon icon={faCheckCircle} className="text-5xl text-green-600" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
            {t('bookingConfirmation.title')}
          </h1>
          <p className="text-lg text-gray-600">
            {t('bookingConfirmation.subtitle')}
          </p>
        </motion.div>

        {/* Booking Reference Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-r from-primary to-blue-600 text-white rounded-2xl p-6 mb-6 shadow-xl"
        >
          <div className="text-center">
            <p className="text-sm opacity-90 mb-2">{t('bookingConfirmation.referenceNumber')}</p>
            <div className="flex items-center justify-center space-x-3">
              <span className="text-3xl font-bold tracking-wider">
                {booking.booking_reference}
              </span>
              <button
                onClick={() => copyToClipboard(booking.booking_reference)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                title={t('common.copy')}
              >
                <FontAwesomeIcon icon={faClipboard} />
              </button>
            </div>
            <p className="text-sm opacity-90 mt-4">
              {t('bookingConfirmation.saveReference')}
            </p>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Booking Details - Left Column */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Tour Information */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-3 text-primary" />
                {t('bookingConfirmation.tourDetails')}
              </h2>

              {booking.tour_image && (
                <img
                  src={booking.tour_image}
                  alt={booking.tour_name}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
              )}

              <h3 className="text-2xl font-bold text-gray-800 mb-2">{booking.tour_name}</h3>
              <div className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium mb-4">
                {booking.tier_name}
              </div>

              <div className="space-y-3 text-gray-600">
                <div className="flex items-center">
                  <FontAwesomeIcon icon={faCalendarAlt} className="w-5 mr-3 text-primary" />
                  <div>
                    <span className="font-medium text-gray-700">{t('bookingConfirmation.travelDate')}:</span>
                    <span className="ml-2">{formatDate(booking.travel_date)}</span>
                  </div>
                </div>

                <div className="flex items-center">
                  <FontAwesomeIcon icon={faUsers} className="w-5 mr-3 text-primary" />
                  <div>
                    <span className="font-medium text-gray-700">{t('bookingConfirmation.participants')}:</span>
                    <span className="ml-2">
                      {booking.num_adults + booking.num_children} {t('common.people')}
                      {' '}({booking.num_adults} {t('booking.adults').toLowerCase()}, {booking.num_children} {t('booking.children').toLowerCase()})
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <FontAwesomeIcon icon={faEnvelope} className="mr-3 text-primary" />
                {t('bookingConfirmation.contactDetails')}
              </h2>

              <div className="space-y-3 text-gray-600">
                <div className="flex items-center">
                  <FontAwesomeIcon icon={faEnvelope} className="w-5 mr-3 text-gray-400" />
                  <span>{booking.contact_email}</span>
                </div>
                <div className="flex items-center">
                  <FontAwesomeIcon icon={faPhone} className="w-5 mr-3 text-gray-400" />
                  <span>{booking.contact_phone}</span>
                </div>
              </div>

              {booking.special_requests && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="font-medium text-gray-700 mb-2">
                    {t('bookingConfirmation.specialRequests')}:
                  </p>
                  <p className="text-gray-600 text-sm bg-gray-50 p-3 rounded-lg">
                    {booking.special_requests}
                  </p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Next Steps - Right Column */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-1"
          >
            {/* Price Summary */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">
                {t('bookingConfirmation.priceEstimate')}
              </h2>
              <div className="text-center py-4 bg-gray-50 rounded-lg">
                <Price
                  priceINR={booking.estimated_price}
                  size="2xl"
                  className="font-bold text-primary"
                />
                <p className="text-xs text-gray-500 mt-2">
                  {t('bookingConfirmation.estimateNote')}
                </p>
              </div>
            </div>

            {/* Next Steps */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl shadow-md p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                <FontAwesomeIcon icon={faFileAlt} className="mr-2 text-green-600" />
                {t('bookingConfirmation.nextSteps')}
              </h2>

              <ol className="space-y-4">
                <li className="flex items-start">
                  <span className="flex-shrink-0 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                    1
                  </span>
                  <p className="text-sm text-gray-700">
                    {t('bookingConfirmation.step1')}
                  </p>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                    2
                  </span>
                  <p className="text-sm text-gray-700">
                    {t('bookingConfirmation.step2')}
                  </p>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                    3
                  </span>
                  <p className="text-sm text-gray-700">
                    {t('bookingConfirmation.step3')}
                  </p>
                </li>
              </ol>

              <div className="mt-6 pt-6 border-t border-green-200">
                <p className="text-sm text-gray-600 text-center">
                  {t('bookingConfirmation.questionsContact')}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 flex flex-col sm:flex-row gap-4 justify-center"
        >
          <button
            onClick={() => navigate('/my-bookings')}
            className="px-8 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-medium shadow-md hover:shadow-lg"
          >
            {t('bookingConfirmation.viewMyBookings')}
          </button>
          <button
            onClick={() => navigate('/')}
            className="px-8 py-3 bg-white text-gray-700 border-2 border-gray-200 rounded-lg hover:border-primary hover:text-primary transition-colors font-medium"
          >
            <FontAwesomeIcon icon={faHome} className="mr-2" />
            {t('bookingConfirmation.backToHome')}
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default BookingConfirmationPage;
