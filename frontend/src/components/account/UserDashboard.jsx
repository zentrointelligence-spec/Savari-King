import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../contexts/AuthContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarCheck,
  faMapMarkerAlt,
  faUsers,
  faMoneyBillWave,
  faStar,
  faPlane,
  faChartLine,
  faTrophy,
  faHeart,
  faCamera,
} from "@fortawesome/free-solid-svg-icons";

const StatCard = ({
  icon,
  title,
  value,
  subtitle,
  color = "primary",
  trend,
}) => {
  const colorClasses = {
    primary: "from-primary to-primary-dark",
    green: "from-green-500 to-green-600",
    blue: "from-blue-500 to-blue-600",
    purple: "from-purple-500 to-purple-600",
    orange: "from-orange-500 to-orange-600",
    pink: "from-pink-500 to-pink-600",
  };

  return (
    <div className="violet-backdrop rounded-xl shadow-primary p-6 hover:shadow-accent transition-all duration-300 transform hover:scale-105">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
          {trend && (
            <div className="flex items-center mt-2">
              <span
                className={`text-xs font-medium ${
                  trend.positive ? "text-green-600" : "text-red-600"
                }`}
              >
                {trend.positive ? "↗" : "↘"} {trend.value}
              </span>
              <span className="text-xs text-gray-500 ml-1">vs last month</span>
            </div>
          )}
        </div>
        <div
          className={`w-12 h-12 rounded-lg bg-gradient-to-r ${colorClasses[color]} flex items-center justify-center ml-4`}
        >
          <FontAwesomeIcon icon={icon} className="text-white text-lg" />
        </div>
      </div>
    </div>
  );
};

const RecentActivity = ({ activities }) => {
  return (
    <div className="violet-backdrop rounded-xl shadow-primary p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <FontAwesomeIcon icon={faChartLine} className="mr-2 text-primary" />
        Recent Activity
      </h3>
      <div className="space-y-4">
        {activities.map((activity, index) => (
          <div
            key={index}
            className="flex items-center p-3 bg-gray-50 rounded-lg"
          >
            <div
              className={`w-10 h-10 rounded-full bg-gradient-to-r ${activity.color} flex items-center justify-center mr-4`}
            >
              <FontAwesomeIcon
                icon={activity.icon}
                className="text-white text-sm"
              />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">
                {activity.title}
              </p>
              <p className="text-xs text-gray-500">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const FavoriteDestinations = ({ destinations }) => {
  return (
    <div className="violet-backdrop rounded-xl shadow-primary p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <FontAwesomeIcon icon={faHeart} className="mr-2 text-primary" />
        Favorite Destinations
      </h3>
      <div className="grid grid-cols-1 gap-4">
        {destinations.map((destination, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gray-200 rounded-lg mr-3 flex items-center justify-center">
                <FontAwesomeIcon icon={faCamera} className="text-gray-400" />
              </div>
              <div>
                <p className="font-medium text-gray-900">{destination.name}</p>
                <p className="text-sm text-gray-500">
                  {destination.visits} visits
                </p>
              </div>
            </div>
            <div className="flex items-center">
              <FontAwesomeIcon icon={faStar} className="text-yellow-400 mr-1" />
              <span className="text-sm font-medium">{destination.rating}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const UserDashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({
    totalBookings: 0,
    completedTrips: 0,
    upcomingTrips: 0,
    totalSpent: 0,
    favoriteDestination: "Loading...",
    membershipLevel: "Explorer",
    loyaltyPoints: 0,
  });
  const [loading, setLoading] = useState(true);

  const recentActivities = [
    {
      title: "Booked trip to Bali, Indonesia",
      time: "2 hours ago",
      icon: faPlane,
      color: "from-blue-500 to-blue-600",
    },
    {
      title: "Completed trip to Paris, France",
      time: "1 week ago",
      icon: faCalendarCheck,
      color: "from-green-500 to-green-600",
    },
    {
      title: "Left review for Tokyo tour",
      time: "2 weeks ago",
      icon: faStar,
      color: "from-yellow-500 to-yellow-600",
    },
    {
      title: "Updated profile information",
      time: "1 month ago",
      icon: faUsers,
      color: "from-purple-500 to-purple-600",
    },
  ];

  const favoriteDestinations = [
    { name: "Bali, Indonesia", visits: 3, rating: 4.9 },
    { name: "Paris, France", visits: 2, rating: 4.8 },
    { name: "Tokyo, Japan", visits: 2, rating: 4.7 },
    { name: "New York, USA", visits: 1, rating: 4.6 },
  ];

  useEffect(() => {
    // Simulate loading stats - in real app, this would be an API call
    const timer = setTimeout(() => {
      setStats({
        totalBookings: 12,
        completedTrips: 8,
        upcomingTrips: 2,
        totalSpent: 4250,
        favoriteDestination: "Bali, Indonesia",
        membershipLevel: "Explorer",
        loyaltyPoints: 1250,
      });
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center py-12">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary mb-4"></div>
        <p className="text-gray-600 font-medium">Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Welcome Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Welcome back, {user?.full_name || "Traveler"}! 👋
        </h2>
        <p className="text-gray-600">
          Here's your travel overview and recent activity.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={faCalendarCheck}
          title="Total Bookings"
          value={stats.totalBookings}
          subtitle="All time"
          color="primary"
          trend={{ positive: true, value: "+2" }}
        />
        <StatCard
          icon={faPlane}
          title="Completed Trips"
          value={stats.completedTrips}
          subtitle="Adventures completed"
          color="green"
          trend={{ positive: true, value: "+1" }}
        />
        <StatCard
          icon={faUsers}
          title="Upcoming Trips"
          value={stats.upcomingTrips}
          subtitle="Ready to explore"
          color="blue"
        />
        <StatCard
          icon={faMoneyBillWave}
          title="Total Spent"
          value={`$${stats.totalSpent.toLocaleString()}`}
          subtitle="Investment in memories"
          color="purple"
          trend={{ positive: true, value: "+$450" }}
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          icon={faTrophy}
          title="Membership Level"
          value={stats.membershipLevel}
          subtitle="Keep exploring to level up!"
          color="orange"
        />
        <StatCard
          icon={faStar}
          title="Loyalty Points"
          value={stats.loyaltyPoints.toLocaleString()}
          subtitle="Redeem for discounts"
          color="pink"
          trend={{ positive: true, value: "+150" }}
        />
        <StatCard
          icon={faMapMarkerAlt}
          title="Favorite Destination"
          value={stats.favoriteDestination}
          subtitle="Most visited place"
          color="green"
        />
      </div>

      {/* Activity and Destinations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentActivity activities={recentActivities} />
        <FavoriteDestinations destinations={favoriteDestinations} />
      </div>

      {/* Quick Actions */}
      <div className="mt-8 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-purple-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => (window.location.href = "/tours")}
            className="flex items-center justify-center p-4 bg-gradient-to-r from-primary to-primary-dark text-white rounded-lg hover:shadow-lg transition-all duration-300 transform hover:scale-105"
          >
            <FontAwesomeIcon icon={faPlane} className="mr-2" />
            Book New Tour
          </button>
          <button
            onClick={() => (window.location.href = "/gallery")}
            className="flex items-center justify-center p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all duration-300 transform hover:scale-105"
          >
            <FontAwesomeIcon icon={faCamera} className="mr-2" />
            View Gallery
          </button>
          <button
            onClick={() => (window.location.href = "/blog")}
            className="flex items-center justify-center p-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:shadow-lg transition-all duration-300 transform hover:scale-105"
          >
            <FontAwesomeIcon icon={faChartLine} className="mr-2" />
            Travel Blog
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
