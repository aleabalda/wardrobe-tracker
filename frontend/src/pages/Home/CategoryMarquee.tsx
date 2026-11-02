const CATEGORIES = [
  "Tops",
  "Bottoms",
  "Outerwear",
  "Dresses",
  "Shoes",
  "Accessories",
  "Vintage finds",
  "Everyday essentials",
  "Statement fits",
];

export const CategoryMarquee = () => {
  // Rendered twice so the -50% translate loops seamlessly
  const items = [...CATEGORIES, ...CATEGORIES];

  return (
    <section
      aria-label="Categories"
      className="overflow-hidden border-y border-black/10 bg-amber-500 py-5"
    >
      <ul className="flex w-max animate-marquee items-center gap-10 whitespace-nowrap">
        {items.map((item, i) => (
          <li
            key={i}
            aria-hidden={i >= CATEGORIES.length}
            className="flex items-center gap-10 font-display text-2xl font-semibold text-black italic sm:text-3xl"
          >
            {item}
            <span className="text-base not-italic">✦</span>
          </li>
        ))}
      </ul>
    </section>
  );
};
