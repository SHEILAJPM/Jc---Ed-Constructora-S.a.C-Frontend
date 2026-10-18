import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

/** Cortina de color que cubre la página al salir y se retira al entrar (solo transform/opacity). */
export default function PageTransition({ children }: { children: ReactNode }) {
  const reducido = useReducedMotion();
  if (reducido) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
        {children}
      </motion.div>
    );
  }
  return (
    <div className="relative">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0, transition: { delay: 0.35, duration: 0.6, ease: [0.22, 1, 0.36, 1] } }}
        exit={{ opacity: 0, transition: { duration: 0.2 } }}
      >
        {children}
      </motion.div>
      {/* Cortina */}
      <motion.div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[70] origin-bottom bg-gradient-to-b from-ambar to-naranja"
        initial={{ scaleY: 1 }}
        animate={{ scaleY: 0, transition: { duration: 0.55, ease: [0.76, 0, 0.24, 1] } }}
        exit={{ scaleY: 1, transition: { duration: 0.45, ease: [0.76, 0, 0.24, 1] } }}
        style={{ transformOrigin: "top" }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[69] bg-noche"
        initial={{ scaleY: 1 }}
        animate={{ scaleY: 0, transition: { delay: 0.1, duration: 0.55, ease: [0.76, 0, 0.24, 1] } }}
        exit={{ scaleY: 1, transition: { duration: 0.45, ease: [0.76, 0, 0.24, 1] } }}
        style={{ transformOrigin: "top" }}
      />
    </div>
  );
}
