import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faCheckCircle,
  faSave,
  faPaperPlane,
  faTimesCircle,
  faSpinner,
  faLightbulb,
  faCalculator
} from '@fortawesome/free-solid-svg-icons';
import API_CONFIG, { buildApiUrl, getAuthHeaders } from '../../config/api';

// Import validation section components (we'll create these next)
import TierValidationSection from '../../components/admin/quoteReview/TierValidationSection';
import VehiclesValidationSection from '../../components/admin/quoteReview/VehiclesValidationSection';
import AddonsValidationSection from '../../components/admin/quoteReview/AddonsValidationSection';
import ParticipantsValidationSection from '../../components/admin/quoteReview/ParticipantsValidationSection';
import DatesValidationSection from '../../components/admin/quoteReview/DatesValidationSection';
import PricingSection from '../../components/admin/quoteReview/PricingSection';

const AdminQuoteReviewPage = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);

  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(null);
  const [revision, setRevision] = useState(null);
  const [autoValidationResults, setAutoValidationResults] = useState(null);
  const [isRunningValidation, setIsRunningValidation] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    tier: true,
    vehicles: true,
    addons: true,
    participants: true,
    dates: true,
    pricing: true
  });

  // Fetch booking and active revision
  useEffect(() => {
    if (token && bookingId) {
      fetchBookingAndRevision();
    }
  }, [token, bookingId]);

  const fetchBookingAndRevision = async () => {
    try {
      setLoading(true);

      // Fetch booking details by ID
      const bookingResponse = await axios.get(
        buildApiUrl(`/api/bookings/admin/${bookingId}`),
        { headers: getAuthHeaders(token) }
      );

      if (bookingResponse.data.success) {
        setBooking(bookingResponse.data.data);
      } else {
        console.error('Booking not found with ID:', bookingId);
      }

      // Check if there's an active revision (draft, in_review, validated, approved)
      try {
        const revisionResponse = await axios.get(
          buildApiUrl(`/api/bookings/${bookingId}/review/active`),
          { headers: getAuthHeaders(token) }
        );

        if (revisionResponse.data.success) {
          setRevision(revisionResponse.data.data);
        }
      } catch (revisionError) {
        // No active revision - try to get the latest one (could be 'sent')
        console.log('No active revision found, checking for latest revision');
        try {
          const latestRevisionResponse = await axios.get(
            buildApiUrl(`/api/bookings/${bookingId}/review/latest`),
            { headers: getAuthHeaders(token) }
          );

          if (latestRevisionResponse.data.success) {
            setRevision(latestRevisionResponse.data.data);
            console.log('Found latest revision with status:', latestRevisionResponse.data.data.review_status);
          }
        } catch (latestError) {
          // No revision at all - we'll need to start one
          console.log('No revision found at all');
        }
      }

    } catch (error) {
      console.error('Error fetching booking:', error);
      toast.error('Failed to load booking details');
    } finally {
      setLoading(false);
    }
  };

  const startReview = async () => {
    try {
      setLoading(true);
      const response = await axios.post(
        buildApiUrl(`/api/bookings/${bookingId}/review/start`),
        {},
        { headers: getAuthHeaders(token) }
      );

      if (response.data.success) {
        toast.success('Review started successfully!');
        fetchBookingAndRevision();
      }
    } catch (error) {
      console.error('Error starting review:', error);
      toast.error(error.response?.data?.error || 'Failed to start review');
    } finally {
      setLoading(false);
    }
  };

  const runAutoValidation = async () => {
    try {
      setIsRunningValidation(true);
      const response = await axios.post(
        buildApiUrl(`/api/bookings/${bookingId}/review/${revision.id}/auto-validate`),
        {},
        { headers: getAuthHeaders(token) }
      );

      if (response.data.success) {
        setAutoValidationResults(response.data.data.validation);
        setRevision(response.data.data.revision);
        // Collapse all sections after auto-validate
        setExpandedSections({
          tier: false,
          vehicles: false,
          addons: false,
          participants: false,
          dates: false,
          pricing: false
        });
        toast.success('Auto-validation completed!');
      }
    } catch (error) {
      console.error('Error running auto-validation:', error);
      toast.error('Failed to run auto-validation');
    } finally {
      setIsRunningValidation(false);
    }
  };

  const toggleSection = (sectionName) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionName]: !prev[sectionName]
    }));
  };

  const updateSection = async (sectionType, data) => {
    try {
      setIsSaving(true);
      const response = await axios.patch(
        buildApiUrl(`/api/bookings/${bookingId}/review/${revision.id}/${sectionType}`),
        data,
        { headers: getAuthHeaders(token) }
      );

      if (response.data.success) {
        setRevision(response.data.data);
        toast.success(`${sectionType} section updated successfully!`);
        return true;
      }
    } catch (error) {
      console.error(`Error updating ${sectionType}:`, error);
      toast.error(`Failed to update ${sectionType} section`);
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const createNewRevision = async () => {
    if (!window.confirm('Create a new revision? This will supersede the current revision.')) {
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(
        buildApiUrl(`/api/bookings/${bookingId}/review/new-revision`),
        {},
        { headers: getAuthHeaders(token) }
      );

      if (response.data.success) {
        toast.success('New revision created successfully!');
        // Refresh the page data
        fetchBookingAndRevision();
      }
    } catch (error) {
      console.error('Error creating new revision:', error);
      toast.error(error.response?.data?.error || 'Failed to create new revision');
    } finally {
      setLoading(false);
    }
  };

  const sendQuote = async () => {
    if (!window.confirm('Are you sure you want to send this quote to the customer? PDFs will be generated and emailed.')) {
      return;
    }

    try {
      setIsSaving(true);
      const response = await axios.post(
        buildApiUrl(`/api/bookings/${bookingId}/review/${revision.id}/send-quote`),
        {},
        { headers: getAuthHeaders(token) }
      );

      if (response.data.success) {
        toast.success('Quote sent successfully to customer!');
        setTimeout(() => navigate('/admin/bookings'), 2000);
      }
    } catch (error) {
      console.error('Error sending quote:', error);
      toast.error(error.response?.data?.error || 'Failed to send quote');
    } finally {
      setIsSaving(false);
    }
  };

  const rejectQuote = async () => {
    const reason = window.prompt('Please provide a reason for rejecting this quote:');
    if (!reason) return;

    try {
      setIsSaving(true);
      const response = await axios.patch(
        buildApiUrl(`/api/bookings/${bookingId}/review/${revision.id}/status`),
        {
          review_status: 'rejected',
          rejection_reason: reason
        },
        { headers: getAuthHeaders(token) }
      );

      if (response.data.success) {
        toast.success('Quote rejected');
        setTimeout(() => navigate('/admin/bookings'), 2000);
      }
    } catch (error) {
      console.error('Error rejecting quote:', error);
      toast.error('Failed to reject quote');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FontAwesomeIcon icon={faSpinner} spin className="text-5xl text-primary mb-4" />
          <p className="text-gray-600">Loading quote review...</p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-xl mb-4">Booking not found</p>
          <button
            onClick={() => navigate('/admin/bookings')}
            className="bg-primary text-white px-6 py-2 rounded-lg"
          >
            Back to Bookings
          </button>
        </div>
      </div>
    );
  }

  if (!revision) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <FontAwesomeIcon icon={faLightbulb} className="text-6xl text-yellow-500 mb-4" />
            <h2 className="text-2xl font-bold mb-4">Start Quote Review</h2>
            <p className="text-gray-600 mb-6">
              No active review found for booking #{bookingId}. Start a new review to validate and send a quote to the customer.
            </p>
            <div className="space-y-3">
              <button
                onClick={startReview}
                className="w-full bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition-colors"
              >
                Start Review
              </button>
              <button
                onClick={() => navigate('/admin/bookings')}
                className="w-full bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Back to Bookings
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const validationScore = revision.validation_score || 0;
  const allSectionsValidated = revision.all_sections_validated || false;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate('/admin/bookings')}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
              Back to Bookings
            </button>

            <div className="flex items-center space-x-3">
              {/* Show Create New Revision button if quote was already sent */}
              {booking.status === 'Quote Sent' && revision.review_status === 'sent' && (
                <button
                  onClick={createNewRevision}
                  disabled={loading}
                  className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50 flex items-center"
                >
                  <FontAwesomeIcon icon={faSave} className="mr-2" />
                  Create New Revision
                </button>
              )}

              <button
                onClick={runAutoValidation}
                disabled={isRunningValidation}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center"
              >
                {isRunningValidation ? (
                  <>
                    <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
                    Running...
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faCalculator} className="mr-2" />
                    Auto-Validate
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Quote Review</h1>
              <p className="text-gray-600">Booking #{booking.id} - {booking.booking_reference}</p>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Validation Progress</div>
              <div className="flex items-center">
                <div className="flex-1 bg-white rounded-full h-3 mr-3">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all"
                    style={{ width: `${validationScore}%` }}
                  />
                </div>
                <span className="text-2xl font-bold text-blue-600">{validationScore}%</span>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Status</div>
              <div className="flex items-center">
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  allSectionsValidated
                    ? 'bg-green-500 text-white'
                    : 'bg-yellow-500 text-white'
                }`}>
                  {allSectionsValidated ? 'Ready to Send' : 'In Progress'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Validation Sections */}
        <div className="space-y-6">
          <TierValidationSection
            booking={booking}
            revision={revision}
            onUpdate={(data) => updateSection('tier', data)}
            autoValidation={autoValidationResults?.tier_validation}
            isExpanded={expandedSections.tier}
            onToggleExpand={() => toggleSection('tier')}
          />

          <VehiclesValidationSection
            booking={booking}
            revision={revision}
            onUpdate={(data) => updateSection('vehicles', data)}
            autoValidation={autoValidationResults?.vehicles_validation}
            isExpanded={expandedSections.vehicles}
            onToggleExpand={() => toggleSection('vehicles')}
          />

          <AddonsValidationSection
            booking={booking}
            revision={revision}
            onUpdate={(data) => updateSection('addons', data)}
            autoValidation={autoValidationResults?.addons_validation}
            isExpanded={expandedSections.addons}
            onToggleExpand={() => toggleSection('addons')}
          />

          <ParticipantsValidationSection
            booking={booking}
            revision={revision}
            onUpdate={(data) => updateSection('participants', data)}
            autoValidation={autoValidationResults?.participants_validation}
            isExpanded={expandedSections.participants}
            onToggleExpand={() => toggleSection('participants')}
          />

          <DatesValidationSection
            booking={booking}
            revision={revision}
            onUpdate={(data) => updateSection('dates', data)}
            autoValidation={autoValidationResults?.date_validation}
            isExpanded={expandedSections.dates}
            onToggleExpand={() => toggleSection('dates')}
          />

          <PricingSection
            booking={booking}
            revision={revision}
            onUpdate={(data) => updateSection('pricing', data)}
          />
        </div>

        {/* Action Buttons */}
        {revision.review_status !== 'sent' ? (
          <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
            <div className="flex items-center justify-between">
              <button
                onClick={rejectQuote}
                disabled={isSaving}
                className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center"
              >
                <FontAwesomeIcon icon={faTimesCircle} className="mr-2" />
                Reject Quote
              </button>

              <button
                onClick={sendQuote}
                disabled={isSaving || !allSectionsValidated}
                className="bg-green-500 text-white px-8 py-3 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center text-lg font-semibold"
              >
                {isSaving ? (
                  <>
                    <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
                    Sending...
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faPaperPlane} className="mr-2" />
                    Send Quote to Customer
                  </>
                )}
              </button>
            </div>

            {!allSectionsValidated && (
              <p className="text-center text-sm text-yellow-600 mt-4">
                ⚠️ Please validate all sections before sending the quote
              </p>
            )}
          </div>
        ) : (
          <div className="bg-blue-50 rounded-xl shadow-lg p-6 mt-6 border-2 border-blue-200">
            <div className="flex items-center justify-center">
              <div className="text-center">
                <FontAwesomeIcon icon={faCheckCircle} className="text-blue-500 text-3xl mb-2" />
                <h3 className="text-lg font-bold text-gray-900 mb-1">Quote Already Sent</h3>
                <p className="text-gray-600 mb-3">
                  This quote was sent on {new Date(revision.quote_sent_at).toLocaleString()}
                </p>
                <p className="text-sm text-gray-500">
                  Use "Create New Revision" above to modify and resend this quote
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminQuoteReviewPage;
