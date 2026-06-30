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

const LandingPage = () => (
  <div className="light font-body bg-ivory text-charcoal antialiased scroll-smooth min-h-screen overflow-x-hidden">
    <Navigation />
    <main>
      <Hero />
      <TrustStrip />
      <Destinations />
      <Packages />
      <WhyChooseUs />
      <FounderSection />
      <HowItWorks />
      <Testimonials />
      <Gallery />
      <Contact />
    </main>
    <Footer />
    <StickyWhatsApp />
    <TravelAdvisor />
  </div>
);

export default LandingPage;
