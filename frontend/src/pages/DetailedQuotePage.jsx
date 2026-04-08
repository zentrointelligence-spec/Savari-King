/**
 * DetailedQuotePage Component
 * Full detailed view of a quote with all inclusions, vehicles, and addons
 */

import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSpinner,
  faArrowLeft,
  faFileAlt,
  faMapMarkedAlt,
  faCar,
  faPlus
} from '@fortawesome/free-solid-svg-icons';
import QuoteHeader from '../components/quotes/QuoteHeader';
import CountdownTimer from '../components/quotes/CountdownTimer';
import VersionSelector from '../components/quotes/VersionSelector';
import AcceptQuoteButton from '../components/quotes/AcceptQuoteButton';
import ShareQuoteButton from '../components/quotes/ShareQuoteButton';
import quoteService from '../services/quoteService';
import { useCurrency } from '../contexts/CurrencyContext';

const DetailedQuotePage = () => {
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
        const response = await quoteService.getDetailedQuote(bookingId, version);

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
    navigate(`/my-bookings/${bookingId}/quote/detailed?version=${version}`);
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

  const { booking, tour, revision, vehicles, addons, pricing, timeRemaining, expired } = quoteData;
  const isAccepted = !!revision.accepted_at;
  const canAccept = !expired && !isAccepted;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
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
          <ShareQuoteButton bookingId={bookingId} quoteType="detailed" disabled={expired} />
          <button
            onClick={() => navigate(`/my-bookings/${bookingId}/quote/general`)}
            className="px-6 py-3 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 shadow-md hover:shadow-lg transition-colors duration-200"
          >
            <FontAwesomeIcon icon={faFileAlt} className="mr-2" />
            View General Quote
          </button>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Package Information */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-blue-600">
              <FontAwesomeIcon icon={faMapMarkedAlt} className="mr-2 text-blue-600" />
              Package Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-600 mb-1">Package Type</div>
                <div className="text-lg font-semibold text-gray-900">{booking.tier_name}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">Duration</div>
                <div className="text-lg font-semibold text-gray-900">{tour.duration_days} Days</div>
              </div>
              <div className="md:col-span-2">
                <div className="text-sm text-gray-600 mb-1">Base Price</div>
                <div className="text-2xl font-bold text-blue-600">
                  {formatPrice(convertPrice(pricing.tierPrice))}
                </div>
              </div>
            </div>

            {/* Inclusions */}
            {tour.inclusions_summary && (
              <div className="mt-6 bg-blue-50 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">Package Inclusions:</h3>
                <div
                  className="text-blue-800 text-sm"
                  dangerouslySetInnerHTML={{ __html: tour.inclusions_summary }}
                />
              </div>
            )}
          </section>

          {/* Vehicles Section */}
          {vehicles && vehicles.length > 0 && (
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-blue-600">
                <FontAwesomeIcon icon={faCar} className="mr-2 text-blue-600" />
                Vehicles & Transportation
              </h2>
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <strong>Tour Duration:</strong> {tour.duration_days} days (vehicle rental period)
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Vehicle Type</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Rental Days</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Quantity</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Price/Day</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {vehicles.map((vehicle, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="font-semibold text-gray-900">{vehicle.name}</div>
                          {vehicle.capacity && (
                            <div className="text-xs text-gray-600">Capacity: {vehicle.capacity} passengers</div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="text-orange-600 font-bold text-lg">{vehicle.duration}</span>
                          <div className="text-xs text-gray-600">days</div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="font-bold">{vehicle.quantity}</span>
                          <div className="text-xs text-gray-600">vehicle{vehicle.quantity > 1 ? 's' : ''}</div>
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-gray-900">
                          {formatPrice(convertPrice(vehicle.pricePerDay))}
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-blue-600">
                          {formatPrice(convertPrice(vehicle.total))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* Add-ons Section */}
          {addons && addons.length > 0 && (
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-blue-600">
                <FontAwesomeIcon icon={faPlus} className="mr-2 text-blue-600" />
                Add-ons & Extras
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Add-on</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Pricing Type</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Unit Price</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {addons.map((addon, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="font-semibold text-gray-900">{addon.name}</div>
                          {addon.description && (
                            <div className="text-xs text-gray-600 mt-1">{addon.description}</div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            addon.pricePerPerson
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {addon.pricePerPerson ? 'Per Person' : 'Fixed Price'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-gray-900">
                          {formatPrice(convertPrice(addon.unitPrice))}
                          {addon.pricePerPerson && <span className="text-xs text-gray-600">/person</span>}
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-blue-600">
                          {formatPrice(convertPrice(addon.subtotal))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* Price Breakdown */}
          <section className="border-t-2 border-gray-200 pt-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Price Breakdown</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Package Base Price ({booking.tier_name})</span>
                <span className="font-semibold text-gray-900">
                  {formatPrice(convertPrice(pricing.tierPrice))}
                </span>
              </div>

              {vehicles && vehicles.length > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">
                    Vehicles Total <span className="text-sm text-gray-500">(for {tour.duration_days} days)</span>
                  </span>
                  <span className="font-semibold text-gray-900">
                    {formatPrice(convertPrice(pricing.vehiclesTotal))}
                  </span>
                </div>
              )}

              {addons && addons.length > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Add-ons Total</span>
                  <span className="font-semibold text-gray-900">
                    {formatPrice(convertPrice(pricing.addonsTotal))}
                  </span>
                </div>
              )}

              <div className="flex justify-between items-center border-t-2 border-gray-300 pt-3 mt-3">
                <span className="text-lg font-bold text-gray-900">Subtotal</span>
                <span className="text-lg font-bold text-gray-900">
                  {formatPrice(convertPrice(pricing.subtotal))}
                </span>
              </div>

              {pricing.discounts > 0 && (
                <div className="flex justify-between items-center text-green-600">
                  <span>Discounts</span>
                  <span className="font-semibold">-{formatPrice(convertPrice(pricing.discounts))}</span>
                </div>
              )}

              {pricing.fees > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Additional Fees</span>
                  <span className="font-semibold text-gray-900">
                    {formatPrice(convertPrice(pricing.fees))}
                  </span>
                </div>
              )}

              <div className="flex justify-between items-center bg-blue-600 text-white p-4 rounded-lg mt-4">
                <span className="text-xl font-bold">TOTAL AMOUNT</span>
                <span className="text-2xl font-bold">
                  {formatPrice(convertPrice(pricing.finalPrice))}
                </span>
              </div>
            </div>
          </section>

          {/* Footer Note */}
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

export default DetailedQuotePage;
