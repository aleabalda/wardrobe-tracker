import hangingClothes from "../../assets/images/hangingClothes.jpg";
import { CtaButton, Reveal } from "./shared";
import { useCtaTarget } from "./useCtaTarget";

export const FinalCTA = () => {
  const target = useCtaTarget("/wardrobe");

  return (
    <section className="mx-auto w-full max-w-7xl px-6 pb-24 md:px-12 lg:pb-32">
      <Reveal className="relative isolate overflow-hidden rounded-4xl px-6 py-24 text-center text-white shadow-2xl sm:py-32">
        <img
          src={hangingClothes}
          alt=""
          className="absolute inset-0 -z-20 h-full w-full object-cover object-top"
        />
        <div className="absolute inset-0 -z-10 bg-linear-to-br from-black/85 via-black/60 to-amber-900/60" />

        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-400">
          Start today — it's free
        </p>
        <h2 className="mx-auto mt-5 max-w-3xl font-display text-4xl leading-tight font-bold sm:text-6xl">
          Ready to take control of your{" "}
          <span className="italic text-amber-400">wardrobe?</span>
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-lg text-white/70">
          Organize what you own, style what you love, and pass on what you
          don't.
        </p>
        <div className="mt-10 flex justify-center">
          <CtaButton to={target}>Get started now</CtaButton>
        </div>
      </Reveal>
    </section>
  );
};
