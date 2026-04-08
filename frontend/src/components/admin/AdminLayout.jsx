import React, { useState, useEffect, useContext } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTachometerAlt,
  faReceipt,
  faSuitcaseRolling,
  faBook,
  faUsers,
  faStar,
  faThumbsUp,
  faShieldAlt,
  faSignOutAlt,
  faBars,
  faTimes,
  faChartLine,
  faEnvelope,
  faNewspaper,
} from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import { AuthContext } from "../../contexts/AuthContext";
import API_CONFIG, { buildApiUrl, getAuthHeaders } from "../../config/api";
import { toast } from "react-toastify";

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [badgeCounts, setBadgeCounts] = useState({
    dashboard: 0,
    bookings: 0,
    users: 0,
    reviews: 0,
    security: 0,
  });
  const { token, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLayoutStats = async () => {
      if (!token) return;
      try {
        const response = await axios.get(
          buildApiUrl(API_CONFIG.ENDPOINTS.ADMIN.LAYOUT_STATS),
          { headers: getAuthHeaders(token) }
        );
        setBadgeCounts(response.data);
      } catch (error) {
        console.error("Failed to fetch layout stats", error);
      }
    };
    fetchLayoutStats();
  }, [token]);

  // Fermer le menu mobile lors du changement de route
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  // Composant interne pour un lien de la barre latérale
  const NavLinkItem = ({ to, icon, text, badge }) => {
    const isActive = location.pathname === to;

    return (
      <NavLink
        to={to}
        className={`flex items-center px-4 py-3 rounded-lg transition-all duration-300 group ${
          isActive
            ? "bg-primary-gradient text-white shadow-primary"
            : "text-gray-700 hover:bg-gray-100"
        }`}
      >
        <FontAwesomeIcon
          icon={icon}
          className={`text-lg ${
            isActive ? "text-white" : "text-gray-500 group-hover:text-primary"
          }`}
        />
        <span className="ml-4 font-medium">{text}</span>

        {badge > 0 && (
          <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            {badge}
          </span>
        )}
      </NavLink>
    );
  };

  // Données de navigation
  const navItems = [
    {
      to: "/admin",
      icon: faTachometerAlt,
      text: "Dashboard",
      badge: badgeCounts.dashboard,
    },
    {
      to: "/admin/bookings",
      icon: faReceipt,
      text: "Bookings",
      badge: badgeCounts.bookings,
    },
    { to: "/admin/tours", icon: faSuitcaseRolling, text: "Tours" },
    { to: "/admin/catalog", icon: faBook, text: "Catalog" },
    { to: "/admin/blog", icon: faNewspaper, text: "Blog" },
    {
      to: "/admin/users",
      icon: faUsers,
      text: "Users",
      badge: badgeCounts.users,
    },
    {
      to: "/admin/reviews",
      icon: faStar,
      text: "Reviews",
      badge: badgeCounts.reviews,
    },
    {
      to: "/admin/recommendation-stats",
      icon: faThumbsUp,
      text: "Recommendation Stats",
    },
    {
      to: "/admin/security",
      icon: faShieldAlt,
      text: "Security",
      badge: badgeCounts.security,
    },
    { to: "/admin/analytics", icon: faChartLine, text: "Analytics" },
    { to: "/admin/email-logs", icon: faEnvelope, text: "Email Logs" },
  ];

  // Gestion de la déconnexion
  const handleLogout = () => {
    logout();
    toast.info("You have been logged out");
    navigate("/login");
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Bouton de menu mobile */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="md:hidden fixed top-4 right-4 z-50 p-3 bg-white rounded-full shadow-lg"
      >
        <FontAwesomeIcon
          icon={isMobileMenuOpen ? faTimes : faBars}
          className="text-gray-700 text-xl"
        />
      </button>

      {/* Barre latérale - Version desktop */}
      <aside
        className={`hidden md:flex flex-col w-64 bg-white text-gray-800 shadow-xl z-40 transition-all duration-300 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-20 flex items-center justify-between px-6 border-b border-gray-200">
          <div className="flex items-center">
            <div className="bg-gradient-to-r from-primary to-secondary w-10 h-10 rounded-lg flex items-center justify-center">
              <FontAwesomeIcon
                icon={faSuitcaseRolling}
                className="text-white text-xl"
              />
            </div>
            <h1 className="text-xl font-bold ml-3">TravelAdmin</h1>
          </div>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-full"
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <div className="flex-1 px-4 py-6 space-y-1 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => (
            <NavLinkItem
              key={item.to}
              to={item.to}
              icon={item.icon}
              text={item.text}
              badge={item.badge}
            />
          ))}
        </div>

      </aside>

      {/* Barre latérale - Version mobile */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40">
          <div
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-white shadow-xl z-50 animate-slide-in">
            <div className="h-20 flex items-center justify-between px-6 border-b border-gray-200">
              <div className="flex items-center">
                <div className="bg-gradient-to-r from-primary to-secondary w-10 h-10 rounded-lg flex items-center justify-center">
                  <FontAwesomeIcon
                    icon={faSuitcaseRolling}
                    className="text-white text-xl"
                  />
                </div>
                <h1 className="text-xl font-bold ml-3">TravelAdmin</h1>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 text-gray-500 hover:bg-gray-100 rounded-full"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            <div className="px-4 py-6 space-y-1 h-[calc(100vh-160px)] overflow-y-auto custom-scrollbar">
              {navItems.map((item) => (
                <NavLinkItem
                  key={item.to}
                  to={item.to}
                  icon={item.icon}
                  text={item.text}
                  badge={item.badge}
                />
              ))}
            </div>
          </aside>
        </div>
      )}

      {/* Contenu principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* En-tête */}
        <header className="bg-white shadow-sm z-30">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center">
              {!isSidebarOpen && (
                <button
                  onClick={() => setIsSidebarOpen(true)}
                  className="mr-4 p-2 text-gray-500 hover:bg-gray-100 rounded-full hidden md:block"
                >
                  <FontAwesomeIcon icon={faBars} />
                </button>
              )}
              <h2 className="text-xl font-semibold text-gray-800 capitalize">
                {location.pathname.split("/").pop() || "Dashboard"}
              </h2>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
              >
                <FontAwesomeIcon icon={faSignOutAlt} />
                <span className="hidden md:block">Logout</span>
              </button>
            </div>
          </div>
        </header>

        {/* Contenu */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
          <div className="container mx-auto px-4 py-6">
            <Outlet />
          </div>
        </main>

        {/* Pied de page optionnel */}
        <footer className="bg-white border-t border-gray-200 py-4 px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-600 text-sm">
              © {new Date().getFullYear()} TravelAdmin. All rights reserved.
            </p>
            <div className="flex space-x-4 mt-2 md:mt-0">
              <a
                href="#"
                className="text-gray-500 hover:text-primary text-sm"
              >
                Privacy Policy
              </a>
              <a
                href="#"
                className="text-gray-500 hover:text-primary text-sm"
              >
                Terms of Service
              </a>
              <a
                href="#"
                className="text-gray-500 hover:text-primary text-sm"
              >
                Contact
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default AdminLayout;
