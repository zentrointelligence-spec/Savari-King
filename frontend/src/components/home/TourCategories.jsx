import React, { Component } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRight,
  faUsers,
  faStar,
} from "@fortawesome/free-solid-svg-icons";
import { library } from "@fortawesome/fontawesome-svg-core";
import {
  faLandmark,
  faMountain,
  faUtensils,
  faShip,
  faLeaf,
  faHeart,
  faCamera,
  faTree,
  faWater,
  faUmbrellaBeach,
  faMapMarkedAlt,
  faUsers as faUsersIcon,
  faGem,
  faDumbbell,
  faOm,
  faMapMarkerAlt,
  faPlane,
  faHiking,
  faBinoculars,
  faPaw,
  faSpa,
  faTheaterMasks,
  faMonument,
  faPray,
} from "@fortawesome/free-solid-svg-icons";

// Ajouter toutes les icônes à la library
library.add(
  faLandmark,
  faMountain,
  faUtensils,
  faShip,
  faLeaf,
  faHeart,
  faCamera,
  faTree,
  faWater,
  faUmbrellaBeach,
  faMapMarkedAlt,
  faUsersIcon,
  faGem,
  faDumbbell,
  faOm,
  faMapMarkerAlt,
  faPlane,
  faHiking,
  faBinoculars,
  faPaw,
  faSpa,
  faTheaterMasks,
  faMonument,
  faPray
);

// Mapping des noms d'icônes de la base vers les icônes FontAwesome
const iconNameMapping = {
  "fa-landmark": "landmark",
  "fa-mountain": "mountain",
  "fa-umbrella-beach": "umbrella-beach",
  "fa-paw": "paw",
  "fa-om": "om",
  "fa-ship": "ship",
  "fa-utensils": "utensils",
  monument: "monument",
  pray: "pray",
  tree: "tree",
  utensils: "utensils",
  "umbrella-beach": "umbrella-beach",
  "theater-masks": "theater-masks",
  mountain: "mountain",
  spa: "spa",
  "fa-camera": "camera",
  "fa-heart": "heart",
  "fa-water": "water",
  "fa-users": "users",
  "fa-gem": "gem",
  "fa-hiking": "hiking",
  "fa-binoculars": "binoculars",
};

class TourCategoriesSimple extends Component {
  constructor(props) {
    super(props);
    this.state = {
      categories: [],
      loading: true,
      error: null,
    };
  }

  componentDidMount() {
    this.fetchCategories();
  }

  fetchCategories = async () => {
    try {
      this.setState({ loading: true, error: null });

      const baseUrl =
        import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
      const response = await fetch(`${baseUrl}/api/homepage/tour-categories`);

      if (!response.ok) {
        throw new Error("Error loading categories");
      }

      const result = await response.json();
      this.setState({
        categories: result.data || [],
        loading: false,
      });
    } catch (error) {
      console.error("Error loading categories:", error);
      this.setState({
        error: error.message,
        loading: false,
        categories: [],
      });
    }
  };

  getIconForCategory = (iconName) => {
    // Si l'icône commence par "fa-", on retire le préfixe
    const cleanIconName = iconName?.startsWith("fa-")
      ? iconName.substring(3)
      : iconName;

    // Utiliser le mapping ou l'icône directement si elle existe
    const mappedIconName = iconNameMapping[iconName] || cleanIconName;

    return mappedIconName || "map-marker-alt";
  };

  renderLoadingSkeleton = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-lg p-6 animate-pulse"
          >
            <div className="w-12 h-12 bg-gray-200 rounded-full mx-auto mb-4"></div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2 mx-auto"></div>
          </div>
        ))}
      </div>
    );
  };

  renderCategoryCard = (category, index) => {
    const iconName = this.getIconForCategory(category.icon);

    return (
      <Link
        key={category.id}
        to={`/tours?category=${category.slug}`}
        className="group block bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 p-6"
      >
        <div className="text-center">
          {/* Icône */}
          <div className="relative mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
              <FontAwesomeIcon
                icon={iconName}
                className="text-2xl text-white"
              />
            </div>
            {category.isNew && (
              <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                New
              </div>
            )}
          </div>

          {/* Nom de la catégorie */}
          <h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors duration-300">
            {category.name}
          </h3>

          {/* Description */}
          {category.description && (
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
              {category.description}
            </p>
          )}

          {/* Statistiques */}
          <div className="flex justify-center items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center">
              <FontAwesomeIcon icon={faUsers} className="mr-1" />
              <span>{category.tourCount || 0} tours</span>
            </div>
            {category.averageRating && (
              <div className="flex items-center">
                <FontAwesomeIcon
                  icon={faStar}
                  className="mr-1 text-yellow-400"
                />
                <span>{parseFloat(category.averageRating).toFixed(1)}</span>
              </div>
            )}
          </div>

          {/* Flèche */}
          <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <FontAwesomeIcon icon={faArrowRight} className="text-blue-600" />
          </div>
        </div>
      </Link>
    );
  };

  render() {
    const { categories, loading, error } = this.state;

    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          {/* En-tête de section */}
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Explore Our Tour Categories
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover a variety of unique experiences tailored to all tastes
              and budgets
            </p>
          </div>

          {/* Contenu */}
          {loading && this.renderLoadingSkeleton()}

          {error && (
            <div className="text-center py-8">
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
                <p className="text-red-600 mb-4">{error}</p>
                <button
                  onClick={this.fetchCategories}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-300"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}

          {!loading && !error && categories.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {categories.map((category, index) =>
                this.renderCategoryCard(category, index)
              )}
            </div>
          )}

          {!loading && !error && categories.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-600">
                No categories available at the moment.
              </p>
            </div>
          )}

          {/* Bouton Voir plus */}
          {!loading && !error && categories.length > 0 && (
            <div className="text-center mt-12">
              <Link
                to="/tours"
                className="inline-flex items-center bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-300 font-semibold"
              >
                View All Tours
                <FontAwesomeIcon icon={faArrowRight} className="ml-2" />
              </Link>
            </div>
          )}
        </div>
      </section>
    );
  }
}

export default TourCategoriesSimple;
