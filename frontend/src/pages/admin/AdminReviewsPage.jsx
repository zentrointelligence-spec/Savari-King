import React, { useState, useEffect, useContext, useCallback } from "react";
import axios from "axios";
import { AuthContext } from "../../contexts/AuthContext";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faStar,
  faSearch,
  faFilter,
  faSync,
  faCheckCircle,
  faTrash,
  faEye,
  faCommentAlt,
  faUser,
  faCalendarAlt,
} from "@fortawesome/free-solid-svg-icons";
import { Suspense } from "react";
import API_CONFIG, { buildApiUrl, getAuthHeaders } from "../../config/api";
import {
  FilterButton,
  FilterPanel,
} from "../../components/admin/ReusableFilter";
import ConfirmDeleteModal from "../../components/admin/ConfirmDeleteModal";

// Chargement dynamique pour le graphique
const RatingDistributionChart = React.lazy(() =>
  import("../../components/admin/RatingDistributionChart")
);

// Composant d'étoiles de notation
const RatingStars = ({ rating }) => {
  return (
    <div className="flex text-yellow-400">
      {[...Array(5)].map((_, i) => (
        <FontAwesomeIcon
          key={i}
          icon={faStar}
          className={i < rating ? "text-yellow-400" : "text-gray-300"}
        />
      ))}
    </div>
  );
};

// Badge de statut
const ReviewStatusBadge = ({ isApproved }) => (
  <span
    className={`px-3 py-1 rounded-full text-xs font-medium ${
      isApproved
        ? "bg-green-100 text-green-800"
        : "bg-yellow-100 text-yellow-800"
    }`}
  >
    {isApproved ? "Approved" : "Pending"}
  </span>
);

// Carte de statistiques
const ReviewStatCard = ({ title, value, icon, color }) => (
  <div
    className={`bg-white p-5 rounded-xl shadow-lg border-l-4 border-b-0 border-t-0 border-r-0 border-l-4 border-l-${color}`}
  >
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
  </div>
);

// Ligne d'avis
const ReviewRow = ({ review, onApprove, onDelete, onViewDetails }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={`border-b border-gray-100 p-6 transition-all ${
        expanded ? "bg-blue-50" : "hover:bg-gray-50"
      }`}
    >
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        <div className="md:col-span-2">
          <div className="flex items-center">
            <div className="bg-gray-200 border-2 border-dashed rounded-full w-10 h-10 flex items-center justify-center">
              <FontAwesomeIcon icon={faUser} className="text-gray-500" />
            </div>
            <div className="ml-3">
              <div className="font-medium text-gray-900">
                {review.user_name}
              </div>
              <div className="text-gray-500 text-xs">
                {new Date(review.date).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-3">
          <div className="font-medium text-gray-900">{review.tour_name}</div>
          <div className="mt-1">
            <RatingStars rating={review.rating} />
          </div>
        </div>

        <div className="md:col-span-4">
          <div className={`text-gray-700 ${expanded ? "" : "line-clamp-2"}`}>
            {review.review_text}
          </div>
          {!expanded && review.review_text.length > 100 && (
            <button
              onClick={() => setExpanded(true)}
              className="text-primary text-sm font-medium mt-1"
            >
              Read more
            </button>
          )}
        </div>

        <div className="md:col-span-1">
          <ReviewStatusBadge isApproved={review.is_approved} />
        </div>

        <div className="md:col-span-2">
          <div className="flex items-center space-x-3 justify-end">
            {!review.is_approved && (
              <button
                onClick={() => onApprove(review.id)}
                className="p-2 text-green-600 hover:bg-green-50 rounded-full"
                title="Approve"
              >
                <FontAwesomeIcon icon={faCheckCircle} />
              </button>
            )}

            <button
              onClick={() => onDelete(review.id)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-full"
              title="Delete"
            >
              <FontAwesomeIcon icon={faTrash} />
            </button>

            <button
              onClick={() => onViewDetails(review.id)}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"
              title="View Details"
            >
              <FontAwesomeIcon icon={faEye} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminReviewsPage = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isTableLoading, setIsTableLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [refreshing, setRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState(null);
  const { token } = useContext(AuthContext);

  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setRatingFilter("all");
  };

  const fetchReviews = useCallback(
    async (page = 1) => {
      setRefreshing(true);
      setIsTableLoading(true);
      try {
        const params = new URLSearchParams({
          page,
          limit: itemsPerPage,
          searchTerm,
          status: statusFilter,
          rating: ratingFilter,
        });
        const response = await axios.get(
          `${buildApiUrl(
            API_CONFIG.ENDPOINTS.ADMIN.REVIEWS
          )}?${params.toString()}`,
          {
            headers: getAuthHeaders(token),
          }
        );
        setReviews(response.data.reviews);
        setCurrentPage(response.data.currentPage);
        setTotalPages(response.data.totalPages);
      } catch (error) {
        toast.error("Could not fetch reviews.");
        console.error(error);
      } finally {
        setLoading(false);
        setRefreshing(false);
        setIsTableLoading(false);
      }
    },
    [itemsPerPage, ratingFilter, searchTerm, statusFilter, token]
  );

  const fetchReviewStats = useCallback(async () => {
    try {
      const response = await axios.get(
        buildApiUrl(API_CONFIG.ENDPOINTS.ADMIN.REVIEW_STATS),
        {
          headers: getAuthHeaders(token),
        }
      );
      setStats(response.data);
    } catch (error) {
      toast.error("Could not fetch review statistics.");
    }
  }, [token]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchReviews(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, statusFilter, ratingFilter, itemsPerPage, fetchReviews]);

  useEffect(() => {
    fetchReviewStats();
  }, [fetchReviewStats]);

  const handleApprove = async (reviewId) => {
    try {
      await axios.patch(
        buildApiUrl(API_CONFIG.ENDPOINTS.ADMIN.REVIEW_APPROVE(reviewId)),
        {},
        {
          headers: getAuthHeaders(token),
        }
      );
      toast.success("Review approved!");
      fetchReviews(currentPage);
    } catch (error) {
      toast.error("Failed to approve review.");
    }
  };

  const handleDelete = (reviewId) => {
    setReviewToDelete(reviewId);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!reviewToDelete) return;
    try {
      await axios.delete(
        buildApiUrl(API_CONFIG.ENDPOINTS.ADMIN.REVIEW_DELETE(reviewToDelete)),
        {
          headers: getAuthHeaders(token),
        }
      );
      toast.success("Review deleted.");
      fetchReviews(currentPage);
    } catch (error) {
      toast.error("Failed to delete review.");
    } finally {
      setIsDeleteModalOpen(false);
      setReviewToDelete(null);
    }
  };

  const handleViewDetails = (reviewId) => {
    toast.info(`Viewing details for review #${reviewId}`);
    // In a real app, this would open a modal or redirect to a details page
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
                className="h-32 bg-gray-100 rounded-lg animate-pulse"
              ></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {isDeleteModalOpen && (
        <ConfirmDeleteModal
          onConfirm={confirmDelete}
          onCancel={() => setIsDeleteModalOpen(false)}
        />
      )}
      {/* Header with actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Customer Reviews Management
          </h1>
          <p className="text-gray-600 mt-2">
            {stats.total_reviews} reviews • {stats.pending_reviews} pending •
            Avg rating: {stats.average_rating.toFixed(1)}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => fetchReviews(1)}
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
        </div>
      </div>

      {/* Review statistics cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <ReviewStatCard
          title="Total Reviews"
          value={stats.total_reviews}
          icon={faCommentAlt}
          color="text-blue-500"
        />

        <ReviewStatCard
          title="Pending Approval"
          value={stats.pending_reviews}
          icon={faCalendarAlt}
          color="text-yellow-500"
        />

        <ReviewStatCard
          title="Average Rating"
          value={stats.average_rating.toFixed(1)}
          icon={faStar}
          color="text-yellow-500"
        />

        <ReviewStatCard
          title="5-Star Reviews"
          value={stats.five_star_reviews}
          icon={faStar}
          color="text-yellow-500"
        />
      </div>

      {/* Rating distribution chart */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">
            Rating Distribution
          </h2>
          <div className="text-sm text-gray-500">
            Based on {stats.total_reviews} reviews
          </div>
        </div>
        <div className="h-64">
          <Suspense
            fallback={
              <div className="h-64 bg-gray-100 rounded animate-pulse"></div>
            }
          >
            <RatingDistributionChart data={stats.rating_distribution} />
          </Suspense>
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
              placeholder="Search reviews by user, tour, or text..."
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
              <option value="approved">Approved Only</option>
              <option value="pending">Pending Only</option>
            </select>
          </div>
        </div>

        <div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FontAwesomeIcon icon={faStar} className="text-yellow-400" />
            </div>
            <select
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent appearance-none"
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
            >
              <option value="all">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>
        </div>
      </FilterPanel>

      {/* Reviews list */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="hidden md:grid grid-cols-12 bg-gray-50 px-6 py-4 text-xs font-semibold text-gray-700 uppercase">
          <div className="col-span-2">Customer</div>
          <div className="col-span-3">Tour & Rating</div>
          <div className="col-span-4">Review</div>
          <div className="col-span-1">Status</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>

        <div className="divide-y divide-gray-100">
          {isTableLoading ? (
            <ReviewTableSkeleton />
          ) : reviews.length > 0 ? (
            reviews.map((review) => (
              <ReviewRow
                key={review.id}
                review={review}
                onApprove={handleApprove}
                onDelete={handleDelete}
                onViewDetails={handleViewDetails}
              />
            ))
          ) : (
            <div className="px-6 py-24 text-center">
              <div className="text-gray-400 text-xl mb-2">No reviews found</div>
              <p className="text-gray-500 max-w-md mx-auto mb-6">
                {searchTerm
                  ? `No reviews match your search for "${searchTerm}"`
                  : "All reviews are filtered out or no reviews exist"}
              </p>
              <button
                onClick={resetFilters}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Pagination and stats */}
      <div className="flex flex-col md:flex-row justify-between items-center mt-6">
        <div className="text-gray-500 mb-4 md:mb-0">
          Showing {reviews.length} of {stats?.total_reviews || 0} reviews
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
              onClick={() => fetchReviews(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
            >
              Previous
            </button>
            {[...Array(totalPages).keys()].map((page) => (
              <button
                key={page + 1}
                onClick={() => fetchReviews(page + 1)}
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
              onClick={() => fetchReviews(currentPage + 1)}
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

const ReviewTableSkeleton = () => (
  <div className="space-y-4 p-6">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-2">
            <div className="flex items-center">
              <div className="bg-gray-300 rounded-full w-10 h-10"></div>
              <div className="ml-3 space-y-2">
                <div className="h-4 bg-gray-300 rounded w-24"></div>
                <div className="h-3 bg-gray-300 rounded w-16"></div>
              </div>
            </div>
          </div>
          <div className="md:col-span-3">
            <div className="h-4 bg-gray-300 rounded w-40 mb-2"></div>
            <div className="h-4 bg-gray-300 rounded w-24"></div>
          </div>
          <div className="md:col-span-4">
            <div className="h-4 bg-gray-300 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
          </div>
          <div className="md:col-span-1">
            <div className="h-6 w-20 bg-gray-300 rounded-full"></div>
          </div>
          <div className="md:col-span-2">
            <div className="flex items-center space-x-3 justify-end">
              <div className="h-8 w-8 bg-gray-300 rounded-full"></div>
              <div className="h-8 w-8 bg-gray-300 rounded-full"></div>
              <div className="h-8 w-8 bg-gray-300 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

export default AdminReviewsPage;
