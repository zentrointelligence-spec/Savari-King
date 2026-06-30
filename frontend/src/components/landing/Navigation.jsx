import { useState, useEffect, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Sun, Moon } from "lucide-react";
import { NAV_LINKS, buildWhatsAppLink } from "./constants";
import { ThemeContext } from "../../contexts/ThemeContext";

const Navigation = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, toggleTheme } = useContext(ThemeContext);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (href) => {
    setMobileOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-forest/95 backdrop-blur-md shadow-lg shadow-black/20"
            : "bg-transparent"
        }`}
      >
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <button
            onClick={() => scrollTo("#hero")}
            className="text-left group"
          >
            <span className="font-accent text-gold text-xs tracking-[0.25em] uppercase block">
              Est. 1999 · Marthandam
            </span>
            <span className="font-display text-ivory text-xl md:text-2xl font-semibold tracking-wide group-hover:text-gold transition-colors">
              Tours & Travels
            </span>
          </button>

          <div className="hidden lg:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <button
                key={link.href}
                onClick={() => scrollTo(link.href)}
                className="font-body text-sm text-ivory/80 hover:text-gold tracking-wide transition-colors"
              >
                {link.label}
              </button>
            ))}
            <button
              onClick={toggleTheme}
              aria-label="Toggle dark mode"
              className="text-ivory/70 hover:text-gold transition-colors p-1"
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <a
              href={buildWhatsAppLink()}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                const source = `Desktop Nav: WhatsApp Us`;
                console.log("Lead Source Tracker -> Source:", source);
              }}
              className="font-body text-sm font-semibold bg-gold text-forest px-5 py-2.5 rounded-sm hover:bg-gold/90 transition-all animate-cta-pulse"
            >
              WhatsApp Us
            </a>
          </div>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden text-ivory p-2"
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
            transition={{ type: "spring", damping: 25 }}
            className="fixed inset-0 z-40 bg-forest lg:hidden pt-24 px-8"
          >
            <div className="flex flex-col gap-6">
              {NAV_LINKS.map((link) => (
                <button
                  key={link.href}
                  onClick={() => scrollTo(link.href)}
                  className="font-display text-3xl text-ivory text-left hover:text-gold transition-colors"
                >
                  {link.label}
                </button>
              ))}
              <button
                onClick={toggleTheme}
                className="flex items-center gap-3 font-display text-2xl text-ivory/70 text-left hover:text-gold transition-colors"
              >
                {theme === "dark" ? <Sun size={22} /> : <Moon size={22} />}
                {theme === "dark" ? "Light Mode" : "Dark Mode"}
              </button>
              <a
                href={buildWhatsAppLink()}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  const source = `Mobile Nav: WhatsApp Us Now`;
                  console.log("Lead Source Tracker -> Source:", source);
                }}
                className="mt-4 font-body font-semibold bg-gold text-forest px-6 py-4 rounded-sm text-center"
              >
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
