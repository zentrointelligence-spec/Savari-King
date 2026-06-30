import { Star, Quote } from "lucide-react";
import SectionReveal from "./SectionReveal";
import { TESTIMONIALS } from "./constants";

const Testimonials = () => (
  <SectionReveal className="bg-ivory dark:bg-[#0D160D] py-20 md:py-28">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-14">
        <p className="font-accent text-terracotta text-xs tracking-[0.3em] uppercase mb-3">
          Testimonials
        </p>
        <h2 className="font-display text-4xl md:text-5xl text-forest font-semibold">
          Guests From Around the World &amp; Across India
        </h2>
        <p className="font-body text-charcoal/70 mt-4 max-w-xl mx-auto">
          Foreign visitors and Indian travellers alike — everyone has a story with us.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {TESTIMONIALS.map((t) => (
          <blockquote
            key={t.author}
            className="relative p-6 md:p-8 bg-white dark:bg-[#162016] border border-charcoal/10 dark:border-ivory/10 rounded-sm hover:border-gold/40 hover:-translate-y-1 transition-all duration-300 flex flex-col"
          >
            <Quote
              size={32}
              className="text-gold/20 absolute top-6 right-6"
            />
            <div className="flex gap-0.5 mb-4">
              {Array.from({ length: t.rating }).map((_, i) => (
                <Star
                  key={i}
                  size={14}
                  className="text-gold fill-gold"
                />
              ))}
            </div>
            <p className="font-body text-sm text-charcoal/80 dark:text-ivory/70 leading-relaxed mb-6 italic flex-1">
              &ldquo;{t.quote}&rdquo;
            </p>
            <footer className="flex items-center gap-3">
              {t.flag && (
                <span className="text-2xl leading-none" role="img" aria-label={t.location}>
                  {t.flag}
                </span>
              )}
              <div>
                <cite className="font-display text-lg text-forest dark:text-gold not-italic font-semibold block">
                  {t.author}
                </cite>
                <p className="font-body text-xs text-charcoal/50 mt-0.5">
                  {t.location}
                </p>
              </div>
            </footer>
          </blockquote>
        ))}
      </div>
    </div>
  </SectionReveal>
);

export default Testimonials;
