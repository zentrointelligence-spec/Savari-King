import { Car, Plane, UtensilsCrossed, Globe, Headphones, Star } from "lucide-react";
import SectionReveal from "./SectionReveal";

const items = [
  { icon: Star, label: "25 Years Experience" },
  { icon: Car, label: "Private Innova" },
  { icon: Plane, label: "Airport Transfers" },
  { icon: UtensilsCrossed, label: "Complimentary Meal" },
  { icon: Globe, label: "English Guide" },
  { icon: Headphones, label: "24/7 Support" },
];

const TrustStrip = () => (
  <SectionReveal id="trust" className="bg-charcoal dark:bg-[#0A0A0A] border-y border-gold/20">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex flex-wrap justify-center gap-x-8 gap-y-4">
        {items.map(({ icon: Icon, label }, i) => (
          <div
            key={label}
            className="flex items-center gap-2 text-ivory/90 font-body text-sm sm:text-base"
          >
            {i > 0 && (
              <span className="hidden sm:inline text-gold/40 mr-4">·</span>
            )}
            <Icon size={18} className="text-gold flex-shrink-0" />
            <span>{label}</span>
          </div>
        ))}
      </div>
    </div>
  </SectionReveal>
);

export default TrustStrip;
