import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  Check,
  X,
  Calendar,
  MapPin,
} from "lucide-react";
import SectionReveal from "./SectionReveal";
import AnimatedPrice from "./AnimatedPrice";
import {
  PACKAGES,
  buildWhatsAppLink,
  detectCurrency,
  detectCurrencyByLocation,
  rememberCurrencyChoice,
  formatPrice,
  CURRENCY_RATES,
} from "./constants";

const PackageCard = ({ pkg, index, currency }) => {
  const [tierIndex, setTierIndex] = useState(1);
  const [openItinerary, setOpenItinerary] = useState(pkg.id === "southern-crown");

  const bookMessage = `Hi, I'm interested in booking "${pkg.name}". Please send me details.`;
  const currentPriceINR = pkg.hasTiers
    ? pkg.pricingTiers[tierIndex].price
    : pkg.priceFrom;

  const flagship = pkg.id === "southern-crown";

  return (
    <motion.article
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08, duration: 0.6 }}
      className={`relative flex flex-col bg-white rounded-2xl overflow-hidden border transition-all duration-300 hover:-translate-y-1.5 ${
        flagship
          ? "border-gold/60 ring-1 ring-gold/40 shadow-[0_24px_70px_rgba(201,168,76,0.18)]"
          : "border-forest/10 hover:border-gold/50 hover:shadow-[0_24px_60px_rgba(26,46,26,0.12)]"
      }`}
    >
      {pkg.badge && (
        <span
          className={`absolute top-5 right-5 z-10 font-accent text-[10px] tracking-[0.2em] uppercase px-3 py-1.5 rounded-full ${
            flagship ? "bg-gold text-forest" : "bg-forest-mist text-forest"
          }`}
        >
          {pkg.badge}
        </span>
      )}

      <div className="p-6 md:p-8 flex flex-col flex-1">
        <div className="flex items-center gap-3 mb-4">
          <span className="inline-flex items-center gap-1.5 font-body text-xs font-medium text-forest bg-forest-mist px-3 py-1 rounded-full">
            <Calendar size={12} className="text-gold-deep" />
            {pkg.duration}
          </span>
        </div>

        <h3 className="font-display text-2xl md:text-3xl text-forest font-semibold mb-2 pr-20">
          {pkg.name}
        </h3>
        <p className="font-body text-charcoal/60 text-sm italic mb-4">
          {pkg.tagline}
        </p>

        <div className="flex flex-wrap gap-2 mb-6">
          {pkg.destinations.map((d) => (
            <span
              key={d}
              className="inline-flex items-center gap-1 font-body text-xs text-charcoal-soft border border-forest/15 px-2 py-1 rounded-full"
            >
              <MapPin size={10} className="text-gold-deep" />
              {d}
            </span>
          ))}
        </div>

        {pkg.hasTiers && (
          <div className="mb-6">
            <p className="font-accent text-xs tracking-[0.15em] uppercase text-charcoal/50 mb-3">
              Select Tier
            </p>
            <div className="flex gap-2">
              {pkg.pricingTiers.map((tier, i) => (
                <button
                  key={tier.tier}
                  onClick={() => setTierIndex(i)}
                  className={`flex-1 font-body text-xs py-2 px-2 rounded-full border transition-all ${
                    tierIndex === i
                      ? "bg-forest text-ivory border-forest"
                      : "bg-transparent text-charcoal border-forest/20 hover:border-gold"
                  }`}
                >
                  {tier.tier}
                </button>
              ))}
            </div>
            <p className="font-body text-xs text-charcoal/60 mt-2">
              {pkg.pricingTiers[tierIndex].note}
            </p>
          </div>
        )}

        <div className="mb-6">
          <p className="font-body text-sm text-charcoal/60">From</p>
          <motion.p
            key={`${pkg.id}-${tierIndex}`}
            initial={{ opacity: 0.4, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="font-display text-3xl md:text-4xl text-forest font-semibold"
          >
            <AnimatedPrice
              value={currentPriceINR}
              format={(v) => formatPrice(v, currency)}
            />
            <span className="font-body text-sm text-charcoal/50 font-normal">
              {" "}
              / person (2 pax)
            </span>
          </motion.p>
          {currency !== "INR" && (
            <p className="font-body text-xs text-charcoal/50 mt-1">
              ≈ {formatPrice(currentPriceINR, "INR")} · Indicative rate
            </p>
          )}
        </div>

        {(pkg.itinerary || pkg.highlights) && (
          <div className="mb-6 border-t border-forest/10 pt-4">
            <button
              onClick={() => setOpenItinerary(!openItinerary)}
              className="flex items-center justify-between w-full font-body text-sm font-semibold text-forest"
            >
              {pkg.itinerary ? "Day-by-Day Itinerary" : "Tour Highlights"}
              <ChevronDown
                size={18}
                className={`transition-transform ${openItinerary ? "rotate-180" : ""}`}
              />
            </button>
            <AnimatePresence>
              {openItinerary && (
                <motion.ul
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden mt-3 space-y-2"
                >
                  {(pkg.itinerary || pkg.highlights).map((item, i) => (
                    <li
                      key={i}
                      className="font-body text-sm text-charcoal/75 leading-relaxed pl-4 border-l-2 border-gold/50"
                    >
                      {item}
                    </li>
                  ))}
                </motion.ul>
              )}
            </AnimatePresence>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
          <div>
            <p className="font-accent text-[10px] tracking-[0.15em] uppercase text-charcoal/50 mb-2">
              Includes
            </p>
            <ul className="space-y-1.5">
              {pkg.includes.map((item) => (
                <li
                  key={item}
                  className="font-body text-xs text-charcoal/80 flex items-start gap-1.5"
                >
                  <Check size={12} className="text-gold-deep mt-0.5 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="font-accent text-[10px] tracking-[0.15em] uppercase text-charcoal/50 mb-2">
              Excludes
            </p>
            <ul className="space-y-1.5">
              {pkg.excludes.map((item) => (
                <li
                  key={item}
                  className="font-body text-xs text-charcoal/60 flex items-start gap-1.5"
                >
                  <X size={12} className="text-charcoal/40 mt-0.5 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <a
          href={buildWhatsAppLink(bookMessage)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => {
            const source = `Package Card: ${pkg.name}`;
            console.log("Lead Source Tracker -> Source:", source);
          }}
          className={`mt-auto block w-full text-center font-body font-semibold py-4 rounded-full transition-all ${
            flagship
              ? "bg-gold text-forest hover:bg-[#EDD98C] shadow-[0_10px_25px_rgba(201,168,76,0.3)]"
              : "bg-forest text-ivory hover:bg-forest-soft"
          }`}
        >
          Book This Tour
        </a>
      </div>
    </motion.article>
  );
};

const Packages = () => {
  const [currency, setCurrency] = useState("INR");
  const [detecting, setDetecting] = useState(true);

  useEffect(() => {
    let mounted = true;
    // Instant timezone fallback so prices render immediately, then refine
    // via IP geolocation (country → currency) without requiring permission.
    setCurrency(detectCurrency());
    detectCurrencyByLocation()
      .then((detected) => {
        if (mounted) setCurrency(detected);
      })
      .catch(() => {})
      .finally(() => mounted && setDetecting(false));
    return () => {
      mounted = false;
    };
  }, []);

  const handleCurrencyChange = (e) => {
    const code = e.target.value;
    setCurrency(code);
    rememberCurrencyChoice(code);
  };

  return (
    <SectionReveal id="packages" className="bg-forest-mist py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="font-accent text-gold-deep text-xs tracking-[0.3em] uppercase mb-3">
            Tour Packages
          </p>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-forest font-semibold">
            Curated Journeys
          </h2>
          <p className="font-body text-charcoal/70 mt-4 max-w-2xl mx-auto">
            Fixed transparent pricing. Private Innova. No hidden charges.
          </p>

          <div className="flex items-center justify-center gap-2 mt-6 flex-wrap">
            <span className="font-body text-xs text-charcoal/60">
              {detecting ? "Detecting your currency…" : "Prices shown in:"}
            </span>
            <div className="relative">
              <select
                value={currency}
                onChange={handleCurrencyChange}
                aria-label="Display currency"
                className="appearance-none font-body text-sm pl-4 pr-9 py-2 rounded-full border border-forest/25 bg-white text-forest font-semibold hover:border-gold focus:outline-none focus:ring-2 focus:ring-gold/40 cursor-pointer transition-all"
              >
                {Object.entries(CURRENCY_RATES).map(([code, info]) => (
                  <option key={code} value={code}>
                    {info.symbol} {code} — {info.label}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={14}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-forest/60"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-7">
          {PACKAGES.map((pkg, i) => (
            <PackageCard key={pkg.id} pkg={pkg} index={i} currency={currency} />
          ))}
        </div>
      </div>
    </SectionReveal>
  );
};

export default Packages;
