import { motion } from "motion/react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  show: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

/** Fades + slides its children up the first time it scrolls into view. */
export const Reveal = ({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) => (
  <motion.div
    variants={fadeUp}
    initial="hidden"
    whileInView="show"
    viewport={{ once: true, amount: 0.25 }}
    custom={delay}
    className={className}
  >
    {children}
  </motion.div>
);

export const Eyebrow = ({
  children,
  dark = false,
}: {
  children: ReactNode;
  dark?: boolean;
}) => (
  <span
    className={`inline-flex w-fit items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] ${
      dark ? "text-amber-400" : "text-amber-600"
    }`}
  >
    <span className="h-px w-8 bg-current" />
    {children}
  </span>
);

const ArrowIcon = () => (
  <svg
    viewBox="0 0 20 20"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    className="size-4 transition-transform duration-300 group-hover:translate-x-1"
    aria-hidden
  >
    <path d="M4 10h12m-5-5 5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const CtaButton = ({
  to,
  children,
  variant = "primary",
}: {
  to: string;
  children: ReactNode;
  variant?: "primary" | "ghost" | "dark";
}) => {
  const styles = {
    primary:
      "bg-amber-500 text-black hover:bg-amber-400 shadow-lg shadow-amber-500/25 hover:shadow-amber-400/40",
    ghost:
      "border border-white/30 bg-white/10 text-white backdrop-blur-md hover:bg-white/20",
    dark: "bg-neutral-900 text-white hover:bg-black shadow-lg shadow-black/20",
  }[variant];

  return (
    <Link
      to={to}
      className={`group inline-flex w-fit items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold transition-all duration-300 hover:-translate-y-0.5 ${styles}`}
    >
      {children}
      <ArrowIcon />
    </Link>
  );
};
