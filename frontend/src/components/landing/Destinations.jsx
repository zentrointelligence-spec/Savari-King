import { motion } from "framer-motion";
import { ArrowRight, MapPin } from "lucide-react";
import SectionReveal from "./SectionReveal";
import { DESTINATIONS } from "./constants";

const Destinations = () => {
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
            Three iconic regions. One seamless private journey.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {DESTINATIONS.map((dest, index) => (
            <motion.article
              key={dest.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08, duration: 0.6 }}
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
              <div className="absolute inset-0 bg-gradient-to-t from-forest/95 via-forest/45 to-transparent" />

              <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-end">
                <div className="flex items-center gap-2 text-gold mb-2">
                  <MapPin size={14} />
                  <span className="font-accent text-xs tracking-[0.2em] uppercase">
                    {dest.name}
                  </span>
                </div>
                <h3 className="font-display text-2xl md:text-3xl text-ivory font-semibold mb-3">
                  {dest.name}
                </h3>
                <p className="font-body text-ivory/85 text-sm leading-relaxed mb-4 line-clamp-3 group-hover:line-clamp-none transition-all">
                  {dest.hook}
                </p>
                <ul className="hidden group-hover:flex flex-wrap gap-2 mb-4">
                  {dest.highlights.map((h) => (
                    <li
                      key={h}
                      className="font-body text-xs text-ivory/90 bg-ivory/15 backdrop-blur-sm px-2.5 py-1 rounded-full"
                    >
                      {h}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => {
                    const source = `Destination Card: ${dest.name}`;
                    console.log("Lead Source Tracker -> Source:", source);
                    scrollTo();
                  }}
                  className="flex items-center gap-2 font-body text-gold text-sm font-semibold group-hover:gap-3 transition-all"
                >
                  View Packages <ArrowRight size={16} />
                </button>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </SectionReveal>
  );
};

export default Destinations;
