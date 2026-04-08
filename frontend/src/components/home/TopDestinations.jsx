import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRight, Loader2 } from "lucide-react";
import destinationService from "../../services/destinationService";
import { EnrichedDestinationCard } from "../destinations";

/**
 * TopDestinations Component - REFACTORED FOR PHASE 3
 * Displays popular destinations using enriched data and new card design
 */
const TopDestinations = () => {
  const { t } = useTranslation();
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [likedDestinations, setLikedDestinations] = useState(new Set());

  useEffect(() => {
    fetchDestinations();
    loadLikedDestinations();
  }, []);

  const fetchDestinations = async () => {
    try {
      setLoading(true);
      setError(null);

      // Use new enriched API endpoint from Phase 1
      const response = await destinationService.getPopularDestinations(6, 'popularity');

      setDestinations(response.data || []);
      setLoading(false);
    } catch (error) {
      console.error("Error loading destinations:", error);
      setError(error.message);
      setLoading(false);
      setDestinations([]);
    }
  };

  const loadLikedDestinations = () => {
    try {
      const liked = JSON.parse(
        localStorage.getItem("likedDestinations") || "[]"
      );
      setLikedDestinations(new Set(liked));
    } catch (error) {
      console.error("Error loading liked destinations:", error);
    }
  };

  const toggleLike = async (destinationId) => {
    const newLiked = new Set(likedDestinations);

    if (newLiked.has(destinationId)) {
      newLiked.delete(destinationId);
    } else {
      newLiked.add(destinationId);
    }

    setLikedDestinations(newLiked);

    try {
      localStorage.setItem("likedDestinations", JSON.stringify([...newLiked]));

      // Optional: Sync with backend if user is logged in
      // const user = localStorage.getItem('user');
      // if (user) {
      //   await destinationService.toggleDestinationLike(destinationId);
      // }
    } catch (error) {
      console.error("Error saving liked destinations:", error);
    }
  };

  // Loading state
  if (loading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
          </div>
        </div>
      </section>
    );
  }

  // Error state
  if (error) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center text-red-600">
            <p>Error loading destinations: {error}</p>
            <button
              onClick={fetchDestinations}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
      </section>
    );
  }

  // Empty state
  if (destinations.length === 0) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center text-gray-600">
            <p>No destinations available at the moment.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            {t?.('destinations.title') || 'Discover Our Destinations'}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t?.('destinations.subtitle') || 'Explore breathtaking destinations with rich culture, stunning landscapes, and unforgettable experiences'}
          </p>
        </div>

        {/* Destinations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {destinations.map((destination) => (
            <EnrichedDestinationCard
              key={destination.id}
              destination={destination}
              onLike={toggleLike}
              isLiked={likedDestinations.has(destination.id)}
            />
          ))}
        </div>

        {/* View All Link */}
        <div className="text-center">
          <Link
            to="/destinations"
            className="inline-flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-lg hover:shadow-xl"
          >
            <span>View All Destinations</span>
            <ArrowRight size={20} />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default TopDestinations;
