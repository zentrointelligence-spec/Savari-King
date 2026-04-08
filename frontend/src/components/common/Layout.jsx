import React, { useContext } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AuthContext } from "../../contexts/AuthContext";
import ThemeToggle from "./ThemeToggle";
import LanguageSwitcher from "./LanguageSwitcher";
import CurrencySwitcher from "./CurrencySwitcher";
import NotificationDropdown from "./NotificationDropdown";
import logo from "../../assets/images/EbenezerTourTransparentLogo.png";

// Fonction utilitaire pour générer les initiales
const getInitials = (name) => {
  if (!name) return "?";
  const names = name.split(" ");
  if (names.length === 1) return names[0].charAt(0).toUpperCase();
  return (
    names[0].charAt(0) +
    "." +
    names[names.length - 1].charAt(0)
  ).toUpperCase();
};

// --- Composant pour la barre du haut ---
const TopBar = () => {
  const { user } = useContext(AuthContext);
  const { t } = useTranslation();

  return (
    <header className="h-[70px] w-full bg-gradient-to-r from-white/95 to-gray-50/95 dark:from-dark-light/95 dark:to-dark-heavy/95 text-gray-800 dark:text-gray-200 flex items-center justify-between px-6 shadow-primary z-20 flex-shrink-0 border-b border-primary/20 dark:border-primary/30 backdrop-blur-md">
      {/* Section Gauche : Logo */}
      <div className="flex-1">
        <Link to="/" className="flex items-center group">
          <img
            src={logo}
            alt={t("header.logoAlt")}
            className="h-12 w-auto transition-transform duration-300 group-hover:scale-105"
          />
          <div className="ml-3 hidden lg:block">
            <h1 className="text-xl font-bold text-primary-gradient">
              Ebenezer Tours
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {t("header.tagline")}
            </p>
          </div>
        </Link>
      </div>

      {/* Section Centrale : Barre de recherche */}
      <div className="flex-1 flex justify-center">
        <div className="relative w-full max-w-lg">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <i className="fas fa-search text-gray-400 dark:text-gray-500"></i>
          </div>
          <input
            type="text"
            placeholder={t("header.searchPlaceholder")}
            className="w-full pl-12 pr-4 py-3 bg-white/90 dark:bg-dark-heavy/90 border border-primary/20 dark:border-primary/30 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary dark:focus:ring-accent/50 shadow-primary/20 transition-all duration-300 hover:shadow-primary/40 backdrop-blur-sm"
          />
          <div className="absolute inset-y-0 right-0 pr-2 flex items-center">
            <button className="bg-primary-gradient hover:shadow-primary text-white p-2 rounded-full transition-all duration-300 hover:scale-105">
              <i className="fas fa-search text-sm"></i>
            </button>
          </div>
        </div>
      </div>

      {/* Section Droite : Actions Utilisateur */}
      <div className="flex-1 flex justify-end items-center space-x-4">
        {/* Currency Switcher */}
        <CurrencySwitcher />

        {/* Language Switcher */}
        <LanguageSwitcher showLabel={false} size="sm" />

        {/* Composant de basculement de thème */}
        <ThemeToggle showLabel={false} size="sm" />

        {user ? (
          <>
            {user.role === "administrator" && (
              <Link
                to="/admin"
                className="flex items-center bg-primary-gradient text-white px-4 py-2 rounded-full hover:shadow-primary transition-all duration-300 transform hover:-translate-y-0.5 hover:scale-105"
                title={t("header.adminPanel")}
              >
                <i className="fas fa-cog mr-2"></i>
                <span className="text-sm font-medium hidden lg:block">
                  {t("navigation.admin")}
                </span>
              </Link>
            )}

            <NotificationDropdown />

            <Link to="/my-account" className="group">
              <button
                className="w-12 h-12 rounded-full bg-primary-gradient text-white flex items-center justify-center font-bold text-lg shadow-primary hover:shadow-accent transition-all duration-300 transform hover:-translate-y-0.5 hover:scale-105 ring-2 ring-white dark:ring-dark-light"
                title={t("header.loggedInAs", { name: user.full_name })}
              >
                {getInitials(user.full_name)}
              </button>
            </Link>
          </>
        ) : (
          <div className="flex items-center space-x-3">
            <Link
              to="/login"
              className="text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-accent font-medium transition-colors duration-300"
            >
              {t("navigation.login")}
            </Link>
            <Link
              to="/register"
              className="bg-primary-gradient text-white px-6 py-2 rounded-full font-semibold hover:shadow-primary transition-all duration-300 transform hover:-translate-y-0.5 hover:scale-105"
            >
              {t("navigation.register")}
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

// --- Composant pour la barre latérale ---
const Sidebar = () => {
  const { user, logout } = useContext(AuthContext);
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // Composant interne pour un lien de la barre latérale
  const SidebarLink = ({ to, icon, text, badge }) => (
    <NavLink
      to={to}
      end // 'end' prop ensures the link is only active on exact match
      className={({ isActive }) =>
        `relative flex flex-col items-center justify-center py-4 w-full transition-all duration-300 group ${
          isActive
            ? "bg-primary-gradient text-white shadow-primary"
            : "text-gray-400 hover:bg-primary-gradient hover:bg-opacity-20 hover:text-white"
        }`
      }
      title={text}
    >
      <div className="relative">
        <i
          className={`fas ${icon} text-xl transition-transform duration-300 group-hover:scale-110`}
        ></i>
        {badge && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
            {badge}
          </span>
        )}
      </div>
      <span className="text-xs mt-1 font-medium">{text}</span>
      {/* Active indicator */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    </NavLink>
  );

  const LogoutButton = () => (
    <button
      onClick={handleLogout}
      title={t("navigation.logout")}
      className="relative flex flex-col items-center justify-center py-4 w-full text-gray-400 hover:bg-gradient-to-r hover:from-red-500/20 hover:to-red-600/20 hover:text-red-400 transition-all duration-300 group"
    >
      <i className="fas fa-sign-out-alt text-xl transition-transform duration-300 group-hover:scale-110"></i>
      <span className="text-xs mt-1 font-medium">{t("navigation.logout")}</span>
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-400 rounded-r-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    </button>
  );

  return (
    <aside className="w-[90px] bg-gradient-to-b from-dark via-dark-light to-dark text-white flex flex-col items-center shadow-2xl z-10 border-r border-primary/20 h-full">
      {/* Brand Section */}
      <div className="py-4 border-b border-primary/20 w-full flex justify-center flex-shrink-0">
        <div className="w-12 h-12 bg-primary-gradient rounded-xl flex items-center justify-center shadow-primary">
          <i className="fas fa-compass text-white text-xl"></i>
        </div>
      </div>

      {/* Scrollable Content Container */}
      <div className="flex-1 flex flex-col w-full overflow-y-auto violet-scrollbar">
        {/* Main Navigation */}
        <nav className="flex flex-col items-center w-full py-4 space-y-2 flex-shrink-0">
          <SidebarLink to="/" icon="fa-home" text={t("navigation.home")} />
          <SidebarLink
            to="/tours"
            icon="fa-route"
            text={t("navigation.tours")}
          />
          <SidebarLink
            to="/destinations"
            icon="fa-map-marked-alt"
            text={t("navigation.destinations")}
          />
          <SidebarLink
            to="/blog"
            icon="fa-blog"
            text={t("navigation.blog")}
            badge={t("common.new")}
          />
          <SidebarLink
            to="/gallery"
            icon="fa-images"
            text={t("navigation.gallery")}
          />
          <SidebarLink
            to="/about-us"
            icon="fa-info-circle"
            text={t("navigation.about")}
          />
          <SidebarLink
            to="/contact"
            icon="fa-envelope"
            text={t("navigation.contact")}
          />
        </nav>

        {/* Divider */}
        <div className="w-12 h-px bg-gradient-to-r from-transparent via-primary to-transparent my-4 flex-shrink-0"></div>

        {/* Flexible spacer to push user section to bottom */}
        <div className="flex-1 min-h-4"></div>

        {/* User Section */}
        <div className="w-full pb-4 flex-shrink-0">
          {user ? (
            <div className="flex flex-col items-center w-full space-y-2">
              {user.role === "administrator" && (
                <SidebarLink
                  to="/admin"
                  icon="fa-tachometer-alt"
                  text={t("navigation.admin")}
                />
              )}
              <SidebarLink
                to="/my-bookings"
                icon="fa-calendar-check"
                text={t("navigation.myBookings")}
              />
              <SidebarLink
                to="/my-reviews"
                icon="fa-star"
                text={t("navigation.myReviews") || "My Reviews"}
              />
              <SidebarLink
                to="/terms"
                icon="fa-file-contract"
                text={t("navigation.terms")}
              />

              {/* Divider */}
              <div className="w-12 h-px bg-gradient-to-r from-transparent via-primary to-transparent my-2"></div>

              <LogoutButton />
            </div>
          ) : (
            <div className="flex flex-col items-center w-full space-y-2">
              <SidebarLink
                to="/terms"
                icon="fa-file-contract"
                text={t("navigation.terms")}
              />
              {/* Divider */}
              <div className="w-12 h-px bg-gradient-to-r from-transparent via-primary to-transparent my-2"></div>
              <SidebarLink
                to="/login"
                icon="fa-sign-in-alt"
                text={t("navigation.login")}
              />
              <SidebarLink
                to="/register"
                icon="fa-user-plus"
                text={t("navigation.register")}
              />
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

// --- Composant principal du Layout ---
const Layout = ({ children }) => {
  const { t } = useTranslation();
  return (
    <div className="h-screen flex flex-col app-container">
      <TopBar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-gray-50 to-gray-100 dark:from-dark-main dark:to-dark-heavy violet-scrollbar">
          <div className="min-h-full">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
