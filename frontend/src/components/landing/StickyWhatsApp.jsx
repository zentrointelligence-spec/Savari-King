import { MessageCircle } from "lucide-react";
import { buildWhatsAppLink } from "./constants";

const StickyWhatsApp = () => (
  <a
    href={buildWhatsAppLink()}
    target="_blank"
    rel="noopener noreferrer"
    onClick={() => {
      const source = `Sticky Mobile WhatsApp`;
      console.log("Lead Source Tracker -> Source:", source);
    }}
    className="fixed bottom-0 left-0 right-0 z-50 md:hidden flex items-center justify-center gap-2 bg-[#25D366] text-white font-body font-semibold py-4 shadow-[0_-4px_20px_rgba(0,0,0,0.3)] animate-cta-pulse"
    aria-label="Chat on WhatsApp"
  >
    <MessageCircle size={20} />
    WhatsApp Us Now
  </a>
);

export default StickyWhatsApp;
