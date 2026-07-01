import { useEffect, useRef, useState } from "react";
import { animate } from "framer-motion";

// Smoothly counts from the previous value to the next whenever `value` changes.
// `format` receives the current numeric value and returns a display string.
const AnimatedPrice = ({ value, format, className }) => {
  const [display, setDisplay] = useState(value);
  const prev = useRef(value);

  useEffect(() => {
    const from = prev.current;
    const to = value;
    if (from === to) return;
    const controls = animate(from, to, {
      duration: 0.6,
      ease: "easeOut",
      onUpdate: (v) => setDisplay(v),
    });
    prev.current = to;
    return () => controls.stop();
  }, [value]);

  return <span className={className}>{format(display)}</span>;
};

export default AnimatedPrice;
