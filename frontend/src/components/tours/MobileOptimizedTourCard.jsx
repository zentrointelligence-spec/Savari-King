import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faStar,
  faHeart,
  faShare,
  faMapMarkerAlt,
  faClock,
  faUsers,
  faBookmark,
  faEye,
  faArrowRight,
  faFire,
  faCrown,
  faGem,
  faChevronDown,
  faChevronUp,
} from "@fortawesome/free-solid-svg-icons";
import { useTouchGestures, useDeviceDetection } from "../../hooks";
import CochinImage from "../../assets/images/SouthIndiaCoastalBeauty.jpeg";

const MobileOptimizedTourCard = ({ tour, index = 0 }) => {
  // États pour les interactions
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [viewCount, setViewCount] = useState(
    tour.viewCount || Math.floor(Math.random() * 500) + 100
  );

  // Hooks personnalisés
  const { isMobile, isTablet } = useDeviceDetection();
  const { isSwipe, swipeDirection, touchHandlers } = useTouchGestures();

  // Calculs memoizés optimisés
  const { startingPrice, badgeData } = useMemo(() => {
    const minPrice = tour.tiers?.length
      ? Math.min(...tour.tiers.map((t) => t.price))
      : tour.price || 17999;

    let badgeInfo = null;

    if (tour.tiers?.some((t) => t.name === "Super Prime")) {
      badgeInfo = {
        text: "Luxury",
        color: "bg-gradient-to-r from-purple-600 to-pink-600",
        icon: faCrown,
      };
    } else if (tour.rating > 4.7) {
      badgeInfo = {
        text: "Best Seller",
        color: "bg-gradient-to-r from-amber-500 to-orange-500",
        icon: faFire,
      };
    } else if (tour.isNew) {
      badgeInfo = {
        text: "New",
        color: "bg-gradient-to-r from-green-500 to-emerald-500",
        icon: faGem,
      };
    }

    return {
      startingPrice: minPrice,
      badgeData: badgeInfo,
    };
  }, [tour]);

  // Formatage des données
  const formattedRating = useMemo(
    () => tour.rating?.toFixed(1) || "4.8",
    [tour]
  );
  const formattedPrice = useMemo(
    () => startingPrice.toLocaleString("en-IN", { maximumFractionDigits: 0 }),
    [startingPrice]
  );
  const formattedDestinations =
    tour.destinations?.slice(0, 2).join(" • ") || "South India";

  // Gestion des images
  const handleImageLoad = () => setImageLoaded(true);
  const handleImageError = () => setImageError(true);

  // Gestion des swipes
  React.useEffect(() => {
    if (isSwipe && swipeDirection === "left") {
      // Action pour swipe gauche (ex: ajouter aux favoris)
      setIsFavorite(!isFavorite);
    } else if (isSwipe && swipeDirection === "right") {
      // Action pour swipe droite (ex: partager)
      // Logique de partage
    }
  }, [isSwipe, swipeDirection, isFavorite]);

  // Animations adaptées au mobile
  const cardVariants = {
    hidden: {
      opacity: 0,
      y: isMobile ? 30 : 50,
      scale: 0.95,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: isMobile ? 0.4 : 0.6,
        delay: index * (isMobile ? 0.05 : 0.1),
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
    tap: {
      scale: 0.98,
      transition: { duration: 0.1 },
    },
  };

  const imageVariants = {
    hover: {
      scale: isMobile ? 1.02 : 1.1,
      transition: {
        duration: isMobile ? 0.2 : 0.4,
        ease: "easeOut",
      },
    },
  };

  // Layout adaptatif
  const cardLayout = isMobile ? "mobile" : isTablet ? "tablet" : "desktop";

  return (
    <motion.div
      className={`group relative bg-white rounded-2xl shadow-lg overflow-hidden h-full flex flex-col cursor-pointer ${
        cardLayout === "mobile" ? "mx-2" : ""
      }`}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileTap="tap"
      style={{
        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
      }}
      {...touchHandlers}
    >
      {/* Image Container optimisé mobile */}
      <div
        className={`relative overflow-hidden ${
          isMobile ? "aspect-[16/10]" : "aspect-[4/3]"
        }`}
      >
        {/* Image de fond avec effet de chargement */}
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse" />
        )}

        <motion.img
          src={
            imageError
              ? CochinImage
              : tour.main_image_url || tour.image || CochinImage
          }
          alt={tour.name}
          className="w-full h-full object-cover transition-all duration-500"
          style={{
            opacity: imageLoaded ? 1 : 0,
          }}
          loading="lazy"
          decoding="async"
          onLoad={handleImageLoad}
          onError={handleImageError}
          variants={imageVariants}
        />

        {/* Gradient overlay mobile-optimized */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

        {/* Badge premium */}
        <AnimatePresence>
          {badgeData && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className={`absolute top-3 left-3 text-white text-xs font-bold px-2 py-1 rounded-full ${badgeData.color} shadow-lg backdrop-blur-sm flex items-center gap-1 z-10`}
            >
              <FontAwesomeIcon icon={badgeData.icon} className="w-2.5 h-2.5" />
              {badgeData.text}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Actions flottantes optimisées mobile */}
        <div className="absolute top-3 right-3 flex gap-2 z-10">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.preventDefault();
              setIsFavorite(!isFavorite);
            }}
            className={`w-8 h-8 rounded-full backdrop-blur-md flex items-center justify-center transition-all ${
              isFavorite ? "bg-red-500 text-white" : "bg-white/20 text-white"
            }`}
          >
            <FontAwesomeIcon icon={faHeart} className="w-3 h-3" />
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.preventDefault();
              setIsBookmarked(!isBookmarked);
            }}
            className={`w-8 h-8 rounded-full backdrop-blur-md flex items-center justify-center transition-all ${
              isBookmarked ? "bg-blue-500 text-white" : "bg-white/20 text-white"
            }`}
          >
            <FontAwesomeIcon icon={faBookmark} className="w-3 h-3" />
          </motion.button>
        </div>

        {/* Indicateur de vues */}
        <div className="absolute bottom-3 left-3 bg-black/50 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
          <FontAwesomeIcon icon={faEye} className="w-2.5 h-2.5" />
          {viewCount}
        </div>
      </div>

      {/* Contenu de la carte optimisé mobile */}
      <div
        className={`p-4 flex flex-col flex-grow ${
          isMobile ? "space-y-3" : "space-y-4"
        }`}
      >
        {/* Titre avec animation */}
        <motion.h3
          className={`font-bold text-gray-800 line-clamp-2 group-hover:text-primary transition-colors duration-300 ${
            isMobile ? "text-lg" : "text-xl"
          }`}
          layoutId={`title-${tour.id}`}
        >
          {tour.name}
        </motion.h3>

        {/* Rating compact pour mobile */}
        <div className="flex items-center justify-between">
          <div className="flex items-center text-sm">
            <div className="flex text-amber-400 mr-2">
              {[...Array(5)].map((_, i) => (
                <FontAwesomeIcon
                  key={i}
                  icon={faStar}
                  className={`w-3 h-3 ${
                    i < Math.floor(tour.rating || 4.8)
                      ? "text-amber-400"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <span className="font-semibold text-gray-700">
              {formattedRating}
            </span>
          </div>

          <span className="text-xs text-gray-500">
            {tour.reviewCount || 120} reviews
          </span>
        </div>

        {/* Informations du tour compactes */}
        <div className="space-y-2 flex-grow">
          <div className="flex items-center text-sm text-gray-600">
            <FontAwesomeIcon
              icon={faMapMarkerAlt}
              className="w-3 h-3 mr-2 text-primary"
            />
            <span className="line-clamp-1">{formattedDestinations}</span>
          </div>

          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center">
              <FontAwesomeIcon
                icon={faClock}
                className="w-3 h-3 mr-2 text-primary"
              />
              <span>{tour.tiers?.[0]?.duration || "4 Days"}</span>
            </div>
            <div className="flex items-center">
              <FontAwesomeIcon
                icon={faUsers}
                className="w-3 h-3 mr-2 text-primary"
              />
              <span>2-12 people</span>
            </div>
          </div>
        </div>

        {/* Toggle détails pour mobile */}
        {isMobile && (
          <motion.button
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center justify-center text-sm text-primary font-medium py-2"
            whileTap={{ scale: 0.95 }}
          >
            <span>{showDetails ? "Less Info" : "More Info"}</span>
            <FontAwesomeIcon
              icon={showDetails ? faChevronUp : faChevronDown}
              className="w-3 h-3 ml-1"
            />
          </motion.button>
        )}

        {/* Détails étendus pour mobile */}
        <AnimatePresence>
          {showDetails && isMobile && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden border-t border-gray-100 pt-3"
            >
              <div className="space-y-2 text-sm text-gray-600">
                <p>
                  Experience the best of South India with luxury accommodations
                  and expert guides.
                </p>
                <div className="flex flex-wrap gap-1">
                  {["Beach", "Culture", "Adventure"].map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Prix et CTA optimisés mobile */}
        <div className="flex justify-between items-center pt-3 border-t border-gray-100">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">
              Starting from
            </p>
            <motion.p
              className={`font-bold text-primary ${
                isMobile ? "text-xl" : "text-2xl"
              }`}
              whileHover={{ scale: isMobile ? 1.02 : 1.05 }}
            >
              ₹{formattedPrice}
            </motion.p>
          </div>

          <Link
            to={`/tours/${tour.id}`}
            className={`group/btn bg-gradient-to-r from-primary to-blue-600 hover:from-primary-dark hover:to-blue-700 text-white font-semibold rounded-xl transition-all shadow-md hover:shadow-lg flex items-center gap-2 ${
              isMobile ? "py-2 px-4 text-sm" : "py-3 px-6"
            }`}
            onClick={() => setViewCount((prev) => prev + 1)}
          >
            <span>Explore</span>
            <FontAwesomeIcon
              icon={faArrowRight}
              className="w-3 h-3 transition-transform group-hover/btn:translate-x-1"
            />
          </Link>
        </div>
      </div>

      {/* Swipe indicators pour mobile */}
      {isMobile && (
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
          <div className="w-1 h-1 bg-white/50 rounded-full"></div>
          <div className="w-1 h-1 bg-white/50 rounded-full"></div>
          <div className="w-1 h-1 bg-white/50 rounded-full"></div>
        </div>
      )}
    </motion.div>
  );
};

export default React.memo(MobileOptimizedTourCard);
