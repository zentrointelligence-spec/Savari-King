import { useState, useEffect } from "react";
import { useInView } from "react-intersection-observer";

/**
 * Hook pour gérer les animations d'apparition au scroll avec Intersection Observer
 * @param {object} options - Options pour l'intersection observer
 * @param {number} delay - Délai avant l'animation (ms)
 * @returns {object} - Ref, état inView et propriétés d'animation
 */
export const useIntersectionAnimation = (options = {}, delay = 0) => {
  const [hasAnimated, setHasAnimated] = useState(false);
  const [shouldAnimate, setShouldAnimate] = useState(false);

  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
    ...options,
  });

  useEffect(() => {
    if (inView && !hasAnimated) {
      const timer = setTimeout(() => {
        setShouldAnimate(true);
        setHasAnimated(true);
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [inView, hasAnimated, delay]);

  return {
    ref,
    inView,
    shouldAnimate,
    hasAnimated,
    animationProps: {
      initial: { opacity: 0, y: 50, scale: 0.9 },
      animate: shouldAnimate
        ? { opacity: 1, y: 0, scale: 1 }
        : { opacity: 0, y: 50, scale: 0.9 },
      transition: {
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94],
        delay: delay / 1000,
      },
    },
  };
};

/**
 * Hook pour animations séquentielles d'une liste d'éléments
 * @param {number} itemCount - Nombre d'éléments
 * @param {number} staggerDelay - Délai entre chaque élément (ms)
 * @returns {object} - Fonctions et états pour l'animation séquentielle
 */
export const useStaggeredAnimation = (itemCount, staggerDelay = 100) => {
  const [animatedItems, setAnimatedItems] = useState(new Set());
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  useEffect(() => {
    if (inView) {
      for (let i = 0; i < itemCount; i++) {
        setTimeout(() => {
          setAnimatedItems((prev) => new Set([...prev, i]));
        }, i * staggerDelay);
      }
    }
  }, [inView, itemCount, staggerDelay]);

  const getItemAnimation = (index) => ({
    initial: { opacity: 0, y: 30, scale: 0.95 },
    animate: animatedItems.has(index)
      ? { opacity: 1, y: 0, scale: 1 }
      : { opacity: 0, y: 30, scale: 0.95 },
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  });

  return {
    ref,
    inView,
    animatedItems,
    getItemAnimation,
  };
};
