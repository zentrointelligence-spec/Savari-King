import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../../contexts/AuthContext";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faThumbsUp,
  faThumbsDown,
  faMeh,
  faStar,
  faSync,
  faChartLine,
  faUsers,
  faPercent,
  faTrophy,
} from "@fortawesome/free-solid-svg-icons";
import API_CONFIG, { buildApiUrl, getAuthHeaders } from "../../config/api";

// Carte de statistique
const StatCard = ({ title, value, subtitle, icon, color, bgColor }) => (
  <div className={`bg-white p-6 rounded-xl shadow-lg border-l-4 ${color}`}>
    <div className="flex justify-between items-start">
      <div>
        <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">
          {title}
        </p>
        <p className="text-3xl font-bold text-gray-800 mt-2">{value}</p>
        {subtitle && (
          <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
        )}
      </div>
      <div
        className={`w-14 h-14 rounded-full ${bgColor} flex items-center justify-center`}
      >
        <FontAwesomeIcon icon={icon} className={`text-2xl text-white`} />
      </div>
    </div>
  </div>
);

// Skeleton loading
const StatsSkeleton = () => (
  <div className="animate-pulse">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-white p-6 rounded-xl shadow-lg h-32"></div>
      ))}
    </div>
    <div className="bg-white p-6 rounded-xl shadow-lg h-96"></div>
  </div>
);

// Tour recommendation row
const TourRecommendationRow = ({ tour, stats }) => {
  const percentageColor =
    stats.recommendationPercentage >= 90
      ? "text-green-600"
      : stats.recommendationPercentage >= 70
      ? "text-blue-600"
      : stats.recommendationPercentage >= 50
      ? "text-yellow-600"
      : "text-red-600";

  return (
    <div className="border-b border-gray-100 p-4 hover:bg-gray-50 transition-colors">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        <div className="md:col-span-4">
          <h4 className="font-semibold text-gray-900">{tour.tourName}</h4>
          <p className="text-sm text-gray-500">{stats.totalReviews} reviews</p>
        </div>

        <div className="md:col-span-2 text-center">
          <div className={`text-2xl font-bold ${percentageColor}`}>
            {Math.round(stats.recommendationPercentage)}%
          </div>
          <p className="text-xs text-gray-500">Recommendation</p>
        </div>

        <div className="md:col-span-2 text-center">
          <div className="flex items-center justify-center space-x-1">
            <FontAwesomeIcon icon={faStar} className="text-yellow-400" />
            <span className="text-lg font-semibold text-gray-900">
              {stats.averageRating.toFixed(1)}
            </span>
          </div>
          <p className="text-xs text-gray-500">Average Rating</p>
        </div>

        <div className="md:col-span-2 text-center">
          <div className="text-lg font-semibold text-green-600">
            <FontAwesomeIcon icon={faThumbsUp} className="mr-1" />
            {stats.wouldRecommend}
          </div>
          <p className="text-xs text-gray-500">Would Recommend</p>
        </div>

        <div className="md:col-span-2 text-center">
          <div className="text-lg font-semibold text-red-600">
            <FontAwesomeIcon icon={faThumbsDown} className="mr-1" />
            {stats.wouldNotRecommend}
          </div>
          <p className="text-xs text-gray-500">Would Not Recommend</p>
        </div>
      </div>
    </div>
  );
};

const AdminRecommendationStatsPage = () => {
  const [globalStats, setGlobalStats] = useState(null);
  const [tourStats, setTourStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { token } = useContext(AuthContext);

  // Fetch global and tour-specific recommendation statistics
  const fetchStatistics = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      // Fetch global stats
      const globalResponse = await axios.get(
        buildApiUrl("/api/reviews/stats/recommendations/global"),
        { headers: getAuthHeaders(token) }
      );

      if (globalResponse.data.success) {
        setGlobalStats(globalResponse.data.data);
      }

      // Fetch all tours to get individual stats
      const toursResponse = await axios.get(
        buildApiUrl("/api/tours"),
        { headers: getAuthHeaders(token) }
      );

      if (toursResponse.data.success) {
        const tours = toursResponse.data.data;

        // Fetch recommendation stats for each tour
        const tourStatsPromises = tours.map(async (tour) => {
          try {
            const statsResponse = await axios.get(
              buildApiUrl(`/api/reviews/stats/recommendations/tour/${tour.id}`),
              { headers: getAuthHeaders(token) }
            );
            return {
              tour,
              stats: statsResponse.data.data,
            };
          } catch (error) {
            return {
              tour,
              stats: {
                totalReviews: 0,
                wouldRecommend: 0,
                wouldNotRecommend: 0,
                recommendationPercentage: 0,
                averageRating: 0,
              },
            };
          }
        });

        const allTourStats = await Promise.all(tourStatsPromises);
        // Sort by recommendation percentage descending
        allTourStats.sort(
          (a, b) =>
            b.stats.recommendationPercentage - a.stats.recommendationPercentage
        );
        setTourStats(allTourStats);
      }

      if (isRefresh) {
        toast.success("Statistics refreshed successfully");
      }
    } catch (error) {
      console.error("Error fetching statistics:", error);
      toast.error("Failed to load recommendation statistics");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStatistics();
  }, [token]);

  const handleRefresh = () => {
    fetchStatistics(true);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-6 py-8">
        <StatsSkeleton />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Recommendation Statistics
          </h1>
          <p className="text-gray-600 mt-2">
            Track how likely customers are to recommend your tours
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition-colors flex items-center"
        >
          <FontAwesomeIcon
            icon={faSync}
            className={`mr-2 ${refreshing ? "animate-spin" : ""}`}
          />
          {refreshing ? "Refreshing..." : "Refresh Stats"}
        </button>
      </div>

      {/* Global Statistics Cards */}
      {globalStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Recommendation Rate"
            value={`${Math.round(globalStats.recommendationPercentage)}%`}
            subtitle={`${globalStats.wouldRecommend} of ${globalStats.totalReviews} reviews`}
            icon={faPercent}
            color="border-green-500"
            bgColor="bg-green-500"
          />
          <StatCard
            title="Would Recommend"
            value={globalStats.wouldRecommend}
            subtitle="Positive recommendations"
            icon={faThumbsUp}
            color="border-blue-500"
            bgColor="bg-blue-500"
          />
          <StatCard
            title="Average Rating"
            value={globalStats.averageRating.toFixed(1)}
            subtitle={`${globalStats.fiveStarCount} five-star reviews`}
            icon={faStar}
            color="border-yellow-500"
            bgColor="bg-yellow-500"
          />
          <StatCard
            title="Total Reviews"
            value={globalStats.totalReviews}
            subtitle={`${globalStats.highRatingsCount} high ratings (4+)`}
            icon={faUsers}
            color="border-purple-500"
            bgColor="bg-purple-500"
          />
        </div>
      )}

      {/* Tours Ranking */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6">
          <h2 className="text-2xl font-bold text-white flex items-center">
            <FontAwesomeIcon icon={faTrophy} className="mr-3" />
            Tours Ranking by Recommendation
          </h2>
          <p className="text-blue-100 mt-2">
            See which tours customers love the most
          </p>
        </div>

        <div className="p-6">
          {tourStats.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <FontAwesomeIcon
                icon={faChartLine}
                className="text-6xl mb-4 text-gray-300"
              />
              <p className="text-lg">No tour statistics available yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {tourStats.map((item, index) => (
                <div key={item.tour.id} className="relative">
                  {index < 3 && (
                    <div
                      className={`absolute -left-6 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                        index === 0
                          ? "bg-yellow-500"
                          : index === 1
                          ? "bg-gray-400"
                          : "bg-orange-600"
                      }`}
                    >
                      {index + 1}
                    </div>
                  )}
                  <TourRecommendationRow
                    tour={item.stats}
                    stats={item.stats}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Methodology Info */}
      <div className="mt-8 bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-lg">
        <h3 className="text-lg font-semibold text-blue-900 mb-2 flex items-center">
          <FontAwesomeIcon icon={faChartLine} className="mr-2" />
          How Recommendations are Calculated
        </h3>
        <div className="text-blue-800 space-y-2">
          <p>
            <strong>Option B: Automatic Calculation</strong> - Recommendations
            are calculated based on review ratings:
          </p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li>Reviews with 4 or 5 stars = <strong>Would Recommend</strong></li>
            <li>Reviews with 1 or 2 stars = <strong>Would Not Recommend</strong></li>
            <li>Reviews with 3 stars = <strong>Neutral</strong></li>
          </ul>
          <p className="mt-3 text-sm">
            Last calculated: {globalStats?.calculatedAt ? new Date(globalStats.calculatedAt).toLocaleString() : 'N/A'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminRecommendationStatsPage;
