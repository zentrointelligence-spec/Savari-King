import { useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import API_CONFIG, { buildApiUrl, getAuthHeaders } from "../config/api";

// Système de cache pour les requêtes API
class ApiCache {
  constructor(ttl = 300000) { // 5 minutes par défaut
    this.cache = {};
    this.defaultTtl = ttl;
  }

  // Générer une clé de cache unique basée sur l'URL et les paramètres
  generateCacheKey(config) {
    const { url, params, data, method } = config;
    const paramsString = params ? JSON.stringify(params) : '';
    const dataString = data ? JSON.stringify(data) : '';
    return `${method || 'get'}_${url}_${paramsString}_${dataString}`;
  }

  // Vérifier si une requête est en cache et valide
  has(config) {
    const key = this.generateCacheKey(config);
    const cachedItem = this.cache[key];
    
    if (!cachedItem) return false;
    
    const now = Date.now();
    if (now - cachedItem.timestamp > cachedItem.ttl) {
      // Cache expiré, on le supprime
      delete this.cache[key];
      return false;
    }
    
    return true;
  }

  // Récupérer une réponse du cache
  get(config) {
    const key = this.generateCacheKey(config);
    return this.cache[key]?.data;
  }

  // Mettre en cache une réponse
  set(config, data, ttl = this.defaultTtl) {
    const key = this.generateCacheKey(config);
    this.cache[key] = {
      data,
      timestamp: Date.now(),
      ttl
    };
  }

  // Invalider une entrée spécifique du cache
  invalidate(config) {
    const key = this.generateCacheKey(config);
    delete this.cache[key];
  }

  // Invalider tout le cache ou une partie basée sur un préfixe d'URL
  invalidateByUrlPrefix(urlPrefix) {
    Object.keys(this.cache).forEach(key => {
      if (key.includes(urlPrefix)) {
        delete this.cache[key];
      }
    });
  }

  // Vider complètement le cache
  clear() {
    this.cache = {};
  }
}

// Créer une instance du cache
const apiCache = new ApiCache();

// Configuration globale d'Axios
const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: API_CONFIG.DEFAULT_HEADERS,
});

// Configuration pour déterminer quelles requêtes peuvent être mises en cache
const cacheConfig = {
  // Liste des endpoints qui peuvent être mis en cache (GET uniquement)
  cacheable: [
    '/api/tours',
    '/api/blog',
    '/api/gallery',
    '/api/analytics'
  ],
  // Durée de vie du cache par endpoint (en ms)
  ttl: {
    '/api/tours': 600000, // 10 minutes
    '/api/blog': 900000,   // 15 minutes
    '/api/gallery': 1800000, // 30 minutes
    '/api/analytics': 300000 // 5 minutes
  },
  // Endpoints qui ne doivent jamais être mis en cache
  neverCache: [
    '/api/users/login',
    '/api/users/register',
    '/api/bookings'
  ]
};

// Intercepteur pour les requêtes
apiClient.interceptors.request.use(
  (config) => {
    // Ajouter le token d'authentification si disponible
    const token = localStorage.getItem("token");
    if (token) {
      config.headers = getAuthHeaders(token);
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour les réponses
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Gestion centralisée des erreurs
    handleApiError(error);
    return Promise.reject(error);
  }
);

// Client API avec cache
const apiClientWithCache = {
  request: (config) => {
    return apiClient.request(config);
  },
  get: (url, config = {}) => {
    // Check cache first
    const cacheKey = { url, method: 'get', ...config };

    // Check if URL should never be cached
    const shouldNeverCache = cacheConfig.neverCache.some(endpoint =>
      url.includes(endpoint)
    );

    if (!shouldNeverCache && apiCache.has(cacheKey)) {
      const cachedResponse = apiCache.get(cacheKey);
      return Promise.resolve(cachedResponse);
    }

    // Make the actual request
    return apiClient.get(url, config).then(response => {
      // Cache if applicable
      const shouldCache = cacheConfig.cacheable.some(endpoint =>
        url.includes(endpoint)
      );

      if (shouldCache && !shouldNeverCache) {
        const ttl = Object.entries(cacheConfig.ttl).find(([key]) =>
          url.includes(key)
        )?.[1] || apiCache.defaultTtl;
        apiCache.set(cacheKey, response, ttl);
      }

      return response;
    });
  },
  post: (url, data, config = {}) => {
    // Les requêtes POST invalident généralement le cache pour cette URL
    apiCache.invalidateByUrlPrefix(url.split('?')[0]);
    return apiClient.post(url, data, config);
  },
  put: (url, data, config = {}) => {
    // Les requêtes PUT invalident généralement le cache pour cette URL
    apiCache.invalidateByUrlPrefix(url.split('?')[0]);
    return apiClient.put(url, data, config);
  },
  patch: (url, data, config = {}) => {
    // Les requêtes PATCH invalident généralement le cache pour cette URL
    apiCache.invalidateByUrlPrefix(url.split('?')[0]);
    return apiClient.patch(url, data, config);
  },
  delete: (url, config = {}) => {
    // Les requêtes DELETE invalident généralement le cache pour cette URL
    apiCache.invalidateByUrlPrefix(url.split('?')[0]);
    return apiClient.delete(url, config);
  }
};

// Fonction de gestion des erreurs API
const handleApiError = (error) => {
  if (!error.response) {
    // Erreur de réseau
    toast.error("Network error. Please check your connection.");
    return;
  }

  const { status, data } = error.response;

  switch (status) {
    case 400:
      toast.error(data.error || "Invalid request");
      break;
    case 401:
      toast.error("Authentication required. Please login.");
      // Rediriger vers la page de connexion
      if (window.location.pathname !== "/login") {
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
      break;
    case 403:
      toast.error("Access denied. Insufficient permissions.");
      break;
    case 404:
      toast.error(data.error || "Resource not found");
      break;
    case 422:
      toast.error(data.error || "Validation error");
      break;
    case 500:
      toast.error("Server error. Please try again later.");
      break;
    default:
      toast.error(data.error || "An unexpected error occurred");
  }
};

// Fonctions utilitaires pour les appels API avec cache
export const apiUtils = {
  // Méthode pour vider le cache
  clearCache: () => apiCache.clear(),
  invalidateCache: (urlPrefix) => apiCache.invalidateByUrlPrefix(urlPrefix),
  
  // Auth
  login: (credentials) =>
    apiClient.post(API_CONFIG.ENDPOINTS.LOGIN, credentials),
  register: (userData) =>
    apiClient.post(API_CONFIG.ENDPOINTS.REGISTER, userData),
  changePassword: (passwordData) =>
    apiClient.post(API_CONFIG.ENDPOINTS.CHANGE_PASSWORD, passwordData),

  // Tours - avec cache
  getTours: (params = {}) =>
    apiClientWithCache.get(API_CONFIG.ENDPOINTS.TOURS, { params }),
  getTourById: (id) => 
    apiClientWithCache.get(API_CONFIG.ENDPOINTS.TOUR_DETAIL(id)),

  // Bookings
  createBooking: (bookingData) => {
    apiCache.invalidateByUrlPrefix('/api/bookings');
    return apiClient.post(API_CONFIG.ENDPOINTS.BOOKING_CREATE, bookingData);
  },
  getMyBookings: () => {
    return apiClient.get(API_CONFIG.ENDPOINTS.MY_BOOKINGS);
  },
  cancelBooking: (bookingId) => {
    apiCache.invalidateByUrlPrefix('/api/bookings');
    return apiClient.patch(
      buildApiUrl(API_CONFIG.ENDPOINTS.BOOKING_CANCEL(bookingId))
    );
  },
  updateBookingStatus: (id, status) => {
    apiCache.invalidateByUrlPrefix('/api/bookings');
    return apiClient.patch(API_CONFIG.ENDPOINTS.BOOKING_STATUS(id), {
      newStatus: status,
    });
  },

  // Gallery - avec cache
  getGalleryImages: (filters = {}) => {
    return apiClientWithCache.get(API_CONFIG.ENDPOINTS.GALLERY_IMAGES, {
      params: filters,
    });
  },
  getGalleryImageById: (id) => {
    return apiClientWithCache.get(
      buildApiUrl(API_CONFIG.ENDPOINTS.GALLERY_IMAGE_BY_ID(id))
    );
  },
  uploadMedia: (formData, onProgress) => {
    apiCache.invalidateByUrlPrefix('/api/gallery');
    return apiClient.post(API_CONFIG.ENDPOINTS.GALLERY_UPLOAD, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: onProgress,
    });
  },
  updateMedia: (id, data) => {
    apiCache.invalidateByUrlPrefix('/api/gallery');
    return apiClient.put(API_CONFIG.ENDPOINTS.GALLERY_UPDATE(id), data);
  },
  deleteMedia: (id) => {
    apiCache.invalidateByUrlPrefix('/api/gallery');
    return apiClient.delete(API_CONFIG.ENDPOINTS.GALLERY_DELETE(id));
  },

  // Notifications
  getNotifications: () => {
    return apiClientWithCache.get(API_CONFIG.ENDPOINTS.NOTIFICATIONS);
  },
  markNotificationAsRead: (notificationId) => {
    apiCache.invalidateByUrlPrefix(API_CONFIG.ENDPOINTS.NOTIFICATIONS);
    return apiClient.patch(
      buildApiUrl(API_CONFIG.ENDPOINTS.NOTIFICATION_READ(notificationId))
    );
  },
  markAllNotificationsAsRead: () => {
    apiCache.invalidateByUrlPrefix(API_CONFIG.ENDPOINTS.NOTIFICATIONS);
    return apiClient.patch(API_CONFIG.ENDPOINTS.NOTIFICATIONS_MARK_ALL_READ);
  },
  deleteNotification: (notificationId) => {
    apiCache.invalidateByUrlPrefix(API_CONFIG.ENDPOINTS.NOTIFICATIONS);
    return apiClient.delete(
      buildApiUrl(API_CONFIG.ENDPOINTS.NOTIFICATION_DELETE(notificationId))
    );
  },
  deleteAllNotifications: () => {
    apiCache.invalidateByUrlPrefix(API_CONFIG.ENDPOINTS.NOTIFICATIONS);
    return apiClient.delete(API_CONFIG.ENDPOINTS.NOTIFICATIONS_DELETE_ALL);
  },
  getNotificationCount: () => {
    return apiClientWithCache.get(API_CONFIG.ENDPOINTS.NOTIFICATION_COUNT);
  },

  // Analytics - avec cache
  getAnalytics: () => apiClientWithCache.get(API_CONFIG.ENDPOINTS.ANALYTICS),
  
  // Blog - avec cache
  getBlogPosts: (params = {}) =>
    apiClientWithCache.get(API_CONFIG.ENDPOINTS.BLOG, { params }),
  getBlogPost: (slug, language = 'en') =>
    apiClientWithCache.get(`${API_CONFIG.ENDPOINTS.BLOG_POST(slug)}?lang=${language}`),

  // Admin endpoints
  admin: {
    // Dashboard
    getDashboard: (range) =>
      apiClient.get(`${API_CONFIG.ENDPOINTS.ADMIN.DASHBOARD}?range=${range}`),

    // Users
    getUsers: (params = {}) => apiClient.get(API_CONFIG.ENDPOINTS.ADMIN.USERS, { params }),
    getUserStats: () => apiClient.get(API_CONFIG.ENDPOINTS.ADMIN.USER_STATS),
    deleteUser: (id) =>
      apiClient.delete(API_CONFIG.ENDPOINTS.ADMIN.USER_DELETE(id)),
    updateUserStatus: (id, status) =>
      apiClient.patch(API_CONFIG.ENDPOINTS.ADMIN.USER_STATUS(id), {
        is_active: status,
      }),
    createUser: (userData) =>
      apiClient.post(API_CONFIG.ENDPOINTS.ADMIN.USER_CREATE, userData),
    updateUser: (id, userData) =>
      apiClient.put(API_CONFIG.ENDPOINTS.ADMIN.USER_UPDATE(id), userData),
    sendUserEmail: (id, emailData) =>
      apiClient.post(API_CONFIG.ENDPOINTS.ADMIN.USER_EMAIL(id), emailData),
    getPendingUsersCount: () =>
      apiClient.get(API_CONFIG.ENDPOINTS.ADMIN.PENDING_USERS_COUNT),

    // Tours
    getTours: () => apiClient.get(API_CONFIG.ENDPOINTS.ADMIN.TOURS),
    createTour: (tourData) =>
      apiClient.post(API_CONFIG.ENDPOINTS.ADMIN.TOURS, tourData),
    updateTour: (id, tourData) =>
      apiClient.put(`/api/admin/tours/${id}`, tourData),
    deleteTour: (id) =>
      apiClient.delete(API_CONFIG.ENDPOINTS.ADMIN.TOUR_DELETE(id)),
    updateTourStatus: (id, status) =>
      apiClient.patch(API_CONFIG.ENDPOINTS.ADMIN.TOUR_STATUS(id), {
        is_active: status,
      }),

    // Bookings
    getBookings: () => apiClient.get(API_CONFIG.ENDPOINTS.ADMIN.BOOKINGS),

    // Reviews
    getReviews: () => apiClient.get(API_CONFIG.ENDPOINTS.ADMIN.REVIEWS),
    getReviewStats: () =>
      apiClient.get(API_CONFIG.ENDPOINTS.ADMIN.REVIEW_STATS),
    approveReview: (id) =>
      apiClient.patch(API_CONFIG.ENDPOINTS.ADMIN.REVIEW_APPROVE(id)),
    deleteReview: (id) =>
      apiClient.delete(API_CONFIG.ENDPOINTS.ADMIN.REVIEW_DELETE(id)),

    // Security
    getPasswordResets: () =>
      apiClient.get(API_CONFIG.ENDPOINTS.ADMIN.SECURITY.PASSWORD_RESETS),
    getSecurityStats: () =>
      apiClient.get(API_CONFIG.ENDPOINTS.ADMIN.SECURITY.SECURITY_STATS),
    getSecurityLogs: () =>
      apiClient.get(API_CONFIG.ENDPOINTS.ADMIN.SECURITY.SECURITY_LOGS),
    approvePasswordReset: (id) =>
      apiClient.post(
        API_CONFIG.ENDPOINTS.ADMIN.SECURITY.PASSWORD_RESET_APPROVE(id)
      ),
    rejectPasswordReset: (id) =>
      apiClient.post(
        API_CONFIG.ENDPOINTS.ADMIN.SECURITY.PASSWORD_RESET_REJECT(id)
      ),

    // Vehicles
    getVehicles: () => apiClient.get(API_CONFIG.ENDPOINTS.ADMIN.VEHICLES),
    createVehicle: (vehicleData) =>
      apiClient.post(API_CONFIG.ENDPOINTS.ADMIN.VEHICLES, vehicleData),
    updateVehicle: (id, vehicleData) =>
      apiClient.put(API_CONFIG.ENDPOINTS.ADMIN.VEHICLE_UPDATE(id), vehicleData),
    deleteVehicle: (id) =>
      apiClient.delete(API_CONFIG.ENDPOINTS.ADMIN.VEHICLE_DELETE(id)),

    // Addons
    getAddons: () => apiClient.get(API_CONFIG.ENDPOINTS.ADMIN.ADDONS),
    createAddon: (addonData) =>
      apiClient.post(API_CONFIG.ENDPOINTS.ADMIN.ADDONS, addonData),
    updateAddon: (id, addonData) =>
      apiClient.put(API_CONFIG.ENDPOINTS.ADMIN.ADDON_UPDATE(id), addonData),
    deleteAddon: (id) =>
      apiClient.delete(API_CONFIG.ENDPOINTS.ADMIN.ADDON_DELETE(id)),

    // Notification management
    getNotifications: (filters = {}) => {
      const queryString = new URLSearchParams(filters).toString();
      return apiClientWithCache.get(`${API_CONFIG.ENDPOINTS.ADMIN.NOTIFICATIONS}${queryString ? `?${queryString}` : ''}`);
    },
    createNotification: (notificationData) => {
      apiCache.invalidateByUrlPrefix('/api/admin/notifications');
      return apiClient.post(API_CONFIG.ENDPOINTS.ADMIN.NOTIFICATIONS, notificationData);
    },
    updateNotification: (notificationId, notificationData) => {
      apiCache.invalidateByUrlPrefix('/api/admin/notifications');
      return apiClient.patch(`${API_CONFIG.ENDPOINTS.ADMIN.NOTIFICATIONS}/${notificationId}`, notificationData);
    },
    deleteNotification: (notificationId) => {
      apiCache.invalidateByUrlPrefix('/api/admin/notifications');
      return apiClient.delete(`${API_CONFIG.ENDPOINTS.ADMIN.NOTIFICATIONS}/${notificationId}`);
    },
    resendNotification: (notificationId) => {
      apiCache.invalidateByUrlPrefix('/api/admin/notifications');
      return apiClient.post(`${API_CONFIG.ENDPOINTS.ADMIN.NOTIFICATIONS}/${notificationId}/resend`);
    },

    // Email template management
    getEmailTemplates: () => apiClientWithCache.get(API_CONFIG.ENDPOINTS.ADMIN.EMAIL_TEMPLATES),
    createEmailTemplate: (templateData) => {
      apiCache.invalidateByUrlPrefix('/api/admin/email-templates');
      return apiClient.post(API_CONFIG.ENDPOINTS.ADMIN.EMAIL_TEMPLATES, templateData);
    },
    updateEmailTemplate: (templateId, templateData) => {
      apiCache.invalidateByUrlPrefix('/api/admin/email-templates');
      return apiClient.patch(`${API_CONFIG.ENDPOINTS.ADMIN.EMAIL_TEMPLATES}/${templateId}`, templateData);
    },
    deleteEmailTemplate: (templateId) => {
      apiCache.invalidateByUrlPrefix('/api/admin/email-templates');
      return apiClient.delete(`${API_CONFIG.ENDPOINTS.ADMIN.EMAIL_TEMPLATES}/${templateId}`);
    },
    previewEmailTemplate: (templateId, data = {}) => {
      return apiClient.post(`${API_CONFIG.ENDPOINTS.ADMIN.EMAIL_TEMPLATES}/${templateId}/preview`, data);
    },
  },
};

// Hook personnalisé pour les appels API avec gestion d'état
export const useApiCall = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const makeApiCall = async (apiFunction, ...args) => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiFunction(...args);
      return response.data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { makeApiCall, loading, error };
};

// Exporter l'instance apiClient avec cache pour une utilisation directe
export default apiClientWithCache;
