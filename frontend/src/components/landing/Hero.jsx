import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, MessageCircle, Compass } from "lucide-react";
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

  const scrollTo = (id) => {
    document.querySelector(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="hero" className="relative h-screen min-h-[680px] overflow-hidden bg-forest">
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

      {/* Readability overlays — keep text crisp on any image */}
      <div className="absolute inset-0 bg-gradient-to-t from-forest/95 via-forest/55 to-forest/30" />
      <div className="absolute inset-0 bg-gradient-to-r from-forest/55 via-transparent to-transparent" />

      <div className="relative z-10 h-full flex flex-col justify-center items-center text-center px-4 sm:px-6 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.35 }}
          className="w-full"
        >
          <p className="font-accent text-gold text-[11px] sm:text-sm tracking-[0.35em] uppercase mb-6">
            Where Kerala Meets Tamil Nadu — South India&apos;s Gateway
          </p>

          <h1 className="font-display leading-[0.95]">
            <span className="block text-4xl sm:text-6xl md:text-7xl lg:text-8xl text-ivory font-semibold pb-3 drop-shadow-[0_2px_20px_rgba(0,0,0,0.35)]">
              Three Seas. One Sunrise.
            </span>
            <span className="block text-4xl sm:text-6xl md:text-7xl lg:text-8xl text-gold font-semibold pt-3 drop-shadow-[0_2px_20px_rgba(0,0,0,0.35)]">
              Endless South India.
            </span>
          </h1>

          <div className="flex items-center justify-center gap-3 my-7">
            <span className="h-px w-12 bg-gold/60" />
            <span className="w-2 h-2 rotate-45 bg-gold" />
            <span className="h-px w-12 bg-gold/60" />
          </div>

          <p className="font-body text-ivory/90 text-base sm:text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            Private tours from Trivandrum to Kanniyakumari &amp; Kochi — open to
            everyone. Whether you are visiting India for the first time or
            rediscovering your homeland.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mt-9">
            <button
              onClick={() => scrollTo("#packages")}
              className="inline-flex items-center justify-center gap-2 font-body font-semibold bg-gold text-forest px-8 py-4 rounded-full hover:bg-[#EDD98C] transition-all shadow-[0_12px_30px_rgba(201,168,76,0.35)]"
            >
              <Compass size={18} />
              Explore Our Tours
            </button>
            <a
              href={buildWhatsAppLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 font-body font-semibold border border-ivory/50 text-ivory px-8 py-4 rounded-full hover:bg-ivory/10 backdrop-blur-sm transition-all"
            >
              <MessageCircle size={18} />
              WhatsApp Us Now
            </a>
          </div>
        </motion.div>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          onClick={() => scrollTo("#trust")}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-ivory/70 hover:text-gold transition-colors"
          aria-label="Scroll down"
        >
          <ChevronDown className="animate-bounce" size={30} />
        </motion.button>
      </div>

      <div className="absolute bottom-8 right-6 hidden md:flex gap-2 z-10">
        {HERO_SLIDES.map((slide, i) => (
          <button
            key={slide.id}
            onClick={() => setCurrent(i)}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === current ? "bg-gold w-8" : "bg-ivory/50 w-2 hover:bg-ivory/80"
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

export default Hero;
