import { useState, useCallback, useRef, useEffect } from 'react';

// Types de toast disponibles
export const TOAST_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

// Positions disponibles pour les toasts
export const TOAST_POSITIONS = {
  TOP_RIGHT: 'top-right',
  TOP_LEFT: 'top-left',
  TOP_CENTER: 'top-center',
  BOTTOM_RIGHT: 'bottom-right',
  BOTTOM_LEFT: 'bottom-left',
  BOTTOM_CENTER: 'bottom-center'
};

// Configuration par défaut
const DEFAULT_CONFIG = {
  duration: 5000,
  position: TOAST_POSITIONS.TOP_RIGHT,
  maxToasts: 5,
  pauseOnHover: true,
  closeOnClick: true,
  showProgress: true,
  animation: true
};

// Générateur d'ID unique
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Hook principal useToast
export const useToast = (config = {}) => {
  const [toasts, setToasts] = useState([]);
  const timersRef = useRef(new Map());
  const configRef = useRef({ ...DEFAULT_CONFIG, ...config });

  // Nettoyer les timers lors du démontage
  useEffect(() => {
    return () => {
      timersRef.current.forEach(timer => clearTimeout(timer));
      timersRef.current.clear();
    };
  }, []);

  // Fonction pour supprimer un toast
  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
    
    // Nettoyer le timer associé
    if (timersRef.current.has(id)) {
      clearTimeout(timersRef.current.get(id));
      timersRef.current.delete(id);
    }
  }, []);

  // Fonction pour ajouter un toast
  const addToast = useCallback((message, type = TOAST_TYPES.INFO, options = {}) => {
    const id = generateId();
    const toastConfig = { ...configRef.current, ...options };
    
    const newToast = {
      id,
      message,
      type,
      timestamp: Date.now(),
      duration: toastConfig.duration,
      pauseOnHover: toastConfig.pauseOnHover,
      closeOnClick: toastConfig.closeOnClick,
      showProgress: toastConfig.showProgress,
      animation: toastConfig.animation,
      ...options
    };

    setToasts(prev => {
      const updated = [...prev, newToast];
      // Limiter le nombre de toasts affichés
      if (updated.length > toastConfig.maxToasts) {
        const toRemove = updated.slice(0, updated.length - toastConfig.maxToasts);
        toRemove.forEach(toast => {
          if (timersRef.current.has(toast.id)) {
            clearTimeout(timersRef.current.get(toast.id));
            timersRef.current.delete(toast.id);
          }
        });
        return updated.slice(-toastConfig.maxToasts);
      }
      return updated;
    });

    // Programmer la suppression automatique
    if (toastConfig.duration > 0) {
      const timer = setTimeout(() => {
        removeToast(id);
      }, toastConfig.duration);
      
      timersRef.current.set(id, timer);
    }

    return id;
  }, [removeToast]);

  // Fonctions de convenance pour chaque type
  const success = useCallback((message, options = {}) => {
    return addToast(message, TOAST_TYPES.SUCCESS, options);
  }, [addToast]);

  const error = useCallback((message, options = {}) => {
    return addToast(message, TOAST_TYPES.ERROR, {
      duration: 7000, // Les erreurs restent plus longtemps
      ...options
    });
  }, [addToast]);

  const warning = useCallback((message, options = {}) => {
    return addToast(message, TOAST_TYPES.WARNING, options);
  }, [addToast]);

  const info = useCallback((message, options = {}) => {
    return addToast(message, TOAST_TYPES.INFO, options);
  }, [addToast]);

  // Fonction pour mettre en pause/reprendre un toast
  const pauseToast = useCallback((id) => {
    if (timersRef.current.has(id)) {
      clearTimeout(timersRef.current.get(id));
      timersRef.current.delete(id);
    }
  }, []);

  const resumeToast = useCallback((id, remainingTime) => {
    if (remainingTime > 0) {
      const timer = setTimeout(() => {
        removeToast(id);
      }, remainingTime);
      
      timersRef.current.set(id, timer);
    }
  }, [removeToast]);

  // Fonction pour supprimer tous les toasts
  const clearAll = useCallback(() => {
    timersRef.current.forEach(timer => clearTimeout(timer));
    timersRef.current.clear();
    setToasts([]);
  }, []);

  // Fonction pour mettre à jour la configuration
  const updateConfig = useCallback((newConfig) => {
    configRef.current = { ...configRef.current, ...newConfig };
  }, []);

  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    warning,
    info,
    pauseToast,
    resumeToast,
    clearAll,
    updateConfig,
    config: configRef.current
  };
};

// Hook pour les notifications de l'API
export const useApiToast = () => {
  const toast = useToast();

  const handleApiSuccess = useCallback((message = 'Operation completed successfully') => {
    return toast.success(message);
  }, [toast]);

  const handleApiError = useCallback((error, defaultMessage = 'An error occurred') => {
    let message = defaultMessage;
    
    if (error?.response?.data?.message) {
      message = error.response.data.message;
    } else if (error?.message) {
      message = error.message;
    } else if (typeof error === 'string') {
      message = error;
    }
    
    return toast.error(message, { duration: 8000 });
  }, [toast]);

  const handleApiWarning = useCallback((message = 'Please check your input') => {
    return toast.warning(message);
  }, [toast]);

  const handleApiInfo = useCallback((message) => {
    return toast.info(message);
  }, [toast]);

  return {
    ...toast,
    handleApiSuccess,
    handleApiError,
    handleApiWarning,
    handleApiInfo
  };
};

// Hook pour les notifications de formulaire
export const useFormToast = () => {
  const toast = useToast();

  const handleValidationError = useCallback((errors) => {
    if (Array.isArray(errors)) {
      errors.forEach(error => {
        toast.error(error, { duration: 6000 });
      });
    } else if (typeof errors === 'object') {
      Object.values(errors).forEach(error => {
        if (typeof error === 'string') {
          toast.error(error, { duration: 6000 });
        } else if (Array.isArray(error)) {
          error.forEach(err => toast.error(err, { duration: 6000 }));
        }
      });
    } else {
      toast.error(errors || 'Please check your form inputs', { duration: 6000 });
    }
  }, [toast]);

  const handleFormSuccess = useCallback((message = 'Form submitted successfully') => {
    return toast.success(message);
  }, [toast]);

  const handleFormSaved = useCallback((message = 'Changes saved successfully') => {
    return toast.success(message, { duration: 3000 });
  }, [toast]);

  return {
    ...toast,
    handleValidationError,
    handleFormSuccess,
    handleFormSaved
  };
};

// Hook pour les notifications de booking
export const useBookingToast = () => {
  const toast = useToast();

  const handleBookingSuccess = useCallback((bookingId) => {
    return toast.success(
      `Booking confirmed! Your booking ID is ${bookingId}`,
      { duration: 8000 }
    );
  }, [toast]);

  const handleBookingPending = useCallback(() => {
    return toast.info(
      'Your booking is being processed. You will receive a confirmation email shortly.',
      { duration: 6000 }
    );
  }, [toast]);

  const handleBookingCancelled = useCallback(() => {
    return toast.warning(
      'Your booking has been cancelled. Refund will be processed within 3-5 business days.',
      { duration: 8000 }
    );
  }, [toast]);

  const handlePaymentError = useCallback((error) => {
    return toast.error(
      error || 'Payment failed. Please try again or use a different payment method.',
      { duration: 10000 }
    );
  }, [toast]);

  return {
    ...toast,
    handleBookingSuccess,
    handleBookingPending,
    handleBookingCancelled,
    handlePaymentError
  };
};

// Context Provider pour partager les toasts globalement
import React, { createContext, useContext } from 'react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children, config = {} }) => {
  const toast = useToast(config);
  
  return (
    <ToastContext.Provider value={toast}>
      {children}
    </ToastContext.Provider>
  );
};

export const useGlobalToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useGlobalToast must be used within a ToastProvider');
  }
  return context;
};

export default useToast;