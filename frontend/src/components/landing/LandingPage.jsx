import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Navigation from "./Navigation";
import Hero from "./Hero";
import TrustStrip from "./TrustStrip";
import Destinations from "./Destinations";
import Packages from "./Packages";
import WhyChooseUs from "./WhyChooseUs";
import FounderSection from "./FounderSection";
import HowItWorks from "./HowItWorks";
import Testimonials from "./Testimonials";
import Gallery from "./Gallery";
import Contact from "./Contact";
import Footer from "./Footer";
import StickyWhatsApp from "./StickyWhatsApp";
import TravelAdvisor from "./TravelAdvisor";
import ErrorBoundary from "./ErrorBoundary";

const wrap = (name, El) => (
  <ErrorBoundary name={name}>
    {El}
  </ErrorBoundary>
);

// Cross-page nav links (e.g. from /about-us) land here as "/#destinations".
// React Router doesn't auto-scroll to hash fragments, so do it manually
// once the section content has painted.
const useScrollToHash = () => {
  const { hash } = useLocation();
  useEffect(() => {
    if (!hash) return;
    const id = hash.replace("#", "");
    const timer = setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    }, 120);
    return () => clearTimeout(timer);
  }, [hash]);
};

const LandingPage = () => {
  useScrollToHash();

  return (
  <div className="light font-body bg-ivory text-charcoal antialiased scroll-smooth min-h-screen overflow-x-hidden">
    {wrap("Navigation", <Navigation />)}
    <main>
      {wrap("Hero", <Hero />)}
      {wrap("TrustStrip", <TrustStrip />)}
      {wrap("Destinations", <Destinations />)}
      {wrap("Packages", <Packages />)}
      {wrap("WhyChooseUs", <WhyChooseUs />)}
      {wrap("FounderSection", <FounderSection />)}
      {wrap("HowItWorks", <HowItWorks />)}
      {wrap("Testimonials", <Testimonials />)}
      {wrap("Gallery", <Gallery />)}
      {wrap("Contact", <Contact />)}
    </main>
    {wrap("Footer", <Footer />)}
    {wrap("StickyWhatsApp", <StickyWhatsApp />)}
    {wrap("TravelAdvisor", <TravelAdvisor />)}
  </div>
  );
};

export default LandingPage;
