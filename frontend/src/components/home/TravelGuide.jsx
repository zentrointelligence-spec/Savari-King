import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBook,
  faClock,
  faEye,
  faArrowRight,
  faStar,
  faBookOpen,
} from "@fortawesome/free-solid-svg-icons";

const TravelGuide = () => {
  const { t } = useTranslation();
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTravelGuides = async () => {
    try {
      setLoading(true);
      setError(null);

      const baseUrl =
        import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
      const response = await fetch(
        `${baseUrl}/api/homepage/travelGuide?limit=6`
      );

      if (!response.ok) {
        throw new Error("Error loading travel guides");
      }

      const result = await response.json();
      setGuides(result.data || []);
    } catch (err) {
      console.error("Error loading travel guides:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTravelGuides();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }).format(date);
    } catch (err) {
      return "";
    }
  };

  // Loading skeleton
  if (loading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-4">
              <FontAwesomeIcon
                icon={faBook}
                className="text-3xl text-blue-600 mr-3"
              />
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800">
                {t("blog.travelGuides")}
              </h2>
            </div>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {t("blog.subtitle")}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-lg shadow-lg overflow-hidden animate-pulse"
              >
                <div className="aspect-video bg-gray-200"></div>
                <div className="p-6">
                  <div className="h-6 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Error state
  if (error) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-4">
              <FontAwesomeIcon
                icon={faBook}
                className="text-3xl text-blue-600 mr-3"
              />
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800">
                {t("blog.travelGuides")}
              </h2>
            </div>
          </div>
          <div className="text-center py-8">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
              <p className="text-red-600 mb-4">{t("blog.errorLoading")}</p>
              <button
                onClick={fetchTravelGuides}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-300"
              >
                {t("common.tryAgain") || "Try Again"}
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Empty state
  if (guides.length === 0) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-4">
              <FontAwesomeIcon
                icon={faBook}
                className="text-3xl text-blue-600 mr-3"
              />
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800">
                {t("blog.travelGuides")}
              </h2>
            </div>
          </div>
          <div className="text-center py-8">
            <p className="text-gray-600 text-lg">{t("blog.noPosts")}</p>
          </div>
        </div>
      </section>
    );
  }

  // Main render with guides
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <FontAwesomeIcon
              icon={faBook}
              className="text-3xl text-blue-600 mr-3"
            />
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              {t("blog.travelGuides")}
            </h2>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t("blog.subtitle")}
          </p>
        </div>

        {/* Guides Grid */}
        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {guides.map((guide) => (
            <article
              key={guide.id}
              className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 group"
            >
              {/* Image */}
              <div className="relative aspect-video overflow-hidden">
                <img
                  src={
                    guide.featuredImage ||
                    guide.thumbnailImage ||
                    "/placeholder-guide.jpg"
                  }
                  alt={guide.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  onError={(e) => {
                    e.target.src = "/placeholder-guide.jpg";
                  }}
                />

                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                {/* Featured Badge */}
                {guide.isFeatured && (
                  <div className="absolute top-3 left-3 bg-yellow-500 text-white px-3 py-1 rounded-full flex items-center space-x-1 shadow-lg">
                    <FontAwesomeIcon icon={faStar} className="text-xs" />
                    <span className="text-xs font-semibold">
                      {t("blog.featured")}
                    </span>
                  </div>
                )}

                {/* Reading Time */}
                <div className="absolute top-3 right-3 bg-black/80 text-white px-3 py-1 rounded-lg flex items-center space-x-1 backdrop-blur-sm">
                  <FontAwesomeIcon icon={faClock} className="text-xs" />
                  <span className="text-xs font-medium">
                    {guide.metrics?.readingTime || 5} {t("blog.minRead")}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Title */}
                <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors duration-300">
                  <Link
                    to={`/blog/${guide.slug}`}
                    className="hover:no-underline"
                  >
                    {guide.title}
                  </Link>
                </h3>

                {/* Excerpt */}
                <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">
                  {guide.excerpt}
                </p>

                {/* Metadata */}
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <div className="flex items-center space-x-4">
                    {/* Views */}
                    {guide.metrics?.viewCount > 0 && (
                      <div className="flex items-center">
                        <FontAwesomeIcon
                          icon={faEye}
                          className="mr-2 text-gray-400"
                        />
                        <span className="font-medium">
                          {guide.metrics.viewCount}
                        </span>
                      </div>
                    )}

                    {/* Rating */}
                    {guide.metrics?.rating > 0 && (
                      <div className="flex items-center text-yellow-500">
                        <FontAwesomeIcon icon={faStar} className="mr-1" />
                        <span className="font-semibold">
                          {guide.metrics.rating.toFixed(1)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Published Date */}
                  {guide.publishedAt && (
                    <div className="text-sm text-gray-500 font-medium">
                      {formatDate(guide.publishedAt)}
                    </div>
                  )}
                </div>

                {/* Read More Button */}
                <Link
                  to={`/blog/${guide.slug}`}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-300 flex items-center justify-center space-x-2 font-semibold"
                >
                  <FontAwesomeIcon icon={faBookOpen} />
                  <span>{t("blog.readMore")}</span>
                  <FontAwesomeIcon icon={faArrowRight} />
                </Link>
              </div>
            </article>
          ))}
        </div>

        {/* View All Button */}
        <div
          className="text-center mt-12"
        >
          <Link
            to="/blog?category=travel-guides"
            className="inline-flex items-center bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition-all duration-300 font-semibold text-base shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            {t("common.viewAll") || "View All Guides"}
            <FontAwesomeIcon icon={faArrowRight} className="ml-3" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default TravelGuide;
