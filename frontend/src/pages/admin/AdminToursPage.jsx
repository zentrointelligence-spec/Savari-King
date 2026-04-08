import React, { useState, useEffect, useContext, useCallback } from "react";
import axios from "axios";
import { AuthContext } from "../../contexts/AuthContext";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faSearch,
  faEdit,
  faTrash,
  faEye,
  faToggleOn,
  faToggleOff,
  faFilter,
  faSync,
} from "@fortawesome/free-solid-svg-icons";
import API_CONFIG, { buildApiUrl, getAuthHeaders } from "../../config/api";
import TourEditModal from "../../components/admin/TourEditModal";
import ConfirmDeleteModal from "../../components/admin/ConfirmDeleteModal";
import {
  FilterButton,
  FilterPanel,
} from "../../components/admin/ReusableFilter";

const TourStatusBadge = ({ isActive }) => (
  <span
    className={`px-3 py-1 rounded-full text-xs font-medium ${
      isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
    }`}
  >
    {isActive ? "Active" : "Inactive"}
  </span>
);

const TourRow = ({ tour, onDelete, onToggleStatus, onEdit }) => {
  return (
    <tr
      key={tour.id}
      className="border-b hover:bg-gray-50 transition-colors"
    >
      <td className="px-6 py-4">
        <div className="flex items-center">
          <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16" />
          <div className="ml-4">
            <div className="font-medium text-gray-900">{tour.name}</div>
            <div className="text-gray-500 text-sm mt-1">
              {tour.duration_days} days • ₹{tour.price.toLocaleString("en-IN")}
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="text-gray-900">{tour.category}</div>
        <div className="text-gray-500 text-sm mt-1">
          {(tour.destinations || []).join(", ")}
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center">
          <div className="flex -space-x-2">
            {(tour.bookings || []).slice(0, 3).map((booking, idx) => (
              <div
                key={idx}
                className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white"
              />
            ))}
            {(tour.bookings || []).length > 3 && (
              <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold border-2 border-white">
                +{(tour.bookings || []).length - 3}
              </div>
            )}
          </div>
          <span className="ml-2 text-gray-500 text-sm">
            {(tour.bookings || []).length} bookings
          </span>
        </div>
      </td>
      <td className="px-6 py-4">
        <TourStatusBadge isActive={tour.is_active} />
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => onToggleStatus(tour.id, !tour.is_active)}
            className={`p-2 rounded-full ${
              tour.is_active
                ? "text-green-600 hover:bg-green-50"
                : "text-red-600 hover:bg-red-50"
            }`}
            title={tour.is_active ? "Deactivate" : "Activate"}
          >
            <FontAwesomeIcon
              icon={tour.is_active ? faToggleOn : faToggleOff}
              size="lg"
            />
          </button>

          <button
            onClick={() => onEdit(tour)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"
            title="Edit"
          >
            <FontAwesomeIcon icon={faEdit} />
          </button>

          <button
            onClick={() => onDelete(tour.id)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-full"
            title="Delete"
          >
            <FontAwesomeIcon icon={faTrash} />
          </button>

          <Link
            to={`/tours/${tour.id}`}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-full"
            title="Preview"
            target="_blank"
          >
            <FontAwesomeIcon icon={faEye} />
          </Link>
        </div>
      </td>
    </tr>
  );
};

const AdminToursPage = () => {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isTableLoading, setIsTableLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const { token } = useContext(AuthContext);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTour, setSelectedTour] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [tourToDelete, setTourToDelete] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalTours, setTotalTours] = useState(0);

  const fetchTours = useCallback(async (page = 1) => {
    setRefreshing(true);
    setIsTableLoading(true);
    try {
      const params = new URLSearchParams({
        page,
        limit: itemsPerPage,
        searchTerm,
        status: statusFilter,
        category: categoryFilter,
      });
      const response = await axios.get(
        buildApiUrl(`${API_CONFIG.ENDPOINTS.ADMIN.TOURS}?${params.toString()}`),
        {
          headers: getAuthHeaders(token),
        }
      );
      setTours(response.data.tours || []);
      setTotalPages(response.data.totalPages || 1);
      setCurrentPage(response.data.currentPage || 1);
      setTotalTours(response.data.totalTours || 0);
    } catch (error) {
      toast.error("Could not fetch tours.");
    } finally {
      setLoading(false);
      setRefreshing(false);
      setIsTableLoading(false);
    }
  }, [token, itemsPerPage, searchTerm, statusFilter, categoryFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTours(1);
    }, 500); // Debounce search term changes

    return () => clearTimeout(timer);
  }, [fetchTours]);


  const handleDelete = (tourId) => {
    setTourToDelete(tourId);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!tourToDelete) return;

    try {
      await axios.delete(buildApiUrl(API_CONFIG.ENDPOINTS.ADMIN.TOUR_DELETE(tourToDelete)), {
        headers: getAuthHeaders(token),
      });
      toast.success("Tour deleted successfully");
      fetchTours(currentPage); // Refetch to update pagination
    } catch (error) {
      toast.error("Failed to delete tour");
    } finally {
      setIsDeleteModalOpen(false);
      setTourToDelete(null);
    }
  };

  const handleToggleStatus = async (tourId, newStatus) => {
    try {
      await axios.patch(
        buildApiUrl(API_CONFIG.ENDPOINTS.ADMIN.TOUR_STATUS(tourId)),
        { is_active: newStatus },
        {
          headers: getAuthHeaders(token),
        }
      );
      toast.success(
        `Tour ${newStatus ? "activated" : "deactivated"} successfully`
      );
      setTours(
        tours.map((tour) =>
          tour.id === tourId ? { ...tour, is_active: newStatus } : tour
        )
      );
    } catch (error) {
      toast.error("Failed to update tour status");
    }
  };

  const handleOpenModal = (tour = null) => {
    setSelectedTour(tour);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTour(null);
  };

  const handleSave = () => {
    handleCloseModal();
    fetchTours(currentPage);
  };

  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setCategoryFilter("");
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <div className="h-10 w-64 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-10 w-48 bg-gray-200 rounded animate-pulse"></div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
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
                className="h-24 bg-gray-100 rounded-lg animate-pulse"
              ></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {isModalOpen && (
        <TourEditModal
          tour={selectedTour}
          onClose={handleCloseModal}
          onSave={handleSave}
        />
      )}
      {isDeleteModalOpen && (
        <ConfirmDeleteModal
          onConfirm={confirmDelete}
          onCancel={() => setIsDeleteModalOpen(false)}
        />
      )}
      {/* Header with actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Tour Management</h1>
          <p className="text-gray-600 mt-2">
            {totalTours} tours • {tours.filter((t) => t.is_active).length}{" "}
            active
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => fetchTours(1)}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <FontAwesomeIcon
              icon={faSync}
              className={`${refreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
          <FilterButton
            showFilters={showFilters}
            onToggleFilters={() => setShowFilters(!showFilters)}
          />
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary to-primary-dark text-white rounded-lg shadow-lg hover:shadow-xl transition-all"
          >
            <FontAwesomeIcon icon={faPlus} />
            Create New Tour
          </button>
        </div>
      </div>

      {/* Filters and search */}
      <FilterPanel show={showFilters} onResetFilters={resetFilters}>
        <div className="md:col-span-2">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FontAwesomeIcon icon={faSearch} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search tours by name, destination..."
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FontAwesomeIcon icon={faFilter} className="text-gray-400" />
            </div>
            <select
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent appearance-none"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>
        </div>

        <div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FontAwesomeIcon icon={faFilter} className="text-gray-400" />
            </div>
            <select
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent appearance-none"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="">All Categories</option>
              <option value="adventure">Adventure</option>
              <option value="luxury">Luxury</option>
              <option value="cultural">Cultural</option>
            </select>
          </div>
        </div>
      </FilterPanel>

      {/* Tours table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left font-semibold text-gray-700">
                  Tour Details
                </th>
                <th className="px-6 py-4 text-left font-semibold text-gray-700">
                  Category & Destinations
                </th>
                <th className="px-6 py-4 text-left font-semibold text-gray-700">
                  Bookings
                </th>
                <th className="px-6 py-4 text-left font-semibold text-gray-700">
                  Status
                </th>
                <th className="px-6 py-4 text-center font-semibold text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {isTableLoading ? (
                <TourTableSkeleton />
              ) : tours.length > 0 ? (
                tours.map((tour) => (
                  <TourRow
                    key={tour.id}
                    tour={tour}
                    onDelete={handleDelete}
                    onToggleStatus={handleToggleStatus}
                    onEdit={handleOpenModal}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-24 text-center">
                    <div className="text-gray-400 text-xl mb-2">
                      No tours found
                    </div>
                    <p className="text-gray-500 max-w-md mx-auto mb-6">
                      {searchTerm
                        ? `No tours match your search for "${searchTerm}"`
                        : "Create your first tour to get started"}
                    </p>
                    <button
                      onClick={() => {
                        setSearchTerm("");
                        setStatusFilter("all");
                      }}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                    >
                      Clear Filters
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination and stats */}
      <div className="flex flex-col md:flex-row justify-between items-center mt-6">
        <div className="text-gray-500 mb-4 md:mb-0">
          Showing {tours.length} of {totalTours} tours
        </div>
        <div className="flex items-center gap-4">
          <div>
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
          <div className="flex gap-2">
            <button
              onClick={() => fetchTours(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
            >
              Previous
            </button>
            {[...Array(totalPages).keys()].map((page) => (
              <button
                key={page + 1}
                onClick={() => fetchTours(page + 1)}
                className={`px-4 py-2 rounded-lg ${
                  currentPage === page + 1
                    ? "bg-primary text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {page + 1}
              </button>
            ))}
            <button
              onClick={() => fetchTours(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const TourTableSkeleton = () => (
  <>
    {[...Array(5)].map((_, i) => (
      <tr key={i} className="border-b animate-pulse">
        <td className="px-6 py-4">
          <div className="flex items-center">
            <div className="bg-gray-300 rounded-xl w-16 h-16"></div>
            <div className="ml-4 space-y-2">
              <div className="h-4 bg-gray-300 rounded w-40"></div>
              <div className="h-3 bg-gray-300 rounded w-24"></div>
            </div>
          </div>
        </td>
        <td className="px-6 py-4">
          <div className="space-y-2">
            <div className="h-4 bg-gray-300 rounded w-24"></div>
            <div className="h-3 bg-gray-300 rounded w-32"></div>
          </div>
        </td>
        <td className="px-6 py-4">
          <div className="h-4 bg-gray-300 rounded w-24"></div>
        </td>
        <td className="px-6 py-4">
          <div className="h-6 w-20 bg-gray-300 rounded-full"></div>
        </td>
        <td className="px-6 py-4">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 bg-gray-300 rounded-full"></div>
            <div className="h-8 w-8 bg-gray-300 rounded-full"></div>
            <div className="h-8 w-8 bg-gray-300 rounded-full"></div>
            <div className="h-8 w-8 bg-gray-300 rounded-full"></div>
          </div>
        </td>
      </tr>
    ))}
  </>
);

export default AdminToursPage;
