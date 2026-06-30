import { Instagram, Facebook, MessageCircle, MapPin } from "lucide-react";
import { BRAND, NAV_LINKS, buildWhatsAppLink } from "./constants";

const Footer = () => {
  const scrollTo = (href) =>
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });

  return (
    <footer className="bg-forest text-ivory">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12 mb-10">
          <div>
            <div className="bg-ivory rounded-2xl px-4 py-3 inline-block mb-5">
              <img
                src="/logos/logo-nav-light.svg"
                alt="Savari King – Ebenezer Tours & Travels"
                className="h-11 w-auto object-contain"
                loading="lazy"
              />
            </div>
            <p className="font-body text-sm text-ivory/70 italic leading-relaxed mb-5 max-w-sm">
              {BRAND.tagline}
            </p>
            <a
              href={BRAND.mapLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 font-body text-xs text-ivory/80 hover:text-gold transition-colors"
            >
              <MapPin size={14} className="text-gold" />
              View on Google Maps
            </a>
          </div>

          <div>
            <p className="font-accent text-xs tracking-[0.2em] uppercase text-gold mb-5">
              Quick Links
            </p>
            <ul className="space-y-3">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <button
                    onClick={() => scrollTo(link.href)}
                    className="font-body text-sm text-ivory/75 hover:text-gold transition-colors"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="font-accent text-xs tracking-[0.2em] uppercase text-gold mb-5">
              Connect
            </p>
            <p className="font-body text-sm text-ivory/70 mb-5">
              {BRAND.phoneDisplay} · {BRAND.email}
            </p>
            <div className="flex gap-3">
              <a
                href="https://www.instagram.com/ebenezer_travels/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-11 h-11 rounded-full border border-ivory/25 flex items-center justify-center text-ivory/80 hover:text-forest hover:bg-gold hover:border-gold transition-all"
                aria-label="Instagram"
              >
                <Instagram size={18} />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-11 h-11 rounded-full border border-ivory/25 flex items-center justify-center text-ivory/80 hover:text-forest hover:bg-gold hover:border-gold transition-all"
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
                className="w-11 h-11 rounded-full border border-ivory/25 flex items-center justify-center text-ivory/80 hover:text-forest hover:bg-gold hover:border-gold transition-all"
                aria-label="WhatsApp"
              >
                <MessageCircle size={18} />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-ivory/15 pt-8 text-center">
          <p className="font-body text-xs text-ivory/60">
            © 2026 {BRAND.name} · {BRAND.domain} · Est. 1999
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
