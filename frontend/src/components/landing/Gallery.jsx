import { motion } from "framer-motion";
import SectionReveal from "./SectionReveal";
import { GALLERY_IMAGES } from "./constants";

const Gallery = () => (
  <SectionReveal id="gallery" className="bg-forest py-20 md:py-28">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-14">
        <p className="font-accent text-gold text-xs tracking-[0.3em] uppercase mb-3">
          Gallery
        </p>
        <h2 className="font-display text-4xl md:text-5xl text-ivory font-semibold">
          South India in Frames
        </h2>
      </div>

      <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
        {GALLERY_IMAGES.map((img, index) => (
          <motion.div
            key={img.alt}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.05, duration: 0.5 }}
            className={`break-inside-avoid overflow-hidden rounded-sm group ${
              img.tall ? "sm:mb-8" : img.wide ? "" : ""
            }`}
          >
            <div className="relative overflow-hidden border border-transparent group-hover:border-gold/50 transition-all duration-300">
              <img
                src={img.src}
                alt={img.alt}
                loading="lazy"
                className={`w-full object-cover transition-transform duration-700 group-hover:scale-105 ${
                  img.tall ? "h-80 sm:h-96" : img.wide ? "h-56" : "h-64"
                }`}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-forest/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                <p className="font-body text-xs text-ivory/90">{img.alt}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </SectionReveal>
);

export default Gallery;
