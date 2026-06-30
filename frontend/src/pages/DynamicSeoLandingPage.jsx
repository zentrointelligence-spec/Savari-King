import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Navigation from '../components/landing/Navigation';
import Footer from '../components/landing/Footer';
import Contact from '../components/landing/Contact';
import StickyWhatsApp from '../components/landing/StickyWhatsApp';

const DynamicSeoLandingPage = () => {
  const { slug } = useParams();
  const [content, setContent] = useState(null);

  // This would typically fetch from your backend or a CMS
  // For now, we simulate dynamic content based on the URL slug
  useEffect(() => {
    // Simulated dynamic content mapping
    const dynamicContent = {
      'trivandrum-to-kanyakumari-taxi': {
        title: 'Trivandrum to Kanyakumari Taxi Service',
        subtitle: 'Premium private cabs from Trivandrum Airport to Kanyakumari. Zero waiting, fixed pricing.',
        heroImage: 'https://images.unsplash.com/photo-1519641471654-76cefc7a7f85?q=80&w=2070',
        features: ['Professional English-speaking Drivers', 'Toyota Innova Crysta', 'Airport Pickup Included', 'No Hidden Fees']
      },
      'kanyakumari-tour-packages': {
        title: 'Best Kanyakumari Tour Packages',
        subtitle: 'Experience the confluence of three seas with our curated Kanyakumari tours.',
        heroImage: 'https://images.unsplash.com/photo-1587474260584-136574c0e490?q=80&w=1920',
        features: ['Sunrise & Sunset Views', 'Vivekananda Rock Memorial', 'Custom Itineraries', 'Family Friendly']
      },
      'kerala-coastal-tours': {
        title: 'Kerala Coastal Escapes',
        subtitle: 'Discover the backwaters and beaches of Kerala. Private luxury tours.',
        heroImage: 'https://images.unsplash.com/photo-1602216058019-3aadcf4d07be?q=80&w=1920',
        features: ['Houseboat Experiences', 'Kovalam Beaches', 'Authentic Local Cuisine', 'Premium Accommodations']
      }
    };

    const pageContent = dynamicContent[slug] || {
      title: 'South India Premium Tours',
      subtitle: 'Discover the beauty of South India with our luxury private tours.',
      heroImage: 'https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?q=80&w=1920',
      features: ['Private Vehicles', 'Expert Guides', 'Custom Itineraries', '24/7 Support']
    };

    setContent(pageContent);
    
    // Update document title for SEO
    if (pageContent) {
      document.title = `${pageContent.title} | Ebenezer Tours & Travels`;
    }
  }, [slug]);

  if (!content) return <div className="min-h-screen bg-ivory flex items-center justify-center">Loading...</div>;

  return (
    <div className="font-body bg-ivory text-charcoal antialiased scroll-smooth pb-16 md:pb-0">
      <Navigation />
      
      {/* Dynamic Hero */}
      <section className="relative h-[60vh] min-h-[500px] overflow-hidden pt-20">
        <div className="absolute inset-0">
          <img
            src={content.heroImage}
            alt={content.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-forest/60" />
        </div>
        
        <div className="relative z-10 h-full flex flex-col justify-center items-center text-center px-4 sm:px-6 max-w-4xl mx-auto">
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl text-ivory font-semibold mb-6">
            {content.title}
          </h1>
          <p className="font-body text-ivory/90 text-lg md:text-xl max-w-2xl mx-auto mb-8">
            {content.subtitle}
          </p>
          <a
            href="#contact"
            className="font-body font-semibold bg-gold text-forest px-8 py-4 rounded-sm hover:bg-ivory transition-all"
          >
            Get a Quote
          </a>
        </div>
      </section>

      {/* Dynamic Features */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {content.features.map((feature, i) => (
              <div key={i} className="p-6 border border-charcoal/10 rounded-sm text-center">
                <div className="w-12 h-12 mx-auto bg-forest/5 rounded-full flex items-center justify-center mb-4">
                  <span className="text-gold text-xl font-display">{i + 1}</span>
                </div>
                <h3 className="font-display text-lg text-forest font-semibold">{feature}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Contact />
      <Footer />
      <StickyWhatsApp />
    </div>
  );
};

export default DynamicSeoLandingPage;
