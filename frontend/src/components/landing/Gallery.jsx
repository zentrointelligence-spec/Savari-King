import { motion } from "framer-motion";
import SectionReveal from "./SectionReveal";
import { GALLERY_IMAGES } from "./constants";

const Gallery = () => (
  <SectionReveal id="gallery" className="bg-white py-20 md:py-28">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-14">
        <p className="font-accent text-gold-deep text-xs tracking-[0.3em] uppercase mb-3">
          Gallery
        </p>
        <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-forest font-semibold">
          South India in Frames
        </h2>
        <p className="font-body text-charcoal/70 mt-4 max-w-2xl mx-auto">
          A glimpse of the landscapes, temples and coastlines that await you.
        </p>
      </div>

      <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 md:gap-5 space-y-4 md:space-y-5">
        {GALLERY_IMAGES.map((img, index) => (
          <motion.div
            key={img.alt}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.04, duration: 0.5 }}
            className="break-inside-avoid overflow-hidden rounded-2xl group"
          >
            <div className="relative overflow-hidden shadow-sm hover:shadow-[0_18px_45px_rgba(26,46,26,0.18)] transition-shadow duration-500">
              <img
                src={img.src}
                alt={img.alt}
                loading="lazy"
                className={`w-full object-cover transition-transform duration-700 group-hover:scale-105 ${
                  img.tall ? "h-80 sm:h-96" : img.wide ? "h-56" : "h-64"
                }`}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-forest/80 via-forest/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-5">
                <p className="font-body text-sm text-ivory">{img.alt}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </SectionReveal>
);

export default Gallery;
