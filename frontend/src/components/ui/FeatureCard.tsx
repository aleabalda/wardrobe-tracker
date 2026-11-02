export const FeatureCard = ({
  image,
  index,
  headline,
  text,
  className = "",
}: {
  image: string;
  index: number;
  headline: string;
  text: string;
  className?: string;
}) => {
  return (
    <article
      className={`group relative isolate flex min-h-104 flex-col justify-end overflow-hidden rounded-3xl p-7 text-white shadow-xl ${className}`}
    >
      <img
        src={image}
        alt=""
        className="absolute inset-0 -z-20 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
      />
      <div className="absolute inset-0 -z-10 bg-linear-to-t from-black/90 via-black/40 to-black/5 transition-colors duration-500 group-hover:from-black/95 group-hover:via-black/60" />

      <span className="absolute left-7 top-7 flex size-10 items-center justify-center rounded-full border border-white/30 bg-white/10 font-display text-sm italic backdrop-blur-md">
        0{index}
      </span>

      <h3 className="font-display text-2xl leading-snug font-bold sm:text-3xl">
        {headline}
      </h3>
      {/* Description expands on hover (always shown on touch devices) */}
      <div className="grid grid-rows-[1fr] transition-all duration-500 ease-out [@media(hover:hover)]:grid-rows-[0fr] [@media(hover:hover)]:group-hover:grid-rows-[1fr]">
        <p className="overflow-hidden text-sm leading-relaxed text-white/75 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:transition-opacity [@media(hover:hover)]:duration-500 [@media(hover:hover)]:group-hover:opacity-100">
          <span className="block pt-3">{text}</span>
        </p>
      </div>
    </article>
  );
};
