import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { ChevronDown } from "lucide-react";
import { HERO_SLIDES, buildWhatsAppLink } from "./constants";

const Hero = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(
      () => setCurrent((c) => (c + 1) % HERO_SLIDES.length),
      6000
    );
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Basic GSAP animation as an example
    gsap.fromTo(
      ".hero-text",
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, duration: 1.5, ease: "power3.out" }
    );
  }, []);

  const scrollTo = (id) => {
    document.querySelector(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="hero" className="relative h-screen min-h-[700px] overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={HERO_SLIDES[current].id}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2 }}
          className="absolute inset-0"
        >
          <img
            src={HERO_SLIDES[current].src}
            alt={HERO_SLIDES[current].alt}
            className="w-full h-full object-cover animate-hero-zoom"
            loading="eager"
            fetchPriority={current === 0 ? "high" : "auto"}
          />
        </motion.div>
      </AnimatePresence>

      <div className="absolute inset-0 bg-gradient-to-t from-forest/90 via-forest/40 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-forest/30 to-transparent" />

      <div className="relative z-10 h-full flex flex-col justify-center items-center text-center px-4 sm:px-6 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.4 }}
          className="w-full"
        >
          <p className="font-accent text-gold text-xs sm:text-sm tracking-[0.35em] uppercase mb-6">
            Where Kerala Meets Tamil Nadu — South India&apos;s Gateway
          </p>

          {/* Signature: gold line at 60% with text straddling */}
          <div className="relative py-8 sm:py-12">
            <div
              className="absolute left-0 right-0 h-px bg-gold/80"
              style={{ top: "60%" }}
            />
            <div
              className="absolute left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-gold border-2 border-ivory"
              style={{ top: "60%", marginTop: "-6px" }}
            />

            <h1 className="font-display leading-[0.95] hero-text">
              <span className="block text-4xl sm:text-6xl md:text-7xl lg:text-8xl text-ivory font-semibold pb-4">
                Three Seas. One Sunrise.
              </span>
              <span className="block text-4xl sm:text-6xl md:text-7xl lg:text-8xl text-gold font-semibold pt-4">
                Endless South India.
              </span>
            </h1>
          </div>

          <p className="font-body text-ivory/85 text-base sm:text-lg md:text-xl max-w-2xl mx-auto mt-6 leading-relaxed">
            Private tours from Trivandrum to Kanniyakumari & Kochi — open to
            everyone. Whether you are visiting India for the first time or
            rediscovering your homeland.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
            <button
              onClick={() => scrollTo("#packages")}
              className="font-body font-semibold bg-gold text-forest px-8 py-4 rounded-sm hover:bg-ivory transition-all animate-cta-pulse"
            >
              Explore Our Tours
            </button>
            <a
              href={buildWhatsAppLink()}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                console.log("Lead Source Tracker -> Source: Hero Section CTA");
              }}
              className="font-body font-semibold border border-ivory/40 text-ivory px-8 py-4 rounded-sm hover:bg-ivory/10 transition-all"
            >
              WhatsApp Us Now
            </a>
          </div>
        </motion.div>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          onClick={() => scrollTo("#trust")}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-ivory/60 hover:text-gold transition-colors"
          aria-label="Scroll down"
        >
          <ChevronDown className="animate-bounce" size={32} />
        </motion.button>
      </div>

      <div className="absolute bottom-6 right-6 hidden md:flex gap-2 z-10">
        {HERO_SLIDES.map((slide, i) => (
          <button
            key={slide.id}
            onClick={() => setCurrent(i)}
            className={`w-2 h-2 rounded-full transition-all ${
              i === current ? "bg-gold w-6" : "bg-ivory/40"
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

export default Hero;
