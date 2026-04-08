import React, { useState, useEffect, useRef, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../contexts/AuthContext";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronDown,
  faChevronUp,
  faStar,
  faHotel,
  faUtensils,
  faPlane,
  faGift,
  faCalendarCheck,
  faMapMarkerAlt,
  faExpand,
  faLeaf,
  faUsers,
  faChild,
  faTheaterMasks,
  faLanguage,
  faVideo,
  faCube,
  faFire,
  faTrophy,
  faEye,
  faChartLine,
  faHeart as faHeartSolid,
  faBookmark as faBookmarkSolid,
  faUndo,
  faShieldAlt,
} from "@fortawesome/free-solid-svg-icons";
import { faBookmark } from "@fortawesome/free-regular-svg-icons";
import { useTranslation } from "react-i18next";
import Price from "../components/common/Price";
import ShareModal from "../components/common/ShareModal";
import EnhancedOverviewSection from "../components/tours/EnhancedOverviewSection";
import InteractiveMap from "../components/tours/InteractiveMap";
import AccommodationGallery from "../components/tours/AccommodationGallery";
import EnhancedAddonsSection from "../components/tours/EnhancedAddonsSection";
import VehiclesSection from "../components/tours/VehiclesSection";
import TourReviewsCarousel from "../components/tours/TourReviewsCarousel";
import WhyChooseThisTour from "../components/tours/WhyChooseThisTour";
import TourStatisticsSection from "../components/tours/TourStatisticsSection";

// Configuration de l'URL du backend
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

// Fonction pour construire les URLs d'API
const buildApiUrl = (endpoint) => `${API_BASE_URL}${endpoint}`;

// Fonction pour valider un token JWT
const isValidToken = (token) => {
  if (!token || typeof token !== 'string') return false;
  // JWT format: header.payload.signature (3 parts separated by dots)
  const parts = token.split('.');
  return parts.length === 3 && parts.every(part => part.length > 0);
};

// Fonction pour obtenir les en-têtes d'authentification
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");

  // Validate token before using it
  if (!isValidToken(token)) {
    // Clear invalid token from localStorage
    if (token !== null) {
      console.warn('[AUTH] Invalid token found in localStorage, clearing it');
      localStorage.removeItem("token");
    }
    return null; // Return null to indicate no valid auth headers
  }

  return {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };
};

// --- Enhanced Breadcrumb Component ---
const Breadcrumb = ({ tourName }) => {
  const { t } = useTranslation();

  return (
    <nav className="flex items-center text-sm text-white/80 mb-4">
      <Link to="/" className="hover:underline flex items-center">
        <span>{t("navigation.home")}</span>
      </Link>
      <span className="mx-2">&gt;</span>
      <Link to="/tours" className="hover:underline flex items-center">
        <span>{t("tours.india")}</span>
      </Link>
      <span className="mx-2">&gt;</span>
      <span className="font-semibold text-white flex items-center">
        <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2" />
        {tourName}
      </span>
    </nav>
  );
};

// --- Enhanced Hero Section ---
const HeroSection = ({ tour }) => {
  const { t } = useTranslation();
  const { user } = useContext(AuthContext);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isLoadingFavorite, setIsLoadingFavorite] = useState(false);
  const [isLoadingWishlist, setIsLoadingWishlist] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Vérifier si le tour est dans les favoris et wishlist au chargement
  useEffect(() => {
    const checkStatus = async () => {
      if (!user || !tour.id) return;

      // Get auth headers and validate token
      const authHeaders = getAuthHeaders();
      if (!authHeaders) {
        console.warn('[FAVORITES/WISHLIST] No valid token, skipping status check');
        return; // Skip if no valid token
      }

      try {
        // Check favorite status
        const favoriteResponse = await axios.get(
          buildApiUrl(`/api/users/favorites/${tour.id}/check`),
          authHeaders
        );
        setIsFavorite(favoriteResponse.data.isFavorite || false);

        // Check wishlist status
        const wishlistResponse = await axios.get(
          buildApiUrl(`/api/users/wishlist/${tour.id}/check`),
          authHeaders
        );
        setIsInWishlist(wishlistResponse.data.isInWishlist || false);
      } catch (error) {
        console.error("Error checking tour status:", error);
        // If error is 401 (unauthorized), clear the invalid token
        if (error.response?.status === 401) {
          console.warn('[AUTH] Received 401, clearing invalid token');
          localStorage.removeItem("token");
        }
      }
    };

    checkStatus();
  }, [user, tour.id]);

  // Gérer l'ajout/suppression des favoris
  const handleFavoriteToggle = async () => {
    if (!user) {
      toast.error(t("header.loginToFavorite"));
      return;
    }

    if (isLoadingFavorite) return;

    // Validate token before making request
    const authHeaders = getAuthHeaders();
    if (!authHeaders) {
      toast.error(t("header.pleaseLoginAgain") || "Please login again");
      return;
    }

    setIsLoadingFavorite(true);
    try {
      if (isFavorite) {
        await axios.delete(
          buildApiUrl(`/api/users/favorites/${tour.id}`),
          authHeaders
        );
        setIsFavorite(false);
        toast.success(t("header.removeFromFavorites"));
      } else {
        await axios.post(
          buildApiUrl(`/api/users/favorites/${tour.id}`),
          {},
          authHeaders
        );
        setIsFavorite(true);
        toast.success(t("header.addToFavorites"));
      }
    } catch (error) {
      console.error("Error managing favorites:", error);
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        toast.error(t("header.sessionExpired") || "Session expired, please login again");
      } else {
        toast.error("Error updating favorites");
      }
    } finally {
      setIsLoadingFavorite(false);
    }
  };

  // Gérer l'ajout/suppression de la wishlist
  const handleWishlistToggle = async () => {
    if (!user) {
      toast.error(t("header.loginToWishlist"));
      return;
    }

    if (isLoadingWishlist) return;

    // Validate token before making request
    const authHeaders = getAuthHeaders();
    if (!authHeaders) {
      toast.error(t("header.pleaseLoginAgain") || "Please login again");
      return;
    }

    setIsLoadingWishlist(true);
    try {
      if (isInWishlist) {
        await axios.delete(
          buildApiUrl(`/api/users/wishlist/${tour.id}`),
          authHeaders
        );
        setIsInWishlist(false);
        toast.success(t("header.removeFromWishlist"));
      } else {
        await axios.post(
          buildApiUrl(`/api/users/wishlist/${tour.id}`),
          {},
          authHeaders
        );
        setIsInWishlist(true);
        toast.success(t("header.addToWishlist"));
      }
    } catch (error) {
      console.error("Error managing wishlist:", error);
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        toast.error(t("header.sessionExpired") || "Session expired, please login again");
      } else {
        toast.error("Error updating wishlist");
      }
    } finally {
      setIsLoadingWishlist(false);
    }
  };

  return (
    <div className="relative h-[70vh] md:h-[80vh] bg-cover bg-center flex items-end text-white overflow-hidden">
      {/* Background image with parallax effect */}
      <div
        className="absolute inset-0 w-full h-full bg-cover bg-center"
        style={{
          backgroundImage: `url(${tour.main_image_url || tour.main_image})`,
          transform: "translateZ(0)",
          willChange: "transform",
        }}
      ></div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>

      {/* Floating action buttons */}
      <div className="absolute top-6 right-6 z-20 flex gap-3">
        {/* Favorite Button */}
        <button
          onClick={handleFavoriteToggle}
          disabled={isLoadingFavorite}
          className={`w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-sm transition-all transform hover:scale-110 ${
            isFavorite
              ? "bg-red-500 text-white shadow-lg shadow-red-500/50"
              : "bg-white/20 text-white hover:bg-white/30"
          } ${isLoadingFavorite ? "opacity-50 cursor-not-allowed" : ""}`}
          title={isFavorite ? t("header.removeFromFavorites") : t("header.addToFavorites")}
        >
          <FontAwesomeIcon icon={faHeartSolid} className="w-6 h-6" />
        </button>

        {/* Wishlist Button */}
        <button
          onClick={handleWishlistToggle}
          disabled={isLoadingWishlist}
          className={`w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-sm transition-all transform hover:scale-110 ${
            isInWishlist
              ? "bg-blue-500 text-white shadow-lg shadow-blue-500/50"
              : "bg-white/20 text-white hover:bg-white/30"
          } ${isLoadingWishlist ? "opacity-50 cursor-not-allowed" : ""}`}
          title={isInWishlist ? t("header.removeFromWishlist") : t("header.addToWishlist")}
        >
          <FontAwesomeIcon icon={isInWishlist ? faBookmarkSolid : faBookmark} className="w-6 h-6" />
        </button>

        {/* Share Button */}
        <button
          onClick={() => setIsShareModalOpen(true)}
          className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm text-white flex items-center justify-center hover:bg-white/30 transition-all transform hover:scale-110"
          title={t("header.shareThisTour")}
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
          </svg>
        </button>
      </div>

      {/* Share Modal */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        tour={tour}
      />

      {/* Hero content */}
      <div className="relative z-10 container mx-auto px-6 pb-16">
        <Breadcrumb tourName={tour.name || tour.title} />

        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-4 leading-tight">
              {tour.name || tour.title}
            </h1>

            <div className="flex items-center gap-4 flex-wrap">
              {/* Rating display - only if rating exists and is greater than 0 */}
              {(tour.rating > 0 || tour.avg_rating > 0) && (
                <div className="flex items-center bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                  {[...Array(5)].map((_, i) => (
                    <FontAwesomeIcon
                      key={i}
                      icon={faStar}
                      className={`w-5 h-5 mr-1 ${
                        i < Math.floor(tour.rating || tour.avg_rating || 0)
                          ? "text-amber-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                  <span className="ml-2 font-medium">
                    {(Number(tour.rating) || Number(tour.avg_rating) || 0).toFixed(1)}/5
                  </span>
                </div>
              )}

              {/* Review count - only if count exists and is greater than 0 */}
              {tour.review_count > 0 && (
                <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                  <span>
                    {t("tours.review", { count: tour.review_count })}
                  </span>
                </div>
              )}

              {/* Destinations */}
              {tour.destinations && tour.destinations.length > 0 && (
                <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                  <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2" />
                  <span>{tour.destinations.slice(0, 2).join(" • ")}</span>
                </div>
              )}

              {/* View count - only if exists and greater than 0 */}
              {tour.view_count > 0 && (
                <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                  <FontAwesomeIcon icon={faEye} className="mr-2" />
                  <span>
                    {t("tours.view", { count: tour.view_count })}
                  </span>
                </div>
              )}

              {/* Featured badge */}
              {tour.is_featured && (
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 px-4 py-2 rounded-full">
                  <FontAwesomeIcon icon={faTrophy} className="mr-2" />
                  <span>{t("tours.featured")}</span>
                </div>
              )}

              {/* Bestseller badge */}
              {tour.is_bestseller && (
                <div className="bg-gradient-to-r from-yellow-500 to-orange-500 px-4 py-2 rounded-full">
                  <FontAwesomeIcon icon={faTrophy} className="mr-2" />
                  <span>{t("tours.isBestseller")}</span>
                </div>
              )}

              {/* Trending badge */}
              {tour.is_trending && (
                <div className="bg-gradient-to-r from-red-500 to-pink-500 px-4 py-2 rounded-full">
                  <FontAwesomeIcon icon={faFire} className="mr-2" />
                  <span>{t("tours.isTrending")}</span>
                </div>
              )}
            </div>
          </div>

          {tour.original_price && (
            <div className="bg-gradient-to-r from-primary to-blue-600 text-white px-8 py-4 rounded-xl shadow-xl">
              <div className="text-xl font-bold mb-1">{t("tours.startingFrom")}</div>
              <div className="text-4xl font-bold">
                <Price
                  priceINR={tour.final_price || tour.original_price}
                  size="xl"
                  className="text-white"
                />
              </div>
              <div className="text-sm opacity-80">{t("tours.perPerson")}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


// --- Enhanced Tier Comparison Cards ---
const TierCard = ({ tier, isPopular, isSelected, onSelect, isExpanded, onToggleExpand, tourId }) => {
  const { t } = useTranslation();

  return (
    <div
      onClick={onSelect}
      className={`rounded-2xl overflow-hidden shadow-lg transition-all cursor-pointer ${
        isSelected
          ? "ring-4 ring-blue-500 ring-opacity-100 transform scale-105"
          : isPopular
          ? "ring-2 ring-primary ring-opacity-70 transform -translate-y-2"
          : "border border-gray-200 hover:shadow-xl"
      }`}
    >
      <div
        className={`p-6 text-center ${
          isPopular
            ? "bg-gradient-to-r from-primary to-blue-600 text-white"
            : "bg-white"
        }`}
      >
        <div className="font-bold text-xl mb-2">
          {tier.tier_name || tier.name}
        </div>
        <div className="text-3xl font-bold mb-4">
          <Price
            priceINR={tier.price || tier.base_price_inr}
            size="lg"
            className={isPopular ? "text-white" : "text-gray-800"}
          />
        </div>

        {isPopular && (
          <div className="bg-white text-primary text-sm font-bold px-3 py-1 rounded-full inline-block mb-4">
            {t('tiers.mostPopular')}
          </div>
        )}

        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleExpand();
          }}
          className={`flex items-center justify-center w-full text-sm font-semibold ${
            isPopular ? "text-white/80" : "text-gray-600"
          }`}
        >
          {isExpanded ? t('common.hideDetails') : t('common.viewDetails')}
          <FontAwesomeIcon
            icon={isExpanded ? faChevronUp : faChevronDown}
            className="ml-2"
          />
        </button>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-gray-50"
          >
            <div className="p-6 space-y-4">
              {tier.hotel_type && (
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('tiers.accommodation')}</span>
                  <span className="font-medium">{tier.hotel_type}</span>
                </div>
              )}

              <Link
                to={`/book/${tourId}?tier=${tier.id}`}
                className={`block w-full text-center font-bold py-3 px-6 rounded-lg transition-colors mt-6 ${
                  isPopular
                    ? "bg-primary text-white hover:bg-primary-dark"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {t('tiers.selectPackage')}
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const TiersSection = ({ tiers, selectedTier, onTierSelect, tourId }) => {
  const { t } = useTranslation();
  const [expandedTierId, setExpandedTierId] = useState(null);

  if (!tiers || tiers.length === 0) {
    return (
      <div className="mt-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            {t('tiers.title')}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t('tiers.contactForPricing')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-16">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-gray-800 mb-4">
          {t('tiers.title')}
        </h2>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          {t('tiers.selectPackageSubtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        {tiers.map((tier, index) => (
          <TierCard
            key={tier.id || index}
            tier={tier}
            isPopular={tier.tier_name === "Premium" || tier.name === "Premium"}
            isSelected={selectedTier?.id === tier.id}
            onSelect={() => onTierSelect(tier)}
            isExpanded={expandedTierId === tier.id}
            onToggleExpand={() => setExpandedTierId(expandedTierId === tier.id ? null : tier.id)}
            tourId={tourId}
          />
        ))}
      </div>
    </div>
  );
};

// --- Enhanced Itinerary Timeline ---
const TimelineDay = ({ day, isExpanded, onClick, t }) => {
  return (
    <div
      onClick={onClick}
      className="relative pl-14 pb-12 cursor-pointer group"
    >
      {/* Timeline marker */}
      <div className="absolute left-0 top-1 flex items-center justify-center w-10 h-10 bg-primary rounded-full border-4 border-white transform group-hover:scale-110 transition-transform">
        <span className="text-white font-bold">{day.day}</span>
      </div>

      <div>
        <p className="text-sm font-semibold text-primary mb-1">{t('itinerary.day')} {day.day}</p>
        <h3 className="text-2xl font-bold text-gray-800 flex items-center">
          {day.title}
          <FontAwesomeIcon
            icon={isExpanded ? faChevronUp : faChevronDown}
            className={`ml-4 transition-transform ${
              isExpanded ? "rotate-180" : ""
            }`}
          />
        </h3>
      </div>

      {/* Expandable content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="mt-6 space-y-4">
              <p className="text-gray-600 leading-relaxed">
                {day.details ||
                  day.description ||
                  t('itinerary.detailsComingSoon')}
              </p>

              {day.highlights && day.highlights.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-semibold text-gray-700 mb-3">
                    {t('itinerary.highlights')}
                  </h4>
                  <ul className="space-y-2">
                    {day.highlights.map((highlight, idx) => (
                      <li key={idx} className="flex items-start">
                        <div className="flex-shrink-0 mt-1 mr-3 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                          <FontAwesomeIcon icon={faStar} className="w-3 h-3" />
                        </div>
                        <span className="text-gray-600">{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ItinerarySection = ({ itinerary }) => {
  const { t } = useTranslation();
  const [expandedDays, setExpandedDays] = useState({});

  // Ensure itinerary is an array
  const itineraryArray = Array.isArray(itinerary) ? itinerary : [];

  useEffect(() => {
    if (itineraryArray && itineraryArray.length > 0) {
      setExpandedDays({ [itineraryArray[0].day]: true });
    }
  }, [itineraryArray]);

  const toggleDay = (day) => {
    setExpandedDays((prev) => ({ ...prev, [day]: !prev[day] }));
  };

  const expandAll = () => {
    const allExpanded = itineraryArray.reduce((acc, day) => {
      acc[day.day] = true;
      return acc;
    }, {});
    setExpandedDays(allExpanded);
  };

  const collapseAll = () => {
    setExpandedDays({});
  };

  if (!itineraryArray || itineraryArray.length === 0) {
    return (
      <div className="mt-16">
        <h2 className="text-4xl font-bold text-gray-800 mb-12">
          {t('itinerary.title')}
        </h2>
        <p className="text-gray-600 text-lg">
          {t('itinerary.comingSoon')}
        </p>
      </div>
    );
  }

  return (
    <div className="mt-16">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
        <h2 className="text-4xl font-bold text-gray-800">{t('itinerary.title')}</h2>
        <div className="flex gap-3">
          <button
            onClick={expandAll}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center"
          >
            <FontAwesomeIcon icon={faExpand} className="mr-2" />
            {t('itinerary.expandAll')}
          </button>
          <button
            onClick={collapseAll}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            {t('itinerary.collapseAll')}
          </button>
        </div>
      </div>

      <div className="border-l-2 border-primary/20 ml-5">
        {itineraryArray.map((day) => (
          <TimelineDay
            key={day.day}
            day={day}
            isExpanded={expandedDays[day.day]}
            onClick={() => toggleDay(day.day)}
            t={t}
          />
        ))}
      </div>
    </div>
  );
};

// --- Loading Skeleton ---
const LoadingSkeleton = () => (
  <div className="container mx-auto px-6 py-20">
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
      <div className="lg:col-span-2 space-y-8">
        <div className="h-12 bg-gray-200 rounded-xl w-3/4"></div>
        <div className="grid grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center">
              <div className="w-12 h-12 bg-gray-200 rounded-full mr-4"></div>
              <div>
                <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-48"></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col items-center">
        <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
        <div className="w-48 h-48 rounded-full bg-gray-200"></div>
        <div className="mt-6 space-y-3 w-full max-w-xs">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center">
              <div className="w-4 h-4 bg-gray-200 rounded-full mr-3"></div>
              <div className="h-3 bg-gray-200 rounded w-32"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

// --- Quick Summary Card ---
const QuickSummaryCard = ({ tour }) => {
  const { t } = useTranslation();

  const summaryItems = [];

  // Calculate duration from itinerary
  if (tour.itinerary) {
    const duration = typeof tour.itinerary === 'object' ? Object.keys(tour.itinerary).length : 0;
    if (duration > 0) {
      summaryItems.push({
        icon: faCalendarCheck,
        label: t("tours.duration"),
        value: t("tours.days", { count: duration }),
        color: "text-blue-600",
        bgColor: "bg-blue-50",
      });
    }
  }

  if (tour.starting_location) {
    summaryItems.push({
      icon: faMapMarkerAlt,
      label: t("tours.startingLocation"),
      value: tour.starting_location,
      color: "text-green-600",
      bgColor: "bg-green-50",
    });
  }

  if (tour.adventure_level) {
    summaryItems.push({
      icon: faExpand,
      label: t("tours.adventureLevel"),
      value: tour.adventure_level,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    });
  }

  if (tour.max_group_size) {
    summaryItems.push({
      icon: faUsers,
      label: t("tours.groupSize"),
      value: `${tour.max_group_size} ${t("common.people")}`,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
    });
  }

  if (tour.languages && tour.languages.length > 0) {
    const languageList = Array.isArray(tour.languages)
      ? tour.languages.join(", ")
      : tour.languages;
    summaryItems.push({
      icon: faLanguage,
      label: t("tours.languages"),
      value: languageList,
      color: "text-pink-600",
      bgColor: "bg-pink-50",
    });
  }

  if (summaryItems.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mt-8 relative z-10 border-t-4 border-primary">
      <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
        <FontAwesomeIcon icon={faStar} className="text-primary mr-3" />
        {t("tours.quickSummary")}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {summaryItems.map((item, index) => (
          <div
            key={index}
            className={`flex items-center p-4 rounded-xl ${item.bgColor} transition-all hover:shadow-md`}
          >
            <div className={`w-12 h-12 rounded-full ${item.bgColor} flex items-center justify-center ${item.color} mr-4 ring-2 ring-white shadow-sm`}>
              <FontAwesomeIcon icon={item.icon} className="text-xl" />
            </div>
            <div className="flex-1">
              <div className="text-xs text-gray-600 font-medium uppercase tracking-wide mb-1">
                {item.label}
              </div>
              <div className={`font-bold ${item.color} text-sm`}>
                {item.value}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- Tour Features Section ---
const TourFeaturesSection = ({ tour }) => {
  const { t } = useTranslation();

  const features = [];

  if (tour.eco_friendly) {
    features.push({
      icon: faLeaf,
      label: t("tours.ecoFriendly"),
      color: "text-green-600",
      bgColor: "bg-green-100",
    });
  }

  if (tour.family_friendly) {
    features.push({
      icon: faUsers,
      label: t("tours.familyFriendly"),
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    });
  }

  if (tour.cultural_immersion) {
    features.push({
      icon: faTheaterMasks,
      label: t("tours.culturalImmersion"),
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    });
  }

  if (tour.statistics?.is_trending) {
    features.push({
      icon: faFire,
      label: t("tours.isTrending"),
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    });
  }

  if (tour.statistics?.is_bestseller) {
    features.push({
      icon: faTrophy,
      label: t("tours.isBestseller"),
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
    });
  }

  if (features.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-3 mt-6">
      {features.map((feature, index) => (
        <div
          key={index}
          className={`flex items-center px-4 py-2 rounded-full ${feature.bgColor}`}
        >
          <FontAwesomeIcon icon={feature.icon} className={`mr-2 ${feature.color}`} />
          <span className={`font-medium ${feature.color}`}>{feature.label}</span>
        </div>
      ))}
    </div>
  );
};

// --- Highlights Section ---
const HighlightsSection = ({ tour }) => {
  const { t } = useTranslation();

  const highlights = tour.highlights || [];

  if (!highlights || highlights.length === 0) return null;

  return (
    <div className="mt-12 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-2xl shadow-lg p-8">
      <h3 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
        <FontAwesomeIcon icon={faStar} className="text-yellow-500 mr-3" />
        {t("tours.highlights")}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {highlights.map((highlight, index) => (
          <div
            key={index}
            className="flex items-start bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all"
          >
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white font-bold text-sm mr-4 mt-1">
              {index + 1}
            </div>
            <p className="text-gray-700 leading-relaxed flex-1">{highlight}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- Inclusions & Exclusions Section ---
const InclusionsExclusionsSection = ({ tour, selectedTier }) => {
  const { t } = useTranslation();

  // Use tier-specific inclusions/exclusions if available, otherwise fall back to tour-level
  const inclusions = selectedTier?.inclusions_summary || tour.inclusions || [];
  const exclusions = selectedTier?.exclusions_summary || tour.exclusions || [];

  if (inclusions.length === 0 && exclusions.length === 0) return null;

  const tierName = selectedTier?.tier_name || selectedTier?.name || '';

  const getIconForType = (type) => {
    const iconMap = {
      accommodation: faHotel,
      meals: faUtensils,
      transport: faPlane,
      guide: faUsers,
      insurance: faGift,
      activities: faTheaterMasks,
    };
    return iconMap[type?.toLowerCase()] || faGift;
  };

  return (
    <div className="mt-12">
      {/* Tier indicator */}
      {tierName && (
        <div className="text-center mb-6">
          <span className="inline-block px-6 py-2 bg-blue-100 text-blue-800 rounded-full font-semibold text-lg">
            {t("tours.showingFor")}: {tierName} {t("tours.package")}
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inclusions */}
        {inclusions.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 border-t-4 border-green-500">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
                <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              {t("tours.includes")}
            </h3>
            <div className="space-y-3">
              {inclusions.map((item, index) => {
                // Handle both string arrays and object arrays
                const isString = typeof item === 'string';
                const title = isString ? item : item.title;
                const description = isString ? null : item.description;
                const type = isString ? null : (item.inclusion_type || item.type);

                return (
                  <div
                    key={index}
                    className="flex items-start p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                  >
                    <FontAwesomeIcon
                      icon={getIconForType(type)}
                      className="text-green-600 mt-1 mr-3 flex-shrink-0"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-gray-800">
                        {title}
                      </div>
                      {description && (
                        <div className="text-sm text-gray-600 mt-1">
                          {description}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      {/* Exclusions */}
      {exclusions.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-6 border-t-4 border-red-500">
          <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center mr-3">
              <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
            {t("tours.excludes")}
          </h3>
          <div className="space-y-3">
            {exclusions.map((item, index) => {
              // Handle both string arrays and object arrays
              const isString = typeof item === 'string';
              const title = isString ? item : item.title;
              const description = isString ? null : item.description;

              return (
                <div
                  key={index}
                  className="flex items-start p-3 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <div className="w-2 h-2 rounded-full bg-red-500 mt-2 mr-3 flex-shrink-0"></div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-800">
                      {title}
                    </div>
                    {description && (
                      <div className="text-sm text-gray-600 mt-1">
                        {description}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

// --- Tour Info Section ---
const TourInfoSection = ({ tour }) => {
  const { t } = useTranslation();

  const infoItems = [];

  if (tour.adventure_level) {
    infoItems.push({
      label: t("tours.adventureLevel"),
      value: tour.adventure_level,
      icon: faExpand,
    });
  }

  if (tour.min_age) {
    infoItems.push({
      label: t("tours.minAge"),
      value: `${tour.min_age}+ years`,
      icon: faChild,
    });
  }

  if (tour.max_group_size) {
    infoItems.push({
      label: t("tours.maxGroupSize"),
      value: `${tour.max_group_size} ${t("common.people")}`,
      icon: faUsers,
    });
  }

  if (tour.languages) {
    infoItems.push({
      label: t("tours.languages"),
      value: Array.isArray(tour.languages) ? tour.languages.join(", ") : tour.languages,
      icon: faLanguage,
    });
  }

  if (infoItems.length === 0) return null;

  return (
    <div className="mt-8 bg-white rounded-2xl shadow-lg p-6">
      <h3 className="text-2xl font-bold text-gray-800 mb-6">{t('tourInfo.title')}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {infoItems.map((item, index) => (
          <div key={index} className="flex items-center p-4 bg-gray-50 rounded-lg">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-4">
              <FontAwesomeIcon icon={item.icon} />
            </div>
            <div>
              <div className="text-sm text-gray-600">{item.label}</div>
              <div className="font-semibold text-gray-800">{item.value}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- Availability & Themes Section ---
const AvailabilityThemesSection = ({ tour }) => {
  const { t } = useTranslation();

  const hasAvailability = tour.available_from || tour.available_until;
  const hasThemes = tour.themes && tour.themes.length > 0;

  if (!hasAvailability && !hasThemes) return null;

  return (
    <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Availability */}
      {hasAvailability && (
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl shadow-lg p-6 border-l-4 border-green-500">
          <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <FontAwesomeIcon icon={faCalendarCheck} className="text-green-600 mr-3" />
            {t("tours.availability")}
          </h3>
          <div className="space-y-4">
            {tour.available_from && (
              <div className="flex items-center bg-white rounded-lg p-4 shadow-sm">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600 mr-4">
                  <FontAwesomeIcon icon={faCalendarCheck} />
                </div>
                <div>
                  <div className="text-sm text-gray-600 font-medium">{t("tours.availableFrom")}</div>
                  <div className="font-bold text-gray-800">
                    {new Date(tour.available_from).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>
              </div>
            )}
            {tour.available_until && (
              <div className="flex items-center bg-white rounded-lg p-4 shadow-sm">
                <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 mr-4">
                  <FontAwesomeIcon icon={faCalendarCheck} />
                </div>
                <div>
                  <div className="text-sm text-gray-600 font-medium">{t("tours.availableUntil")}</div>
                  <div className="font-bold text-gray-800">
                    {new Date(tour.available_until).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Themes */}
      {hasThemes && (
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl shadow-lg p-6 border-l-4 border-purple-500">
          <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <FontAwesomeIcon icon={faTheaterMasks} className="text-purple-600 mr-3" />
            {t("tours.themes")}
          </h3>
          <div className="flex flex-wrap gap-3">
            {tour.themes.map((theme, index) => (
              <div
                key={index}
                className="px-4 py-2 bg-white rounded-full shadow-sm hover:shadow-md transition-all border-2 border-purple-200 hover:border-purple-400"
              >
                <span className="font-semibold text-purple-700">{theme}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// --- Video and Virtual Tour Section ---
const MediaSection = ({ tour }) => {
  const { t } = useTranslation();

  if (!tour.video_url && !tour.virtual_tour_url) return null;

  return (
    <div className="mt-8">
      <h3 className="text-2xl font-bold text-gray-800 mb-6">Experience Preview</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tour.video_url && (
          <div className="bg-white rounded-2xl shadow-lg p-4">
            <div className="flex items-center mb-4">
              <FontAwesomeIcon icon={faVideo} className="text-primary text-xl mr-3" />
              <h4 className="font-semibold text-gray-800">{t("tours.watchVideo")}</h4>
            </div>
            <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden">
              <iframe
                src={tour.video_url}
                className="w-full h-full"
                allowFullScreen
                title="Tour Video"
              />
            </div>
          </div>
        )}

        {tour.virtual_tour_url && (
          <div className="bg-white rounded-2xl shadow-lg p-4">
            <div className="flex items-center mb-4">
              <FontAwesomeIcon icon={faCube} className="text-primary text-xl mr-3" />
              <h4 className="font-semibold text-gray-800">{t("tours.viewVirtualTour")}</h4>
            </div>
            <a
              href={tour.virtual_tour_url}
              target="_blank"
              rel="noopener noreferrer"
              className="block aspect-video bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center hover:shadow-xl transition-all"
            >
              <div className="text-center">
                <FontAwesomeIcon icon={faCube} className="text-6xl text-primary mb-4" />
                <div className="text-lg font-semibold text-gray-800">Launch Virtual Tour</div>
              </div>
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

// --- Additional Info Section ---
const AdditionalInfoSection = ({ tour }) => {
  const { t } = useTranslation();
  const [expandedIndex, setExpandedIndex] = useState(null);

  // Helper function to parse content - handles both strings and arrays
  const parseContent = (content) => {
    if (!content) return null;

    // If it's already an array, return it
    if (Array.isArray(content)) {
      return content;
    }

    // If it's a string that looks like a PostgreSQL array
    if (typeof content === 'string') {
      // Check if it's a PostgreSQL array format: {item1,item2,item3}
      if (content.startsWith('{') && content.endsWith('}')) {
        // Remove curly braces and split by comma
        const items = content
          .slice(1, -1)
          .split(',')
          .map(item => item.trim().replace(/^"(.*)"$/, '$1')) // Remove quotes if present
          .filter(item => item.length > 0);
        return items.length > 0 ? items : null;
      }

      // Try to parse as JSON array
      try {
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      } catch (e) {
        // Not JSON, return as single string
      }

      // Return as single item if it's just a regular string
      return content;
    }

    return content;
  };

  const sections = [];

  if (tour.cancellation_policy) {
    sections.push({
      title: t("tours.cancellationPolicy"),
      content: parseContent(tour.cancellation_policy),
      icon: faUndo,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
    });
  }

  if (tour.booking_terms) {
    sections.push({
      title: t("tours.bookingTerms"),
      content: parseContent(tour.booking_terms),
      icon: faCalendarCheck,
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
    });
  }

  if (tour.what_to_bring) {
    sections.push({
      title: t("tours.whatToBring"),
      content: parseContent(tour.what_to_bring),
      icon: faGift,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
    });
  }

  if (tour.important_notes) {
    sections.push({
      title: t("tours.importantNotes"),
      content: parseContent(tour.important_notes),
      icon: faShieldAlt,
      color: "text-red-600",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
    });
  }

  if (sections.length === 0) return null;

  const toggleSection = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  // Helper function to render content
  const renderContent = (content) => {
    if (Array.isArray(content)) {
      return (
        <ul className="space-y-2 list-none">
          {content.map((item, idx) => (
            <li key={idx} className="flex items-start">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary mr-3 mt-0.5 flex-shrink-0">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </span>
              <span className="flex-1 text-gray-700">{item}</span>
            </li>
          ))}
        </ul>
      );
    }

    return (
      <p className="text-gray-700 whitespace-pre-wrap leading-relaxed text-base">
        {content}
      </p>
    );
  };

  return (
    <div className="mt-12">
      <div className="mb-8 text-center">
        <h2 className="text-4xl font-bold text-gray-800 mb-3">
          {t("tours.importantInformation")}
        </h2>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          {t("tours.importantInformationSubtitle")}
        </p>
      </div>

      <div className="space-y-4">
        {sections.map((section, index) => (
          <div
            key={index}
            className={`bg-white rounded-2xl shadow-lg border-2 ${section.borderColor} overflow-hidden transition-all duration-300 hover:shadow-xl`}
          >
            {/* Header - Always Visible */}
            <button
              onClick={() => toggleSection(index)}
              className={`w-full px-6 py-5 flex items-center justify-between hover:bg-gray-50 transition-all duration-200 ${
                expandedIndex === index ? section.bgColor : ""
              }`}
              aria-expanded={expandedIndex === index}
              aria-controls={`section-content-${index}`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-14 h-14 rounded-full ${section.bgColor} flex items-center justify-center transition-all duration-300 shadow-md ${
                    expandedIndex === index ? "scale-110 shadow-lg" : ""
                  }`}
                >
                  <FontAwesomeIcon
                    icon={section.icon}
                    className={`text-2xl ${section.color}`}
                  />
                </div>
                <h3 className="text-xl font-bold text-gray-800 text-left">
                  {section.title}
                </h3>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-500 hidden sm:block">
                  {expandedIndex === index ? t("common.collapse") : t("common.expand")}
                </span>
                <FontAwesomeIcon
                  icon={expandedIndex === index ? faChevronUp : faChevronDown}
                  className={`text-gray-400 transition-transform duration-300 text-lg ${
                    expandedIndex === index ? "rotate-180" : ""
                  }`}
                />
              </div>
            </button>

            {/* Content - Expandable */}
            <AnimatePresence>
              {expandedIndex === index && (
                <motion.div
                  id={`section-content-${index}`}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="px-6 py-5 bg-gradient-to-br from-gray-50 to-white border-t-2 border-gray-100">
                    <div className="prose prose-sm max-w-none">
                      {renderContent(section.content)}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      {/* Info Badge */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-8 flex items-start gap-4 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl shadow-md"
      >
        <div className="flex-shrink-0">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
            <FontAwesomeIcon icon={faShieldAlt} className="text-blue-600 text-2xl" />
          </div>
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-bold text-blue-900 mb-1">
            {t("tours.pleaseNote")}
          </h4>
          <p className="text-sm text-blue-800 leading-relaxed">
            {t("tours.policyNote")}
          </p>
        </div>
      </motion.div>
    </div>
  );
};

// --- Main Tour Detail Page ---
const TourDetailPage = () => {
  const { tourId } = useParams();
  const [tour, setTour] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedTier, setSelectedTier] = useState(null);
  const { token } = useContext(AuthContext);
  const { t } = useTranslation();

  // États pour le bouton flottant et la flèche
  const [showFloatingButton, setShowFloatingButton] = useState(true);
  const [showScrollArrow, setShowScrollArrow] = useState(true);
  const tiersRef = useRef(null);

  // Fonction pour scroller vers la section des tiers
  const scrollToTiers = () => {
    if (tiersRef.current) {
      tiersRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Gérer le scroll pour afficher/masquer le bouton et la flèche
  useEffect(() => {
    const handleScroll = () => {
      // Masquer la flèche après le premier scroll (dès que l'utilisateur scrolle un peu)
      if (window.scrollY > 100) {
        setShowScrollArrow(false);
      } else {
        setShowScrollArrow(true);
      }

      // Vérifier si la section des tiers est visible
      if (tiersRef.current) {
        const rect = tiersRef.current.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight && rect.bottom > 0;

        // Masquer le bouton flottant quand la section des tiers est visible
        setShowFloatingButton(!isVisible);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Appeler une fois au montage

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Cleanup old localStorage entries (older than 1 hour)
    const cleanupOldViewTracking = () => {
      const now = Date.now();
      const ONE_HOUR = 3600000;
      const keysToRemove = [];

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('view_tracking_tour_')) {
          const timestamp = parseInt(localStorage.getItem(key) || "0");
          if (now - timestamp > ONE_HOUR) {
            keysToRemove.push(key);
          }
        }
      }

      keysToRemove.forEach(key => localStorage.removeItem(key));
    };

    const logView = async () => {
      const now = Date.now();
      const cacheKey = `view_tracking_tour_${tourId}`;

      // Cleanup old entries occasionally (10% chance per page load)
      if (Math.random() < 0.1) {
        cleanupOldViewTracking();
      }

      // Use localStorage instead of in-memory Map (persists across hot reloads)
      const lastViewTimeStr = localStorage.getItem(cacheKey);
      const lastViewTime = lastViewTimeStr ? parseInt(lastViewTimeStr) : 0;

      // Aggressive cooldown: 15 seconds (blocks React Strict Mode + rapid refreshes)
      const COOLDOWN_MS = 15000;

      if (lastViewTime && (now - lastViewTime) < COOLDOWN_MS) {
        const timeAgo = ((now - lastViewTime) / 1000).toFixed(1);
        console.debug(`[VIEW BLOCKED] Tour ${tourId} - Already logged ${timeAgo}s ago (cooldown: ${COOLDOWN_MS / 1000}s)`);
        return;
      }

      try {
        // Update localStorage IMMEDIATELY (before API call to prevent race conditions)
        localStorage.setItem(cacheKey, now.toString());

        console.log(`[VIEW TRACKING] Logging view for tour ${tourId}...`);

        // Log view for all visitors (authenticated and non-authenticated)
        const authHeaders = token ? getAuthHeaders() : null;
        const headers = authHeaders || { headers: { "Content-Type": "application/json" } };
        const response = await axios.post(
          buildApiUrl(`/api/tours/${tourId}/view`),
          {},
          headers
        );

        console.log(`[VIEW TRACKING] View logged successfully:`, response.data);

        // Log user activity only for authenticated users
        if (token) {
          // This is already handled in the backend via logUserActivity
        }
      } catch (err) {
        // If API call fails, remove from cache to allow retry
        localStorage.removeItem(cacheKey);
        console.error(`[VIEW TRACKING] View logging failed:`, err.message);
      }
    };

    const fetchTourDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(buildApiUrl(`/api/tours/${tourId}`));

        // Gérer différents formats de réponse
        let tourData = response.data;
        if (response.data && response.data.success) {
          tourData = response.data.data || response.data.tour;
        }

        setTour(tourData);
        // Set default selected tier to the first tier (usually Standard)
        if (tourData.tiers && tourData.tiers.length > 0) {
          setSelectedTier(tourData.tiers[0]);
        }
        logView(); // Log the view after fetching the tour details
      } catch (err) {
        console.error("Error fetching tour details:", err);
        toast.error("Failed to load tour details.");
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchTourDetails();
  }, [tourId]); // Only trigger on tourId change, not token

  if (loading) return <LoadingSkeleton />;

  if (error || !tour) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-2xl p-8 bg-white rounded-2xl shadow-xl">
          <div className="text-6xl text-red-500 mb-6">⚠️</div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Tour Not Found
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            We couldn't find the tour you're looking for. It may have been
            removed or doesn't exist.
          </p>
          <Link
            to="/tours"
            className="inline-block bg-primary text-white font-bold py-3 px-8 rounded-lg hover:bg-secondary transition-colors text-lg"
          >
            Browse Available Tours
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50">
      <HeroSection tour={tour} />

      {/* Flèche "Scroll Down" statique avec animation bounce - position normale après le hero */}
      {showScrollArrow && (
        <div className="flex justify-center py-8 bg-gray-50">
          <div className="flex flex-col items-center gap-1 text-primary animate-bounce">
            <span className="text-sm font-semibold">{t('common.scrollDown')}</span>
            <FontAwesomeIcon icon={faChevronDown} className="text-3xl" />
          </div>
        </div>
      )}

      <div className="container mx-auto px-6 py-16">
        {/* Quick Summary - Placed right after hero for immediate key info */}
        <QuickSummaryCard tour={tour} />

        {/* Badges and Features */}
        <TourFeaturesSection tour={tour} />

        {/* Overview - Main description */}
        <EnhancedOverviewSection tour={tour} selectedTier={selectedTier} />

        {/* Highlights - Key selling points */}
        <HighlightsSection tour={tour} />

        {/* Availability and Themes */}
        <AvailabilityThemesSection tour={tour} />

        {/* Package Tiers - Pricing options */}
        <div ref={tiersRef}>
          <TiersSection
            tiers={tour.tiers || tour.packages}
            selectedTier={selectedTier}
            onTierSelect={setSelectedTier}
            tourId={tourId}
          />
        </div>

        {/* Inclusions and Exclusions - Important for decision making, placed right after tiers */}
        <InclusionsExclusionsSection tour={tour} selectedTier={selectedTier} />

        {/* Itinerary - Day by day breakdown */}
        <ItinerarySection itinerary={tour.itinerary} />

        {/* Additional Info - Practical information */}
        <TourInfoSection tour={tour} />

        {/* Map and Location */}
        <InteractiveMap tour={tour} />

        {/* Media - Videos and virtual tours */}
        <MediaSection tour={tour} />

        {/* Accommodation Gallery */}
        <AccommodationGallery tour={tour} />

        {/* Add-ons and Extras */}
        <EnhancedAddonsSection tour={tour} />

        {/* Vehicles Section */}
        <div className="mt-16">
          <VehiclesSection tourId={tourId} selectedTier={selectedTier?.tier_name || selectedTier?.name} />
        </div>

        {/* Important Policies */}
        <AdditionalInfoSection tour={tour} />

        {/* Statistics - Social proof */}
        <TourStatisticsSection statistics={tour.statistics} viewCount={tour.view_count} />

        {/* Reviews - Social proof and testimonials */}
        <TourReviewsCarousel tour={tour} />

        {/* Why Choose This Tour - Stats and features */}
        <WhyChooseThisTour tour={tour} />
      </div>

      {/* Bouton flottant "Book Now" */}
      <AnimatePresence>
        {showFloatingButton && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ duration: 0.3 }}
            style={{ top: '90vh' }}
            className="fixed right-8 z-[9999]"
          >
            <button
              onClick={scrollToTiers}
              className="relative bg-gradient-to-br from-primary/80 via-blue-600/80 to-blue-700/80 backdrop-blur-md text-white px-8 py-4 rounded-2xl shadow-2xl hover:shadow-primary/50 transform hover:scale-105 transition-all duration-300 flex items-center justify-center font-bold text-lg group overflow-hidden"
            >
              {/* Effet de reflet bombé */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-transparent rounded-2xl"></div>
              <span className="relative z-10">{t('tiers.bookNow')}</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default TourDetailPage;
