import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import ProfileSettings from "../components/account/ProfileSettings";
import SecuritySettings from "../components/account/SecuritySettings";
import PreferencesSettings from "../components/account/PreferencesSettings";
import { AuthContext } from "../contexts/AuthContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserCircle,
  faShieldAlt,
  faSignOutAlt,
  faCog,
} from "@fortawesome/free-solid-svg-icons";

const TabButton = ({ active, onClick, icon, label, badge }) => (
  <button
    onClick={onClick}
    className={`flex items-center w-full text-left p-4 rounded-xl transition-all duration-300 ${
      active
        ? "bg-gradient-to-r from-primary to-primary-dark text-white shadow-lg"
        : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
    }`}
  >
    <FontAwesomeIcon icon={icon} className="text-lg w-6" />
    <span className="ml-4 font-medium">{label}</span>
    {badge > 0 && (
      <span className="ml-auto bg-red-500 text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full">
        {badge}
      </span>
    )}
  </button>
);

const MyAccountPage = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("profile");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const tabs = [
    {
      id: "profile",
      label: "Profile",
      icon: faUserCircle,
      component: <ProfileSettings />,
    },
    {
      id: "security",
      label: "Security",
      icon: faShieldAlt,
      component: <SecuritySettings />,
    },
    {
      id: "preferences",
      label: "Preferences",
      icon: faCog,
      component: <PreferencesSettings />,
    },
  ];

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* En-tête */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
              My Account
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage your profile and account settings
            </p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Navigation Latérale - Desktop */}
          <aside className="hidden lg:block lg:w-1/4">
            <div className="bg-white/80 backdrop-blur-sm dark:bg-gray-800/80 rounded-xl shadow-xl border border-purple-100 dark:border-gray-700 p-6 sticky top-6">
              <div className="flex flex-col items-center mb-8">
                <div className="bg-gradient-to-r from-primary to-primary-dark w-20 h-20 rounded-full flex items-center justify-center">
                  <FontAwesomeIcon
                    icon={faUserCircle}
                    className="text-white text-3xl"
                  />
                </div>
                <h2 className="text-xl font-bold mt-4 text-gray-800 dark:text-white">
                  {user?.full_name || "User"}
                </h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  {user?.email || ""}
                </p>
              </div>

              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <TabButton
                    key={tab.id}
                    active={activeTab === tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    icon={tab.icon}
                    label={tab.label}
                    badge={tab.badge || 0}
                  />
                ))}

                <button
                  onClick={handleLogout}
                  className="flex items-center w-full text-left p-4 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                >
                  <FontAwesomeIcon
                    icon={faSignOutAlt}
                    className="text-lg w-6"
                  />
                  <span className="ml-4 font-medium">Logout</span>
                </button>
              </nav>
            </div>
          </aside>

          {/* Menu mobile */}
          <div className="lg:hidden mb-6">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="w-full flex justify-between items-center bg-white/80 backdrop-blur-sm dark:bg-gray-800/80 p-4 rounded-xl shadow-xl border border-purple-100 dark:border-gray-700"
            >
              <span className="font-medium text-gray-800 dark:text-white">
                {tabs.find((t) => t.id === activeTab)?.label}
              </span>
              <FontAwesomeIcon
                icon={mobileMenuOpen ? faSignOutAlt : faUserCircle}
                className="text-gray-600 dark:text-gray-400"
              />
            </button>

            {mobileMenuOpen && (
              <div className="bg-white/80 backdrop-blur-sm dark:bg-gray-800/80 rounded-xl shadow-xl border border-purple-100 dark:border-gray-700 p-4 mt-2">
                <nav className="space-y-2">
                  {tabs.map((tab) => (
                    <TabButton
                      key={tab.id}
                      active={activeTab === tab.id}
                      onClick={() => {
                        setActiveTab(tab.id);
                        setMobileMenuOpen(false);
                      }}
                      icon={tab.icon}
                      label={tab.label}
                      badge={tab.badge || 0}
                    />
                  ))}

                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full text-left p-4 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl"
                  >
                    <FontAwesomeIcon
                      icon={faSignOutAlt}
                      className="text-lg w-6"
                    />
                    <span className="ml-4 font-medium">Logout</span>
                  </button>
                </nav>
              </div>
            )}
          </div>

          {/* Contenu Principal */}
          <div className="lg:w-3/4 w-full">
            <div className="bg-white/80 backdrop-blur-sm dark:bg-gray-800/80 rounded-xl shadow-xl border border-purple-100 dark:border-gray-700 overflow-hidden">
              <div className="animate-fadeIn">
                {tabs.find((tab) => tab.id === activeTab)?.component}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyAccountPage;
