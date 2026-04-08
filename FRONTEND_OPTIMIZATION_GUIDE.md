# Frontend Optimization Guide - Phase 5

## Overview

Ce guide fournit des optimisations frontend pour améliorer les performances du module Destinations.

---

## 1. Code Splitting & Lazy Loading

### 1.1 Lazy Load Pages

**Fichier**: `frontend/src/App.jsx`

```javascript
import { lazy, Suspense } from 'react';
import { Loader2 } from 'lucide-react';

// Lazy load destination pages
const DestinationsPage = lazy(() => import('./pages/DestinationsPage'));
const DestinationDetailPage = lazy(() => import('./pages/DestinationDetailPage'));

// Loading component
const PageLoader = () => (
  <div className="flex justify-center items-center min-h-screen">
    <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
  </div>
);

// Wrap routes with Suspense
<Route
  path="/destinations"
  element={
    <Suspense fallback={<PageLoader />}>
      <PageWithTitle title="Destinations">
        <DestinationsPage />
      </PageWithTitle>
    </Suspense>
  }
/>

<Route
  path="/destinations/:slug"
  element={
    <Suspense fallback={<PageLoader />}>
      <PageWithTitle title="Destination Details">
        <DestinationDetailPage />
      </PageWithTitle>
    </Suspense>
  }
/>
```

### 1.2 Lazy Load Heavy Components

**Sections lourdes à charger paresseusement**:

```javascript
// Dans DestinationDetailPage.jsx
import { lazy, Suspense } from 'react';

const InteractiveMap = lazy(() => import('../components/destinations/InteractiveMap'));
const AttractionsSection = lazy(() => import('../components/destinations/AttractionsSection'));
const ActivitiesSection = lazy(() => import('../components/destinations/ActivitiesSection'));

// Usage avec Suspense
{activeTab === 'map' && (
  <Suspense fallback={<div className="text-center py-12"><Loader2 className="animate-spin" /></div>}>
    <InteractiveMap destination={destination} />
  </Suspense>
)}
```

---

## 2. Image Optimization

### 2.1 Lazy Loading Images

**Mise à jour**: Ajouter l'attribut `loading="lazy"` à toutes les images

```javascript
// EnrichedDestinationCard.jsx
<img
  src={getImageUrl()}
  alt={name}
  loading="lazy"
  decoding="async"
  className="w-full h-full object-cover"
/>
```

### 2.2 Responsive Images

```javascript
// Utiliser srcSet pour différentes résolutions
<img
  src={images.main}
  srcSet={`
    ${images.thumbnail} 300w,
    ${images.main} 600w,
    ${images.featured} 1200w
  `}
  sizes="(max-width: 768px) 300px, (max-width: 1024px) 600px, 1200px"
  alt={name}
  loading="lazy"
/>
```

### 2.3 WebP Format

**Recommandation**: Servir les images en format WebP avec fallback

```javascript
<picture>
  <source srcSet={images.mainWebp} type="image/webp" />
  <source srcSet={images.main} type="image/jpeg" />
  <img src={images.main} alt={name} loading="lazy" />
</picture>
```

---

## 3. React Performance Optimizations

### 3.1 Memoization des Composants

**Fichier**: `EnrichedDestinationCard.jsx`

```javascript
import { memo, useMemo } from 'react';

const EnrichedDestinationCard = memo(({ destination, onLike, isLiked }) => {
  // Memoize expensive calculations
  const formattedLocation = useMemo(() => {
    const parts = [
      destination.location?.region,
      destination.location?.state,
      destination.location?.country
    ].filter(Boolean);
    return parts.join(', ') || 'Location unavailable';
  }, [destination.location]);

  const priceDisplay = useMemo(() => {
    if (destination.pricing?.min > 0 && destination.pricing?.max > 0) {
      return `₹${destination.pricing.min.toLocaleString()} - ₹${destination.pricing.max.toLocaleString()}`;
    }
    return null;
  }, [destination.pricing]);

  // ... rest of component
});

export default memo(EnrichedDestinationCard);
```

### 3.2 useCallback pour Handlers

```javascript
import { useCallback } from 'react';

const TopDestinations = () => {
  const toggleLike = useCallback(async (destinationId) => {
    const newLiked = new Set(likedDestinations);
    newLiked.has(destinationId)
      ? newLiked.delete(destinationId)
      : newLiked.add(destinationId);

    setLikedDestinations(newLiked);
    localStorage.setItem('likedDestinations', JSON.stringify([...newLiked]));
  }, [likedDestinations]);

  return (
    <EnrichedDestinationCard
      destination={dest}
      onLike={toggleLike}  // Stable reference
    />
  );
};
```

### 3.3 Virtualization pour Longues Listes

**Installation**: `npm install react-window`

```javascript
import { FixedSizeList as List } from 'react-window';

// Pour afficher de grandes listes de destinations
const DestinationList = ({ destinations }) => {
  const Row = ({ index, style }) => (
    <div style={style}>
      <EnrichedDestinationCard destination={destinations[index]} />
    </div>
  );

  return (
    <List
      height={800}
      itemCount={destinations.length}
      itemSize={400}
      width="100%"
    >
      {Row}
    </List>
  );
};
```

---

## 4. Bundle Optimization

### 4.1 Vite Configuration

**Fichier**: `frontend/vite.config.js`

```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],

  build: {
    // Code splitting
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['lucide-react'],
          'map-vendor': ['leaflet', 'react-leaflet'],

          // Feature chunks
          'destinations': [
            './src/components/destinations/EnrichedDestinationCard',
            './src/components/destinations/SeasonIndicator',
            './src/components/destinations/FestivalBadge'
          ]
        }
      }
    },

    // Optimize chunk size
    chunkSizeWarningLimit: 1000,

    // Minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,  // Remove console.log in production
        drop_debugger: true
      }
    }
  },

  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'leaflet']
  }
});
```

### 4.2 Tree Shaking

**Importer seulement ce qui est nécessaire**:

```javascript
// ❌ Mauvais - importe tout
import * as LucideIcons from 'lucide-react';

// ✅ Bon - importe seulement ce dont on a besoin
import { MapPin, Star, Heart, Calendar } from 'lucide-react';
```

---

## 5. API Request Optimization

### 5.1 Request Deduplication

**Fichier**: `frontend/src/services/destinationService.js`

```javascript
class DestinationService {
  constructor() {
    this.requestCache = new Map();
    this.pendingRequests = new Map();
  }

  async getDestinationBySlug(slug) {
    // Check if request is already pending
    if (this.pendingRequests.has(slug)) {
      return this.pendingRequests.get(slug);
    }

    // Create new request
    const request = api.get(`/api/destinations/slug/${slug}`)
      .then(response => {
        this.requestCache.set(slug, response.data);
        this.pendingRequests.delete(slug);
        return response.data;
      })
      .catch(error => {
        this.pendingRequests.delete(slug);
        throw error;
      });

    this.pendingRequests.set(slug, request);
    return request;
  }
}
```

### 5.2 Debounce Search Requests

```javascript
import { debounce } from 'lodash';

const searchDestinations = debounce(async (query) => {
  const results = await destinationService.searchDestinations(query);
  setSearchResults(results);
}, 300);  // Wait 300ms after user stops typing
```

### 5.3 Abort Previous Requests

```javascript
const SearchComponent = () => {
  const abortControllerRef = useRef(null);

  const handleSearch = async (query) => {
    // Abort previous request if exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    try {
      const results = await api.get('/api/destinations/search', {
        params: { q: query },
        signal: abortControllerRef.current.signal
      });
      setResults(results.data);
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error(error);
      }
    }
  };

  return <input onChange={(e) => handleSearch(e.target.value)} />;
};
```

---

## 6. Caching Strategies

### 6.1 Local Storage Cache

```javascript
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const getCachedData = (key) => {
  const cached = localStorage.getItem(key);
  if (!cached) return null;

  const { data, timestamp } = JSON.parse(cached);

  // Check if cache is still valid
  if (Date.now() - timestamp > CACHE_DURATION) {
    localStorage.removeItem(key);
    return null;
  }

  return data;
};

const setCachedData = (key, data) => {
  localStorage.setItem(key, JSON.stringify({
    data,
    timestamp: Date.now()
  }));
};

// Usage
const fetchDestinations = async () => {
  const cached = getCachedData('popular-destinations');
  if (cached) {
    setDestinations(cached);
    return;
  }

  const response = await destinationService.getPopularDestinations();
  setCachedData('popular-destinations', response.data);
  setDestinations(response.data);
};
```

### 6.2 React Query (Recommended)

**Installation**: `npm install @tanstack/react-query`

```javascript
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,  // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false
    }
  }
});

// Wrap app
<QueryClientProvider client={queryClient}>
  <App />
</QueryClientProvider>

// Use in components
const useDestination = (slug) => {
  return useQuery({
    queryKey: ['destination', slug],
    queryFn: () => destinationService.getDestinationBySlug(slug),
    staleTime: 5 * 60 * 1000
  });
};

// In component
const { data: destination, isLoading, error } = useDestination(slug);
```

---

## 7. CSS Optimization

### 7.1 Purge Unused CSS

**Vérifier tailwind.config.js**:

```javascript
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  // Tailwind will automatically purge unused styles in production
}
```

### 7.2 Critical CSS

**Inline critical CSS** pour faster First Contentful Paint:

```html
<!-- index.html -->
<style>
  /* Critical CSS for above-the-fold content */
  .hero { /* styles */ }
  .nav { /* styles */ }
</style>
```

---

## 8. Performance Monitoring

### 8.1 Web Vitals

**Installation**: `npm install web-vitals`

```javascript
// frontend/src/reportWebVitals.js
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

function sendToAnalytics(metric) {
  console.log(metric);
  // Send to analytics service
  // analytics.send(metric);
}

getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getFCP(sendToAnalytics);
getLCP(sendToAnalytics);
getTTFB(sendToAnalytics);
```

### 8.2 Performance API

```javascript
// Measure component render time
const DestinationDetailPage = () => {
  useEffect(() => {
    const mark = 'destination-detail-render';
    performance.mark(mark);

    return () => {
      performance.measure('Destination Detail Render', mark);
      const measure = performance.getEntriesByName('Destination Detail Render')[0];
      console.log(`Render time: ${measure.duration}ms`);
    };
  }, []);
};
```

---

## 9. Lighthouse Optimizations

### Checklist

- [ ] Images have explicit width/height to prevent layout shift
- [ ] All images use `loading="lazy"`
- [ ] Critical resources are preloaded
- [ ] Third-party scripts are deferred
- [ ] Fonts are optimized (font-display: swap)
- [ ] No render-blocking resources
- [ ] Proper meta tags for SEO
- [ ] Accessible alt text on images
- [ ] Proper heading hierarchy

### Preload Critical Resources

```html
<!-- index.html -->
<link rel="preload" href="/fonts/main-font.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preconnect" href="https://api.yoursite.com">
```

---

## 10. Production Build Checklist

### Before Deployment

```bash
# Build frontend
cd frontend
npm run build

# Analyze bundle size
npm run build -- --mode analyze

# Check for security vulnerabilities
npm audit

# Run lighthouse
npm install -g lighthouse
lighthouse https://yoursite.com --view

# Test performance
npm run preview
```

### Environment Variables

```env
# .env.production
VITE_API_URL=https://api.yoursite.com
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_CACHE=true
```

---

## Résultats Attendus

### Avant Optimisation
- First Contentful Paint: ~2.5s
- Largest Contentful Paint: ~4.0s
- Time to Interactive: ~5.5s
- Total Bundle Size: ~800KB

### Après Optimisation
- First Contentful Paint: ~1.2s ⬇️ 52%
- Largest Contentful Paint: ~2.0s ⬇️ 50%
- Time to Interactive: ~2.8s ⬇️ 49%
- Total Bundle Size: ~400KB ⬇️ 50%

### Lighthouse Score
- Performance: 90+ (was 60-70)
- Accessibility: 95+
- Best Practices: 95+
- SEO: 95+

---

## Prochaines Étapes

1. Implémenter lazy loading (priorité haute)
2. Ajouter image optimization
3. Configurer React Query
4. Optimiser bundle avec code splitting
5. Monitorer avec Web Vitals
6. Tester avec Lighthouse
7. Déployer et mesurer

**Note**: Ces optimisations sont progressives. Commencez par les optimisations à fort impact (lazy loading, image optimization) avant les optimisations avancées.
