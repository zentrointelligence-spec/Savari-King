import React, { memo, useMemo, useCallback } from "react";
import { useIntersectionObserver } from "react-intersection-observer";

/**
 * Composant optimisé pour le lazy loading des images
 */
const LazyImage = memo(({ src, alt, className, onLoad, ...props }) => {
  const { ref, inView } = useIntersectionObserver({
    threshold: 0.1,
    triggerOnce: true,
    rootMargin: "50px",
  });

  const handleLoad = useCallback(() => {
    if (onLoad) onLoad();
  }, [onLoad]);

  return (
    <div ref={ref} className={className}>
      {inView ? (
        <img
          src={src}
          alt={alt}
          onLoad={handleLoad}
          loading="lazy"
          decoding="async"
          {...props}
        />
      ) : (
        <div className="w-full h-64 bg-gray-200 animate-pulse rounded-lg flex items-center justify-center">
          <div className="text-gray-400">📷</div>
        </div>
      )}
    </div>
  );
});

LazyImage.displayName = "LazyImage";

/**
 * Hook pour optimiser les performances de rendu
 */
export const usePerformanceOptimization = (items = [], options = {}) => {
  const {
    chunkSize = 20,
    enableVirtualization = false,
    preloadCount = 5,
  } = options;

  // Chunking pour éviter le rendu de trop d'éléments à la fois
  const chunkedItems = useMemo(() => {
    if (!enableVirtualization) return [items];

    const chunks = [];
    for (let i = 0; i < items.length; i += chunkSize) {
      chunks.push(items.slice(i, i + chunkSize));
    }
    return chunks;
  }, [items, chunkSize, enableVirtualization]);

  // Préchargement intelligent des images
  const preloadImages = useCallback(
    (imageUrls) => {
      const preloadPromises = imageUrls.slice(0, preloadCount).map((url) => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = resolve;
          img.onerror = reject;
          img.src = url;
        });
      });

      return Promise.allSettled(preloadPromises);
    },
    [preloadCount]
  );

  return {
    chunkedItems,
    preloadImages,
    LazyImage,
  };
};

/**
 * Composant pour optimiser les animations selon les préférences utilisateur
 */
export const AnimationWrapper = memo(({ children, reduceMotion = false }) => {
  const prefersReducedMotion = useMemo(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  const shouldReduceMotion = reduceMotion || prefersReducedMotion;

  return (
    <div
      className={shouldReduceMotion ? "motion-reduce" : ""}
      style={{
        "--animation-duration": shouldReduceMotion ? "0s" : "0.3s",
        "--transition-duration": shouldReduceMotion ? "0s" : "0.3s",
      }}
    >
      {children}
    </div>
  );
});

AnimationWrapper.displayName = "AnimationWrapper";

/**
 * Hook pour détecter les capacités de l'appareil
 */
export const useDeviceCapabilities = () => {
  const capabilities = useMemo(() => {
    if (typeof window === "undefined") {
      return {
        isLowEnd: false,
        supportsWebP: false,
        supportsAVIF: false,
        hasTouch: false,
        connectionSpeed: "fast",
      };
    }

    // Détection des capacités de l'appareil
    const isLowEnd =
      navigator.hardwareConcurrency <= 2 || navigator.deviceMemory <= 2;

    const hasTouch = "ontouchstart" in window;

    const connection =
      navigator.connection ||
      navigator.mozConnection ||
      navigator.webkitConnection;
    const connectionSpeed = connection
      ? connection.effectiveType === "4g"
        ? "fast"
        : connection.effectiveType === "3g"
        ? "medium"
        : "slow"
      : "fast";

    // Test de support des formats d'image modernes
    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;

    const supportsWebP =
      canvas.toDataURL("image/webp").indexOf("data:image/webp") === 0;
    const supportsAVIF =
      canvas.toDataURL("image/avif").indexOf("data:image/avif") === 0;

    return {
      isLowEnd,
      supportsWebP,
      supportsAVIF,
      hasTouch,
      connectionSpeed,
    };
  }, []);

  return capabilities;
};

/**
 * Composant pour adapter la qualité selon les capacités
 */
export const AdaptiveImageQuality = memo(
  ({ src, webpSrc, avifSrc, lowQualitySrc, alt, className, ...props }) => {
    const { isLowEnd, supportsWebP, supportsAVIF, connectionSpeed } =
      useDeviceCapabilities();

    const optimizedSrc = useMemo(() => {
      // Utiliser une image de faible qualité pour les appareils bas de gamme ou connexions lentes
      if (isLowEnd || connectionSpeed === "slow") {
        return lowQualitySrc || src;
      }

      // Utiliser le format le plus moderne supporté
      if (supportsAVIF && avifSrc) return avifSrc;
      if (supportsWebP && webpSrc) return webpSrc;

      return src;
    }, [
      src,
      webpSrc,
      avifSrc,
      lowQualitySrc,
      isLowEnd,
      supportsWebP,
      supportsAVIF,
      connectionSpeed,
    ]);

    return (
      <LazyImage
        src={optimizedSrc}
        alt={alt}
        className={className}
        {...props}
      />
    );
  }
);

AdaptiveImageQuality.displayName = "AdaptiveImageQuality";

export default {
  LazyImage,
  AnimationWrapper,
  AdaptiveImageQuality,
  usePerformanceOptimization,
  useDeviceCapabilities,
};
