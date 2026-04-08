// pages/HomePage.js
import React, { Suspense } from "react";

// Import all components with React.lazy
const Hero = React.lazy(() => import("../components/home/Hero"));
const TourCategories = React.lazy(() =>
  import("../components/home/TourCategories")
);
const BestSellersSection = React.lazy(() =>
  import("../components/home/BestSellersSection")
);
const TopDestinations = React.lazy(() =>
  import("../components/home/TopDestinations")
);
const SpecialOffers = React.lazy(() =>
  import("../components/home/SpecialOffers")
);
const TravelGuide = React.lazy(() => import("../components/home/TravelGuide"));
const WhyChooseUs = React.lazy(() => import("../components/home/WhyChooseUs"));
const VideoSection = React.lazy(() =>
  import("../components/home/VideoSection")
);

// Simple fallback component
const SectionLoader = ({ height = "300px", label = "Loading..." }) => (
  <div
    className="flex items-center justify-center bg-gray-50 animate-pulse"
    style={{ height }}
  >
    <div className="text-center">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
      <p className="text-gray-600 text-sm">{label}</p>
    </div>
  </div>
);

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <Suspense
        fallback={
          <SectionLoader height="600px" label="Loading hero section..." />
        }
      >
        <Hero />
      </Suspense>

      {/* Tour Categories */}
      <Suspense
        fallback={
          <SectionLoader height="400px" label="Loading tour categories..." />
        }
      >
        <TourCategories />
      </Suspense>

      {/* Best Sellers */}
      <Suspense
        fallback={
          <SectionLoader height="500px" label="Loading best sellers..." />
        }
      >
        <BestSellersSection />
      </Suspense>

      {/* Top Destinations */}
      <Suspense
        fallback={
          <SectionLoader height="500px" label="Loading top destinations..." />
        }
      >
        <TopDestinations />
      </Suspense>

      {/* Why Choose Us */}
      <Suspense
        fallback={
          <SectionLoader height="400px" label="Loading why choose us..." />
        }
      >
        <WhyChooseUs />
      </Suspense>

      {/* Special Offers */}
      <Suspense
        fallback={
          <SectionLoader height="400px" label="Loading special offers..." />
        }
      >
        <SpecialOffers />
      </Suspense>

      {/* Video Section */}
      <Suspense
        fallback={
          <SectionLoader height="500px" label="Loading video section..." />
        }
      >
        <VideoSection />
      </Suspense>

      {/* Travel Guide */}
      <Suspense
        fallback={
          <SectionLoader height="450px" label="Loading travel guide..." />
        }
      >
        <TravelGuide />
      </Suspense>
    </div>
  );
};

export default HomePage;
