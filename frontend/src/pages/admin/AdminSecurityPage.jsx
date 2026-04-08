import React, { useState, useEffect, useContext } from "react";
import { apiUtils } from '../../utils/apiUtils';
import { AuthContext } from "../../contexts/AuthContext";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faShieldAlt,
  faSearch,
  faSync,
  faCheckCircle,
  faTimesCircle,
  faLock,
  faLockOpen,
  faHistory,
  faUserLock,
  faUserShield,
  faChartLine,
  faExclamationTriangle,
  faEye,
  faBan,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { Suspense } from "react";

// Chargement dynamique pour les graphiques
const SecurityActivityChart = React.lazy(() =>
  import("../../components/admin/SecurityActivityChart")
);

// Composant de badge de statut
const SecurityStatusBadge = ({ status }) => {
  const statusConfig = {
    pending: { color: "bg-yellow-100 text-yellow-800", icon: faUserLock },
    approved: { color: "bg-green-100 text-green-800", icon: faLockOpen },
    rejected: { color: "bg-red-100 text-red-800", icon: faBan },
    expired: { color: "bg-gray-100 text-gray-800", icon: faHistory },
  };

  const config = statusConfig[status] || {
    color: "bg-gray-100 text-gray-800",
    icon: faUserShield,
  };

  return (
    <div
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${config.color}`}
    >
      <FontAwesomeIcon icon={config.icon} className="mr-1.5 text-xs" />
      <span className="capitalize">{status}</span>
    </div>
  );
};

// Carte de statistiques de sécurité
const SecurityStatCard = ({ title, value, icon, color, trend }) => (
  <div className="bg-white p-5 rounded-xl shadow-lg border-l-4 border-b-0 border-t-0 border-r-0 border-l-4 border-l-${color}">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">
          {title}
        </p>
        <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
      </div>
      <div
        className={`w-12 h-12 rounded-full ${color} bg-opacity-20 flex items-center justify-center`}
      >
        <FontAwesomeIcon icon={icon} className={`text-xl ${color}`} />
      </div>
    </div>
    {trend !== undefined && (
      <div
        className={`mt-2 text-sm ${
          trend >= 0 ? "text-green-600" : "text-red-600"
        }`}
      >
        <FontAwesomeIcon icon={faChartLine} className="mr-1" />
        {Math.abs(trend)}% {trend >= 0 ? "increase" : "decrease"} from last week
      </div>
    )}
  </div>
);

// Ligne de demande
const RequestRow = ({ request, onApprove, onReject, onViewDetails }) => {
  const [showActions, setShowActions] = useState(false);

  return (
    <tr
      className="border-b hover:bg-gray-50 transition-colors"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <td className="px-6 py-4">
        <div className="flex items-center">
          <div className="bg-gray-200 border-2 border-dashed rounded-full w-10 h-10 flex items-center justify-center">
            <FontAwesomeIcon icon={faUserLock} className="text-gray-500" />
          </div>
          <div className="ml-4">
            <div className="font-medium text-gray-900">{request.email}</div>
            <div className="text-gray-500 text-xs">ID: {request.id}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="text-gray-900">
          {new Date(request.requested_at).toLocaleString()}
        </div>
        <div className="text-gray-500 text-xs">
          {request.expires_at
            ? `Expires: ${new Date(request.expires_at).toLocaleDateString()}`
            : "No expiration"}
        </div>
      </td>
      <td className="px-6 py-4">
        <SecurityStatusBadge status={request.status} />
      </td>
      <td className="px-6 py-4">
        <div className="text-gray-900">
          {request.device || "Unknown device"}
        </div>
        <div className="text-gray-500 text-xs">
          {request.location || "Location not available"}
        </div>
      </td>
      <td className="px-6 py-4">
        <div
          className={`flex items-center space-x-3 transition-opacity ${
            showActions ? "opacity-100" : "opacity-0"
          }`}
        >
          <button
            onClick={() => onApprove(request.id)}
            className="p-2 text-green-600 hover:bg-green-50 rounded-full"
            title="Approve"
          >
            <FontAwesomeIcon icon={faCheckCircle} />
          </button>

          <button
            onClick={() => onReject(request.id)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-full"
            title="Reject"
          >
            <FontAwesomeIcon icon={faTimesCircle} />
          </button>

          <button
            onClick={() => onViewDetails(request.id)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"
            title="View Details"
          >
            <FontAwesomeIcon icon={faEye} />
          </button>
        </div>
      </td>
    </tr>
  );
};

const AdminSecurityPage = () => {
  const [requests, setRequests] = useState([]);
  const [securityLogs, setSecurityLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isTableLoading, setIsTableLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("pending");
  const [refreshing, setRefreshing] = useState(false);
  const { token } = useContext(AuthContext);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSecurityData();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, statusFilter, token]);

  const fetchSecurityData = async () => {
    setRefreshing(true);
    setIsTableLoading(true);
    try {
      const params = new URLSearchParams({
        searchTerm,
        status: statusFilter,
      });
      // Fetch password reset requests
      const requestsResponse = await apiUtils.admin.getPasswordResets();

      // Fetch security statistics
      const statsResponse = await apiUtils.admin.getSecurityStats();

      // Fetch security logs with improved error handling
      let logsData = [];
      try {
        const logsResponse = await apiUtils.admin.getSecurityLogs();
        logsData = logsResponse.data;
      } catch (logsError) {
        console.error("Error fetching security logs:", logsError);
        if (logsError.response?.status === 500) {
          toast.warning(
            "Security logs are temporarily unavailable. The audit system may need to be initialized."
          );
        } else {
          toast.error("Could not fetch security logs.");
        }
        // Continue with empty logs instead of failing completely
        logsData = [];
      }

      setRequests(requestsResponse.data);
      setStats(statsResponse.data);
      setSecurityLogs(logsData);
    } catch (error) {
      console.error("Error fetching security data:", error);
      toast.error("Could not fetch security data.");
    } finally {
      setLoading(false);
      setRefreshing(false);
      setIsTableLoading(false);
    }
  };

  const handleApprove = async (resetId) => {
    try {
      const response = await apiUtils.admin.approvePasswordReset(resetId);

      toast.success(
        response.data.message || "Reset request approved. Email sent to user."
      );

      // Update local state instead of refetching everything
      setRequests(
        requests.map((req) =>
          req.id === resetId ? { ...req, status: "approved" } : req
        )
      );
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to approve request.");
    }
  };

  const handleReject = async (resetId) => {
    if (
      !window.confirm(
        "Are you sure you want to reject this password reset request?"
      )
    )
      return;

    try {
      const response = await apiUtils.admin.rejectPasswordReset(resetId);

      toast.success(response.data.message || "Reset request rejected.");

      // Update local state
      setRequests(
        requests.map((req) =>
          req.id === resetId ? { ...req, status: "rejected" } : req
        )
      );
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to reject request.");
    }
  };

  const handleViewDetails = (requestId) => {
    const request = requests.find((r) => r.id === requestId);
    toast.info(
      `Viewing details for request #${requestId} from ${request.email}`
    );
    // In a real app, this would open a modal with detailed information
  };

  const handleViewLogDetails = (logId) => {
    toast.info(`Viewing details for security log #${logId}`);
    // In a real app, this would open a modal with detailed log information
  };


  if (loading || !stats) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <div className="h-10 w-64 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-10 w-48 bg-gray-200 rounded animate-pulse"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-xl shadow-lg p-6 h-32 animate-pulse"
            ></div>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="h-64 bg-gray-100 rounded-lg animate-pulse"></div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[...Array(2)].map((_, i) => (
              <div
                key={i}
                className="h-12 bg-gray-100 rounded-lg animate-pulse"
              ></div>
            ))}
          </div>

          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-20 bg-gray-100 rounded-lg animate-pulse"
              ></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header with actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <FontAwesomeIcon icon={faShieldAlt} className="text-primary" />
            Security Center
          </h1>
          <p className="text-gray-600 mt-2">
            Monitor and manage security activities across your platform
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={fetchSecurityData}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <FontAwesomeIcon
              icon={faSync}
              className={`${refreshing ? "animate-spin" : ""}`}
            />
            Refresh Data
          </button>
        </div>
      </div>

      {/* Security statistics cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <SecurityStatCard
          title="Pending Requests"
          value={stats.pending_requests}
          icon={faUserLock}
          color="text-yellow-500"
          trend={stats.pending_trend}
        />

        <SecurityStatCard
          title="Security Events"
          value={stats.total_events}
          icon={faExclamationTriangle}
          color="text-red-500"
          trend={stats.events_trend}
        />

        <SecurityStatCard
          title="Active Sessions"
          value={stats.active_sessions}
          icon={faLockOpen}
          color="text-blue-500"
        />

        <SecurityStatCard
          title="Blocked Attempts"
          value={stats.blocked_attempts}
          icon={faBan}
          color="text-purple-500"
          trend={stats.blocked_trend}
        />
      </div>

      {/* Security activity chart */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">
            Security Activity Timeline
          </h2>
          <div className="text-sm text-gray-500">
            Last 30 days of security events
          </div>
        </div>
        <div className="h-64">
          <Suspense
            fallback={
              <div className="h-64 bg-gray-100 rounded animate-pulse"></div>
            }
          >
            <SecurityActivityChart data={stats} />
          </Suspense>
        </div>
      </div>

      {/* Password reset requests section */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <FontAwesomeIcon icon={faLock} className="text-blue-500" />
            Password Reset Requests
          </h2>
          <div className="text-sm text-gray-500">
            {requests.length} {statusFilter} requests
          </div>
        </div>

        {/* Filters and search */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="md:col-span-2">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FontAwesomeIcon icon={faSearch} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by email or request ID..."
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FontAwesomeIcon icon={faTrash} className="text-gray-400" />
              </div>
              <select
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent appearance-none"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="pending">Pending Only</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="expired">Expired</option>
                <option value="all">All Requests</option>
              </select>
            </div>
          </div>

          <div>
            <button
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("pending");
              }}
              className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg border border-gray-200 hover:bg-gray-200"
            >
              Reset Filters
            </button>
          </div>
        </div>

        {/* Requests table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left font-semibold text-gray-700">
                  User
                </th>
                <th className="px-6 py-4 text-left font-semibold text-gray-700">
                  Request Time
                </th>
                <th className="px-6 py-4 text-left font-semibold text-gray-700">
                  Status
                </th>
                <th className="px-6 py-4 text-left font-semibold text-gray-700">
                  Device & Location
                </th>
                <th className="px-6 py-4 text-center font-semibold text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {isTableLoading ? (
                <RequestTableSkeleton />
              ) : requests.length > 0 ? (
                requests.map((request) => (
                  <RequestRow
                    key={request.id}
                    request={request}
                    onApprove={handleApprove}
                    onReject={handleReject}
                    onViewDetails={handleViewDetails}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-16 text-center">
                    <div className="text-gray-400 text-xl mb-2">
                      No {statusFilter} requests found
                    </div>
                    <p className="text-gray-500 max-w-md mx-auto">
                      {searchTerm
                        ? `No requests match your search for "${searchTerm}"`
                        : "All requests are processed or no requests exist"}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Security logs section */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <FontAwesomeIcon icon={faHistory} className="text-gray-500" />
            Security Event Logs
          </h2>
          <div className="text-sm text-gray-500">
            Last {securityLogs.length} security events
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left font-semibold text-gray-700">
                  Event
                </th>
                <th className="px-6 py-4 text-left font-semibold text-gray-700">
                  User
                </th>
                <th className="px-6 py-4 text-left font-semibold text-gray-700">
                  Timestamp
                </th>
                <th className="px-6 py-4 text-left font-semibold text-gray-700">
                  IP Address
                </th>
                <th className="px-6 py-4 text-center font-semibold text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {securityLogs && securityLogs.length > 0 ? (
                securityLogs.slice(0, 5).map((log) => (
                  <tr key={log.id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">
                        {log.event_type}
                      </div>
                      <div className="text-gray-500 text-xs">
                        {log.description}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-900">
                        {log.user_email || "System"}
                      </div>
                      <div className="text-gray-500 text-xs">
                        {log.user_role || "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-900">
                        {log.ip_address || "Unknown"}
                      </div>
                      <div className="text-gray-500 text-xs">
                        {log.location || "Unknown"}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleViewLogDetails(log.id)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"
                        title="View Details"
                      >
                        <FontAwesomeIcon icon={faEye} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-16 text-center">
                    <div className="text-gray-400 text-xl mb-2">
                      <FontAwesomeIcon icon={faHistory} className="mr-2" />
                      No security logs available
                    </div>
                    <p className="text-gray-500 max-w-md mx-auto">
                      Security logs will appear here once the audit system is
                      initialized and admin actions are performed.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-6 text-center">
          <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg border border-gray-200 hover:bg-gray-200">
            View Full Security Logs
          </button>
        </div>
      </div>
    </div>
  );
};

const RequestTableSkeleton = () => (
  <>
    {[...Array(5)].map((_, i) => (
      <tr key={i} className="border-b animate-pulse">
        <td className="px-6 py-4">
          <div className="flex items-center">
            <div className="bg-gray-300 rounded-full w-10 h-10"></div>
            <div className="ml-4 space-y-2">
              <div className="h-4 bg-gray-300 rounded w-40"></div>
              <div className="h-3 bg-gray-300 rounded w-16"></div>
            </div>
          </div>
        </td>
        <td className="px-6 py-4">
          <div className="space-y-2">
            <div className="h-4 bg-gray-300 rounded w-48"></div>
            <div className="h-3 bg-gray-300 rounded w-32"></div>
          </div>
        </td>
        <td className="px-6 py-4">
          <div className="h-6 w-24 bg-gray-300 rounded-full"></div>
        </td>
        <td className="px-6 py-4">
          <div className="space-y-2">
            <div className="h-4 bg-gray-300 rounded w-32"></div>
            <div className="h-3 bg-gray-300 rounded w-24"></div>
          </div>
        </td>
        <td className="px-6 py-4 text-center">
          <div className="flex items-center space-x-3 justify-center">
            <div className="h-8 w-8 bg-gray-300 rounded-full"></div>
            <div className="h-8 w-8 bg-gray-300 rounded-full"></div>
            <div className="h-8 w-8 bg-gray-300 rounded-full"></div>
          </div>
        </td>
      </tr>
    ))}
  </>
);

export default AdminSecurityPage;
