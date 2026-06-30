import { motion } from "framer-motion";
import { Quote, MapPin, MessageCircle } from "lucide-react";
import SectionReveal from "./SectionReveal";
import { BRAND, buildWhatsAppLink } from "./constants";
import FounderImage from "./FounderImage";

const FounderSection = () => (
  <SectionReveal className="bg-forest-mist py-20 md:py-28">
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <p className="font-accent text-gold-deep text-xs tracking-[0.3em] uppercase mb-3">
          Your Host
        </p>
        <h2 className="font-display text-4xl md:text-5xl text-forest font-semibold">
          Meet Mr. Sundar Mesiadhas
        </h2>
        <p className="font-body text-charcoal/70 mt-4 max-w-2xl mx-auto">
          Founder of {BRAND.name} — the friendliest guide in South India.
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="bg-white rounded-3xl overflow-hidden border border-forest/10 shadow-[0_30px_80px_rgba(26,46,26,0.1)]"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 lg:items-stretch">
          <div className="relative min-h-[380px] lg:min-h-full">
            <FounderImage className="h-full" />
            <div className="absolute bottom-6 left-6 right-6 z-10">
              <p className="font-accent text-gold text-xs tracking-[0.25em] uppercase mb-1">
                Founder &amp; Chief Guide
              </p>
              <h3 className="font-display text-3xl text-ivory font-semibold drop-shadow-[0_2px_12px_rgba(0,0,0,0.4)]">
                Mr. Sundar Mesiadhas
              </h3>
              <p className="font-body text-ivory/90 text-sm mt-2 flex items-center gap-1.5">
                <MapPin size={14} className="text-gold" />
                Trivandrum–Nagercoil Highway, Tamil Nadu
              </p>
            </div>
          </div>

          <div className="p-8 md:p-12 flex flex-col justify-center">
            <Quote size={40} className="text-gold/40 mb-5" />
            <blockquote className="font-display text-2xl md:text-3xl text-forest font-semibold leading-snug mb-6">
              &ldquo;I don&apos;t just show you places. I welcome you to my home.&rdquo;
            </blockquote>
            <p className="font-body text-charcoal/75 leading-relaxed mb-4">
              Known across South India for his warmth and professionalism, Mr. Sundar
              personally ensures every guest — whether from London or Chennai, Dubai or
              Delhi — feels safe, respected, and truly cared for from the first hello
              to the final farewell.
            </p>
            <p className="font-body text-charcoal/75 leading-relaxed mb-8">
              With decades of local route knowledge, he turns every journey into a
              story — a Kanniyakumari sunrise, a Kovalam evening, a hidden temple
              only the locals know. Anyone who visits South India deserves a guide
              like Mr. Sundar.
            </p>
            <a
              href={buildWhatsAppLink(
                "Hi Mr. Sundar, I'd like to plan a South India tour with Ebenezer Tours."
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 font-body font-semibold bg-forest text-ivory px-8 py-4 rounded-full hover:bg-forest-soft transition-all w-full sm:w-auto sm:self-start shadow-[0_10px_25px_rgba(26,46,26,0.18)]"
            >
              <MessageCircle size={18} className="text-gold" />
              Message Mr. Sundar on WhatsApp
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  </SectionReveal>
);

export default FounderSection;
