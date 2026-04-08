import { useState, useEffect } from 'react';

/**
 * Hook personnalisé pour debouncer une valeur
 * Utile pour limiter le nombre d'appels API lors de la saisie utilisateur
 * 
 * @param {any} value - La valeur à debouncer
 * @param {number} delay - Le délai en millisecondes (défaut: 300ms)
 * @returns {any} La valeur debouncée
 */
export const useDebounce = (value, delay = 300) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Créer un timer qui met à jour la valeur debouncée après le délai
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Nettoyer le timer si la valeur change avant la fin du délai
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
};

/**
 * Hook personnalisé pour debouncer une fonction
 * Utile pour limiter l'exécution d'une fonction coûteuse
 * 
 * @param {Function} func - La fonction à debouncer
 * @param {number} delay - Le délai en millisecondes (défaut: 300ms)
 * @param {Array} deps - Les dépendances de la fonction (optionnel)
 * @returns {Function} La fonction debouncée
 */
export const useDebouncedCallback = (func, delay = 300, deps = []) => {
  const [debouncedFunc, setDebouncedFunc] = useState(() => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  });

  useEffect(() => {
    let timeoutId;
    const newDebouncedFunc = (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
    setDebouncedFunc(() => newDebouncedFunc);

    return () => clearTimeout(timeoutId);
  }, [func, delay, ...deps]);

  return debouncedFunc;
};

/**
 * Hook personnalisé pour debouncer plusieurs valeurs
 * Utile quand on a plusieurs champs de formulaire à debouncer
 * 
 * @param {Object} values - Un objet contenant les valeurs à debouncer
 * @param {number} delay - Le délai en millisecondes (défaut: 300ms)
 * @returns {Object} Un objet contenant les valeurs debouncées
 */
export const useDebounceObject = (values, delay = 300) => {
  const [debouncedValues, setDebouncedValues] = useState(values);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValues(values);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [values, delay]);

  return debouncedValues;
};

/**
 * Hook personnalisé pour debouncer avec contrôle manuel
 * Permet d'annuler ou de forcer l'exécution du debounce
 * 
 * @param {any} value - La valeur à debouncer
 * @param {number} delay - Le délai en millisecondes (défaut: 300ms)
 * @returns {Object} Un objet avec la valeur debouncée et les fonctions de contrôle
 */
export const useControlledDebounce = (value, delay = 300) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  const [timeoutId, setTimeoutId] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
      setTimeoutId(null);
    }, delay);

    setTimeoutId(timer);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  // Fonction pour annuler le debounce
  const cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
  };

  // Fonction pour forcer l'exécution immédiate
  const flush = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
    setDebouncedValue(value);
  };

  // Fonction pour vérifier si le debounce est en cours
  const isPending = () => timeoutId !== null;

  return {
    debouncedValue,
    cancel,
    flush,
    isPending
  };
};

/**
 * Hook personnalisé pour debouncer avec état de chargement
 * Utile pour afficher un indicateur de chargement pendant le debounce
 * 
 * @param {any} value - La valeur à debouncer
 * @param {number} delay - Le délai en millisecondes (défaut: 300ms)
 * @returns {Object} Un objet avec la valeur debouncée et l'état de chargement
 */
export const useDebounceWithLoading = (value, delay = 300) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    
    const timer = setTimeout(() => {
      setDebouncedValue(value);
      setIsLoading(false);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return {
    debouncedValue,
    isLoading
  };
};

export default useDebounce;