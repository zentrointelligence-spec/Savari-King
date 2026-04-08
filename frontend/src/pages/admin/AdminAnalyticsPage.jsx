import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../../contexts/AuthContext";
import { toast } from "react-toastify";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import API_CONFIG, { buildApiUrl, getAuthHeaders } from "../../config/api";

// --- Sous-composant : Carte de Statistique ---
const StatCard = ({ title, value, icon }) => (
  <div className="bg-white p-6 rounded-xl shadow-lg">
    <div className="flex items-center">
      <div className="bg-primary/10 text-primary p-3 rounded-full">
        <i className={`fas ${icon} text-xl`}></i>
      </div>
      <div className="ml-4">
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
  </div>
);

// --- Page Principale ---
const AdminAnalyticsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { token } = useContext(AuthContext);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          buildApiUrl(API_CONFIG.ENDPOINTS.ANALYTICS),
          {
            headers: getAuthHeaders(token),
          }
        );
        setData(response.data);
      } catch (error) {
        toast.error("Could not load analytics data.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  if (loading) return <AnalyticsSkeleton />;
  if (!data) return <div>Failed to load data.</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-8">
        Business Analytics
      </h1>

      {/* Cartes de KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Total Revenue"
          value={`₹${(data.total_revenue || 0).toLocaleString("en-IN")}`}
          icon="fa-chart-line"
        />
        <StatCard
          title="Total Bookings"
          value={data.total_bookings || 0}
          icon="fa-receipt"
        />
        <StatCard
          title="Average Booking Value"
          value={`₹${(data.average_booking_value || 0).toLocaleString("en-IN")}`}
          icon="fa-shopping-cart"
        />
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-semibold mb-4">Revenue Trends</h3>
          {data.revenue_trend && data.revenue_trend.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.revenue_trend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#7045af"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-72 text-gray-500">
              No revenue data available
            </div>
          )}
        </div>
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-semibold mb-4">Most Popular Tours</h3>
          {data.popular_tours && data.popular_tours.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.popular_tours} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" width={150} />
                <Tooltip />
                <Bar dataKey="booking_count" fill="#8b65c2" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-72 text-gray-500">
              No tour data available
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const AnalyticsSkeleton = () => (
  <div className="animate-pulse">
    <div className="h-8 bg-gray-300 rounded w-64 mb-8"></div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="bg-white p-6 rounded-xl shadow-lg h-24">
          <div className="h-6 bg-gray-300 rounded w-3/4 mb-4"></div>
          <div className="h-8 bg-gray-300 rounded w-1/2"></div>
        </div>
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg h-80"></div>
      <div className="bg-white p-6 rounded-xl shadow-lg h-80"></div>
    </div>
  </div>
);

export default AdminAnalyticsPage;
