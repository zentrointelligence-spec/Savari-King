import React, { useState, useEffect, useContext, useCallback } from "react";
import axios from "axios";
import { AuthContext } from "../../contexts/AuthContext";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSave,
  faSpinner,
  faUserEdit,
  faCheckCircle,
  faCalendarAlt,
  faReceipt,
} from "@fortawesome/free-solid-svg-icons";
import API_CONFIG, { buildApiUrl, getAuthHeaders } from "../../config/api";

const AccountStats = () => {
  const { user, token } = useContext(AuthContext);
  const [stats, setStats] = useState({
    memberSince: null,
    totalBookings: 0,
    accountStatus: "Active",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        console.log('[AccountStats] Fetching bookings from:', buildApiUrl(API_CONFIG.ENDPOINTS.MY_BOOKINGS));
        console.log('[AccountStats] Token:', token ? 'Present' : 'Missing');

        // Get total bookings count
        const bookingsResponse = await axios.get(
          buildApiUrl(API_CONFIG.ENDPOINTS.MY_BOOKINGS),
          { headers: getAuthHeaders(token) }
        );

        console.log('[AccountStats] Bookings received:', bookingsResponse.data?.bookings?.length);

        setStats({
          memberSince: user?.created_at || new Date().toISOString(),
          totalBookings: bookingsResponse.data?.bookings?.length || 0,
          accountStatus: user?.is_verified ? "Verified" : "Active",
        });
      } catch (error) {
        console.error("[AccountStats] Error fetching account stats:", error);
        console.error("[AccountStats] Error response:", error.response?.data);
      } finally {
        setLoading(false);
      }
    };

    if (token && user) {
      fetchStats();
    }
  }, [token, user]);

  const formatMemberSince = (dateString) => {
    if (!dateString) return "Recently";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
    });
  };

  if (loading) {
    return (
      <div className="violet-backdrop rounded-xl shadow-primary p-6">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="violet-backdrop rounded-xl shadow-primary p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Account Overview
      </h3>
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-gray-600 flex items-center">
            <FontAwesomeIcon icon={faCalendarAlt} className="mr-2 text-gray-400" />
            Member since
          </span>
          <span className="font-medium">{formatMemberSince(stats.memberSince)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600 flex items-center">
            <FontAwesomeIcon icon={faReceipt} className="mr-2 text-gray-400" />
            Total bookings
          </span>
          <span className="font-medium">{stats.totalBookings}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600 flex items-center">
            <FontAwesomeIcon icon={faCheckCircle} className="mr-2 text-gray-400" />
            Account status
          </span>
          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
            {stats.accountStatus}
          </span>
        </div>
      </div>
    </div>
  );
};

const ProfileSettings = () => {
  const { token, updateUser } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    country: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Validation des données du formulaire
  const validateForm = () => {
    const newErrors = {};
    if (!formData.full_name.trim()) {
      newErrors.full_name = "Full name is required";
    }
    if (
      formData.phone &&
      !/^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/.test(formData.phone)
    ) {
      newErrors.phone = "Invalid phone number format";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Chargement des données du profil
  const fetchProfile = useCallback(async () => {
    try {
      console.log('[ProfileSettings] Fetching profile from:', buildApiUrl(API_CONFIG.ENDPOINTS.USER_PROFILE));
      console.log('[ProfileSettings] Token:', token ? 'Present' : 'Missing');

      const response = await axios.get(
        buildApiUrl(API_CONFIG.ENDPOINTS.USER_PROFILE),
        {
          headers: getAuthHeaders(token),
        }
      );

      console.log('[ProfileSettings] Profile data received:', response.data);

      setFormData({
        full_name: response.data.full_name || "",
        phone: response.data.phone || "",
        country: response.data.country || "",
      });
    } catch (error) {
      console.error('[ProfileSettings] Error fetching profile:', error);
      console.error('[ProfileSettings] Error response:', error.response?.data);
      console.error('[ProfileSettings] Error status:', error.response?.status);
      toast.error("Could not load profile data: " + (error.response?.data?.error || error.message));
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Validation en temps réel
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const response = await axios.put(
        buildApiUrl(API_CONFIG.ENDPOINTS.USER_PROFILE),
        formData,
        {
          headers: getAuthHeaders(token),
        }
      );

      // Mise à jour du contexte
      updateUser(response.data);

      toast.success("Profile updated successfully!", {
        icon: <FontAwesomeIcon icon={faUserEdit} className="text-green-500" />,
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex items-center mb-8">
        <div className="bg-gradient-to-r from-primary to-primary-dark w-12 h-12 rounded-lg flex items-center justify-center">
          <FontAwesomeIcon icon={faUserEdit} className="text-white text-xl" />
        </div>
        <h2 className="text-2xl font-bold ml-4 text-gray-900">
          Profile Settings
        </h2>
      </div>

      <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-purple-100 p-6 mb-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all ${
                errors.full_name ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="John Doe"
              required
            />
            {errors.full_name && (
              <p className="mt-1 text-sm text-red-500">{errors.full_name}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all ${
                  errors.phone ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="+1 (555) 123-4567"
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-500">{errors.phone}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Country
              </label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                placeholder="United States"
              />
            </div>
          </div>

          <div className="pt-6 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center justify-center bg-gradient-to-r from-primary to-primary-dark text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-70 transform hover:scale-105"
            >
              {isSubmitting ? (
                <>
                  <FontAwesomeIcon
                    icon={faSpinner}
                    className="animate-spin mr-2"
                  />
                  Saving...
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faSave} className="mr-2" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Additional Profile Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Picture Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-purple-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <FontAwesomeIcon icon={faUserEdit} className="mr-2 text-primary" />
            Profile Picture
          </h3>
          <div className="flex flex-col items-center">
            <div className="w-24 h-24 bg-gradient-to-r from-primary to-primary-dark rounded-full flex items-center justify-center mb-4">
              <FontAwesomeIcon
                icon={faUserEdit}
                className="text-white text-2xl"
              />
            </div>
            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
              Upload New Photo
            </button>
            <p className="text-xs text-gray-500 mt-2">JPG, PNG up to 5MB</p>
          </div>
        </div>

        {/* Account Stats */}
        <AccountStats />
      </div>
    </div>
  );
};

export default ProfileSettings;
