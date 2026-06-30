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
  <SectionReveal id="trust" className="bg-white border-y border-forest/10">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-x-6 gap-y-5">
        {items.map(({ icon: Icon, label }) => (
          <div
            key={label}
            className="flex items-center justify-center gap-2.5 text-forest font-body text-sm sm:text-base text-center"
          >
            <Icon size={18} className="text-gold-deep flex-shrink-0" />
            <span className="font-medium">{label}</span>
          </div>
        ))}
      </div>
    </div>
  </SectionReveal>
);

export default TrustStrip;
