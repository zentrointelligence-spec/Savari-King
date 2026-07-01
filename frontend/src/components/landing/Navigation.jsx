import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, MessageCircle } from "lucide-react";
import { NAV_LINKS, buildWhatsAppLink } from "./constants";

const Navigation = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  // Section anchors only exist on the homepage. From any other page, jump
  // back to "/" first, then let the browser scroll to the hash on load.
  const scrollTo = (href) => {
    setMobileOpen(false);
    if (!isHome) {
      navigate(`/${href}`);
      return;
    }
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const navLinkClass =
    "relative font-body text-sm font-medium text-forest/80 hover:text-forest tracking-wide transition-colors group";
  const navUnderline =
    "absolute -bottom-1 left-0 right-0 h-px bg-gold scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300";

  const renderNavLink = (link, mobile = false) => {
    if (link.href.startsWith("#")) {
      return (
        <button
          key={link.href}
          onClick={() => scrollTo(link.href)}
          className={
            mobile
              ? "font-display text-2xl text-forest text-left py-3 border-b border-forest/10 hover:text-gold-deep transition-colors"
              : navLinkClass
          }
        >
          {link.label}
          {!mobile && <span className={navUnderline} />}
        </button>
      );
    }

    return (
      <Link
        key={link.href}
        to={link.href}
        onClick={() => setMobileOpen(false)}
        className={
          mobile
            ? "font-display text-2xl text-forest text-left py-3 border-b border-forest/10 hover:text-gold-deep transition-colors"
            : navLinkClass
        }
      >
        {link.label}
        {!mobile && <span className={navUnderline} />}
      </Link>
    );
  };

  return (
    <>
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-white/90 backdrop-blur-md shadow-[0_6px_30px_rgba(26,46,26,0.08)] border-b border-forest/10"
            : "bg-white/70 backdrop-blur-sm border-b border-transparent"
        }`}
      >
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <button
            onClick={() => scrollTo("#hero")}
            className="flex items-center shrink-0"
            aria-label="Savari King — Ebenezer Tours & Travels — back to top"
          >
            <img
              src="/logos/logo-nav-light.svg"
              alt="Savari King — Ebenezer Tours & Travels"
              className="h-[68px] w-auto max-w-[380px] object-contain"
              loading="eager"
            />
          </button>

          <div className="hidden lg:flex items-center gap-9">
            {NAV_LINKS.map((link) => renderNavLink(link))}
            <a
              href={buildWhatsAppLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 font-body text-sm font-semibold bg-forest text-ivory px-5 py-2.5 rounded-full hover:bg-forest-soft transition-all shadow-[0_8px_20px_rgba(26,46,26,0.18)]"
            >
              <MessageCircle size={16} className="text-gold" />
              WhatsApp Us
            </a>
          </div>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden text-forest p-2 rounded-lg hover:bg-forest/5 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </nav>
      </motion.header>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            className="fixed inset-0 z-40 bg-white lg:hidden pt-20 px-8"
          >
            <div className="flex flex-col gap-2">
              {NAV_LINKS.map((link) => renderNavLink(link, true))}
              <a
                href={buildWhatsAppLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex items-center justify-center gap-2 font-body font-semibold bg-forest text-ivory px-6 py-4 rounded-full"
              >
                <MessageCircle size={18} className="text-gold" />
                WhatsApp Us Now
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navigation;
