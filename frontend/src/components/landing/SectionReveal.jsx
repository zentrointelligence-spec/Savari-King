import { motion } from "framer-motion";

const SectionReveal = ({
  children,
  className = "",
  delay = 0,
  id,
  as: Component = "section",
}) => (
  <Component id={id} className={className}>
    <motion.div
      initial={{ opacity: 0, y: 48 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  </Component>
);

export default SectionReveal;
