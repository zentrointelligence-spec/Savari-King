import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faSpinner,
  faFilePdf,
  faCheckCircle,
  faTimesCircle,
  faClock,
  faEdit,
  faEye,
  faHistory
} from '@fortawesome/free-solid-svg-icons';
import API_CONFIG, { buildApiUrl, getAuthHeaders } from '../../config/api';

const AdminRevisionHistoryPage = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);

  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(null);
  const [revisions, setRevisions] = useState([]);

  useEffect(() => {
    if (token && bookingId) {
      fetchRevisionHistory();
    }
  }, [token, bookingId]);

  const fetchRevisionHistory = async () => {
    try {
      setLoading(true);

      // Fetch booking details
      const bookingResponse = await axios.get(
        buildApiUrl(`/api/bookings/admin/${bookingId}`),
        { headers: getAuthHeaders(token) }
      );

      if (bookingResponse.data.success) {
        setBooking(bookingResponse.data.data);
      }

      // Fetch all revisions for this booking
      const revisionsResponse = await axios.get(
        buildApiUrl(`/api/bookings/${bookingId}/review/history`),
        { headers: getAuthHeaders(token) }
      );

      if (revisionsResponse.data.success) {
        setRevisions(revisionsResponse.data.data);
      }
    } catch (error) {
      console.error('Error fetching revision history:', error);
      toast.error('Failed to load revision history');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (reviewStatus) => {
    const statusConfig = {
      'in_progress': { color: 'bg-yellow-100 text-yellow-800', icon: faClock, text: 'In Progress' },
      'sent': { color: 'bg-green-100 text-green-800', icon: faCheckCircle, text: 'Sent' },
      'expired': { color: 'bg-gray-100 text-gray-800', icon: faTimesCircle, text: 'Expired' },
      'superseded': { color: 'bg-purple-100 text-purple-800', icon: faHistory, text: 'Superseded' },
      'rejected': { color: 'bg-red-100 text-red-800', icon: faTimesCircle, text: 'Rejected' }
    };

    const config = statusConfig[reviewStatus] || statusConfig['in_progress'];

    return (
      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${config.color} flex items-center justify-center`}>
        <FontAwesomeIcon icon={config.icon} className="mr-2" />
        {config.text}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const openPDF = (pdfPath) => {
    if (!pdfPath) {
      toast.error('PDF not available');
      return;
    }
    // Open PDF in new tab
    const fullUrl = `${API_CONFIG.BASE_URL}${pdfPath}`;
    window.open(fullUrl, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FontAwesomeIcon icon={faSpinner} spin className="text-5xl text-primary mb-4" />
          <p className="text-gray-600">Loading revision history...</p>
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

            <button
              onClick={() => navigate(`/admin/bookings/${bookingId}/review`)}
              className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors flex items-center"
            >
              <FontAwesomeIcon icon={faEdit} className="mr-2" />
              Go to Active Review
            </button>
          </div>

          <div className="border-t pt-4">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Revision History</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Booking Reference</p>
                <p className="font-semibold">{booking.booking_reference}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Customer</p>
                <p className="font-semibold">{booking.contact_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Revisions</p>
                <p className="font-semibold">{revisions.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Revisions List */}
        <div className="space-y-4">
          {revisions.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <p className="text-gray-600">No revisions found for this booking.</p>
            </div>
          ) : (
            revisions.map((revision) => (
              <div
                key={revision.id}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">
                        Revision #{revision.revision_number}
                      </h3>
                      {getStatusBadge(revision.review_status)}
                      {revision.is_active && (
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                          ACTIVE
                        </span>
                      )}
                    </div>

                    {revision.superseded_by && (
                      <p className="text-sm text-purple-600 mb-2">
                        Superseded by Revision #{revisions.find(r => r.id === revision.superseded_by)?.revision_number || '?'}
                      </p>
                    )}
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => navigate(`/admin/bookings/${bookingId}/review`)}
                      className="bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center text-sm"
                      title="View/Edit"
                    >
                      <FontAwesomeIcon icon={revision.is_active ? faEdit : faEye} className="mr-2" />
                      {revision.is_active ? 'Edit' : 'View'}
                    </button>
                  </div>
                </div>

                {/* Pricing Summary */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 bg-gray-50 p-4 rounded-lg">
                  <div>
                    <p className="text-xs text-gray-600">Base Price</p>
                    <p className="font-semibold text-lg">${parseFloat(revision.base_price || 0).toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Vehicles</p>
                    <p className="font-semibold text-lg">${parseFloat(revision.vehicles_price || 0).toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Add-ons</p>
                    <p className="font-semibold text-lg">${parseFloat(revision.addons_price || 0).toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Final Total</p>
                    <p className="font-bold text-xl text-green-600">${parseFloat(revision.final_price || 0).toFixed(2)}</p>
                  </div>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-600">Created</p>
                    <p className="text-sm font-medium">{formatDate(revision.created_at)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Last Updated</p>
                    <p className="text-sm font-medium">{formatDate(revision.updated_at)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Validation Score</p>
                    <div className="flex items-center">
                      <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${revision.validation_score || 0}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold">{revision.validation_score || 0}%</span>
                    </div>
                  </div>
                </div>

                {/* PDFs */}
                {(revision.detailed_pdf_path || revision.general_pdf_path) && (
                  <div className="border-t pt-4">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Generated PDFs:</p>
                    <div className="flex space-x-3">
                      {revision.detailed_pdf_path && (
                        <button
                          onClick={() => openPDF(revision.detailed_pdf_path)}
                          className="flex items-center bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 transition-colors"
                        >
                          <FontAwesomeIcon icon={faFilePdf} className="mr-2" />
                          Detailed Quote PDF
                        </button>
                      )}
                      {revision.general_pdf_path && (
                        <button
                          onClick={() => openPDF(revision.general_pdf_path)}
                          className="flex items-center bg-blue-50 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors"
                        >
                          <FontAwesomeIcon icon={faFilePdf} className="mr-2" />
                          General Quote PDF
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Admin Notes */}
                {revision.admin_notes && (
                  <div className="border-t pt-4 mt-4">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Admin Notes:</p>
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{revision.admin_notes}</p>
                  </div>
                )}

                {/* Rejection Reason */}
                {revision.rejection_reason && (
                  <div className="border-t pt-4 mt-4">
                    <p className="text-sm font-semibold text-red-700 mb-2">Rejection Reason:</p>
                    <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{revision.rejection_reason}</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminRevisionHistoryPage;
