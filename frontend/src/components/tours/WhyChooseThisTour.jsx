import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBolt,
  faShieldAlt,
  faUndo,
  faHeadset,
} from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import { useTranslation } from "react-i18next";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const WhyChooseThisTour = ({ tour }) => {
  const { t } = useTranslation();
  const [recommendationStats, setRecommendationStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch recommendation statistics from backend
  useEffect(() => {
    const fetchStats = async () => {
      if (!tour?.id) return;

      try {
        setLoading(true);
        const statsResponse = await axios.get(
          `${API_BASE_URL}/api/reviews/stats/recommendations/tour/${tour.id}`
        );

        if (statsResponse.data.success) {
          setRecommendationStats(statsResponse.data.data);
        }
      } catch (error) {
        console.error("Error fetching recommendation stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [tour?.id]);

  if (loading) {
    return (
      <div className="mt-24 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="mt-8 relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Stats Section */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 shadow-lg border border-gray-100">
          <h3 className="text-2xl font-bold text-center text-gray-800 mb-10">
            {t("whyChooseTour.title")}
          </h3>

          <div className={`grid grid-cols-1 ${
            recommendationStats?.recommendationPercentage > 0 && recommendationStats?.averageRating > 0
              ? 'md:grid-cols-3'
              : recommendationStats?.recommendationPercentage > 0 || recommendationStats?.averageRating > 0
              ? 'md:grid-cols-2'
              : 'md:grid-cols-1'
          } gap-8`}>
            {/* Would Recommend - Only show if recommendation percentage > 0 */}
            {recommendationStats && recommendationStats.recommendationPercentage > 0 && (
              <div className="text-center">
                <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <div className="text-3xl font-bold text-blue-700">
                    {Math.round(recommendationStats.recommendationPercentage)}%
                  </div>
                </div>
                <h4 className="font-bold text-xl text-gray-800 mb-2">
                  {t("reviews.stats.recommend.title")}
                </h4>
                <p className="text-gray-600">
                  {t("reviews.stats.recommend.description")}
                </p>
                {recommendationStats.totalReviews > 0 && (
                  <p className="text-xs text-gray-500 mt-2">
                    {recommendationStats.wouldRecommend} /{" "}
                    {recommendationStats.totalReviews} {t("reviews.reviews")}
                  </p>
                )}
              </div>
            )}

            {/* Average Rating - Only show if averageRating > 0 */}
            {recommendationStats && recommendationStats.averageRating > 0 && (
              <div className="text-center">
                <div className="bg-amber-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <div className="text-3xl font-bold text-amber-700">
                    {recommendationStats.averageRating.toFixed(1)}
                  </div>
                </div>
                <h4 className="font-bold text-xl text-gray-800 mb-2">
                  {t("reviews.stats.avgRating.title")}
                </h4>
                <p className="text-gray-600">
                  {t("reviews.stats.avgRating.description")}
                </p>
              </div>
            )}

            {/* Response Time - Always show */}
            <div className="text-center">
              <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <div className="text-3xl font-bold text-green-700">24h</div>
              </div>
              <h4 className="font-bold text-xl text-gray-800 mb-2">
                {t("reviews.stats.responseTime.title")}
              </h4>
              <p className="text-gray-600">
                {t("reviews.stats.responseTime.description")}
              </p>
            </div>
          </div>
        </div>

        {/* Why Book With Us - Compact Features Section */}
        <div className="mt-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1: Quick Response */}
            <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-shadow duration-300 border border-gray-100">
              <div className="flex items-center mb-4">
                <div className="bg-blue-500 w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FontAwesomeIcon icon={faBolt} className="text-white text-xl" />
                </div>
                <h4 className="font-bold text-gray-800 ml-4 text-sm">
                  {t("whyChooseUs.quickResponse.title")}
                </h4>
              </div>
              <p className="text-gray-600 text-xs leading-relaxed">
                {t("whyChooseUs.quickResponse.description")}
              </p>
              <div className="mt-3">
                <span className="inline-block px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-[10px] font-semibold">
                  {t("whyChooseUs.quickResponse.badge")}
                </span>
              </div>
            </div>

            {/* Feature 2: Secure Booking */}
            <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-shadow duration-300 border border-gray-100">
              <div className="flex items-center mb-4">
                <div className="bg-green-500 w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FontAwesomeIcon icon={faShieldAlt} className="text-white text-xl" />
                </div>
                <h4 className="font-bold text-gray-800 ml-4 text-sm">
                  {t("whyChooseUs.secureBooking.title")}
                </h4>
              </div>
              <p className="text-gray-600 text-xs leading-relaxed">
                {t("whyChooseUs.secureBooking.description")}
              </p>
              <div className="mt-3">
                <span className="inline-block px-3 py-1 bg-green-50 text-green-700 rounded-full text-[10px] font-semibold">
                  {t("whyChooseUs.secureBooking.badge")}
                </span>
              </div>
            </div>

            {/* Feature 3: Flexible Cancellation */}
            <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-shadow duration-300 border border-gray-100">
              <div className="flex items-center mb-4">
                <div className="bg-yellow-500 w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FontAwesomeIcon icon={faUndo} className="text-white text-xl" />
                </div>
                <h4 className="font-bold text-gray-800 ml-4 text-sm">
                  {t("whyChooseUs.flexibleCancellation.title")}
                </h4>
              </div>
              <p className="text-gray-600 text-xs leading-relaxed">
                {t("whyChooseUs.flexibleCancellation.description")}
              </p>
              <div className="mt-3">
                <span className="inline-block px-3 py-1 bg-yellow-50 text-yellow-700 rounded-full text-[10px] font-semibold">
                  {t("whyChooseUs.flexibleCancellation.badge")}
                </span>
              </div>
            </div>

            {/* Feature 4: 24/7 Support */}
            <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-shadow duration-300 border border-gray-100">
              <div className="flex items-center mb-4">
                <div className="bg-purple-500 w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FontAwesomeIcon icon={faHeadset} className="text-white text-xl" />
                </div>
                <h4 className="font-bold text-gray-800 ml-4 text-sm">
                  {t("whyChooseUs.support.title")}
                </h4>
              </div>
              <p className="text-gray-600 text-xs leading-relaxed">
                {t("whyChooseUs.support.description")}
              </p>
              <div className="mt-3">
                <span className="inline-block px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-[10px] font-semibold">
                  {t("whyChooseUs.support.badge")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhyChooseThisTour;
