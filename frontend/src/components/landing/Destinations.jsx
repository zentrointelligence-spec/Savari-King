import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight, MapPin } from "lucide-react";
import SectionReveal from "./SectionReveal";
import {
  DESTINATIONS,
  detectCurrency,
  detectCurrencyByLocation,
  formatPrice,
} from "./constants";

// Rich, legible gold for text over photo backgrounds — brighter than the
// base `gold` token and backed by a dark shadow so it reads on any image.
const GOLD_TEXT = "text-[#F2C75C] [text-shadow:0_1px_4px_rgba(0,0,0,0.7)]";

const Destinations = () => {
  const [currency, setCurrency] = useState("INR");

  useEffect(() => {
    let mounted = true;
    setCurrency(detectCurrency());
    detectCurrencyByLocation()
      .then((c) => mounted && setCurrency(c))
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  const scrollTo = () =>
    document.querySelector("#packages")?.scrollIntoView({ behavior: "smooth" });

  return (
    <SectionReveal id="destinations" className="bg-ivory py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="font-accent text-gold-deep text-xs tracking-[0.3em] uppercase mb-3">
            Destinations
          </p>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-forest font-semibold">
            South India&apos;s Finest
          </h2>
          <p className="font-body text-charcoal/70 mt-4 max-w-2xl mx-auto">
            Eight iconic regions. One seamless private journey.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {DESTINATIONS.map((dest, index) => (
            <motion.article
              key={dest.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.07, duration: 0.6 }}
              className={`group relative overflow-hidden rounded-2xl cursor-pointer min-h-[320px] shadow-sm hover:shadow-[0_24px_60px_rgba(26,46,26,0.18)] transition-all duration-500 ${
                dest.id === "kanniyakumari" ? "sm:col-span-2 min-h-[420px]" : ""
              }`}
            >
              <img
                src={dest.image}
                alt={dest.name}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-forest/95 via-forest/50 to-forest/10" />

              <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-end">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin size={14} className={GOLD_TEXT} />
                  <span
                    className={`font-accent text-[11px] tracking-[0.22em] uppercase ${GOLD_TEXT}`}
                  >
                    {dest.region}
                  </span>
                </div>
                <h3 className="font-display text-2xl md:text-3xl text-ivory font-semibold mb-3 drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
                  {dest.name}
                </h3>
                <p className="font-body text-ivory/90 text-sm leading-relaxed mb-4 line-clamp-3 group-hover:line-clamp-none transition-all [text-shadow:0_1px_3px_rgba(0,0,0,0.6)]">
                  {dest.hook}
                </p>
                <ul className="hidden group-hover:flex flex-wrap gap-2 mb-4">
                  {dest.highlights.map((h) => (
                    <li
                      key={h}
                      className="font-body text-xs text-ivory bg-ivory/15 backdrop-blur-sm px-2.5 py-1 rounded-full"
                    >
                      {h}
                    </li>
                  ))}
                </ul>

                <div className="flex items-end justify-between gap-3">
                  <button
                    onClick={() => {
                      const source = `Destination Card: ${dest.name}`;
                      console.log("Lead Source Tracker -> Source:", source);
                      scrollTo();
                    }}
                    className={`flex items-center gap-2 font-body text-sm font-semibold group-hover:gap-3 transition-all ${GOLD_TEXT}`}
                  >
                    View Packages <ArrowRight size={16} />
                  </button>
                  <div className="text-right">
                    <p className="font-body text-[10px] tracking-[0.15em] uppercase text-ivory/70">
                      From
                    </p>
                    <p className="font-display text-lg text-ivory font-semibold drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]">
                      {formatPrice(dest.priceFrom, currency)}
                      <span className="font-body text-[11px] text-ivory/70 font-normal">
                        {" "}
                        / person
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </SectionReveal>
  );
};

export default Destinations;
