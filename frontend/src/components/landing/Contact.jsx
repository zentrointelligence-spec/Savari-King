import { useState } from "react";
import {
  MessageCircle,
  Phone,
  Mail,
  MapPin,
  Clock,
} from "lucide-react";
import SectionReveal from "./SectionReveal";
import {
  BRAND,
  TOUR_OPTIONS,
  buildWhatsAppLink,
  buildInquiryMessage,
} from "./constants";

const Contact = () => {
  const [form, setForm] = useState({
    name: "",
    country: "",
    dates: "",
    groupSize: "",
    tour: TOUR_OPTIONS[0],
    message: "",
  });

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const message = buildInquiryMessage(form);
    const source = window.location.pathname === '/' ? 'Home Page - Contact Section' : `Page: ${window.location.pathname}`;
    // We would typically send the lead source to the backend here
    console.log("Lead Source Tracker -> Source:", source);
    window.open(buildWhatsAppLink(message), "_blank", "noopener,noreferrer");
  };

  const contactItems = [
    {
      icon: MessageCircle,
      label: "WhatsApp (Primary)",
      value: BRAND.phoneDisplay,
      href: buildWhatsAppLink(),
    },
    {
      icon: Phone,
      label: "Call",
      value: BRAND.phoneDisplay,
      href: `tel:+${BRAND.phone}`,
    },
    {
      icon: Mail,
      label: "Email",
      value: BRAND.email,
      href: `mailto:${BRAND.email}`,
    },
    {
      icon: MapPin,
      label: "Address",
      value: BRAND.address,
      href: BRAND.mapLink,
    },
    {
      icon: Clock,
      label: "Response Time",
      value: BRAND.responseTime,
    },
  ];

  return (
    <SectionReveal id="contact" className="bg-ivory dark:bg-[#0D160D] py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="font-accent text-terracotta text-xs tracking-[0.3em] uppercase mb-3">
            Contact
          </p>
          <h2 className="font-display text-4xl md:text-5xl text-forest dark:text-gold font-semibold">
            Plan Your Perfect Trip
          </h2>
          <p className="font-body text-charcoal/70 dark:text-ivory/60 mt-4 max-w-xl mx-auto">
            Indian or international — everyone is welcome. Tell us your dates
            and we will craft a trip made just for you.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          <div className="space-y-6">
            {contactItems.map((item) => {
              const Icon = item.icon;
              const content = (
                <div className="flex items-start gap-4 p-4 rounded-sm hover:bg-white transition-colors">
                  <div className="w-10 h-10 rounded-sm bg-forest/5 flex items-center justify-center flex-shrink-0">
                    <Icon size={18} className="text-gold" />
                  </div>
                  <div>
                    <p className="font-accent text-[10px] tracking-[0.15em] uppercase text-charcoal/40">
                      {item.label}
                    </p>
                    <p className="font-body text-sm text-charcoal mt-1">
                      {item.value}
                    </p>
                  </div>
                </div>
              );
              return item.href ? (
                <a
                  key={item.label}
                  href={item.href}
                  target={item.href.startsWith("http") ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  onClick={() => {
                    if (item.label.includes('WhatsApp')) {
                      const source = `Contact Section: WhatsApp Direct`;
                      console.log("Lead Source Tracker -> Source:", source);
                    }
                  }}
                  className="block"
                >
                  {content}
                </a>
              ) : (
                <div key={item.label}>{content}</div>
              );
            })}
          </div>

          <form
            onSubmit={handleSubmit}
            className="bg-white dark:bg-[#162016] p-6 md:p-8 border border-charcoal/10 dark:border-ivory/10 rounded-sm shadow-sm"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="font-body text-xs text-charcoal/60 mb-1 block">
                  Name
                </label>
                <input
                  name="name"
                  required
                  value={form.name}
                  onChange={handleChange}
                  className="w-full font-body text-sm border border-charcoal/15 dark:border-ivory/10 rounded-sm px-4 py-3 focus:outline-none focus:border-gold bg-ivory/50 dark:bg-[#0D160D] dark:text-ivory"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="font-body text-xs text-charcoal/60 mb-1 block">
                  Country / City
                </label>
                <input
                  name="country"
                  required
                  value={form.country}
                  onChange={handleChange}
                  className="w-full font-body text-sm border border-charcoal/15 dark:border-ivory/10 rounded-sm px-4 py-3 focus:outline-none focus:border-gold bg-ivory/50 dark:bg-[#0D160D] dark:text-ivory"
                  placeholder="UK · Chennai · Dubai · Delhi…"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="font-body text-xs text-charcoal/60 mb-1 block">
                  Travel Dates
                </label>
                <input
                  name="dates"
                  required
                  value={form.dates}
                  onChange={handleChange}
                  className="w-full font-body text-sm border border-charcoal/15 dark:border-ivory/10 rounded-sm px-4 py-3 focus:outline-none focus:border-gold bg-ivory/50 dark:bg-[#0D160D] dark:text-ivory"
                  placeholder="e.g. March 2025"
                />
              </div>
              <div>
                <label className="font-body text-xs text-charcoal/60 mb-1 block">
                  Group Size
                </label>
                <input
                  name="groupSize"
                  required
                  value={form.groupSize}
                  onChange={handleChange}
                  className="w-full font-body text-sm border border-charcoal/15 dark:border-ivory/10 rounded-sm px-4 py-3 focus:outline-none focus:border-gold bg-ivory/50 dark:bg-[#0D160D] dark:text-ivory"
                  placeholder="2 adults, 1 child"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="font-body text-xs text-charcoal/60 mb-1 block">
                Interested Tour
              </label>
              <select
                name="tour"
                value={form.tour}
                onChange={handleChange}
                className="w-full font-body text-sm border border-charcoal/15 dark:border-ivory/10 rounded-sm px-4 py-3 focus:outline-none focus:border-gold bg-ivory/50 dark:bg-[#0D160D] dark:text-ivory"
              >
                {TOUR_OPTIONS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-6">
              <label className="font-body text-xs text-charcoal/60 mb-1 block">
                Message
              </label>
              <textarea
                name="message"
                rows={4}
                value={form.message}
                onChange={handleChange}
                className="w-full font-body text-sm border border-charcoal/15 dark:border-ivory/10 rounded-sm px-4 py-3 focus:outline-none focus:border-gold bg-ivory/50 dark:bg-[#0D160D] dark:text-ivory resize-none"
                placeholder="Tell us about your interests, dietary needs, or special requests..."
              />
            </div>

            <button
              type="submit"
              className="w-full font-body font-semibold bg-forest text-ivory py-4 rounded-sm hover:bg-charcoal transition-all flex items-center justify-center gap-2 animate-cta-pulse"
            >
              <MessageCircle size={18} />
              Send WhatsApp Inquiry
            </button>
          </form>
        </div>
      </div>
    </SectionReveal>
  );
};

export default Contact;
