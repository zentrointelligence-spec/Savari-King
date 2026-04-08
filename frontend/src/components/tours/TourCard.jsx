import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import CochinImage from "../../assets/images/SouthIndiaCoastalBeauty.jpeg";
// import PlaceholderImage from "../../assets/images/tour-card-placeholder.jpg";

const TourCard = ({ tour }) => {
  // États pour le chargement d'image et l'erreur
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Calculs memoizés pour éviter les recalculs inutiles
  const { startingPrice, badgeData } = useMemo(() => {
    const minPrice = tour.tiers?.length
      ? Math.min(...tour.tiers.map((t) => t.price))
      : 0;

    // Utiliser le badge depuis les données backend ou calculer dynamiquement
    const badgeInfo = tour.featured_badge
      ? { text: tour.featured_badge, color: "bg-primary" }
      : tour.tiers?.some((t) => t.name === "Super Prime")
      ? { text: "Luxury Option", color: "bg-primary" }
      : tour.rating > 4.7
      ? { text: "Best Seller", color: "bg-yellow-500" }
      : tour.is_new
      ? { text: "New Tour", color: "bg-green-500" }
      : null;

    return {
      startingPrice: minPrice,
      badgeData: badgeInfo,
    };
  }, [tour]);

  // Formatage des nombres memoizé
  const formattedRating = useMemo(
    () => tour.rating?.toFixed(1) || "4.8",
    [tour]
  );
  const formattedPrice = useMemo(
    () => startingPrice.toLocaleString("en-IN", { maximumFractionDigits: 0 }),
    [startingPrice]
  );

  // Gestion du chargement d'image
  const handleImageLoad = () => setImageLoaded(true);
  const handleImageError = () => setImageError(true);

  // Destinations clés formatées
  const formattedDestinations =
    tour.destinations?.slice(0, 3).join(" • ") || "";

  return (
    <div
      className="app-surface rounded-xl shadow-primary overflow-hidden group transition-all duration-300 hover:shadow-accent hover:-translate-y-1 h-full flex flex-col violet-glow"
      aria-label={`Tour package: ${tour.name}`}
      role="article"
    >
      <div className="relative aspect-video overflow-hidden">
        {/* Placeholder pendant le chargement */}
        {!imageLoaded && !imageError && (
          <img
            src={CochinImage}
            alt=""
            className="absolute inset-0 w-full h-full object-cover blur-sm"
            aria-hidden="true"
          />
        )}

        {/* Image principale avec lazy loading */}
        <img
          src={
            imageError
              ? CochinImage
              : tour.main_image_url || tour.image || CochinImage
          }
          alt={tour.name}
          className={`w-full h-full object-cover transition-transform duration-500 ${
            imageLoaded ? "opacity-100" : "opacity-0"
          } group-hover:scale-105`}
          loading="lazy"
          decoding="async"
          onLoad={handleImageLoad}
          onError={handleImageError}
        />

        {/* Badge dynamique */}
        {badgeData && (
          <div
            className={`absolute top-3 left-3 text-white text-xs font-bold px-3 py-1 rounded-full ${badgeData.color} z-10 shadow-md`}
            aria-label={badgeData.text}
          >
            {badgeData.text}
          </div>
        )}
      </div>

      <div className="p-5 flex flex-col flex-grow">
        <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2 h-14">
          {tour.name}
        </h3>

        {/* Rating avec microdata */}
        <div
          className="flex items-center text-sm mb-3"
          itemScope
          itemType="https://schema.org/Rating"
        >
          <div className="flex text-amber-400 mr-1">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className={`w-4 h-4 ${
                  i < Math.floor(tour.rating)
                    ? "fill-current"
                    : "stroke-current stroke-1 fill-transparent"
                }`}
                viewBox="0 0 24 24"
              >
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
              </svg>
            ))}
          </div>
          <span className="font-semibold text-gray-700" itemProp="ratingValue">
            {formattedRating}
          </span>
          <span className="mx-1 text-gray-400">•</span>
          <span className="text-gray-500" itemProp="reviewCount">
            {tour.review_count || tour.reviewCount || 120} reviews
          </span>
        </div>

        <div className="mb-3 flex-grow">
          {formattedDestinations && (
            <p className="text-sm text-gray-600 mb-2 flex items-start line-clamp-2">
              <svg
                className="w-4 h-4 mt-0.5 mr-2 text-gray-400 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{formattedDestinations}</span>
            </p>
          )}

          {/* Affichage du nombre de vues si disponible */}
          {tour.view_count && (
            <p className="text-xs text-gray-500 mb-2 flex items-center">
              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
              </svg>
              {tour.view_count} views
            </p>
          )}

          {/* Affichage des thèmes si disponibles */}
          {tour.themes && tour.themes.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {tour.themes.slice(0, 2).map((theme, index) => (
                <span key={index} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                  {theme}
                </span>
              ))}
              {tour.themes.length > 2 && (
                <span className="text-xs text-gray-400">+{tour.themes.length - 2} more</span>
              )}
            </div>
          )}

          <p className="text-sm text-gray-600 flex items-center">
            <svg
              className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                clipRule="evenodd"
              />
            </svg>
            {tour.tiers?.[0]?.duration || tour.duration || "3 Days / 2 Nights"}
          </p>
        </div>

        <div className="flex justify-between items-center pt-4 mt-auto border-t border-gray-100">
          <div className="text-left">
            <p className="text-xs text-gray-500 tracking-wide">STARTING FROM</p>
            <p className="text-xl font-bold text-primary">₹{formattedPrice}</p>
          </div>
          <Link
            to={`/tours/${tour.id}`}
            className="font-medium text-primary hover:text-secondary transition-colors flex items-center group"
            aria-label={`View details for ${tour.name}`}
          >
            Details
            <svg
              className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default React.memo(TourCard);
