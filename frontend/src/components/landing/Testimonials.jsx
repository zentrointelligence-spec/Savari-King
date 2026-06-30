import { Star, Quote } from "lucide-react";
import SectionReveal from "./SectionReveal";
import { TESTIMONIALS } from "./constants";

const Testimonials = () => (
  <SectionReveal className="bg-ivory py-20 md:py-28">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-14">
        <p className="font-accent text-gold-deep text-xs tracking-[0.3em] uppercase mb-3">
          Testimonials
        </p>
        <h2 className="font-display text-4xl md:text-5xl text-forest font-semibold">
          Guests From Around the World &amp; Across India
        </h2>
        <p className="font-body text-charcoal/70 mt-4 max-w-xl mx-auto">
          Foreign visitors and Indian travellers alike — everyone has a story with us.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-7">
        {TESTIMONIALS.map((t) => (
          <blockquote
            key={t.author}
            className="relative p-7 md:p-8 bg-white border border-forest/10 rounded-2xl hover:border-gold/40 hover:-translate-y-1 transition-all duration-300 hover:shadow-[0_20px_50px_rgba(26,46,26,0.1)] flex flex-col"
          >
            <Quote size={36} className="text-gold/25 absolute top-6 right-6" />
            <div className="flex gap-0.5 mb-4">
              {Array.from({ length: t.rating }).map((_, i) => (
                <Star key={i} size={15} className="text-gold-deep fill-gold" />
              ))}
            </div>
            <p className="font-body text-sm text-charcoal/80 leading-relaxed mb-6 italic flex-1">
              &ldquo;{t.quote}&rdquo;
            </p>
            <footer className="flex items-center gap-3 border-t border-forest/10 pt-5">
              {t.flag && (
                <span className="text-2xl leading-none" role="img" aria-label={t.location}>
                  {t.flag}
                </span>
              )}
              <div>
                <cite className="font-display text-lg text-forest not-italic font-semibold block">
                  {t.author}
                </cite>
                <p className="font-body text-xs text-charcoal/60 mt-0.5">
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
