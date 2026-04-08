import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCheckCircle,
  faExclamationTriangle,
  faInfoCircle,
  faTimes,
  faTimesCircle,
} from '@fortawesome/free-solid-svg-icons';

// Types de notifications
export const TOAST_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
};

// Configuration des styles pour chaque type
const toastConfig = {
  [TOAST_TYPES.SUCCESS]: {
    icon: faCheckCircle,
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    iconColor: 'text-green-500',
    titleColor: 'text-green-800',
    messageColor: 'text-green-700',
    progressColor: 'bg-green-500',
  },
  [TOAST_TYPES.ERROR]: {
    icon: faTimesCircle,
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    iconColor: 'text-red-500',
    titleColor: 'text-red-800',
    messageColor: 'text-red-700',
    progressColor: 'bg-red-500',
  },
  [TOAST_TYPES.WARNING]: {
    icon: faExclamationTriangle,
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    iconColor: 'text-yellow-500',
    titleColor: 'text-yellow-800',
    messageColor: 'text-yellow-700',
    progressColor: 'bg-yellow-500',
  },
  [TOAST_TYPES.INFO]: {
    icon: faInfoCircle,
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    iconColor: 'text-blue-500',
    titleColor: 'text-blue-800',
    messageColor: 'text-blue-700',
    progressColor: 'bg-blue-500',
  },
};

// Composant Toast individuel
const Toast = ({ 
  id, 
  type = TOAST_TYPES.INFO, 
  title, 
  message, 
  duration = 5000, 
  onClose,
  showProgress = true,
  position = 'top-right'
}) => {
  const config = toastConfig[type];
  const [progress, setProgress] = React.useState(100);
  const [isVisible, setIsVisible] = React.useState(true);
  const timerRef = React.useRef(null);
  const progressTimerRef = React.useRef(null);

  React.useEffect(() => {
    if (duration > 0) {
      // Timer pour fermer automatiquement
      timerRef.current = setTimeout(() => {
        handleClose();
      }, duration);

      // Timer pour la barre de progression
      if (showProgress) {
        const interval = 50; // Mise à jour toutes les 50ms
        const step = (interval / duration) * 100;
        
        progressTimerRef.current = setInterval(() => {
          setProgress(prev => {
            const newProgress = prev - step;
            return newProgress <= 0 ? 0 : newProgress;
          });
        }, interval);
      }
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    };
  }, [duration, showProgress]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose(id), 300); // Délai pour l'animation
  };

  const handleMouseEnter = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (progressTimerRef.current) clearInterval(progressTimerRef.current);
  };

  const handleMouseLeave = () => {
    if (duration > 0) {
      const remainingTime = (progress / 100) * duration;
      timerRef.current = setTimeout(handleClose, remainingTime);
      
      if (showProgress) {
        const interval = 50;
        const step = (interval / remainingTime) * progress;
        
        progressTimerRef.current = setInterval(() => {
          setProgress(prev => {
            const newProgress = prev - step;
            return newProgress <= 0 ? 0 : newProgress;
          });
        }, interval);
      }
    }
  };

  const getPositionClasses = () => {
    switch (position) {
      case 'top-left':
        return 'top-4 left-4';
      case 'top-center':
        return 'top-4 left-1/2 transform -translate-x-1/2';
      case 'top-right':
        return 'top-4 right-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'bottom-center':
        return 'bottom-4 left-1/2 transform -translate-x-1/2';
      case 'bottom-right':
        return 'bottom-4 right-4';
      default:
        return 'top-4 right-4';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: position.includes('right') ? 100 : -100, scale: 0.8 }}
      animate={{ 
        opacity: isVisible ? 1 : 0, 
        x: isVisible ? 0 : (position.includes('right') ? 100 : -100),
        scale: isVisible ? 1 : 0.8
      }}
      exit={{ opacity: 0, x: position.includes('right') ? 100 : -100, scale: 0.8 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`fixed ${getPositionClasses()} z-50 max-w-sm w-full`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className={`
        ${config.bgColor} ${config.borderColor} 
        border rounded-lg shadow-lg backdrop-blur-sm
        p-4 relative overflow-hidden
      `}>
        {/* Contenu principal */}
        <div className="flex items-start space-x-3">
          <div className={`flex-shrink-0 ${config.iconColor}`}>
            <FontAwesomeIcon icon={config.icon} className="text-lg" />
          </div>
          
          <div className="flex-1 min-w-0">
            {title && (
              <h4 className={`text-sm font-semibold ${config.titleColor} mb-1`}>
                {title}
              </h4>
            )}
            {message && (
              <p className={`text-sm ${config.messageColor} leading-relaxed`}>
                {message}
              </p>
            )}
          </div>
          
          <button
            onClick={handleClose}
            className={`flex-shrink-0 ${config.iconColor} hover:opacity-70 transition-opacity`}
          >
            <FontAwesomeIcon icon={faTimes} className="text-sm" />
          </button>
        </div>
        
        {/* Barre de progression */}
        {showProgress && duration > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black bg-opacity-10">
            <motion.div
              className={`h-full ${config.progressColor}`}
              style={{ width: `${progress}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>
        )}
      </div>
    </motion.div>
  );
};

// Conteneur pour gérer plusieurs toasts
const ToastContainer = ({ toasts, position = 'top-right', onRemove }) => {
  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      <AnimatePresence>
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            {...toast}
            position={position}
            onClose={onRemove}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

// Hook pour gérer les toasts
export const useToast = () => {
  const [toasts, setToasts] = React.useState([]);

  const addToast = React.useCallback((toast) => {
    const id = Date.now() + Math.random();
    const newToast = { id, ...toast };
    
    setToasts(prev => [...prev, newToast]);
    
    return id;
  }, []);

  const removeToast = React.useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const clearAllToasts = React.useCallback(() => {
    setToasts([]);
  }, []);

  // Méthodes de convenance
  const success = React.useCallback((message, options = {}) => {
    return addToast({ 
      type: TOAST_TYPES.SUCCESS, 
      message, 
      title: options.title || 'Success',
      ...options 
    });
  }, [addToast]);

  const error = React.useCallback((message, options = {}) => {
    return addToast({ 
      type: TOAST_TYPES.ERROR, 
      message, 
      title: options.title || 'Error',
      duration: options.duration || 7000, // Plus long pour les erreurs
      ...options 
    });
  }, [addToast]);

  const warning = React.useCallback((message, options = {}) => {
    return addToast({ 
      type: TOAST_TYPES.WARNING, 
      message, 
      title: options.title || 'Warning',
      ...options 
    });
  }, [addToast]);

  const info = React.useCallback((message, options = {}) => {
    return addToast({ 
      type: TOAST_TYPES.INFO, 
      message, 
      title: options.title || 'Info',
      ...options 
    });
  }, [addToast]);

  return {
    toasts,
    addToast,
    removeToast,
    clearAllToasts,
    success,
    error,
    warning,
    info,
  };
};

export { Toast, ToastContainer };
export default ToastContainer;