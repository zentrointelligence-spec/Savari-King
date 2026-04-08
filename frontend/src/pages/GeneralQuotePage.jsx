/**
 * GeneralQuotePage Component
 * Simplified general view of a quote
 */

import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSpinner,
  faArrowLeft,
  faFileAlt,
  faInfoCircle
} from '@fortawesome/free-solid-svg-icons';
import QuoteHeader from '../components/quotes/QuoteHeader';
import CountdownTimer from '../components/quotes/CountdownTimer';
import VersionSelector from '../components/quotes/VersionSelector';
import AcceptQuoteButton from '../components/quotes/AcceptQuoteButton';
import ShareQuoteButton from '../components/quotes/ShareQuoteButton';
import quoteService from '../services/quoteService';
import { useCurrency } from '../contexts/CurrencyContext';

const GeneralQuotePage = () => {
  const { bookingId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { convertPrice, formatPrice, currency } = useCurrency();

  const [loading, setLoading] = useState(true);
  const [quoteData, setQuoteData] = useState(null);
  const [versions, setVersions] = useState([]);
  const [currentVersion, setCurrentVersion] = useState(null);
  const [error, setError] = useState(null);

  // Load quote data
  useEffect(() => {
    const fetchQuoteData = async () => {
      try {
        setLoading(true);
        const versionParam = searchParams.get('version');
        const version = versionParam ? parseInt(versionParam) : null;

        // Fetch quote data
        const response = await quoteService.getGeneralQuote(bookingId, version);

        if (response.success) {
          setQuoteData(response.data);
          setCurrentVersion(response.data.revision.revision_number);
        } else {
          setError(response.error || 'Failed to load quote');
        }

        // Fetch versions
        try {
          const versionsResponse = await quoteService.getQuoteVersions(bookingId);
          if (versionsResponse.success) {
            setVersions(versionsResponse.data);
          }
        } catch (err) {
          console.error('Error fetching versions:', err);
        }
      } catch (err) {
        console.error('Error fetching quote:', err);
        if (err.response?.status === 410) {
          setError('Ce devis a expiré');
        } else if (err.response?.status === 403) {
          setError('You do not have permission to view this quote');
        } else {
          setError('Failed to load quote. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchQuoteData();
  }, [bookingId, searchParams]);

  const handleVersionChange = (version) => {
    navigate(`/my-bookings/${bookingId}/quote/general?version=${version}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <FontAwesomeIcon icon={faSpinner} className="text-4xl text-blue-600 animate-spin mb-4" />
          <p className="text-gray-600">Loading quote...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-2xl font-bold text-red-800 mb-2">{error}</h2>
          <button
            onClick={() => navigate('/my-bookings')}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
            Back to My Bookings
          </button>
        </div>
      </div>
    );
  }

  if (!quoteData) {
    return null;
  }

  const { booking, tour, revision, pricing, timeRemaining, expired } = quoteData;
  const isAccepted = !!revision.accepted_at;
  const canAccept = !expired && !isAccepted;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/my-bookings')}
          className="mb-6 text-blue-600 hover:text-blue-700 font-medium"
        >
          <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
          Back to My Bookings
        </button>

        {/* Quote Header */}
        <QuoteHeader booking={booking} isExpired={expired} isAccepted={isAccepted} />

        {/* Version Selector */}
        {versions.length > 1 && (
          <VersionSelector
            versions={versions}
            currentVersion={currentVersion}
            onVersionChange={handleVersionChange}
          />
        )}

        {/* Countdown Timer */}
        {!expired && !isAccepted && timeRemaining && (
          <div className="mb-6">
            <CountdownTimer
              expirationDate={timeRemaining.expirationDate}
              onExpire={() => window.location.reload()}
            />
          </div>
        )}

        {/* Expired Message */}
        {expired && !isAccepted && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
            <h3 className="text-red-800 font-semibold text-lg">Ce devis a expiré</h3>
            <p className="text-red-700 text-sm mt-1">
              This quote is no longer valid. Please contact us for an updated quotation.
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mb-6 flex flex-wrap gap-4">
          <AcceptQuoteButton
            bookingId={bookingId}
            revisionNumber={currentVersion}
            disabled={!canAccept}
          />
          <ShareQuoteButton bookingId={bookingId} quoteType="general" disabled={expired} />
          <button
            onClick={() => navigate(`/my-bookings/${bookingId}/quote/detailed`)}
            className="px-6 py-3 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 shadow-md hover:shadow-lg transition-colors duration-200"
          >
            <FontAwesomeIcon icon={faFileAlt} className="mr-2" />
            View Detailed Quote
          </button>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Info Banner */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded-lg">
            <div className="flex items-start">
              <FontAwesomeIcon icon={faInfoCircle} className="text-blue-600 mr-3 mt-1 text-xl" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-1">General Quotation Summary</h3>
                <p className="text-blue-800 text-sm">
                  This is a simplified overview of your quotation. For complete details including vehicles,
                  add-ons, and inclusions, please view the detailed quotation.
                </p>
              </div>
            </div>
          </div>

          {/* Package Summary */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Package Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-2">Tour Package</div>
                <div className="text-xl font-bold text-gray-900">{booking.tour_name}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-2">Package Type</div>
                <div className="text-xl font-bold text-gray-900">{booking.tier_name}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-2">Duration</div>
                <div className="text-xl font-bold text-gray-900">{tour.duration_days} Days</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-2">Travelers</div>
                <div className="text-xl font-bold text-gray-900">
                  {booking.num_adults} Adults, {booking.num_children} Children
                </div>
              </div>
            </div>
          </section>

          {/* Price Summary */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Price Summary</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-3 border-b border-gray-200">
                <span className="text-gray-700">Package Base Price</span>
                <span className="font-semibold text-gray-900">
                  {formatPrice(convertPrice(pricing.tierPrice))}
                </span>
              </div>

              {pricing.vehiclesTotal > 0 && (
                <div className="flex justify-between items-center py-3 border-b border-gray-200">
                  <span className="text-gray-700">
                    Transportation <span className="text-sm text-gray-500">({tour.duration_days} days)</span>
                  </span>
                  <span className="font-semibold text-gray-900">
                    {formatPrice(convertPrice(pricing.vehiclesTotal))}
                  </span>
                </div>
              )}

              {pricing.addonsTotal > 0 && (
                <div className="flex justify-between items-center py-3 border-b border-gray-200">
                  <span className="text-gray-700">Additional Services</span>
                  <span className="font-semibold text-gray-900">
                    {formatPrice(convertPrice(pricing.addonsTotal))}
                  </span>
                </div>
              )}

              <div className="flex justify-between items-center py-3 border-b-2 border-gray-300">
                <span className="text-lg font-bold text-gray-900">Subtotal</span>
                <span className="text-lg font-bold text-gray-900">
                  {formatPrice(convertPrice(pricing.subtotal))}
                </span>
              </div>

              {pricing.discounts > 0 && (
                <div className="flex justify-between items-center py-3 text-green-600">
                  <span>Discounts Applied</span>
                  <span className="font-semibold">-{formatPrice(convertPrice(pricing.discounts))}</span>
                </div>
              )}

              {pricing.fees > 0 && (
                <div className="flex justify-between items-center py-3 border-b border-gray-200">
                  <span className="text-gray-700">Additional Fees</span>
                  <span className="font-semibold text-gray-900">
                    {formatPrice(convertPrice(pricing.fees))}
                  </span>
                </div>
              )}

              <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 rounded-lg mt-4">
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold">TOTAL AMOUNT</span>
                  <span className="text-3xl font-bold">
                    {formatPrice(convertPrice(pricing.finalPrice))}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Important Notes */}
          <section className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-lg">
            <h3 className="font-semibold text-yellow-900 mb-2">Important Notes:</h3>
            <ul className="list-disc list-inside text-yellow-800 text-sm space-y-1">
              <li>This quotation is valid for 48 hours from the time it was sent</li>
              <li>Prices are subject to availability and may change</li>
              <li>Final confirmation will be provided after payment is received</li>
              <li>Terms and conditions apply</li>
            </ul>
          </section>

          {/* Footer */}
          <div className="mt-8 text-center text-sm text-gray-600">
            <p>© {new Date().getFullYear()} Ebenezer Tours & Travels. All rights reserved.</p>
            <p className="mt-2">
              For questions or modifications, please contact us at{' '}
              <a href="mailto:info@ebenezertours.com" className="text-blue-600 hover:underline">
                info@ebenezertours.com
              </a>
            </p>
          </div>
        </div>
      </div>
  );
};

export default GeneralQuotePage;
