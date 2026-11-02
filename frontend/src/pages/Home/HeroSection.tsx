import { motion } from "motion/react";
import heroImage from "../../assets/images/hero-wardrobe.jpg";
import { CtaButton } from "./shared";
import { useCtaTarget } from "./useCtaTarget";

const HEADLINE = ["Declutter.", "Discover."];
const PILLARS = [
  "Organize your closet",
  "Plan outfits",
  "Sell what you don't wear",
];

const ease = [0.22, 1, 0.36, 1] as const;

export const HeroSection = () => {
  const primaryTarget = useCtaTarget("/wardrobe");
  const secondaryTarget = useCtaTarget("/listings");

  return (
    <section className="relative isolate flex min-h-[min(90dvh,860px)] w-full items-center overflow-hidden bg-black text-white">
      {/* Slow zoom-out on the background photo */}
      <motion.img
        src={heroImage}
        alt=""
        initial={{ scale: 1.15 }}
        animate={{ scale: 1 }}
        transition={{ duration: 2.4, ease }}
        className="absolute inset-0 -z-20 h-full w-full object-cover"
      />
      <div className="absolute inset-0 -z-10 bg-linear-to-r from-black/90 via-black/60 to-black/20" />
      <div className="absolute inset-x-0 bottom-0 -z-10 h-40 bg-linear-to-t from-black/80 to-transparent" />
      <div className="absolute -left-32 top-1/3 -z-10 size-96 rounded-full bg-amber-500/20 blur-3xl" />

      <div className="mx-auto w-full max-w-7xl px-6 py-24 md:px-12">
        <motion.span
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease }}
          className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-medium tracking-wide backdrop-blur-md"
        >
          <span className="relative flex size-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-amber-400" />
          </span>
          Your closet, reimagined
        </motion.span>

        <h1 className="mt-6 max-w-4xl font-display text-5xl leading-[1.05] font-bold sm:text-7xl lg:text-8xl">
          {HEADLINE.map((word, i) => (
            <motion.span
              key={word}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.15 + i * 0.12, ease }}
              className="mr-4 inline-block"
            >
              {word}
            </motion.span>
          ))}
          <motion.span
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease }}
            className="inline-block bg-linear-to-r from-amber-300 to-amber-500 bg-clip-text italic text-transparent"
          >
            Do&nbsp;Good.
          </motion.span>
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6, ease }}
          className="mt-6 max-w-xl text-lg text-white/75 sm:text-xl"
        >
          Build your digital wardrobe, showcase your style, and turn your closet
          into a marketplace.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.75, ease }}
          className="mt-10 flex flex-wrap gap-4"
        >
          <CtaButton to={primaryTarget}>Create your wardrobe</CtaButton>
          <CtaButton to={secondaryTarget} variant="ghost">
            Browse listings
          </CtaButton>
        </motion.div>

        <motion.ul
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.1 }}
          className="mt-16 flex flex-wrap gap-x-8 gap-y-3 border-t border-white/15 pt-6 text-sm text-white/60"
        >
          {PILLARS.map((pillar, i) => (
            <li key={pillar} className="flex items-center gap-3">
              <span className="font-display text-amber-400 italic">
                0{i + 1}
              </span>
              {pillar}
            </li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
};
