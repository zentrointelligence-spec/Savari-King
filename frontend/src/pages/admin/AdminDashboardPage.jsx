import React, { useState, useEffect, useContext } from "react";
import { api } from "../../config/api";
import { AuthContext } from "../../contexts/AuthContext";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faInbox,
  faRupeeSign,
  faUsers,
  faClock,
  faChartLine,
  faUserCircle,
  faSync,
  faCalendarAlt,
  faMapMarkerAlt,
  faCar,
} from "@fortawesome/free-solid-svg-icons";
import { Suspense } from "react";
import API_CONFIG from "../../config/api";

// Chargement dynamique pour les graphiques
const RevenueChart = React.lazy(() =>
  import("../../components/admin/RevenueChart")
);
const InquiryPieChart = React.lazy(() =>
  import("../../components/admin/InquiryPieChart")
);
const ActivityTimeline = React.lazy(() =>
  import("../../components/admin/ActivityTimeline")
);
const GeoMap = React.lazy(() => import("../../components/admin/GeoMap"));

// Composant de chargement animé
const ShimmerLoader = () => (
  <div className="animate-pulse">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-white rounded-xl p-6 shadow h-32">
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-full bg-gray-200"></div>
            <div className="ml-4 flex-1 space-y-3">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-8 bg-gray-300 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      <div className="bg-white rounded-xl p-6 shadow h-96"></div>
      <div className="bg-white rounded-xl p-6 shadow h-96"></div>
      <div className="bg-white rounded-xl p-6 shadow h-96"></div>
    </div>
    <div className="bg-white rounded-xl p-6 shadow h-96"></div>
  </div>
);

// Badge de statut dynamique avec indicateur de couleur correspondant au pie chart
const StatusBadge = ({ status, showColorIndicator = false }) => {
  const statusConfig = {
    "Inquiry Pending": {
      color: "bg-yellow-100 text-yellow-800",
      chartColor: "rgb(234, 179, 8)",
      icon: faClock
    },
    "Under Review": {
      color: "bg-purple-100 text-purple-800",
      chartColor: "rgb(168, 85, 247)",
      icon: faChartLine
    },
    "Quote Sent": {
      color: "bg-blue-100 text-blue-800",
      chartColor: "rgb(59, 130, 246)",
      icon: faCalendarAlt
    },
    "Quote Expired": {
      color: "bg-gray-100 text-gray-800",
      chartColor: "rgb(156, 163, 175)",
      icon: faClock
    },
    "Payment Confirmed": {
      color: "bg-green-100 text-green-800",
      chartColor: "rgb(34, 197, 94)",
      icon: faCalendarAlt
    },
    "Cancelled": {
      color: "bg-red-100 text-red-800",
      chartColor: "rgb(239, 68, 68)",
      icon: faCar
    },
    "Trip Completed": {
      color: "bg-emerald-100 text-emerald-800",
      chartColor: "rgb(16, 185, 129)",
      icon: faMapMarkerAlt
    },
  };

  const config = statusConfig[status] || {
    color: "bg-gray-100 text-gray-800",
    chartColor: "rgb(156, 163, 175)",
    icon: faClock,
  };

  return (
    <div className="inline-flex items-center gap-2">
      {showColorIndicator && (
        <div
          className="w-3 h-3 rounded-full flex-shrink-0"
          style={{ backgroundColor: config.chartColor }}
        ></div>
      )}
      <div
        className={`px-3 py-1 rounded-full text-xs font-medium inline-flex items-center ${config.color}`}
      >
        <FontAwesomeIcon icon={config.icon} className="mr-1.5 text-xs" />
        <span>{status}</span>
      </div>
    </div>
  );
};

const AdminDashboardPage = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState("monthly");
  const { token } = useContext(AuthContext);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await api.get(
        `${API_CONFIG.ENDPOINTS.ADMIN.DASHBOARD}?range=${timeRange}`
      );
      setDashboardData(response.data);
    } catch (error) {
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token, timeRange]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleTimeRangeChange = (range) => {
    setTimeRange(range);
    setRefreshing(true);
  };

  if (loading)
    return (
      <div className="max-w-7xl mx-auto p-6">
        <ShimmerLoader />
      </div>
    );

  if (!dashboardData)
    return (
      <div className="max-w-7xl mx-auto p-6 text-center py-24">
        <FontAwesomeIcon
          icon={faChartLine}
          className="text-6xl text-red-500 mb-6 animate-bounce"
        />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Data Unavailable
        </h2>
        <p className="text-gray-600 max-w-md mx-auto mb-8">
          We couldn't load your dashboard data. Please check your connection and
          try again.
        </p>
        <button
          onClick={handleRefresh}
          className="px-6 py-3 bg-gradient-to-r from-primary to-primary-dark text-white rounded-xl shadow-lg hover:shadow-xl transition-all"
        >
          Retry Loading Data
        </button>
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header with controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Advanced Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Real-time insights and analytics for your business
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1">
            {["daily", "weekly", "monthly", "yearly"].map((range) => (
              <button
                key={range}
                onClick={() => handleTimeRangeChange(range)}
                className={`px-4 py-2 text-sm rounded-md transition-colors ${
                  timeRange === range
                    ? "bg-primary text-white"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </button>
            ))}
          </div>

          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            disabled={refreshing}
          >
            <FontAwesomeIcon
              icon={faSync}
              className={`${refreshing ? "animate-spin" : ""}`}
            />
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      {/* Key metrics cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-cyan-50 to-white p-6 rounded-xl shadow-lg border border-cyan-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">
                New Inquiries
              </p>
              <p className="text-3xl font-bold text-gray-800 mt-1">
                {dashboardData.pending_inquiries}
              </p>
              <div className="mt-2 flex items-center">
                <span
                  className={`text-sm ${
                    dashboardData.inquiry_change >= 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  <FontAwesomeIcon icon={faChartLine} className="mr-1" />
                  {Math.abs(dashboardData.inquiry_change)}%
                  {dashboardData.inquiry_change >= 0 ? "↑" : "↓"} from last
                  period
                </span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-full bg-cyan-100 flex items-center justify-center">
              <FontAwesomeIcon
                icon={faInbox}
                className="text-cyan-600 text-xl"
              />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-white p-6 rounded-xl shadow-lg border border-green-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">
                Revenue
              </p>
              <p className="text-3xl font-bold text-gray-800 mt-1">
                ₹{dashboardData.monthly_revenue.toLocaleString("en-IN")}
              </p>
              <div className="mt-2 flex items-center">
                <span
                  className={`text-sm ${
                    dashboardData.revenue_change >= 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  <FontAwesomeIcon icon={faChartLine} className="mr-1" />
                  {Math.abs(dashboardData.revenue_change)}%
                  {dashboardData.revenue_change >= 0 ? "↑" : "↓"} from last
                  period
                </span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <FontAwesomeIcon
                icon={faRupeeSign}
                className="text-green-600 text-xl"
              />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-white p-6 rounded-xl shadow-lg border border-purple-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">
                Total Customers
              </p>
              <p className="text-3xl font-bold text-gray-800 mt-1">
                {dashboardData.total_customers}
              </p>
              <div className="mt-2 flex items-center">
                <span className="text-sm text-gray-500">
                  <FontAwesomeIcon icon={faUserCircle} className="mr-1" />
                  {dashboardData.new_customers} new this period
                </span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
              <FontAwesomeIcon
                icon={faUsers}
                className="text-purple-600 text-xl"
              />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-white p-6 rounded-xl shadow-lg border border-amber-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">
                Conversion Rate
              </p>
              <p className="text-3xl font-bold text-gray-800 mt-1">
                {dashboardData.conversion_rate}%
              </p>
              <div className="mt-2 flex items-center">
                <span
                  className={`text-sm ${
                    dashboardData.conversion_change >= 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  <FontAwesomeIcon icon={faChartLine} className="mr-1" />
                  {Math.abs(dashboardData.conversion_change)}%
                  {dashboardData.conversion_change >= 0 ? "↑" : "↓"}
                </span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
              <FontAwesomeIcon
                icon={faChartLine}
                className="text-amber-600 text-xl"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Advanced data visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">
              Revenue Analytics
            </h2>
            <div className="text-sm text-gray-500">
              {timeRange.charAt(0).toUpperCase() + timeRange.slice(1)}{" "}
              performance
            </div>
          </div>
          <div className="h-80">
            <Suspense
              fallback={
                <div className="h-80 bg-gray-100 rounded animate-pulse"></div>
              }
            >
              <RevenueChart data={dashboardData.revenue_analytics} />
            </Suspense>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">
            Inquiry Distribution
          </h2>
          <div className="h-72">
            <Suspense
              fallback={
                <div className="h-72 bg-gray-100 rounded animate-pulse"></div>
              }
            >
              <InquiryPieChart data={dashboardData.inquiry_distribution} />
            </Suspense>
          </div>
          <div className="mt-4 space-y-2">
            {/* Première ligne - 4 premiers statuts */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              {Object.entries(dashboardData.inquiry_distribution)
                .slice(0, 4)
                .map(([status, count]) => (
                  <div key={status} className="flex items-center">
                    <StatusBadge status={status} showColorIndicator={true} />
                    <span className="ml-2 text-gray-700 font-medium">
                      {count}
                    </span>
                    <span className="ml-1 text-gray-500 text-sm">inquiries</span>
                  </div>
                ))}
            </div>
            {/* Deuxième ligne - 3 derniers statuts */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              {Object.entries(dashboardData.inquiry_distribution)
                .slice(4)
                .map(([status, count]) => (
                  <div key={status} className="flex items-center">
                    <StatusBadge status={status} showColorIndicator={true} />
                    <span className="ml-2 text-gray-700 font-medium">
                      {count}
                    </span>
                    <span className="ml-1 text-gray-500 text-sm">inquiries</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom row: Map and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">
            Customer Geographic Distribution
          </h2>
          <div className="h-96">
            <Suspense
              fallback={
                <div className="h-96 bg-gray-100 rounded animate-pulse"></div>
              }
            >
              <GeoMap locations={dashboardData.customer_locations} />
            </Suspense>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">
            Recent Activity
          </h2>
          <div className="h-96 overflow-y-auto">
            <Suspense
              fallback={
                <div className="h-96 bg-gray-100 rounded animate-pulse"></div>
              }
            >
              <ActivityTimeline activities={dashboardData.recent_activities} />
            </Suspense>
          </div>
        </div>
      </div>

      {/* Recent inquiries table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">
            Latest Inquiries
          </h2>
          <span className="text-sm text-gray-500">
            Showing {dashboardData.recent_inquiries.length} of{" "}
            {dashboardData.total_inquiries} inquiries
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left">
                  Booking
                </th>
                <th scope="col" className="px-6 py-3 text-left">
                  Customer
                </th>
                <th scope="col" className="px-6 py-3 text-left">
                  Tour Package
                </th>
                <th scope="col" className="px-6 py-3 text-center">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-right">
                  Value
                </th>
                <th scope="col" className="px-6 py-3 text-right">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {dashboardData.recent_inquiries.map((inquiry) => (
                <tr
                  key={inquiry.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 font-medium text-gray-900">
                    <div className="flex items-center gap-2">
                      <FontAwesomeIcon
                        icon={faUserCircle}
                        className="text-gray-400"
                      />
                      <span>#{inquiry.id}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium">{inquiry.user_name}</div>
                    <div className="text-gray-500 text-xs">
                      {inquiry.user_email}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium">{inquiry.tour_name}</div>
                    <div className="text-gray-500 text-xs">
                      {inquiry.duration} days
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="text-gray-700">
                      {new Date(inquiry.date).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right font-medium">
                    ₹{inquiry.value.toLocaleString("en-IN")}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <StatusBadge status={inquiry.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
