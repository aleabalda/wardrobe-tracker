import { Link } from "react-router-dom";
import type { ClothingItem } from "../../../types/ClothingItems";
import type { Outfit } from "../../../types/Outfit";

// small card for the side panel: up to four images in a grid, name below
const Thumbnail = ({
  to,
  label,
  images,
}: {
  to: string;
  label: string;
  images: string[];
}) => (
  <Link to={to} className="group block">
    <div
      className={`grid aspect-11/15 gap-px overflow-hidden border border-transparent bg-gray-200 p-0.5 transition-colors group-hover:border-black ${
        images.length > 1 ? "grid-cols-2" : "grid-cols-1"
      } ${images.length > 2 ? "grid-rows-2" : "grid-rows-1"}`}
    >
      {images.map((src, index) => (
        <img
          key={`${src}-${index}`}
          src={src}
          alt=""
          className="h-full w-full object-cover"
        />
      ))}
    </div>
    <p className="mt-1 truncate text-xs group-hover:underline">{label}</p>
  </Link>
);

// a titled row of thumbnails, left out entirely when there's nothing in it
const ThumbnailSection = ({
  title,
  thumbnails,
}: {
  title: string;
  thumbnails: { key: number; to: string; label: string; images: string[] }[];
}) =>
  thumbnails.length > 0 && (
    <section className="mt-8">
      <h2 className="font-medium">{title}</h2>
      <ul className="mt-3 grid grid-cols-3 gap-2">
        {thumbnails.map(({ key, ...thumbnail }) => (
          <li key={key}>
            <Thumbnail {...thumbnail} />
          </li>
        ))}
      </ul>
    </section>
  );

export const RecentOutfitsSection = ({ outfits }: { outfits: Outfit[] }) => (
  <ThumbnailSection
    title="Recent outfits with this item"
    thumbnails={outfits.map((outfit) => ({
      key: outfit.id,
      to: `/outfits/${outfit.id}`,
      label: outfit.name ?? "Untitled outfit",
      images: outfit.items.slice(0, 4).map(({ image_url }) => image_url),
    }))}
  />
);

export const SimilarItemsSection = ({ items }: { items: ClothingItem[] }) => (
  <ThumbnailSection
    title="Similar in your wardrobe"
    thumbnails={items.map((item) => ({
      key: item.id,
      to: `/wardrobe/${item.id}`,
      label: item.name,
      images: [item.image_url],
    }))}
  />
);
