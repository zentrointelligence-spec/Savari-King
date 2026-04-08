import React, { useState, useMemo, useRef, useEffect } from "react";
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
} from "@fortawesome/free-solid-svg-icons";
import CochinImage from "../../assets/images/SouthIndiaCoastalBeauty.jpeg";

const EnhancedTourCard = ({ tour, index = 0 }) => {
  // États pour les interactions
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  // const [showQuickView, setShowQuickView] = useState(false); // For future implementation
  const [viewCount, setViewCount] = useState(
    tour.view_count || tour.viewCount || Math.floor(Math.random() * 500) + 100
  );

  const cardRef = useRef(null);
  const imageRef = useRef(null);

  // Calculs memoizés optimisés
  const { startingPrice, badgeData } = useMemo(() => {
    const minPrice = tour.tiers?.length
      ? Math.min(...tour.tiers.map((t) => t.price))
      : tour.price || 17999;

    let badgeInfo = null;

    // Utiliser le badge depuis les données backend ou calculer dynamiquement
    if (tour.featured_badge) {
      badgeInfo = {
        text: tour.featured_badge,
        color: "bg-primary-gradient",
        icon: faCrown,
      };
    } else if (tour.tiers?.some((t) => t.name === "Super Prime")) {
      badgeInfo = {
        text: "Luxury",
        color: "bg-primary-gradient",
        icon: faCrown,
      };
    } else if (tour.rating > 4.7) {
      badgeInfo = {
        text: "Best Seller",
        color: "bg-gradient-to-r from-amber-500 to-orange-500",
        icon: faFire,
      };
    } else if (tour.is_new || tour.isNew) {
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
    tour.destinations?.slice(0, 3).join(" • ") || "South India";

  // Gestion des images avec préchargement
  const handleImageLoad = () => setImageLoaded(true);
  const handleImageError = () => setImageError(true);

  // Effet parallax subtil sur l'image
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isHovered || !imageRef.current) return;

      const rect = cardRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = (y - centerY) / 20;
      const rotateY = (centerX - x) / 20;

      imageRef.current.style.transform = `scale(1.05) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    };

    const resetTransform = () => {
      if (imageRef.current) {
        imageRef.current.style.transform = "scale(1)";
      }
    };

    if (isHovered) {
      cardRef.current?.addEventListener("mousemove", handleMouseMove);
      cardRef.current?.addEventListener("mouseleave", resetTransform);
    }

    return () => {
      cardRef.current?.removeEventListener("mousemove", handleMouseMove);
      cardRef.current?.removeEventListener("mouseleave", resetTransform);
    };
  }, [isHovered]);

  // Animations d'entrée
  const cardVariants = {
    hidden: {
      opacity: 0,
      y: 50,
      scale: 0.9,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        delay: index * 0.1,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
    hover: {
      y: -8,
      scale: 1.02,
      transition: {
        duration: 0.3,
        ease: "easeOut",
      },
    },
  };

  const imageVariants = {
    hover: {
      scale: 1.1,
      transition: {
        duration: 0.4,
        ease: "easeOut",
      },
    },
  };

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.3 },
    },
  };

  return (
    <motion.div
      ref={cardRef}
      className="group relative bg-white rounded-2xl shadow-lg overflow-hidden h-full flex flex-col cursor-pointer"
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      style={{
        boxShadow: isHovered
          ? "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
          : "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
      }}
    >
      {/* Image Container avec overlay interactif */}
      <div className="relative aspect-[4/3] overflow-hidden">
        {/* Image de fond avec effet de chargement */}
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse" />
        )}

        <motion.img
          ref={imageRef}
          src={
            imageError
              ? CochinImage
              : tour.main_image_url || tour.image || CochinImage
          }
          alt={tour.name}
          className="w-full h-full object-cover transition-all duration-700"
          style={{
            opacity: imageLoaded ? 1 : 0,
            filter: isHovered ? "brightness(0.8)" : "brightness(1)",
          }}
          loading="lazy"
          decoding="async"
          onLoad={handleImageLoad}
          onError={handleImageError}
          variants={imageVariants}
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Badge premium */}
        <AnimatePresence>
          {badgeData && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className={`absolute top-4 left-4 text-white text-xs font-bold px-3 py-1.5 rounded-full ${badgeData.color} shadow-lg backdrop-blur-sm flex items-center gap-1.5 z-10`}
            >
              <FontAwesomeIcon icon={badgeData.icon} className="w-3 h-3" />
              {badgeData.text}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Actions flottantes */}
        <motion.div
          className="absolute top-4 right-4 flex flex-col gap-2 z-10"
          variants={overlayVariants}
          initial="hidden"
          animate={isHovered ? "visible" : "hidden"}
        >
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => {
              e.preventDefault();
              setIsFavorite(!isFavorite);
            }}
            className={`w-10 h-10 rounded-full backdrop-blur-md flex items-center justify-center transition-all ${
              isFavorite
                ? "bg-red-500 text-white"
                : "bg-white/20 text-white hover:bg-white/30"
            }`}
          >
            <FontAwesomeIcon icon={faHeart} className="w-4 h-4" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => {
              e.preventDefault();
              setIsBookmarked(!isBookmarked);
            }}
            className={`w-10 h-10 rounded-full backdrop-blur-md flex items-center justify-center transition-all ${
              isBookmarked
                ? "bg-blue-500 text-white"
                : "bg-white/20 text-white hover:bg-white/30"
            }`}
          >
            <FontAwesomeIcon icon={faBookmark} className="w-4 h-4" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/30 flex items-center justify-center transition-all"
          >
            <FontAwesomeIcon icon={faShare} className="w-4 h-4" />
          </motion.button>
        </motion.div>

        {/* Quick view overlay */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center z-20"
            >
              <motion.button
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white/90 backdrop-blur-sm text-gray-800 px-6 py-3 rounded-full font-semibold shadow-lg flex items-center gap-2 hover:bg-white transition-all"
                onClick={(e) => {
                  e.preventDefault();
                  // Quick view functionality to be implemented
                }}
              >
                <FontAwesomeIcon icon={faEye} />
                Quick View
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Indicateur de vues */}
        <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
          <FontAwesomeIcon icon={faEye} className="w-3 h-3" />
          {viewCount}
        </div>
      </div>

      {/* Contenu de la carte */}
      <div className="p-6 flex flex-col flex-grow">
        {/* Titre avec animation */}
        <motion.h3
          className="text-xl font-bold text-gray-800 mb-3 line-clamp-2 group-hover:text-primary transition-colors duration-300"
          layoutId={`title-${tour.id}`}
        >
          {tour.name}
        </motion.h3>

        {/* Rating avec animation des étoiles */}
        <div className="flex items-center text-sm mb-4">
          <div className="flex text-amber-400 mr-2">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
              >
                <FontAwesomeIcon
                  icon={faStar}
                  className={`w-4 h-4 ${
                    i < Math.floor(tour.rating || 4.8)
                      ? "text-amber-400"
                      : "text-gray-300"
                  }`}
                />
              </motion.div>
            ))}
          </div>
          <span className="font-semibold text-gray-700">{formattedRating}</span>
          <span className="mx-2 text-gray-400">•</span>
          <span className="text-gray-500">
            {tour.review_count || tour.reviewCount || 120} reviews
          </span>
        </div>

        {/* Informations du tour */}
        <div className="space-y-3 mb-4 flex-grow">
          <div className="flex items-center text-sm text-gray-600">
            <FontAwesomeIcon
              icon={faMapMarkerAlt}
              className="w-4 h-4 mr-2 text-primary"
            />
            <span className="line-clamp-1">{formattedDestinations}</span>
          </div>

          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center">
              <FontAwesomeIcon
                icon={faClock}
                className="w-4 h-4 mr-2 text-primary"
              />
              <span>{tour.tiers?.[0]?.duration || tour.duration || "4 Days / 3 Nights"}</span>
            </div>
            <div className="flex items-center">
              <FontAwesomeIcon
                icon={faUsers}
                className="w-4 h-4 mr-2 text-primary"
              />
              <span>2-12 people</span>
            </div>
          </div>
        </div>

        {/* Prix et CTA */}
        <div className="flex justify-between items-center pt-4 border-t border-gray-100">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">
              Starting from
            </p>
            <motion.p
              className="text-2xl font-bold text-primary"
              whileHover={{ scale: 1.05 }}
            >
              ₹{formattedPrice}
            </motion.p>
          </div>

          <Link
            to={`/tours/${tour.id}`}
            className="group/btn bg-primary-gradient hover:shadow-primary text-white font-semibold py-3 px-6 rounded-xl transition-all shadow-md hover:shadow-accent flex items-center gap-2 hover:scale-105"
            onClick={() => setViewCount((prev) => prev + 1)}
          >
            <span>Explore</span>
            <FontAwesomeIcon
              icon={faArrowRight}
              className="w-4 h-4 transition-transform group-hover/btn:translate-x-1"
            />
          </Link>
        </div>
      </div>

      {/* Effet de brillance au survol */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 opacity-0 group-hover:opacity-100"
        initial={{ x: "-100%" }}
        animate={isHovered ? { x: "100%" } : { x: "-100%" }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
        style={{ pointerEvents: "none" }}
      />
    </motion.div>
  );
};

export default React.memo(EnhancedTourCard);
