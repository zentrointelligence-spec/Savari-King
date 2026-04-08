import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faFilter,
  faSync,
  faFileInvoice,
  faEnvelope,
  faEllipsisV,
  faCalendarAlt,
  faUser,
  faMapMarkerAlt,
  faMoneyBillWave,
  faCheckCircle,
  faTimesCircle,
  faChevronDown,
  faChevronUp,
  faDownload,
  faPrint,
  faChartLine,
  faTrash,
  faClipboardCheck,
  faHistory,
} from "@fortawesome/free-solid-svg-icons";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import API_CONFIG, { buildApiUrl, getAuthHeaders } from "../../config/api";
import ConfirmDeleteModal from "../../components/admin/ConfirmDeleteModal";
import BookingDetailsModal from "../../components/admin/BookingDetailsModal";
import ContactCustomerModal from "../../components/admin/ContactCustomerModal";
import SendQuoteModal from "../../components/admin/SendQuoteModal";
import { generateInvoicePDF } from "../../utils/pdfGenerator";

const AdminBookingsPage = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [isTableLoading, setIsTableLoading] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0,
    revenue: 0,
  });
  const { token } = useContext(AuthContext);
  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    tour: "all",
    startDate: null,
    endDate: null,
  });
  const [tours, setTours] = useState([]);
  const [sortConfig, setSortConfig] = useState({
    key: "id",
    direction: "desc",
  });
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showFilters, setShowFilters] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [bookingToContact, setBookingToContact] = useState(null);
  const [isSendQuoteModalOpen, setIsSendQuoteModalOpen] = useState(false);
  const [bookingToQuote, setBookingToQuote] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchBookings = async (page = 1) => {
    setIsTableLoading(true);
    try {
      console.log('=== FRONTEND: Fetching bookings ===');
      console.log('Page:', page);
      console.log('Filters:', filters);
      console.log('Sort:', sortConfig);

      const params = new URLSearchParams({
        page,
        limit: itemsPerPage,
        search: filters.search || '',
        status: filters.status !== 'all' ? filters.status : '',
        tour_id: filters.tour !== 'all' ? filters.tour : '',
        startDate: filters.startDate ? filters.startDate.toISOString() : '',
        endDate: filters.endDate ? filters.endDate.toISOString() : '',
        sortKey: sortConfig.key,
        sortDirection: sortConfig.direction,
      });

      const url = buildApiUrl(`${API_CONFIG.ENDPOINTS.ADMIN.BOOKINGS_ALL}?${params.toString()}`);
      console.log('Request URL:', url);

      const response = await axios.get(url, {
        headers: getAuthHeaders(token),
      });

      console.log('Response:', response.data);

      if (response.data.success) {
        // FIX: L'API renvoie les bookings directement dans "data", pas dans "data.bookings"
        const bookingsData = Array.isArray(response.data.data)
          ? response.data.data
          : (response.data.data.bookings || []);

        // La pagination est maintenant dans un objet séparé
        const pagination = response.data.pagination || response.data.data;

        console.log(`Received ${bookingsData.length} bookings`);

        // LOG DÉTAILLÉ DE LA RÉPONSE API
        console.log('==========================================');
        console.log('📊 RÉPONSE COMPLÈTE DE L\'API - ADMIN BOOKINGS');
        console.log('==========================================');
        console.log('✅ Success:', response.data.success);
        console.log('📦 Nombre de réservations reçues:', bookingsData.length);
        console.log('📄 Page actuelle:', pagination.page || pagination.currentPage);
        console.log('📄 Total de pages:', pagination.pages || pagination.totalPages);
        console.log('📊 Total de réservations:', pagination.total);
        console.log('\n🔍 DÉTAIL DES RÉSERVATIONS:');
        bookingsData.forEach((booking, index) => {
          console.log(`\n--- Réservation ${index + 1} (ID: ${booking.id}) ---`);
          console.log('Client:', booking.user_name || booking.contact_name);
          console.log('Email:', booking.user_email || booking.contact_email);
          console.log('Tour:', booking.tour_name);
          console.log('Tier:', booking.tier_name);
          console.log('Date de voyage:', booking.travel_date);
          console.log('Statut:', booking.status);
          console.log('Montant estimé:', booking.estimated_price);
          console.log('Montant final:', booking.final_price || 'N/A');
          console.log('Nombre d\'adultes:', booking.num_adults);
          console.log('Nombre d\'enfants:', booking.num_children);
          console.log('Véhicules sélectionnés:', booking.selected_vehicles);
          console.log('Addons sélectionnés:', booking.selected_addons);
          console.log('Objet booking complet:', booking);
        });
        console.log('\n📋 DONNÉES BRUTES COMPLÈTES:');
        console.log(JSON.stringify(response.data, null, 2));
        console.log('==========================================\n');

        setBookings(bookingsData);
        setTotalPages(pagination.pages || pagination.totalPages || 1);
        setCurrentPage(pagination.page || pagination.currentPage || 1);
      } else {
        console.error('Response not successful:', response.data);
        toast.error("Failed to fetch bookings.");
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
      console.error("Error response:", error.response?.data);
      toast.error("Could not fetch bookings.");
    } finally {
      setIsTableLoading(false);
    }
  };

  const fetchTours = async () => {
    try {
      const response = await axios.get(
        buildApiUrl(API_CONFIG.ENDPOINTS.TOURS),
        {
          headers: getAuthHeaders(token),
        }
      );
      if (response.data) {
        setTours(response.data);
      }
    } catch (error) {
      console.error("Error fetching tours:", error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(
        buildApiUrl(API_CONFIG.ENDPOINTS.ADMIN.BOOKINGS_STATS),
        {
          headers: getAuthHeaders(token),
        }
      );

      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  // Handle refresh button - refreshes both bookings and stats
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        fetchBookings(currentPage),
        fetchStats()
      ]);
      toast.success("Data refreshed successfully!");
    } catch (error) {
      toast.error("Failed to refresh data");
    } finally {
      setIsRefreshing(false);
    }
  };

  // Initial load
  useEffect(() => {
    if (token) {
      console.log('=== INITIAL LOAD ===');
      fetchStats();
      fetchTours();
      fetchBookings(1);
    }
  }, [token]);

  // Reload when filters, sort, or itemsPerPage change
  useEffect(() => {
    if (token) {
      console.log('=== FILTERS/SORT CHANGED ===');
      const timer = setTimeout(() => {
        fetchBookings(1);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [filters, sortConfig, itemsPerPage]);

  const handleSendQuote = async (bookingId, finalPrice) => {
    try {
      const response = await axios.post(
        buildApiUrl(`/api/admin/bookings/${bookingId}/send-quote`),
        { finalPrice },
        { headers: getAuthHeaders(token) }
      );

      if (response.data.success) {
        toast.success("Quote sent successfully! PDFs have been generated and email sent to customer.");
        fetchBookings(currentPage);
        fetchStats();
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.response?.data?.details || "Failed to send quote";
      toast.error(errorMessage);
      console.error("Send quote error:", error);
    }
  };

  const handleMarkComplete = async (bookingId) => {
    if (!window.confirm("Are you sure you want to mark this booking as completed?")) {
      return;
    }

    try {
      const response = await axios.put(
        buildApiUrl(API_CONFIG.ENDPOINTS.ADMIN.BOOKING_COMPLETE(bookingId)),
        {},
        { headers: getAuthHeaders(token) }
      );

      if (response.data.success) {
        toast.success("Booking marked as completed!");
        fetchBookings(currentPage);
        fetchStats();
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || "Failed to mark booking as complete";
      toast.error(errorMessage);
    }
  };

  const handleDelete = (bookingId) => {
    setBookingToDelete(bookingId);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!bookingToDelete) return;
    try {
      await axios.delete(
        buildApiUrl(API_CONFIG.ENDPOINTS.ADMIN.BOOKING_DELETE(bookingToDelete)),
        {
          headers: getAuthHeaders(token),
        }
      );
      toast.success("Booking deleted successfully.");
      fetchBookings(currentPage);
      fetchStats();
    } catch (error) {
      toast.error("Failed to delete booking.");
    } finally {
      setIsDeleteModalOpen(false);
      setBookingToDelete(null);
    }
  };

  const handleOpenQuoteModal = (booking) => {
    setBookingToQuote(booking);
    setIsSendQuoteModalOpen(true);
  };

  const handleViewDetails = (booking) => {
    setSelectedBooking(booking);
    setIsDetailsModalOpen(true);
  };

  const handleDownloadInvoice = (booking) => {
    generateInvoicePDF(booking);
  };

  const handleContactCustomer = (booking) => {
    setBookingToContact(booking);
    setIsContactModalOpen(true);
  };

  const handleReviewQuote = (bookingId) => {
    navigate(`/admin/bookings/${bookingId}/review`);
  };

  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "Inquiry Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Under Review":
        return "bg-orange-100 text-orange-800";
      case "Quote Sent":
        return "bg-blue-100 text-blue-800";
      case "Payment Confirmed":
        return "bg-green-100 text-green-800";
      case "Cancelled":
        return "bg-red-100 text-red-800";
      case "Trip Completed":
        return "bg-gray-200 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const toggleDropdown = (id) => {
    setOpenDropdownId(openDropdownId === id ? null : id);
  };

  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setFilters({
      search: "",
      status: "all",
      tour: "all",
      startDate: null,
      endDate: null,
    });
  };

  const paginate = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
      fetchBookings(pageNumber);
    }
  };

  const renderPagination = () => {
    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(i);
    }

    return (
      <div className="flex justify-center items-center mt-6">
        <button
          onClick={() => paginate(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
        >
          Previous
        </button>
        {pageNumbers.map((number) => (
          <button
            key={number}
            onClick={() => paginate(number)}
            className={`mx-1 px-3 py-1 rounded-lg ${
              currentPage === number
                ? "bg-primary text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {number}
          </button>
        ))}
        <button
          onClick={() => paginate(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {isDeleteModalOpen && (
        <ConfirmDeleteModal
          onConfirm={confirmDelete}
          onCancel={() => setIsDeleteModalOpen(false)}
        />
      )}
      {isDetailsModalOpen && (
        <BookingDetailsModal
          booking={selectedBooking}
          onClose={() => setIsDetailsModalOpen(false)}
        />
      )}
      {isContactModalOpen && (
        <ContactCustomerModal
          customerName={bookingToContact?.user_name}
          onClose={() => setIsContactModalOpen(false)}
        />
      )}
      {isSendQuoteModalOpen && (
        <SendQuoteModal
          booking={bookingToQuote}
          onClose={() => setIsSendQuoteModalOpen(false)}
          onSend={handleSendQuote}
        />
      )}
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Manage Bookings
            </h1>
            <p className="text-gray-600 mt-2">
              View and manage all customer bookings
            </p>
          </div>
          <div className="flex gap-3 mt-4 md:mt-0">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg flex items-center hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FontAwesomeIcon
                icon={faSync}
                className={`mr-2 ${isRefreshing ? 'animate-spin' : ''}`}
              />
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="bg-primary text-white px-4 py-2 rounded-lg flex items-center hover:bg-primary-dark transition-colors"
            >
              <FontAwesomeIcon icon={faFilter} className="mr-2" />
              {showFilters ? "Hide Filters" : "Show Filters"}
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold">Total Bookings</h3>
                <p className="text-3xl font-bold mt-2">{stats.total || 0}</p>
              </div>
              <div className="bg-white/20 p-3 rounded-full">
                <FontAwesomeIcon icon={faFileInvoice} className="text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold">Revenue</h3>
                <p className="text-3xl font-bold mt-2">
                  ₹{(stats.revenue || 0).toLocaleString("en-IN")}
                </p>
              </div>
              <div className="bg-white/20 p-3 rounded-full">
                <FontAwesomeIcon icon={faMoneyBillWave} className="text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white p-6 rounded-xl shadow-lg">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold">Pending</h3>
                <p className="text-3xl font-bold mt-2">{stats.pending || 0}</p>
              </div>
              <div className="bg-white/20 p-3 rounded-full">
                <FontAwesomeIcon icon={faTimesCircle} className="text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-lg">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold">Completed</h3>
                <p className="text-3xl font-bold mt-2">{stats.completed || 0}</p>
              </div>
              <div className="bg-white/20 p-3 rounded-full">
                <FontAwesomeIcon icon={faCheckCircle} className="text-xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Filters Panel */}
        {showFilters && (
          <div className="bg-gradient-to-br from-white to-gray-50 p-8 rounded-2xl shadow-xl mb-8 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-gray-800 flex items-center">
                  <FontAwesomeIcon icon={faFilter} className="mr-2 text-primary" />
                  Advanced Filters
                </h3>
                <p className="text-sm text-gray-500 mt-1">Refine your search results</p>
              </div>
              <button
                onClick={resetFilters}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center gap-2"
              >
                <FontAwesomeIcon icon={faSync} className="text-xs" />
                Reset All
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Search Input */}
              <div className="relative group">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <FontAwesomeIcon icon={faSearch} className="mr-2 text-gray-400" />
                  Search
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Customer name, email, booking ID..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange("search", e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none text-sm"
                  />
                  <FontAwesomeIcon
                    icon={faSearch}
                    className="absolute left-4 top-3.5 text-gray-400 group-hover:text-primary transition-colors"
                  />
                </div>
              </div>

              {/* Status Select */}
              <div className="relative">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <FontAwesomeIcon icon={faCheckCircle} className="mr-2 text-gray-400" />
                  Status
                </label>
                <div className="relative">
                  <select
                    value={filters.status}
                    onChange={(e) => handleFilterChange("status", e.target.value)}
                    className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none appearance-none cursor-pointer text-sm font-medium"
                  >
                    <option value="all">All Statuses</option>
                    <option value="Inquiry Pending">🟡 Inquiry Pending</option>
                    <option value="Under Review">🟠 Under Review</option>
                    <option value="Quote Sent">🔵 Quote Sent</option>
                    <option value="Payment Confirmed">🟢 Payment Confirmed</option>
                    <option value="Trip Completed">⚫ Trip Completed</option>
                    <option value="Cancelled">🔴 Cancelled</option>
                  </select>
                  <FontAwesomeIcon
                    icon={faChevronDown}
                    className="absolute right-4 top-3.5 text-gray-400 pointer-events-none text-xs"
                  />
                </div>
              </div>

              {/* Tour Select */}
              <div className="relative">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2 text-gray-400" />
                  Tour
                </label>
                <div className="relative">
                  <select
                    value={filters.tour}
                    onChange={(e) => handleFilterChange("tour", e.target.value)}
                    className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none appearance-none cursor-pointer text-sm font-medium"
                  >
                    <option value="all">All Tours</option>
                    {tours.map((tour) => (
                      <option key={tour.id} value={tour.id}>
                        {tour.name}
                      </option>
                    ))}
                  </select>
                  <FontAwesomeIcon
                    icon={faChevronDown}
                    className="absolute right-4 top-3.5 text-gray-400 pointer-events-none text-xs"
                  />
                </div>
              </div>

              {/* From Date Picker */}
              <div className="relative">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <FontAwesomeIcon icon={faCalendarAlt} className="mr-2 text-gray-400" />
                  From Date
                </label>
                <div className="relative">
                  <DatePicker
                    selected={filters.startDate}
                    onChange={(date) => handleFilterChange("startDate", date)}
                    className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none text-sm font-medium"
                    placeholderText="Select start date"
                    dateFormat="MMM dd, yyyy"
                  />
                </div>
              </div>

              {/* To Date Picker */}
              <div className="relative">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <FontAwesomeIcon icon={faCalendarAlt} className="mr-2 text-gray-400" />
                  To Date
                </label>
                <div className="relative">
                  <DatePicker
                    selected={filters.endDate}
                    onChange={(date) => handleFilterChange("endDate", date)}
                    className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none text-sm font-medium"
                    placeholderText="Select end date"
                    minDate={filters.startDate}
                    dateFormat="MMM dd, yyyy"
                  />
                </div>
              </div>

              {/* Active Filters Summary */}
              <div className="relative flex items-end">
                <div className="w-full p-4 bg-primary/5 border-2 border-primary/20 rounded-xl">
                  <p className="text-xs font-semibold text-gray-600 mb-1">Active Filters</p>
                  <p className="text-2xl font-bold text-primary">
                    {[filters.search, filters.status !== 'all' ? filters.status : null, filters.tour !== 'all' ? 'Tour' : null, filters.startDate, filters.endDate].filter(Boolean).length || 'None'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bookings Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                  <th
                    className="px-6 py-4 cursor-pointer"
                    onClick={() => requestSort("id")}
                  >
                    <div className="flex items-center">
                      Booking ID
                      {sortConfig.key === "id" && (
                        <FontAwesomeIcon
                          icon={
                            sortConfig.direction === "asc"
                              ? faChevronUp
                              : faChevronDown
                          }
                          className="ml-2 text-xs"
                        />
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Tour</th>
                  <th
                    className="px-6 py-4 cursor-pointer"
                    onClick={() => requestSort("travel_date")}
                  >
                    <div className="flex items-center">
                      Travel Date
                      {sortConfig.key === "travel_date" && (
                        <FontAwesomeIcon
                          icon={
                            sortConfig.direction === "asc"
                              ? faChevronUp
                              : faChevronDown
                          }
                          className="ml-2 text-xs"
                        />
                      )}
                    </div>
                  </th>
                  <th
                    className="px-6 py-4 cursor-pointer"
                    onClick={() => requestSort("status")}
                  >
                    <div className="flex items-center">
                      Status
                      {sortConfig.key === "status" && (
                        <FontAwesomeIcon
                          icon={
                            sortConfig.direction === "asc"
                              ? faChevronUp
                              : faChevronDown
                          }
                          className="ml-2 text-xs"
                        />
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isTableLoading ? (
                  <BookingTableSkeleton />
                ) : bookings.length > 0 ? (
                  bookings.map((booking) => (
                    <React.Fragment key={booking.id}>
                      <tr className="bg-white border-b hover:bg-gray-50">
                        <td className="px-6 py-4 font-bold text-gray-900">
                          #{booking.id}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="bg-gray-200 border-2 border-dashed rounded-xl w-10 h-10 mr-3" />
                            <div>
                              <div className="font-medium text-gray-900">
                                {booking.user_name || booking.contact_name}
                              </div>
                              <div className="text-gray-600 text-sm">
                                {booking.user_email || booking.contact_email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium">{booking.tour_name}</div>
                          <div className="text-gray-600 text-sm flex items-center mt-1">
                            <FontAwesomeIcon
                              icon={faMapMarkerAlt}
                              className="mr-1 text-xs"
                            />
                            {booking.tier_name || booking.destination || 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <FontAwesomeIcon
                              icon={faCalendarAlt}
                              className="mr-2 text-gray-500"
                            />
                            {new Date(booking.travel_date).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 font-semibold leading-tight rounded-full text-sm ${getStatusClass(
                              booking.status
                            )}`}
                          >
                            {booking.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-semibold">
                          ₹
                          {(booking.final_price || booking.estimated_price || booking.total_amount)
                            ? parseFloat(booking.final_price || booking.estimated_price || booking.total_amount).toLocaleString("en-IN")
                            : "N/A"}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="relative">
                            <button
                              onClick={() => toggleDropdown(booking.id)}
                              className="p-2 rounded-full hover:bg-gray-100"
                            >
                              <FontAwesomeIcon icon={faEllipsisV} />
                            </button>

                            {openDropdownId === booking.id && (
                              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20 border border-gray-200">
                                {booking.status === "Inquiry Pending" && (
                                  <>
                                    <button
                                      onClick={() => {
                                        handleReviewQuote(booking.id);
                                        setOpenDropdownId(null);
                                      }}
                                      className="block w-full text-left px-4 py-2 text-sm text-blue-700 hover:bg-blue-50 font-semibold"
                                    >
                                      <FontAwesomeIcon
                                        icon={faClipboardCheck}
                                        className="mr-2"
                                      />
                                      Review Quote
                                    </button>
                                    <button
                                      onClick={() => {
                                        handleOpenQuoteModal(booking);
                                        setOpenDropdownId(null);
                                      }}
                                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    >
                                      <FontAwesomeIcon
                                        icon={faEnvelope}
                                        className="mr-2"
                                      />
                                      Send Quote
                                    </button>
                                  </>
                                )}
                                {booking.status === "Under Review" && (
                                  <button
                                    onClick={() => {
                                      handleReviewQuote(booking.id);
                                      setOpenDropdownId(null);
                                    }}
                                    className="block w-full text-left px-4 py-2 text-sm text-blue-700 hover:bg-blue-50 font-semibold"
                                  >
                                    <FontAwesomeIcon
                                      icon={faClipboardCheck}
                                      className="mr-2"
                                    />
                                    Continue Review
                                  </button>
                                )}
                                {booking.status === "Payment Confirmed" && (
                                  <button
                                    onClick={() => {
                                      handleMarkComplete(booking.id);
                                      setOpenDropdownId(null);
                                    }}
                                    className="block w-full text-left px-4 py-2 text-sm text-green-700 hover:bg-green-50"
                                  >
                                    <FontAwesomeIcon
                                      icon={faCheckCircle}
                                      className="mr-2"
                                    />
                                    Mark as Completed
                                  </button>
                                )}
                                <button
                                  onClick={() => {
                                    handleViewDetails(booking);
                                    setOpenDropdownId(null);
                                  }}
                                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                  <FontAwesomeIcon
                                    icon={faUser}
                                    className="mr-2"
                                  />
                                  View Details
                                </button>
                                {(booking.status === "Quote Sent" || booking.status === "Under Review" || booking.status === "Payment Confirmed") && (
                                  <button
                                    onClick={() => {
                                      navigate(`/admin/bookings/${booking.id}/revisions`);
                                      setOpenDropdownId(null);
                                    }}
                                    className="block w-full text-left px-4 py-2 text-sm text-purple-700 hover:bg-purple-50"
                                  >
                                    <FontAwesomeIcon
                                      icon={faHistory}
                                      className="mr-2"
                                    />
                                    View Revisions
                                  </button>
                                )}
                                <button
                                  onClick={() => {
                                    handleDownloadInvoice(booking);
                                    setOpenDropdownId(null);
                                  }}
                                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                  <FontAwesomeIcon
                                    icon={faDownload}
                                    className="mr-2"
                                  />
                                  Download Invoice
                                </button>
                                <button
                                  onClick={() => {
                                    handleContactCustomer(booking);
                                    setOpenDropdownId(null);
                                  }}
                                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                  <FontAwesomeIcon
                                    icon={faEnvelope}
                                    className="mr-2"
                                  />
                                  Contact Customer
                                </button>
                                <button
                                  onClick={() => {
                                    handleDelete(booking.id);
                                    setOpenDropdownId(null);
                                  }}
                                  className="block w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                                >
                                  <FontAwesomeIcon
                                    icon={faTrash}
                                    className="mr-2"
                                  />
                                  Delete
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    </React.Fragment>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          No bookings found
                        </h3>
                        <p className="text-gray-500">
                          Try adjusting your filters or search criteria
                        </p>
                        <button
                          onClick={resetFilters}
                          className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                        >
                          Reset Filters
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Summary and Export */}
          <div className="flex flex-col md:flex-row justify-between items-center px-6 py-4 bg-gray-50 border-t">
            <div className="text-sm text-gray-600 mb-4 md:mb-0">
              <select
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                className="px-2 py-1 border border-gray-300 rounded-lg"
              >
                <option value={10}>10 per page</option>
                <option value={20}>20 per page</option>
                <option value={50}>50 per page</option>
              </select>
            </div>

            <div className="flex gap-3">
              <button
                className="px-4 py-2 bg-white border-2 border-gray-300 text-gray-700 rounded-lg flex items-center hover:bg-gray-50 hover:border-primary transition-all font-medium"
                onClick={() => toast.info("Export CSV feature coming soon!")}
              >
                <FontAwesomeIcon icon={faDownload} className="mr-2 text-primary" />
                Export CSV
              </button>
              <button
                className="px-4 py-2 bg-white border-2 border-gray-300 text-gray-700 rounded-lg flex items-center hover:bg-gray-50 hover:border-primary transition-all font-medium"
                onClick={() => window.print()}
              >
                <FontAwesomeIcon icon={faPrint} className="mr-2 text-primary" />
                Print
              </button>
            </div>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && renderPagination()}
      </div>
    </div>
  );
};

const BookingTableSkeleton = () => (
  <>
    {[...Array(5)].map((_, i) => (
      <tr key={i} className="border-b animate-pulse">
        <td className="px-6 py-4">
          <div className="h-4 bg-gray-300 rounded w-20"></div>
        </td>
        <td className="px-6 py-4">
          <div className="flex items-center">
            <div className="bg-gray-300 rounded-xl w-10 h-10 mr-3"></div>
            <div>
              <div className="h-4 bg-gray-300 rounded w-24 mb-1"></div>
              <div className="h-3 bg-gray-300 rounded w-32"></div>
            </div>
          </div>
        </td>
        <td className="px-6 py-4">
          <div className="h-4 bg-gray-300 rounded w-32"></div>
        </td>
        <td className="px-6 py-4">
          <div className="h-4 bg-gray-300 rounded w-24"></div>
        </td>
        <td className="px-6 py-4">
          <div className="h-6 w-28 bg-gray-300 rounded-full"></div>
        </td>
        <td className="px-6 py-4">
          <div className="h-4 bg-gray-300 rounded w-20"></div>
        </td>
        <td className="px-6 py-4 text-right">
          <div className="h-8 w-8 bg-gray-300 rounded-full inline-block"></div>
        </td>
      </tr>
    ))}
  </>
);

export default AdminBookingsPage;
