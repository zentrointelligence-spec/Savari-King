import { Instagram, Facebook, MessageCircle } from "lucide-react";
import { BRAND, NAV_LINKS, buildWhatsAppLink } from "./constants";

const Footer = () => {
  const scrollTo = (href) =>
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });

  return (
    <footer className="bg-forest dark:bg-[#080F08] border-t border-gold/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
          <div>
            <img
              src="/logos/logo-nav.svg"
              alt="Savari King – Ebenezer Tours & Travels"
              className="h-16 w-auto object-contain mb-4 opacity-90"
              loading="lazy"
            />
            <p className="font-body text-sm text-ivory/60 italic leading-relaxed mb-4">
              {BRAND.tagline}
            </p>
            <a 
              href={BRAND.mapLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 font-body text-xs text-ivory/80 hover:text-gold transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinelinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle></svg>
              View on Google Maps
            </a>
          </div>

          <div>
            <p className="font-accent text-xs tracking-[0.2em] uppercase text-gold mb-4">
              Quick Links
            </p>
            <ul className="space-y-2">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <button
                    onClick={() => scrollTo(link.href)}
                    className="font-body text-sm text-ivory/70 hover:text-gold transition-colors"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="font-accent text-xs tracking-[0.2em] uppercase text-gold mb-4">
              Connect
            </p>
            <div className="flex gap-4">
              <a
                href="https://www.instagram.com/ebenezer_travels/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-sm border border-ivory/20 flex items-center justify-center text-ivory/70 hover:text-gold hover:border-gold transition-colors"
                aria-label="Instagram"
              >
                <Instagram size={18} />
              </a>
              {/* TODO: replace with real Facebook page URL */}
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-sm border border-ivory/20 flex items-center justify-center text-ivory/70 hover:text-gold hover:border-gold transition-colors"
                aria-label="Facebook"
              >
                <Facebook size={18} />
              </a>
              <a
                href={buildWhatsAppLink()}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  const source = `Footer Connect: WhatsApp`;
                  console.log("Lead Source Tracker -> Source:", source);
                }}
                className="w-10 h-10 rounded-sm border border-ivory/20 flex items-center justify-center text-ivory/70 hover:text-gold hover:border-gold transition-colors"
                aria-label="WhatsApp"
              >
                <MessageCircle size={18} />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-ivory/10 pt-8 text-center">
          <p className="font-body text-xs text-ivory/50">
            © 2026 {BRAND.name} · {BRAND.domain}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
