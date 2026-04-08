import React, { useState, useEffect, useContext } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { AuthContext } from "../../contexts/AuthContext";
import API_CONFIG, { buildApiUrl, getAuthHeaders } from "../../config/api";
import {
  LayoutDashboard,
  Calendar,
  Users,
  Star,
  Shield,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  Sun,
  Moon,
  ChevronDown,
  Image,
  Video,
  Upload,
  Eye,
  TrendingUp,
  Activity,
  Zap,
} from "lucide-react";
import toast from "react-hot-toast";

const PremiumAdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("adminDarkMode");
    return saved ? JSON.parse(saved) : false;
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "Nouvelle réservation",
      message: "Tour Kerala - 3 jours",
      time: "2 min",
      unread: true,
    },
    {
      id: 2,
      title: "Upload terminé",
      message: "5 nouvelles images ajoutées",
      time: "5 min",
      unread: true,
    },
    {
      id: 3,
      title: "Avis client",
      message: "Nouvelle évaluation 5 étoiles",
      time: "1h",
      unread: false,
    },
  ]);
  const [pendingUsersCount, setPendingUsersCount] = useState(0);
  const { token } = useContext(AuthContext);

  const location = useLocation();
  const navigate = useNavigate();

  // Navigation items avec icônes modernes
  const navItems = [
    {
      to: "/admin",
      icon: LayoutDashboard,
      text: "Dashboard",
      badge: 3,
      color: "from-blue-500 to-cyan-500",
    },
    {
      to: "/admin/bookings",
      icon: Calendar,
      text: "Réservations",
      badge: 12,
      color: "from-green-500 to-emerald-500",
    },
    {
      to: "/admin/gallery",
      icon: Image,
      text: "Galerie",
      badge: "NEW",
      color: "from-purple-500 to-pink-500",
    },
    {
      to: "/admin/tours",
      icon: Video,
      text: "Tours",
      color: "from-orange-500 to-red-500",
    },
    {
      to: "/admin/users",
      icon: Users,
      text: "Utilisateurs",
      badge: pendingUsersCount,
      color: "from-indigo-500 to-purple-500",
    },
    {
      to: "/admin/reviews",
      icon: Star,
      text: "Avis",
      color: "from-yellow-500 to-orange-500",
    },
    {
      to: "/admin/analytics",
      icon: BarChart3,
      text: "Analytics",
      color: "from-teal-500 to-green-500",
    },
    {
      to: "/admin/security",
      icon: Shield,
      text: "Sécurité",
      badge: 2,
      color: "from-red-500 to-pink-500",
    },
  ];

  // Appliquer le mode sombre
  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("adminDarkMode", JSON.stringify(darkMode));
  }, [darkMode]);

  useEffect(() => {
    const fetchPendingCount = async () => {
      if (token) {
        try {
          const response = await axios.get(
            buildApiUrl(API_CONFIG.ENDPOINTS.ADMIN.PENDING_USERS_COUNT),
            {
              headers: getAuthHeaders(token),
            }
          );
          setPendingUsersCount(response.data.count);
        } catch (error) {
          console.error("Failed to fetch pending users count:", error);
        }
      }
    };
    fetchPendingCount();
  }, [token]);

  // Fermer le menu mobile lors du changement de route
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  useEffect(() => {
    const handleNewUser = () => {
      fetchPendingCount();
    };

    window.addEventListener("new-user-created", handleNewUser);

    return () => {
      window.removeEventListener("new-user-created", handleNewUser);
    };
  }, []);

  const handleLogout = () => {
    toast.success("Logout réussie");
    navigate("/login");
  };

  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <div
      className={`flex h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300`}
    >
      {/* Sidebar Desktop */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.aside
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="hidden lg:flex flex-col w-72 bg-white dark:bg-gray-800 shadow-2xl border-r border-gray-200 dark:border-gray-700"
          >
            {/* Logo et branding */}
            <div className="h-20 flex items-center justify-between px-6 border-b border-gray-200 dark:border-gray-700">
              <motion.div
                className="flex items-center"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                    <Zap className="text-white text-xl" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white dark:border-gray-800"></div>
                </div>
                <div className="ml-3">
                  <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                    Admin Premium
                  </h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    v2.0 Pro
                  </p>
                </div>
              </motion.div>

              <button
                onClick={() => setIsSidebarOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200"
              >
                <X size={20} />
              </button>
            </div>

            {/* Barre de recherche */}
            <div className="p-4">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 pb-4 space-y-2 overflow-y-auto">
              {navItems.map((item) => {
                const isActive = location.pathname === item.to;
                const Icon = item.icon;

                return (
                  <motion.div
                    key={item.to}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <NavLink
                      to={item.to}
                      className={`group flex items-center px-4 py-3 rounded-xl transition-all duration-300 relative overflow-hidden ${
                        isActive
                          ? `bg-gradient-to-r ${item.color} text-white shadow-lg shadow-blue-500/25`
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      }`}
                    >
                      {/* Effet de brillance au hover */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

                      <div
                        className={`p-2 rounded-lg ${
                          isActive
                            ? "bg-white/20"
                            : "bg-gray-100 dark:bg-gray-600 group-hover:bg-gray-200 dark:group-hover:bg-gray-500"
                        } transition-colors duration-200`}
                      >
                        <Icon
                          size={18}
                          className={
                            isActive
                              ? "text-white"
                              : "text-gray-600 dark:text-gray-400"
                          }
                        />
                      </div>

                      <span className="ml-3 font-medium">{item.text}</span>

                      {item.badge && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className={`ml-auto px-2 py-1 text-xs font-bold rounded-full ${
                            typeof item.badge === "number"
                              ? "bg-red-500 text-white"
                              : "bg-green-500 text-white"
                          }`}
                        >
                          {item.badge}
                        </motion.span>
                      )}
                    </NavLink>
                  </motion.div>
                );
              })}
            </nav>

            {/* Profil utilisateur */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center p-3 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 rounded-xl">
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">A</span>
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white dark:border-gray-600"></div>
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    Admin User
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    En ligne
                  </p>
                </div>
                <button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  <ChevronDown size={16} />
                </button>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Sidebar Mobile */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 w-72 bg-white dark:bg-gray-800 shadow-2xl z-50"
            >
              {/* Contenu identique à la sidebar desktop */}
              <div className="h-20 flex items-center justify-between px-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                    <Zap className="text-white text-xl" />
                  </div>
                  <div className="ml-3">
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                      Admin Premium
                    </h1>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      v2.0 Pro
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-4">
                <div className="relative">
                  <Search
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <input
                    type="text"
                    placeholder="Rechercher..."
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <nav className="flex-1 px-4 pb-4 space-y-2 overflow-y-auto">
                {navItems.map((item) => {
                  const isActive = location.pathname === item.to;
                  const Icon = item.icon;

                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      className={`flex items-center px-4 py-3 rounded-xl transition-all duration-300 ${
                        isActive
                          ? `bg-gradient-to-r ${item.color} text-white shadow-lg`
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      }`}
                    >
                      <div
                        className={`p-2 rounded-lg ${
                          isActive
                            ? "bg-white/20"
                            : "bg-gray-100 dark:bg-gray-600"
                        }`}
                      >
                        <Icon size={18} />
                      </div>
                      <span className="ml-3 font-medium">{item.text}</span>
                      {item.badge && (
                        <span
                          className={`ml-auto px-2 py-1 text-xs font-bold rounded-full ${
                            typeof item.badge === "number"
                              ? "bg-red-500 text-white"
                              : "bg-green-500 text-white"
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </NavLink>
                  );
                })}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Contenu principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header premium */}
        <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center">
              {!isSidebarOpen && (
                <button
                  onClick={() => setIsSidebarOpen(true)}
                  className="mr-4 p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200 hidden lg:block"
                >
                  <Menu size={20} />
                </button>
              )}

              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="mr-4 p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200 lg:hidden"
              >
                <Menu size={20} />
              </button>

              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent capitalize">
                  {location.pathname.split("/").pop() || "Dashboard"}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {new Date().toLocaleDateString("fr-FR", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {/* Notifications */}
              <div className="relative">
                <button className="relative p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200">
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full font-bold"
                    >
                      {unreadCount}
                    </motion.span>
                  )}
                </button>
              </div>

              {/* Toggle dark mode */}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200"
              >
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>

              {/* Quick actions */}
              <div className="hidden md:flex items-center space-x-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Upload size={16} />
                  <span className="text-sm font-medium">Upload</span>
                </motion.button>
              </div>

              {/* Profil */}
              <div className="relative group">
                <button className="flex items-center space-x-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-semibold">A</span>
                  </div>
                </button>

                {/* Menu dropdown */}
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 z-50">
                  <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      Admin User
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      admin@example.com
                    </p>
                  </div>

                  <button className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3">
                    <Settings size={16} />
                    Settings
                  </button>

                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-3"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Contenu */}
        <main className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900">
          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default PremiumAdminLayout;
