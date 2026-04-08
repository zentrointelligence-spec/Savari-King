import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  Users,
  Calendar,
  DollarSign,
  Eye,
  Upload,
  Star,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Image,
  Video,
  Clock,
  MapPin,
  Zap,
  Target,
  Award,
  Globe,
  Heart,
  ShoppingCart
} from "lucide-react";
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
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";
import toast from "react-hot-toast";
import { apiUtils } from '../../utils/apiUtils';

const PremiumDashboardPage = () => {
  const [timeRange, setTimeRange] = useState("7d");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [rawAnalyticsData, setRawAnalyticsData] = useState(null);
  // Fonction pour récupérer les données analytics
  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await apiUtils.get(`/analytics?timeRange=${timeRange}`);
      
      if (response.success) {
        setRawAnalyticsData(response.data);
        
        // Transformer les données pour le dashboard
        const transformedData = {
          stats: {
            totalRevenue: response.data.overview?.totalRevenue || 0,
            revenueChange: 12.5, // À calculer avec les données historiques
            totalBookings: response.data.overview?.totalBookings || 0,
            bookingsChange: 8.3,
            totalUsers: response.data.users?.total || 0,
            usersChange: 15.2,
            conversionRate: response.data.overview?.conversionRate || 0,
            conversionChange: -2.1,
            galleryViews: response.data.gallery?.totalViews || 0,
            galleryViewsChange: 22.4,
            mediaUploads: response.data.gallery?.totalImages || 0,
            uploadsChange: 45.2,
          },
          revenueData: response.data.revenue?.trend?.map(item => ({
            name: new Date(item.date).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' }),
            revenue: item.revenue,
            bookings: item.transactions
          })) || [],
          galleryStats: [
            { name: "Images", value: response.data.gallery?.totalImages || 0, color: "#3B82F6" },
            { name: "Uploads Récents", value: response.data.gallery?.recentUploads || 0, color: "#8B5CF6" },
            { name: "Vues Totales", value: Math.floor((response.data.gallery?.totalViews || 0) / 100), color: "#F59E0B" },
          ],
          topDestinations: response.data.tours?.popular?.map(tour => ({
            name: tour.name,
            bookings: tour.bookings,
            revenue: tour.bookings * 1500 // Estimation
          })) || [],
          recentActivity: response.data.recentActivity?.map(activity => ({
            type: activity.type,
            message: activity.message,
            time: new Date(activity.timestamp).toLocaleString('fr-FR'),
            icon: activity.type === 'booking' ? Calendar : Users,
            color: activity.type === 'booking' ? 'text-green-600' : 'text-blue-600'
          })) || []
        };
        
        setDashboardData(transformedData);
      } else {
        setError('Erreur lors du chargement des données du dashboard');
      }
    } catch (err) {
      console.error('Erreur dashboard:', err);
      setError('Impossible de charger les données du dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  // Charger les données au montage et lors du changement de timeRange
  useEffect(() => {
    fetchDashboardData();
  }, [timeRange]);

  // Mise à jour périodique des données
  useEffect(() => {
    const interval = setInterval(() => {
      if (dashboardData) {
        fetchDashboardData();
      }
    }, 60000); // Mise à jour toutes les minutes

    return () => clearInterval(interval);
  }, [dashboardData]);



  const StatCard = ({
    title,
    value,
    change,
    icon: Icon,
    color,
    prefix = "",
    suffix = "",
  }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, scale: 1.02 }}
      className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 relative overflow-hidden group"
    >
      {/* Effet de brillance */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
            {title}
          </p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {prefix}
            {typeof value === "number" ? value.toLocaleString() : value}
            {suffix}
          </p>
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
            <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
              vs previous period
            </span>
          </div>
        </div>
        <div className={`p-3 rounded-xl ${color} bg-opacity-10`}>
          <Icon className={`w-8 h-8 ${color.replace("bg-", "text-")}`} />
        </div>
      </div>
    </motion.div>
  );

  const ActivityItem = ({ activity }) => {
    const Icon = activity.icon;
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
      >
        <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg mr-3">
          <Icon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {activity.message}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {activity.time}
          </p>
        </div>
      </motion.div>
    );
  };

  const refreshData = async () => {
    await fetchDashboardData();
    toast.success("Données actualisées avec succès!");
  };

  // Gestion du chargement et des erreurs
  if (isLoading && !dashboardData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Chargement du dashboard premium...</span>
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

  if (!dashboardData) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Aucune donnée disponible</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header avec contrôles */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            Dashboard Premium
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Real-time overview of your activity
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-white dark:bg-gray-800 rounded-xl p-1 shadow-lg border border-gray-200 dark:border-gray-700">
            {[
              { value: "24h", label: "24h" },
              { value: "7d", label: "7d" },
              { value: "30d", label: "30d" },
              { value: "90d", label: "90d" },
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
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Activity className="w-4 h-4" />
            <span>Actualiser</span>
          </motion.button>
        </div>
      </div>

      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        <StatCard
          title="Chiffre d'affaires"
          value={dashboardData.stats.totalRevenue}
          change={dashboardData.stats.revenueChange}
          icon={DollarSign}
          color="bg-green-500"
          prefix="₹"
        />
        <StatCard
          title="Réservations"
          value={dashboardData.stats.totalBookings}
          change={dashboardData.stats.bookingsChange}
          icon={Calendar}
          color="bg-blue-500"
        />
        <StatCard
          title="Utilisateurs"
          value={dashboardData.stats.totalUsers}
          change={dashboardData.stats.usersChange}
          icon={Users}
          color="bg-purple-500"
        />
        <StatCard
          title="Taux conversion"
          value={dashboardData.stats.conversionRate}
          change={dashboardData.stats.conversionChange}
          icon={Target}
          color="bg-orange-500"
          suffix="%"
        />
        <StatCard
          title="Vues galerie"
          value={dashboardData.stats.galleryViews}
          change={dashboardData.stats.galleryViewsChange}
          icon={Eye}
          color="bg-pink-500"
        />
        <StatCard
          title="Médias uploadés"
          value={dashboardData.stats.mediaUploads}
          change={dashboardData.stats.uploadsChange}
          icon={Upload}
          color="bg-indigo-500"
        />
      </div>

      {/* Graphiques principaux */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Graphique des revenus */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Évolution des revenus
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Revenus et réservations sur 7 mois
              </p>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-gray-600 dark:text-gray-400">
                  Revenus
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span className="text-gray-600 dark:text-gray-400">
                  Réservations
                </span>
              </div>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={dashboardData.revenueData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#374151"
                opacity={0.3}
              />
              <XAxis dataKey="name" stroke="#6B7280" />
              <YAxis stroke="#6B7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1F2937",
                  border: "none",
                  borderRadius: "12px",
                  color: "#F9FAFB",
                }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#3B82F6"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorRevenue)"
              />
              <Line
                type="monotone"
                dataKey="bookings"
                stroke="#8B5CF6"
                strokeWidth={2}
                dot={{ fill: "#8B5CF6", strokeWidth: 2, r: 4 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Statistiques galerie */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Galerie Premium
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Répartition des médias
              </p>
            </div>
            <Image className="w-6 h-6 text-gray-400" />
          </div>

          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={dashboardData.galleryStats}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {dashboardData.galleryStats.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>

          <div className="space-y-3 mt-4">
            {dashboardData.galleryStats.map((stat, index) => (
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
                  {stat.value}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Section inférieure */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top destinations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Destinations populaires
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Classement par nombre de réservations
              </p>
            </div>
            <Globe className="w-6 h-6 text-gray-400" />
          </div>

          <div className="space-y-4">
            {dashboardData.topDestinations.map((destination, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-500 text-white rounded-full text-sm font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {destination.name}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {destination.bookings} réservations
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900 dark:text-white">
                    ₹{destination.revenue.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    revenus
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Activité récente */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Activité récente
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Dernières actions
              </p>
            </div>
            <Activity className="w-6 h-6 text-gray-400" />
          </div>

          <div className="space-y-2">
            {dashboardData.recentActivity.map((activity, index) => (
              <ActivityItem key={index} activity={activity} />
            ))}
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full mt-4 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
          >
            Voir toute l'activité
          </motion.button>
        </motion.div>
      </div>

      {/* Actions rapides */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl p-6 text-white"
      >
        <div className="flex flex-col lg:flex-row items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold mb-2">
              Prêt à booster votre activité ?
            </h3>
            <p className="text-blue-100">
              Découvrez nos outils premium pour maximiser vos revenus
            </p>
          </div>
          <div className="flex items-center gap-4 mt-4 lg:mt-0">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-6 py-3 bg-white text-blue-600 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Upload className="w-5 h-5" />
              Ajouter des médias
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-xl font-semibold border border-white/30 hover:bg-white/30 transition-all duration-200"
            >
              <Award className="w-5 h-5" />
              Voir les rapports
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PremiumDashboardPage;
