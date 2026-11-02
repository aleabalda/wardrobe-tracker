import messyClothes from "../../assets/images/messyClothes.jpg";
import singleShirt from "../../assets/images/singleShirt.jpg";
import { CtaButton, Eyebrow, Reveal } from "./shared";
import { useCtaTarget } from "./useCtaTarget";

export const SecondaryFeatureSection = () => {
  const target = useCtaTarget("/listings");

  return (
    <section className="relative overflow-hidden bg-neutral-950 text-white">
      <div className="absolute -right-40 top-0 size-128 rounded-full bg-amber-500/15 blur-3xl" />

      <div className="relative mx-auto grid w-full max-w-7xl items-center gap-16 px-6 py-24 md:px-12 lg:grid-cols-2 lg:py-32">
        <Reveal className="flex flex-col gap-6 lg:order-1">
          <Eyebrow dark>02 — Share</Eyebrow>
          <h2 className="font-display text-4xl leading-tight font-bold sm:text-5xl">
            Style worth <span className="italic text-amber-400">sharing.</span>
          </h2>
          <p className="text-xl font-medium text-white/90">
            Discover what real people are selling, and let others discover your
            style.
          </p>
          <p className="text-lg text-white/60">
            Your wardrobe isn't just storage, it's an expression of who you are.
            Turn your closet into a curated storefront: post pieces you've
            outgrown, shop items from wardrobes you admire, and be part of a
            community built on individuality.
          </p>
          <div className="mt-2">
            <CtaButton to={target}>List an item now</CtaButton>
          </div>
        </Reveal>

        <Reveal
          delay={0.15}
          className="relative mx-auto w-full max-w-lg lg:order-2 lg:mx-0 lg:justify-self-end"
        >
          <img
            src={messyClothes}
            alt="A pile of clothes ready to be listed"
            className="aspect-4/5 w-full rounded-3xl object-cover shadow-2xl ring-1 ring-white/10"
          />
          {/* Mock listing card */}
          <div className="absolute -bottom-8 -left-4 w-60 animate-float rounded-2xl bg-white p-3 text-neutral-900 shadow-2xl sm:-left-10">
            <img
              src={singleShirt}
              alt=""
              className="aspect-4/3 w-full rounded-xl object-cover"
            />
            <div className="mt-3 flex items-start justify-between gap-2 px-1 pb-1">
              <div>
                <p className="text-sm font-semibold">Classic white tee</p>
                <p className="text-xs text-neutral-500">Size M · Like new</p>
              </div>
              <span className="rounded-full bg-amber-500 px-2.5 py-1 text-xs font-bold">
                Listed
              </span>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
};
