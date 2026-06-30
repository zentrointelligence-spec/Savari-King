import {
  Car,
  Plane,
  UtensilsCrossed,
  Shield,
  Languages,
  SlidersHorizontal,
} from "lucide-react";
import SectionReveal from "./SectionReveal";
import { WHY_CHOOSE_US } from "./constants";

const iconMap = {
  car: Car,
  plane: Plane,
  utensils: UtensilsCrossed,
  shield: Shield,
  languages: Languages,
  sliders: SlidersHorizontal,
};

const WhyChooseUs = () => (
  <SectionReveal id="why-us" className="bg-ivory py-20 md:py-28">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-14">
        <p className="font-accent text-gold-deep text-xs tracking-[0.3em] uppercase mb-3">
          Why Choose Us
        </p>
        <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-forest font-semibold">
          Every Traveller Deserves the Best
        </h2>
        <p className="font-body text-charcoal/70 mt-4 max-w-2xl mx-auto">
          Whether you&apos;re from London or Chennai, Dubai or Delhi — every guest
          gets the same private vehicle, honest pricing, and warm hospitality.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-7">
        {WHY_CHOOSE_US.map((item) => {
          const Icon = iconMap[item.icon];
          return (
            <div
              key={item.title}
              className="group p-7 md:p-8 bg-white rounded-2xl border border-forest/10 hover:border-gold/50 hover:-translate-y-1.5 transition-all duration-300 hover:shadow-[0_20px_50px_rgba(26,46,26,0.1)]"
            >
              <div className="w-14 h-14 rounded-2xl bg-forest-mist flex items-center justify-center mb-5 group-hover:bg-gold-soft transition-colors">
                <Icon size={24} className="text-gold-deep" />
              </div>
              <h3 className="font-display text-xl text-forest font-semibold mb-3">
                {item.title}
              </h3>
              <p className="font-body text-sm text-charcoal/75 leading-relaxed">
                {item.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  </SectionReveal>
);

export default WhyChooseUs;
