import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faSpinner,
  faCreditCard,
  faUniversity,
  faMoneyCheckAlt,
  faCheckCircle,
  faExclamationTriangle,
  faLock,
  faFileInvoice
} from '@fortawesome/free-solid-svg-icons';
import API_CONFIG, { buildApiUrl, getAuthHeaders } from '../config/api';
import QuoteExpiryTimer from '../components/payment/QuoteExpiryTimer';

const PaymentPage = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { token, user } = useContext(AuthContext);
  const { t } = useTranslation();
  const { convertAndFormat, currency } = useCurrency();

  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState('card');
  const [isProcessing, setIsProcessing] = useState(false);

  // Card payment form
  const [cardForm, setCardForm] = useState({
    cardNumber: '',
    cardName: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: ''
  });

  // Bank transfer form
  const [bankForm, setBankForm] = useState({
    bankName: '',
    accountNumber: '',
    transactionReference: ''
  });

  // PayPal form
  const [paypalForm, setPaypalForm] = useState({
    paypalEmail: '',
    paypalTransactionId: ''
  });

  useEffect(() => {
    if (token && bookingId) {
      fetchBooking();
    }
  }, [token, bookingId]);

  const fetchBooking = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        buildApiUrl(`/api/bookings/${bookingId}`),
        { headers: getAuthHeaders(token) }
      );

      if (response.data.success) {
        const bookingData = response.data.data;

        // Check if booking belongs to current user
        if (bookingData.user_id !== user?.id) {
          toast.error(t('payment.errors.noAccess') || 'You do not have access to this booking');
          navigate('/my-bookings');
          return;
        }

        // Check if payment is already confirmed
        if (bookingData.status === 'Payment Confirmed') {
          toast.info(t('payment.errors.alreadyPaid') || 'This booking has already been paid');
          navigate('/my-bookings');
          return;
        }

        // Check if quote was sent
        if (bookingData.status !== 'Quote Sent') {
          toast.error(t('payment.errors.quoteNotSent') || 'Payment is not available yet. Please wait for the quote.');
          navigate('/my-bookings');
          return;
        }

        // ✅ Check quote expiration
        if (bookingData.quote_expiration_date) {
          const expirationDate = new Date(bookingData.quote_expiration_date);
          const now = new Date();

          if (expirationDate < now) {
            toast.error(t('payment.errors.quoteExpired') || 'This quote has expired. Please request a new quote from your bookings page.', {
              autoClose: 5000
            });
            navigate('/my-bookings');
            return;
          }

          // Warning if less than 2 hours remaining
          const hoursRemaining = (expirationDate - now) / (1000 * 60 * 60);
          if (hoursRemaining < 2) {
            toast.warn(t('payment.warnings.quoteExpiringSoon', { minutes: Math.floor(hoursRemaining * 60) }) || `⏰ This quote expires in ${Math.floor(hoursRemaining * 60)} minutes!`, {
              autoClose: 10000
            });
          }
        }

        setBooking(bookingData);
      }
    } catch (error) {
      console.error('Error fetching booking:', error);
      toast.error(t('payment.errors.loadFailed') || 'Failed to load booking details');
      navigate('/my-bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleCardPayment = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!cardForm.cardNumber || !cardForm.cardName || !cardForm.expiryMonth ||
        !cardForm.expiryYear || !cardForm.cvv) {
      toast.error(t('payment.validation.fillAllCardDetails') || 'Please fill in all card details');
      return;
    }

    if (cardForm.cardNumber.length < 13 || cardForm.cardNumber.length > 19) {
      toast.error(t('payment.validation.invalidCardNumber') || 'Invalid card number');
      return;
    }

    if (cardForm.cvv.length !== 3 && cardForm.cvv.length !== 4) {
      toast.error(t('payment.validation.invalidCVV') || 'Invalid CVV');
      return;
    }

    try {
      setIsProcessing(true);
      const response = await axios.post(
        buildApiUrl(`/api/bookings/${bookingId}/payment/card`),
        cardForm,
        { headers: getAuthHeaders(token) }
      );

      if (response.data.success) {
        console.log('✅ Payment successful, response data:', response.data);
        toast.success(t('payment.success.paymentConfirmed') || 'Payment confirmed successfully!');

        // Auto-download payment receipt PDF if available
        if (response.data.data?.receiptPdf) {
          console.log('📄 Receipt PDF path:', response.data.data.receiptPdf);
          console.log('📄 Receipt number:', response.data.data.receiptNumber);

          const pdfUrl = `${API_CONFIG.BASE_URL}${response.data.data.receiptPdf}`;
          console.log('📄 Full PDF URL:', pdfUrl);

          // Create a link and trigger download
          const link = document.createElement('a');
          link.href = pdfUrl;
          link.download = `payment-receipt-${response.data.data.bookingReference}.pdf`;
          link.target = '_blank'; // Open in new tab as fallback
          document.body.appendChild(link);
          link.click();

          // Small delay before removing to ensure click is processed
          setTimeout(() => {
            document.body.removeChild(link);
          }, 100);

          toast.info('📄 Payment receipt downloaded!', { autoClose: 3000 });
        } else {
          console.warn('⚠️ No receipt PDF in response:', response.data.data);
          toast.warning('Payment confirmed but receipt generation pending. Check your email.', { autoClose: 5000 });
        }

        setTimeout(() => navigate('/my-bookings'), 3000);
      }
    } catch (error) {
      console.error('Error processing card payment:', error);
      toast.error(error.response?.data?.error || t('payment.errors.paymentFailed') || 'Failed to process payment');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBankTransfer = async (e) => {
    e.preventDefault();

    if (!bankForm.bankName || !bankForm.accountNumber || !bankForm.transactionReference) {
      toast.error(t('payment.validation.fillAllBankDetails') || 'Please fill in all bank transfer details');
      return;
    }

    try {
      setIsProcessing(true);
      const response = await axios.post(
        buildApiUrl(`/api/bookings/${bookingId}/payment/bank-transfer`),
        bankForm,
        { headers: getAuthHeaders(token) }
      );

      if (response.data.success) {
        toast.success(t('payment.success.bankTransferSubmitted') || 'Bank transfer details submitted! Awaiting admin confirmation.');
        setTimeout(() => navigate('/my-bookings'), 2000);
      }
    } catch (error) {
      console.error('Error processing bank transfer:', error);
      toast.error(error.response?.data?.error || t('payment.errors.bankTransferFailed') || 'Failed to submit bank transfer');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePayPalPayment = async (e) => {
    e.preventDefault();

    if (!paypalForm.paypalEmail || !paypalForm.paypalTransactionId) {
      toast.error(t('payment.validation.fillAllPayPalDetails') || 'Please fill in all PayPal details');
      return;
    }

    if (!paypalForm.paypalEmail.includes('@')) {
      toast.error(t('payment.validation.invalidPayPalEmail') || 'Invalid PayPal email address');
      return;
    }

    try {
      setIsProcessing(true);
      const response = await axios.post(
        buildApiUrl(`/api/bookings/${bookingId}/payment/paypal`),
        paypalForm,
        { headers: getAuthHeaders(token) }
      );

      if (response.data.success) {
        toast.success(t('payment.success.paypalConfirmed') || 'PayPal payment confirmed successfully!');
        setTimeout(() => navigate('/my-bookings'), 2000);
      }
    } catch (error) {
      console.error('Error processing PayPal payment:', error);
      toast.error(error.response?.data?.error || t('payment.errors.paypalFailed') || 'Failed to process PayPal payment');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FontAwesomeIcon icon={faSpinner} spin className="text-5xl text-primary mb-4" />
          <p className="text-gray-600">{t('payment.loading') || 'Loading payment details...'}</p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-xl mb-4">{t('payment.bookingNotFound') || 'Booking not found'}</p>
          <button
            onClick={() => navigate('/my-bookings')}
            className="bg-primary text-white px-6 py-2 rounded-lg"
          >
            {t('payment.backToBookings') || 'Back to My Bookings'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/my-bookings')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
            {t('payment.backToBookings') || 'Back to My Bookings'}
          </button>
          <h1 className="text-3xl font-bold text-gray-900">{t('payment.title') || 'Complete Payment'}</h1>
          <p className="text-gray-600 mt-2">{t('payment.bookingReference') || 'Booking Reference'}: {booking.booking_reference}</p>
        </div>

        {/* Quote Expiry Timer */}
        {booking.quote_expiration_date && (
          <QuoteExpiryTimer
            expirationDate={booking.quote_expiration_date}
            onExpired={() => {
              toast.error(t('payment.quoteExpiredRedirecting') || 'Quote has expired! Redirecting to My Bookings...');
              setTimeout(() => navigate('/my-bookings'), 2000);
            }}
          />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Payment Methods Selection */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">{t('payment.selectMethod') || 'Select Payment Method'}</h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {/* Card Payment */}
                <button
                  onClick={() => setSelectedMethod('card')}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    selectedMethod === 'card'
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <FontAwesomeIcon icon={faCreditCard} className="text-3xl mb-2 text-primary" />
                  <p className="font-semibold">{t('payment.methods.card.title') || 'Credit/Debit Card'}</p>
                  <p className="text-xs text-gray-600 mt-1">{t('payment.methods.card.subtitle') || 'Instant confirmation'}</p>
                </button>

                {/* Bank Transfer */}
                <button
                  onClick={() => setSelectedMethod('bank')}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    selectedMethod === 'bank'
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <FontAwesomeIcon icon={faUniversity} className="text-3xl mb-2 text-primary" />
                  <p className="font-semibold">{t('payment.methods.bank.title') || 'Bank Transfer'}</p>
                  <p className="text-xs text-gray-600 mt-1">{t('payment.methods.bank.subtitle') || 'Awaits verification'}</p>
                </button>

                {/* PayPal */}
                <button
                  onClick={() => setSelectedMethod('paypal')}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    selectedMethod === 'paypal'
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <FontAwesomeIcon icon={faMoneyCheckAlt} className="text-3xl mb-2 text-primary" />
                  <p className="font-semibold">{t('payment.methods.paypal.title') || 'PayPal'}</p>
                  <p className="text-xs text-gray-600 mt-1">{t('payment.methods.paypal.subtitle') || 'Instant confirmation'}</p>
                </button>
              </div>

              {/* Payment Forms */}
              {selectedMethod === 'card' && (
                <form onSubmit={handleCardPayment} className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <div className="flex items-start">
                      <FontAwesomeIcon icon={faLock} className="text-blue-600 mt-1 mr-3" />
                      <div>
                        <p className="text-sm font-semibold text-blue-900">{t('payment.forms.secure.title') || 'Secure Payment'}</p>
                        <p className="text-xs text-blue-700">{t('payment.forms.secure.description') || 'Your card information is encrypted and secure'}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {t('payment.forms.card.cardNumber') || 'Card Number'}
                    </label>
                    <input
                      type="text"
                      maxLength="19"
                      placeholder="1234 5678 9012 3456"
                      value={cardForm.cardNumber}
                      onChange={(e) => setCardForm({ ...cardForm, cardNumber: formatCardNumber(e.target.value) })}
                      className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {t('payment.forms.card.cardholderName') || 'Cardholder Name'}
                    </label>
                    <input
                      type="text"
                      placeholder={t('payment.forms.card.namePlaceholder') || 'John Doe'}
                      value={cardForm.cardName}
                      onChange={(e) => setCardForm({ ...cardForm, cardName: e.target.value })}
                      className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {t('payment.forms.card.expiryMonth') || 'Expiry Month'}
                      </label>
                      <select
                        value={cardForm.expiryMonth}
                        onChange={(e) => setCardForm({ ...cardForm, expiryMonth: e.target.value })}
                        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                        required
                      >
                        <option value="">MM</option>
                        {[...Array(12)].map((_, i) => (
                          <option key={i + 1} value={String(i + 1).padStart(2, '0')}>
                            {String(i + 1).padStart(2, '0')}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {t('payment.forms.card.expiryYear') || 'Expiry Year'}
                      </label>
                      <select
                        value={cardForm.expiryYear}
                        onChange={(e) => setCardForm({ ...cardForm, expiryYear: e.target.value })}
                        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                        required
                      >
                        <option value="">YYYY</option>
                        {[...Array(10)].map((_, i) => {
                          const year = new Date().getFullYear() + i;
                          return (
                            <option key={year} value={year}>
                              {year}
                            </option>
                          );
                        })}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {t('payment.forms.card.cvv') || 'CVV'}
                      </label>
                      <input
                        type="text"
                        maxLength="4"
                        placeholder="123"
                        value={cardForm.cvv}
                        onChange={(e) => setCardForm({ ...cardForm, cvv: e.target.value.replace(/\D/g, '') })}
                        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {isProcessing ? (
                      <>
                        <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
                        {t('payment.processing') || 'Processing...'}
                      </>
                    ) : (
                      <>
                        <FontAwesomeIcon icon={faCheckCircle} className="mr-2" />
                        {t('payment.payAmount', { amount: convertAndFormat(booking.final_price || 0) }) || `Pay ${convertAndFormat(booking.final_price || 0)}`}
                      </>
                    )}
                  </button>
                </form>
              )}

              {selectedMethod === 'bank' && (
                <form onSubmit={handleBankTransfer} className="space-y-4">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                    <div className="flex items-start">
                      <FontAwesomeIcon icon={faExclamationTriangle} className="text-yellow-600 mt-1 mr-3" />
                      <div>
                        <p className="text-sm font-semibold text-yellow-900">{t('payment.forms.bank.awaitingTitle') || 'Awaiting Confirmation'}</p>
                        <p className="text-xs text-yellow-700">{t('payment.forms.bank.awaitingDescription') || 'Your payment will be verified by our team within 24-48 hours'}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {t('payment.forms.bank.bankName') || 'Bank Name'}
                    </label>
                    <input
                      type="text"
                      placeholder={t('payment.forms.bank.bankNamePlaceholder') || 'Enter your bank name'}
                      value={bankForm.bankName}
                      onChange={(e) => setBankForm({ ...bankForm, bankName: e.target.value })}
                      className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {t('payment.forms.bank.accountNumber') || 'Account Number'}
                    </label>
                    <input
                      type="text"
                      placeholder={t('payment.forms.bank.accountNumberPlaceholder') || 'Enter your account number'}
                      value={bankForm.accountNumber}
                      onChange={(e) => setBankForm({ ...bankForm, accountNumber: e.target.value })}
                      className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {t('payment.forms.bank.transactionReference') || 'Transaction Reference'}
                    </label>
                    <input
                      type="text"
                      placeholder={t('payment.forms.bank.transactionReferencePlaceholder') || 'Enter transaction reference number'}
                      value={bankForm.transactionReference}
                      onChange={(e) => setBankForm({ ...bankForm, transactionReference: e.target.value })}
                      className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {isProcessing ? (
                      <>
                        <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
                        {t('payment.submitting') || 'Submitting...'}
                      </>
                    ) : (
                      <>
                        <FontAwesomeIcon icon={faCheckCircle} className="mr-2" />
                        {t('payment.submitBankDetails') || 'Submit Bank Transfer Details'}
                      </>
                    )}
                  </button>
                </form>
              )}

              {selectedMethod === 'paypal' && (
                <form onSubmit={handlePayPalPayment} className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <div className="flex items-start">
                      <FontAwesomeIcon icon={faMoneyCheckAlt} className="text-blue-600 mt-1 mr-3" />
                      <div>
                        <p className="text-sm font-semibold text-blue-900">{t('payment.forms.paypal.title') || 'PayPal Payment'}</p>
                        <p className="text-xs text-blue-700">{t('payment.forms.paypal.description') || 'Complete your PayPal transaction and enter the details below'}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {t('payment.forms.paypal.email') || 'PayPal Email'}
                    </label>
                    <input
                      type="email"
                      placeholder={t('payment.forms.paypal.emailPlaceholder') || 'your.email@example.com'}
                      value={paypalForm.paypalEmail}
                      onChange={(e) => setPaypalForm({ ...paypalForm, paypalEmail: e.target.value })}
                      className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {t('payment.forms.paypal.transactionId') || 'PayPal Transaction ID'}
                    </label>
                    <input
                      type="text"
                      placeholder={t('payment.forms.paypal.transactionIdPlaceholder') || 'Enter PayPal transaction ID'}
                      value={paypalForm.paypalTransactionId}
                      onChange={(e) => setPaypalForm({ ...paypalForm, paypalTransactionId: e.target.value })}
                      className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {isProcessing ? (
                      <>
                        <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
                        {t('payment.processing') || 'Processing...'}
                      </>
                    ) : (
                      <>
                        <FontAwesomeIcon icon={faCheckCircle} className="mr-2" />
                        {t('payment.confirmPaypal') || 'Confirm PayPal Payment'}
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">{t('payment.summary.title') || 'Order Summary'}</h3>

              <div className="space-y-3 mb-4">
                <div>
                  <p className="text-sm text-gray-600">{t('payment.summary.tour') || 'Tour'}</p>
                  <p className="font-semibold">{booking.tour_name}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">{t('payment.summary.travelDate') || 'Travel Date'}</p>
                  <p className="font-semibold">{new Date(booking.travel_date).toLocaleDateString()}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">{t('payment.summary.participants') || 'Participants'}</p>
                  <p className="font-semibold">
                    {booking.num_adults} {t('payment.summary.adult', { count: booking.num_adults }) || `Adult${booking.num_adults > 1 ? 's' : ''}`}
                    {booking.num_children > 0 && `, ${booking.num_children} ${t('payment.summary.child', { count: booking.num_children }) || `Child${booking.num_children > 1 ? 'ren' : ''}`}`}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">{t('payment.summary.packageTier') || 'Package Tier'}</p>
                  <p className="font-semibold">{booking.tier_name || 'N/A'}</p>
                </div>
              </div>

              <div className="border-t pt-4 mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">{t('payment.summary.subtotal') || 'Subtotal'}</span>
                  <span className="font-semibold">{convertAndFormat(booking.final_price || 0)}</span>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-900">{t('payment.summary.totalAmount') || 'Total Amount'}</span>
                  <span className="text-2xl font-bold text-primary">{convertAndFormat(booking.final_price || 0)}</span>
                </div>
              </div>

              <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-start">
                  <FontAwesomeIcon icon={faFileInvoice} className="text-green-600 mt-1 mr-2" />
                  <p className="text-xs text-green-700">
                    {t('payment.summary.pdfAvailable') || 'Your quote PDFs are available in My Bookings'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
