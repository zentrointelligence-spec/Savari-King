import React from "react";
import { buildWhatsAppUrl } from "../../config/external";

const FloatingWhatsApp = () => {
  const whatsappUrl = buildWhatsAppUrl();

  return (
    <a
      href={whatsappUrl}
      className="fixed bottom-8 right-8 w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white shadow-lg z-50 transition-transform transform hover:scale-110"
      target="_blank"
      rel="noopener noreferrer"
      title="Contact us on WhatsApp"
    >
      <i className="fab fa-whatsapp text-3xl"></i>
    </a>
  );
};

export default FloatingWhatsApp;
