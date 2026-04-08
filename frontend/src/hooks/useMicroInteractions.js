import { useState, useEffect, useCallback } from "react";

// Hook for managing micro-interactions
export const useMicroInteractions = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [ripples, setRipples] = useState([]);

  // Hover handlers
  const handleMouseEnter = useCallback(() => setIsHovered(true), []);
  const handleMouseLeave = useCallback(() => setIsHovered(false), []);

  // Press handlers
  const handleMouseDown = useCallback(() => setIsPressed(true), []);
  const handleMouseUp = useCallback(() => setIsPressed(false), []);

  // Ripple effect
  const createRipple = useCallback((event) => {
    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    const newRipple = {
      x,
      y,
      size,
      id: Date.now(),
    };

    setRipples((prev) => [...prev, newRipple]);

    // Remove ripple after animation
    setTimeout(() => {
      setRipples((prev) => prev.filter((ripple) => ripple.id !== newRipple.id));
    }, 600);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      setRipples([]);
    };
  }, []);

  return {
    isHovered,
    isPressed,
    ripples,
    handlers: {
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
      onMouseDown: handleMouseDown,
      onMouseUp: handleMouseUp,
      onClick: createRipple,
    },
  };
};

// Hook for scroll-based animations
export const useScrollAnimation = (threshold = 0.1) => {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrollY(currentScrollY);

      // Check if element should be visible based on scroll position
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollPercentage = currentScrollY / (documentHeight - windowHeight);

      setIsVisible(scrollPercentage > threshold);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Initial check

    return () => window.removeEventListener("scroll", handleScroll);
  }, [threshold]);

  return { isVisible, scrollY };
};

// Hook for intersection observer animations
export const useIntersectionAnimation = (options = {}) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const [ref, setRef] = useState(null);

  useEffect(() => {
    if (!ref) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setIsIntersecting(true);
          setHasAnimated(true);
        }
      },
      {
        threshold: 0.1,
        rootMargin: "-50px",
        ...options,
      }
    );

    observer.observe(ref);

    return () => {
      if (ref) observer.unobserve(ref);
    };
  }, [ref, hasAnimated, options]);

  return [setRef, isIntersecting];
};

// Hook for touch gestures
export const useTouchGestures = () => {
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [isSwipe, setIsSwipe] = useState(false);

  const minSwipeDistance = 50;

  const onTouchStart = useCallback((e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
    setIsSwipe(false);
  }, []);

  const onTouchMove = useCallback((e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  }, []);

  const onTouchEnd = useCallback(() => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe || isRightSwipe) {
      setIsSwipe(true);
    }
  }, [touchStart, touchEnd]);

  const getSwipeDirection = useCallback(() => {
    if (!touchStart || !touchEnd) return null;

    const distance = touchStart - touchEnd;
    if (distance > minSwipeDistance) return "left";
    if (distance < -minSwipeDistance) return "right";
    return null;
  }, [touchStart, touchEnd]);

  return {
    isSwipe,
    swipeDirection: getSwipeDirection(),
    touchHandlers: {
      onTouchStart,
      onTouchMove,
      onTouchEnd,
    },
  };
};

// Hook for device detection
export const useDeviceDetection = () => {
  const [deviceInfo, setDeviceInfo] = useState({
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    screenSize: "desktop",
  });

  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      const isMobile = width < 768;
      const isTablet = width >= 768 && width < 1024;
      const isDesktop = width >= 1024;

      let screenSize = "desktop";
      if (isMobile) screenSize = "mobile";
      else if (isTablet) screenSize = "tablet";

      setDeviceInfo({
        isMobile,
        isTablet,
        isDesktop,
        screenSize,
      });
    };

    checkDevice();
    window.addEventListener("resize", checkDevice);

    return () => window.removeEventListener("resize", checkDevice);
  }, []);

  return deviceInfo;
};

// Hook for performance monitoring
export const usePerformanceMonitor = () => {
  const [metrics, setMetrics] = useState({
    loadTime: 0,
    renderTime: 0,
    interactionTime: 0,
  });

  useEffect(() => {
    // Measure page load time
    const loadTime = performance.now();

    // Measure render time
    const renderStart = performance.now();
    requestAnimationFrame(() => {
      const renderEnd = performance.now();
      setMetrics((prev) => ({
        ...prev,
        loadTime,
        renderTime: renderEnd - renderStart,
      }));
    });

    // Measure interaction time
    const handleInteraction = () => {
      const interactionTime = performance.now() - loadTime;
      setMetrics((prev) => ({
        ...prev,
        interactionTime,
      }));
    };

    document.addEventListener("click", handleInteraction, { once: true });
    document.addEventListener("keydown", handleInteraction, { once: true });

    return () => {
      document.removeEventListener("click", handleInteraction);
      document.removeEventListener("keydown", handleInteraction);
    };
  }, []);

  return metrics;
};

// Hook for custom cursor effects
export const useCustomCursor = () => {
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setCursorPosition({ x: e.clientX, y: e.clientY });
    };

    document.addEventListener("mousemove", handleMouseMove);
    return () => document.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return {
    cursorPosition,
    isHovering,
    setIsHovering,
  };
};

// Hook for animated badges
export const useAnimatedBadges = (initialBadges = []) => {
  const [visibleBadges, setVisibleBadges] = useState(initialBadges);

  const getBadgeAnimation = useCallback(() => {
    return {
      initial: { opacity: 0, scale: 0.8, y: -10 },
      animate: { opacity: 1, scale: 1, y: 0 },
      exit: { opacity: 0, scale: 0.8, y: -10 },
      transition: { duration: 0.3, ease: "easeOut" },
    };
  }, []);

  const getBadgeStyle = useCallback((badge) => {
    switch (badge) {
      case "featured":
        return "bg-gradient-to-r from-yellow-400 to-orange-500 text-white";
      case "popular":
        return "bg-gradient-to-r from-red-500 to-pink-500 text-white";
      case "new":
        return "bg-gradient-to-r from-green-400 to-blue-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  }, []);

  const addBadge = useCallback((badge) => {
    setVisibleBadges((prev) => [...prev, badge]);
  }, []);

  const removeBadge = useCallback((badge) => {
    setVisibleBadges((prev) => prev.filter((b) => b !== badge));
  }, []);

  return {
    visibleBadges,
    getBadgeAnimation,
    getBadgeStyle,
    addBadge,
    removeBadge,
  };
};

// Hook for advanced hover effects
export const useAdvancedHover = (options = {}) => {
  const [hoverState, setHoverState] = useState({
    isHovered: false,
    hoverIntensity: 0,
    hoverDuration: 0,
  });

  const {
    enableGlow = true,
    enableScale = true,
    glowColor = "rgba(59, 130, 246, 0.3)",
  } = options;

  const handleMouseEnter = useCallback(() => {
    setHoverState((prev) => ({
      ...prev,
      isHovered: true,
      hoverIntensity: 1,
    }));
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHoverState((prev) => ({
      ...prev,
      isHovered: false,
      hoverIntensity: 0,
    }));
  }, []);

  const getHoverStyles = useCallback(() => {
    const { isHovered, hoverIntensity } = hoverState;

    return {
      transform:
        enableScale && isHovered
          ? `scale(${1 + hoverIntensity * 0.05})`
          : "scale(1)",
      boxShadow:
        enableGlow && isHovered
          ? `0 20px 40px ${glowColor}, 0 0 20px ${glowColor}`
          : "0 4px 6px rgba(0, 0, 0, 0.1)",
      transition: "all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
    };
  }, [hoverState, enableScale, enableGlow, glowColor]);

  const getImageStyles = useCallback(() => {
    const { isHovered } = hoverState;

    return {
      transform: isHovered ? "scale(1.1)" : "scale(1)",
      filter: isHovered
        ? "brightness(1.1) contrast(1.1)"
        : "brightness(1) contrast(1)",
    };
  }, [hoverState]);

  return {
    ...hoverState,
    ref: { current: null },
    handlers: {
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
    },
    getHoverStyles,
    getImageStyles,
  };
};

// Hook for image preloading
export const useImagePreloader = (imageUrls = []) => {
  const [loadedImages, setLoadedImages] = useState(new Set());
  const [loadingProgress, setLoadingProgress] = useState(0);

  useEffect(() => {
    if (imageUrls.length === 0) return;

    let loadedCount = 0;
    const totalImages = imageUrls.length;

    imageUrls.forEach((url) => {
      const img = new Image();
      img.onload = () => {
        loadedCount++;
        setLoadedImages((prev) => new Set([...prev, url]));
        setLoadingProgress((loadedCount / totalImages) * 100);
      };
      img.onerror = () => {
        loadedCount++;
        setLoadingProgress((loadedCount / totalImages) * 100);
      };
      img.src = url;
    });
  }, [imageUrls]);

  return {
    loadedImages,
    loadingProgress,
    isAllLoaded: loadedImages.size === imageUrls.length,
  };
};

export default {
  useMicroInteractions,
  useScrollAnimation,
  useIntersectionAnimation,
  useTouchGestures,
  useDeviceDetection,
  usePerformanceMonitor,
  useCustomCursor,
  useAnimatedBadges,
  useAdvancedHover,
  useImagePreloader,
};
