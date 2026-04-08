import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  MapPin, Calendar, Star, Heart, TrendingUp, Award,
  Clock, Users, Compass, Navigation, Sun, Cloud, CloudRain,
  Thermometer, Wind, Info, AlertCircle, CheckCircle,
  ArrowLeft, ArrowRight, ExternalLink, Phone, Mail,
  Plane, Train, Bus, Car, Hotel, Camera, Mountain,
  Loader2, ChevronRight, Map as MapIcon
} from 'lucide-react';
import destinationService from '../services/destinationService';
import {
  EnrichedDestinationCard,
  WhenToVisitSection,
  AttractionsSection,
  ActivitiesSection,
  TravelTipsSection,
  InteractiveMap
} from '../components/destinations';
import Layout from '../components/common/Layout';

/**
 * DestinationDetailPage - Phase 4
 * Complete destination details page with all enriched information
 */
const DestinationDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [destination, setDestination] = useState(null);
  const [relatedDestinations, setRelatedDestinations] = useState([]);
  const [nearbyDestinations, setNearbyDestinations] = useState([]);
  const [availableTours, setAvailableTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    fetchDestinationDetails();
    loadLikeStatus();
  }, [slug]);

  const fetchDestinationDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch main destination data
      const destResponse = await destinationService.getDestinationBySlug(slug);
      setDestination(destResponse.data);

      // Fetch related data in parallel
      const [relatedRes, nearbyRes, toursRes] = await Promise.all([
        destinationService.getRelatedDestinations(destResponse.data.id, 4),
        destinationService.getNearbyDestinations(destResponse.data.id, 4),
        destinationService.getDestinationTours(destResponse.data.id)
      ]);

      setRelatedDestinations(relatedRes.data || []);
      setNearbyDestinations(nearbyRes.data || []);
      setAvailableTours(toursRes.data || []);

      setLoading(false);
    } catch (err) {
      console.error('Error fetching destination details:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  const loadLikeStatus = () => {
    try {
      const liked = JSON.parse(localStorage.getItem('likedDestinations') || '[]');
      setIsLiked(liked.some(id => id === destination?.id));
    } catch (error) {
      console.error('Error loading like status:', error);
    }
  };

  const toggleLike = () => {
    try {
      const liked = JSON.parse(localStorage.getItem('likedDestinations') || '[]');
      const newLiked = isLiked
        ? liked.filter(id => id !== destination.id)
        : [...liked, destination.id];

      localStorage.setItem('likedDestinations', JSON.stringify(newLiked));
      setIsLiked(!isLiked);
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const nextImage = () => {
    if (destination?.images?.gallery) {
      setCurrentImageIndex((prev) =>
        prev === destination.images.gallery.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (destination?.images?.gallery) {
      setCurrentImageIndex((prev) =>
        prev === 0 ? destination.images.gallery.length - 1 : prev - 1
      );
    }
  };

  // Loading state
  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
        </div>
      </Layout>
    );
  }

  // Error state
  if (error || !destination) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Destination Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            {error || 'The destination you are looking for does not exist.'}
          </p>
          <button
            onClick={() => navigate('/destinations')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Browse All Destinations
          </button>
        </div>
      </Layout>
    );
  }

  const {
    id,
    name,
    description,
    shortDescription,
    location,
    images,
    timing,
    climate,
    attractions,
    stats,
    pricing,
    flags,
    logistics,
    recommendations,
    travelTips,
    localCustoms,
    safetyInfo
  } = destination;

  return (
    <Layout>
      <div className="bg-white">
        {/* Breadcrumb Navigation */}
        <div className="bg-gray-50 border-b border-gray-200">
          <div className="container mx-auto px-4 py-3">
            <nav className="flex items-center gap-2 text-sm text-gray-600">
              <Link to="/" className="hover:text-blue-600">Home</Link>
              <ChevronRight size={16} />
              <Link to="/destinations" className="hover:text-blue-600">Destinations</Link>
              <ChevronRight size={16} />
              <span className="text-gray-900 font-medium">{name}</span>
            </nav>
          </div>
        </div>

        {/* Hero Section */}
        <section className="relative h-96 md:h-[500px] overflow-hidden">
          {/* Image Carousel */}
          <div className="relative h-full">
            <img
              src={images?.gallery?.[currentImageIndex] || images?.main || '/images/placeholder.jpg'}
              alt={name}
              className="w-full h-full object-cover"
            />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>

            {/* Carousel Controls */}
            {images?.gallery?.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-full transition-colors"
                  aria-label="Previous image"
                >
                  <ArrowLeft className="text-white" size={24} />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-full transition-colors"
                  aria-label="Next image"
                >
                  <ArrowRight className="text-white" size={24} />
                </button>

                {/* Image Indicators */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {images.gallery.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        idx === currentImageIndex
                          ? 'bg-white w-8'
                          : 'bg-white/50 hover:bg-white/75'
                      }`}
                      aria-label={`Go to image ${idx + 1}`}
                    />
                  ))}
                </div>
              </>
            )}

            {/* Hero Content */}
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
              <div className="container mx-auto">
                {/* Badges */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {flags?.isFeatured && (
                    <span className="inline-flex items-center gap-1 bg-yellow-500 text-white px-3 py-1.5 rounded-full text-sm font-bold">
                      <Award size={16} />
                      Featured
                    </span>
                  )}
                  {flags?.isTrending && (
                    <span className="inline-flex items-center gap-1 bg-red-500 text-white px-3 py-1.5 rounded-full text-sm font-bold">
                      <TrendingUp size={16} />
                      Trending
                    </span>
                  )}
                  {flags?.isUNESCO && (
                    <span className="bg-blue-600 text-white px-3 py-1.5 rounded-full text-sm font-medium">
                      UNESCO World Heritage
                    </span>
                  )}
                  {flags?.isWildlifeSanctuary && (
                    <span className="bg-green-600 text-white px-3 py-1.5 rounded-full text-sm font-medium">
                      Wildlife Sanctuary
                    </span>
                  )}
                  {flags?.ecoFriendly && (
                    <span className="bg-emerald-600 text-white px-3 py-1.5 rounded-full text-sm font-medium">
                      Eco-Friendly
                    </span>
                  )}
                </div>

                {/* Title */}
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 drop-shadow-lg">
                  {name}
                </h1>

                {/* Location */}
                <div className="flex items-center gap-2 text-white/90 text-lg mb-4 drop-shadow">
                  <MapPin size={20} />
                  <span>
                    {[location?.region, location?.state, location?.country]
                      .filter(Boolean)
                      .join(', ')}
                  </span>
                </div>

                {/* Stats Row */}
                <div className="flex flex-wrap items-center gap-6 text-white">
                  <div className="flex items-center gap-2">
                    <Star className="fill-yellow-400 text-yellow-400" size={20} />
                    <span className="font-semibold text-lg">
                      {stats?.avgRating?.toFixed(1) || 'N/A'}
                    </span>
                    <span className="text-white/80 text-sm">
                      ({stats?.reviewCount || 0} reviews)
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Compass size={20} />
                    <span className="font-medium">
                      {stats?.tourCount || 0} tours available
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Users size={20} />
                    <span className="font-medium">
                      {stats?.totalBookings || 0}+ bookings
                    </span>
                  </div>

                  {/* Like Button */}
                  <button
                    onClick={toggleLike}
                    className="ml-auto p-3 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-full transition-all"
                    aria-label={isLiked ? 'Unlike destination' : 'Like destination'}
                  >
                    <Heart
                      size={24}
                      className={isLiked ? 'fill-red-500 text-red-500' : 'text-white'}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Actions Bar */}
        <div className="bg-gray-50 border-b border-gray-200 sticky top-0 z-40">
          <div className="container mx-auto px-4">
            <div className="flex gap-1 overflow-x-auto">
              {['overview', 'visit', 'attractions', 'activities', 'map', 'tours', 'tips'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
                    activeTab === tab
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main Content Column */}
            <div className="lg:col-span-2 space-y-12">
              {/* Overview Section */}
              {activeTab === 'overview' && (
                <section id="overview">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">Overview</h2>
                  <div className="prose prose-lg max-w-none">
                    <p className="text-gray-700 leading-relaxed mb-6">
                      {description || shortDescription}
                    </p>
                  </div>

                  {/* Key Information Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                    {timing?.recommendedDuration && (
                      <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                        <Clock className="text-blue-600 flex-shrink-0 mt-1" size={20} />
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-1">
                            Recommended Duration
                          </h4>
                          <p className="text-gray-700">{timing.recommendedDuration}</p>
                        </div>
                      </div>
                    )}

                    {recommendations?.difficultyLevel && (
                      <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
                        <Mountain className="text-green-600 flex-shrink-0 mt-1" size={20} />
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-1">
                            Difficulty Level
                          </h4>
                          <p className="text-gray-700 capitalize">
                            {recommendations.difficultyLevel}
                          </p>
                        </div>
                      </div>
                    )}

                    {pricing?.budgetCategory && (
                      <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-lg">
                        <Info className="text-purple-600 flex-shrink-0 mt-1" size={20} />
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-1">
                            Budget Category
                          </h4>
                          <p className="text-gray-700 capitalize">
                            {pricing.budgetCategory}
                          </p>
                        </div>
                      </div>
                    )}

                    {recommendations?.adventureLevel && (
                      <div className="flex items-start gap-3 p-4 bg-orange-50 rounded-lg">
                        <Compass className="text-orange-600 flex-shrink-0 mt-1" size={20} />
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-1">
                            Adventure Level
                          </h4>
                          <p className="text-gray-700 capitalize">
                            {recommendations.adventureLevel}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </section>
              )}

              {/* When to Visit Section */}
              {activeTab === 'visit' && (
                <section id="visit">
                  <WhenToVisitSection timing={timing} climate={climate} />
                </section>
              )}

              {/* Attractions Section */}
              {activeTab === 'attractions' && (
                <section id="attractions">
                  <AttractionsSection attractions={attractions} />
                </section>
              )}

              {/* Activities Section */}
              {activeTab === 'activities' && (
                <section id="activities">
                  <ActivitiesSection attractions={attractions} />
                </section>
              )}

              {/* Map Section */}
              {activeTab === 'map' && (
                <section id="map">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">Location & Map</h2>

                  {/* Location Info */}
                  {location && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                      <div className="flex items-center gap-2 text-gray-900 mb-2">
                        <MapPin size={20} className="text-blue-600" />
                        <h3 className="font-semibold">Location</h3>
                      </div>
                      <p className="text-gray-700">
                        {[location.region, location.state, location.country]
                          .filter(Boolean)
                          .join(', ')}
                      </p>
                      {location.latitude && location.longitude && (
                        <p className="text-sm text-gray-500 mt-1">
                          Coordinates: {location.latitude.toFixed(4)}°, {location.longitude.toFixed(4)}°
                        </p>
                      )}
                    </div>
                  )}

                  {/* Interactive Map */}
                  <InteractiveMap
                    destination={destination}
                    nearbyDestinations={nearbyDestinations}
                    relatedDestinations={relatedDestinations}
                    showNearby={true}
                    showRelated={true}
                    height="600px"
                    zoom={9}
                  />

                  {/* Map Instructions */}
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                          <MapPin size={16} className="text-red-600" />
                        </div>
                        <h4 className="font-semibold text-gray-900">Main Location</h4>
                      </div>
                      <p className="text-sm text-gray-600">
                        Red marker shows the exact location of {name}
                      </p>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <MapPin size={16} className="text-blue-600" />
                        </div>
                        <h4 className="font-semibold text-gray-900">Nearby Places</h4>
                      </div>
                      <p className="text-sm text-gray-600">
                        Blue markers show destinations within {nearbyDestinations.length > 0 ? '500km' : 'the region'}
                      </p>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <MapPin size={16} className="text-green-600" />
                        </div>
                        <h4 className="font-semibold text-gray-900">Similar Destinations</h4>
                      </div>
                      <p className="text-sm text-gray-600">
                        Green markers show destinations with similar attractions
                      </p>
                    </div>
                  </div>
                </section>
              )}

              {/* Tours Section */}
              {activeTab === 'tours' && (
                <section id="tours">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">
                    Available Tours ({availableTours.length})
                  </h2>
                  {availableTours.length > 0 ? (
                    <div className="grid grid-cols-1 gap-6">
                      {availableTours.map((tour) => (
                        <Link
                          key={tour.id}
                          to={`/tours/${tour.slug || tour.id}`}
                          className="group bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg hover:border-blue-300 transition-all"
                        >
                          <div className="flex gap-6">
                            {tour.image && (
                              <img
                                src={tour.image}
                                alt={tour.name}
                                className="w-32 h-32 object-cover rounded-lg"
                              />
                            )}
                            <div className="flex-1">
                              <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600">
                                {tour.name}
                              </h3>
                              <p className="text-gray-600 mb-4 line-clamp-2">
                                {tour.description}
                              </p>
                              <div className="flex items-center gap-6 text-sm text-gray-600">
                                {tour.duration && (
                                  <div className="flex items-center gap-1">
                                    <Clock size={16} />
                                    <span>{tour.duration}</span>
                                  </div>
                                )}
                                {tour.price && (
                                  <div className="font-semibold text-blue-600">
                                    From ₹{tour.price.toLocaleString()}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <Compass size={48} className="mx-auto mb-4 opacity-50" />
                      <p>No tours available for this destination yet.</p>
                      <p className="text-sm mt-2">Check back soon for new tours!</p>
                    </div>
                  )}
                </section>
              )}

              {/* Travel Tips Section */}
              {activeTab === 'tips' && (
                <section id="tips">
                  <TravelTipsSection
                    travelTips={travelTips}
                    localCustoms={localCustoms}
                    safetyInfo={safetyInfo}
                    logistics={logistics}
                  />
                </section>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                {/* Price Range Card */}
                {pricing && (
                  <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">
                      Price Range
                    </h3>
                    {pricing.min > 0 && pricing.max > 0 ? (
                      <div className="mb-4">
                        <div className="text-3xl font-bold text-blue-600">
                          ₹{pricing.min.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-600">
                          to ₹{pricing.max.toLocaleString()}
                        </div>
                      </div>
                    ) : (
                      <div className="text-lg font-semibold text-gray-700 mb-4 capitalize">
                        {pricing.budgetCategory || 'Moderate'} Budget
                      </div>
                    )}
                    <Link
                      to={`/tours?destination=${id}`}
                      className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center py-3 rounded-lg font-medium transition-colors"
                    >
                      View Available Tours
                    </Link>
                  </div>
                )}

                {/* How to Reach Card */}
                {logistics && (
                  <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">
                      How to Reach
                    </h3>
                    <div className="space-y-3">
                      {logistics.nearestAirport && (
                        <div className="flex items-start gap-3">
                          <Plane className="text-gray-600 flex-shrink-0 mt-1" size={18} />
                          <div className="text-sm">
                            <div className="font-medium text-gray-900">By Air</div>
                            <div className="text-gray-600">{logistics.nearestAirport}</div>
                          </div>
                        </div>
                      )}
                      {logistics.nearestRailway && (
                        <div className="flex items-start gap-3">
                          <Train className="text-gray-600 flex-shrink-0 mt-1" size={18} />
                          <div className="text-sm">
                            <div className="font-medium text-gray-900">By Train</div>
                            <div className="text-gray-600">{logistics.nearestRailway}</div>
                          </div>
                        </div>
                      )}
                      {logistics.localTransport && (
                        <div className="flex items-start gap-3">
                          <Bus className="text-gray-600 flex-shrink-0 mt-1" size={18} />
                          <div className="text-sm">
                            <div className="font-medium text-gray-900">Local Transport</div>
                            <div className="text-gray-600">{logistics.localTransport}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Quick Stats Card */}
                {stats && (
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">
                      Quick Stats
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">Average Rating</span>
                        <span className="font-bold text-gray-900">
                          {stats.avgRating?.toFixed(1) || 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">Total Reviews</span>
                        <span className="font-bold text-gray-900">
                          {stats.reviewCount || 0}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">Available Tours</span>
                        <span className="font-bold text-gray-900">
                          {stats.tourCount || 0}
                        </span>
                      </div>
                      {stats.popularityScore && (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-700">Popularity</span>
                          <span className="font-bold text-blue-600">
                            {stats.popularityScore.toFixed(0)}/100
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Related Destinations Section */}
        {relatedDestinations.length > 0 && (
          <section className="bg-gray-50 py-16">
            <div className="container mx-auto px-4">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">
                Similar Destinations
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedDestinations.map((dest) => (
                  <EnrichedDestinationCard
                    key={dest.id}
                    destination={dest}
                    onLike={() => {}}
                    isLiked={false}
                  />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Nearby Destinations Section */}
        {nearbyDestinations.length > 0 && (
          <section className="py-16">
            <div className="container mx-auto px-4">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">
                Nearby Destinations
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {nearbyDestinations.map((dest) => (
                  <EnrichedDestinationCard
                    key={dest.id}
                    destination={dest}
                    onLike={() => {}}
                    isLiked={false}
                  />
                ))}
              </div>
            </div>
          </section>
        )}
      </div>
    </Layout>
  );
};

export default DestinationDetailPage;
