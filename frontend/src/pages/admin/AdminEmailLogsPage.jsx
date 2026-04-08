import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEnvelope,
  faSpinner,
  faCheckCircle,
  faTimesCircle,
  faClock,
  faSearch,
  faFilter,
  faEye,
  faCalendarAlt,
  faUser,
  faFileAlt,
  faChartBar,
  faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';
import { format, parseISO } from 'date-fns';
import { toast } from 'react-toastify';
import API_CONFIG, { buildApiUrl, getAuthHeaders } from '../../config/api';

const AdminEmailLogsPage = () => {
  const [loading, setLoading] = useState(true);
  const [emailLogs, setEmailLogs] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Filters
  const [filters, setFilters] = useState({
    email_type: '',
    status: '',
    search: '',
    limit: 20,
    offset: 0
  });

  const [pagination, setPagination] = useState({
    total: 0,
    limit: 20,
    offset: 0
  });

  useEffect(() => {
    fetchEmailLogs();
    fetchStatistics();
  }, [filters]);

  const fetchEmailLogs = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const queryParams = new URLSearchParams();
      if (filters.email_type) queryParams.append('email_type', filters.email_type);
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.limit) queryParams.append('limit', filters.limit);
      if (filters.offset) queryParams.append('offset', filters.offset);

      const response = await axios.get(
        buildApiUrl(`/api/admin/email-logs?${queryParams.toString()}`),
        { headers: getAuthHeaders(token) }
      );

      if (response.data.success) {
        setEmailLogs(response.data.data.emails);
        setPagination({
          total: response.data.data.total,
          limit: response.data.data.limit,
          offset: response.data.data.offset
        });
      }
    } catch (error) {
      console.error('Error fetching email logs:', error);
      toast.error('Failed to load email logs');
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        buildApiUrl('/api/admin/email-logs/stats'),
        { headers: getAuthHeaders(token) }
      );

      if (response.data.success) {
        setStatistics(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  const fetchEmailDetails = async (emailId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        buildApiUrl(`/api/admin/email-logs/${emailId}`),
        { headers: getAuthHeaders(token) }
      );

      if (response.data.success) {
        setSelectedEmail(response.data.data);
        setShowDetailsModal(true);
      }
    } catch (error) {
      console.error('Error fetching email details:', error);
      toast.error('Failed to load email details');
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      offset: 0 // Reset to first page when filters change
    }));
  };

  const handlePageChange = (newOffset) => {
    setFilters(prev => ({
      ...prev,
      offset: newOffset
    }));
  };

  const getStatusBadge = (status) => {
    const configs = {
      sent: { color: 'bg-green-100 text-green-800', icon: faCheckCircle, text: 'Sent' },
      failed: { color: 'bg-red-100 text-red-800', icon: faTimesCircle, text: 'Failed' },
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: faClock, text: 'Pending' }
    };

    const config = configs[status] || configs.sent;

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${config.color} flex items-center`}>
        <FontAwesomeIcon icon={config.icon} className="mr-1" />
        {config.text}
      </span>
    );
  };

  const getEmailTypeLabel = (type) => {
    const labels = {
      'quote_sent': 'Quote Sent',
      'payment_confirmed': 'Payment Confirmed',
      'booking_cancelled': 'Booking Cancelled',
      'inquiry_confirmation': 'Inquiry Confirmation',
      'password_reset': 'Password Reset',
      'verification_email': 'Email Verification',
      'account_created': 'Account Created'
    };

    return labels[type] || type;
  };

  const totalPages = Math.ceil(pagination.total / pagination.limit);
  const currentPage = Math.floor(pagination.offset / pagination.limit) + 1;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
            <FontAwesomeIcon icon={faEnvelope} className="mr-3 text-primary" />
            Email Logs
          </h1>
          <p className="text-gray-600">
            View all simulated emails sent by the system
          </p>
        </div>

        {/* Statistics Cards */}
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Emails</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {statistics.total}
                  </p>
                </div>
                <FontAwesomeIcon
                  icon={faEnvelope}
                  className="text-3xl text-blue-500"
                />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Today</p>
                  <p className="text-2xl font-bold text-green-600">
                    {statistics.today}
                  </p>
                </div>
                <FontAwesomeIcon
                  icon={faCalendarAlt}
                  className="text-3xl text-green-500"
                />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">By Type</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {statistics.byType?.length || 0}
                  </p>
                </div>
                <FontAwesomeIcon
                  icon={faChartBar}
                  className="text-3xl text-purple-500"
                />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Failed</p>
                  <p className="text-2xl font-bold text-red-600">
                    {statistics.byStatus?.find(s => s.status === 'failed')?.count || 0}
                  </p>
                </div>
                <FontAwesomeIcon
                  icon={faExclamationTriangle}
                  className="text-3xl text-red-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FontAwesomeIcon icon={faFilter} className="mr-2" />
                Email Type
              </label>
              <select
                value={filters.email_type}
                onChange={(e) => handleFilterChange('email_type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">All Types</option>
                <option value="quote_sent">Quote Sent</option>
                <option value="payment_confirmed">Payment Confirmed</option>
                <option value="booking_cancelled">Booking Cancelled</option>
                <option value="inquiry_confirmation">Inquiry Confirmation</option>
                <option value="password_reset">Password Reset</option>
                <option value="verification_email">Email Verification</option>
                <option value="account_created">Account Created</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FontAwesomeIcon icon={faFilter} className="mr-2" />
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">All Statuses</option>
                <option value="sent">Sent</option>
                <option value="failed">Failed</option>
                <option value="pending">Pending</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FontAwesomeIcon icon={faFilter} className="mr-2" />
                Per Page
              </label>
              <select
                value={filters.limit}
                onChange={(e) => handleFilterChange('limit', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
            </div>
          </div>
        </div>

        {/* Email Logs Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <FontAwesomeIcon icon={faSpinner} spin className="text-4xl text-primary mr-3" />
              <p className="text-gray-600">Loading email logs...</p>
            </div>
          ) : emailLogs.length === 0 ? (
            <div className="text-center py-12">
              <FontAwesomeIcon icon={faEnvelope} className="text-5xl text-gray-300 mb-3" />
              <p className="text-gray-600">No email logs found</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                        Date/Time
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                        Type
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                        Recipient
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                        Subject
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                        Booking
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {emailLogs.map((email) => (
                      <tr key={email.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {format(parseISO(email.sent_at), 'dd MMM yyyy, HH:mm')}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                            {getEmailTypeLabel(email.email_type)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <div>
                            <p className="font-medium text-gray-900">
                              {email.recipient_name || 'N/A'}
                            </p>
                            <p className="text-gray-500 text-xs">
                              {email.recipient_email}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {email.subject}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {email.booking_reference ? (
                            <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                              {email.booking_reference}
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {getStatusBadge(email.status)}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <button
                            onClick={() => fetchEmailDetails(email.id)}
                            className="text-primary hover:text-primary-dark font-medium flex items-center"
                          >
                            <FontAwesomeIcon icon={faEye} className="mr-1" />
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Showing {pagination.offset + 1} to{' '}
                  {Math.min(pagination.offset + pagination.limit, pagination.total)} of{' '}
                  {pagination.total} emails
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handlePageChange(Math.max(0, pagination.offset - pagination.limit))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="px-4 py-2 text-sm text-gray-600">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(pagination.offset + pagination.limit)}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Email Details Modal */}
      {showDetailsModal && selectedEmail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">Email Details</h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Email Type</p>
                  <p className="font-semibold text-gray-900">
                    {getEmailTypeLabel(selectedEmail.email_type)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  {getStatusBadge(selectedEmail.status)}
                </div>
                <div>
                  <p className="text-sm text-gray-600">Sent At</p>
                  <p className="font-semibold text-gray-900">
                    {format(parseISO(selectedEmail.sent_at), 'dd MMM yyyy, HH:mm:ss')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Booking Reference</p>
                  <p className="font-mono font-semibold text-gray-900">
                    {selectedEmail.booking_reference || '-'}
                  </p>
                </div>
              </div>

              {/* Recipient Info */}
              <div className="border-t pt-4">
                <h4 className="font-semibold text-gray-900 mb-3">Recipient</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="font-medium text-gray-900">
                      {selectedEmail.recipient_name || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium text-gray-900">
                      {selectedEmail.recipient_email}
                    </p>
                  </div>
                </div>
              </div>

              {/* Email Content */}
              <div className="border-t pt-4">
                <h4 className="font-semibold text-gray-900 mb-3">Subject</h4>
                <p className="text-gray-900">{selectedEmail.subject}</p>
              </div>

              {selectedEmail.body_text && (
                <div className="border-t pt-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Body (Plain Text)</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <pre className="whitespace-pre-wrap text-sm text-gray-700">
                      {selectedEmail.body_text}
                    </pre>
                  </div>
                </div>
              )}

              {selectedEmail.body_html && (
                <div className="border-t pt-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Body (HTML)</h4>
                  <div className="bg-gray-50 p-4 rounded-lg max-h-96 overflow-y-auto">
                    <div dangerouslySetInnerHTML={{ __html: selectedEmail.body_html }} />
                  </div>
                </div>
              )}

              {selectedEmail.error_message && (
                <div className="border-t pt-4">
                  <h4 className="font-semibold text-red-600 mb-3">Error Message</h4>
                  <div className="bg-red-50 p-4 rounded-lg">
                    <p className="text-sm text-red-800">
                      {selectedEmail.error_message}
                    </p>
                  </div>
                </div>
              )}

              {selectedEmail.attachments && (
                <div className="border-t pt-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Attachments</h4>
                  <div className="space-y-2">
                    {JSON.parse(selectedEmail.attachments).map((attachment, index) => (
                      <div key={index} className="flex items-center bg-gray-50 p-3 rounded-lg">
                        <FontAwesomeIcon icon={faFileAlt} className="text-gray-600 mr-3" />
                        <span className="text-sm text-gray-900">{attachment}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminEmailLogsPage;
