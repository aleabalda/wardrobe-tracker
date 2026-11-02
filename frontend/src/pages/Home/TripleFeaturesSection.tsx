import { FeatureCard } from "../../components/ui/FeatureCard";
import organizedClothes from "../../assets/images/organizedClothes.jpg";
import singleShirt from "../../assets/images/singleShirt.jpg";
import tryingOnClothes from "../../assets/images/tryingOnClothes.jpg";
import { Eyebrow, Reveal } from "./shared";

const FEATURES = [
  {
    image: organizedClothes,
    headline: "Your entire wardrobe, finally organized",
    text: "Stop digging through piles of clothes. Catalogue every item by type, colour, season, or style, and instantly find pieces you forgot you even owned.",
    className: "lg:col-span-2",
  },
  {
    image: tryingOnClothes,
    headline: "Create outfits before you try them on",
    text: "Mix and match your wardrobe digitally to plan outfits in seconds. Visualize your looks, save your favourites, and get styling inspiration effortlessly.",
    className: "",
  },
  {
    image: singleShirt,
    headline: "Refresh your style, not your budget",
    text: "Sell the clothes you don't wear and discover unique pieces from others' wardrobes. Clear space, earn money, and build a wardrobe that evolves with you.",
    className: "lg:col-span-3 lg:min-h-[22rem]",
  },
];

export const TripleFeaturesSection = () => {
  return (
    <section className="mx-auto w-full max-w-7xl px-6 py-24 md:px-12 lg:py-32">
      <Reveal className="mb-14 flex flex-col items-start gap-4 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col gap-4">
          <Eyebrow>Everything in one place</Eyebrow>
          <h2 className="max-w-xl font-display text-4xl leading-tight font-bold text-neutral-900 sm:text-5xl">
            Everything your closet <span className="italic text-amber-600">needs.</span>
          </h2>
        </div>
        <p className="max-w-sm text-neutral-600">
          From cataloguing to styling to selling, Wardrobe.io covers the whole
          life of your clothes.
        </p>
      </Reveal>

      <div className="grid gap-6 lg:grid-cols-3">
        {FEATURES.map((feature, i) => (
          <Reveal key={feature.headline} delay={i * 0.1} className={`flex ${feature.className}`}>
            <FeatureCard
              index={i + 1}
              image={feature.image}
              headline={feature.headline}
              text={feature.text}
              className="w-full"
            />
          </Reveal>
        ))}
      </div>
    </section>
  );
};
