import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Users,
  Eye,
  Calendar,
  MapPin,
  Star,
  Clock,
  Download,
  Share2,
  Heart,
  MessageCircle,
  Filter,
  RefreshCw,
  BarChart3,
  PieChart,
  Activity,
  Globe,
  Smartphone,
  Monitor,
  Tablet,
  Chrome,
  Firefox,
  Safari,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Image,
} from "lucide-react";
import { apiUtils } from '../../utils/apiUtils';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  ComposedChart,
  Legend,
} from "recharts";
import toast from "react-hot-toast";

const AdvancedAnalytics = () => {
  const [timeRange, setTimeRange] = useState("7d");
  const [isLoading, setIsLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [error, setError] = useState(null);
  const [realTimeData, setRealTimeData] = useState({
    activeUsers: 0,
    currentRevenue: 0,
    liveBookings: 0
  });

  const [analyticsData] = useState({
    overview: {
      totalViews: 125600,
      viewsChange: 15.2,
      uniqueVisitors: 8940,
      visitorsChange: 8.7,
      pageViews: 45200,
      pageViewsChange: 12.3,
      avgSessionDuration: 245, // seconds
      durationChange: -5.2,
      bounceRate: 34.2,
      bounceRateChange: -2.1,
      conversionRate: 3.8,
      conversionChange: 1.4,
    },
    viewsOverTime: [
      { date: "2024-01-01", views: 1200, visitors: 890, pageViews: 2100 },
      { date: "2024-01-02", views: 1450, visitors: 1020, pageViews: 2400 },
      { date: "2024-01-03", views: 1680, visitors: 1180, pageViews: 2800 },
      { date: "2024-01-04", views: 1320, visitors: 950, pageViews: 2200 },
      { date: "2024-01-05", views: 1890, visitors: 1340, pageViews: 3100 },
      { date: "2024-01-06", views: 2100, visitors: 1520, pageViews: 3400 },
      { date: "2024-01-07", views: 1750, visitors: 1280, pageViews: 2900 },
    ],
    topPages: [
      { page: "/gallery", views: 25600, change: 12.5 },
      { page: "/tours/kerala-backwaters", views: 18900, change: 8.3 },
      { page: "/tours/kanyakumari-sunset", views: 15200, change: -2.1 },
      { page: "/booking", views: 12800, change: 15.7 },
      { page: "/about", views: 9600, change: 5.2 },
    ],
    deviceStats: [
      { name: "Desktop", value: 45.2, color: "#3B82F6" },
      { name: "Mobile", value: 38.7, color: "#8B5CF6" },
      { name: "Tablet", value: 16.1, color: "#F59E0B" },
    ],
    locationStats: [
      { country: "Inde", visitors: 4520, percentage: 68.2 },
      { country: "États-Unis", visitors: 890, percentage: 13.4 },
      { country: "Royaume-Uni", visitors: 450, percentage: 6.8 },
      { country: "Canada", visitors: 320, percentage: 4.8 },
      { country: "Australie", visitors: 280, percentage: 4.2 },
      { country: "Autres", visitors: 180, percentage: 2.6 },
    ],
    galleryMetrics: {
      totalImages: 245,
      totalVideos: 67,
      totalViews: 89600,
      totalLikes: 3420,
      totalShares: 890,
      totalDownloads: 1250,
      avgViewTime: 185, // seconds
      topPerformingMedia: [
        { name: "kerala-sunset.jpg", views: 5600, likes: 234, type: "image" },
        { name: "backwaters-tour.mp4", views: 4200, likes: 189, type: "video" },
        {
          name: "temple-architecture.jpg",
          views: 3800,
          likes: 156,
          type: "image",
        },
        { name: "cultural-dance.mp4", views: 3200, likes: 142, type: "video" },
      ],
    },
  });

  // Fonction pour récupérer les données analytics
  const fetchAnalyticsData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await apiUtils.get(`/analytics?timeRange=${timeRange}`);
      
      if (response.success) {
        setAnalyticsData(response.data);
        // Mettre à jour les données temps réel
        setRealTimeData({
          activeUsers: response.data.users?.active || 0,
          currentRevenue: response.data.revenue?.total || 0,
          liveBookings: response.data.bookings?.total || 0
        });
      } else {
        setError('Erreur lors du chargement des données analytics');
      }
    } catch (err) {
      console.error('Erreur analytics:', err);
      setError('Impossible de charger les données analytics');
    } finally {
      setIsLoading(false);
    }
  };

  // Charger les données au montage et lors du changement de timeRange
  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  // Simulation de données en temps réel (mise à jour périodique)
  useEffect(() => {
    const interval = setInterval(() => {
      if (analyticsData) {
        fetchAnalyticsData();
      }
    }, 30000); // Mise à jour toutes les 30 secondes

    return () => clearInterval(interval);
  }, [analyticsData]);

  const refreshData = async () => {
    await fetchAnalyticsData();
    toast.success("Données actualisées");
  };

  // Gestion du chargement et des erreurs
  if (isLoading && !analyticsData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Chargement des analytics...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <div className="text-red-600 mr-3">⚠️</div>
          <div>
            <h3 className="text-red-800 font-medium">Erreur de chargement</h3>
            <p className="text-red-600 text-sm mt-1">{error}</p>
            <button 
              onClick={refreshData}
              className="mt-2 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
            >
              Réessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  const MetricCard = ({
    title,
    value,
    change,
    icon: Icon,
    color,
    suffix = "",
  }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, scale: 1.02 }}
      className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 relative overflow-hidden group"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
            {title}
          </p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {typeof value === "number" ? value.toLocaleString() : value}
            {suffix}
          </p>
          {change !== undefined && (
            <div className="flex items-center mt-2">
              {change > 0 ? (
                <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
              ) : (
                <ArrowDownRight className="w-4 h-4 text-red-500 mr-1" />
              )}
              <span
                className={`text-sm font-medium ${
                  change > 0 ? "text-green-500" : "text-red-500"
                }`}
              >
                {Math.abs(change)}%
              </span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-xl ${color} bg-opacity-10`}>
          <Icon className={`w-8 h-8 ${color.replace("bg-", "text-")}`} />
        </div>
      </div>
    </motion.div>
  );

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
            {label}
          </p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value.toLocaleString()}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            Analytics Premium
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Analyses détaillées de votre audience et performance
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-white dark:bg-gray-800 rounded-xl p-1 shadow-lg border border-gray-200 dark:border-gray-700">
            {[
              { value: "24h", label: "24h" },
              { value: "7d", label: "7j" },
              { value: "30d", label: "30j" },
              { value: "90d", label: "90j" },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setTimeRange(option.value)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  timeRange === option.value
                    ? "bg-blue-500 text-white shadow-lg"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={refreshData}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
          >
            <RefreshCw
              className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
            />
            <span>Actualiser</span>
          </motion.button>
        </div>
      </div>

      {/* Métriques temps réel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 rounded-2xl p-6 text-white"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">Données en temps réel</h3>
          <Activity className="w-6 h-6" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold">{realTimeData.activeUsers}</p>
            <p className="text-sm opacity-80">Utilisateurs actifs</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{realTimeData.currentViews}</p>
            <p className="text-sm opacity-80">Vues actuelles</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">
              {realTimeData.bounceRate.toFixed(1)}%
            </p>
            <p className="text-sm opacity-80">Taux de rebond</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">
              {realTimeData.avgSessionDuration}
            </p>
            <p className="text-sm opacity-80">Durée moyenne</p>
          </div>
        </div>
      </motion.div>

      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        <MetricCard
          title="Vues totales"
          value={analyticsData?.overview?.totalViews || 0}
          change={analyticsData?.overview?.viewsChange || 0}
          icon={Eye}
          color="bg-blue-500"
        />
        <MetricCard
          title="Visiteurs uniques"
          value={analyticsData?.overview?.uniqueVisitors || 0}
          change={analyticsData?.overview?.visitorsChange || 0}
          icon={Users}
          color="bg-green-500"
        />
        <MetricCard
          title="Pages vues"
          value={analyticsData?.overview?.pageViews || 0}
          change={analyticsData?.overview?.pageViewsChange || 0}
          icon={BarChart3}
          color="bg-purple-500"
        />
        <MetricCard
          title="Durée session"
          value={formatDuration(analyticsData?.overview?.avgSessionDuration || 0)}
          change={analyticsData?.overview?.durationChange || 0}
          icon={Clock}
          color="bg-orange-500"
        />
        <MetricCard
          title="Taux de rebond"
          value={analyticsData?.overview?.bounceRate || 0}
          change={analyticsData?.overview?.bounceRateChange || 0}
          icon={TrendingDown}
          color="bg-red-500"
          suffix="%"
        />
        <MetricCard
          title="Conversion"
          value={analyticsData?.overview?.conversionRate || 0}
          change={analyticsData?.overview?.conversionChange || 0}
          icon={TrendingUp}
          color="bg-indigo-500"
          suffix="%"
        />
      </div>

      {/* Graphiques principaux */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Évolution des vues */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Évolution du trafic
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Vues, visiteurs et pages vues
              </p>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-gray-600 dark:text-gray-400">Vues</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-gray-600 dark:text-gray-400">
                  Visiteurs
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span className="text-gray-600 dark:text-gray-400">Pages</span>
              </div>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={analyticsData?.viewsOverTime || []}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#374151"
                opacity={0.3}
              />
              <XAxis
                dataKey="date"
                stroke="#6B7280"
                tickFormatter={(value) =>
                  new Date(value).toLocaleDateString("fr-FR", {
                    month: "short",
                    day: "numeric",
                  })
                }
              />
              <YAxis stroke="#6B7280" />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area
                type="monotone"
                dataKey="views"
                fill="#3B82F6"
                fillOpacity={0.3}
                stroke="#3B82F6"
                strokeWidth={2}
                name="Vues"
              />
              <Line
                type="monotone"
                dataKey="visitors"
                stroke="#10B981"
                strokeWidth={2}
                dot={{ fill: "#10B981", strokeWidth: 2, r: 4 }}
                name="Visiteurs"
              />
              <Bar
                dataKey="pageViews"
                fill="#8B5CF6"
                fillOpacity={0.7}
                name="Pages vues"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Répartition des appareils */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Appareils
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Répartition par type
              </p>
            </div>
            <Monitor className="w-6 h-6 text-gray-400" />
          </div>

          <ResponsiveContainer width="100%" height={200}>
            <RechartsPieChart>
              <Pie
                data={analyticsData?.deviceStats || []}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {(analyticsData?.deviceStats || []).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${value}%`} />
            </RechartsPieChart>
          </ResponsiveContainer>

          <div className="space-y-3 mt-4">
            {(analyticsData?.deviceStats || []).map((stat, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: stat.color }}
                  ></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {stat.name}
                  </span>
                </div>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {stat.value}%
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Pages populaires et localisation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pages populaires */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Pages populaires
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Top 5 des pages les plus visitées
              </p>
            </div>
            <BarChart3 className="w-6 h-6 text-gray-400" />
          </div>

          <div className="space-y-4">
            {(analyticsData?.topPages || []).map((page, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-6 h-6 bg-blue-500 text-white rounded-full text-xs font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {page.page}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {page.views.toLocaleString()} vues
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {page.change > 0 ? (
                    <ArrowUpRight className="w-4 h-4 text-green-500" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4 text-red-500" />
                  )}
                  <span
                    className={`text-sm font-medium ${
                      page.change > 0 ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    {Math.abs(page.change)}%
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Localisation des visiteurs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Localisation
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Visiteurs par pays
              </p>
            </div>
            <Globe className="w-6 h-6 text-gray-400" />
          </div>

          <div className="space-y-3">
            {(analyticsData?.locationStats || []).map((location, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-6 bg-gray-200 dark:bg-gray-600 rounded flex items-center justify-center">
                    <MapPin className="w-3 h-3 text-gray-500" />
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {location.country}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${location.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400 w-12 text-right">
                    {location.percentage}%
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Nouvelles sections analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Tours les plus vus */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Tours les Plus Vus</h3>
          <div className="space-y-4">
            {(analyticsData?.tours?.mostViewed || []).slice(0, 5).map((tour, index) => (
              <div key={index} className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{tour.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{tour.views.toLocaleString()} vues</p>
                </div>
                <div className="text-right">
                  <Eye className="h-4 w-4 text-blue-500 inline mr-1" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{tour.views}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Statistiques des favoris */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Favoris</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-pink-50 dark:bg-pink-900/20 rounded-lg">
              <div className="flex items-center">
                <Heart className="h-6 w-6 text-pink-500 mr-3" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Total Favoris</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Tous les tours</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-pink-600">
                {(analyticsData?.users?.favorites?.total || 0).toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-center">
                <Users className="h-6 w-6 text-blue-500 mr-3" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Utilisateurs avec Favoris</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Engagement utilisateur</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-blue-600">
                {(analyticsData?.users?.favorites?.usersWithFavorites || 0).toLocaleString()}
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Métriques galerie */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Performance de la galerie
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Statistiques détaillées des médias
            </p>
          </div>
          <Eye className="w-6 h-6 text-gray-400" />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="text-center">
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-xl inline-block mb-2">
              <Eye className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {(analyticsData?.galleryMetrics?.totalViews || 0).toLocaleString()}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Vues totales
            </p>
          </div>
          <div className="text-center">
            <div className="p-3 bg-red-100 dark:bg-red-900 rounded-xl inline-block mb-2">
              <Heart className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {(analyticsData?.galleryMetrics?.totalLikes || 0).toLocaleString()}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">J'aime</p>
          </div>
          <div className="text-center">
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-xl inline-block mb-2">
              <Share2 className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {(analyticsData?.galleryMetrics?.totalShares || 0).toLocaleString()}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Partages</p>
          </div>
          <div className="text-center">
            <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-xl inline-block mb-2">
              <Download className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {(analyticsData?.galleryMetrics?.totalDownloads || 0).toLocaleString()}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Téléchargements
            </p>
          </div>
        </div>

        <div>
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Médias les plus performants
          </h4>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {(analyticsData?.galleryMetrics?.topPerformingMedia || []).map(
              (media, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl"
                >
                  <div className="flex-shrink-0">
                    {media.type === "image" ? (
                      <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                        <Eye className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                    ) : (
                      <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                        <Star className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h5 className="font-medium text-gray-900 dark:text-white truncate">
                      {media.name}
                    </h5>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {media.views.toLocaleString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <Heart className="w-4 h-4" />
                        {media.likes}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AdvancedAnalytics;
