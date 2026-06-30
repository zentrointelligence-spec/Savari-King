import SectionReveal from "./SectionReveal";
import { HOW_IT_WORKS } from "./constants";

const HowItWorks = () => (
  <SectionReveal className="bg-white py-20 md:py-28">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <p className="font-accent text-gold-deep text-xs tracking-[0.3em] uppercase mb-3">
          How It Works
        </p>
        <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-forest font-semibold">
          Three Simple Steps
        </h2>
      </div>

      <div className="relative grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12">
        <div className="hidden md:block absolute top-12 left-[16.67%] right-[16.67%] h-px bg-gold/35" />

        {HOW_IT_WORKS.map((step) => (
          <div key={step.step} className="relative text-center">
            <div className="w-24 h-24 mx-auto rounded-full border-2 border-gold/50 bg-white flex items-center justify-center mb-6 relative z-10 shadow-[0_10px_30px_rgba(201,168,76,0.18)]">
              <span className="font-display text-3xl text-forest font-semibold">
                {step.step}
              </span>
            </div>
            <h3 className="font-display text-xl text-forest font-semibold mb-3">
              {step.title}
            </h3>
            <p className="font-body text-sm text-charcoal/75 leading-relaxed max-w-xs mx-auto">
              {step.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  </SectionReveal>
);

export default HowItWorks;
