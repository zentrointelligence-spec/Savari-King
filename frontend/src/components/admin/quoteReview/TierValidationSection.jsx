import React, { useState, useEffect, useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCheckCircle,
  faTimesCircle,
  faEdit,
  faSave,
  faChevronDown,
  faChevronUp,
  faInfoCircle
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { AuthContext } from '../../../contexts/AuthContext';
import API_CONFIG, { buildApiUrl, getAuthHeaders } from '../../../config/api';
import { toast } from 'react-toastify';

// Age categories matching the booking system
const AGE_CATEGORIES = [
  { id: 'infant', label: '0-2 years', min: 0, max: 2 },
  { id: 'child', label: '3-7 years', min: 3, max: 7 },
  { id: 'preteen', label: '8-13 years', min: 8, max: 13 },
  { id: 'teen', label: '14-17 years', min: 14, max: 17 },
  { id: 'adult', label: '18-59 years', min: 18, max: 59 },
  { id: 'senior', label: '60+ years', min: 60, max: 100 }
];

const TierValidationSection = ({ booking, revision, onUpdate, autoValidation, isExpanded: controlledIsExpanded, onToggleExpand }) => {
  const { token } = useContext(AuthContext);
  const [internalIsExpanded, setInternalIsExpanded] = useState(true);

  // Use controlled prop if provided, otherwise use internal state
  const isExpanded = controlledIsExpanded !== undefined ? controlledIsExpanded : internalIsExpanded;
  const toggleExpanded = () => {
    if (onToggleExpand) {
      onToggleExpand();
    } else {
      setInternalIsExpanded(!internalIsExpanded);
    }
  };
  const [availableTiers, setAvailableTiers] = useState([]);
  const [selectedTierId, setSelectedTierId] = useState(booking?.tier_id || '');
  const [selectedTierPricePerPerson, setSelectedTierPricePerPerson] = useState(0);

  // Initialize participant counts from participant_ages JSONB
  const [participants, setParticipants] = useState({
    infant: 0,
    child: 0,
    preteen: 0,
    teen: 0,
    adult: 0,
    senior: 0
  });

  const [formData, setFormData] = useState({
    tier_validated: revision?.tier_validated || false,
    tier_adjusted_price: revision?.tier_adjusted_price || '',
    tier_adjustment_reason: revision?.tier_adjustment_reason || '',
    tier_notes: revision?.tier_notes || '',
    tier_availability_confirmed: revision?.tier_availability_confirmed || false,
    new_tier_id: null,
    new_participant_ages: null
  });

  // Update formData when revision changes (e.g., after auto-validate)
  useEffect(() => {
    if (revision) {
      setFormData(prev => ({
        ...prev,
        tier_validated: revision.tier_validated || false,
        tier_availability_confirmed: revision.tier_availability_confirmed || false,
        tier_adjusted_price: revision.tier_adjusted_price || prev.tier_adjusted_price,
        tier_adjustment_reason: revision.tier_adjustment_reason || prev.tier_adjustment_reason,
        tier_notes: revision.tier_notes || prev.tier_notes
      }));
    }
  }, [revision?.tier_validated, revision?.tier_availability_confirmed, revision?.tier_adjusted_price]);

  // Initialize participants from booking data
  useEffect(() => {
    if (booking?.participant_ages && Array.isArray(booking.participant_ages)) {
      const counts = {
        infant: 0,
        child: 0,
        preteen: 0,
        teen: 0,
        adult: 0,
        senior: 0
      };

      booking.participant_ages.forEach(p => {
        if (counts.hasOwnProperty(p.id)) {
          counts[p.id]++;
        }
      });

      setParticipants(counts);
    } else {
      // Fallback to num_adults and num_children
      setParticipants({
        infant: 0,
        child: 0,
        preteen: 0,
        teen: 0,
        adult: booking?.num_adults || 0,
        senior: 0
      });
    }
  }, [booking]);

  // Fetch available tiers for this tour
  useEffect(() => {
    const fetchTiers = async () => {
      if (!booking?.tour_id) return;
      try {
        const response = await axios.get(
          buildApiUrl(`/api/tours/${booking.tour_id}/tiers`),
          { headers: getAuthHeaders(token) }
        );

        if (response.data.success) {
          const tiers = response.data.data || [];
          setAvailableTiers(tiers);

          // Find current tier price per person
          const currentTier = tiers.find(t => t.id === selectedTierId);
          if (currentTier) {
            setSelectedTierPricePerPerson(parseFloat(currentTier.price || 0));
          }
        }
      } catch (error) {
        console.error('Error fetching tiers:', error);
        toast.error('Failed to load available tiers');
      }
    };
    fetchTiers();
  }, [booking?.tour_id, token, selectedTierId]);

  const handleTierChange = (tierId) => {
    if (!tierId) {
      setSelectedTierId(booking?.tier_id || '');
      setFormData({
        ...formData,
        new_tier_id: null,
        tier_adjustment_reason: ''
      });
      return;
    }

    setSelectedTierId(tierId);
    const tier = availableTiers.find(t => t.id === parseInt(tierId));
    if (tier) {
      // tier.price est le prix PAR PERSONNE
      const pricePerPerson = parseFloat(tier.price || 0);
      setSelectedTierPricePerPerson(pricePerPerson);

      // Calculer le prix total basé sur les participants actuels
      const totals = calculateTotals();
      const totalPrice = pricePerPerson * totals.total;

      setFormData({
        ...formData,
        new_tier_id: tier.id,
        tier_adjusted_price: totalPrice,
        tier_adjustment_reason: `Tier changed from ${booking.tier_name} to ${tier.name} (${totals.total} participants × ₹${pricePerPerson.toLocaleString('en-IN')}/person)`
      });
    }
  };

  const handleParticipantChange = (categoryId, value) => {
    // Allow empty string temporarily, convert to 0 when saving
    // This allows users to clear the input completely
    const count = value === '' ? 0 : parseInt(value);
    setParticipants({
      ...participants,
      [categoryId]: isNaN(count) ? 0 : Math.max(0, count)
    });
  };

  const calculateTotals = () => {
    const total = Object.values(participants).reduce((sum, count) => sum + count, 0);
    const num_adults = participants.adult + participants.senior;
    const num_children = participants.infant + participants.child + participants.preteen + participants.teen;
    return { total, num_adults, num_children };
  };

  // Calculer le prix total du package basé sur les participants
  const calculateTotalPackagePrice = () => {
    const totals = calculateTotals();
    return selectedTierPricePerPerson * totals.total;
  };

  // Mettre à jour le prix ajusté quand les participants changent
  useEffect(() => {
    if (formData.new_tier_id && selectedTierPricePerPerson > 0) {
      const totals = calculateTotals();
      const totalPrice = selectedTierPricePerPerson * totals.total;

      setFormData(prev => ({
        ...prev,
        tier_adjusted_price: totalPrice,
        tier_adjustment_reason: prev.tier_adjustment_reason.includes('Tier changed')
          ? prev.tier_adjustment_reason.split('(')[0] + `(${totals.total} participants × ₹${selectedTierPricePerPerson.toLocaleString('en-IN')}/person)`
          : prev.tier_adjustment_reason
      }));
    }
  }, [participants, selectedTierPricePerPerson]);

  const handleSave = async () => {
    const totals = calculateTotals();

    // Build participant_ages array
    const participant_ages = [];
    Object.keys(participants).forEach(categoryId => {
      const count = participants[categoryId];
      const category = AGE_CATEGORIES.find(c => c.id === categoryId);
      for (let i = 0; i < count; i++) {
        participant_ages.push(category);
      }
    });

    // Prepare data to send
    const updateData = {
      ...formData,
      new_participant_ages: participant_ages.length > 0 ? participant_ages : null,
      new_num_adults: totals.num_adults,
      new_num_children: totals.num_children
    };

    const success = await onUpdate(updateData);
    if (success) {
      toast.success('Tier validation updated successfully!');
    }
  };

  const isValidated = revision?.tier_validated || false;
  const totals = calculateTotals();
  const hasChanges = formData.new_tier_id || totals.total !== ((booking?.num_adults || 0) + (booking?.num_children || 0));

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div
        className={`p-6 cursor-pointer transition-colors ${
          isValidated ? 'bg-green-50' : 'bg-gray-50'
        }`}
        onClick={toggleExpanded}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              isValidated ? 'bg-green-500' : 'bg-gray-300'
            }`}>
              <FontAwesomeIcon
                icon={isValidated ? faCheckCircle : faTimesCircle}
                className="text-white"
              />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">1. Package Tier Validation</h3>
              <p className="text-sm text-gray-600">
                Verify package tier and participant counts
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {isValidated && (
              <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                Validated
              </span>
            )}
            <FontAwesomeIcon
              icon={isExpanded ? faChevronUp : faChevronDown}
              className="text-gray-500"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="p-6 border-t border-gray-200">
          {/* Current Booking Info */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded-r-lg">
            <h4 className="font-semibold text-gray-900 mb-3">Current Booking Information</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Package Tier</p>
                <p className="font-semibold text-gray-900">{booking.tier_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Price Per Person</p>
                <p className="font-semibold text-gray-900">
                  ₹{selectedTierPricePerPerson.toLocaleString('en-IN')}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Package Price</p>
                <p className="font-bold text-primary text-lg">
                  ₹{calculateTotalPackagePrice().toLocaleString('en-IN')}
                </p>
                <p className="text-xs text-gray-500">({totals.total} participants)</p>
              </div>
            </div>

            <div className="mt-4">
              <p className="text-sm text-gray-600 mb-2">Current Participants:</p>
              <div className="grid grid-cols-3 gap-3">
                {AGE_CATEGORIES.map(category => {
                  const initialCount = participants[category.id];
                  if (initialCount === 0) return null;
                  return (
                    <div key={category.id} className="bg-white p-2 rounded">
                      <p className="text-xs text-gray-500">{category.label}</p>
                      <p className="font-bold text-gray-900">{initialCount}</p>
                    </div>
                  );
                })}
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Total: <span className="font-bold">{totals.total} participants</span>
              </p>
            </div>
          </div>

          {/* Important Notice */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6 flex items-start">
            <FontAwesomeIcon icon={faInfoCircle} className="text-yellow-600 mt-1 mr-3" />
            <div className="text-sm text-yellow-800">
              <strong>Note:</strong> The tier price is calculated per person and multiplied by the total number of participants.
              Additional costs may apply for vehicles and add-ons.
            </div>
          </div>

          {/* Change Tier Section */}
          <div className="bg-purple-50 border-l-4 border-purple-500 p-4 mb-6 rounded-r-lg">
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
              <FontAwesomeIcon icon={faEdit} className="mr-2 text-purple-600" />
              Change Package Tier
            </h4>

            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Select New Tier (optional)
              </label>
              <select
                value={selectedTierId}
                onChange={(e) => handleTierChange(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              >
                <option value="">Keep current tier ({booking.tier_name})</option>
                {availableTiers.map((tier) => (
                  <option key={tier.id} value={tier.id}>
                    {tier.name} - ₹{parseFloat(tier.price || 0).toLocaleString('en-IN')}/person
                  </option>
                ))}
              </select>
            </div>

            {formData.new_tier_id && (
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <p className="text-sm text-gray-700 mb-1">Price Per Person:</p>
                <p className="text-lg font-bold text-purple-600">
                  ₹{selectedTierPricePerPerson.toLocaleString('en-IN')}
                </p>
                <p className="text-sm text-gray-700 mb-1 mt-3">Total Package Price:</p>
                <p className="text-2xl font-bold text-purple-700">
                  ₹{(selectedTierPricePerPerson * totals.total).toLocaleString('en-IN')}
                </p>
                <p className="text-xs text-gray-500 mt-1">({totals.total} participants × ₹{selectedTierPricePerPerson.toLocaleString('en-IN')})</p>
              </div>
            )}
          </div>

          {/* Modify Participants Section */}
          <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6 rounded-r-lg">
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
              <FontAwesomeIcon icon={faEdit} className="mr-2 text-green-600" />
              Modify Participant Counts
            </h4>

            <div className="grid grid-cols-3 gap-4">
              {AGE_CATEGORIES.map((category) => (
                <div key={category.id}>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <span className="capitalize">{category.id}</span>
                    <span className="text-xs text-gray-500 ml-1">({category.label})</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={participants[category.id]}
                    onChange={(e) => handleParticipantChange(category.id, e.target.value)}
                    onFocus={(e) => e.target.select()}
                    placeholder="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              ))}
            </div>

            <div className="mt-4 p-3 bg-white border border-green-300 rounded-lg">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Adults (18+):</p>
                  <p className="font-bold text-gray-900">{totals.num_adults}</p>
                </div>
                <div>
                  <p className="text-gray-600">Children (&lt;18):</p>
                  <p className="font-bold text-gray-900">{totals.num_children}</p>
                </div>
                <div>
                  <p className="text-gray-600">Total Participants:</p>
                  <p className="font-bold text-green-600 text-lg">{totals.total}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Auto-Validation Results */}
          {autoValidation && (
            <div className={`p-4 mb-6 rounded-lg ${
              autoValidation.available ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
            }`}>
              <h5 className="font-semibold mb-2 flex items-center">
                <FontAwesomeIcon
                  icon={autoValidation.available ? faCheckCircle : faTimesCircle}
                  className={`mr-2 ${autoValidation.available ? 'text-green-600' : 'text-red-600'}`}
                />
                Auto-Validation Results
              </h5>
              <p className={autoValidation.available ? 'text-green-800' : 'text-red-800'}>
                {autoValidation.reason || 'Tier is available'}
              </p>
            </div>
          )}

          {/* Validation Form */}
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.tier_validated}
                  onChange={(e) => setFormData({ ...formData, tier_validated: e.target.checked })}
                  className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                />
                <span className="font-semibold text-gray-900">Mark tier as validated</span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.tier_availability_confirmed}
                  onChange={(e) => setFormData({ ...formData, tier_availability_confirmed: e.target.checked })}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-gray-900">Availability confirmed</span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Adjustment Reason (if tier or participants changed)
              </label>
              <input
                type="text"
                value={formData.tier_adjustment_reason}
                onChange={(e) => setFormData({ ...formData, tier_adjustment_reason: e.target.value })}
                placeholder="e.g., Customer requested tier upgrade"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Internal Notes
              </label>
              <textarea
                value={formData.tier_notes}
                onChange={(e) => setFormData({ ...formData, tier_notes: e.target.value })}
                rows="3"
                placeholder="Any additional notes about this tier..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>

            {hasChanges && (
              <div className="bg-blue-100 border border-blue-300 rounded-lg p-3 text-sm text-blue-800">
                <strong>⚠️ Changes Detected!</strong> The base price and participant counts will be updated when you save.
              </div>
            )}

            <div className="flex justify-end pt-4">
              <button
                onClick={handleSave}
                className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark transition-colors flex items-center"
              >
                <FontAwesomeIcon icon={faSave} className="mr-2" />
                Save Tier Validation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TierValidationSection;
