/**
 * Utilitaires pour optimiser les animations et transitions
 * Ce fichier contient des fonctions et des hooks pour améliorer les performances des animations
 */

import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Hook pour optimiser les animations en utilisant requestAnimationFrame
 * @param {Function} callback - La fonction d'animation à exécuter
 * @param {Array} dependencies - Les dépendances qui déclenchent l'animation
 * @param {Object} options - Options supplémentaires
 * @param {number} options.duration - Durée de l'animation en ms
 * @param {Function} options.easing - Fonction d'easing (par défaut: linéaire)
 */
export const useOptimizedAnimation = (callback, dependencies = [], options = {}) => {
  const {
    duration = 300,
    easing = t => t, // Fonction d'easing linéaire par défaut
  } = options;
  
  const requestRef = useRef();
  const startTimeRef = useRef();
  const previousTimeRef = useRef();
  
  const animate = useCallback(time => {
    if (startTimeRef.current === undefined) {
      startTimeRef.current = time;
    }
    
    const elapsed = time - startTimeRef.current;
    const progress = Math.min(elapsed / duration, 1);
    const easedProgress = easing(progress);
    
    // Exécuter le callback avec le progrès de l'animation
    callback(easedProgress, elapsed);
    
    previousTimeRef.current = time;
    
    // Continuer l'animation si elle n'est pas terminée
    if (progress < 1) {
      requestRef.current = requestAnimationFrame(animate);
    }
  }, [callback, duration, easing]);
  
  useEffect(() => {
    // Démarrer l'animation
    requestRef.current = requestAnimationFrame(animate);
    
    // Nettoyer l'animation lors du démontage
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, dependencies); // eslint-disable-line react-hooks/exhaustive-deps
};

/**
 * Hook pour créer des transitions fluides entre les états
 * @param {any} value - La valeur à animer
 * @param {Object} options - Options de configuration
 * @param {number} options.duration - Durée de la transition en ms
 * @param {Function} options.easing - Fonction d'easing
 * @returns {any} La valeur animée
 */
export const useTransition = (value, options = {}) => {
  const {
    duration = 300,
    easing = t => t,
  } = options;
  
  const [animatedValue, setAnimatedValue] = useState(value);
  const valueRef = useRef(value);
  const startValueRef = useRef(value);
  
  useEffect(() => {
    let startTime;
    let animationFrame;
    
    if (value !== valueRef.current) {
      startValueRef.current = animatedValue;
      valueRef.current = value;
      
      const animate = timestamp => {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = easing(progress);
        
        // Interpoler entre la valeur de départ et la valeur cible
        const newValue = interpolate(startValueRef.current, value, easedProgress);
        setAnimatedValue(newValue);
        
        if (progress < 1) {
          animationFrame = requestAnimationFrame(animate);
        }
      };
      
      animationFrame = requestAnimationFrame(animate);
    }
    
    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [value, duration, easing]);
  
  return animatedValue;
};

/**
 * Fonction pour interpoler entre deux valeurs
 * @param {any} start - Valeur de départ
 * @param {any} end - Valeur finale
 * @param {number} progress - Progression (0-1)
 * @returns {any} Valeur interpolée
 */
const interpolate = (start, end, progress) => {
  // Si les valeurs sont des nombres
  if (typeof start === 'number' && typeof end === 'number') {
    return start + (end - start) * progress;
  }
  
  // Si les valeurs sont des tableaux (ex: coordonnées)
  if (Array.isArray(start) && Array.isArray(end)) {
    return start.map((s, i) => s + (end[i] - s) * progress);
  }
  
  // Si les valeurs sont des objets (ex: styles)
  if (typeof start === 'object' && start !== null && typeof end === 'object' && end !== null) {
    const result = {};
    const keys = new Set([...Object.keys(start), ...Object.keys(end)]);
    
    keys.forEach(key => {
      if (key in start && key in end) {
        result[key] = interpolate(start[key], end[key], progress);
      } else if (key in end) {
        result[key] = end[key];
      } else {
        result[key] = start[key];
      }
    });
    
    return result;
  }
  
  // Pour les autres types, retourner la valeur finale si la progression > 0.5
  return progress > 0.5 ? end : start;
};

/**
 * Fonctions d'easing pour les animations
 */
export const easings = {
  // Linéaire
  linear: t => t,
  
  // Ease-in
  easeInQuad: t => t * t,
  easeInCubic: t => t * t * t,
  easeInQuart: t => t * t * t * t,
  
  // Ease-out
  easeOutQuad: t => 1 - (1 - t) * (1 - t),
  easeOutCubic: t => 1 - Math.pow(1 - t, 3),
  easeOutQuart: t => 1 - Math.pow(1 - t, 4),
  
  // Ease-in-out
  easeInOutQuad: t => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2,
  easeInOutCubic: t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
  easeInOutQuart: t => t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2,
};

/**
 * Hook pour détecter si un élément est visible dans le viewport
 * Utilise IntersectionObserver pour des performances optimales
 * @param {Object} options - Options pour l'IntersectionObserver
 * @returns {Array} [ref, isVisible] - Référence à attacher à l'élément et état de visibilité
 */
export const useInView = (options = {}) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setIsVisible(entry.isIntersecting);
    }, options);
    
    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }
    
    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [options]);
  
  return [ref, isVisible];
};

/**
 * Composant pour retarder le rendu d'un élément jusqu'à ce qu'il soit nécessaire
 * Utile pour les éléments qui ne sont pas immédiatement visibles
 */
export const LazyRender = ({ children, threshold = 0 }) => {
  const [ref, isVisible] = useInView({ threshold });
  const [shouldRender, setShouldRender] = useState(false);
  
  useEffect(() => {
    if (isVisible && !shouldRender) {
      setShouldRender(true);
    }
  }, [isVisible, shouldRender]);
  
  return (
    <div ref={ref}>
      {shouldRender ? children : null}
    </div>
  );
};

/**
 * Optimise les animations CSS en forçant l'utilisation de l'accélération matérielle
 * @param {Object} styles - Styles CSS de base
 * @returns {Object} Styles optimisés
 */
export const optimizeAnimationStyles = (styles = {}) => {
  return {
    ...styles,
    willChange: 'transform, opacity',
    transform: `translateZ(0) ${styles.transform || ''}`.trim(),
  };
};

/**
 * Limite le taux de rafraîchissement des animations pour les appareils à faible puissance
 * @param {Function} callback - Fonction à exécuter
 * @param {number} fps - Images par seconde cible (par défaut: 60)
 * @returns {Function} Fonction limitée
 */
export const limitAnimationFrameRate = (callback, fps = 60) => {
  const interval = 1000 / fps;
  let lastTime = 0;
  
  return (timestamp) => {
    if (timestamp - lastTime >= interval) {
      lastTime = timestamp;
      callback(timestamp);
    }
  };
};