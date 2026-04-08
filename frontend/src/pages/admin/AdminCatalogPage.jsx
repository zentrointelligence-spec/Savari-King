import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCar, faPlusCircle, faCog } from "@fortawesome/free-solid-svg-icons";
import VehicleManager from "../../components/admin/VehicleManager";
import AddonManager from "../../components/admin/AddonManager";

const TabButton = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`relative flex items-center gap-2 py-4 px-6 text-lg font-semibold transition-all duration-300 group ${
      active
        ? "text-primary"
        : "text-gray-500 hover:text-primary hover:bg-gray-50"
    }`}
  >
    <FontAwesomeIcon
      icon={icon}
      className={`transition-transform duration-300 ${
        active ? "scale-110" : "group-hover:scale-105"
      }`}
    />
    <span>{label}</span>

    {/* Animated underline */}
    <div
      className={`absolute bottom-0 left-0 h-0.5 bg-primary transition-all duration-300 ${
        active ? "w-full" : "w-0 group-hover:w-1/2"
      }`}
    />
  </button>
);

const AdminCatalogPage = () => {
  const [activeTab, setActiveTab] = useState("vehicles");

  const tabs = [
    {
      id: "vehicles",
      label: "Vehicles",
      icon: faCar,
      component: <VehicleManager />,
    },
    {
      id: "addons",
      label: "Add-ons",
      icon: faPlusCircle,
      component: <AddonManager />,
    },
  ];

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center gap-3 mb-8">
        <FontAwesomeIcon
          icon={faCog}
          className="text-2xl text-primary animate-spin-slow"
        />
        <h1 className="text-3xl font-bold text-gray-800">Catalog Management</h1>
      </div>

      {/* Navigation tabs */}
      <div className="bg-white rounded-xl shadow-md p-1 mb-8">
        <nav className="flex">
          {tabs.map((tab) => (
            <TabButton
              key={tab.id}
              active={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
              icon={tab.icon}
              label={tab.label}
            />
          ))}
        </nav>
      </div>

      {/* Animated tab content */}
      <div className="animate-fadeIn">
        {tabs.find((tab) => tab.id === activeTab)?.component}
      </div>
    </div>
  );
};

export default AdminCatalogPage;
