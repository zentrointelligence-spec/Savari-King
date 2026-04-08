import React, { useState, useEffect } from 'react';
import { Gift, TrendingDown, Clock, CheckCircle, XCircle, AlertCircle, Sparkles } from 'lucide-react';
import api from '../../../config/api';

/**
 * SpecialOffersPanel Component
 * Displays and manages special offers during quote review
 * Allows admin to auto-apply or manually select offers
 */
const SpecialOffersPanel = ({ bookingId, revisionId, onOffersApplied, currentFinalPrice }) => {
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState(null);
  const [selectedOffers, setSelectedOffers] = useState([]);
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState(null);
  const [showDetails, setShowDetails] = useState(true);

  // Fetch applicable offers
  useEffect(() => {
    fetchApplicableOffers();
  }, [bookingId, revisionId]);

  const fetchApplicableOffers = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get(
        `/bookings/${bookingId}/review/${revisionId}/applicable-offers`
      );

      if (response.data.success) {
        setRecommendations(response.data.data);

        // Pre-select recommended offers
        if (response.data.data.hasOffers && response.data.data.recommendedOffers) {
          setSelectedOffers(response.data.data.recommendedOffers.selectedOffers);
        }
      }
    } catch (err) {
      console.error('Error fetching applicable offers:', err);
      setError('Failed to load special offers');
    } finally {
      setLoading(false);
    }
  };

  // Auto-apply best offers
  const handleAutoApply = async (strategy = 'best_single') => {
    setApplying(true);
    setError(null);

    try {
      const response = await api.post(
        `/bookings/${bookingId}/review/${revisionId}/auto-apply-offers`,
        { strategy }
      );

      if (response.data.success) {
        // Notify parent component
        if (onOffersApplied) {
          onOffersApplied(response.data.data);
        }

        // Refresh offers list
        await fetchApplicableOffers();

        // Show success message
        alert(`✅ ${response.data.message}`);
      }
    } catch (err) {
      console.error('Error auto-applying offers:', err);
      setError('Failed to apply offers automatically');
    } finally {
      setApplying(false);
    }
  };

  // Manually apply selected offers
  const handleManualApply = async () => {
    if (selectedOffers.length === 0) {
      alert('Please select at least one offer');
      return;
    }

    setApplying(true);
    setError(null);

    try {
      const response = await api.post(
        `/bookings/${bookingId}/review/${revisionId}/apply-offers`,
        { selectedOffers, strategy: 'manual' }
      );

      if (response.data.success) {
        // Notify parent component
        if (onOffersApplied) {
          onOffersApplied(response.data.data);
        }

        alert(`✅ ${response.data.message}`);
      }
    } catch (err) {
      console.error('Error applying offers:', err);
      setError('Failed to apply selected offers');
    } finally {
      setApplying(false);
    }
  };

  // Toggle offer selection
  const toggleOfferSelection = (offer) => {
    const isSelected = selectedOffers.some(o => o.offerId === offer.offerId);

    if (isSelected) {
      setSelectedOffers(selectedOffers.filter(o => o.offerId !== offer.offerId));
    } else {
      setSelectedOffers([...selectedOffers, offer]);
    }
  };

  // Calculate selected offers total
  const calculateSelectedTotal = () => {
    return selectedOffers.reduce((sum, offer) => sum + offer.discountAmount, 0);
  };

  // Render offer type badge
  const renderOfferTypeBadge = (offerType) => {
    const badges = {
      percentage: { color: 'bg-blue-100 text-blue-700', icon: '📊' },
      fixed_amount: { color: 'bg-green-100 text-green-700', icon: '💰' },
      early_bird: { color: 'bg-purple-100 text-purple-700', icon: '🐦' },
      last_minute: { color: 'bg-orange-100 text-orange-700', icon: '⚡' },
      seasonal: { color: 'bg-teal-100 text-teal-700', icon: '🌤️' }
    };

    const badge = badges[offerType] || badges.percentage;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        <span>{badge.icon}</span>
        <span>{offerType.replace('_', ' ')}</span>
      </span>
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-2 mb-4">
          <Gift className="text-blue-600" size={20} />
          <h3 className="text-lg font-semibold">Special Offers</h3>
        </div>
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-2 mb-4">
          <Gift className="text-blue-600" size={20} />
          <h3 className="text-lg font-semibold">Special Offers</h3>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
          <XCircle className="text-red-600" size={20} />
          <p className="text-red-700">{error}</p>
        </div>
        <button
          onClick={fetchApplicableOffers}
          className="mt-4 text-blue-600 hover:text-blue-700 font-medium text-sm"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!recommendations || !recommendations.hasOffers) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-2 mb-4">
          <Gift className="text-gray-400" size={20} />
          <h3 className="text-lg font-semibold text-gray-700">Special Offers</h3>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
          <AlertCircle className="mx-auto text-gray-400 mb-2" size={32} />
          <p className="text-gray-600">No special offers available for this booking</p>
          <p className="text-gray-500 text-sm mt-1">{recommendations?.message || 'Check back later'}</p>
        </div>
      </div>
    );
  }

  const { applicableOffers, strategies, recommended } = recommendations;
  const bestSingleStrategy = strategies.bestSingle;
  const cumulativeStrategy = strategies.cumulative;

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="text-blue-600" size={20} />
            <h3 className="text-lg font-semibold">Special Offers Available</h3>
            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-bold">
              {applicableOffers.length} offer{applicableOffers.length > 1 ? 's' : ''}
            </span>
          </div>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-blue-600 hover:text-blue-700 font-medium text-sm"
          >
            {showDetails ? 'Hide Details' : 'Show Details'}
          </button>
        </div>
      </div>

      {showDetails && (
        <div className="p-6 space-y-6">
          {/* Recommended Strategy */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <TrendingDown className="text-blue-600 mt-1" size={20} />
              <div className="flex-1">
                <h4 className="font-semibold text-blue-900 mb-1">Recommended: {recommended === 'best_single' ? 'Best Single Offer' : 'Cumulative Offers'}</h4>
                <p className="text-blue-700 text-sm mb-3">
                  {recommended === 'best_single'
                    ? `Apply the best single offer for maximum discount`
                    : `Combine multiple offers for optimum savings`}
                </p>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-2xl font-bold text-blue-900">
                      ₹{(recommended === 'best_single' ? bestSingleStrategy.totalDiscount : cumulativeStrategy.totalDiscount).toLocaleString()}
                    </span>
                    <span className="text-blue-700 text-sm ml-2">
                      ({(recommended === 'best_single' ? bestSingleStrategy.discountPercentage : cumulativeStrategy.discountPercentage)}% off)
                    </span>
                  </div>
                  <button
                    onClick={() => handleAutoApply(recommended)}
                    disabled={applying}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {applying ? 'Applying...' : 'Auto-Apply Best'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Available Offers List */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Available Offers ({applicableOffers.length})</h4>
            <div className="space-y-3">
              {applicableOffers.map((offer, index) => {
                const isSelected = selectedOffers.some(o => o.offerId === offer.offerId);

                return (
                  <div
                    key={offer.offerId}
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300 bg-white'
                    }`}
                    onClick={() => toggleOfferSelection(offer)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        {isSelected ? (
                          <CheckCircle className="text-blue-600" size={20} />
                        ) : (
                          <div className="w-5 h-5 border-2 border-gray-300 rounded-full"></div>
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h5 className="font-semibold text-gray-900">{offer.offerTitle}</h5>
                            <div className="flex items-center gap-2 mt-1">
                              {renderOfferTypeBadge(offer.offerType)}
                              {offer.isFeatured && (
                                <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs font-medium">
                                  ⭐ Featured
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="text-xl font-bold text-green-600">
                              -₹{offer.discountAmount.toLocaleString()}
                            </div>
                            <div className="text-sm text-gray-600">
                              {offer.discountPercentage}% off
                            </div>
                          </div>
                        </div>

                        <p className="text-sm text-gray-600 mb-2">{offer.applicableReason}</p>

                        {offer.termsConditions && (
                          <details className="text-xs text-gray-500">
                            <summary className="cursor-pointer hover:text-gray-700">Terms & Conditions</summary>
                            <p className="mt-1 pl-4">{offer.termsConditions}</p>
                          </details>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Manual Application Controls */}
          {selectedOffers.length > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="font-semibold text-green-900 mb-1">
                    {selectedOffers.length} offer{selectedOffers.length > 1 ? 's' : ''} selected
                  </h5>
                  <p className="text-green-700 text-sm">
                    Total discount: <span className="font-bold">₹{calculateSelectedTotal().toLocaleString()}</span>
                  </p>
                </div>
                <button
                  onClick={handleManualApply}
                  disabled={applying}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {applying ? 'Applying...' : `Apply Selected (${selectedOffers.length})`}
                </button>
              </div>
            </div>
          )}

          {/* Price Preview */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-700">Current Final Price:</span>
              <span className="font-semibold text-gray-900">₹{currentFinalPrice.toLocaleString()}</span>
            </div>
            {selectedOffers.length > 0 && (
              <>
                <div className="flex items-center justify-between mb-2 text-green-600">
                  <span>Total Discount:</span>
                  <span className="font-semibold">-₹{calculateSelectedTotal().toLocaleString()}</span>
                </div>
                <div className="border-t border-gray-300 pt-2 mt-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-900">New Final Price:</span>
                    <span className="text-xl font-bold text-blue-600">
                      ₹{(currentFinalPrice - calculateSelectedTotal()).toLocaleString()}
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SpecialOffersPanel;
