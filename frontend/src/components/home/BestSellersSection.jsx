import React, { Component } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faStar,
  faUsers,
  faMapMarkerAlt,
  faShoppingCart,
  faEuroSign,
  faClock,
  faCalendarAlt,
  faTrophy,
  faFire,
  faArrowRight,
} from "@fortawesome/free-solid-svg-icons";

class BestSellersSectionSimple extends Component {
  constructor(props) {
    super(props);
    this.state = {
      bestSellers: [],
      loading: true,
      error: null,
    };
  }

  componentDidMount() {
    this.fetchBestSellers();
  }

  fetchBestSellers = async () => {
    try {
      this.setState({ loading: true, error: null });

      const baseUrl =
        import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
      const response = await fetch(`${baseUrl}/api/homepage/tour-bestSellers`);

      if (!response.ok) {
        throw new Error("Error loading bestsellers");
      }

      const result = await response.json();
      this.setState({
        bestSellers: result.data || [],
        loading: false,
      });
    } catch (error) {
      console.error("Error loading bestsellers:", error);
      this.setState({
        error: error.message,
        loading: false,
        bestSellers: [],
      });
    }
  };

  getBadgeStyle = (rank) => {
    switch (rank) {
      case 1:
        return {
          bg: "bg-gradient-to-r from-yellow-400 to-yellow-600",
          text: "text-white",
          shadow: "shadow-lg shadow-yellow-500/25",
          border: "border-2 border-yellow-300",
        };
      case 2:
        return {
          bg: "bg-gradient-to-r from-gray-400 to-gray-600",
          text: "text-white",
          shadow: "shadow-lg shadow-gray-500/25",
          border: "border-2 border-gray-300",
        };
      case 3:
        return {
          bg: "bg-gradient-to-r from-amber-600 to-amber-800",
          text: "text-white",
          shadow: "shadow-lg shadow-amber-500/25",
          border: "border-2 border-amber-400",
        };
      default:
        return {
          bg: "bg-blue-600",
          text: "text-white",
          shadow: "shadow-md",
          border: "border-2 border-blue-400",
        };
    }
  };

  formatPrice = (price) => {
    if (!price) return "Price on request";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(price);
  };

  renderLoadingSkeleton = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[...Array(3)].map((_, i) => (
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
    );
  };

  renderTourCard = (tour, index) => {
    const rank = index + 1;
    const badgeStyle = this.getBadgeStyle(rank);

    return (
      <div
        key={tour.id}
        className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
      >
        {/* Image du tour */}
        <div className="relative aspect-video overflow-hidden">
          <img
            src={tour.mainImage || tour.image_url || "/placeholder-tour.jpg"}
            alt={tour.title}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
            onError={(e) => {
              e.target.src = "/placeholder-tour.jpg";
            }}
          />

          {/* Badge de classement */}
          <div
            className={`absolute top-4 left-4 ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.shadow} ${badgeStyle.border} px-3 py-1 rounded-full flex items-center space-x-1`}
          >
            <FontAwesomeIcon icon={faTrophy} className="text-sm" />
            <span className="font-bold text-sm">#{rank}</span>
          </div>

          {/* Badge "Bestseller" */}
          <div className="absolute top-4 right-4 bg-red-500 text-white px-2 py-1 rounded-full flex items-center space-x-1">
            <FontAwesomeIcon icon={faFire} className="text-xs" />
            <span className="text-xs font-semibold">Bestseller</span>
          </div>

          {/* Overlay de prix */}
          <div className="absolute bottom-4 right-4 bg-black bg-opacity-70 text-white px-3 py-1 rounded-lg">
            <div className="text-xs opacity-75 mb-1">Starting from</div>
            <div className="text-lg font-bold">
              {this.formatPrice(tour.price)}
            </div>
            {tour.originalPrice && tour.originalPrice > tour.price && (
              <div className="text-xs line-through opacity-75">
                {this.formatPrice(tour.originalPrice)}
              </div>
            )}
          </div>
        </div>

        {/* Contenu de la carte */}
        <div className="p-6">
          {/* Titre */}
          <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2">
            {tour.title}
          </h3>

          {/* Localisation */}
          {tour.destination && (
            <div className="flex items-center text-gray-600 mb-3">
              <FontAwesomeIcon
                icon={faMapMarkerAlt}
                className="mr-2 text-blue-600"
              />
              <span className="text-sm">{tour.destination}</span>
            </div>
          )}

          {/* Description courte */}
          {tour.shortDescription && (
            <p className="text-gray-600 text-sm mb-4 line-clamp-3">
              {tour.shortDescription}
            </p>
          )}

          {/* Statistiques */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              {/* Note */}
              {tour.averageRating && (
                <div className="flex items-center">
                  <FontAwesomeIcon
                    icon={faStar}
                    className="text-yellow-400 mr-1"
                  />
                  <span className="text-sm font-semibold">
                    {parseFloat(tour.averageRating).toFixed(1)}
                  </span>
                  {tour.reviewCount && (
                    <span className="text-xs text-gray-500 ml-1">
                      ({tour.reviewCount})
                    </span>
                  )}
                </div>
              )}

              {/* Durée */}
              {tour.duration && (
                <div className="flex items-center text-gray-600">
                  <FontAwesomeIcon icon={faClock} className="mr-1" />
                  <span className="text-sm">{tour.duration}</span>
                </div>
              )}
            </div>

            {/* Nombre de réservations */}
            {tour.bookingCount && (
              <div className="flex items-center text-green-600">
                <FontAwesomeIcon icon={faUsers} className="mr-1" />
                <span className="text-sm font-semibold">
                  {tour.bookingCount} booked
                </span>
              </div>
            )}
          </div>

          {/* Bouton d'action */}
          <Link
            to={`/tours/${tour.id}`}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-300 flex items-center justify-center space-x-2 font-semibold"
          >
            <FontAwesomeIcon icon={faShoppingCart} />
            <span>Book Now</span>
            <FontAwesomeIcon icon={faArrowRight} />
          </Link>
        </div>
      </div>
    );
  };

  render() {
    const { bestSellers, loading, error } = this.state;

    return (
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          {/* En-tête de section */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-4">
              <FontAwesomeIcon
                icon={faTrophy}
                className="text-3xl text-yellow-500 mr-3"
              />
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800">
                Our Best Sellers
              </h2>
            </div>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover the most popular tours chosen by our travelers
            </p>
          </div>

          {/* Contenu */}
          {loading && this.renderLoadingSkeleton()}

          {error && (
            <div className="text-center py-8">
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
                <p className="text-red-600 mb-4">{error}</p>
                <button
                  onClick={this.fetchBestSellers}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-300"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}

          {!loading && !error && bestSellers.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {bestSellers
                .slice(0, 3)
                .map((tour, index) => this.renderTourCard(tour, index))}
            </div>
          )}

          {!loading && !error && bestSellers.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-600">
                No bestsellers available at the moment.
              </p>
            </div>
          )}
        </div>
      </section>
    );
  }
}

export default BestSellersSectionSimple;
