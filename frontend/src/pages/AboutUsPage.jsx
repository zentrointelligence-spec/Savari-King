import { motion } from "framer-motion";
import {
  Compass,
  MapPin,
  Star,
  Handshake,
  Headset,
  Leaf,
  Quote,
  MessageCircle,
} from "lucide-react";
import Navigation from "../components/landing/Navigation";
import Footer from "../components/landing/Footer";
import StickyWhatsApp from "../components/landing/StickyWhatsApp";
import FounderImage from "../components/landing/FounderImage";
import { BRAND, TESTIMONIALS, buildWhatsAppLink } from "../components/landing/constants";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] } },
};

const VALUES = [
  {
    icon: MapPin,
    title: "Local, Not Outsourced",
    description:
      "Every route, hotel and stop is personally scouted by Mr. Sundar — no subcontracted drivers, no surprises.",
  },
  {
    icon: Handshake,
    title: "Honest, All-In Pricing",
    description:
      "The price we quote is the price you pay. No hidden fuel surcharges, no last-minute 'convenience fees'.",
  },
  {
    icon: Leaf,
    title: "Small-Group, Personal",
    description:
      "We run private tours only — your own vehicle, your own pace, never herded into a bus with strangers.",
  },
  {
    icon: Headset,
    title: "Always Reachable",
    description:
      "WhatsApp support from 8am–10pm IST, with replies typically within 30 minutes — before, during and after your trip.",
  },
];

const STATS = [
  { value: "20+", label: "Years of Local Experience" },
  { value: "5,000+", label: "Travellers Guided" },
  { value: "98%", label: "5-Star Reviews" },
  { value: "12", label: "Signature Destinations" },
];

const AboutUsPage = () => (
  <div className="light font-body bg-ivory text-charcoal antialiased scroll-smooth min-h-screen overflow-x-hidden">
    <Navigation />

    <main>
      {/* Hero */}
      <section className="relative h-[70vh] min-h-[520px] overflow-hidden bg-forest">
        <img
          src="https://images.unsplash.com/photo-1609067641058-77305f0158f7?auto=format&fit=crop&w=1600&q=80"
          alt="Kanniyakumari sunrise, South India"
          className="absolute inset-0 w-full h-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-forest/95 via-forest/60 to-forest/30" />

        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="relative z-10 h-full flex flex-col justify-center items-center text-center px-4 sm:px-6 max-w-4xl mx-auto"
        >
          <p className="font-accent text-[#F2C75C] [text-shadow:0_1px_4px_rgba(0,0,0,0.7)] text-xs tracking-[0.3em] uppercase mb-4">
            About {BRAND.name}
          </p>
          <h1 className="font-display text-4xl md:text-6xl text-ivory font-semibold mb-6 drop-shadow-[0_2px_12px_rgba(0,0,0,0.5)]">
            {BRAND.tagline}
          </h1>
          <p className="font-body text-ivory/90 text-lg max-w-2xl [text-shadow:0_1px_3px_rgba(0,0,0,0.6)]">
            A family-run, driver-guided travel company built on one idea: treat every guest
            like family, not a booking number.
          </p>
        </motion.div>
      </section>

      {/* Founder spotlight */}
      <section className="bg-forest-mist py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="font-accent text-gold-deep text-xs tracking-[0.3em] uppercase mb-3">
              Your Host
            </p>
            <h2 className="font-display text-4xl md:text-5xl text-forest font-semibold">
              Meet Mr. Sundar Mesiadhas
            </h2>
            <p className="font-body text-charcoal/70 mt-4 max-w-2xl mx-auto">
              Traveling with {BRAND.name} means traveling with family.
            </p>
          </div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="bg-white rounded-3xl overflow-hidden border border-forest/10 shadow-[0_30px_80px_rgba(26,46,26,0.1)]"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="relative min-h-[380px] lg:min-h-full">
                <FounderImage className="h-full" />
                <div className="absolute bottom-6 left-6 right-6 z-10">
                  <p className="font-accent text-[#F2C75C] text-xs tracking-[0.25em] uppercase mb-1 [text-shadow:0_1px_4px_rgba(0,0,0,0.6)]">
                    Founder &amp; Chief Guide
                  </p>
                  <h3 className="font-display text-3xl text-ivory font-semibold drop-shadow-[0_2px_12px_rgba(0,0,0,0.4)]">
                    Mr. Sundar Mesiadhas
                  </h3>
                </div>
              </div>

              <div className="p-8 md:p-12 flex flex-col justify-center">
                <Quote size={36} className="text-gold/40 mb-6" />
                <h4 className="font-display text-2xl text-forest font-semibold mb-4">
                  &ldquo;I don&apos;t just show you places. I welcome you to my home.&rdquo;
                </h4>
                <p className="font-body text-charcoal/70 leading-relaxed mb-5">
                  Mr. Sundar is the heart and soul of {BRAND.name}. Known by our guests as the
                  friendliest guide in South India, he ensures every traveller feels completely
                  safe, deeply respected, and genuinely welcomed.
                </p>
                <p className="font-body text-charcoal/70 leading-relaxed mb-8">
                  Whether he&apos;s driving you personally in his pristine Innova or recommending
                  the best authentic local meal, his unmatched local knowledge and warm smile turn
                  a simple vacation into a lifelong memory.
                </p>
                <div className="flex gap-8">
                  {STATS.slice(0, 2).map((s) => (
                    <div key={s.label}>
                      <span className="block font-display text-3xl text-forest font-semibold">
                        {s.value}
                      </span>
                      <span className="font-body text-xs uppercase tracking-wider text-charcoal/50">
                        {s.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Mission */}
      <section className="bg-ivory py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            <div className="inline-flex items-center justify-center w-14 h-14 bg-forest rounded-full mb-6">
              <Compass size={24} className="text-gold" />
            </div>
            <h2 className="font-display text-4xl md:text-5xl text-forest font-semibold mb-6">
              Our Mission
            </h2>
            <p className="font-body text-charcoal/80 text-lg leading-relaxed mb-5">
              To share the real South India — its temples, its backwaters, its hill mist and its
              people — through private, driver-guided journeys that feel personal, safe and
              unforgettable.
            </p>
            <div className="bg-forest-mist p-7 rounded-2xl border border-forest/10">
              <Quote size={22} className="text-gold-deep mb-3" />
              <p className="font-body text-forest text-base italic leading-relaxed">
                Our vision is simple: become the most trusted name for private South India travel
                — one family, one journey at a time.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="grid grid-cols-2 gap-5"
          >
            {[
              "https://images.unsplash.com/photo-1571980844080-5568fbce49f7?auto=format&fit=crop&w=700&q=80",
              "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=700&q=80",
              "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=700&q=80",
              "https://images.unsplash.com/photo-1766051224978-a57732014f9a?auto=format&fit=crop&w=700&q=80",
            ].map((src, i) => (
              <motion.div
                key={src}
                whileHover={{ scale: 1.02, y: -4 }}
                className={`rounded-2xl overflow-hidden shadow-sm ${i % 2 === 1 ? "mt-8" : ""}`}
              >
                <img
                  src={src}
                  alt="South India scenery"
                  className="w-full h-64 object-cover"
                  loading="lazy"
                />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-forest-mist py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="font-accent text-gold-deep text-xs tracking-[0.3em] uppercase mb-3">
              Why Travellers Choose Us
            </p>
            <h2 className="font-display text-4xl md:text-5xl text-forest font-semibold">
              What We Stand For
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {VALUES.map((v) => (
              <motion.div
                key={v.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                whileHover={{ y: -6 }}
                className="bg-white p-7 rounded-2xl border border-forest/10 shadow-sm hover:shadow-[0_20px_50px_rgba(26,46,26,0.1)] transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-2xl bg-forest flex items-center justify-center mb-5">
                  <v.icon size={22} className="text-gold" />
                </div>
                <h3 className="font-display text-xl text-forest font-semibold mb-3">
                  {v.title}
                </h3>
                <p className="font-body text-sm text-charcoal/70 leading-relaxed">
                  {v.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-forest py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {STATS.map((s) => (
              <motion.div
                key={s.label}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
              >
                <div className="font-display text-4xl md:text-5xl text-gold font-semibold mb-2">
                  {s.value}
                </div>
                <div className="font-body text-ivory/80 text-sm uppercase tracking-wider">
                  {s.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials (reuse brand data) */}
      <section className="bg-ivory py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="font-accent text-gold-deep text-xs tracking-[0.3em] uppercase mb-3">
              Testimonials
            </p>
            <h2 className="font-display text-4xl md:text-5xl text-forest font-semibold">
              What Our Guests Say
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.slice(0, 3).map((t) => (
              <motion.blockquote
                key={t.author}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="relative p-7 bg-white border border-forest/10 rounded-2xl flex flex-col"
              >
                <Quote size={32} className="text-gold/25 absolute top-6 right-6" />
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} size={14} className="text-gold-deep fill-gold" />
                  ))}
                </div>
                <p className="font-body text-sm text-charcoal/80 leading-relaxed mb-6 italic flex-1">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <footer className="flex items-center gap-3 border-t border-forest/10 pt-5">
                  {t.flag && <span className="text-2xl leading-none">{t.flag}</span>}
                  <div>
                    <cite className="font-display text-base text-forest not-italic font-semibold block">
                      {t.author}
                    </cite>
                    <p className="font-body text-xs text-charcoal/60 mt-0.5">{t.location}</p>
                  </div>
                </footer>
              </motion.blockquote>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-forest-mist py-20">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
        >
          <h2 className="font-display text-3xl md:text-4xl text-forest font-semibold mb-4">
            Ready to Plan Your South India Journey?
          </h2>
          <p className="font-body text-charcoal/70 mb-8 max-w-xl mx-auto">
            Tell us your dates and we&apos;ll reply on WhatsApp within 30 minutes with a
            personalised itinerary.
          </p>
          <a
            href={buildWhatsAppLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 font-body text-sm font-semibold bg-forest text-ivory px-7 py-3.5 rounded-full hover:bg-forest-soft transition-all shadow-[0_8px_20px_rgba(26,46,26,0.18)]"
          >
            <MessageCircle size={16} className="text-gold" />
            Chat With Us on WhatsApp
          </a>
        </motion.div>
      </section>
    </main>

    <Footer />
    <StickyWhatsApp />
  </div>
);

export default AboutUsPage;
