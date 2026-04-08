import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarCheck,
  faEye,
  faHeart,
  faTrophy,
  faChartLine,
} from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "react-i18next";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const TourStatisticsSection = ({ statistics, viewCount }) => {
  const { t } = useTranslation();
  const [globalStats, setGlobalStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGlobalStats = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/api/tours/statistics/global`);
        if (response.data.success) {
          setGlobalStats(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching global statistics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGlobalStats();
  }, []);

  if (!statistics || loading) return null;

  const stats = [];

  // Total Bookings - Compare to global
  if (statistics.total_bookings && globalStats?.total_bookings) {
    stats.push({
      label: t("tourStats.totalBookings.label"),
      value: statistics.total_bookings,
      total: globalStats.total_bookings,
      icon: faCalendarCheck,
      color: "text-blue-600",
      bgColor: "bg-blue-600",
      lightBg: "bg-blue-100",
      percentage: (statistics.total_bookings / globalStats.total_bookings) * 100,
      description: t("tourStats.totalBookings.description"),
    });
  }

  // Total Views - Use tour.view_count (passed as prop) instead of statistics.page_views
  if (viewCount && globalStats?.total_views) {
    stats.push({
      label: t("tourStats.totalViews.label"),
      value: viewCount,
      total: globalStats.total_views,
      icon: faEye,
      color: "text-purple-600",
      bgColor: "bg-purple-600",
      lightBg: "bg-purple-100",
      percentage: (viewCount / globalStats.total_views) * 100,
      description: t("tourStats.totalViews.description"),
    });
  }

  // Wishlist Count - Compare to global
  if (statistics.wishlist_count && globalStats?.total_wishlist) {
    stats.push({
      label: t("tourStats.wishlistCount.label"),
      value: statistics.wishlist_count,
      total: globalStats.total_wishlist,
      icon: faHeart,
      color: "text-red-600",
      bgColor: "bg-red-600",
      lightBg: "bg-red-100",
      percentage: (statistics.wishlist_count / globalStats.total_wishlist) * 100,
      description: t("tourStats.wishlistCount.description"),
    });
  }

  if (stats.length === 0) return null;

  return (
    <div className="mt-8 bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-3xl font-bold text-gray-800 mb-2">
            {t("tourStats.title")}
          </h3>
          <p className="text-gray-600">{t("tourStats.subtitle")}</p>
        </div>
        <div className="hidden md:block">
          <FontAwesomeIcon icon={faChartLine} className="text-5xl text-gray-200" />
        </div>
      </div>

      <div className="space-y-6">
        {stats.map((stat, index) => (
          <div key={index} className="group">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-full ${stat.lightBg} flex items-center justify-center transition-transform group-hover:scale-110`}
                >
                  <FontAwesomeIcon icon={stat.icon} className={`text-xl ${stat.color}`} />
                </div>
                <div>
                  <div className="font-semibold text-gray-800 text-lg">{stat.label}</div>
                  <div className="text-xs text-gray-500">{stat.description}</div>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-3xl font-bold ${stat.color}`}>
                  {stat.value.toLocaleString()}
                </div>
                <div className="text-xs text-gray-500">
                  {t("tourStats.outOf")} {stat.total.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`absolute top-0 left-0 h-full ${stat.bgColor} rounded-full transition-all duration-1000 ease-out`}
                style={{ width: `${Math.min(stat.percentage, 100)}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-shimmer"></div>
              </div>
              <div className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-600">
                {stat.percentage.toFixed(1)}%
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Badge */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="flex items-center justify-center gap-2 text-gray-600">
          <FontAwesomeIcon icon={faTrophy} className="text-yellow-500" />
          <span className="text-sm font-medium">
            {t("tourStats.footer", {
              count: (statistics.total_bookings || 0).toLocaleString(),
            })}
          </span>
        </div>
      </div>
    </div>
  );
};

export default TourStatisticsSection;
