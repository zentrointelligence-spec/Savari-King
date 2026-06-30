import { motion } from "framer-motion";
import { Quote, MapPin } from "lucide-react";
import SectionReveal from "./SectionReveal";
import { BRAND, buildWhatsAppLink } from "./constants";
import FounderImage from "./FounderImage";

const FounderSection = () => (
  <SectionReveal className="bg-ivory dark:bg-[#0D160D] py-20 md:py-28">
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <p className="font-accent text-terracotta text-xs tracking-[0.3em] uppercase mb-3">
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
        className="bg-white dark:bg-[#1A2A1A] border border-charcoal/10 dark:border-ivory/10 rounded-sm overflow-hidden shadow-[0_20px_60px_rgba(26,46,26,0.08)] hover:border-gold/40 transition-all"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 lg:items-stretch">
          <div className="relative">
            <FounderImage className="h-full min-h-[420px] lg:min-h-full" />
            <div className="absolute bottom-6 left-6 right-6 z-10">
              <p className="font-accent text-gold text-xs tracking-[0.25em] uppercase mb-1">
                Founder & Chief Guide
              </p>
              <h3 className="font-display text-3xl text-ivory font-semibold">
                Mr. Sundar Mesiadhas
              </h3>
              <p className="font-body text-ivory/80 text-sm mt-2 flex items-center gap-1.5">
                <MapPin size={14} className="text-gold" />
                Trivandrum–Nagercoil Highway, Tamil Nadu
              </p>
            </div>
          </div>

          <div className="p-8 md:p-12 flex flex-col justify-center">
            <Quote size={36} className="text-gold/30 mb-6" />
            <blockquote className="font-display text-2xl md:text-3xl text-forest dark:text-gold font-semibold leading-snug mb-6">
              &ldquo;I don&apos;t just show you places. I welcome you to my home.&rdquo;
            </blockquote>
            <p className="font-body text-charcoal/70 dark:text-ivory/60 leading-relaxed mb-4">
              Known across South India for his warmth and professionalism, Mr. Sundar
              personally ensures every guest — whether from London or Chennai, Dubai or
              Delhi — feels safe, respected, and truly cared for from the first hello
              to the final farewell.
            </p>
            <p className="font-body text-charcoal/70 dark:text-ivory/60 leading-relaxed mb-8">
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
              className="inline-flex items-center justify-center font-body font-semibold bg-forest text-ivory px-8 py-4 rounded-sm hover:bg-charcoal transition-all w-full sm:w-auto"
            >
              Message Mr. Sundar on WhatsApp
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  </SectionReveal>
);

export default FounderSection;
