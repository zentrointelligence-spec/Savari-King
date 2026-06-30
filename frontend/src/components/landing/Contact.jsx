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

const fieldClass =
  "w-full font-body text-sm text-charcoal border border-forest/15 rounded-xl px-4 py-3 focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/25 bg-white transition-all placeholder:text-charcoal/40";

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
    const source =
      window.location.pathname === "/"
        ? "Home Page - Contact Section"
        : `Page: ${window.location.pathname}`;
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
    <SectionReveal id="contact" className="bg-forest-mist py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="font-accent text-gold-deep text-xs tracking-[0.3em] uppercase mb-3">
            Contact
          </p>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-forest font-semibold">
            Plan Your Perfect Trip
          </h2>
          <p className="font-body text-charcoal/70 mt-4 max-w-xl mx-auto">
            Indian or international — everyone is welcome. Tell us your dates
            and we will craft a trip made just for you.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14">
          <div className="space-y-4">
            {contactItems.map((item) => {
              const Icon = item.icon;
              const content = (
                <div className="flex items-start gap-4 p-5 rounded-2xl bg-white border border-forest/10 hover:border-gold/40 hover:shadow-[0_12px_30px_rgba(26,46,26,0.08)] transition-all">
                  <div className="w-11 h-11 rounded-xl bg-forest-mist flex items-center justify-center flex-shrink-0">
                    <Icon size={18} className="text-gold-deep" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-accent text-[10px] tracking-[0.15em] uppercase text-charcoal/60">
                      {item.label}
                    </p>
                    <p className="font-body text-sm text-forest mt-1 break-words">
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
                    if (item.label.includes("WhatsApp")) {
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
            className="bg-white p-6 md:p-8 border border-forest/10 rounded-3xl shadow-[0_20px_60px_rgba(26,46,26,0.08)]"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="font-body text-xs font-medium text-forest mb-1.5 block">
                  Name
                </label>
                <input
                  name="name"
                  required
                  value={form.name}
                  onChange={handleChange}
                  className={fieldClass}
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="font-body text-xs font-medium text-forest mb-1.5 block">
                  Country / City
                </label>
                <input
                  name="country"
                  required
                  value={form.country}
                  onChange={handleChange}
                  className={fieldClass}
                  placeholder="UK · Chennai · Dubai · Delhi…"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="font-body text-xs font-medium text-forest mb-1.5 block">
                  Travel Dates
                </label>
                <input
                  name="dates"
                  required
                  value={form.dates}
                  onChange={handleChange}
                  className={fieldClass}
                  placeholder="e.g. March 2026"
                />
              </div>
              <div>
                <label className="font-body text-xs font-medium text-forest mb-1.5 block">
                  Group Size
                </label>
                <input
                  name="groupSize"
                  required
                  value={form.groupSize}
                  onChange={handleChange}
                  className={fieldClass}
                  placeholder="2 adults, 1 child"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="font-body text-xs font-medium text-forest mb-1.5 block">
                Interested Tour
              </label>
              <select
                name="tour"
                value={form.tour}
                onChange={handleChange}
                className={fieldClass}
              >
                {TOUR_OPTIONS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-6">
              <label className="font-body text-xs font-medium text-forest mb-1.5 block">
                Message
              </label>
              <textarea
                name="message"
                rows={4}
                value={form.message}
                onChange={handleChange}
                className={`${fieldClass} resize-none`}
                placeholder="Tell us about your interests, dietary needs, or special requests..."
              />
            </div>

            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-2 font-body font-semibold bg-forest text-ivory py-4 rounded-full hover:bg-forest-soft transition-all shadow-[0_12px_28px_rgba(26,46,26,0.2)]"
            >
              <MessageCircle size={18} className="text-gold" />
              Send WhatsApp Inquiry
            </button>
          </form>
        </div>
      </div>
    </SectionReveal>
  );
};

export default Contact;
