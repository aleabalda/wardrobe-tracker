import foldingClothes from "../../assets/images/foldingClothes.jpg";
import organizedClothes from "../../assets/images/organizedClothes.jpg";
import { CtaButton, Eyebrow, Reveal } from "./shared";
import { useCtaTarget } from "./useCtaTarget";

const POINTS = [
  "Tag items by colour, category, or season",
  "Edit or remove pieces with a single click",
  "Access your whole closet from anywhere",
];

const CheckIcon = () => (
  <svg
    viewBox="0 0 20 20"
    className="size-5 shrink-0 text-amber-500"
    fill="currentColor"
    aria-hidden
  >
    <path
      fillRule="evenodd"
      d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z"
      clipRule="evenodd"
    />
  </svg>
);

export const MainFeatureSection = () => {
  const target = useCtaTarget("/wardrobe");

  return (
    <section className="mx-auto grid w-full max-w-7xl items-center gap-16 px-6 py-24 md:px-12 lg:grid-cols-2 lg:py-32">
      {/* Layered image composition */}
      <Reveal className="relative mx-auto w-full max-w-lg lg:mx-0">
        <div className="absolute -left-4 -top-4 h-full w-full rounded-3xl border-2 border-amber-500/60" />
        <img
          src={foldingClothes}
          alt="Person folding clothes"
          className="relative aspect-4/5 w-full rounded-3xl object-cover shadow-2xl"
        />
        <img
          src={organizedClothes}
          alt=""
          className="absolute -bottom-10 -right-4 hidden w-44 rounded-2xl border-4 border-white object-cover shadow-xl sm:block sm:aspect-square lg:-right-10"
        />
        <div className="absolute left-6 top-6 animate-float rounded-2xl border border-white/40 bg-white/80 px-4 py-3 shadow-lg backdrop-blur-md">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-500">
            Tagged
          </p>
          <div className="mt-1.5 flex gap-1.5">
            {["Knitwear", "Autumn", "Navy"].map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-neutral-900 px-2.5 py-0.5 text-xs font-medium text-white"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </Reveal>

      <Reveal delay={0.15} className="flex flex-col gap-6">
        <Eyebrow>01 — Organize</Eyebrow>
        <h2 className="font-display text-4xl leading-tight font-bold text-neutral-900 sm:text-5xl">
          Your wardrobe,{" "}
          <span className="italic text-amber-600">reimagined.</span>
        </h2>
        <p className="text-lg text-neutral-600">
          Create a digital wardrobe of everything you own, from everyday
          essentials to statement fits, all in one place. Whether you're
          planning outfits for the week or cataloguing your favourite looks,
          Rehang helps you see your style from a new perspective.
        </p>
        <ul className="flex flex-col gap-3">
          {POINTS.map((point) => (
            <li
              key={point}
              className="flex items-center gap-3 text-neutral-800"
            >
              <CheckIcon />
              {point}
            </li>
          ))}
        </ul>
        <div className="mt-2">
          <CtaButton to={target} variant="dark">
            Add to your wardrobe
          </CtaButton>
        </div>
      </Reveal>
    </section>
  );
};
