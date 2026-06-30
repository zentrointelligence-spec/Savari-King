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
  <SectionReveal id="why-us" className="bg-ivory dark:bg-[#0D160D] py-20 md:py-28">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-14">
        <p className="font-accent text-terracotta text-xs tracking-[0.3em] uppercase mb-3">
          Why Choose Us
        </p>
        <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-forest dark:text-gold font-semibold">
          Every Traveller Deserves the Best
        </h2>
        <p className="font-body text-charcoal/70 dark:text-ivory/60 mt-4 max-w-2xl mx-auto">
          Whether you're from London or Chennai, Dubai or Delhi — every guest
          gets the same private vehicle, honest pricing, and warm hospitality.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {WHY_CHOOSE_US.map((item, index) => {
          const Icon = iconMap[item.icon];
          return (
            <div
              key={item.title}
              className="group p-6 md:p-8 border border-charcoal/10 dark:border-ivory/10 rounded-sm hover:border-gold/50 hover:-translate-y-1 transition-all duration-300 hover:shadow-[0_12px_40px_rgba(201,168,76,0.12)] dark:bg-[#111F11]"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-12 h-12 rounded-sm bg-forest/5 flex items-center justify-center mb-5 group-hover:bg-gold/10 transition-colors">
                <Icon size={22} className="text-gold" />
              </div>
              <h3 className="font-display text-xl text-forest dark:text-ivory font-semibold mb-3">
                {item.title}
              </h3>
              <p className="font-body text-sm text-charcoal/70 dark:text-ivory/60 leading-relaxed">
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
