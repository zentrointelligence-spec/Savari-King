import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";
import BookingList from "../components/booking/BookingList";
import Price from "../components/common/Price";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarCheck,
  faChartLine,
  faMapMarkerAlt,
  faUsers,
  faMoneyBillWave,
  faPlane,
  faStar,
  faHeart,
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-hot-toast";
import { apiUtils } from "../utils/apiUtils";

const StatCard = ({ icon, title, value, subtitle, color = "primary" }) => {
  const colorClasses = {
    primary: "from-primary to-primary-dark",
    green: "from-green-500 to-green-600",
    blue: "from-blue-500 to-blue-600",
    purple: "from-purple-500 to-purple-600",
    orange: "from-orange-500 to-orange-600",
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-purple-100 p-6 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div
          className={`w-12 h-12 rounded-lg bg-gradient-to-r ${colorClasses[color]} flex items-center justify-center`}
        >
          <FontAwesomeIcon icon={icon} className="text-white text-lg" />
        </div>
      </div>
    </div>
  );
};

const QuickActions = () => {
  const quickActions = [
    {
      title: "Book New Tour",
      description: "Discover amazing destinations",
      icon: faPlane,
      color: "bg-gradient-to-r from-primary to-primary-dark",
      href: "/tours",
    },
    {
      title: "View Gallery",
      description: "Browse travel photos",
      icon: faMapMarkerAlt,
      color: "bg-gradient-to-r from-blue-500 to-blue-600",
      href: "/gallery",
    },
    {
      title: "Travel Blog",
      description: "Read travel guides",
      icon: faChartLine,
      color: "bg-gradient-to-r from-green-500 to-green-600",
      href: "/blog",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      {quickActions.map((action) => (
        <a
          key={action.title}
          href={action.href}
          className="block bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-purple-100 p-4 hover:shadow-xl transition-all duration-300 group transform hover:scale-105"
        >
          <div className="flex items-center">
            <div
              className={`w-10 h-10 rounded-lg ${action.color} flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300`}
            >
              <FontAwesomeIcon icon={action.icon} className="text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 group-hover:text-primary transition-colors">
                {action.title}
              </h3>
              <p className="text-sm text-gray-600">{action.description}</p>
            </div>
          </div>
        </a>
      ))}
    </div>
  );
};

const MyBookingsPage = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({
    totalBookings: 0,
    completedTrips: 0,
    upcomingTrips: 0,
    totalSpent: 0,
    favoriteDestination: "Loading...",
    averageRating: 0,
    totalCountries: 0,
  });
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState([]);

  const calculateStats = (bookingsData) => {
    if (!bookingsData || bookingsData.length === 0) {
      return {
        totalBookings: 0,
        completedTrips: 0,
        upcomingTrips: 0,
        totalSpent: 0,
        favoriteDestination: "No bookings yet",
        averageRating: 0,
        totalCountries: 0,
      };
    }

    const now = new Date();
    const completed = bookingsData.filter(b =>
      b.status === 'Trip Completed' ||
      (b.status === 'Payment Confirmed' && new Date(b.travel_date) < now)
    );
    const upcoming = bookingsData.filter(b =>
      b.status === 'Payment Confirmed' &&
      new Date(b.travel_date) >= now
    );
    const totalSpent = bookingsData.reduce((sum, b) => sum + (parseFloat(b.final_price) || 0), 0);

    // Calculate favorite destination from tour_destinations array
    const destinationCounts = {};
    bookingsData.forEach(booking => {
      if (booking.tour_destinations && Array.isArray(booking.tour_destinations)) {
        // Count each destination in the array
        booking.tour_destinations.forEach(dest => {
          if (dest && dest !== 'Unknown') {
            destinationCounts[dest] = (destinationCounts[dest] || 0) + 1;
          }
        });
      }
    });
    const favoriteDestination = Object.keys(destinationCounts).length > 0
      ? Object.keys(destinationCounts).reduce((a, b) => destinationCounts[a] > destinationCounts[b] ? a : b)
      : "No bookings yet";

    // Calculate average rating from user_rating field
    const ratingsData = bookingsData.filter(b => b.user_rating && b.user_rating > 0);
    const averageRating = ratingsData.length > 0
      ? (ratingsData.reduce((sum, b) => sum + b.user_rating, 0) / ratingsData.length).toFixed(1)
      : 0;

    // Calculate unique countries from contact_country
    const countries = new Set(
      bookingsData
        .map(b => b.contact_country)
        .filter(c => c && c !== 'Unknown' && c.trim() !== '')
    );

    return {
      totalBookings: bookingsData.length,
      completedTrips: completed.length,
      upcomingTrips: upcoming.length,
      totalSpent,
      favoriteDestination,
      averageRating: parseFloat(averageRating),
      totalCountries: countries.size,
    };
  };

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login to view your bookings');
        return;
      }

      const response = await apiUtils.getMyBookings();

      if (response.data && response.data.bookings) {
        setBookings(response.data.bookings);
        const calculatedStats = calculateStats(response.data.bookings);
        setStats(calculatedStats);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Failed to load booking statistics');
      // Fallback to demo data
      setStats({
        totalBookings: 0,
        completedTrips: 0,
        upcomingTrips: 0,
        totalSpent: 0,
        favoriteDestination: "No bookings yet",
        averageRating: 0,
        totalCountries: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchBookings();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading your bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                My Bookings
              </h1>
              <p className="text-gray-600">
                Welcome back, {user?.full_name || "Traveler"}! Here's your
                travel overview.
              </p>
            </div>
            <button
              onClick={() => (window.location.href = "/tours")}
              className="px-6 py-3 bg-gradient-to-r from-primary to-primary-dark text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <FontAwesomeIcon icon={faPlane} className="mr-2" />
              Book New Tour
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <QuickActions />

        {/* Stats Overview */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <FontAwesomeIcon icon={faChartLine} className="mr-3 text-primary" />
            Travel Statistics
          </h2>

          {/* First Row - 4 Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <StatCard
              icon={faCalendarCheck}
              title="Total Bookings"
              value={stats.totalBookings}
              subtitle="All time"
              color="primary"
            />
            <StatCard
              icon={faUsers}
              title="Completed Trips"
              value={stats.completedTrips}
              subtitle="Adventures completed"
              color="green"
            />
            <StatCard
              icon={faPlane}
              title="Upcoming Trips"
              value={stats.upcomingTrips}
              subtitle="Ready to explore"
              color="blue"
            />
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-purple-100 p-6 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Total Spent</p>
                  <p className="text-2xl font-bold text-gray-900">
                    <Price priceINR={stats.totalSpent} size="md" />
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Investment in memories</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center">
                  <FontAwesomeIcon icon={faMoneyBillWave} className="text-white text-lg" />
                </div>
              </div>
            </div>
          </div>

          {/* Second Row - 3 Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <StatCard
              icon={faMapMarkerAlt}
              title="Favorite Destination"
              value={stats.favoriteDestination}
              subtitle="Most visited"
              color="orange"
            />
            <StatCard
              icon={faStar}
              title="Average Rating"
              value={stats.averageRating > 0 ? `${stats.averageRating}★` : "N/A"}
              subtitle="Your experience"
              color="primary"
            />
            <StatCard
              icon={faHeart}
              title="Countries Visited"
              value={stats.totalCountries}
              subtitle="Unique destinations"
              color="green"
            />
          </div>
        </div>

        {/* Booking History */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-xl border border-purple-100 p-6">
          <BookingList />
        </div>
      </div>
    </div>
  );
};

export default MyBookingsPage;
