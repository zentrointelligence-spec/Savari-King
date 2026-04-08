import axios from "axios";
import API_CONFIG from "../config/api";

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

// Instance axios configurée
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

// Intercepteur pour ajouter le token et gérer le cache
apiClient.interceptors.request.use(
  (config) => {
    // Ajouter le token d'authentification
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Vérifier si la requête peut être mise en cache
    const isGetRequest = config.method === 'get' || !config.method;
    const url = config.url;
    
    // Vérifier si l'URL est dans la liste des endpoints à ne jamais mettre en cache
    const shouldNeverCache = cacheConfig.neverCache.some(endpoint => url.includes(endpoint));
    
    if (shouldNeverCache) {
      config.useCache = false;
      return config;
    }
    
    // Vérifier si l'URL est dans la liste des endpoints pouvant être mis en cache
    const isCacheable = isGetRequest && cacheConfig.cacheable.some(endpoint => url.includes(endpoint));
    
    // Déterminer la durée de vie du cache pour cette URL
    let ttl = cacheConfig.defaultTtl;
    for (const [endpoint, endpointTtl] of Object.entries(cacheConfig.ttl)) {
      if (url.includes(endpoint)) {
        ttl = endpointTtl;
        break;
      }
    }
    
    // Configurer le cache pour cette requête
    config.useCache = isCacheable;
    config.cacheTtl = ttl;
    
    // Si la requête est en cache et valide, on ajoute un flag pour l'intercepteur de réponse
    if (isCacheable && apiCache.has(config)) {
      config.fromCache = true;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer le cache et les erreurs de réponse
apiClient.interceptors.response.use(
  (response) => {
    const config = response.config;
    
    // Si la requête est cacheable, on la met en cache
    if (config.useCache) {
      apiCache.set(config, response, config.cacheTtl);
    }
    
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expiré ou invalide
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Créer un wrapper autour d'axios pour utiliser le cache
const apiClientWithCache = {
  request: (config) => {
    // Si la requête est en cache et valide, on retourne la réponse du cache
    if (config.useCache && apiCache.has(config)) {
      return Promise.resolve(apiCache.get(config));
    }
    
    // Sinon, on fait la requête normalement
    return apiClient.request(config);
  },
  get: (url, config = {}) => {
    return apiClientWithCache.request({ ...config, url, method: 'get' });
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

// Fonctions utilitaires pour les appels API avec cache
export const api = {
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
  getTour: (id) => apiClientWithCache.get(API_CONFIG.ENDPOINTS.TOUR_DETAIL(id)),

  // Gallery - avec cache
  getGallery: (params = {}) =>
    apiClientWithCache.get(API_CONFIG.ENDPOINTS.GALLERY, { params }),

  // Notifications
  getNotifications: () => apiClientWithCache.get(API_CONFIG.ENDPOINTS.NOTIFICATIONS),
  markNotificationRead: (id) => {
    apiCache.invalidateByUrlPrefix(API_CONFIG.ENDPOINTS.NOTIFICATIONS);
    return apiClient.patch(API_CONFIG.ENDPOINTS.NOTIFICATION_READ(id));
  },
  markAllNotificationsRead: () => {
    apiCache.invalidateByUrlPrefix(API_CONFIG.ENDPOINTS.NOTIFICATIONS);
    return apiClient.patch(API_CONFIG.ENDPOINTS.NOTIFICATIONS_MARK_ALL_READ);
  },
  deleteNotification: (id) => {
    apiCache.invalidateByUrlPrefix(API_CONFIG.ENDPOINTS.NOTIFICATIONS);
    return apiClient.delete(API_CONFIG.ENDPOINTS.NOTIFICATION_DELETE(id));
  },
  deleteAllNotifications: () => {
    apiCache.invalidateByUrlPrefix(API_CONFIG.ENDPOINTS.NOTIFICATIONS);
    return apiClient.delete(API_CONFIG.ENDPOINTS.NOTIFICATIONS);
  },

  // Bookings
  updateBookingStatus: (id, status) => {
    apiCache.invalidateByUrlPrefix('/api/bookings');
    return apiClient.patch(API_CONFIG.ENDPOINTS.BOOKING_STATUS(id), {
      newStatus: status,
    });
  },

  // Analytics - avec cache
  getAnalytics: () => apiClientWithCache.get(API_CONFIG.ENDPOINTS.ANALYTICS),
  
  // Blog - avec cache
  getBlogPosts: (params = {}) => apiClientWithCache.get(API_CONFIG.ENDPOINTS.BLOG, { params }),
  getBlogPost: (slug) => apiClientWithCache.get(API_CONFIG.ENDPOINTS.BLOG_POST(slug)),

  // Admin endpoints
  admin: {
    // Dashboard
    getDashboard: (range) =>
      apiClient.get(`${API_CONFIG.ENDPOINTS.ADMIN.DASHBOARD}?range=${range}`),

    // Users
    getUsers: () => apiClient.get(API_CONFIG.ENDPOINTS.ADMIN.USERS),
    getUserStats: () => apiClient.get(API_CONFIG.ENDPOINTS.ADMIN.USER_STATS),
    deleteUser: (id) =>
      apiClient.delete(API_CONFIG.ENDPOINTS.ADMIN.USER_DELETE(id)),
    updateUserStatus: (id, status) =>
      apiClient.patch(API_CONFIG.ENDPOINTS.ADMIN.USER_STATUS(id), {
        is_active: status,
      }),

    // Tours
    getTours: () => apiClient.get(API_CONFIG.ENDPOINTS.ADMIN.TOURS),
    createTour: (tourData) =>
      apiClient.post(API_CONFIG.ENDPOINTS.ADMIN.TOURS, tourData),
    updateTour: (id, tourData) =>
      apiClient.put(
        API_CONFIG.ENDPOINTS.ADMIN.TOUR_UPDATE?.(id) ||
          `/api/admin/tours/${id}`,
        tourData
      ),
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

    // Admin Notifications
    getAdminNotifications: () => apiClient.get(API_CONFIG.ENDPOINTS.ADMIN.NOTIFICATIONS),
    createAdminNotification: (notificationData) =>
      apiClient.post(API_CONFIG.ENDPOINTS.ADMIN.NOTIFICATION_CREATE, notificationData),
    updateAdminNotification: (id, notificationData) =>
      apiClient.put(API_CONFIG.ENDPOINTS.ADMIN.NOTIFICATION_UPDATE(id), notificationData),
    deleteAdminNotification: (id) =>
      apiClient.delete(API_CONFIG.ENDPOINTS.ADMIN.NOTIFICATION_DELETE(id)),
    resendNotification: (id) =>
      apiClient.post(API_CONFIG.ENDPOINTS.ADMIN.NOTIFICATION_RESEND(id)),

    // Email Templates
    getEmailTemplates: () => apiClient.get(API_CONFIG.ENDPOINTS.ADMIN.EMAIL_TEMPLATES),
    createEmailTemplate: (templateData) =>
      apiClient.post(API_CONFIG.ENDPOINTS.ADMIN.EMAIL_TEMPLATE_CREATE, templateData),
    updateEmailTemplate: (id, templateData) =>
      apiClient.put(API_CONFIG.ENDPOINTS.ADMIN.EMAIL_TEMPLATE_UPDATE(id), templateData),
    deleteEmailTemplate: (id) =>
      apiClient.delete(API_CONFIG.ENDPOINTS.ADMIN.EMAIL_TEMPLATE_DELETE(id)),
    previewEmailTemplate: (id) =>
      apiClient.get(API_CONFIG.ENDPOINTS.ADMIN.EMAIL_TEMPLATE_PREVIEW(id))
  },
};

// Exporter l'instance apiClient avec cache pour une utilisation directe
export default apiClientWithCache;
